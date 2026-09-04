import React, { useState } from 'react';

function FadeInImage({
  src,
  srcSet,
  sizes,
  fallbackSrc,
  width,
  height,
  alt,
  onClick,
  onLoad,
  onSettled,
  className = "",
  eager = false
}) {
  const [loadedSrc, setLoadedSrc] = useState('');
  const [fallbackForSrc, setFallbackForSrc] = useState('');
  const [failedSrc, setFailedSrc] = useState('');

  const usingFallback = fallbackForSrc === src;
  const settled = loadedSrc === src || failedSrc === src;

  return (
    <img
      src={usingFallback ? fallbackSrc : src}
      srcSet={usingFallback ? undefined : srcSet}
      sizes={usingFallback ? undefined : sizes}
      width={width}
      height={height}
      alt={alt}
      onClick={onClick}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'low'}
      decoding="async"
      aria-busy={!settled}
      onLoad={(event) => {
        setLoadedSrc(src);
        onLoad?.(event);
        onSettled?.();
      }}
      onError={() => {
        if (!usingFallback && fallbackSrc && fallbackSrc !== src) {
          setFallbackForSrc(src);
          return;
        }
        setFailedSrc(src);
        onSettled?.();
      }}
      className={`${className} transition-opacity duration-300 ${settled ? 'opacity-100' : 'opacity-60 bg-gray-100 animate-pulse'}`}
    />
  );
}

export default FadeInImage;
