import axios from 'axios';

const BATCH_SIZE = 10;

export async function uploadImagesInBatches({
  galleryId,
  images,
  coverImage,
  token,
  onProgress
}) {
  let completedImages = 0;

  for (let start = 0; start < images.length; start += BATCH_SIZE) {
    const batch = images.slice(start, start + BATCH_SIZE);
    const formData = new FormData();
    batch.forEach(image => formData.append('images', image));

    if (coverImage && batch.some(image => image.name === coverImage)) {
      formData.append('coverOriginalName', coverImage);
    }

    await axios.post(`/api/gallery/${encodeURIComponent(galleryId)}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        const batchFraction = event.loaded / event.total;
        const overallProgress = (
          (completedImages + batchFraction * batch.length) / images.length
        ) * 100;
        onProgress(Math.min(99, Math.round(overallProgress)));
      }
    });

    completedImages += batch.length;
    onProgress?.(Math.round((completedImages / images.length) * 100));
  }
}
