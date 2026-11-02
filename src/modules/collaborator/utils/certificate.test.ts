import { countPendingCertificates, getCertificateBadge, requiresCertificate } from "./certificate";

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
});
