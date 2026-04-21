/**
 * Utility to compress images on the client side before uploading to Supabase.
 * This ensures the database stays lean and the website stays fast.
 */

export async function compressImage(file: File, isLogo: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Configuration
        const MAX_WIDTH = isLogo ? 600 : 1400; // Logos need less width but better clarity
        const QUALITY = isLogo ? 0.95 : 0.82; // Higher quality for logos
        
        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Failed to get canvas context');
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // For logos, we might want to preserve transparency (PNG)
        // For general photos, we use JPEG for better compression
        const outputType = isLogo && file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        const dataUrl = canvas.toDataURL(outputType, QUALITY);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
