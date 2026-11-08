import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  workerApi,
  providerApi,
  addressApi,
  reviewApi,
  categoryApi,
  toList,
} from '../../api/services';
import { normalizeReview } from '../../api/normalizers';
import { formatMoney, formatDate } from '../../lib/format';
import StatusBadge from '../../components/ui/StatusBadge';
import StarRating from '../../components/ui/StarRating';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  MapPin,
  Plus,
  Trash2,
  FileText,
  Clock,
  Briefcase,
  Layers,
  Calendar,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  // Sub-resource lists
  const [addresses, setAddresses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workerServices, setWorkerServices] = useState([]);
  const [workerSlots, setWorkerSlots] = useState([]);
  const [workerDocs, setWorkerDocs] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(true);

  // Worker edit form state
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('');
  const [savingWorkerProfile, setSavingWorkerProfile] = useState(false);

  // Provider edit form state
  const [providerType, setProviderType] = useState('INDIVIDUAL');
  const [businessName, setBusinessName] = useState('');
  const [savingProviderProfile, setSavingProviderProfile] = useState(false);

  // Address add / delete modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  // Worker Service add modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceCategoryId, setServiceCategoryId] = useState('');
  const [serviceBaseRate, setServiceBaseRate] = useState('');
  const [serviceRateType, setServiceRateType] = useState('HOURLY');
  const [savingService, setSavingService] = useState(false);

  // Worker Slot add modal state
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotDay, setSlotDay] = useState(1);
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('17:00');
  const [savingSlot, setSavingSlot] = useState(false);

  // Worker Document add modal state
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('ID');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [savingDoc, setSavingDoc] = useState(false);

  // Load addresses, reviews, and worker sub-resources
  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoadingInitial(true);

    try {
      const [addrsRes, reviewsRes, catsRes] = await Promise.all([
        addressApi.getByUserId(user.id).catch(() => []),
        reviewApi.getByUser(user.id).catch(() => []),
        categoryApi.list(true).catch(() => []),
      ]);

      setAddresses(toList(addrsRes));
      setReviews(toList(reviewsRes).map(normalizeReview));
      const catList = toList(catsRes);
      setCategories(catList);
      if (catList.length > 0) setServiceCategoryId(catList[0].id);

      // Load worker specific sub-resources
      if (user.role === 'WORKER' && profile?.id) {
        const [servicesRes, slotsRes, docsRes] = await Promise.all([
          workerApi.getServices(profile.id).catch(() => []),
          workerApi.getSlots(profile.id).catch(() => []),
          workerApi.getDocuments(profile.id).catch(() => []),
        ]);
        setWorkerServices(toList(servicesRes));
        setWorkerSlots(toList(slotsRes));
        setWorkerDocs(toList(docsRes));

        setBio(profile.bio || '');
        setExperienceYears(String(profile.experienceYears || ''));
        setServiceRadiusKm(String(profile.serviceRadiusKm || ''));
      }

      // Load provider specific fields
      if (user.role === 'PROVIDER' && profile) {
        setProviderType(profile.providerType || 'INDIVIDUAL');
        setBusinessName(profile.businessName || '');
      }
    } catch {
      // ignore
    } finally {
      setLoadingInitial(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Handle Worker Profile Save
  const handleSaveWorkerProfile = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSavingWorkerProfile(true);

    try {
      await workerApi.update(profile.id, {
        bio: bio.trim(),
        experienceYears: experienceYears ? Number(experienceYears) : 0,
        serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : 10,
      });
      success('Worker profile updated successfully');
      await refreshProfile();
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSavingWorkerProfile(false);
    }
  };

  // Handle Provider Profile Save
  const handleSaveProviderProfile = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSavingProviderProfile(true);

    try {
      await providerApi.update(profile.id, {
        providerType,
        businessName: businessName.trim(),
      });
      success('Provider profile updated successfully');
      await refreshProfile();
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSavingProviderProfile(false);
    }
  };

  // Handle Address Add
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const newAddr = await addressApi.create({
        userId: user.id,
        line1: addrLine1.trim(),
        city: addrCity.trim(),
        pincode: addrPincode.trim(),
      });
      success('Address added');
      setAddresses((prev) => [...prev, newAddr]);
      setAddressModalOpen(false);
      setAddrLine1('');
      setAddrCity('');
      setAddrPincode('');
    } catch (err) {
      toastError(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle Address Delete
  const handleDeleteAddress = async () => {
    if (!deletingAddressId) return;
    try {
      await addressApi.remove(deletingAddressId);
      success('Address removed');
      setAddresses((prev) => prev.filter((a) => a.id !== deletingAddressId));
      setDeletingAddressId(null);
    } catch (err) {
      toastError(err.message || 'Failed to delete address');
    }
  };

  // Handle Add Worker Service
  const handleAddWorkerService = async (e) => {
    e.preventDefault();
    setSavingService(true);
    try {
      const res = await workerApi.addService({
        workerProfileId: profile.id,
        categoryId: serviceCategoryId,
        baseRate: Number(serviceBaseRate),
        rateType: serviceRateType,
      });
      success('Service added');
      setWorkerServices((prev) => [...prev, res]);
      setServiceModalOpen(false);
      setServiceBaseRate('');
    } catch (err) {
      toastError(err.message || 'Failed to add service');
    } finally {
      setSavingService(false);
    }
  };

  const handleRemoveWorkerService = async (serviceId) => {
    try {
      await workerApi.removeService(serviceId);
      success('Service removed');
      setWorkerServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      toastError(err.message || 'Failed to remove service');
    }
  };

  // Handle Add Worker Availability Slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSavingSlot(true);
    try {
      const res = await workerApi.addSlot({
        workerProfileId: profile.id,
        dayOfWeek: Number(slotDay),
        startTime: slotStart,
        endTime: slotEnd,
      });
      success('Availability slot added');
      setWorkerSlots((prev) => [...prev, res]);
      setSlotModalOpen(false);
    } catch (err) {
      toastError(err.message || 'Failed to add availability slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleRemoveSlot = async (slotId) => {
    try {
      await workerApi.removeSlot(slotId);
      success('Slot removed');
      setWorkerSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      toastError(err.message || 'Failed to remove slot');
    }
  };

  // Handle Add Document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    setSavingDoc(true);
    try {
      const res = await workerApi.addDocument({
        workerProfileId: profile.id,
        docType,
        fileUrl: docFileUrl.trim(),
      });
      success('Document added');
      setWorkerDocs((prev) => [...prev, res]);
      setDocModalOpen(false);
      setDocFileUrl('');
    } catch (err) {
      toastError(err.message || 'Failed to add document');
    } finally {
      setSavingDoc(false);
    }
  };

  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loadingInitial) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" id="profile-loading-spinner" />
      </div>
    );
  }

  const avgRating = profile?.avgRating != null ? Number(profile.avgRating) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-10">
      {/* Account Card */}
      <div className="card-static p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold text-xl font-heading shadow-md">
              {user.fullName?.slice(0, 2).toUpperCase() || 'GM'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-950 font-heading">
                  {user.fullName}
                </h1>
                <StatusBadge
                  status={user.isVerified ? 'VERIFIED' : 'PENDING'}
                  size="sm"
                  id="profile-verification-badge"
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  {user.phone}
                </span>
                <span className="uppercase font-semibold tracking-wider text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {avgRating != null && avgRating > 0 && (
            <div className="sm:text-right">
              <span className="block text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                Average Rating
              </span>
              <div className="flex items-center gap-1.5 mt-1 sm:justify-end">
                <StarRating value={avgRating} readOnly id="profile-avg-star" />
                <span className="text-lg font-bold font-heading text-neutral-900">
                  {avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WORKER SPECIFIC EDITING */}
      {user.role === 'WORKER' && profile && (
        <div className="space-y-8">
          {/* Bio, Experience, Radius Form */}
          <div className="card-static p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-neutral-950 font-heading border-b border-neutral-100 pb-3">
              Worker Profile Details
            </h2>

            <form onSubmit={handleSaveWorkerProfile} className="space-y-4" id="worker-profile-form">
              <div>
                <label className="label" htmlFor="worker-bio">
                  Bio / Professional Summary
                </label>
                <textarea
                  id="worker-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Certified technician with 5 years experience in residential repair..."
                  className="textarea"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="worker-experience">
                    Experience (Years)
                  </label>
                  <input
                    id="worker-experience"
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="worker-radius">
                    Service Radius (km)
                  </label>
                  <input
                    id="worker-radius"
                    type="number"
                    min="1"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="worker-save-profile-btn"
                  disabled={savingWorkerProfile}
                  className="btn btn-primary"
                >
                  {savingWorkerProfile && <Spinner size="sm" />}
                  Save Profile Information
                </button>
              </div>
            </form>
          </div>

          {/* Worker Services */}
          <div className="card-static p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-heading">
                  Offered Services & Rates
                </h3>
                <p className="text-xs text-neutral-500">
                  Categories you are qualified to handle and your standard baseline pricing
                </p>
              </div>
              <button
                type="button"
                id="worker-add-service-trigger-btn"
                onClick={() => setServiceModalOpen(true)}
                className="btn btn-secondary btn-sm gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
              </button>
            </div>

            {workerServices.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No specialized services registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workerServices.map((s) => (
                  <div
                    key={s.id}
                    id={`worker-service-${s.id}`}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-sm text-neutral-900 block">
                        {s.categoryName}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatMoney(s.baseRate)} / {s.rateType.toLowerCase()}
                      </span>
                    </div>
                    <button
                      type="button"
                      id={`remove-service-btn-${s.id}`}
                      onClick={() => handleRemoveWorkerService(s.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Availability Slots */}
          <div className="card-static p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-heading">
                  Weekly Availability Slots
                </h3>
                <p className="text-xs text-neutral-500">
                  Times during the week when you are open to take gigs
                </p>
              </div>
              <button
                type="button"
                id="worker-add-slot-trigger-btn"
                onClick={() => setSlotModalOpen(true)}
                className="btn btn-secondary btn-sm gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slot
              </button>
            </div>

            {workerSlots.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No availability schedule added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {workerSlots.map((slot) => (
                  <div
                    key={slot.id}
                    id={`worker-slot-${slot.id}`}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-neutral-700 block">
                        {dayNames[slot.dayOfWeek] || `Day ${slot.dayOfWeek}`}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {slot.startTime} &ndash; {slot.endTime}
                      </span>
                    </div>
                    <button
                      type="button"
                      id={`remove-slot-btn-${slot.id}`}
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Documents by URL */}
          <div className="card-static p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-heading">
                  Verification Documents
                </h3>
                <p className="text-xs text-neutral-500">
                  Records and certificates reviewed by administrators for badge approval
                </p>
              </div>
              <button
                type="button"
                id="worker-add-doc-trigger-btn"
                onClick={() => setDocModalOpen(true)}
                className="btn btn-secondary btn-sm gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Document URL
              </button>
            </div>

            {workerDocs.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No document links submitted.</p>
            ) : (
              <div className="space-y-2">
                {workerDocs.map((doc) => (
                  <div
                    key={doc.id}
                    id={`worker-doc-${doc.id}`}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                          {doc.docType}
                        </span>
                        <StatusBadge status={doc.status} size="sm" id={`doc-badge-${doc.id}`} />
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-neutral-600 underline truncate max-w-sm block mt-0.5"
                      >
                        {doc.fileUrl}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROVIDER SPECIFIC EDITING */}
      {user.role === 'PROVIDER' && profile && (
        <div className="card-static p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-neutral-950 font-heading border-b border-neutral-100 pb-3">
            Provider Business Details
          </h2>

          <form onSubmit={handleSaveProviderProfile} className="space-y-4" id="provider-profile-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="provider-type-select">
                  Provider Type
                </label>
                <select
                  id="provider-type-select"
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="select"
                >
                  <option value="INDIVIDUAL">Individual (Homeowner / Consumer)</option>
                  <option value="BUSINESS">Business (Enterprise / Commercial)</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="provider-business-name">
                  Business / Organization Name
                </label>
                <input
                  id="provider-business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Facilities"
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="provider-save-profile-btn"
                disabled={savingProviderProfile}
                className="btn btn-primary"
              >
                {savingProviderProfile && <Spinner size="sm" />}
                Save Business Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALL ROLES: SAVED ADDRESSES */}
      <div className="card-static p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-950 font-heading">Saved Addresses</h3>
            <p className="text-xs text-neutral-500">
              Locations used when creating gigs or finding nearby assignments
            </p>
          </div>
          <button
            type="button"
            id="profile-add-address-trigger-btn"
            onClick={() => setAddressModalOpen(true)}
            className="btn btn-secondary btn-sm gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-xs text-neutral-400 py-2">No addresses saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                id={`saved-address-${addr.id}`}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sm text-neutral-900 block">
                      {addr.line1}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {addr.city} &ndash; {addr.pincode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  id={`delete-address-btn-${addr.id}`}
                  onClick={() => setDeletingAddressId(addr.id)}
                  className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALL ROLES: REVIEWS RECEIVED */}
      <div className="card-static p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-950 font-heading">
            Feedback & Reviews Received ({reviews.length})
          </h3>
          <p className="text-xs text-neutral-500">Verified reviews left by counterparts on completed bookings</p>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-neutral-400 py-2">No reviews received yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                id={`user-review-${r.id}`}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">{r.reviewerName}</span>
                  <StarRating value={r.rating} readOnly id={`received-review-star-${r.id}`} />
                </div>
                {r.comment && <p className="text-xs sm:text-sm text-neutral-700 italic">"{r.comment}"</p>}
                <span className="text-[10px] text-neutral-400 block">{formatDate(r.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Address"
        id="profile-address-modal"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4" id="profile-address-form">
          <div>
            <label className="label" htmlFor="prof-addr-line1">
              Address Line 1
            </label>
            <input
              id="prof-addr-line1"
              type="text"
              required
              value={addrLine1}
              onChange={(e) => setAddrLine1(e.target.value)}
              placeholder="e.g. Flat 102, Sunrise Towers"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="prof-addr-city">
                City
              </label>
              <input
                id="prof-addr-city"
                type="text"
                required
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                placeholder="Bengaluru"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="prof-addr-pincode">
                Pincode
              </label>
              <input
                id="prof-addr-pincode"
                type="text"
                required
                value={addrPincode}
                onChange={(e) => setAddrPincode(e.target.value)}
                placeholder="560001"
                className="input"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              id="prof-addr-cancel-btn"
              onClick={() => setAddressModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="prof-addr-submit-btn"
              disabled={savingAddress}
              className="btn btn-primary"
            >
              {savingAddress && <Spinner size="sm" />}
              Save Address
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Address Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingAddressId)}
        onCancel={() => setDeletingAddressId(null)}
        onConfirm={handleDeleteAddress}
        danger
        title="Delete Address?"
        message="Are you sure you want to delete this address from your profile?"
        confirmText="Yes, Delete"
        id="delete-address-confirm"
      />

      {/* Add Worker Service Modal */}
      <Modal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title="Add Specialized Service"
        id="profile-service-modal"
      >
        <form onSubmit={handleAddWorkerService} className="space-y-4" id="profile-service-form">
          <div>
            <label className="label" htmlFor="prof-service-cat">
              Category
            </label>
            <select
              id="prof-service-cat"
              value={serviceCategoryId}
              onChange={(e) => setServiceCategoryId(e.target.value)}
              className="select"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="prof-service-rate">
                Base Rate (INR)
              </label>
              <input
                id="prof-service-rate"
                type="number"
                min="1"
                required
                value={serviceBaseRate}
                onChange={(e) => setServiceBaseRate(e.target.value)}
                placeholder="500"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="prof-service-type">
                Rate Type
              </label>
              <select
                id="prof-service-type"
                value={serviceRateType}
                onChange={(e) => setServiceRateType(e.target.value)}
                className="select"
              >
                <option value="HOURLY">HOURLY</option>
                <option value="FIXED">FIXED</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              id="prof-service-cancel-btn"
              onClick={() => setServiceModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="prof-service-submit-btn"
              disabled={savingService}
              className="btn btn-primary"
            >
              {savingService && <Spinner size="sm" />}
              Save Service
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Availability Slot Modal */}
      <Modal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        title="Add Availability Slot"
        id="profile-slot-modal"
      >
        <form onSubmit={handleAddSlot} className="space-y-4" id="profile-slot-form">
          <div>
            <label className="label" htmlFor="prof-slot-day">
              Day of Week
            </label>
            <select
              id="prof-slot-day"
              value={slotDay}
              onChange={(e) => setSlotDay(Number(e.target.value))}
              className="select"
            >
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
              <option value={7}>Sunday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="prof-slot-start">
                Start Time
              </label>
              <input
                id="prof-slot-start"
                type="time"
                required
                value={slotStart}
                onChange={(e) => setSlotStart(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="prof-slot-end">
                End Time
              </label>
              <input
                id="prof-slot-end"
                type="time"
                required
                value={slotEnd}
                onChange={(e) => setSlotEnd(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              id="prof-slot-cancel-btn"
              onClick={() => setSlotModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="prof-slot-submit-btn"
              disabled={savingSlot}
              className="btn btn-primary"
            >
              {savingSlot && <Spinner size="sm" />}
              Save Availability
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Document URL Modal */}
      <Modal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title="Add Document URL"
        id="profile-doc-modal"
      >
        <form onSubmit={handleAddDocument} className="space-y-4" id="profile-doc-form">
          <div>
            <label className="label" htmlFor="prof-doc-type">
              Document Type
            </label>
            <input
              id="prof-doc-type"
              type="text"
              required
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              placeholder="e.g. ID, GOVT_LICENSE, CERTIFICATE"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="prof-doc-url">
              Document Web URL
            </label>
            <input
              id="prof-doc-url"
              type="url"
              required
              value={docFileUrl}
              onChange={(e) => setDocFileUrl(e.target.value)}
              placeholder="https://example.com/my-license.pdf"
              className="input"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              id="prof-doc-cancel-btn"
              onClick={() => setDocModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="prof-doc-submit-btn"
              disabled={savingDoc}
              className="btn btn-primary"
            >
              {savingDoc && <Spinner size="sm" />}
              Save Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

