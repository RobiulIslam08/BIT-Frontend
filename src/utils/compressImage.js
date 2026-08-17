// ============================================
// Compress images so large phone photos upload reliably
// ============================================

const TARGET_BYTES = 1.6 * 1024 * 1024;
const MAX_EDGE = 2000;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this image. Please use JPG, PNG, or WebP.'));
    };
    img.src = url;
  });

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });

export async function compressImageFile(file, maxBytes = TARGET_BYTES) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.82;
  let blob = await canvasToBlob(canvas, quality);
  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.12;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob || blob.size > maxBytes) {
    throw new Error('Could not compress this photo enough. Please take a closer photo or use a smaller file.');
  }
  const name = (file.name || 'document').replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
}

/** Images are compressed. PDFs over ~3.5MB should be photographed instead. */
export async function prepareTabbyUploadFile(file) {
  if (!file) return null;
  const type = file.type || '';
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
  const isImage = type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (isPdf) {
    if (file.size > 3.5 * 1024 * 1024) {
      throw new Error('This PDF is too large. Please take a photo of the document instead — photos are compressed automatically.');
    }
    return file;
  }
  if (!isImage) {
    throw new Error('Use PDF, JPG, PNG, or WebP.');
  }
  if (file.size <= TARGET_BYTES && (type === 'image/jpeg' || type === 'image/jpg')) {
    return file;
  }
  return compressImageFile(file);
}
