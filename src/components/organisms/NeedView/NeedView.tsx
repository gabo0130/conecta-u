"use client";

import type { Need } from "@/apis/interfaces/needs";
import { useProjectTypesCatalog } from "@/modules/catalogs/hooks/useProjectTypesCatalog/useProjectTypesCatalog";
import {
  NEED_SCALE_LABEL,
  PRIORITY_VIEW,
  formatPriorityScore,
  toNeedScale,
} from "@/modules/needs/utils/need-view";
import { formatDate } from "@/modules/projects/utils/project-view";
import { ArrowLink, Badge, Card, Chip } from "../../atoms";
import { ScoreMeter } from "../../molecules";
import styles from "./NeedView.module.css";

const EMPTY = "Sin definir";

function NeedCharacterizationCard({ need }: { need: Need }) {
  const { projectTypes } = useProjectTypesCatalog();
  const characterization = need.characterization;
  if (!characterization) {
    return (
      <Card padding={24}>
        <h2 className={styles.sectionTitle}>Caracterización</h2>
        <p className={styles.text}>
          Aún no se ha caracterizado. La IA extrae del texto el problema, el objetivo, los beneficiarios, los
          resultados esperados y las competencias del catálogo, y señala lo que falta.
        </p>
      </Card>
    );
  }
  const suggestedType = projectTypes.find((type) => type.code === characterization.suggestedProjectTypeCode);
  return (
    <Card padding={24}>
      <h2 className={styles.sectionTitle}>Caracterización con IA</h2>
      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>Problema</dt>
          <dd>{characterization.problem || EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Objetivo</dt>
          <dd>{characterization.objective || EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Beneficiarios</dt>
          <dd>{characterization.beneficiaries || EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Tipo de proyecto sugerido</dt>
          <dd>{suggestedType?.name ?? characterization.suggestedProjectTypeCode ?? EMPTY}</dd>
        </div>
        <div className={styles.field}>
          <dt>Resultados esperados</dt>
          <dd>
            {characterization.expectedResults.length > 0 ? (
              <ul className={styles.list}>
                {characterization.expectedResults.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            ) : (
              EMPTY
            )}
          </dd>
        </div>
        <div className={styles.field}>
          <dt>Competencias del catálogo</dt>
          <dd>
            {characterization.competencies.length + characterization.unmatchedCompetencies.length > 0 ? (
              <span className={styles.chips}>
                {characterization.competencies.map((competency) => (
                  <Chip key={competency.skillId} tone="red">
                    {competency.name}
                  </Chip>
                ))}
                {characterization.unmatchedCompetencies.map((name) => (
                  <Chip key={name} title="No está en el catálogo">
                    {name}
                  </Chip>
                ))}
              </span>
            ) : (
              EMPTY
            )}
          </dd>
        </div>
      </dl>
      {characterization.missingInformation.length > 0 ? (
        <>
          <h3 className={styles.sectionTitle}>Información que falta según la IA</h3>
          <ul className={styles.list}>
            {characterization.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      <p className={styles.note}>
        Caracterizada el {formatDate(need.characterizedAt)} con {characterization.provider} ({characterization.model}, prompt {characterization.promptVersion}). La IA
        sugiere; tú decides.
      </p>
    </Card>
  );
}

export function NeedScores({ need }: { need: Need }) {
  return (
    <Card padding={20}>
      <h2 className={styles.sectionTitle}>Prioridad y completitud</h2>
      <div className={styles.meters}>
        <ScoreMeter label="Prioridad" value={need.priorityScore} valueText={formatPriorityScore(need.priorityScore)} />
        <Badge tone={PRIORITY_VIEW[need.priorityLevel].tone} dot>
          {PRIORITY_VIEW[need.priorityLevel].label}
        </Badge>
        <ScoreMeter label="Completitud" value={need.completeness} />
      </div>
      {need.missingElements.length > 0 ? (
        <>
          <p className={styles.note}>Le falta (peso en la completitud):</p>
          <ul className={styles.missing}>
            {need.missingElements.map((item) => (
              <li key={item.element}>
                <span>{item.label}</span>
                <span className={styles.weight}>{item.weight} %</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.note}>Tiene todos los elementos de una necesidad bien caracterizada.</p>
      )}
      <p className={styles.note}>Prioridad = 40 % impacto + 40 % urgencia + 20 % completitud.</p>
    </Card>
  );
}

/** Tesis (D1): descripción, datos declarados y caracterización de una necesidad (solo lectura). */
export function NeedView({ need }: { need: Need }) {
  return (
    <>
      <Card padding={24}>
        <h2 className={styles.sectionTitle}>Descripción</h2>
        <p className={styles.text}>{need.description}</p>
        <dl className={styles.fields}>
          <div className={styles.field}>
            <dt>Urgencia</dt>
            <dd>{NEED_SCALE_LABEL[toNeedScale(need.urgency)]}</dd>
          </div>
          <div className={styles.field}>
            <dt>Impacto</dt>
            <dd>{NEED_SCALE_LABEL[toNeedScale(need.impact)]}</dd>
          </div>
          <div className={styles.field}>
            <dt>Plazo esperado</dt>
            <dd>{need.deadline ? formatDate(need.deadline) : EMPTY}</dd>
          </div>
          <div className={styles.field}>
            <dt>Dependencia</dt>
            <dd>{need.dependency ?? EMPTY}</dd>
          </div>
        </dl>
        {need.status === "DESCARTADA" && need.discardReason ? (
          <p className={styles.note}>Motivo del descarte: {need.discardReason}</p>
        ) : null}
        {need.projectId ? (
          <p className={styles.note}>
            <ArrowLink href={`/proyectos/${need.projectId}`}>Ver la oportunidad (proyecto)</ArrowLink>
          </p>
        ) : null}
      </Card>
      <NeedCharacterizationCard need={need} />
    </>
  );
}
