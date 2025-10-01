import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const AdminBootstrap = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    checkAdminExists();
  }, [user]);

  const checkAdminExists = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      setShowBootstrap(count === 0);
    } catch (error) {
      console.error("Error checking admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapAdmin = async () => {
    if (!user) return;

    setIsBootstrapping(true);
    try {
      const { data, error } = await supabase.rpc("bootstrap_first_admin", {
        _user_id: user.id,
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Success!",
          description: "You are now an admin. Please refresh the page.",
        });
        setShowBootstrap(false);
      } else {
        toast({
          title: "Info",
          description: "An admin already exists.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (loading || !showBootstrap || !user) return null;

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Bootstrap Admin Access</CardTitle>
        <CardDescription>
          No admin users exist yet. Click below to make yourself the first admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleBootstrapAdmin}
          disabled={isBootstrapping}
          className="w-full"
        >
          {isBootstrapping ? "Setting up..." : "Become Admin"}
        </Button>
      </CardContent>
    </Card>
  );
};
