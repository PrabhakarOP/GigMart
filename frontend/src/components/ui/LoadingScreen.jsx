import React from 'react';
import Spinner from './Spinner';

export default function LoadingScreen({ message = 'Loading...', className = '', id = 'loading-screen' }) {
  return (
    <div
      id={id}
      className={`min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 ${className}`}
    >
      <Spinner size="lg" id={`${id}-spinner`} />
      <p className="text-sm font-medium text-neutral-600 animate-pulse">{message}</p>
    </div>
  );
}

