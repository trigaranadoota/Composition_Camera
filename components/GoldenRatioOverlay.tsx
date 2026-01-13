
import React from 'react';
import { OverlayOrientation } from '../types';

interface GoldenRatioOverlayProps {
  orientation: OverlayOrientation;
  visible: boolean;
}

/**
 * Renders an SVG Fibonacci spiral and bounding boxes.
 * Enhanced visibility for professional cinematic composition.
 */
const GoldenRatioOverlay: React.FC<GoldenRatioOverlayProps> = ({ orientation, visible }) => {
  if (!visible) return null;

  // Rotation based on orientation
  const getRotation = () => {
    switch (orientation) {
      case 'top-right': return 'rotate-90';
      case 'bottom-right': return 'rotate-180';
      case 'bottom-left': return 'rotate-[270deg]';
      case 'top-left': default: return 'rotate-0';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none transition-all duration-500 transform ${getRotation()}`}>
      <svg
        viewBox="0 0 1000 618"
        className="w-full h-full opacity-100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fibonacci Rectangles */}
        <g stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" fill="none">
          {/* Main Box */}
          <rect x="0" y="0" width="1000" height="618" />
          
          {/* Subdivisions */}
          {/* Box 1 (Square) */}
          <rect x="0" y="0" width="618" height="618" />
          
          {/* Box 2 (Square within remaining space) */}
          <rect x="618" y="0" width="382" height="382" />
          
          {/* Box 3 */}
          <rect x="764" y="382" width="236" height="236" />
          
          {/* Box 4 */}
          <rect x="618" y="472" width="146" height="146" />
          
          {/* Box 5 */}
          <rect x="618" y="382" width="90" height="90" />
        </g>

        {/* Fibonacci Spiral */}
        <path
          d="M 0 618 A 618 618 0 0 1 618 0 A 382 382 0 0 1 1000 382 A 236 236 0 0 1 764 618 A 146 146 0 0 1 618 472 A 90 90 0 0 1 708 382"
          stroke="#ffff00"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Focal Point Indicator */}
        <circle cx="708" cy="472" r="6" fill="#ffff00" />
        <circle cx="708" cy="472" r="10" stroke="#ffff00" strokeWidth="1" fill="none" className="animate-pulse" />
      </svg>
    </div>
  );
};

export default GoldenRatioOverlay;
