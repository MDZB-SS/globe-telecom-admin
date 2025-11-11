import React from 'react';
import GlobeLogo from './GlobeLogo';

interface GlobeHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function GlobeHeader({ title, subtitle, icon: Icon }: GlobeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black py-8 px-6 mb-6 rounded-lg shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-3 bg-red-600 rounded-xl shadow-lg">
              <Icon className="h-8 w-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {subtitle && (
              <p className="text-gray-300 text-lg">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Logo Globe Telecom */}
        <div className="hidden md:flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-lg">
            <GlobeLogo size="lg" variant="full" />
          </div>
          <div className="text-white">
            <div className="text-xl font-bold">Globe Telecom</div>
            <div className="text-sm text-gray-300">Administration</div>
          </div>
        </div>
      </div>
    </div>
  );
}

