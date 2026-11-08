import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gigApi, categoryApi, toList } from '../api/services';
import { normalizeGig } from '../api/normalizers';
import GigCard from '../components/gig/GigCard';
import Spinner from '../components/ui/Spinner';
import { dashboardPathFor } from '../lib/format';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Search,
  CheckCircle2,
  Briefcase,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [openGigs, setOpenGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    Promise.all([
      gigApi.list({ status: 'OPEN' }).catch(() => []),
      categoryApi.list(true).catch(() => []),
    ])
      .then(([gigsData, catsData]) => {
        if (!ignore) {
          const normGigs = toList(gigsData).map(normalizeGig);
          setOpenGigs(normGigs);
          setCategories(toList(catsData));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Local Talent &bull; Direct Bidding
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-950 font-heading tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Hire trusted local pros or get hired for quality gigs.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            GigMart connects verified service professionals with clients. Post your requirements,
            receive transparent bids, and pay only when the job is done right.
          </p>

          {/* Dynamic CTAs based on role */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user && (
              <>
                <Link to="/gigs" id="hero-explore-btn" className="btn btn-primary btn-lg w-full sm:w-auto">
                  <Search className="w-5 h-5" />
                  Explore Available Gigs
                </Link>
                <Link to="/register" id="hero-register-btn" className="btn btn-secondary btn-lg w-full sm:w-auto">
                  Sign Up & Post a Gig
                </Link>
              </>
            )}

            {user?.role === 'PROVIDER' && (
              <>
                <Link to="/gigs/create" id="hero-post-gig-btn" className="btn btn-primary btn-lg w-full sm:w-auto">
                  <Briefcase className="w-5 h-5" />
                  Post a New Gig
                </Link>
                <Link
                  to={dashboardPathFor(user.role)}
                  id="hero-provider-dashboard-btn"
                  className="btn btn-secondary btn-lg w-full sm:w-auto"
                >
                  Go to Provider Dashboard &rarr;
                </Link>
              </>
            )}

            {user?.role === 'WORKER' && (
              <>
                <Link to="/gigs" id="hero-worker-browse-btn" className="btn btn-primary btn-lg w-full sm:w-auto">
                  <Search className="w-5 h-5" />
                  Browse & Bid on Gigs
                </Link>
                <Link
                  to={dashboardPathFor(user.role)}
                  id="hero-worker-dashboard-btn"
                  className="btn btn-secondary btn-lg w-full sm:w-auto"
                >
                  My Worker Dashboard &rarr;
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/dashboard/admin" id="hero-admin-btn" className="btn btn-primary btn-lg w-full sm:w-auto">
                Open Admin Management &rarr;
              </Link>
            )}
          </div>

          {/* Real stats bar */}
          <div className="mt-12 pt-8 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
                {loading ? '—' : openGigs.length}
              </div>
              <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mt-1">
                Active Open Gigs
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
                {loading ? '—' : categories.length}
              </div>
              <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mt-1">
                Service Categories
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-heading">
                100%
              </div>
              <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mt-1">
                Verified Users
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Blocks (3 Blocks) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-heading">
            Why choose GigMart
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 mt-2">
            Built for reliability, speed, and fairness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="card-static p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 font-heading mb-2">
              Verified Marketplace
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every worker profile undergoes administrative verification. Check genuine client ratings
              and verified credentials before accepting quotes.
            </p>
          </div>

          <div className="card-static p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 font-heading mb-2">
              Competitive Transparent Bidding
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Workers submit custom quotes and cover notes. Providers compare pricing, review worker
              ratings, and accept the best offer with a single click.
            </p>
          </div>

          <div className="card-static p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-5">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 font-heading mb-2">
              End-to-End Tracking & Reviews
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Real-time gig progression from scheduled to completed, instant in-app messaging,
              itemized payment receipts, and two-way review feedback.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 md:p-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-2">
              How GigMart works in four steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center border border-neutral-700">
                1
              </div>
              <h4 className="text-base font-semibold font-heading text-neutral-100">Post a Gig</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Describe the task, set a scheduled date, and set an estimated budget in INR.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center border border-neutral-700">
                2
              </div>
              <h4 className="text-base font-semibold font-heading text-neutral-100">Receive Quotes</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Skilled workers apply with custom price bids and relevant service experience.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center border border-neutral-700">
                3
              </div>
              <h4 className="text-base font-semibold font-heading text-neutral-100">Accept & Book</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Choose the best bid. A booking is generated immediately and other bids close out.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center border border-neutral-700">
                4
              </div>
              <h4 className="text-base font-semibold font-heading text-neutral-100">Pay & Review</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Confirm job completion, record the payment, and exchange feedback ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Open Gigs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-950 font-heading">Recent Open Gigs</h2>
            <p className="text-sm text-neutral-500 mt-1">Explore current opportunities in your area</p>
          </div>
          <Link
            to="/gigs"
            id="home-view-all-gigs"
            className="text-sm font-semibold text-neutral-950 hover:underline flex items-center gap-1"
          >
            View all gigs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" id="home-gigs-spinner" />
          </div>
        ) : openGigs.length === 0 ? (
          <div className="card-static p-8 text-center border-dashed border-2">
            <p className="text-sm text-neutral-500">No open gigs at this moment.</p>
            <Link to="/gigs/create" className="btn btn-primary btn-sm mt-3">
              Post the first gig
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openGigs.slice(0, 6).map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

