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
