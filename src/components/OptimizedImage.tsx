'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);
  const [, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setImgSrc(fallbackSrc);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden w-full h-full ${isLoading ? 'bg-neutral-800/30' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/50 backdrop-blur-xs z-10 transition-opacity duration-300">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        className={`transition-all duration-500 ease-in-out ${
          isLoading ? 'scale-105 blur-md grayscale' : 'scale-100 blur-0 grayscale-0'
        } ${className}`}
        src={imgSrc || fallbackSrc}
        alt={alt || 'Image'}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
