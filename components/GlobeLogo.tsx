import React from 'react';
import Image from 'next/image';

interface GlobeLogoProps {
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly variant?: 'icon' | 'full';
}

export default function GlobeLogo({ className = '', size = 'md', variant = 'icon' }: Readonly<GlobeLogoProps>) {
  const dimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 120, height: 120 },
    xl: { width: 160, height: 160 }
  };

  const imageSrc = variant === 'full' ? '/Globe-telecom.jpg' : '/Globe-telecomONGLET.png';
  const { width, height } = dimensions[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width, height }}>
      <Image
        src={imageSrc}
        alt="Globe Telecom Logo"
        width={width}
        height={height}
        className="object-contain rounded-lg"
        priority
      />
    </div>
  );
}
