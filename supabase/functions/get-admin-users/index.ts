import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Safely decode a base64url string (JWT payload) */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // ----------------------------------------------------------------
    // 1) Extract + decode the JWT from the Authorization header
    //    The Supabase gateway already verified the JWT signature,
    //    so we just need to read the claims (sub = user ID).
    // ----------------------------------------------------------------
    const authHeader =
      req.headers.get("Authorization") ||
      req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[get-admin-users] Missing or malformed Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const payload = decodeJwtPayload(token);

    if (!payload || !payload.sub) {
      console.error("[get-admin-users] Could not decode JWT payload");
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return new Response(
        JSON.stringify({ error: "Token expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestingUserId: string = payload.sub;

    // ----------------------------------------------------------------
    // 2) Admin client — all privileged operations
    // ----------------------------------------------------------------
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the caller has the admin role
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("[get-admin-users] Access denied for user:", requestingUserId);
      return new Response(
        JSON.stringify({ error: "Access denied: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ----------------------------------------------------------------
    // 3) Fetch all data
    // ----------------------------------------------------------------

    // Get all profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("user_id, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw new Error("Profiles fetch failed: " + profilesError.message);

    // Get all user roles
    const { data: roles, error: rolesError } = await adminClient
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) throw new Error("Roles fetch failed: " + rolesError.message);

    // Fetch auth users via direct REST API (avoids JS SDK issues)
    const allAuthUsers: any[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const res = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Auth REST API error (${res.status}): ${errText}`);
      }

      const json = await res.json();
      const batch: any[] = Array.isArray(json) ? json : (json.users ?? []);
      if (batch.length === 0) break;
      allAuthUsers.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }

    // Build fast lookup map
    const authUserMap = new Map(allAuthUsers.map((u: any) => [u.id, u]));

    // If profiles table is empty, fall back to auth users
    const sourceList = (profiles && profiles.length > 0)
      ? profiles.map((p) => ({ user_id: p.user_id, created_at: p.created_at }))
      : allAuthUsers.map((u) => ({ user_id: u.id, created_at: u.created_at }));

    const usersWithRoles = sourceList.map((entry) => {
      const userRoles = (roles ?? [])
        .filter((r) => r.user_id === entry.user_id)
        .map((r) => r.role);
      const authUser = authUserMap.get(entry.user_id);

      return {
        id: entry.user_id,
        email: authUser?.email ?? "Unknown",
        created_at: entry.created_at ?? authUser?.created_at ?? "",
        roles: userRoles,
      };
    });

    return new Response(
      JSON.stringify({ users: usersWithRoles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[get-admin-users] Unhandled error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});