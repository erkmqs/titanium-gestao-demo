import type { PaymentMethod, QueueStatus } from "./types";

export const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const time = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

export const dateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export const paymentLabel: Record<PaymentMethod, string> = {
  pix: "Pix",
  debit: "Débito",
  credit: "Crédito",
  cash: "Dinheiro",
};

export const statusLabel: Record<QueueStatus, string> = {
  waiting: "Em espera",
  called: "Chamado",
  in_service: "Em atendimento",
  payment: "A finalizar",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-11);
}

export function displayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Cliente";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts.at(-1)?.[0] ?? ""}.`;
}

export function waitEstimate(queueMinutes: number) {
  if (queueMinutes <= 0) return "Atendimento próximo";
  if (queueMinutes < 60) return `aprox. ${queueMinutes} min`;
  const hours = Math.floor(queueMinutes / 60);
  const minutes = queueMinutes % 60;
  return `aprox. ${hours}h${minutes ? ` ${minutes}min` : ""}`;
}
