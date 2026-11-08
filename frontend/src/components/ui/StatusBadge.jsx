import React from 'react';

export default function StatusBadge({
  status,
  size = 'md',
  className = '',
  id,
}) {
  const normalizedStatus = String(status || '').toUpperCase().trim();

  let badgeType = 'default';

  if (['OPEN', 'ACCEPTED', 'PAID', 'VERIFIED', 'APPROVED'].includes(normalizedStatus)) {
    badgeType = 'success';
  } else if (['ASSIGNED', 'SCHEDULED'].includes(normalizedStatus)) {
    badgeType = 'info';
  } else if (['IN_PROGRESS', 'PENDING'].includes(normalizedStatus)) {
    badgeType = 'warning';
  } else if (['REJECTED', 'CANCELLED', 'FAILED'].includes(normalizedStatus)) {
    badgeType = 'danger';
  } else if (['COMPLETED', 'WITHDRAWN', 'REFUNDED'].includes(normalizedStatus)) {
    badgeType = 'default';
  } else {
    badgeType = 'default';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const label = normalizedStatus.replace(/_/g, ' ') || 'UNKNOWN';

  return (
    <span
      id={id || `status-badge-${normalizedStatus.toLowerCase()}`}
      className={`badge badge-${badgeType} ${sizeClass} font-semibold uppercase tracking-wider ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          badgeType === 'success'
            ? 'bg-emerald-600'
            : badgeType === 'info'
            ? 'bg-sky-600'
            : badgeType === 'warning'
            ? 'bg-amber-600'
            : badgeType === 'danger'
            ? 'bg-rose-600'
            : 'bg-neutral-600'
        }`}
      />
      {label}
    </span>
  );
}

