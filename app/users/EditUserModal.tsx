'use client';

interface User {
  id: string | number;
  name: string;
  email: string;
  vendorName?: string;
  location?: string;
  mobile?: string;
  role: string;
}

interface EditUserModalProps {
  editingUser: User | null;
  editUserForm: {
    name: string;
    email: string;
    vendorName: string;
    location: string;
    mobile: string;
    role: string;
  };
  setEditUserForm: (form: any) => void;
  handleUpdateUser: (e: React.FormEvent) => void;
  setShowEditModal: (show: boolean) => void;
}

export default function EditUserModal({ editingUser, editUserForm, setEditUserForm, handleUpdateUser, setShowEditModal }: EditUserModalProps) {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editUserForm.name}
              onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={editUserForm.email}
              onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor Name</label>
            <input
              type="text"
              value={editUserForm.vendorName}
              onChange={(e) => setEditUserForm({ ...editUserForm, vendorName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={editUserForm.location}
              onChange={(e) => setEditUserForm({ ...editUserForm, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile</label>
            <input
              type="tel"
              value={editUserForm.mobile}
              onChange={(e) => setEditUserForm({ ...editUserForm, mobile: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={editUserForm.role}
              onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

