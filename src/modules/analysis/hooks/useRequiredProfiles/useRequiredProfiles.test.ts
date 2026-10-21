import { act, renderHook } from "@testing-library/react";
import { apiClient } from "@/apis/client";
import type { CreateRequiredProfilePayload } from "@/apis/interfaces/analysis";
import { MANUAL_PROFILE, timeoutError } from "../../test-fixtures";
import { ProfileTimeoutError } from "../../utils/analysis-view";
import { useRequiredProfiles } from "./useRequiredProfiles";

const AI_CONFIG = { timeout: 60000, aiRequest: true };

jest.mock("@/apis/client", () => ({
  apiClient: { post: jest.fn(), patch: jest.fn() },
  AI_REQUEST_CONFIG: { timeout: 60000, aiRequest: true },
  isTimeoutError: jest.requireActual("@/apis/client").isTimeoutError,
}));

const post = jest.mocked(apiClient.post);
const patch = jest.mocked(apiClient.patch);

beforeEach(() => {
  post.mockReset().mockResolvedValue({ data: MANUAL_PROFILE });
  patch.mockReset().mockResolvedValue({ data: MANUAL_PROFILE });
});

const payload: CreateRequiredProfilePayload = {
  name: "Diseñador de interfaces",
  quantity: 1,
  priority: "MEDIA",
  skills: [{ skillId: "s1", minLevel: "INTERMEDIO", importance: "ALTA" }],
};

function setup() {
  const onChanged = jest.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useRequiredProfiles("p1", onChanged));
  return { result, onChanged };
}

describe("useRequiredProfiles", () => {
  it("crea un perfil manual esperando a la IA (embedding) y refresca el análisis", async () => {
    const { result, onChanged } = setup();

    await act(() => result.current.createProfile(payload));

    expect(post).toHaveBeenCalledWith("/projects/p1/required-profiles", payload, AI_CONFIG);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("editar nombre, descripción o habilidades espera a la IA", async () => {
    const { result, onChanged } = setup();

    await act(() => result.current.updateProfile("rp2", { name: "Otro nombre" }));

    expect(patch).toHaveBeenCalledWith("/projects/p1/required-profiles/rp2", { name: "Otro nombre" }, AI_CONFIG);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("editar solo la prioridad no usa la configuración de IA", async () => {
    const { result } = setup();

    await act(() => result.current.updateProfile("rp2", { priority: "ALTA" }));

    expect(patch).toHaveBeenCalledWith("/projects/p1/required-profiles/rp2", { priority: "ALTA" }, undefined);
  });

  it("descarta un perfil con active: false (sin esperar a la IA)", async () => {
    const { result } = setup();

    await act(() => result.current.discardProfile("rp1"));

    expect(patch).toHaveBeenCalledWith("/projects/p1/required-profiles/rp1", { active: false }, undefined);
  });

  it("si se corta por tiempo, refresca la lista (pudo guardarse) y avisa", async () => {
    post.mockRejectedValue(timeoutError());
    const { result, onChanged } = setup();

    let caught: unknown;
    await act(async () => {
      caught = await result.current.createProfile(payload).catch((error: unknown) => error);
    });
    expect(caught).toBeInstanceOf(ProfileTimeoutError);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("con otro error no refresca y lo propaga", async () => {
    patch.mockRejectedValue(new Error("Perfil no encontrado"));
    const { result, onChanged } = setup();

    await expect(act(() => result.current.discardProfile("x"))).rejects.toThrow("Perfil no encontrado");
    expect(onChanged).not.toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });
});
