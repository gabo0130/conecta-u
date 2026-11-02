/**
 * Abre en otra pestaña un archivo descargado con el token (certificados, reportes). Si el
 * navegador bloquea la ventana emergente, lo descarga con su nombre.
 */
export function openBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener");
  if (!opened) downloadUrl(url, fileName);
  // Se libera después: la pestaña nueva necesita la URL mientras carga.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, fileName);
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function downloadUrl(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Nombre del archivo en `Content-Disposition` (`filename*=` UTF-8 o `filename=`). */
export function fileNameFromDisposition(header: string | undefined, fallback: string) {
  if (!header) return fallback;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return fallback;
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1] : fallback;
}
