import imageCompression from 'browser-image-compression';

export async function compressAndConvertToWebP(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // If the library doesn't automatically change the extension/type to webp in some cases,
    // we can ensure it here. But browser-image-compression usually handles it.
    
    // Rename to .webp
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    return new File([compressedFile], newFileName, { type: 'image/webp' });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}
