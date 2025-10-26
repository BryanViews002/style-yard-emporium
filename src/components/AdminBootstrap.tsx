import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export const AdminBootstrap = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isSeedingProducts, setIsSeedingProducts] = useState(false);
  const [productsSeeded, setProductsSeeded] = useState(false);

  useEffect(() => {
    checkAdminExists();
    checkProductsExist();
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

  const checkProductsExist = async () => {
    try {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      setProductsSeeded(count > 0);
    } catch (error) {
      console.error("Error checking products:", error);
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

  const handleSeedProducts = async () => {
    setIsSeedingProducts(true);
    try {
      const response = await fetch(
        "https://ngniknstgjpwgnyewpll.supabase.co/functions/v1/seed-products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed products");
      }

      toast({
        title: "Success!",
        description: `Seeded ${data.productsCount} products and ${data.categoriesCount} categories.`,
      });

      setProductsSeeded(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSeedingProducts(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-md mx-auto mt-8 space-y-4">
      {/* Admin Bootstrap */}
      {showBootstrap && (
        <Card>
          <CardHeader>
            <CardTitle>Bootstrap Admin Access</CardTitle>
            <CardDescription>
              No admin users exist yet. Click below to make yourself the first
              admin.
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
      )}

      {/* Products Seeding */}
      {!productsSeeded && (
        <Card>
          <CardHeader>
            <CardTitle>Seed Sample Products</CardTitle>
            <CardDescription>
              No products exist in the database. Click below to add sample
              products for testing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeedProducts}
              disabled={isSeedingProducts}
              className="w-full"
              variant="outline"
            >
              {isSeedingProducts ? "Seeding..." : "Seed Sample Products"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
