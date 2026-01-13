
import React from 'react';

interface GridViewProps {
  visible: boolean;
}

const GridView: React.FC<GridViewProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300">
      {/* Vertical Lines - Brighter opacity */}
      <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/70" />
      <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/70" />
      
      {/* Horizontal Lines - Brighter opacity */}
      <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/70" />
      <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/70" />
    </div>
  );
};

export default GridView;
