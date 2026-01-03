'use client';

import { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, X, Search, Package, User, MapPin, Clock, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';

interface OrderScanResult {
  orderId: string;
  orderNumber: string;
  barcode: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  branch: {
    name: string;
    code: string;
  } | null;
  items: Array<{
    itemType: string;
    service: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialInstructions?: string;
  }>;
  pricing: {
    subtotal: number;
    expressCharge: number;
    deliveryCharge: number;
    discount: number;
    tax: number;
    total: number;
  };
  pickupDate: string;
  pickupTimeSlot: string;
  estimatedDeliveryDate: string;
  pickupAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    pincode: string;
  };
  isExpress: boolean;
  isVIPOrder: boolean;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions?: string;
}

interface BarcodeScannerProps {
  onScanResult?: (result: OrderScanResult) => void;
  apiBaseUrl?: string;
}

export default function BarcodeScanner({ onScanResult, apiBaseUrl = '' }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OrderScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/barcode/scan/${code.trim()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScanResult(data.data.order);
        if (onScanResult) {
          onScanResult(data.data.order);
        }
      } else {
        setError(data.message || 'Order not found');
        setScanResult(null);
      }
    } catch (err) {
      setError('Failed to scan barcode. Please try again.');
      setScanResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan(manualCode);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'placed': 'bg-blue-100 text-blue-800',
      'assigned_to_branch': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-orange-100 text-orange-800',
      'ready_for_delivery': 'bg-teal-100 text-teal-800',
      'out_for_delivery': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
      >
        <QrCode className="w-5 h-5" />
        <span>Scan Barcode</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Barcode Scanner</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setScanResult(null);
                  setError(null);
                  setManualCode('');
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Manual Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Barcode or Order Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      placeholder="LP1234567890 or ORD..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg font-mono"
                      autoFocus
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => handleScan(manualCode)}
                    disabled={isLoading || !manualCode.trim()}
                    className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Scanning...' : 'Scan'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Scan Result */}
              {scanResult && (
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="text-xl font-bold text-gray-900">{scanResult.orderNumber}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(scanResult.status)}`}>
                        {scanResult.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-mono bg-white px-2 py-1 rounded border">
                        {scanResult.barcode}
                      </span>
                      {scanResult.isExpress && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">⚡ Express</span>
                      )}
                      {scanResult.isVIPOrder && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">👑 VIP</span>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-teal-500" />
                      <h3 className="font-semibold text-gray-900">Customer Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{scanResult.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{scanResult.customer.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">{scanResult.customer.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-teal-500" />
                      <h3 className="font-semibold text-gray-900">Order Items ({scanResult.items.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {scanResult.items.map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.itemType}</p>
                            <p className="text-sm text-gray-500">{item.service} • {item.category}</p>
                            {item.specialInstructions && (
                              <p className="text-xs text-orange-600 mt-1">📝 {item.specialInstructions}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.totalPrice}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-teal-500" />
                        <h3 className="font-semibold text-gray-900">Schedule</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-500">Pickup</p>
                          <p className="font-medium">{formatDate(scanResult.pickupDate)}</p>
                          <p className="text-gray-600">{scanResult.pickupTimeSlot}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Est. Delivery</p>
                          <p className="font-medium">{formatDate(scanResult.estimatedDeliveryDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-teal-500" />
                        <h3 className="font-semibold text-gray-900">Pickup Address</h3>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{scanResult.pickupAddress.name}</p>
                        <p className="text-gray-600">{scanResult.pickupAddress.addressLine1}</p>
                        <p className="text-gray-600">{scanResult.pickupAddress.city} - {scanResult.pickupAddress.pincode}</p>
                        <p className="text-gray-500">📞 {scanResult.pickupAddress.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Payment Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{scanResult.pricing.subtotal}</span>
                      </div>
                      {scanResult.pricing.expressCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Express</span>
                          <span>₹{scanResult.pricing.expressCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery</span>
                        <span>₹{scanResult.pricing.deliveryCharge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span>₹{scanResult.pricing.tax}</span>
                      </div>
                      <div className="col-span-2 flex justify-between pt-2 border-t border-green-200 font-bold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">₹{scanResult.pricing.total}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="bg-white px-2 py-1 rounded capitalize">{scanResult.paymentMethod}</span>
                      <span className={`px-2 py-1 rounded ${scanResult.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {scanResult.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {scanResult.specialInstructions && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">📝 Special Instructions</p>
                      <p className="text-yellow-700 mt-1">{scanResult.specialInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!scanResult && !error && !isLoading && (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter a barcode or order number to view order details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
