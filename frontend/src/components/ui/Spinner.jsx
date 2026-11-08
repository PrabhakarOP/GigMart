import React from 'react';

export default function Spinner({ size = 'md', className = '', id = 'loading-spinner' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      id={id}
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-neutral-300 border-t-neutral-900 ${
        sizeMap[size] || sizeMap.md
      } ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

