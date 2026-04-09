"use client";

import { useState, useEffect } from "react";

import Header from "../../components/Header";
import EditProductModal from "./EditProductModal";

interface User {
  id: string | number;
  name: string;
  vendorName?: string;
  location?: string;
  role: string;
  vendorLocation?: string;
}

interface Product {
  id: string | number;
  name: string;
  details?: string;
  price: number;
  category?: string;
  quantity?: number;
  stock?: number;
  status?: string;
  imagePath?: string;
  image?: string;
  vendorId?: string | number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    details: "",
    price: "",
    category: "",
    quantity: "",
    imagePath: "",
    status: "active",
    vendorId: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [productError, setProductError] = useState("");
  const [vendors, setVendors] = useState<User[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    details: "",
    price: "",
    category: "",
    quantity: "",
    imagePath: "",
    status: "active",
    vendorId: "",
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductForm({
      name: product.name,
      details: product.details || "",
      price: product.price.toString(),
      category: product.category || "",
      quantity: (product.quantity || product.stock || 0).toString(),
      imagePath: product.imagePath || product.image || "",
      status: product.status || "active",
      vendorId: String(product.vendorId || ""),
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const productId = editingProduct.id;
    const selectedVendor = vendors.find(
      (v) => String(v.id) === editProductForm.vendorId,
    );
    const formData = {
      name: editProductForm.name,
      details: editProductForm.details,
      price: parseFloat(editProductForm.price),
      category: editProductForm.category,
      quantity: parseInt(editProductForm.quantity),
      imagePath: editProductForm.imagePath,
      status: editProductForm.status,
      vendorLocation: selectedVendor?.location || "",
    };
    const response = await fetch(
      `https://ecom-rest-topaz.vercel.app/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );
    if (response.ok) {
      await fetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } else {
      const data = await response.json();
      setProductError(data.message || "Update failed");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    const response = await fetch(
      `https://ecom-rest-topaz.vercel.app/products/${productId}`,
      {
        method: "DELETE",
      },
    );
    if (response.ok) {
      await fetchProducts();
    } else {
      const data = await response.json();
      setProductError(data.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const response = await fetch("https://ecom-rest-topaz.vercel.app/users");
      const data = await response.json();
      const vendorsList = data
        .filter((user: User) => user.role && user.role !== "superadmin")
        .map((user: User) => ({
          ...user,
          vendorLocation: user.location || "N/A",
        }));
      setVendors(vendorsList);
    } catch (err) {
      console.error("Failed to fetch vendors");
    } finally {
      setVendorsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://ecom-rest-topaz.vercel.app/products",
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      const productsList = Array.isArray(data)
        ? data
        : data.products || data.data || [];
      setProducts(productsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProduct(true);
    setProductError("");

    try {
      const selectedVendor = vendors.find(
        (v) => String(v.id) === newProductForm.vendorId,
      );

      const formData = {
        name: newProductForm.name,
        details: newProductForm.details || "",
        price: parseFloat(newProductForm.price),
        category: newProductForm.category || "",
        quantity: parseInt(newProductForm.quantity),
        imagePath: newProductForm.imagePath || "",
createdAt: new Date().toISOString(),
        // status auto-set by backend
        vendorLocation: selectedVendor?.location || "",
      };


      const response = await fetch(
        "https://ecom-rest-topaz.vercel.app/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      await fetchProducts();
      setNewProductForm({
        name: "",
        details: "",
        price: "",
        category: "",
        quantity: "",
        imagePath: "",
        status: "active",
        vendorId: "",
      });
      setShowAddProductModal(false);
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : "Failed to add product",
      );
    } finally {
      setAddingProduct(false);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-2"></div>
          <p className="text-slate-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">

      <Header currentPage="Products" />


      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black mb-1">
            Products Management
          </h2>
          <p className="text-slate-500 text-sm">
            View all products in the catalog
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </p>
            <button
              onClick={fetchProducts}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              Retry
            </button>
          </div>
        )}

        {products.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-slate-500 text-lg mb-2">No products found</p>
            <p className="text-slate-400 text-sm">
              Add your first product to get started.
            </p>
          </div>
        )}

        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-lg mr-3">🛍️</span>
              <h3 className="text-lg font-semibold text-black">
                All Products ({products.length})
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1.5 rounded text-sm font-medium transition"
              >
                + Add Product
              </button>
              <button
                onClick={fetchProducts}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-1.5 rounded text-sm font-medium transition flex items-center"
                disabled={loading}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                      ID
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700 font-mono sticky left-0 bg-white z-10 border-r border-gray-200">
                        {String(product.id)}
                      </td>
                      <td className="px-4 py-3">
                        {product.image || product.imagePath ? (
                          <img
                            src={product.image || product.imagePath}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">📦</span>
                          </div>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate"
                        title={product.name}
                      >
                        {product.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg">
                          ₹{Number(product.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {product.category || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            (product.quantity || product.stock || 0) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.quantity || product.stock || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : product.status === "inactive"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.status?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex space-x-1 justify-end">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 text-xs p-1 hover:bg-blue-50 rounded transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(String(product.id))
                            }
                            className="text-red-600 hover:text-red-800 text-xs p-1 hover:bg-red-50 rounded transition"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showEditModal && (
          <EditProductModal
            editingProduct={editingProduct}
            editProductForm={editProductForm}
            vendors={vendors}
            setEditProductForm={setEditProductForm}
            handleUpdateProduct={handleUpdateProduct}
            setShowEditModal={setShowEditModal}
            productError={productError}
          />
        )}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between bg-slate-800 text-white rounded-t-lg">
                <h3 className="text-xl font-semibold">Add New Product</h3>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {productError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-red-700 text-sm">{productError}</p>
                </div>
              )}

              <form
                onSubmit={handleAddProduct}
                className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div>
                  <label
                    htmlFor="product-name"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Name *
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={newProductForm.name}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        name: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="product-details"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Details
                  </label>
                  <textarea
                    id="product-details"
                    value={newProductForm.details}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        details: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm resize-vertical"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-price"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Price (₹) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={newProductForm.price}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        price: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Category
                  </label>
                  <input
                    id="product-category"
                    type="text"
                    value={newProductForm.category}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-quantity"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Quantity *
                  </label>
                  <input
                    id="product-quantity"
                    type="number"
                    value={newProductForm.quantity}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        quantity: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-image"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Image URL
                  </label>
                  <input
                    id="product-image"
                    type="url"
                    value={newProductForm.imagePath}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        imagePath: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-vendor"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Vendor *
                  </label>
                  <select
                    id="product-vendor"
                    value={newProductForm.vendorId}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        vendorId: e.target.value,
                      })
                    }
                    required={!vendorsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                    disabled={vendorsLoading}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={String(vendor.id)}>
                        {vendor.vendorName || vendor.name} (
                        {vendor.vendorLocation})
                      </option>
                    ))}
                  </select>
                  {vendorsLoading && (
                    <p className="text-xs text-slate-500 mt-1">
                      Loading vendors...
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-status"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Status *
                  </label>
                  <select
                    id="product-status"
                    value={newProductForm.status}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        status: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-600 focus:border-slate-600 outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-full flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductModal(false);
                      setProductError("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-medium text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingProduct || vendorsLoading}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded font-medium text-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {addingProduct ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
