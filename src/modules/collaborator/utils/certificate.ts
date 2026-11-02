import type { BadgeTone } from "@/components/atoms/Badge/Badge";
import type { Experience, ExperienceType } from "@/apis/interfaces/collaborator";

/** v2.2, E8 (RF4): mismas reglas que el backend (`experience-certificate.ts`). */
export const CERTIFICATE_REQUIRED_TYPES: readonly ExperienceType[] = ["LABORAL", "PRACTICA", "DOCENCIA"];
export const CERTIFICATE_MAX_BYTES = 2 * 1024 * 1024;
export const CERTIFICATE_ACCEPT = [".pdf", ".png", ".jpg", ".jpeg"];
export const CERTIFICATE_HINT = "PDF, PNG o JPG de hasta 2 MB.";
export const CERTIFICATE_REQUIRED_MESSAGE =
  "Adjunta el certificado que soporta esta experiencia (laboral, de práctica o de docencia).";

export const requiresCertificate = (type: ExperienceType) => CERTIFICATE_REQUIRED_TYPES.includes(type);

export type CertificateBadge = { label: string; tone: BadgeTone };

/** Estado del soporte de una experiencia para mostrar junto a ella; `null` si no aplica. */
export function getCertificateBadge(experience: Pick<Experience, "certificate" | "certificateRequired">): CertificateBadge | null {
  if (experience.certificate) return { label: "Certificado adjunto", tone: "green" };
  if (experience.certificateRequired) return { label: "Falta certificado", tone: "amber" };
  return null;
}

export function countPendingCertificates(experiences: Pick<Experience, "certificate" | "certificateRequired">[]) {
  return experiences.filter((experience) => experience.certificateRequired && !experience.certificate).length;
}

export type CertificateMime = "application/pdf" | "image/png" | "image/jpeg";

export const INVALID_CERTIFICATE_FILE =
  "El archivo no es un PDF, PNG o JPG válido. Revisa que no sea otro tipo de archivo con la extensión cambiada.";

const SIGNATURES: { mime: CertificateMime; bytes: number[] }[] = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
];

function readHead(file: Blob, length: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el archivo."));
    reader.readAsArrayBuffer(file.slice(0, length));
  });
}

/** Tipo real del archivo por su firma (las mismas reglas que el backend); `null` si no es válido. */
export async function detectCertificateType(file: Blob): Promise<CertificateMime | null> {
  const head = await readHead(file, 8);
  const match = SIGNATURES.find(({ bytes }) => bytes.every((byte, index) => head[index] === byte));
  return match?.mime ?? null;
}

/** Validación para `FileDropzone`: bloquea un archivo falso antes de guardar nada. */
export async function validateCertificateFile(file: File): Promise<string | null> {
  return (await detectCertificateType(file)) ? null : INVALID_CERTIFICATE_FILE;
}
