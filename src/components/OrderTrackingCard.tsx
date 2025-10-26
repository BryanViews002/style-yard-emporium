import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import ShippingTracking from './ShippingTracking';



interface OrderTrackingCardProps {
  order: {
    id: string;
    order_number: string;
    status: string;
    created_at: string;
    total_amount: number;
    tracking_number?: string;
    tracking_url?: string;
    order_items: Array<{
      product_snapshot: {
        name: string;
        image: string;
        selectedSize?: string;
        selectedColor?: string;
      };
      quantity: number;
      total_price: number;
    }>;
  };
}

const OrderTrackingCard: React.FC<OrderTrackingCardProps> = ({ order }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is being reviewed and will be processed soon.';
      case 'processing':
        return 'Your order is being prepared for shipment.';
      case 'shipped':
        return 'Your order has been shipped and is on its way!';
      case 'delivered':
        return 'Your order has been successfully delivered.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      default:
        return 'Order status update available.';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">{getStatusMessage(order.status)}</p>
        </div>

        {/* Tracking Information */}
        {order.tracking_number && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tracking Information</h4>
            <p className="text-sm text-blue-800 mb-2">
              <strong>Tracking Number:</strong> {order.tracking_number}
            </p>
            {order.tracking_url && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(order.tracking_url, '_blank')}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Track Package
              </Button>
            )}
          </div>
        )}

        {/* Order Items */}
        <div>
          <h4 className="font-medium mb-3">Order Items</h4>
          <div className="space-y-3">
            {order.order_items.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 border rounded-lg">
                <img
                  src={item.product_snapshot.image}
                  alt={item.product_snapshot.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-medium">{item.product_snapshot.name}</h5>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Quantity: {item.quantity}</p>
                    {item.product_snapshot.selectedSize && (
                      <p>Size: {item.product_snapshot.selectedSize}</p>
                    )}
                    {item.product_snapshot.selectedColor && (
                      <p>Color: {item.product_snapshot.selectedColor}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.total_price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total</span>
            <span className="text-lg font-bold">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Tracking */}
        {(order.tracking_number || order.status === 'shipped' || order.status === 'delivered') && (
          <div className="mt-6">
            <ShippingTracking
              orderId={order.id}
              trackingNumber={order.tracking_number}
              trackingUrl={order.tracking_url}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTrackingCard;