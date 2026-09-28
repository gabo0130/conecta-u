import { AxiosError, AxiosHeaders } from "axios";
import { NETWORK_ERROR_MESSAGE, TIMEOUT_ERROR_MESSAGE, getErrorMessage } from "./get-error-message";

const FALLBACK = "No se pudo guardar el proyecto.";

function axiosError(options: { code?: string; status?: number; data?: unknown }) {
  const config = { headers: new AxiosHeaders() };
  const response =
    options.status !== undefined
      ? { status: options.status, statusText: "", headers: {}, config, data: options.data }
      : undefined;
  return new AxiosError("Network Error", options.code, config, undefined, response);
}

describe("getErrorMessage", () => {
  it("uses the message sent by the backend", () => {
    expect(getErrorMessage(axiosError({ status: 409, data: { message: "Correo ya registrado" } }), FALLBACK)).toBe(
      "Correo ya registrado",
    );
  });

  it("uses the first validation message when the backend sends a list", () => {
    expect(getErrorMessage(axiosError({ status: 400, data: { message: ["El título es obligatorio", "x"] } }), FALLBACK)).toBe(
      "El título es obligatorio",
    );
  });

  it("explains in Spanish a network failure instead of 'Network Error'", () => {
    expect(getErrorMessage(axiosError({ code: "ERR_NETWORK" }), FALLBACK)).toBe(NETWORK_ERROR_MESSAGE);
  });

  it("explains a timeout", () => {
    expect(getErrorMessage(axiosError({ code: "ECONNABORTED" }), FALLBACK)).toBe(TIMEOUT_ERROR_MESSAGE);
  });

  it("uses the fallback when the server answers without a message", () => {
    expect(getErrorMessage(axiosError({ status: 500, data: {} }), FALLBACK)).toBe(FALLBACK);
  });

  it("keeps the message of errors thrown by the app", () => {
    expect(getErrorMessage(new Error("Selecciona un archivo .xlsx"), FALLBACK)).toBe("Selecciona un archivo .xlsx");
  });

  it("uses the fallback for unknown values", () => {
    expect(getErrorMessage("boom", FALLBACK)).toBe(FALLBACK);
  });
});
