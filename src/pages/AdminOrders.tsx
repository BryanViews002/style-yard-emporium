import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  email: string;
  shipping_address: any;
  tracking_number?: string;
  tracking_url?: string;
}

const AdminOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({ tracking_number: "", tracking_url: "" });

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) throw error;

      if (data) {
        setIsAdmin(true);
        loadOrders();
      } else {
        navigate("/");
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      // Get current order to track status change
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      const oldStatus = currentOrder?.status || "unknown";

      // Update order status
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) throw error;

      // Create status history entry
      await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          old_status: oldStatus,
          new_status: newStatus,
          notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
          changed_by: user?.id
        });

      // Send status update notification if status is shipped or delivered
      if (newStatus === "shipped" || newStatus === "delivered") {
        await supabase.functions.invoke('send-order-status-update', {
          body: { 
            orderId,
            newStatus,
            trackingNumber: newStatus === "shipped" ? trackingForm.tracking_number : null
          }
        });
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}.`,
      });

      loadOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          tracking_number: trackingForm.tracking_number,
          tracking_url: trackingForm.tracking_url,
          status: "shipped",
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Update status to shipped with tracking info
      await updateOrderStatus(
        selectedOrder.id, 
        "shipped", 
        `Tracking added: ${trackingForm.tracking_number}`
      );

      toast({ title: "Tracking information added and order marked as shipped" });
      setTrackingDialogOpen(false);
      setTrackingForm({ tracking_number: "", tracking_url: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "default",
      shipped: "outline",
      delivered: "default",
      cancelled: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.tracking_number ? (
                        <span className="text-xs font-mono">{order.tracking_number}</span>
                      ) : (
                        <Dialog open={trackingDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                          setTrackingDialogOpen(open);
                          if (!open) setSelectedOrder(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setTrackingForm({
                                  tracking_number: order.tracking_number || "",
                                  tracking_url: order.tracking_url || "",
                                });
                              }}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Tracking Information</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={updateTracking} className="space-y-4">
                              <div>
                                <Label>Tracking Number</Label>
                                <Input
                                  required
                                  value={trackingForm.tracking_number}
                                  onChange={(e) =>
                                    setTrackingForm({ ...trackingForm, tracking_number: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Tracking URL</Label>
                                <Input
                                  type="url"
                                  value={trackingForm.tracking_url}
                                  onChange={(e) =>
                                    setTrackingForm({ ...trackingForm, tracking_url: e.target.value })
                                  }
                                />
                              </div>
                              <Button type="submit" className="w-full">
                                Save & Mark as Shipped
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
