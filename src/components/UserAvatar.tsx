// components/UserAvatar.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar = ({ name, avatarUrl, size = 'md', className = '' }: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!avatarUrl || !isValidImageUrl(avatarUrl) || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center ${className}`}>
        {name ? (
          <span className={`${fontSizes[size]} font-bold text-blue-600`}>
            {getInitials(name)}
          </span>
        ) : (
          <User className={`${iconSizes[size]} text-blue-600`} />
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative ${className}`}>
      <Image
        src={avatarUrl}
        alt={`Avatar ${name || ''}`}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        unoptimized
        sizes={`(max-width: 768px) 100vw, ${sizeClasses[size].split('w-')[1]}px`}
      />
    </div>
  );
};

export default UserAvatar;