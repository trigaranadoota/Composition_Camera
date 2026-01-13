
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

interface CameraPreviewProps {
  facingMode: 'user' | 'environment';
  zoom: number;
  onCapture?: (blob: Blob) => void;
  onVideoComplete?: (blob: Blob) => void;
  children?: React.ReactNode;
}

export interface CameraPreviewHandle {
  focus: () => void;
}

const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(({ facingMode, zoom, onCapture, onVideoComplete, children }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFocusRing, setShowFocusRing] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      setShowFocusRing(true);
      setTimeout(() => setShowFocusRing(false), 1000);
      
      // Attempt to re-apply constraints to trigger autofocus if available
      const track = stream?.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities() as any;
        if (capabilities.focusMode) {
          track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] } as any).catch(console.error);
        }
      }
    }
  }));

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera or microphone. Please check permissions.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Handle Zoom
  useEffect(() => {
    const track = stream?.getVideoTracks()[0];
    if (track) {
      const capabilities = track.getCapabilities() as any;
      if (capabilities.zoom) {
        track.applyConstraints({
          advanced: [{ zoom: zoom }]
        } as any).catch(err => console.warn("Zoom not supported:", err));
      }
    }
  }, [zoom, stream]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob && onCapture) {
            onCapture(blob);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [onCapture]);

  const startRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      if (onVideoComplete) onVideoComplete(blob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  }, [stream, onVideoComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    (window as any).triggerCapture = captureFrame;
    (window as any).startRecording = startRecording;
    (window as any).stopRecording = stopRecording;
  }, [captureFrame, startRecording, stopRecording]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="p-6 text-center z-50">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-white text-black rounded-full font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {showFocusRing && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-yellow-400 z-30 transition-all scale-110 opacity-70 animate-pulse">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-yellow-400" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-2 bg-yellow-400" />
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-yellow-400" />
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-yellow-400" />
        </div>
      )}

      <div className="absolute inset-0 z-10">
        {children}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

export default CameraPreview;
