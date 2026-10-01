/**
 * BinSync High-Performance Image Optimization Utility
 * 
 * Compresses camera frames and uploaded images to optimal dimensions (max 800px)
 * and WebP/JPEG formats (~20-40 KB) before cloud storage or database persistence.
 * Prevents Firestore 1MB document limit violations, LocalStorage quota crashes,
 * and speeds up mobile uploads by over 90%.
 */

export interface OptimizedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}

/**
 * Resizes and compresses an image Blob, File, or Data URL.
 */
export async function optimizeImage(
  fileOrBlobOrUrl: Blob | File | string,
  maxDimension = 800,
  quality = 0.78
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    let sourceUrl = '';
    let shouldRevoke = false;

    if (typeof fileOrBlobOrUrl === 'string') {
      sourceUrl = fileOrBlobOrUrl;
    } else {
      sourceUrl = URL.createObjectURL(fileOrBlobOrUrl);
      shouldRevoke = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          width = 800;
          height = 600;
        }

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw white background in case of transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw scaled image
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let mimeType = 'image/webp';
        let dataUrl = canvas.toDataURL(mimeType, quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        canvas.toBlob(
          (blob) => {
            if (shouldRevoke) {
              URL.revokeObjectURL(sourceUrl);
            }

            if (blob) {
              const sizeKb = Math.round(blob.size / 1024);
              resolve({
                blob,
                dataUrl,
                width,
                height,
                sizeKb,
              });
            } else {
              // Fallback with dataUrl
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const fallbackBlob = new Blob([ab], { type: mimeString });
              resolve({
                blob: fallbackBlob,
                dataUrl,
                width,
                height,
                sizeKb: Math.round(fallbackBlob.size / 1024),
              });
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        if (shouldRevoke) {
          URL.revokeObjectURL(sourceUrl);
        }
        reject(err);
      }
    };

    img.onerror = () => {
      if (shouldRevoke) {
        URL.revokeObjectURL(sourceUrl);
      }
      reject(new Error('Failed to load image for optimization'));
    };

    img.src = sourceUrl;
  });
}
