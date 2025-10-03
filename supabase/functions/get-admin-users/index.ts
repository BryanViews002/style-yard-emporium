import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("user_id, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Get all user roles
    const { data: roles, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) throw rolesError;

    // Get user emails from auth.users using service role
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();

    if (authError) throw authError;

    // Combine the data
    const usersWithRoles = profiles.map((profile) => {
      const userRoles = roles.filter((r) => r.user_id === profile.user_id).map((r) => r.role);
      const authUser = authUsers.users.find((u) => u.id === profile.user_id);
      
      return {
        id: profile.user_id,
        email: authUser?.email || "Unknown",
        created_at: profile.created_at,
        roles: userRoles,
      };
    });

    return new Response(
      JSON.stringify({ users: usersWithRoles }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});