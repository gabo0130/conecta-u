import { fireEvent, render, screen } from "@testing-library/react";
import { apiClient } from "@/apis/client";
import { httpError } from "@/modules/analysis/test-fixtures";
import { DETAIL, RECOMMENDATION } from "@/modules/recommendations/test-fixtures";
import { RecommendationDetailModal } from "./RecommendationDetailModal";

jest.mock("@/apis/client", () => ({ apiClient: { get: jest.fn() } }));

const get = jest.mocked(apiClient.get);

beforeEach(() => get.mockReset());

function renderModal(onClose = jest.fn()) {
  render(
    <RecommendationDetailModal
      projectId="p1"
      recommendation={RECOMMENDATION}
      profileName="Desarrollador de Hardware e IoT"
      onClose={onClose}
    />,
  );
  return onClose;
}

describe("RecommendationDetailModal", () => {
  it("explica habilidades, experiencia, disponibilidad, semántica y pesos", async () => {
    get.mockResolvedValue({ data: DETAIL });
    renderModal();

    expect(get).toHaveBeenCalledWith("/projects/p1/recommendations/r1");
    expect(await screen.findByText("Arduino")).toBeInTheDocument();
    expect(screen.getByText(/Pide Intermedio · tiene Avanzado \(20 meses\)/)).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Monitor – Semillero de prueba (12 meses)")).toBeInTheDocument();
    expect(screen.getByText(/Ofrece 10 h\/semana; el perfil pide al menos 8/)).toBeInTheDocument();
    expect(screen.getByText(/Similitud 0.68/)).toBeInTheDocument();
    // 0,8 de habilidades × peso 0,5 = 40 puntos.
    expect(screen.getByText("+40.0 pts")).toBeInTheDocument();
    expect(screen.getByText(/peso 50 %/)).toBeInTheDocument();
  });

  it("si no hubo embeddings dice que la afinidad no estuvo disponible", async () => {
    get.mockResolvedValue({
      data: {
        ...DETAIL,
        breakdown: {
          ...DETAIL.breakdown,
          semantic: { similarity: null },
          weights: { skills: 0.625, semantic: 0, experience: 0.1875, availability: 0.1875 },
        },
      },
    });
    renderModal();

    expect(await screen.findByText(/No estuvo disponible para esta persona/)).toBeInTheDocument();
    expect(screen.getByText("No se usó")).toBeInTheDocument();
  });

  it("muestra el error de carga con Reintentar", async () => {
    get.mockRejectedValueOnce(httpError(404, "Recomendación no encontrada"));
    get.mockResolvedValueOnce({ data: DETAIL });
    renderModal();

    expect(await screen.findByText("Recomendación no encontrada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Arduino")).toBeInTheDocument();
  });

  it("es de solo lectura: solo tiene Cerrar", async () => {
    get.mockResolvedValue({ data: DETAIL });
    const onClose = renderModal();
    await screen.findByText("Arduino");

    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
