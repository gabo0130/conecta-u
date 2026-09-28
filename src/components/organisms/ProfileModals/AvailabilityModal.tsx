"use client";

import { useState } from "react";
import type { AvailabilityPayload, AvailabilityStatus, Collaborator } from "@/apis/interfaces/collaborator";
import { COLLABORATOR_WEEKLY_HOURS, validateInteger } from "@/modules/collaborator/utils/collaborator-limits";
import { AVAILABILITY_OPTIONS } from "@/modules/collaborator/utils/collaborator-view";
import { Input, Modal, Select } from "../../atoms";
import { useProfileSubmit, type SubmitFn } from "./useProfileSubmit";

type AvailabilityModalProps = {
  collaborator: Collaborator;
  onSubmit: SubmitFn<AvailabilityPayload>;
  onClose: () => void;
};

export function AvailabilityModal({ collaborator, onSubmit, onClose }: AvailabilityModalProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(collaborator.availabilityStatus);
  const [weeklyHours, setWeeklyHours] = useState(collaborator.weeklyHours.toString());
  const { isSubmitting, error, run, failWith } = useProfileSubmit();

  const handleSubmit = () => {
    // Antes, un campo vacío se enviaba como 0 horas sin avisar.
    if (failWith(validateInteger(weeklyHours, COLLABORATOR_WEEKLY_HOURS, { label: "La dedicación semanal" }))) return;
    void run(
      () => onSubmit({ availabilityStatus: status, weeklyHours: Number(weeklyHours) }),
      onClose,
      "Tu disponibilidad se actualizó.",
    );
  };

  return (
    <Modal
      title="Editar disponibilidad"
      onClose={onClose}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={handleSubmit}
    >
      <Select
        label="Estado"
        options={AVAILABILITY_OPTIONS}
        value={status}
        onValueChange={setStatus}
      />
      <Input
        label="Dedicación semanal (horas)"
        type="number"
        min={COLLABORATOR_WEEKLY_HOURS.min}
        max={COLLABORATOR_WEEKLY_HOURS.max}
        value={weeklyHours}
        onChange={(event) => setWeeklyHours(event.target.value)}
      />
    </Modal>
  );
}
