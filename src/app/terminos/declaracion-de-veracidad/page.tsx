import type { Metadata } from "next";
import { LegalPage } from "@/components/templates";
import { TRUTHFULNESS_DECLARATION } from "@/modules/legal/legal-texts";

export const metadata: Metadata = { title: `${TRUTHFULNESS_DECLARATION.title} · Conecta U` };

export default function TruthfulnessDeclarationPage() {
  return <LegalPage document={TRUTHFULNESS_DECLARATION} />;
}
