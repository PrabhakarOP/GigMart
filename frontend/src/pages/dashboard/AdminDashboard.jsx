import React, { useState, useEffect, useCallback } from 'react';
import {
  userApi,
  workerApi,
  categoryApi,
  toList,
} from '../../api/services';
import { normalizeUser } from '../../api/normalizers';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import ErrorState from '../../components/ui/ErrorState';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  HardHat,
  Layers,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'workers' | 'categories'

  // Users tab state
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState(null);

  // Workers tab state
  const [workers, setWorkers] = useState([]);
  const [workerStatusFilter, setWorkerStatusFilter] = useState('');
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [updatingWorkerId, setUpdatingWorkerId] = useState(null);

  // Categories tab state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('wrench');
  const [categoryActive, setCategoryActive] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);

  // Load Users
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await userApi.list(userRoleFilter || undefined);
      setUsers(toList(res).map(normalizeUser));
    } catch (err) {
      toastError(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, toastError]);

  // Load Workers
  const loadWorkers = useCallback(async () => {
    setLoadingWorkers(true);
    try {
      const res = await workerApi.list(workerStatusFilter || undefined);
      setWorkers(toList(res));
    } catch (err) {
      toastError(err.message || 'Failed to load workers');
    } finally {
      setLoadingWorkers(false);
    }
  }, [workerStatusFilter, toastError]);

  // Load Categories (activeOnly = false)
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await categoryApi.list(false);
      setCategories(toList(res));
    } catch (err) {
      toastError(err.message || 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'workers') loadWorkers();
    else if (activeTab === 'categories') loadCategories();
  }, [activeTab, loadUsers, loadWorkers, loadCategories]);

  // Verify User Action
  const handleVerifyUser = async (userId) => {
    setVerifyingUserId(userId);
    try {
      await userApi.verify(userId);
      success('User marked as verified');
      loadUsers();
    } catch (err) {
      toastError(err.message || 'Failed to verify user');
    } finally {
      setVerifyingUserId(null);
    }
  };

  // Update Worker Verification Status
  const handleUpdateWorkerStatus = async (workerId, nextStatus) => {
    setUpdatingWorkerId(workerId);
    try {
      await workerApi.update(workerId, { verificationStatus: nextStatus });
      success(`Worker status updated to ${nextStatus}`);
      loadWorkers();
    } catch (err) {
      toastError(err.message || 'Failed to update worker status');
    } finally {
      setUpdatingWorkerId(null);
    }
  };

  // Category Create or Update
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryIcon(cat.icon || 'wrench');
      setCategoryActive(Boolean(cat.isActive));
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryIcon('wrench');
      setCategoryActive(true);
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSavingCategory(true);
    try {
      const payload = {
        name: categoryName.trim(),
        icon: categoryIcon.trim(),
        isActive: categoryActive,
      };

      if (editingCategory) {
        await categoryApi.update(editingCategory.id, payload);
        success('Category updated successfully');
      } else {
        await categoryApi.create(payload);
        success('Category created successfully');
      }
      setCategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      toastError(err.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      await categoryApi.update(cat.id, {
        name: cat.name,
        icon: cat.icon,
        isActive: !cat.isActive,
      });
      success(`Category ${!cat.isActive ? 'activated' : 'deactivated'}`);
      loadCategories();
    } catch (err) {
      toastError(err.message || 'Failed to update category state');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-950 font-heading">
              Platform Administration
            </h1>
            <p className="text-sm text-neutral-500">
              Manage accounts, verify worker credentials, and configure marketplace categories
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 flex gap-6">
        <button
          type="button"
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users
        </button>

        <button
          type="button"
          id="admin-tab-workers"
          onClick={() => setActiveTab('workers')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'workers'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <HardHat className="w-4 h-4" />
          Worker Verifications
        </button>

        <button
          type="button"
          id="admin-tab-categories"
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-neutral-950 text-neutral-950'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Service Categories
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="admin-user-role-filter" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Filter Role:
              </label>
              <select
                id="admin-user-role-filter"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="select w-44 py-1.5 text-xs"
              >
                <option value="">All Roles</option>
                <option value="WORKER">WORKER</option>
                <option value="PROVIDER">PROVIDER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <span className="text-xs text-neutral-500">{users.length} users registered</span>
          </div>

          {loadingUsers ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" id="admin-users-spinner" />
            </div>
          ) : (
            <div className="card-static overflow-x-auto shadow-sm">
              <table className="w-full text-left text-sm" id="admin-users-table">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">User</th>
                    <th className="px-6 py-3.5 font-semibold">Contact</th>
                    <th className="px-6 py-3.5 font-semibold">Role</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users.map((u) => (
                    <tr key={u.id} id={`user-row-${u.id}`} className="hover:bg-neutral-50/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-neutral-900 block">{u.fullName}</span>
                        <span className="text-xs text-neutral-400">ID: {u.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-neutral-700 block">{u.email}</span>
                        <span className="text-xs text-neutral-400">{u.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={u.isVerified ? 'VERIFIED' : 'PENDING'}
                          size="sm"
                          id={`user-verify-badge-${u.id}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!u.isVerified && (
                          <button
                            type="button"
                            id={`user-verify-btn-${u.id}`}
                            onClick={() => handleVerifyUser(u.id)}
                            disabled={verifyingUserId === u.id}
                            className="btn btn-primary btn-sm text-xs"
                          >
                            {verifyingUserId === u.id && <Spinner size="sm" />}
                            Verify User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKERS */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="admin-worker-status-filter" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Verification Status:
              </label>
              <select
                id="admin-worker-status-filter"
                value={workerStatusFilter}
                onChange={(e) => setWorkerStatusFilter(e.target.value)}
                className="select w-44 py-1.5 text-xs"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <span className="text-xs text-neutral-500">{workers.length} worker profiles</span>
          </div>

          {loadingWorkers ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" id="admin-workers-spinner" />
            </div>
          ) : (
            <div className="card-static overflow-x-auto shadow-sm">
              <table className="w-full text-left text-sm" id="admin-workers-table">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Worker</th>
                    <th className="px-6 py-3.5 font-semibold">Experience</th>
                    <th className="px-6 py-3.5 font-semibold">Verification</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {workers.map((w) => (
                    <tr key={w.id} id={`worker-row-${w.id}`} className="hover:bg-neutral-50/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-neutral-900 block">{w.userName}</span>
                        <span className="text-xs text-neutral-400">{w.userEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-600">
                        {w.experienceYears ? `${w.experienceYears} years` : 'Not specified'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={w.verificationStatus}
                          size="sm"
                          id={`worker-badge-${w.id}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {w.verificationStatus !== 'VERIFIED' && (
                            <button
                              type="button"
                              id={`worker-approve-btn-${w.id}`}
                              onClick={() => handleUpdateWorkerStatus(w.id, 'VERIFIED')}
                              disabled={updatingWorkerId === w.id}
                              className="btn btn-secondary btn-sm text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            >
                              Approve
                            </button>
                          )}
                          {w.verificationStatus !== 'REJECTED' && (
                            <button
                              type="button"
                              id={`worker-reject-btn-${w.id}`}
                              onClick={() => handleUpdateWorkerStatus(w.id, 'REJECTED')}
                              disabled={updatingWorkerId === w.id}
                              className="btn btn-secondary btn-sm text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {categories.length} categories configured
            </span>
            <button
              type="button"
              id="admin-create-category-btn"
              onClick={() => handleOpenCategoryModal()}
              className="btn btn-primary btn-sm gap-1"
            >
              <Plus className="w-4 h-4" />
              New Category
            </button>
          </div>

          {loadingCategories ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" id="admin-categories-spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  id={`category-card-${cat.id}`}
                  className="card-static p-5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-sm">{cat.name}</span>
                      <StatusBadge
                        status={cat.isActive ? 'OPEN' : 'CANCELLED'}
                        size="sm"
                        id={`cat-badge-${cat.id}`}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 block">Icon: {cat.icon || 'default'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id={`edit-cat-btn-${cat.id}`}
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      id={`toggle-cat-btn-${cat.id}`}
                      onClick={() => handleToggleCategoryActive(cat)}
                      className={`btn btn-sm text-[11px] px-2 py-1 ${
                        cat.isActive
                          ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {cat.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        id="category-form-modal"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4" id="category-edit-form">
          <div>
            <label className="label" htmlFor="cat-modal-name">
              Category Name
            </label>
            <input
              id="cat-modal-name"
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Appliance Repair"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="cat-modal-icon">
              Icon Key
            </label>
            <input
              id="cat-modal-icon"
              type="text"
              value={categoryIcon}
              onChange={(e) => setCategoryIcon(e.target.value)}
              placeholder="e.g. hammer, wrench, air-conditioner"
              className="input"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="cat-modal-active"
              type="checkbox"
              checked={categoryActive}
              onChange={(e) => setCategoryActive(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-900"
            />
            <label htmlFor="cat-modal-active" className="text-sm font-medium text-neutral-700">
              Active Category (visible in marketplace filters & post forms)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              id="cat-modal-cancel-btn"
              onClick={() => setCategoryModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="cat-modal-submit-btn"
              disabled={savingCategory}
              className="btn btn-primary"
            >
              {savingCategory && <Spinner size="sm" id="cat-save-spinner" />}
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
