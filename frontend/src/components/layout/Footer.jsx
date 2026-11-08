import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-xs">
              GM
            </div>
            <span className="font-heading font-bold text-neutral-900 tracking-tight">GigMart</span>
            <span className="text-xs text-neutral-400">|</span>
            <span className="text-xs text-neutral-500">
              On-demand local gig marketplace &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-500 font-medium">
            <Link to="/gigs" id="footer-explore-link" className="hover:text-neutral-900 transition-colors">
              Explore Gigs
            </Link>
            <Link to="/login" id="footer-login-link" className="hover:text-neutral-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register" id="footer-register-link" className="hover:text-neutral-900 transition-colors">
              Join as Worker or Provider
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

