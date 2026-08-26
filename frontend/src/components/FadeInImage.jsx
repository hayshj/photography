import React, { useEffect, useState } from 'react';

function FadeInImage({
  src,
  srcSet,
  sizes,
  fallbackSrc,
  alt,
  onClick,
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
      alt={alt}
      onClick={onClick}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!usingFallback && fallbackSrc) setUsingFallback(true);
      }}
      className={`${className} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default FadeInImage;
