'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Package, User, MapPin, Clock, IndianRupee, 
  CheckCircle, Loader2, AlertCircle, Phone,
  Truck, Home, Calendar, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  orderNumber: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    itemType: string;
    service: string;
    quantity: number;
    totalPrice: number;
  }>;
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    expressCharge: number;
    discount: number;
    total: number;
  };
  pickupDate: string;
  estimatedDeliveryDate: string;
  pickupAddress: {
    addressLine1: string;
    city: string;
    pincode: string;
  };
  isExpress: boolean;
  paymentStatus: string;
  branch?: {
    name: string;
  };
}

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Package },
  { key: 'picked', label: 'Picked Up', icon: Truck },
  { key: 'in_process', label: 'Processing', icon: Sparkles },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STATUS_ORDER = ['placed', 'assigned_to_branch', 'picked', 'in_process', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/orders/track/${orderNumber}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data.order);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = STATUS_ORDER.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'placed': 'bg-blue-500',
      'assigned_to_branch': 'bg-purple-500',
      'picked': 'bg-yellow-500',
      'in_process': 'bg-orange-500',
      'ready': 'bg-teal-500',
      'out_for_delivery': 'bg-cyan-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'We could not find this order. Please check the order number.'}</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-teal-100">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <p className={`text-xl font-bold capitalize ${order.status === 'delivered' ? 'text-green-600' : 'text-teal-600'}`}>
                {order.status.replace(/_/g, ' ')}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full ${getStatusColor(order.status)} flex items-center justify-center`}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded">
                <div 
                  className="h-full bg-teal-500 rounded transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between relative">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = currentStatusIndex >= STATUS_ORDER.indexOf(step.key);
                  const isCurrent = order.status === step.key || 
                    (step.key === 'picked' && order.status === 'assigned_to_branch');
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                        isCompleted ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-teal-200' : ''}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center max-w-[60px] ${isCompleted ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 font-medium">This order has been cancelled</p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-teal-500" />
            <h2 className="font-semibold text-gray-800">Order Items</h2>
            {order.isExpress && (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">⚡ Express</span>
            )}
          </div>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{item.itemType}</p>
                  <p className="text-sm text-gray-500">{item.service} × {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">₹{item.totalPrice}</p>
              </div>
            ))}
          </div>
          
          {/* Pricing Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{order.pricing.subtotal}</span>
            </div>
            {order.pricing.expressCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Express Charge</span>
                <span>₹{order.pricing.expressCharge}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span>₹{order.pricing.deliveryCharge}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{order.pricing.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-teal-600">₹{order.pricing.total}</span>
            </div>
            <div className="flex justify-center mt-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.paymentStatus === 'paid' ? '✓ Paid' : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-teal-500" />
              <h2 className="font-semibold text-gray-800">Schedule</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup Date</span>
                <span className="font-medium">{formatDate(order.pickupDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Delivery</span>
                <span className="font-medium">{formatDate(order.estimatedDeliveryDate)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-teal-500" />
              <h2 className="font-semibold text-gray-800">Address</h2>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">{order.pickupAddress.addressLine1}</p>
              <p className="text-gray-600">{order.pickupAddress.city} - {order.pickupAddress.pincode}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-teal-500" />
            <h2 className="font-semibold text-gray-800">Customer</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{order.customer.name}</p>
              <p className="text-sm text-gray-500">{order.customer.phone}</p>
            </div>
            <a 
              href={`tel:${order.customer.phone}`}
              className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Need help? Contact our support team</p>
          {order.branch && <p className="mt-1">Processed by: {order.branch.name}</p>}
        </div>
      </div>
    </div>
  );
}
