import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MobileCameraProps {
  onCapture: (imageData: string) => void;
  isCapturing?: boolean;
}

export default function MobileCamera({ onCapture, isCapturing = false }: MobileCameraProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const takePicture = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      
      const imageData = `data:image/jpeg;base64,${image.base64String}`;
      onCapture(imageData);
    } catch (error) {
      console.error('Camera error:', error);
      // Fallback to web camera if native fails
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          // Wait for video to load
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const imageData = canvas.toDataURL('image/jpeg');
              onCapture(imageData);
              stream.getTracks().forEach(track => track.stop());
            }
          };
        } catch (webError) {
          console.error('Web camera error:', webError);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      className="mobile-camera-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="camera-preview-area">
        <div className="camera-instructions">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Capture Attendance
          </h3>
          <p className="text-gray-600 mb-4">
            Position the student's face in the frame and tap the capture button
          </p>
        </div>
        
        <motion.button
          onClick={takePicture}
          disabled={isProcessing || isCapturing}
          className="capture-button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">📷</span>
              Take Photo
            </div>
          )}
        </motion.button>
        
        {isCapturing && (
          <div className="capturing-overlay">
            <div className="animate-pulse text-blue-600 font-medium">
              Analyzing face...
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}