import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  message = 'Something went wrong while loading data.',
  onRetry,
  className = '',
  id = 'error-state',
}) {
  return (
    <div
      id={id}
      role="alert"
      className={`card-static flex flex-col items-center justify-center text-center p-8 border-rose-200 bg-rose-50/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 font-heading mb-1">
        Unable to load content
      </h3>
      <p className="text-sm text-rose-700 max-w-md mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          id={`${id}-retry-btn`}
          onClick={onRetry}
          className="btn btn-secondary border-rose-200 hover:bg-rose-100/60 text-rose-900 gap-2 text-xs sm:text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}

