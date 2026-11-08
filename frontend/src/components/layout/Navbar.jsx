import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardPathFor } from '../../lib/format';
import { Menu, X, PlusCircle, LayoutDashboard, MessageSquare, User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          id="nav-logo"
          className="flex items-center gap-2 text-neutral-950 font-heading font-extrabold text-xl tracking-tight"
        >
          <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            GM
          </div>
          <span>GigMart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/gigs"
            id="nav-explore-gigs"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/gigs'
                ? 'bg-neutral-100 text-neutral-950'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Explore Gigs
          </Link>

          {user?.role === 'PROVIDER' && (
            <Link
              to="/gigs/create"
              id="nav-post-gig"
              className="btn btn-primary btn-sm ml-2 gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Post Gig
            </Link>
          )}

          {user && (
            <>
              <Link
                to={dashboardPathFor(user.role)}
                id="nav-dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {user.role === 'ADMIN' ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </>
                )}
              </Link>

              {user.role !== 'ADMIN' && (
                <Link
                  to="/messages"
                  id="nav-messages"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/messages'
                      ? 'bg-neutral-100 text-neutral-950'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </Link>
              )}

              <Link
                to="/profile"
                id="nav-profile"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/profile'
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>

              <button
                type="button"
                id="nav-logout-btn"
                onClick={logout}
                className="btn btn-ghost btn-sm text-neutral-500 hover:text-rose-600 ml-1"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-2 ml-4">
              <Link to="/login" id="nav-login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" id="nav-register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user?.role === 'PROVIDER' && (
            <Link
              to="/gigs/create"
              id="mobile-nav-post-gig"
              className="btn btn-primary btn-sm px-2.5 py-1 text-xs"
            >
              Post
            </Link>
          )}
          <button
            type="button"
            id="nav-mobile-toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-neutral-700 hover:bg-neutral-100"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-slide-up"
        >
          <div className="flex flex-col gap-1">
            <Link
              to="/gigs"
              id="mobile-nav-explore-gigs"
              className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Explore Gigs
            </Link>

            {user && (
              <>
                <Link
                  to={dashboardPathFor(user.role)}
                  id="mobile-nav-dashboard"
                  className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                </Link>

                {user.role !== 'ADMIN' && (
                  <Link
                    to="/messages"
                    id="mobile-nav-messages"
                    className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </Link>
                )}

                <Link
                  to="/profile"
                  id="mobile-nav-profile"
                  className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile ({user.fullName})
                </Link>

                <button
                  type="button"
                  id="mobile-nav-logout-btn"
                  onClick={logout}
                  className="mt-2 w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            )}

            {!user && (
              <div className="pt-3 flex flex-col gap-2">
                <Link
                  to="/login"
                  id="mobile-nav-login"
                  className="btn btn-secondary w-full justify-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  id="mobile-nav-register"
                  className="btn btn-primary w-full justify-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

