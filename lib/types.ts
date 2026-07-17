export type QueueStatus =
  | "waiting"
  | "called"
  | "in_service"
  | "payment"
  | "completed"
  | "cancelled";

export type PaymentMethod = "pix" | "debit" | "credit" | "cash";

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
  status: "available" | "busy" | "break" | "offline";
  avatar?: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  allergy: string;
  preferredTime?: string;
  photoData?: string;
  createdAt: string;
}

export interface QueueItem {
  id: string;
  ticket: string;
  customerId: string;
  customerName: string;
  displayName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  barberId: string;
  barberName: string;
  paymentMethod: PaymentMethod;
  status: QueueStatus;
  allergy?: string;
  createdAt: string;
  calledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface Payment {
  id: string;
  queueItemId: string;
  amount: number;
  method: PaymentMethod;
  status: "paid" | "pending" | "cancelled";
  createdAt: string;
}

export interface TitaniumState {
  barbers: Barber[];
  services: Service[];
  queue: QueueItem[];
  customers: Customer[];
  payments: Payment[];
  updatedAt: string;
}

export interface PublicSnapshot {
  barbers: Barber[];
  services: Service[];
  queue: QueueItem[];
  updatedAt: string;
}

export interface ExistingClientResult {
  customer: Customer;
  history: QueueItem[];
}

export interface CheckinPayload {
  name: string;
  phone: string;
  allergy: string;
  preferredTime?: string;
  photoData?: string;
  serviceId: string;
  barberId: string;
  paymentMethod: PaymentMethod;
}
