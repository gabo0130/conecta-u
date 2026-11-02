import type { Metadata } from "next";
import { LegalPage } from "@/components/templates";
import { DATA_TREATMENT } from "@/modules/legal/legal-texts";

export const metadata: Metadata = { title: `${DATA_TREATMENT.title} · Conecta U` };

export default function DataTreatmentPage() {
  return <LegalPage document={DATA_TREATMENT} />;
}
