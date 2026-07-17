"use client";

import { INITIAL_DEMO_STATE } from "./demo-data";
import { displayName, normalizePhone } from "./format";
import type {
  CheckinPayload,
  ExistingClientResult,
  PublicSnapshot,
  QueueItem,
  QueueStatus,
  TitaniumState,
} from "./types";

const CHANNEL_NAME = "titanium-demo-ephemeral-v1";
const TAB_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/**
 * Esta edição é exclusivamente demonstrativa.
 * Nenhum banco, API externa, localStorage ou sessionStorage é utilizado.
 */
export const isDemoMode = true;

let demoState: TitaniumState | null = null;
let channel: BroadcastChannel | null = null;
let channelInitialized = false;
const listeners = new Set<() => void>();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneInitial(): TitaniumState {
  return clone(INITIAL_DEMO_STATE);
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function applyRemoteState(state: TitaniumState) {
  demoState = clone(state);
  notifyListeners();
}

function ensureDemoChannel() {
  if (typeof window === "undefined" || channelInitialized) return;
  channelInitialized = true;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
      const message = event.data as
        | { type: "request_state"; sender: string }
        | {
            type: "state";
            sender: string;
            target?: string;
            state: TitaniumState;
          };

      if (!message || message.sender === TAB_ID) return;

      if (message.type === "request_state") {
        if (demoState) {
          channel?.postMessage({
            type: "state",
            sender: TAB_ID,
            target: message.sender,
            state: demoState,
          });
        }
        return;
      }

      if (message.type === "state") {
        if (message.target && message.target !== TAB_ID) return;
        applyRemoteState(message.state);
      }
    };

    // Uma aba recém-aberta pede o estado mantido apenas na memória das outras abas.
    channel.postMessage({ type: "request_state", sender: TAB_ID });
  } catch {
    channel = null;
  }
}

function getDemoState(): TitaniumState {
  if (!demoState) demoState = cloneInitial();
  ensureDemoChannel();
  return demoState;
}

function saveDemoState(state: TitaniumState) {
  state.updatedAt = new Date().toISOString();
  demoState = clone(state);
  ensureDemoChannel();
  notifyListeners();
  channel?.postMessage({
    type: "state",
    sender: TAB_ID,
    state: demoState,
  });
}

function publicFromState(state: TitaniumState): PublicSnapshot {
  return {
    barbers: state.barbers,
    services: state.services,
    queue: state.queue,
    updatedAt: state.updatedAt,
  };
}

export async function getPublicSnapshot(): Promise<PublicSnapshot> {
  return publicFromState(getDemoState());
}

export async function findExistingClient(
  phone: string,
): Promise<ExistingClientResult | null> {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const state = getDemoState();
  const customer = state.customers.find((item) => item.phone === normalized);
  if (!customer) return null;

  return {
    customer,
    history: state.queue
      .filter((item) => item.customerId === customer.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  };
}

export async function createCheckin(payload: CheckinPayload): Promise<QueueItem> {
  const state = getDemoState();
  const phone = normalizePhone(payload.phone);
  let customer = state.customers.find((item) => item.phone === phone);

  if (!customer) {
    customer = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      phone,
      allergy: payload.allergy.trim() || "Nenhuma informada",
      preferredTime: payload.preferredTime,
      photoData: payload.photoData,
      createdAt: new Date().toISOString(),
    };
    state.customers.push(customer);
  } else {
    customer.name = payload.name.trim() || customer.name;
    customer.allergy = payload.allergy.trim() || customer.allergy;
    customer.preferredTime = payload.preferredTime || customer.preferredTime;
    customer.photoData = payload.photoData || customer.photoData;
  }

  const service = state.services.find((item) => item.id === payload.serviceId);
  const barber = state.barbers.find((item) => item.id === payload.barberId);
  if (!service || !barber) throw new Error("Serviço ou barbeiro inválido.");

  const activeToday = state.queue.filter(
    (item) => new Date(item.createdAt).toDateString() === new Date().toDateString(),
  ).length;

  const queueItem: QueueItem = {
    id: crypto.randomUUID(),
    ticket: `T${String(activeToday + 1).padStart(3, "0")}`,
    customerId: customer.id,
    customerName: customer.name,
    displayName: displayName(customer.name),
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    durationMinutes: service.durationMinutes,
    barberId: barber.id,
    barberName: barber.name,
    paymentMethod: payload.paymentMethod,
    status: "waiting",
    allergy: customer.allergy,
    createdAt: new Date().toISOString(),
  };

  state.queue.push(queueItem);
  saveDemoState(state);
  return queueItem;
}

export async function verifyAdmin(pin: string): Promise<boolean> {
  return pin === (process.env.NEXT_PUBLIC_DEMO_ADMIN_PIN || "1234");
}

export async function getAdminSnapshot(pin: string): Promise<TitaniumState> {
  if (!(await verifyAdmin(pin))) throw new Error("PIN inválido.");
  return clone(getDemoState());
}

export async function adminAction(
  pin: string,
  action: string,
  payload: Record<string, unknown>,
): Promise<TitaniumState> {
  if (!(await verifyAdmin(pin))) throw new Error("PIN inválido.");
  const state = getDemoState();

  if (action === "status") {
    const item = state.queue.find((entry) => entry.id === payload.id);
    if (!item) throw new Error("Atendimento não encontrado.");
    const status = payload.status as QueueStatus;
    item.status = status;
    const timestamp = new Date().toISOString();
    if (status === "called") item.calledAt = timestamp;
    if (status === "in_service") item.startedAt = timestamp;
    if (status === "completed") item.completedAt = timestamp;
    if (status === "in_service") {
      const barber = state.barbers.find((entry) => entry.id === item.barberId);
      if (barber) barber.status = "busy";
    }
    if (["payment", "completed", "cancelled"].includes(status)) {
      const barber = state.barbers.find((entry) => entry.id === item.barberId);
      if (barber) barber.status = "available";
    }
  }

  if (action === "finalize") {
    const item = state.queue.find((entry) => entry.id === payload.id);
    if (!item) throw new Error("Atendimento não encontrado.");
    item.status = "completed";
    item.completedAt = new Date().toISOString();
    item.paymentMethod = payload.method as QueueItem["paymentMethod"];
    state.payments.push({
      id: crypto.randomUUID(),
      queueItemId: item.id,
      amount: Number(payload.amount ?? item.price),
      method: item.paymentMethod,
      status: "paid",
      createdAt: new Date().toISOString(),
    });
    const barber = state.barbers.find((entry) => entry.id === item.barberId);
    if (barber) barber.status = "available";
  }

  if (action === "add_barber") {
    state.barbers.push({
      id: crypto.randomUUID(),
      name: String(payload.name || "Novo barbeiro"),
      specialty: String(payload.specialty || "Barbeiro"),
      active: true,
      status: "available",
    });
  }

  if (action === "toggle_barber") {
    const barber = state.barbers.find((entry) => entry.id === payload.id);
    if (barber) barber.active = !barber.active;
  }

  if (action === "add_service") {
    state.services.push({
      id: crypto.randomUUID(),
      name: String(payload.name || "Novo serviço"),
      description: String(payload.description || "Serviço da Titanium"),
      price: Number(payload.price || 0),
      durationMinutes: Number(payload.durationMinutes || 30),
      active: true,
      category: String(payload.category || "Outros"),
    });
  }

  if (action === "toggle_service") {
    const service = state.services.find((entry) => entry.id === payload.id);
    if (service) service.active = !service.active;
  }

  if (action === "reset") {
    const initial = cloneInitial();
    saveDemoState(initial);
    return clone(initial);
  }

  saveDemoState(state);
  return clone(state);
}

export function subscribeToDemoChanges(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  ensureDemoChannel();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
