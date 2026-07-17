"use client";

import { useEffect, useMemo, useState } from "react";
import { Expand, Scissors } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Loading } from "@/components/Loading";
import { statusLabel } from "@/lib/format";
import { usePublicSnapshot } from "@/lib/use-public-snapshot";

export default function PainelPage() {
  const { data, loading, error } = usePublicSnapshot(2500);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeQueue = useMemo(
    () => (data?.queue ?? []).filter((item) => !["completed", "cancelled"].includes(item.status)),
    [data],
  );
  const called = activeQueue.find((item) => item.status === "called");
  const inService = activeQueue.find((item) => item.status === "in_service");
  const highlighted = called ?? inService ?? activeQueue[0];
  const next = activeQueue
    .filter((item) => item.id !== highlighted?.id && item.status === "waiting")
    .slice(0, 5);

  if (loading) return <Loading label="Conectando ao painel..." />;

  return (
    <main className="tv-page">
      <div className="tv-top">
        <Brand />
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <Expand size={16} /> Tela cheia
          </button>
          <div className="tv-clock">
            <strong>{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</strong>
            <span>{now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</span>
          </div>
        </div>
      </div>

      {error && <div className="alert" style={{ marginBottom: 15 }}>{error}</div>}

      <div className="tv-layout">
        <section className="now-serving">
          {highlighted ? (
            <>
              <span className={`pill ${highlighted.status === "called" ? "yellow" : "red"}`}>
                {highlighted.status === "called" ? "DIRIJA-SE AO BARBEIRO" : statusLabel[highlighted.status]}
              </span>
              <div className="ticket">{highlighted.ticket}</div>
              <h1>{highlighted.displayName}</h1>
              <p>{highlighted.barberName} • {highlighted.serviceName}</p>
            </>
          ) : (
            <>
              <Scissors size={60} color="#ff7285" />
              <h1>Fila livre</h1>
              <p>Faça seu check-in no tablet para começar.</p>
            </>
          )}
        </section>

        <aside className="next-panel">
          <span className="eyebrow">A seguir</span>
          <h2>Próximos clientes</h2>
          {next.length ? next.map((item) => (
            <div className="next-item" key={item.id}>
              <span className="next-number">{item.ticket}</span>
              <div>
                <strong>{item.displayName}</strong>
                <span>{item.barberName} • {item.serviceName}</span>
              </div>
            </div>
          )) : <div className="empty">Nenhum cliente aguardando.</div>}
        </aside>
      </div>

      <footer className="footer-note">
        Acompanhe também pelo celular • Atualização automática da fila
      </footer>
    </main>
  );
}
