import React, { useEffect, useState } from 'react';

function LocalImagePreview({ file, alt, className = '' }) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) {
    return <div className={`${className} bg-gray-100 animate-pulse`} aria-hidden="true" />;
  }

  return (
    <img
      src={previewUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

export default LocalImagePreview;
