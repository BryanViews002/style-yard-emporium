import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Clock, CheckCircle } from 'lucide-react';

interface ShippingOption {
  shipping_method: string;
  shipping_cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_free: boolean;
}

interface ShippingCalculatorProps {
  countryCode: string;
  orderAmount: number;
  itemCount: number;
  onShippingSelected: (option: ShippingOption) => void;
  selectedShipping?: ShippingOption;
}

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  countryCode,
  orderAmount,
  itemCount,
  onShippingSelected,
  selectedShipping
}) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (countryCode && orderAmount > 0) {
      calculateShipping();
    }
  }, [countryCode, orderAmount, itemCount]);

  const calculateShipping = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('calculate_shipping_cost', {
        p_country_code: countryCode,
        p_order_amount: orderAmount,
        p_item_count: itemCount
      });

      if (error) throw error;

      setShippingOptions(data || []);
    } catch (error: any) {
      console.error('Error calculating shipping:', error);
      toast({
        title: "Error",
        description: "Failed to calculate shipping options.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDeliveryTime = (minDays: number, maxDays: number) => {
    if (minDays === maxDays) {
      return `${minDays} day${minDays !== 1 ? 's' : ''}`;
    }
    return `${minDays}-${maxDays} days`;
  };

  const getShippingIcon = (method: string) => {
    if (method.toLowerCase().includes('express')) {
      return <Truck className="h-4 w-4 text-blue-500" />;
    }
    return <Truck className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No shipping options available for this location.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedShipping?.shipping_method === option.shipping_method
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onShippingSelected(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getShippingIcon(option.shipping_method)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.shipping_method}</span>
                      {option.is_free && (
                        <Badge variant="secondary" className="text-xs">
                          FREE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDeliveryTime(option.estimated_days_min, option.estimated_days_max)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {option.is_free ? 'FREE' : `$${option.shipping_cost.toFixed(2)}`}
                  </div>
                </div>
              </div>
              
              {selectedShipping?.shipping_method === option.shipping_method && (
                <div className="flex items-center gap-1 text-primary text-sm mt-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {orderAmount >= 100 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                You qualify for free shipping on orders over $100!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingCalculator;
