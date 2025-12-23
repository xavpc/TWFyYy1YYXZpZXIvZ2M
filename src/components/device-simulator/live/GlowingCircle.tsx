import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface GlowingCircleProps {
  position: [number, number];
  radius: number; // Radius in pixels
  color: string; // Glow color
}

const GlowingCircle: React.FC<GlowingCircleProps> = ({ position, radius, color }) => {
  const glowingCircleIcon = L.divIcon({
    className: 'custom-glowing-circle',
    html: `
      <div 
        style="
          position: relative;
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.5;
          animation: pulse 2s infinite;
          z-index: 0; /* Ensure it doesn't block the car icon */
        "
      ></div>
    `,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius], // Center the circle
  });

  return (
    <Marker
      position={position}
      icon={glowingCircleIcon}
      interactive={false} // Make it non-interactive
    />
  );
};

export default GlowingCircle;