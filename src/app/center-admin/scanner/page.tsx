'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  QrCode, Search, Package, User, MapPin, Clock, IndianRupee, 
  CheckCircle, AlertCircle, RefreshCw, History, Truck, 
  ArrowRight, Printer, Download
} from 'lucide-react';
import { barcodeAPI } from '@/lib/api';
import OrderQRCode from '@/components/OrderQRCode';
import toast from 'react-hot-toast';

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

const ORDER_STATUSES = [
  { value: 'placed', label: 'Placed', color: 'blue' },
  { value: 'assigned_to_branch', label: 'Assigned to Branch', color: 'purple' },
  { value: 'picked', label: 'Picked Up', color: 'yellow' },
  { value: 'in_process', label: 'Processing', color: 'orange' },
  { value: 'ready', label: 'Ready for Delivery', color: 'teal' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'cyan' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export default function BarcodeScannerPage() {
  const [manualCode, setManualCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OrderScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ barcode: string; orderNumber: string; time: Date }>>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load scan history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('centerAdminScanHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          time: new Date(item.time)
        }));
        setScanHistory(historyWithDates);
      } catch (err) {
        console.error('Failed to load scan history:', err);
      }
    }
  }, []);

  // Save scan history to localStorage whenever it changes
  useEffect(() => {
    if (scanHistory.length > 0) {
      localStorage.setItem('centerAdminScanHistory', JSON.stringify(scanHistory));
    }
  }, [scanHistory]);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await barcodeAPI.scanBarcode(code.trim());
      
      if (response.data.success) {
        const order = response.data.data.order;
        setScanResult(order);
        setSelectedStatus(order.status);
        
        // Add to history
        setScanHistory(prev => [
          { barcode: order.barcode, orderNumber: order.orderNumber, time: new Date() },
          ...prev.slice(0, 9) // Keep last 10
        ]);
        
        toast.success(`Order ${order.orderNumber} found!`);
      } else {
        setError(response.data.message || 'Order not found');
        setScanResult(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to scan barcode');
      setScanResult(null);
    } finally {
      setIsLoading(false);
      setManualCode('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan(manualCode);
    }
  };

  const handleStatusUpdate = async () => {
    if (!scanResult || !selectedStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      await barcodeAPI.updateStatusViaScan(scanResult.barcode, selectedStatus, statusNotes);
      
      // Update local state
      setScanResult(prev => prev ? { ...prev, status: selectedStatus } : null);
      setStatusNotes('');
      toast.success('Order status updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'placed': 'bg-blue-100 text-blue-800 border-blue-200',
      'assigned_to_branch': 'bg-purple-100 text-purple-800 border-purple-200',
      'assigned_to_logistics_pickup': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'picked': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in_process': 'bg-orange-100 text-orange-800 border-orange-200',
      'ready': 'bg-teal-100 text-teal-800 border-teal-200',
      'assigned_to_logistics_delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'out_for_delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      // Legacy status support
      'picked_up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-orange-100 text-orange-800 border-orange-200',
      'ready_for_delivery': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-teal-500" />
          Barcode Scanner
        </h1>
        <p className="text-gray-500 mt-1">Scan order barcodes to view details and update status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scan Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scan or Enter Barcode / Order Number
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="LP1234567890 or ORD..."
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xl font-mono transition-all"
                  autoFocus
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
              <button
                onClick={() => handleScan(manualCode)}
                disabled={isLoading || !manualCode.trim()}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
              >
                {isLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  'Scan'
                )}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              💡 Tip: Use a barcode scanner for faster input
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm">Order Number</p>
                    <p className="text-2xl font-bold">{scanResult.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <OrderQRCode 
                      orderNumber={scanResult.orderNumber}
                      orderId={scanResult.orderId}
                      barcode={scanResult.barcode}
                      size="small"
                      showDownload={true}
                      showPrint={true}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getStatusColor(scanResult.status)}`}>
                    {scanResult.status.replace(/_/g, ' ')}
                  </span>
                  {scanResult.isExpress && (
                    <span className="bg-orange-400 text-white px-3 py-1 rounded-full text-sm">⚡ Express</span>
                  )}
                  {scanResult.isVIPOrder && (
                    <span className="bg-purple-400 text-white px-3 py-1 rounded-full text-sm">👑 VIP</span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-teal-500" />
                    <h3 className="font-semibold text-gray-900">Customer Details</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-lg">{scanResult.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-lg">{scanResult.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{scanResult.customer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-teal-500" />
                    <h3 className="font-semibold text-gray-900">Order Items ({scanResult.items.length})</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Item</th>
                          <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Service</th>
                          <th className="text-center px-4 py-2 text-sm font-medium text-gray-600">Qty</th>
                          <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanResult.items.map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.itemType}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </td>
                            <td className="px-4 py-3 text-sm">{item.service}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">₹{item.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Schedule & Address */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <h3 className="font-semibold text-gray-900">Schedule</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pickup</span>
                        <span className="font-medium">{formatDate(scanResult.pickupDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time Slot</span>
                        <span className="font-medium">{scanResult.pickupTimeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Delivery</span>
                        <span className="font-medium">{formatDate(scanResult.estimatedDeliveryDate)}</span>
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
                      <p className="text-teal-600 mt-1">📞 {scanResult.pickupAddress.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Payment Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>₹{scanResult.pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery</span>
                      <span>₹{scanResult.pricing.deliveryCharge}</span>
                    </div>
                    {scanResult.pricing.expressCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Express</span>
                        <span>₹{scanResult.pricing.expressCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax</span>
                      <span>₹{scanResult.pricing.tax}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t border-green-200 font-bold text-xl">
                    <span>Total</span>
                    <span className="text-green-600">₹{scanResult.pricing.total}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="bg-white px-3 py-1 rounded-lg capitalize border">{scanResult.paymentMethod}</span>
                    <span className={`px-3 py-1 rounded-lg ${scanResult.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {scanResult.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Update Order Status</h3>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdatingStatus || selectedStatus === scanResult.status}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUpdatingStatus ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Update <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add notes (optional)"
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!scanResult && !error && !isLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <QrCode className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Scan</h3>
              <p className="text-gray-400">Enter a barcode or order number to view order details</p>
            </div>
          )}
        </div>

        {/* Sidebar - Scan History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Recent Scans</h3>
            </div>
            {scanHistory.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No scans yet</p>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((scan, index) => (
                  <button
                    key={index}
                    onClick={() => handleScan(scan.barcode)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <p className="font-mono text-sm text-teal-600">{scan.barcode}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{scan.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatTime(scan.time)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-4">Today's Scans</h3>
            <div className="text-4xl font-bold">{scanHistory.length}</div>
            <p className="text-teal-100 text-sm mt-1">orders scanned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
