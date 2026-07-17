"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  BarChart3,
  Check,
  Clock3,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  Scissors,
  Settings2,
  ShieldCheck,
  UserRoundPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { ModeBadge } from "@/components/ModeBadge";
import { adminAction, getAdminSnapshot, subscribeToDemoChanges, verifyAdmin } from "@/lib/api";
import { currency, dateTime, paymentLabel, statusLabel, time } from "@/lib/format";
import type { PaymentMethod, QueueItem, QueueStatus, TitaniumState } from "@/lib/types";

type AdminTab = "queue" | "finance" | "settings";

const columns: Array<{ status: QueueStatus; label: string }> = [
  { status: "waiting", label: "Em espera" },
  { status: "called", label: "Chamado" },
  { status: "in_service", label: "Em atendimento" },
  { status: "payment", label: "A finalizar" },
];

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [state, setState] = useState<TitaniumState | null>(null);
  const [tab, setTab] = useState<AdminTab>("queue");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentItem, setPaymentItem] = useState<QueueItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [qr, setQr] = useState("");
  const [barberName, setBarberName] = useState("");
  const [barberSpecialty, setBarberSpecialty] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("30");
  const [serviceCategory, setServiceCategory] = useState("Cabelo");

  const refresh = useCallback(async (currentPin: string) => {
    if (!currentPin) return;
    try {
      const snapshot = await getAdminSnapshot(currentPin);
      setState(snapshot);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar o painel.");
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const timer = window.setInterval(() => void refresh(pin), 4000);
    const unsubscribe = subscribeToDemoChanges(() => void refresh(pin));
    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [authenticated, pin, refresh]);

  useEffect(() => {
    if (!paymentItem || paymentMethod !== "pix") {
      setQr("");
      return;
    }
    const payload = `TITANIUM-DEMO|${paymentItem.ticket}|${paymentItem.customerName}|${paymentAmount.toFixed(2)}`;
    void QRCode.toDataURL(payload, { width: 360, margin: 1 }).then(setQr);
  }, [paymentAmount, paymentItem, paymentMethod]);

  const activeQueue = useMemo(
    () => state?.queue.filter((item) => !["completed", "cancelled"].includes(item.status)) ?? [],
    [state],
  );
  const completed = useMemo(
    () => state?.queue.filter((item) => item.status === "completed") ?? [],
    [state],
  );
  const totalRevenue = state?.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
  const ticketAverage = state?.payments.length ? totalRevenue / state.payments.length : 0;

  const revenueByBarber = useMemo(() => {
    if (!state) return [];
    return state.barbers.map((barber) => {
      const queueIds = new Set(state.queue.filter((item) => item.barberId === barber.id).map((item) => item.id));
      const value = state.payments
        .filter((payment) => payment.status === "paid" && queueIds.has(payment.queueItemId))
        .reduce((sum, payment) => sum + payment.amount, 0);
      return { barber: barber.name.split(" ")[0], value };
    });
  }, [state]);
  const maxRevenue = Math.max(...revenueByBarber.map((item) => item.value), 1);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!(await verifyAdmin(pin))) {
        setError("PIN inválido. Na demonstração, utilize 1234.");
        return;
      }
      setAuthenticated(true);
      await refresh(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const snapshot = await adminAction(pin, action, payload);
      setState(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível executar a ação.");
    } finally {
      setBusy(false);
    }
  }

  function openPayment(item: QueueItem) {
    setPaymentItem(item);
    setPaymentMethod(item.paymentMethod);
    setPaymentAmount(item.price);
  }

  async function finalizePayment() {
    if (!paymentItem) return;
    await runAction("finalize", {
      id: paymentItem.id,
      method: paymentMethod,
      amount: paymentAmount,
    });
    setPaymentItem(null);
  }

  function logout() {
    setAuthenticated(false);
    setState(null);
    setPin("");
  }

  if (!authenticated) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={login}>
          <Brand />
          <h1>Área administrativa</h1>
          <p>Acesso exclusivo da equipe para controlar a fila, os pagamentos e os indicadores.</p>
          {error && <div className="alert" style={{ marginBottom: 15 }}>{error}</div>}
          <div className="form-group">
            <label>PIN de acesso</label>
            <input
              className="input"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Digite o PIN"
              autoFocus
            />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 15 }} disabled={busy}>
            <ShieldCheck size={18} /> {busy ? "Validando..." : "Entrar no painel"}
          </button>
          <p style={{ fontSize: ".78rem", textAlign: "center", marginTop: 14 }}>
            PIN da demonstração: <strong>1234</strong>
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div className="admin-top-inner">
          <Brand compact />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <ModeBadge />
            <button className="btn btn-secondary btn-sm" onClick={() => refresh(pin)}><RefreshCw size={15} /> Atualizar</button>
            <button className="btn btn-secondary btn-sm" onClick={logout}><LogOut size={15} /> Sair</button>
          </div>
        </div>
      </header>

      <section className="admin-main">
        <div className="section-title" style={{ paddingTop: 10 }}>
          <span className="eyebrow">Central de operação</span>
          <h1>Gestão Titanium</h1>
          <p>Controle a fila, finalize os atendimentos e acompanhe os resultados.</p>
        </div>

        {error && <div className="alert" style={{ marginBottom: 15 }}>{error}</div>}

        <div className="stats-grid">
          <div className="stat-card"><span>Clientes aguardando</span><strong>{activeQueue.length}</strong></div>
          <div className="stat-card"><span>Atendimentos concluídos</span><strong>{completed.length}</strong></div>
          <div className="stat-card"><span>Faturamento registrado</span><strong>{currency(totalRevenue)}</strong></div>
          <div className="stat-card"><span>Ticket médio</span><strong>{currency(ticketAverage)}</strong></div>
        </div>

        <nav className="admin-tabs">
          <button className={`admin-tab ${tab === "queue" ? "active" : ""}`} onClick={() => setTab("queue")}>
            <Users size={15} style={{ verticalAlign: "-2px" }} /> Fila de atendimento
          </button>
          <button className={`admin-tab ${tab === "finance" ? "active" : ""}`} onClick={() => setTab("finance")}>
            <BarChart3 size={15} style={{ verticalAlign: "-2px" }} /> Financeiro
          </button>
          <button className={`admin-tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
            <Settings2 size={15} style={{ verticalAlign: "-2px" }} /> Equipe e serviços
          </button>
        </nav>

        {tab === "queue" && (
          <div className="kanban">
            {columns.map((column) => {
              const items = state?.queue.filter((item) => item.status === column.status) ?? [];
              return (
                <section className="kanban-column" key={column.status}>
                  <div className="kanban-title"><strong>{column.label}</strong><span>{items.length}</span></div>
                  {items.length ? items.map((item) => (
                    <article className="kanban-card" key={item.id}>
                      <div className="kanban-card-top">
                        <span className="queue-ticket">{item.ticket}</span>
                        <span className={`pill ${item.status === "called" ? "yellow" : item.status === "in_service" ? "red" : item.status === "payment" ? "green" : "blue"}`}>
                          {statusLabel[item.status]}
                        </span>
                      </div>
                      <h3>{item.customerName}</h3>
                      <p>{item.serviceName} • {item.barberName}</p>
                      <div className="kanban-meta">
                        <span><Clock3 size={13} style={{ verticalAlign: "-2px" }} /> Entrada: {time(item.createdAt)}</span>
                        <span><WalletCards size={13} style={{ verticalAlign: "-2px" }} /> {paymentLabel[item.paymentMethod]} • {currency(item.price)}</span>
                        {item.allergy && item.allergy !== "Nenhuma informada" && <span>⚠️ {item.allergy}</span>}
                      </div>
                      <div className="kanban-actions">
                        {item.status === "waiting" && (
                          <>
                            <button className="btn btn-warning btn-sm" disabled={busy} onClick={() => runAction("status", { id: item.id, status: "called" })}>Chamar</button>
                            <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => runAction("status", { id: item.id, status: "cancelled" })}>Cancelar</button>
                          </>
                        )}
                        {item.status === "called" && (
                          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => runAction("status", { id: item.id, status: "in_service" })}>Iniciar atendimento</button>
                        )}
                        {item.status === "in_service" && (
                          <button className="btn btn-success btn-sm" disabled={busy} onClick={() => runAction("status", { id: item.id, status: "payment" })}>Ir para pagamento</button>
                        )}
                        {item.status === "payment" && (
                          <button className="btn btn-primary btn-sm" onClick={() => openPayment(item)}>Cobrar e finalizar</button>
                        )}
                      </div>
                    </article>
                  )) : <div className="empty">Nenhum atendimento nesta etapa.</div>}
                </section>
              );
            })}
          </div>
        )}

        {tab === "finance" && state && (
          <div className="grid-2">
            <section className="panel-card">
              <span className="eyebrow">Faturamento por barbeiro</span>
              <h2>Desempenho da equipe</h2>
              <div className="chart-bars">
                {revenueByBarber.map((item) => (
                  <div className="chart-bar-wrap" key={item.barber}>
                    <strong>{currency(item.value)}</strong>
                    <div className="chart-bar" style={{ height: `${Math.max(7, (item.value / maxRevenue) * 150)}px` }} />
                    <span>{item.barber}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel-card">
              <span className="eyebrow">Resumo financeiro</span>
              <h2>Recebimentos</h2>
              <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                {(["pix", "debit", "credit", "cash"] as PaymentMethod[]).map((method) => {
                  const value = state.payments.filter((item) => item.method === method && item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
                  return (
                    <div className="preview-card" style={{ gridTemplateColumns: "1fr auto" }} key={method}>
                      <div><strong>{paymentLabel[method]}</strong><span>Pagamentos confirmados</span></div>
                      <strong>{currency(value)}</strong>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="panel-card" style={{ gridColumn: "1 / -1" }}>
              <span className="eyebrow">Histórico</span>
              <h2>Atendimentos concluídos</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Cliente</th><th>Serviço</th><th>Barbeiro</th><th>Pagamento</th><th>Valor</th><th>Finalizado</th></tr></thead>
                  <tbody>
                    {completed.length ? completed.map((item) => (
                      <tr key={item.id}>
                        <td>{item.customerName}</td><td>{item.serviceName}</td><td>{item.barberName}</td><td>{paymentLabel[item.paymentMethod]}</td><td>{currency(item.price)}</td><td>{dateTime(item.completedAt)}</td>
                      </tr>
                    )) : <tr><td colSpan={6}>Finalize um atendimento para visualizar os resultados.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "settings" && state && (
          <div className="grid-2">
            <section className="panel-card">
              <span className="feature-icon"><UserRoundPlus size={22} /></span>
              <h2>Cadastrar barbeiro</h2>
              <div className="form-group"><label>Nome</label><input className="input" value={barberName} onChange={(e) => setBarberName(e.target.value)} placeholder="Nome do profissional" /></div>
              <div className="form-group" style={{ marginTop: 12 }}><label>Especialidade</label><input className="input" value={barberSpecialty} onChange={(e) => setBarberSpecialty(e.target.value)} placeholder="Ex.: degradê e acabamento" /></div>
              <button className="btn btn-primary btn-block" style={{ marginTop: 15 }} disabled={!barberName.trim() || busy} onClick={async () => {
                await runAction("add_barber", { name: barberName, specialty: barberSpecialty });
                setBarberName(""); setBarberSpecialty("");
              }}><Plus size={17} /> Adicionar profissional</button>
              <div style={{ display: "grid", gap: 9, marginTop: 18 }}>
                {state.barbers.map((barber) => (
                  <div className="preview-card" style={{ gridTemplateColumns: "48px 1fr auto" }} key={barber.id}>
                    <span className="avatar" style={{ width: 48, height: 48 }}>{barber.name[0]}</span>
                    <div><strong>{barber.name}</strong><span>{barber.specialty}</span></div>
                    <button className={`btn btn-sm ${barber.active ? "btn-danger" : "btn-success"}`} onClick={() => runAction("toggle_barber", { id: barber.id })}>{barber.active ? "Desativar" : "Ativar"}</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <span className="feature-icon"><Scissors size={22} /></span>
              <h2>Cadastrar serviço</h2>
              <div className="form-grid">
                <div className="form-group full"><label>Nome</label><input className="input" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Nome do serviço" /></div>
                <div className="form-group full"><label>Descrição</label><input className="input" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Descrição curta" /></div>
                <div className="form-group"><label>Valor</label><input className="input" inputMode="decimal" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="45,00" /></div>
                <div className="form-group"><label>Duração (min)</label><input className="input" inputMode="numeric" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} /></div>
                <div className="form-group full"><label>Categoria</label><select className="select" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)}><option>Cabelo</option><option>Barba</option><option>Combo</option><option>Química</option><option>Outros</option></select></div>
              </div>
              <button className="btn btn-primary btn-block" style={{ marginTop: 15 }} disabled={!serviceName.trim() || !servicePrice || busy} onClick={async () => {
                await runAction("add_service", {
                  name: serviceName,
                  description: serviceDescription,
                  price: Number(servicePrice.replace(",", ".")),
                  durationMinutes: Number(serviceDuration),
                  category: serviceCategory,
                });
                setServiceName(""); setServiceDescription(""); setServicePrice(""); setServiceDuration("30");
              }}><Plus size={17} /> Adicionar serviço</button>
              <div style={{ display: "grid", gap: 9, marginTop: 18 }}>
                {state.services.map((service) => (
                  <div className="preview-card" style={{ gridTemplateColumns: "1fr auto" }} key={service.id}>
                    <div><strong>{service.name} • {currency(service.price)}</strong><span>{service.durationMinutes} min • {service.category}</span></div>
                    <button className={`btn btn-sm ${service.active ? "btn-danger" : "btn-success"}`} onClick={() => runAction("toggle_service", { id: service.id })}>{service.active ? "Desativar" : "Ativar"}</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-card" style={{ gridColumn: "1 / -1" }}>
              <h2>Restaurar apresentação</h2>
              <p style={{ color: "var(--muted)" }}>Retorna os dados de exemplo para o estado inicial. Útil antes de apresentar novamente.</p>
              <button className="btn btn-danger" onClick={() => runAction("reset", {})}><RotateCcw size={17} /> Restaurar dados de demonstração</button>
            </section>
          </div>
        )}
      </section>

      {paymentItem && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setPaymentItem(null); }}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div><span className="eyebrow">Fechamento</span><h2>{paymentItem.customerName}</h2></div>
              <button className="btn btn-secondary btn-sm" onClick={() => setPaymentItem(null)}><X size={17} /></button>
            </div>
            <div className="kanban-meta" style={{ fontSize: ".9rem" }}>
              <span><strong>{paymentItem.serviceName}</strong> • {paymentItem.barberName}</span>
              <span>Valor previsto: {currency(paymentItem.price)}</span>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Forma de pagamento</label><select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}><option value="pix">Pix</option><option value="debit">Débito</option><option value="credit">Crédito</option><option value="cash">Dinheiro</option></select></div>
              <div className="form-group"><label>Valor final</label><input className="input" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} /></div>
            </div>
            {paymentMethod === "pix" && (
              <>
                <div className="qr-box">{qr && <img src={qr} alt="QR Code Pix demonstrativo" />}</div>
                <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".82rem" }}>QR Code demonstrativo. A confirmação bancária real entra na fase de integração Pix.</p>
              </>
            )}
            <button className="btn btn-success btn-block" disabled={busy} onClick={finalizePayment}><Check size={18} /> Confirmar pagamento e finalizar</button>
          </div>
        </div>
      )}
    </main>
  );
}
