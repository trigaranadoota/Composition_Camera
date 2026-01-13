
import React, { useState, useCallback, useEffect, useRef } from 'react';
import CameraPreview, { CameraPreviewHandle } from './components/CameraPreview';
import GoldenRatioOverlay from './components/GoldenRatioOverlay';
import GridView from './components/GridView';
import Controls from './components/Controls';
import { CameraConfig, OverlayOrientation } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<CameraConfig>({
    facingMode: 'environment',
    showSpiral: true,
    showGrid: false,
    orientation: 'top-left',
    timerSetting: 0,
    zoom: 1.0
  });

  const [flash, setFlash] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const timerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const cameraRef = useRef<CameraPreviewHandle>(null);

  // PWA & Connectivity Listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleCamera = () => {
    if (isRecording || countdown !== null) return;
    setConfig(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
      zoom: 1.0
    }));
  };

  const toggleSpiral = () => setConfig(prev => ({ ...prev, showSpiral: !prev.showSpiral }));
  const toggleGrid = () => setConfig(prev => ({ ...prev, showGrid: !prev.showGrid }));
  const setTimer = (val: 0 | 3 | 5 | 10) => setConfig(prev => ({ ...prev, timerSetting: val }));
  const setZoom = (val: number) => setConfig(prev => ({ ...prev, zoom: val }));
  const triggerFocus = () => cameraRef.current?.focus();

  const rotateOrientation = () => {
    const orientations: OverlayOrientation[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    const currentIndex = orientations.indexOf(config.orientation);
    const nextIndex = (currentIndex + 1) % orientations.length;
    setConfig(prev => ({ ...prev, orientation: orientations[nextIndex] }));
  };

  const executeCapture = useCallback(() => {
    if ((window as any).triggerCapture) {
      (window as any).triggerCapture();
    }
    setCountdown(null);
  }, []);

  const handleCapture = useCallback((blob: Blob) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 100);

    const url = URL.createObjectURL(blob);
    setLastPhoto(url);

    const link = document.createElement('a');
    link.href = url;
    link.download = `cinematic_photo_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleVideoComplete = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setLastPhoto(url);

    const link = document.createElement('a');
    link.href = url;
    link.download = `cinematic_video_${new Date().getTime()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const triggerCapture = () => {
    if (isRecording || countdown !== null) return;
    
    if (config.timerSetting > 0) {
      setCountdown(config.timerSetting);
      let count = config.timerSetting;
      countdownIntervalRef.current = window.setInterval(() => {
        count -= 1;
        if (count <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          executeCapture();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const toggleRecording = () => {
    if (countdown !== null) return;
    if (isRecording) {
      if ((window as any).stopRecording) (window as any).stopRecording();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if ((window as any).startRecording) (window as any).startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black select-none overflow-hidden touch-none flex flex-col">
      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-20 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-600 animate-ping' : 'bg-green-500'}`} />
            <span className="text-[12px] font-mono tracking-tighter uppercase opacity-80">
              {isRecording ? 'Recording' : 'Standby'}
            </span>
          </div>
          {isOffline && (
            <div className="flex items-center gap-1 opacity-60">
              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] uppercase font-mono text-red-400">Offline Mode</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          {deferredPrompt && (
            <button 
              onClick={installPWA}
              className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white/20 active:scale-95 transition-all"
            >
              Install App
            </button>
          )}
          <div className="text-[12px] font-mono opacity-80 uppercase tracking-widest">
            {config.facingMode} • {config.zoom.toFixed(1)}x
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 pointer-events-none">
          <span className="text-[12rem] font-mono font-bold text-white animate-ping">
            {countdown}
          </span>
        </div>
      )}

      {/* Main Camera View */}
      <div className="flex-1 relative">
        <CameraPreview 
          ref={cameraRef}
          facingMode={config.facingMode} 
          zoom={config.zoom}
          onCapture={handleCapture}
          onVideoComplete={handleVideoComplete}
        >
          <GridView visible={config.showGrid} />
          <GoldenRatioOverlay 
            orientation={config.orientation} 
            visible={config.showSpiral} 
          />
        </CameraPreview>
      </div>

      {/* Controls */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <Controls 
          onCapture={triggerCapture}
          onToggleRecording={toggleRecording}
          onRotateOverlay={rotateOrientation}
          onToggleSpiral={toggleSpiral}
          onToggleGrid={toggleGrid}
          onToggleCamera={toggleCamera}
          onSetTimer={setTimer}
          onSetZoom={setZoom}
          onFocus={triggerFocus}
          showSpiral={config.showSpiral}
          showGrid={config.showGrid}
          timerSetting={config.timerSetting}
          zoom={config.zoom}
          orientation={config.orientation}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
        />
      </div>

      {/* Flash Effect Overlay */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-75" />
      )}

      {/* Last Capture Thumbnail */}
      {lastPhoto && (
        <div 
          className="absolute bottom-[calc(8rem+env(safe-area-inset-bottom))] left-8 w-14 h-14 rounded-lg border-2 border-white/30 overflow-hidden z-30 shadow-2xl transition-transform active:scale-110"
        >
          {lastPhoto.includes('video') ? (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
            </div>
          ) : (
            <img src={lastPhoto} className="w-full h-full object-cover" alt="Capture" />
          )}
        </div>
      )}

      {/* Side Label */}
      <div className="absolute top-1/2 -right-12 -rotate-90 z-20 pointer-events-none">
        <span className="px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono">
          Cinema Grade Optic
        </span>
      </div>
    </div>
  );
};

export default App;
