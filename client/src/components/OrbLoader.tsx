import React from 'react';
import { Sparkles } from 'lucide-react';

interface OrbLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OrbLoader: React.FC<OrbLoaderProps> = ({ label = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* 3D Glass Cosmic Orb Container */}
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        {/* Outer 3D Gyro Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-t-[#5683da] border-r-transparent border-b-[#ff8964] border-l-transparent animate-orb-spin-3d" />

        {/* Inner Glowing 3D Orb Core */}
        <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-[#5683da] via-[#94b3f2] to-[#ff8964] animate-orb-pulse-3d flex items-center justify-center backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
      </div>

      {label && (
        <p className="text-xs font-mono text-[#95979e] uppercase tracking-wider animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
