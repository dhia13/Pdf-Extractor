import { PDFDocument } from "pdf-lib";

export function createImageBlob(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageBlob = new Blob([reader.result], { type: file.type });
      resolve(imageBlob);
    };
    reader.readAsArrayBuffer(file);
  });
}
export function getImageSize(blob) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      resolve({ width, height });
    };
    img.src = URL.createObjectURL(blob);
  });
}
