"use client";

import { useState } from "react";
import { apiClient } from "@/apis/client";
import type { ImportCollaboratorsResult } from "@/apis/interfaces/admin";

const TEMPLATE_FILE_NAME = "Plantilla Carga Colaboradores - Conecta U.xlsx";

/** ADMIN: descarga la plantilla Excel e importa colaboradores (RF23–RF24). */
export function useCollaboratorImport() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
      // Va con el token (la ruta es solo ADMIN), por eso se pide como blob y no con un enlace directo.
      const response = await apiClient.get<Blob>("/admin/import/collaborators/template", { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = TEMPLATE_FILE_NAME;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const importFile = async (file: File) => {
    setIsImporting(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await apiClient.post<ImportCollaboratorsResult>("/admin/import/collaborators", body, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      return response.data;
    } finally {
      setIsImporting(false);
    }
  };

  return { downloadTemplate, importFile, isDownloading, isImporting };
}
