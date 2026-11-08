import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardPathFor } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';
import { ArrowRight, Lock, Mail, ShieldCheck, HardHat, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname || dashboardPathFor(user.role);
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e, customEmail = null, customPassword = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    try {
      const user = await login(loginEmail, loginPass);
      success(`Welcome back, ${user.fullName || 'User'}!`);
      redirectAfterLogin(user);
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      toastError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleSubmit(null, demoEmail, demoPassword);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-12 sm:pt-16">
      <div className="card-static p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
            GM
          </div>
          <h1 className="text-2xl font-bold text-neutral-950 font-heading">Sign in to GigMart</h1>
          <p className="text-sm text-neutral-500 mt-1">Access your marketplace dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          <div>
            <label className="label" htmlFor="login-email">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`input pl-10 ${fieldErrors.email ? 'border-rose-500 ring-rose-500' : ''}`}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`input pl-10 ${fieldErrors.password ? 'border-rose-500 ring-rose-500' : ''}`}
                autoComplete="current-password"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? <Spinner size="sm" id="login-spinner" /> : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* One-click demo logins */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 text-center mb-3">
            One-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="demo-login-provider"
              onClick={() => handleDemoLogin('provider@gigmart.com', 'provider123')}
              disabled={loading}
              className="btn btn-secondary btn-sm flex flex-col items-center py-2 px-1 text-center h-auto hover:border-neutral-900"
            >
              <Briefcase className="w-3.5 h-3.5 mb-1 text-neutral-700" />
              <span className="text-[11px] font-semibold">Provider</span>
            </button>
            <button
              type="button"
              id="demo-login-worker"
              onClick={() => handleDemoLogin('worker@gigmart.com', 'worker123')}
              disabled={loading}
              className="btn btn-secondary btn-sm flex flex-col items-center py-2 px-1 text-center h-auto hover:border-neutral-900"
            >
              <HardHat className="w-3.5 h-3.5 mb-1 text-neutral-700" />
              <span className="text-[11px] font-semibold">Worker</span>
            </button>
            <button
              type="button"
              id="demo-login-admin"
              onClick={() => handleDemoLogin('admin@gigmart.com', 'admin123')}
              disabled={loading}
              className="btn btn-secondary btn-sm flex flex-col items-center py-2 px-1 text-center h-auto hover:border-neutral-900"
            >
              <ShieldCheck className="w-3.5 h-3.5 mb-1 text-neutral-700" />
              <span className="text-[11px] font-semibold">Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            id="login-to-register-link"
            className="text-neutral-950 font-semibold hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

