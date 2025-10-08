import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

const AdminCoupons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: null as number | null,
    usage_limit: null as number | null,
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAdminAndLoadCoupons();
  }, [user]);

  const checkAdminAndLoadCoupons = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      toast({ title: "Access Denied", variant: "destructive" });
      navigate("/");
      return;
    }

    loadCoupons();
  };

  const loadCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCoupons(data as Coupon[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCoupon) {
        await supabase
          .from("coupons")
          .update(formData)
          .eq("id", editingCoupon.id);
        toast({ title: "Coupon updated" });
      } else {
        await supabase.from("coupons").insert(formData);
        toast({ title: "Coupon created" });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCoupons();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    await supabase.from("coupons").delete().eq("id", id);
    toast({ title: "Coupon deleted" });
    loadCoupons();
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      min_purchase_amount: 0,
      max_discount_amount: null,
      usage_limit: null,
      valid_until: "",
      is_active: true,
    });
    setEditingCoupon(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit" : "Create"} Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Coupon Code</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Minimum Purchase Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Usage Limit (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usage_limit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })
                  }
                />
              </div>
              <div>
                <Label>Valid Until (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell className="capitalize">{coupon.discount_type}</TableCell>
                  <TableCell>
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `$${coupon.discount_value}`}
                  </TableCell>
                  <TableCell>
                    {coupon.usage_count}/{coupon.usage_limit || "∞"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.is_active ? "default" : "secondary"}>
                      {coupon.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setFormData({
                            code: coupon.code,
                            discount_type: coupon.discount_type,
                            discount_value: coupon.discount_value,
                            min_purchase_amount: coupon.min_purchase_amount,
                            max_discount_amount: coupon.max_discount_amount,
                            usage_limit: coupon.usage_limit,
                            valid_until: coupon.valid_until || "",
                            is_active: coupon.is_active,
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoupons;