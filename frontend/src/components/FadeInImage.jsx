import React, { useEffect, useRef, useState } from 'react';

function FadeInImage({ src, alt, onClick, className = "" }) {
  const [visible, setVisible] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onClick={onClick}
      className={`
        transition-opacity duration-700 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
    />
  );
}

export default FadeInImage;
