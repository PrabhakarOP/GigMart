import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  className = '',
  id = 'star-rating',
}) {
  const numericValue = Math.round(Number(value) || 0);

  return (
    <div
      id={id}
      className={`inline-flex items-center gap-1 ${className}`}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${numericValue} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= numericValue;

        if (readOnly) {
          return (
            <Star
              key={star}
              id={`${id}-star-${star}`}
              className={`w-4 h-4 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-300 stroke-neutral-300'
              }`}
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            id={`${id}-star-btn-${star}`}
            role="radio"
            aria-checked={numericValue === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange && onChange(star)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onChange && onChange(star);
              }
            }}
            className="p-1 rounded-md text-neutral-300 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'hover:fill-amber-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

