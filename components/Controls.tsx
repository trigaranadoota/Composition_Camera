
import React from 'react';
import { OverlayOrientation } from '../types';

interface ControlsProps {
  onCapture: () => void;
  onToggleRecording: () => void;
  onRotateOverlay: () => void;
  onToggleSpiral: () => void;
  onToggleGrid: () => void;
  onToggleCamera: () => void;
  onSetTimer: (val: 0 | 3 | 5 | 10) => void;
  onSetZoom: (val: number) => void;
  onFocus: () => void;
  showSpiral: boolean;
  showGrid: boolean;
  timerSetting: number;
  zoom: number;
  orientation: OverlayOrientation;
  isRecording: boolean;
  recordingDuration: number;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Controls: React.FC<ControlsProps> = ({ 
  onCapture, 
  onToggleRecording,
  onRotateOverlay, 
  onToggleSpiral, 
  onToggleGrid,
  onToggleCamera,
  onSetTimer,
  onSetZoom,
  onFocus,
  showSpiral,
  showGrid,
  timerSetting,
  zoom,
  orientation,
  isRecording,
  recordingDuration
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 flex flex-col items-center z-20 pointer-events-none">
      
      {/* Zoom Slider */}
      <div className="w-full max-w-md flex items-center gap-4 mb-6 pointer-events-auto">
        <span className="text-[10px] font-mono text-white/50">1x</span>
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="0.1" 
          value={zoom} 
          onChange={(e) => onSetZoom(parseFloat(e.target.value))}
          className="flex-1 accent-white bg-white/20 h-1 rounded-full appearance-none cursor-pointer"
        />
        <span className="text-[10px] font-mono text-white/50">{zoom.toFixed(1)}x</span>
      </div>

      {/* Recording Duration HUD */}
      {isRecording && (
        <div className="absolute -top-20 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-red-500/50 flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-red-500 font-mono text-sm font-bold tracking-widest">
            {formatDuration(recordingDuration)}
          </span>
        </div>
      )}

      {/* Secondary Controls Grid */}
      <div className="flex justify-between w-full max-w-md mb-8 pointer-events-auto items-center gap-2">
        <button 
          onClick={onToggleCamera}
          disabled={isRecording}
          className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-all ${isRecording ? 'opacity-20' : 'opacity-100'}`}
          title="Switch Camera"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>

        <button 
          onClick={onFocus}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-all"
          title="Manual Focus"
        >
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m8-5h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </button>

        <button 
          onClick={() => onSetTimer(timerSetting === 0 ? 3 : timerSetting === 3 ? 5 : timerSetting === 5 ? 10 : 0)}
          className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-all ${timerSetting > 0 ? 'text-yellow-400' : 'text-white'}`}
          title="Camera Timer"
        >
          <div className="flex flex-col items-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {timerSetting > 0 && <span className="text-[8px] font-bold">{timerSetting}s</span>}
          </div>
        </button>

        <button 
          onClick={onToggleGrid}
          className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-all ${showGrid ? 'text-yellow-400' : 'text-white'}`}
          title="Toggle 3x3 Grid"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M6 4v16M12 4v16M18 4v16" /></svg>
        </button>

        <button 
          onClick={onToggleSpiral}
          className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-all ${showSpiral ? 'text-yellow-400' : 'text-white'}`}
          title="Toggle Fibonacci"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2" /></svg>
        </button>

        <button 
          onClick={onRotateOverlay}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-all"
          title="Rotate Composition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Primary Shutters */}
      <div className="pointer-events-auto flex items-center gap-8">
        {!isRecording && (
          <button 
            onClick={onCapture}
            className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-90 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white shadow-lg active:bg-gray-200 transition-colors" />
          </button>
        )}

        <button 
          onClick={onToggleRecording}
          className={`relative ${isRecording ? 'w-24 h-24' : 'w-20 h-20'} rounded-full border-4 ${isRecording ? 'border-red-500' : 'border-white/50'} flex items-center justify-center bg-transparent active:scale-90 transition-all duration-300`}
        >
          <div className={`transition-all duration-300 ${isRecording ? 'w-10 h-10 rounded-sm bg-red-600' : 'w-16 h-16 rounded-full bg-red-600 shadow-lg'}`} />
        </button>
      </div>

      <div className="mt-4 text-[10px] tracking-[0.2em] uppercase opacity-40 font-mono">
        CINEMA GRADE • {orientation.replace('-', ' ')}
      </div>
    </div>
  );
};

export default Controls;
