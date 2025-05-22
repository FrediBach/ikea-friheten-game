import React from 'react';
import { Rotation } from '@/types/game';

// SVG representations of different sofa types
export const SofaSingle: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="5" y="5" width="30" height="30" rx="2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <rect x="10" y="10" width="20" height="20" rx="1" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="5" y="30" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="30" y="30" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M20,5 L20,0 M20,35 L20,40 M5,20 L0,20 M35,20 L40,20" 
          stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
  </svg>
);

export const SofaRectHorizontal: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="2" y="10" width="36" height="20" rx="2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <rect x="5" y="15" width="30" height="10" rx="1" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="2" y="25" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="33" y="25" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M20,10 L20,0 M20,30 L20,40 M0,20 L2,20 M38,20 L40,20" 
          stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
    {/* Center connection point */}
    <line x1="20" y1="10" x2="20" y2="30" stroke="#1E40AF" strokeWidth="0.5" strokeDasharray="2,2" />
  </svg>
);

export const SofaRectVertical: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="10" y="2" width="20" height="36" rx="2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <rect x="15" y="5" width="10" height="30" rx="1" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="10" y="2" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="10" y="33" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M10,20 L0,20 M30,20 L40,20 M20,0 L20,2 M20,38 L20,40" 
          stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
    {/* Center connection point */}
    <line x1="10" y1="20" x2="30" y2="20" stroke="#1E40AF" strokeWidth="0.5" strokeDasharray="2,2" />
  </svg>
);

export const SofaL0: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M2,2 L38,2 L38,20 L20,20 L20,38 L2,38 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <path d="M5,5 L35,5 L35,17 L17,17 L17,35 L5,35 Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="2" y="33" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="33" y="5" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M20,2 L20,0 M38,10 L40,10" stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
    <circle cx="20" cy="20" r="3" fill="#93C5FD" stroke="#1E40AF" strokeWidth="0.5" />
  </svg>
);

export const SofaL90: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M2,2 L20,2 L20,20 L38,20 L38,38 L2,38 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <path d="M5,5 L17,5 L17,17 L35,17 L35,35 L5,35 Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="5" y="33" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="33" y="33" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M10,2 L10,0 M38,30 L40,30" stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
    <circle cx="20" cy="20" r="3" fill="#93C5FD" stroke="#1E40AF" strokeWidth="0.5" />
  </svg>
);

export const SofaL180: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M2,2 L38,2 L38,38 L20,38 L20,20 L2,20 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <path d="M5,5 L35,5 L35,35 L17,35 L17,17 L5,17 Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="5" y="5" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="33" y="33" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M20,38 L20,40 M2,10 L0,10" stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
    <circle cx="20" cy="20" r="3" fill="#93C5FD" stroke="#1E40AF" strokeWidth="0.5" />
  </svg>
);

export const SofaL270: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M2,2 L38,2 L38,20 L20,20 L20,38 L2,38 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
    <path d="M5,5 L35,5 L35,17 L17,17 L17,35 L5,35 Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
    <rect x="5" y="5" width="5" height="5" rx="1" fill="#1E40AF" />
    <rect x="5" y="33" width="5" height="5" rx="1" fill="#1E40AF" />
    {/* Connection indicators */}
    <path d="M30,2 L30,0 M2,30 L0,30" stroke="#1E40AF" strokeWidth="1" strokeDasharray="2,2" />
    <circle cx="20" cy="20" r="3" fill="#93C5FD" stroke="#1E40AF" strokeWidth="0.5" />
  </svg>
);

export const Door: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="5" y="2" width="30" height="36" rx="1" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
    <rect x="25" y="20" width="4" height="4" rx="2" fill="#B45309" />
    {/* Door swing indicator */}
    <path d="M5,20 C15,15 25,20 35,20" fill="none" stroke="#B45309" strokeWidth="1" strokeDasharray="2,2" />
    <path d="M20,2 L20,0" stroke="#B45309" strokeWidth="1" />
  </svg>
);

export const Wall: React.FC = () => (
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="0" y="0" width="40" height="40" fill="#1F2937" />
    <rect x="0" y="0" width="20" height="20" fill="#374151" />
    <rect x="20" y="20" width="20" height="20" fill="#374151" />
    {/* Brick pattern */}
    <line x1="0" y1="10" x2="40" y2="10" stroke="#111827" strokeWidth="0.5" />
    <line x1="0" y1="20" x2="40" y2="20" stroke="#111827" strokeWidth="0.5" />
    <line x1="0" y1="30" x2="40" y2="30" stroke="#111827" strokeWidth="0.5" />
    <line x1="10" y1="0" x2="10" y2="40" stroke="#111827" strokeWidth="0.5" />
    <line x1="20" y1="0" x2="20" y2="40" stroke="#111827" strokeWidth="0.5" />
    <line x1="30" y1="0" x2="30" y2="40" stroke="#111827" strokeWidth="0.5" />
  </svg>
);

// Component to render the appropriate sofa based on type
export const SofaRenderer: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'sofa-single':
      return <SofaSingle />;
    case 'sofa-rect-h':
      return <SofaRectHorizontal />;
    case 'sofa-rect-v':
      return <SofaRectVertical />;
    case 'sofa-l-0':
      return <SofaL0 />;
    case 'sofa-l-90':
      return <SofaL90 />;
    case 'sofa-l-180':
      return <SofaL180 />;
    case 'sofa-l-270':
      return <SofaL270 />;
    case 'door':
      return <Door />;
    case 'wall':
      return <Wall />;
    default:
      return null;
  }
};

// Component to render sofa selection buttons with rotation controls
export const SofaSelectionButton: React.FC<{ 
  type: string, 
  selected: boolean, 
  rotation?: Rotation,
  onRotate?: () => void,
  onClick: () => void 
}> = ({ type, selected, rotation = 0, onRotate, onClick }) => {
  let displayType = '';
  let sofaComponent: React.ReactNode;
  
  switch (type) {
    case 'single':
      displayType = 'Single';
      sofaComponent = <SofaSingle />;
      break;
    case 'rectangular':
      displayType = 'Rectangular';
      sofaComponent = rotation === 0 || rotation === 180 ? <SofaRectHorizontal /> : <SofaRectVertical />;
      break;
    case 'l-shaped':
      displayType = 'L-Shaped';
      if (rotation === 0) sofaComponent = <SofaL0 />;
      else if (rotation === 90) sofaComponent = <SofaL90 />;
      else if (rotation === 180) sofaComponent = <SofaL180 />;
      else sofaComponent = <SofaL270 />;
      break;
    default:
      sofaComponent = null;
  }

  // Format rotation for display
  const rotationDisplay = rotation > 0 ? ` (${rotation}°)` : '';
  
  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
        selected ? 'scale-105' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-full h-full">
          {sofaComponent}
        </div>
        
        {/* Rotation indicator */}
        {rotation > 0 && (
          <div className="absolute top-0 right-0 bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center text-[8px] font-bold">
            {rotation}°
          </div>
        )}
        
        {/* Quick rotate button */}
        {onRotate && (
          <div 
            className="absolute bottom-0 right-0 opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-xs font-medium text-center mt-1">
        {displayType}{rotationDisplay}
      </div>
    </div>
  );
};