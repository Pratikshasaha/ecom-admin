'use client';

interface Order {
  id: string | number;
  productId: string | number;
  quantity: number;
  price: number;
  userName: string;
  mobile: string;
  address: string;
  email: string;
  date: string;
  vendorName: string;
  paymentType: string;
  status: string;
  productName?: string;
  notes?: string;
}

interface EditOrderModalProps {
  editingOrder: Order | null;
  editForm: {
    status: string;
    paymentType: string;
    notes?: string;
  };
  setEditForm: (form: any) => void;
  handleUpdateOrder: (e: React.FormEvent) => Promise<void>;
  setShowEditModal: (show: boolean) => void;
  error: string;
}

export default function EditOrderModal({
  editingOrder,
  editForm,
  setEditForm,
  handleUpdateOrder,
  setShowEditModal,
  error,
}: EditOrderModalProps) {
  const statusOptions = [
    'pending',
    'order approved',
    'order packaging in process',
    'out of delivery',
    'delivered',
    'confirmed',
    'processing',
    'shipped'
  ];

  if (!editingOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black">Edit Order #{editingOrder.id}</h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Customer: {editingOrder.userName} ({editingOrder.email || 'N/A'})</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdateOrder} className="p-6 space-y-4">
          {/* Product Details (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Details</label>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Product:</span> #{editingOrder.productId} - {editingOrder.productName || 'N/A'} (x{editingOrder.quantity})
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Vendor:</span> {editingOrder.vendorName}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {editingOrder.address}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Mobile:</span> {editingOrder.mobile}
              </div>
            </div>
            <p className="text-sm font-bold mt-1 text-right">Total: ₹{Number(editingOrder.quantity * editingOrder.price).toLocaleString('en-IN')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
              <select
                value={editForm.paymentType || editingOrder?.paymentType || ''}
                onChange={(e) => setEditForm({ ...editForm, paymentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Cash on delivery">Cash on delivery</option>
                <option value="paid">Paid (Online)</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={editForm.notes || ''}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors"
            >
              Update Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

