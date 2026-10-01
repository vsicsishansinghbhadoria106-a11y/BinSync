import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

/**
 * Uploads an image Blob or File to Firebase Storage and returns the public download URL.
 * If Firebase Storage is unavailable or errors, falls back to a high-fidelity data URL
 * so that the user's report is never blocked.
 */
export async function uploadImageToStorage(
  fileOrBlob: Blob | File,
  folder: 'reports' | 'cleanups' = 'reports'
): Promise<string> {
  const timestamp = Date.now();
  const userId = auth.currentUser?.uid || 'user';
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const extension = fileOrBlob.type === 'image/png' ? 'png' : fileOrBlob.type === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${folder}/${userId}_${timestamp}_${randomSuffix}.${extension}`;

  try {
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, fileOrBlob, {
      contentType: fileOrBlob.type || 'image/jpeg',
      customMetadata: {
        uploadedBy: userId,
        timestamp: new Date().toISOString(),
      },
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload notice (falling back to inline data URL):', error);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to data URL'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error reading captured image'));
      reader.readAsDataURL(fileOrBlob);
    });
  }
}
