"use client";

import { useRouter } from "next/navigation";
import { AppShell, PageGrid, RolePage } from "@/components/templates";
import { NeedForm } from "@/components/organisms";
import { useCreateNeed } from "@/modules/needs/hooks/useCreateNeed/useCreateNeed";
import { getErrorMessage } from "@/utils/get-error-message";
import { loading } from "@/utils/loading";
import { notify } from "@/utils/notify";
import styles from "../necesidades.module.css";

const breadcrumb = (
  <>
    Necesidades <span className={styles.breadcrumbSep}>/</span>{" "}
    <span className={styles.breadcrumbCurrent}>Nueva necesidad</span>
  </>
);

function NuevaNecesidadScreen() {
  const router = useRouter();
  const { createNeed, isSaving } = useCreateNeed();

  return (
    <AppShell breadcrumb={breadcrumb}>
      <PageGrid
        header={
          <>
            <h1 className={styles.h1}>Registrar necesidad</h1>
            <p className={styles.sub}>
              Cuenta qué necesita tu dependencia o programa. Después podrás caracterizarla con IA y convertirla en un
              proyecto.
            </p>
          </>
        }
      >
        <NeedForm
          submitLabel="Registrar necesidad"
          isSaving={isSaving}
          onCancel={() => router.push("/necesidades")}
          onSubmit={async (payload) => {
            try {
              const need = await loading.run(createNeed(payload), "Registrando necesidad…");
              router.push(`/necesidades/${need.id}`);
              void notify.success(`"${need.title}" quedó registrada. Ahora puedes caracterizarla con IA.`, {
                title: "Necesidad registrada",
              });
            } catch (err) {
              void notify.error(getErrorMessage(err, "No se pudo registrar la necesidad."));
            }
          }}
        />
      </PageGrid>
    </AppShell>
  );
}

export default function NuevaNecesidadPage() {
  return (
    <RolePage roles={["LIDER"]}>
      <NuevaNecesidadScreen />
    </RolePage>
  );
}
