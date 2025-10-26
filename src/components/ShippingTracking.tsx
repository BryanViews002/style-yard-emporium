import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, MapPin, Clock, ExternalLink, RefreshCw } from 'lucide-react';

interface ShippingTrackingProps {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description?: string;
}

const ShippingTracking: React.FC<ShippingTrackingProps> = ({
  orderId,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery
}) => {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (trackingNumber) {
      loadTrackingInfo();
    }
  }, [trackingNumber]);

  const loadTrackingInfo = async () => {
    if (!trackingNumber) return;

    setLoading(true);
    try {
      // In a real implementation, you would integrate with shipping carriers' APIs
      // For now, we'll simulate tracking events based on order creation time
      const { data: orderData } = await supabase
        .from('orders')
        .select('created_at, status')
        .eq('id', orderId)
        .single();

      if (orderData) {
        const orderDate = new Date(orderData.created_at);
        const now = new Date();
        const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

        // Generate mock tracking events based on order age and status
        const mockEvents: TrackingEvent[] = [
          {
            status: 'Order Placed',
            location: 'Style Yard Emporium',
            timestamp: orderDate.toISOString(),
            description: 'Your order has been received and is being processed.'
          }
        ];

        if (orderData.status !== 'pending') {
          mockEvents.push({
            status: 'Processing',
            location: 'Style Yard Emporium',
            timestamp: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            description: 'Your order is being prepared for shipment.'
          });
        }

        if (orderData.status === 'shipped' || orderData.status === 'delivered') {
          mockEvents.push({
            status: 'Shipped',
            location: 'Style Yard Emporium',
            timestamp: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            description: `Package shipped via ${carrier || 'Standard Shipping'}. Tracking: ${trackingNumber}`
          });

          if (daysSinceOrder >= 2) {
            mockEvents.push({
              status: 'In Transit',
              location: 'Distribution Center',
              timestamp: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Package is in transit to your location.'
            });
          }

          if (daysSinceOrder >= 4) {
            mockEvents.push({
              status: 'Out for Delivery',
              location: 'Local Delivery Hub',
              timestamp: new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Package is out for delivery.'
            });
          }

          if (orderData.status === 'delivered') {
            mockEvents.push({
              status: 'Delivered',
              location: 'Your Address',
              timestamp: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Package has been delivered successfully.'
            });
          }
        }

        setTrackingEvents(mockEvents);
        setLastUpdated(new Date().toISOString());
      }
    } catch (error: any) {
      console.error('Error loading tracking info:', error);
      toast({
        title: "Error",
        description: "Failed to load tracking information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = () => {
    loadTrackingInfo();
    toast({
      title: "Tracking Updated",
      description: "Tracking information has been refreshed.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'out for delivery':
        return 'text-blue-600 bg-blue-100';
      case 'in transit':
        return 'text-yellow-600 bg-yellow-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'processing':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '✓';
      case 'out for delivery':
        return '🚚';
      case 'in transit':
        return '📦';
      case 'shipped':
        return '📤';
      case 'processing':
        return '⚙️';
      default:
        return '📋';
    }
  };

  if (!trackingNumber) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Tracking Not Available</h3>
          <p className="text-muted-foreground">
            Tracking information will be available once your order ships.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Package Tracking
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTracking}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tracking Number:</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">{trackingNumber}</code>
          </div>
          {carrier && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Carrier:</span>
              <Badge variant="outline">{carrier}</Badge>
            </div>
          )}
          {estimatedDelivery && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Estimated Delivery: {new Date(estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trackingEvents.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                  </div>
                  {index < trackingEvents.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-2" />
                  )}
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{event.status}</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString()} at{' '}
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {trackingUrl && (
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(trackingUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Track on Carrier Website
            </Button>
          </div>
        )}
        
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingTracking;
