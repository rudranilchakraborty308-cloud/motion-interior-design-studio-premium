/**
 * Compresses and resizes an image file.
 * - PNG files keep PNG format to preserve transparency (important for logos).
 * - All other images are converted to JPEG at 0.82 quality for good balance.
 * - Max width: 1400px (sufficient for heroes, about images, etc.)
 */
export const compressImage = (file: File, maxWidth = 1400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isPng = file.type === 'image/png';
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        // Fill white background only for JPEG (PNG supports transparency)
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // PNG for logos (preserves transparency), JPEG for photos
        const dataUrl = isPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.82);

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image. Please try a different file.'));
    };

    reader.onerror = () => reject(new Error('Failed to read file. Please try again.'));
  });
};

/**
 * Compress specifically for logos — smaller size and preserves transparency.
 * Max width: 600px is more than enough for a logo and keeps the Base64 string small.
 */
export const compressLogo = (file: File): Promise<string> => {
  return compressImage(file, 600);
};

/**
 * Compress specifically for portfolio thumbnails — smaller size for faster loading.
 */
export const compressPortfolioImage = (file: File): Promise<string> => {
  return compressImage(file, 900);
};
