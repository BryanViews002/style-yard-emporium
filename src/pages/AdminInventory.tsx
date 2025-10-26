import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";

interface LowStockProduct {
  product_id: string;
  product_name: string;
  current_stock: number;
  sku: string;
  category_name: string;
}

interface InventoryMovement {
  id: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  reason: string;
  created_at: string;
  created_by_name: string;
}

const AdminInventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryMovement[]>([]);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: "",
    reason: "",
    movement_type: "adjustment"
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    loadInventoryData();
  };

  const loadInventoryData = async () => {
    try {
      // Load low stock products
      const { data: lowStockData, error: lowStockError } = await supabase
        .rpc("get_low_stock_products", { p_threshold: 10 });

      if (lowStockError) throw lowStockError;
      setLowStockProducts(lowStockData || []);

      // Load recent inventory movements
      const { data: historyData, error: historyError } = await supabase
        .rpc("get_inventory_history", { p_limit: 20 });

      if (historyError) throw historyError;
      setInventoryHistory(historyData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !adjustmentForm.quantity || !adjustmentForm.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc("update_inventory", {
        p_product_id: selectedProduct.id,
        p_quantity: parseInt(adjustmentForm.quantity),
        p_movement_type: adjustmentForm.movement_type,
        p_reason: adjustmentForm.reason,
        p_reference_id: null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock adjustment completed successfully.",
      });

      setIsAdjustmentDialogOpen(false);
      setAdjustmentForm({ quantity: "", reason: "", movement_type: "adjustment" });
      setSelectedProduct(null);
      loadInventoryData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case 'in':
        return 'default';
      case 'out':
        return 'destructive';
      case 'adjustment':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wider text-primary">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">Monitor stock levels and track inventory movements</p>
        </div>

        <div className="grid gap-6">
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription className="text-orange-700">
                  {lowStockProducts.length} products are running low on stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.product_id} className="flex justify-between items-center p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium">{product.product_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({product.sku})</span>
                      </div>
                      <Badge variant="destructive">{product.current_stock} left</Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <p className="text-sm text-orange-600">
                      And {lowStockProducts.length - 5} more products...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Inventory Movements</CardTitle>
              <CardDescription>
                Track all stock adjustments, sales, and restocking activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryHistory.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.product_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.movement_type)}
                          <Badge variant={getMovementBadgeVariant(movement.movement_type)}>
                            {movement.movement_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className={movement.movement_type === 'out' ? 'text-red-600' : 'text-green-600'}>
                        {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity}
                      </TableCell>
                      <TableCell>{movement.reason || 'N/A'}</TableCell>
                      <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{movement.created_by_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stock Adjustment Dialog */}
          <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Adjust Stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>
                  Adjust stock levels for products. This will be recorded in the inventory history.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleStockAdjustment} className="space-y-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select onValueChange={(value) => {
                    const product = lowStockProducts.find(p => p.product_id === value);
                    setSelectedProduct(product);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {lowStockProducts.map((product) => (
                        <SelectItem key={product.product_id} value={product.product_id}>
                          {product.product_name} (Current: {product.current_stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="movement_type">Adjustment Type</Label>
                  <Select 
                    value={adjustmentForm.movement_type} 
                    onValueChange={(value) => setAdjustmentForm({...adjustmentForm, movement_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adjustment">Direct Adjustment</SelectItem>
                      <SelectItem value="in">Stock In</SelectItem>
                      <SelectItem value="out">Stock Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                    placeholder="Enter reason for adjustment"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Apply Adjustment</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
