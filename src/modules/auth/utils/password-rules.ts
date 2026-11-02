/** Reglas de la contraseña nueva: las mismas que valida el backend (ResetPasswordDto). */
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt ignora lo que pase de 72 bytes: más largo daría una falsa sensación de seguridad.
export const PASSWORD_MAX_BYTES = 72;

export type PasswordRule = { id: string; label: string; ok: boolean };

/** Bytes en UTF-8 (sin `TextEncoder`, que no existe en todos los entornos de prueba). */
function byteLength(value: string): number {
  try {
    return encodeURIComponent(value).replace(/%[0-9A-F]{2}/gi, "x").length;
  } catch {
    return value.length * 3;
  }
}

export function passwordRules(password: string): PasswordRule[] {
  return [
    { id: "length", label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`, ok: password.length >= PASSWORD_MIN_LENGTH },
    { id: "letters", label: "Letras y números", ok: /\p{L}/u.test(password) && /\d/.test(password) },
    { id: "max", label: `Máximo ${PASSWORD_MAX_BYTES} caracteres`, ok: byteLength(password) <= PASSWORD_MAX_BYTES },
  ];
}

export const isValidPassword = (password: string) => passwordRules(password).every((rule) => rule.ok);

/**
 * Lee el token del fragmento (`#token=...`) del enlace del correo. El fragmento no viaja al
 * servidor ni en el Referer; se borra de la barra de direcciones en cuanto se lee.
 */
export function readResetToken(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("token");
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}
