import React from 'react';

const LoadingRegion = ({ label, children, className = '' }) => (
  <div className={className} role="status" aria-live="polite" aria-busy="true">
    {children}
    <span className="sr-only">{label}</span>
  </div>
);

export const GalleryGridSkeleton = () => {
  const heights = ['h-80', 'h-[28rem]', 'h-64', 'h-96', 'h-72', 'h-[26rem]'];

  return (
    <LoadingRegion label="Loading photographs" className="columns-1 sm:columns-2 lg:columns-3 gap-4 px-4 pb-8">
      {heights.map((height, index) => (
        <div key={index} className={`loading-shimmer ${height} mb-4 break-inside-avoid bg-gray-100`} />
      ))}
    </LoadingRegion>
  );
};

export const GalleryCardsSkeleton = () => (
  <LoadingRegion label="Loading galleries" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="border border-gray-200 overflow-hidden">
        <div className="loading-shimmer h-48 bg-gray-100" />
        <div className="p-4 space-y-3">
          <div className="loading-shimmer h-6 w-3/4 bg-gray-100 rounded" />
          <div className="loading-shimmer h-4 w-1/3 bg-gray-100 rounded" />
        </div>
      </div>
    ))}
  </LoadingRegion>
);

export const PageLoadingState = () => (
  <LoadingRegion label="Loading page" className="min-h-screen bg-white pt-[84px] px-6">
    <div className="max-w-6xl mx-auto">
      <div className="loading-shimmer h-8 w-48 max-w-full mx-auto mb-10 bg-gray-100 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="loading-shimmer h-64 bg-gray-100" />
        ))}
      </div>
    </div>
  </LoadingRegion>
);

export const FormLoadingState = () => (
  <LoadingRegion label="Loading gallery editor" className="min-h-screen bg-white p-8 pt-28">
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="loading-shimmer h-9 w-52 bg-gray-100 rounded" />
      <div className="space-y-2">
        <div className="loading-shimmer h-5 w-28 bg-gray-100 rounded" />
        <div className="loading-shimmer h-11 w-full bg-gray-100 rounded" />
      </div>
      <div className="space-y-2">
        <div className="loading-shimmer h-5 w-16 bg-gray-100 rounded" />
        <div className="loading-shimmer h-11 w-full bg-gray-100 rounded" />
      </div>
      <div className="loading-shimmer h-28 w-full bg-gray-100 rounded" />
    </div>
  </LoadingRegion>
);
