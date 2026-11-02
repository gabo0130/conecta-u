import type { Invitation } from "@/apis/interfaces/invitations";
import { invitedLabel, lastSentByPerson, summarizeSend } from "./invitation-view";

const invitation = (overrides: Partial<Invitation>): Invitation => ({
  id: "i",
  collaboratorId: "c1",
  requiredProfileId: "p1",
  profileName: "Backend",
  recipientName: "Ana",
  recipientEmail: "an***@ufps.edu.co",
  status: "ENVIADA",
  errorMessage: null,
  sentAt: "2026-11-03T15:00:00.000Z",
  ...overrides,
});

describe("invitation-view", () => {
  it("keeps the latest successful invitation per person", () => {
    const map = lastSentByPerson([
      invitation({ sentAt: "2026-11-01T10:00:00.000Z" }),
      invitation({ sentAt: "2026-11-04T10:00:00.000Z" }),
      invitation({ collaboratorId: "c2", status: "FALLIDA" }),
      invitation({ collaboratorId: null }),
    ]);
    expect(map.get("c1")).toBe("2026-11-04T10:00:00.000Z");
    expect(map.has("c2")).toBe(false);
    expect(invitedLabel(map.get("c1"))).toMatch(/^Convocada el 4/);
    expect(invitedLabel(undefined)).toBeNull();
  });

  it("summarizes sent, failed and skipped invitations", () => {
    expect(summarizeSend({ sent: 2, failed: 0, skipped: [], invitations: [] })).toEqual({
      tone: "success",
      message: "Se enviaron 2 convocatorias.",
    });
    const mixed = summarizeSend({
      sent: 1,
      failed: 1,
      skipped: [{ collaboratorId: "c3", name: "Luis", reason: "YA_CONVOCADA", message: "Ya fue convocada en las últimas 24 horas" }],
      invitations: [],
    });
    expect(mixed.tone).toBe("warning");
    expect(mixed.message).toBe(
      "Se envió 1 convocatoria. 1 no se pudo entregar: revisa el historial e inténtalo más tarde. Luis: ya fue convocada en las últimas 24 horas.",
    );
  });
});
