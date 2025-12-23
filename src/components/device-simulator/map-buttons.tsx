import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Maximize2, Minimize2, Info, X } from 'lucide-react';

interface MapButtonsProps {
  setIsFullScreen: Dispatch<SetStateAction<boolean>>;
  setShowLegend: Dispatch<SetStateAction<boolean>>;
}

const MapButtons: React.FC<MapButtonsProps> = ({ setIsFullScreen, setShowLegend }) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);
  const [isFullScreen, setIsFullScreenLocal] = React.useState(false);
  const [showLegend, setShowLegendLocal] = React.useState(false);
  
  // Effect to sync local state with parent state
  useEffect(() => {
    if (isFullScreen) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
    }
  }, [isFullScreen, setIsFullScreen]);
  
  useEffect(() => {
    if (showLegend) {
      setShowLegend(true);
    } else {
      setShowLegend(false);
    }
  }, [showLegend, setShowLegend]);
  
  useEffect(() => {
    // Create a custom control
    if (controlRef.current) {
      controlRef.current.remove();
    }
    
    // Define a custom control class
    const CustomControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-custom-controls');
        container.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
          margin-right: 10px;
        `;
        
        // Create fullscreen button
        const fullscreenBtn = L.DomUtil.create('div', 'leaflet-custom-button', container);
        fullscreenBtn.innerHTML = isFullScreen 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
        fullscreenBtn.title = isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen';
        fullscreenBtn.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          color: #1f2937;
        `;
        
        // Create legend button
        const legendBtn = L.DomUtil.create('div', 'leaflet-custom-button', container);
        legendBtn.innerHTML = showLegend 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        legendBtn.title = showLegend ? 'Hide Legend' : 'Show Legend';
        legendBtn.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          color: #1f2937;
        `;
        
        // Add hover style to document head
        const style = document.createElement('style');
        style.innerHTML = `
          .leaflet-custom-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background-color: #f9fafb;
            color: #2563eb;
          }
          
          .leaflet-custom-button:active {
            transform: translateY(0);
            background-color: #e5e7eb;
          }
        `;
        document.head.appendChild(style);
        
        // Add event handlers to buttons
        L.DomEvent.on(fullscreenBtn, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          setIsFullScreenLocal(!isFullScreen);
          fullscreenBtn.innerHTML = !isFullScreen 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
          fullscreenBtn.title = !isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen';
        });
        
        L.DomEvent.on(legendBtn, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          setShowLegendLocal(!showLegend);
          legendBtn.innerHTML = !showLegend 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
          legendBtn.title = !showLegend ? 'Hide Legend' : 'Show Legend';
        });
        
        return container;
      }
    });
    
    // Create a new control and add it to the map
    controlRef.current = new CustomControl();
    map.addControl(controlRef.current);
    
    // Clean up function
    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
      }
    };
  }, [map, isFullScreen, showLegend, setIsFullScreen, setShowLegend]);
  
  return null;
};

export default MapButtons;