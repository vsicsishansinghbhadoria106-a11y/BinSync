import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

/**
 * Compresses an image File or Blob to ensure it remains lightweight (typically 35KB - 80KB),
 * preventing Firebase Storage limits and Firestore document size limit issues.
 */
export async function compressImage(
  fileOrBlob: Blob | File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.78
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve) => {
    // If not an image or SVG, read directly as data URL
    if (fileOrBlob.type && !fileOrBlob.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        resolve({ dataUrl, blob: fileOrBlob });
      };
      reader.onerror = () => resolve({ dataUrl: '', blob: fileOrBlob });
      reader.readAsDataURL(fileOrBlob);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result as string, blob: fileOrBlob });
        reader.readAsDataURL(fileOrBlob);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.toBlob(
        (blob) => {
          resolve({
            dataUrl,
            blob: blob || fileOrBlob,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, blob: fileOrBlob });
      reader.readAsDataURL(fileOrBlob);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image Blob or File to Firebase Storage and returns the download URL.
 * Resiliently compresses the image first. If Firebase Storage bucket permissions or
 * network rules reject the upload, it seamlessly falls back to the compressed data URL,
 * guaranteeing reports and cleanup proofs are never blocked.
 */
export async function uploadImageToStorage(
  fileOrBlob: Blob | File,
  folder: 'reports' | 'cleanups' = 'reports'
): Promise<string> {
  // Always compress image first to keep payload under 80KB
  const { dataUrl, blob: compressedBlob } = await compressImage(fileOrBlob);

  const timestamp = Date.now();
  const userId = auth.currentUser?.uid || 'user';
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const filename = `${folder}/${userId}_${timestamp}_${randomSuffix}.jpg`;

  // If Firebase Storage is initialized, attempt upload with timeout
  if (storage && storage.app) {
    try {
      const storageRef = ref(storage, filename);
      const uploadPromise = uploadBytes(storageRef, compressedBlob, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedBy: userId,
          timestamp: new Date().toISOString(),
        },
      });

      // 3.5s timeout prevents hanging uploads when storage bucket is unconfigured
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timeout')), 3500)
      );

      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error: any) {
      // Gracefully fall back to the optimized compressed image without throwing or disrupting the user
      console.warn('Storage fallback applied (using compressed proof image):', error?.message || error);
      return dataUrl;
    }
  }

  return dataUrl;
}
