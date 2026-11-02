import {
  countPendingCertificates,
  detectCertificateType,
  getCertificateBadge,
  INVALID_CERTIFICATE_FILE,
  requiresCertificate,
  validateCertificateFile,
} from "./certificate";

const certificate = { fileName: "c.pdf", mimeType: "application/pdf" as const, sizeBytes: 10, uploadedAt: "2026-11-02" };

describe("certificate", () => {
  it("lo exige solo para experiencia laboral, de práctica y de docencia", () => {
    expect(requiresCertificate("LABORAL")).toBe(true);
    expect(requiresCertificate("DOCENCIA")).toBe(true);
    expect(requiresCertificate("VOLUNTARIADO")).toBe(false);
  });

  it("muestra el estado del soporte y cuenta los pendientes", () => {
    expect(getCertificateBadge({ certificate, certificateRequired: true })).toEqual({ label: "Certificado adjunto", tone: "green" });
    expect(getCertificateBadge({ certificate: null, certificateRequired: true })).toEqual({ label: "Falta certificado", tone: "amber" });
    expect(getCertificateBadge({ certificate: null, certificateRequired: false })).toBeNull();
    expect(
      countPendingCertificates([
        { certificate: null, certificateRequired: true },
        { certificate, certificateRequired: true },
        { certificate: null, certificateRequired: false },
      ]),
    ).toBe(1);
  });

  it("reconoce el tipo real por la firma del archivo, no por la extensión", async () => {
    const pdf = new File(["%PDF-1.7 contenido"], "c.pdf");
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1])], "f.png");
    const jpg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "f.jpg");
    const fake = new File(["texto renombrado"], "falso.pdf");
    await expect(detectCertificateType(pdf)).resolves.toBe("application/pdf");
    await expect(detectCertificateType(png)).resolves.toBe("image/png");
    await expect(detectCertificateType(jpg)).resolves.toBe("image/jpeg");
    await expect(detectCertificateType(fake)).resolves.toBeNull();
    await expect(validateCertificateFile(fake)).resolves.toBe(INVALID_CERTIFICATE_FILE);
    await expect(validateCertificateFile(pdf)).resolves.toBeNull();
  });
});
