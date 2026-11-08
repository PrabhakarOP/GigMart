import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardPathFor } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';
import { User, Mail, Phone, Lock, Briefcase, HardHat, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('WORKER');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const user = await register({
        fullName,
        email,
        phone,
        password,
        role,
      });

      success(`Account created successfully! Welcome to GigMart, ${user.fullName}.`);
      navigate(dashboardPathFor(user.role), {
        replace: true,
        state: { isNewWorker: user.role === 'WORKER' },
      });
    } catch (err) {
      if (err.status === 409) {
        toastError(err.message || 'An account with this email or phone number already exists.');
      } else {
        toastError(err.message || 'Registration failed. Please check the entered details.');
      }
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-10 sm:pt-14 pb-12">
      <div className="card-static p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
            GM
          </div>
          <h1 className="text-2xl font-bold text-neutral-950 font-heading">Create your account</h1>
          <p className="text-sm text-neutral-500 mt-1">Join as a service provider or skilled worker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          {/* Role Selector */}
          <div>
            <label className="label">I want to join as</label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account role">
              <button
                type="button"
                id="role-select-worker"
                onClick={() => setRole('WORKER')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  role === 'WORKER'
                    ? 'border-neutral-950 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <HardHat className={`w-5 h-5 ${role === 'WORKER' ? 'text-white' : 'text-neutral-500'}`} />
                <span className="text-sm font-semibold">Skilled Worker</span>
                <span className={`text-[11px] ${role === 'WORKER' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Find gigs & bid on jobs
                </span>
              </button>

              <button
                type="button"
                id="role-select-provider"
                onClick={() => setRole('PROVIDER')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  role === 'PROVIDER'
                    ? 'border-neutral-950 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Briefcase className={`w-5 h-5 ${role === 'PROVIDER' ? 'text-white' : 'text-neutral-500'}`} />
                <span className="text-sm font-semibold">Client / Provider</span>
                <span className={`text-[11px] ${role === 'PROVIDER' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Post gigs & hire workers
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="register-name">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                id="register-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Sharma"
                className={`input pl-10 ${fieldErrors.fullName ? 'border-rose-500 ring-rose-500' : ''}`}
                autoComplete="name"
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="register-email">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                className={`input pl-10 ${fieldErrors.email ? 'border-rose-500 ring-rose-500' : ''}`}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="register-phone">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                id="register-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className={`input pl-10 ${fieldErrors.phone ? 'border-rose-500 ring-rose-500' : ''}`}
                autoComplete="tel"
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`input pl-10 ${fieldErrors.password ? 'border-rose-500 ring-rose-500' : ''}`}
                autoComplete="new-password"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? <Spinner size="sm" id="register-spinner" /> : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link
            to="/login"
            id="register-to-login-link"
            className="text-neutral-950 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

