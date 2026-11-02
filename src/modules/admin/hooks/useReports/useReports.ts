"use client";

import { useState } from "react";
import { apiClient } from "@/apis/client";
import type { ReportFormat, ReportKind } from "@/apis/interfaces/admin";
import { downloadBlob, fileNameFromDisposition } from "@/utils/open-blob";

/** RF16: descarga los reportes consolidados del ADMIN (Excel o CSV). */
export function useReports() {
  const [downloading, setDownloading] = useState<`${ReportKind}.${ReportFormat}` | null>(null);

  const download = async (kind: ReportKind, format: ReportFormat) => {
    setDownloading(`${kind}.${format}`);
    try {
      const response = await apiClient.get<Blob>(`/admin/reports/${kind}`, {
        params: { format },
        responseType: "blob",
      });
      const disposition = response.headers["content-disposition"];
      downloadBlob(
        response.data,
        fileNameFromDisposition(typeof disposition === "string" ? disposition : undefined, `reporte-${kind}.${format}`),
      );
    } finally {
      setDownloading(null);
    }
  };

  return { download, downloading };
}
