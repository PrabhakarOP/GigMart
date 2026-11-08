import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { gigApi, categoryApi, addressApi, toList } from '../../api/services';
import { toBackendDateTime } from '../../lib/format';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import { Plus, MapPin, Calendar, IndianRupee, Layers, FileText } from 'lucide-react';

export default function CreateGigPage() {
  const { user, profile, profileError, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Data State
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Quick-add address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressCity, setNewAddressCity] = useState('');
  const [newAddressPincode, setNewAddressPincode] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  // Load categories and provider's addresses
  useEffect(() => {
    let ignore = false;
    if (!user) return;

    setLoadingInitial(true);
    setInitialError(null);

    Promise.all([
      categoryApi.list(true),
      addressApi.getByUserId(user.id),
    ])
      .then(([catsRes, addrsRes]) => {
        if (!ignore) {
          const catList = toList(catsRes);
          const addrList = toList(addrsRes);
          setCategories(catList);
          setAddresses(addrList);
          if (catList.length > 0) setCategoryId(catList[0].id);
          if (addrList.length > 0) setAddressId(addrList[0].id);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setInitialError(err.message || 'Failed to initialize create gig form');
        }
      })
      .finally(() => {
        if (!ignore) setLoadingInitial(false);
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  // Handle Quick Add Address
  const handleQuickAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddressLine1.trim() || !newAddressCity.trim() || !newAddressPincode.trim()) {
      toastError('Please fill in line 1, city, and pincode');
      return;
    }

    setAddingAddress(true);
    try {
      const newAddr = await addressApi.create({
        userId: user.id,
        line1: newAddressLine1.trim(),
        city: newAddressCity.trim(),
        pincode: newAddressPincode.trim(),
      });
      success('Address added successfully');
      setAddresses((prev) => [...prev, newAddr]);
      setAddressId(newAddr.id);
      setAddressModalOpen(false);
      setNewAddressLine1('');
      setNewAddressCity('');
      setNewAddressPincode('');
    } catch (err) {
      toastError(err.message || 'Failed to save address');
    } finally {
      setAddingAddress(false);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!profile?.id) {
      toastError('Provider profile not found. Please refresh and try again.');
      return;
    }

    if (!addressId) {
      toastError('Please select or add a service address.');
      return;
    }

    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setFieldErrors((prev) => ({ ...prev, budget: 'Budget must be greater than 0' }));
      return;
    }

    // Schedule validation
    const schedDate = new Date(scheduledAt);
    if (!scheduledAt || isNaN(schedDate.getTime()) || schedDate <= new Date()) {
      setFieldErrors((prev) => ({ ...prev, scheduledAt: 'Schedule date & time must be in the future' }));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        providerProfileId: profile.id,
        categoryId,
        addressId,
        title: title.trim(),
        description: description.trim(),
        budget: numBudget,
        scheduledAt: toBackendDateTime(scheduledAt),
      };

      const createdGig = await gigApi.create(payload);
      success('Gig posted successfully!');
      navigate(`/gigs/${createdGig.id}`);
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      toastError(err.message || 'Failed to post gig');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" id="create-gig-initial-spinner" />
      </div>
    );
  }

  if (initialError || profileError) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-12">
        <ErrorState
          message={initialError || profileError}
          onRetry={() => {
            refreshProfile();
            window.location.reload();
          }}
          id="create-gig-init-error"
        />
      </div>
    );
  }

  // Min datetime attribute for datetime-local
  const nowIso = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <Link to="/dashboard/provider" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
          &larr; Back to Provider Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-neutral-950 font-heading mt-2">Post a New Gig</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Provide full details so verified workers can submit accurate bids
        </p>
      </div>

      <div className="card-static p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6" id="create-gig-form">
          {/* Category Select */}
          <div>
            <label className="label" htmlFor="create-gig-category">
              <Layers className="w-4 h-4 inline mr-1 text-neutral-400" />
              Service Category
            </label>
            <select
              id="create-gig-category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="select"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address Select / Quick Add */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0" htmlFor="create-gig-address">
                <MapPin className="w-4 h-4 inline mr-1 text-neutral-400" />
                Service Address
              </label>
              <button
                type="button"
                id="create-gig-quick-add-addr-btn"
                onClick={() => setAddressModalOpen(true)}
                className="text-xs font-semibold text-neutral-950 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs sm:text-sm">
                <p className="font-semibold mb-1">No addresses found on your account.</p>
                <p className="mb-3">You must add an address where the service is needed before posting.</p>
                <button
                  type="button"
                  id="create-gig-prompt-add-addr-btn"
                  onClick={() => setAddressModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address Now
                </button>
              </div>
            ) : (
              <select
                id="create-gig-address"
                required
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="select"
              >
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.line1}, {addr.city} ({addr.pincode})
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.addressId && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.addressId}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="label" htmlFor="create-gig-title">
              <FileText className="w-4 h-4 inline mr-1 text-neutral-400" />
              Gig Title
            </label>
            <input
              id="create-gig-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Bedroom Ceiling Fan Installation"
              className={`input ${fieldErrors.title ? 'border-rose-500' : ''}`}
            />
            {fieldErrors.title && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="create-gig-description">
              Detailed Description & Requirements
            </label>
            <textarea
              id="create-gig-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be fixed or installed, specific materials, ladder requirement, etc."
              className={`textarea ${fieldErrors.description ? 'border-rose-500' : ''}`}
            />
            {fieldErrors.description && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          {/* Budget & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="create-gig-budget">
                <IndianRupee className="w-4 h-4 inline mr-1 text-neutral-400" />
                Budget (INR)
              </label>
              <input
                id="create-gig-budget"
                type="number"
                min="1"
                step="1"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1500"
                className={`input ${fieldErrors.budget ? 'border-rose-500' : ''}`}
              />
              {fieldErrors.budget && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.budget}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="create-gig-scheduled-at">
                <Calendar className="w-4 h-4 inline mr-1 text-neutral-400" />
                Schedule Date & Time
              </label>
              <input
                id="create-gig-scheduled-at"
                type="datetime-local"
                min={nowIso}
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={`input ${fieldErrors.scheduledAt ? 'border-rose-500' : ''}`}
              />
              {fieldErrors.scheduledAt && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.scheduledAt}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Link to="/dashboard/provider" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              id="create-gig-submit-btn"
              disabled={submitting || addresses.length === 0}
              className="btn btn-primary"
            >
              {submitting ? <Spinner size="sm" id="create-gig-submit-spinner" /> : 'Publish Gig Listing'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Address"
        id="quick-add-address-modal"
      >
        <form onSubmit={handleQuickAddAddress} className="space-y-4" id="quick-add-address-form">
          <div>
            <label className="label" htmlFor="quick-addr-line1">
              Address Line 1
            </label>
            <input
              id="quick-addr-line1"
              type="text"
              required
              value={newAddressLine1}
              onChange={(e) => setNewAddressLine1(e.target.value)}
              placeholder="Apartment 4B, Green Acres, 14th Main"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="quick-addr-city">
                City
              </label>
              <input
                id="quick-addr-city"
                type="text"
                required
                value={newAddressCity}
                onChange={(e) => setNewAddressCity(e.target.value)}
                placeholder="Bengaluru"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="quick-addr-pincode">
                Pincode
              </label>
              <input
                id="quick-addr-pincode"
                type="text"
                required
                value={newAddressPincode}
                onChange={(e) => setNewAddressPincode(e.target.value)}
                placeholder="560001"
                className="input"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              id="quick-addr-cancel-btn"
              onClick={() => setAddressModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="quick-addr-submit-btn"
              disabled={addingAddress}
              className="btn btn-primary"
            >
              {addingAddress && <Spinner size="sm" id="quick-addr-spinner" />}
              Save & Use Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

