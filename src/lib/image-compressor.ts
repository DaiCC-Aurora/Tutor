const MAX_SIZE = 5242880; // 5MB

export interface CompressOptions {
  maxSize?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * 压缩图片到指定大小以下
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxSize = MAX_SIZE,
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1920,
  } = options;

  // 如果文件已经小于限制，直接返回
  if (file.size <= maxSize) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 调整尺寸
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 压缩并检查大小
      let currentQuality = quality;
      const blobPromise = new Promise<Blob>((resolveBlob, rejectBlob) => {
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                rejectBlob(new Error('Compression failed'));
                return;
              }

              if (blob.size <= maxSize || currentQuality <= 0.1) {
                resolveBlob(blob);
              } else {
                currentQuality -= 0.1;
                tryCompress();
              }
            },
            file.type,
            currentQuality
          );
        };
        tryCompress();
      });

      blobPromise.then(resolve).catch(reject);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File, maxSize: number = MAX_SIZE): {
  valid: boolean;
  message?: string;
} {
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }
  return { valid: true };
}
