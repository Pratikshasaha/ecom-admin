'use client';

interface Product {
  id: string | number;
  name: string;
  details?: string;
  price: number;
  category?: string;
  quantity?: number;
  status?: string;
  imagePath?: string;
  vendorId?: string | number;
}

interface EditProductModalProps {
  editingProduct: Product | null;
  editProductForm: {
    name: string;
    details: string;
    price: string;
    category: string;
    quantity: string;
    imagePath: string;
    status: string;
    vendorId: string;
  };
  vendors: any[];
  setEditProductForm: (form: any) => void;
  handleUpdateProduct: (e: React.FormEvent) => void;
  setShowEditModal: (show: boolean) => void;
  productError: string;
}

export default function EditProductModal({ editingProduct, editProductForm, vendors, setEditProductForm, handleUpdateProduct, setShowEditModal, productError }: EditProductModalProps) {
  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Edit Product</h3>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {productError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm">{productError}</p>
          </div>
        )}

<form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Name</label>
            <input
              type="text"
              value={editProductForm.name}
              onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={editProductForm.price}
              onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Category</label>
            <input
              type="text"
              value={editProductForm.category}
              onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Quantity</label>
            <input
              type="number"
              value={editProductForm.quantity}
              onChange={(e) => setEditProductForm({ ...editProductForm, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black mb-1">Details</label>
            <textarea
              value={editProductForm.details}
              onChange={(e) => setEditProductForm({ ...editProductForm, details: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm resize-vertical"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Image URL</label>
            <input
              type="url"
              value={editProductForm.imagePath}
              onChange={(e) => setEditProductForm({ ...editProductForm, imagePath: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Vendor</label>
            <select
              value={editProductForm.vendorId}
              onChange={(e) => setEditProductForm({ ...editProductForm, vendorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor: any) => (
                <option key={vendor.id} value={String(vendor.id)}>
                  {vendor.vendorName || vendor.name} ({vendor.vendorLocation})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              value={editProductForm.status}
              onChange={(e) => setEditProductForm({ ...editProductForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

