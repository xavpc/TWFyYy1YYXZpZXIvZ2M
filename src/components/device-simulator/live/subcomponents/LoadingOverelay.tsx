import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg animate-fade-in">
      <div className="bg-gray-900/80 shadow-xl rounded-lg p-6 max-w-md text-center border border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Loading Map Data</h3>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;