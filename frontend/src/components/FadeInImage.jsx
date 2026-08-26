import React, { useEffect, useState } from 'react';

function FadeInImage({
  src,
  srcSet,
  sizes,
  fallbackSrc,
  width,
  height,
  alt,
  onClick,
  onSettled,
  className = "",
  eager = false
}) {
  const [loaded, setLoaded] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setUsingFallback(false);
  }, [src]);

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
      onLoad={() => {
        setLoaded(true);
        onSettled?.();
      }}
      onError={() => {
        if (!usingFallback && fallbackSrc && fallbackSrc !== src) {
          setUsingFallback(true);
          return;
        }
        onSettled?.();
      }}
      className={`${className} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default FadeInImage;
