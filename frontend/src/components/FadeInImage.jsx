import React, { useState } from 'react';

function FadeInImage({
  src,
  srcSet,
  sizes,
  alt,
  onClick,
  className = "",
  eager = false
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      onClick={onClick}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default FadeInImage;
