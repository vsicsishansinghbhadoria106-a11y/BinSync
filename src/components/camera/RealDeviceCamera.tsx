import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, SwitchCamera, X, RotateCcw, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface RealDeviceCameraProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoConfirmed: (blob: Blob, dataUrl: string) => void;
  title?: string;
}

export const RealDeviceCamera: React.FC<RealDeviceCameraProps> = ({
  isOpen,
  onClose,
  onPhotoConfirmed,
  title = 'Real Device Camera',
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Captured frame state
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [shutterEffect, setShutterEffect] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Stop active stream utility
  const stopCurrentStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      activeStreamRef.current = null;
    }
    setStream(null);
  }, []);

  // Check if multiple camera devices exist (front & back)
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {
          setHasMultipleCameras(true); // default to showing flip button on mobile
        });
    }
  }, []);

  // Start real device camera feed
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsLoading(true);
      setErrorMessage(null);
      stopCurrentStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Unable to access the camera. Please check your camera permissions and try again.');
        setIsLoading(false);
        return;
      }

      try {
        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch (firstErr: any) {
          // Fallback if specific ideal facingMode is rejected by laptop/desktop webcam
          if (
            firstErr?.name === 'OverconstrainedError' ||
            firstErr?.name === 'ConstraintNotSatisfiedError'
          ) {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } else {
            throw firstErr;
          }
        }

        activeStreamRef.current = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch((playErr) => {
            console.warn('Video element play() was deferred:', playErr);
          });
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Real device camera error:', err);
        stopCurrentStream();
        setIsLoading(false);

        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings.');
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setErrorMessage('No camera was detected on this device.');
        } else {
          setErrorMessage('Unable to access the camera. Please check your camera permissions and try again.');
        }
      }
    },
    [stopCurrentStream]
  );

  // Sync stream to video element when stream or video ref updates
  useEffect(() => {
    if (videoRef.current && stream && !capturedPreviewUrl) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedPreviewUrl]);

  // Boot or stop camera based on modal state
  useEffect(() => {
    if (isOpen && !capturedPreviewUrl) {
      startCamera(facingMode);
    }

    return () => {
      stopCurrentStream();
    };
  }, [isOpen, facingMode, startCamera, stopCurrentStream, capturedPreviewUrl]);

  // Flip front/rear camera
  const handleToggleFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame into actual canvas and blob
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    setShutterEffect(true);
    setTimeout(() => setShutterEffect(false), 150);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreviewUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
        }
      },
      'image/jpeg',
      0.92
    );

    // Pause real video while reviewing
    stopCurrentStream();
  };

  // Retake photo: clear captured frame and restart real camera stream
  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
    startCamera(facingMode);
  };

  // Confirm photo: pass blob & url to caller
  const handleConfirmPhoto = () => {
    if (capturedPreviewUrl) {
      // If blob was generated, use it; otherwise create blob from dataUrl
      if (capturedBlob) {
        onPhotoConfirmed(capturedBlob, capturedPreviewUrl);
      } else {
        fetch(capturedPreviewUrl)
          .then((res) => res.blob())
          .then((blob) => onPhotoConfirmed(blob, capturedPreviewUrl))
          .catch(() => {
            onPhotoConfirmed(new Blob([]), capturedPreviewUrl);
          });
      }
      handleClose();
    }
  };

  const handleClose = () => {
    stopCurrentStream();
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col aspect-3/4 sm:aspect-4/3 max-h-[92vh]">
        {/* Top Header Controls Bar */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-white text-xs font-bold tracking-wider uppercase drop-shadow-md">
              {capturedPreviewUrl ? 'Photo Preview' : title}
            </h3>
            {!capturedPreviewUrl && (
              <span className="text-[10px] text-white/80 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xs">
                {facingMode === 'environment' ? 'Rear' : 'Front'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-95 cursor-pointer"
            title="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shutter Flash Animation */}
        {shutterEffect && (
          <div className="absolute inset-0 z-40 bg-white animate-out fade-out duration-150 pointer-events-none" />
        )}

        {/* Camera Feed or Captured Frame Area */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {capturedPreviewUrl ? (
            /* Real Captured Image Frame Preview */
            <img
              src={capturedPreviewUrl}
              alt="Captured frame"
              className="w-full h-full object-cover"
            />
          ) : errorMessage ? (
            /* Error & Permission Handling */
            <div className="p-6 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white text-base font-bold">Camera Access Issue</h4>
                <p className="text-white/80 text-xs leading-relaxed">{errorMessage}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* REAL DEVICE LIVE CAMERA STREAM */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-20 space-y-2">
                  <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-xs font-medium">Opening camera hardware...</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Camera Action Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-3">
          {capturedPreviewUrl ? (
            /* Review Captured Frame: Retake or Use Photo */
            <div className="w-full flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 max-w-[160px] py-3 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 max-w-[180px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Use Photo</span>
              </button>
            </div>
          ) : !errorMessage ? (
            /* LIVE CAMERA CONTROLS: Flip Camera + Capture ( ● ) */
            <div className="w-full flex items-center justify-between max-w-sm px-4">
              {/* Flip camera button */}
              <button
                type="button"
                onClick={handleToggleFacing}
                disabled={isLoading}
                className="p-3.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer disabled:opacity-50"
                title={`Switch to ${facingMode === 'environment' ? 'Front' : 'Rear'} Camera`}
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              {/* Big Circular Capture Shutter ( ● ) */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={isLoading}
                className="w-18 h-18 rounded-full border-4 border-white bg-white/30 hover:bg-white/40 active:scale-90 transition-all flex items-center justify-center shadow-2xl group cursor-pointer disabled:opacity-50"
                title="Capture Photo"
              >
                <div className="w-13 h-13 rounded-full bg-white group-hover:scale-95 transition-transform flex items-center justify-center shadow-inner">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-red-600" />
                </div>
              </button>

              {/* Empty placeholder to balance layout or close */}
              <button
                type="button"
                onClick={handleClose}
                className="p-3.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
