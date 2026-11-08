import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatDate, formatMoney } from '../../lib/format';

export default function GigCard({ gig, className = '' }) {
  if (!gig) return null;

  return (
    <Link
      to={`/gigs/${gig.id}`}
      id={`gig-card-${gig.id}`}
      className={`card block p-5 sm:p-6 group relative ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
          {gig.categoryName || 'General Service'}
        </span>
        <StatusBadge status={gig.status} size="sm" id={`gig-card-status-${gig.id}`} />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 font-heading mb-2 group-hover:text-neutral-700 transition-colors line-clamp-1">
        {gig.title}
      </h3>

      <p className="text-sm text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
        {gig.description}
      </p>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-neutral-500 mb-5 pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>{formatDate(gig.scheduledAt)}</span>
        </div>
        {gig.addressSummary && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span className="truncate max-w-[160px]">{gig.addressSummary}</span>
          </div>
        )}
        {gig.applicationCount != null && gig.applicationCount > 0 && (
          <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span>
              {gig.applicationCount} {gig.applicationCount === 1 ? 'quote' : 'quotes'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Budget
          </span>
          <span className="text-base sm:text-lg font-bold text-neutral-950 font-heading">
            {formatMoney(gig.budget)}
          </span>
        </div>
        <span className="text-xs font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
          View Details &rarr;
        </span>
      </div>
    </Link>
  );
}

