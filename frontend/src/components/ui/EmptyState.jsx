import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionText,
  onAction,
  actionLink,
  className = '',
  id = 'empty-state',
}) {
  return (
    <div
      id={id}
      className={`card-static flex flex-col items-center justify-center text-center p-8 sm:p-12 border-dashed border-2 border-neutral-200 bg-neutral-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 font-heading mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>

      {actionLink && actionText && (
        <Link
          to={actionLink}
          id={`${id}-action-link`}
          className="btn btn-primary text-xs sm:text-sm"
        >
          {actionText}
        </Link>
      )}

      {!actionLink && onAction && actionText && (
        <button
          type="button"
          onClick={onAction}
          id={`${id}-action-btn`}
          className="btn btn-primary text-xs sm:text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

