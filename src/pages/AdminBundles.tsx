import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Trash2, Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const AdminBundles = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_percentage: "10",
    selectedProducts: [] as string[],
  });

  useEffect(() => {
    loadBundles();
    loadProducts();
  }, []);

  const loadBundles = async () => {
    try {
      const { data, error } = await supabase
        .from("product_bundles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBundles(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading bundles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image")
      .eq("is_active", true);
    setProducts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.selectedProducts.length < 2) {
        toast({
          title: "Invalid bundle",
          description: "Please select at least 2 products",
          variant: "destructive",
        });
        return;
      }

      const bundleData = {
        name: formData.name,
        description: formData.description,
        discount_percentage: parseFloat(formData.discount_percentage),
        is_active: true,
      };

      if (editingBundle) {
        const { error } = await supabase
          .from("product_bundles")
          .update(bundleData)
          .eq("id", editingBundle.id);

        if (error) throw error;

        await supabase
          .from("bundle_products")
          .delete()
          .eq("bundle_id", editingBundle.id);
      } else {
        const { data: bundle, error } = await supabase
          .from("product_bundles")
          .insert(bundleData)
          .select()
          .single();

        if (error) throw error;

        const bundleProducts = formData.selectedProducts.map((productId) => ({
          bundle_id: bundle.id,
          product_id: productId,
        }));

        await supabase.from("bundle_products").insert(bundleProducts);
      }

      toast({
        title: editingBundle ? "Bundle updated" : "Bundle created",
      });

      setOpen(false);
      resetForm();
      loadBundles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("bundle_products").delete().eq("bundle_id", id);
      const { error } = await supabase.from("product_bundles").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Bundle deleted" });
      loadBundles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discount_percentage: "10",
      selectedProducts: [],
    });
    setEditingBundle(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Bundles</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBundle ? "Edit" : "Create"} Bundle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Bundle Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Select Products (minimum 2)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2 max-h-60 overflow-y-auto border rounded p-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={product.id}
                        checked={formData.selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedProducts: [...formData.selectedProducts, product.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedProducts: formData.selectedProducts.filter((id) => id !== product.id),
                            });
                          }
                        }}
                      />
                      <label htmlFor={product.id} className="text-sm cursor-pointer">
                        {product.name} - ${product.price}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingBundle ? "Update" : "Create"} Bundle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : bundles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No bundles created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <Card key={bundle.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{bundle.name}</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(bundle.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>
                <p className="text-lg font-bold text-accent">{bundle.discount_percentage}% OFF</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Status: {bundle.is_active ? "Active" : "Inactive"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBundles;
