import type { DocumentType, Identification, IdentificationPayload } from "@/apis/interfaces/collaborator";
import { toOptions } from "@/utils/to-options";

// Identificación y contacto (v2.1, A1–A4). Mismas reglas que el backend (person-identification.ts):
// el front valida para corregir sin perder lo escrito, pero el backend manda.

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  CC: "Cédula de ciudadanía",
  TI: "Tarjeta de identidad",
  CE: "Cédula de extranjería",
  PPT: "Permiso por protección temporal",
  PA: "Pasaporte",
};

export const DOCUMENT_TYPE_OPTIONS = toOptions(DOCUMENT_TYPE_LABEL);

/** Sugeridas en el campo; se acepta cualquier otra. */
export const COMMON_NATIONALITIES = ["Colombiana", "Venezolana", "Ecuatoriana", "Peruana"];

export const NATIONALITY_MAX_LENGTH = 60;

const NUMERIC_DOCUMENTS = new Set<DocumentType>(["CC", "TI", "CE"]);
const NUMERIC_DOCUMENT = /^\d{5,15}$/;
const ALPHANUMERIC_DOCUMENT = /^[A-Z0-9]{5,20}$/;
const PHONE = /^\+?\d{7,15}$/;
const INSTITUTIONAL_CODE = /^[A-Za-z0-9-]{1,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "1.090.123.456" y " 1090123456 " son el mismo documento. */
export function normalizeDocumentNumber(value: string) {
  return value.replace(/[\s.-]/g, "").toUpperCase();
}

/** "(+57) 300-123 4567" → "+573001234567". */
export function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "");
}

/** Lo que se edita en los formularios: todo como texto. */
export type IdentificationForm = {
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  nationality: string;
  alternateEmail: string;
  institutionalCode: string;
};

export type IdentificationErrors = Partial<Record<keyof IdentificationForm, string>>;

export function toIdentificationForm(person?: Partial<Identification> | null): IdentificationForm {
  return {
    documentType: person?.documentType ?? "CC",
    documentNumber: person?.documentNumber ?? "",
    phone: person?.phone ?? "",
    nationality: person?.nationality ?? "Colombiana",
    alternateEmail: person?.alternateEmail ?? "",
    institutionalCode: person?.institutionalCode ?? "",
  };
}

export function documentNumberError(type: DocumentType, value: string): string | null {
  const number = normalizeDocumentNumber(value);
  if (!number) return "El número de documento es obligatorio.";
  if (NUMERIC_DOCUMENTS.has(type)) {
    return NUMERIC_DOCUMENT.test(number) ? null : "Solo dígitos, entre 5 y 15.";
  }
  return ALPHANUMERIC_DOCUMENT.test(number) ? null : "Entre 5 y 20 letras o dígitos.";
}

/** Errores por campo; vacío si es válido. `mainEmail`: el correo alterno no puede ser el mismo. */
export function validateIdentification(form: IdentificationForm, mainEmail?: string): IdentificationErrors {
  const errors: IdentificationErrors = {};
  const documentError = documentNumberError(form.documentType, form.documentNumber);
  if (documentError) errors.documentNumber = documentError;

  const phone = normalizePhone(form.phone);
  if (!phone) errors.phone = "El teléfono es obligatorio.";
  else if (!PHONE.test(phone)) errors.phone = "Entre 7 y 15 dígitos; puede empezar con +.";

  const nationality = form.nationality.trim();
  if (!nationality) errors.nationality = "La nacionalidad es obligatoria.";
  else if (nationality.length > NATIONALITY_MAX_LENGTH) {
    errors.nationality = `Máximo ${NATIONALITY_MAX_LENGTH} caracteres.`;
  }

  const alternateEmail = form.alternateEmail.trim().toLowerCase();
  if (alternateEmail && !EMAIL.test(alternateEmail)) errors.alternateEmail = "Correo inválido.";
  else if (alternateEmail && mainEmail && alternateEmail === mainEmail.trim().toLowerCase()) {
    errors.alternateEmail = "Debe ser distinto del correo principal.";
  }

  const code = form.institutionalCode.trim();
  if (code && !INSTITUTIONAL_CODE.test(code)) {
    errors.institutionalCode = "Hasta 20 letras, dígitos o guiones.";
  }
  return errors;
}

export function hasErrors(errors: IdentificationErrors) {
  return Object.keys(errors).length > 0;
}

export function toIdentificationPayload(form: IdentificationForm): IdentificationPayload {
  return {
    documentType: form.documentType,
    documentNumber: normalizeDocumentNumber(form.documentNumber),
    phone: normalizePhone(form.phone),
    nationality: form.nationality.trim(),
    alternateEmail: form.alternateEmail.trim().toLowerCase() || null,
    institutionalCode: form.institutionalCode.trim() || null,
  };
}

/** "CC 1090123456" para listados; "Sin documento" si falta. */
export function formatDocument(person: Pick<Identification, "documentType" | "documentNumber">) {
  return person.documentType && person.documentNumber
    ? `${person.documentType} ${person.documentNumber}`
    : "Sin documento";
}
