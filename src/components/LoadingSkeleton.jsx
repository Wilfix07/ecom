import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow animate-pulse border">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-9 bg-gray-200 rounded" />
    </div>
  </div>
);

export const BlogPostSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-20 bg-gray-200 rounded" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3, width = 'full' }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

