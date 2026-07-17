"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MapPin, Scissors, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Loading } from "@/components/Loading";
import { waitEstimate } from "@/lib/format";
import { usePublicSnapshot } from "@/lib/use-public-snapshot";

export default function FilaPage() {
  const { data, loading, error } = usePublicSnapshot(3500);
  if (loading) return <Loading label="Consultando a fila..." />;

  const activeBarbers = data?.barbers.filter((item) => item.active) ?? [];

  return (
    <main className="page">
      <AppHeader title="Fila online" subtitle="Acompanhe antes de sair de casa" />
      <section className="container">
        <div className="section-title">
          <span className="eyebrow">Movimento em tempo real</span>
          <h1>Como está a Titanium agora?</h1>
          <p>Confira a fila de cada profissional e escolha o melhor momento para chegar.</p>
        </div>

        {error && <div className="alert" style={{ marginBottom: 15 }}>{error}</div>}

        <div className="panel-card" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
            <span className="feature-icon"><CheckCircle2 size={24} /></span>
            <div>
              <strong style={{ fontSize: "1.15rem" }}>Barbearia aberta</strong>
              <p style={{ color: "var(--muted)", margin: "4px 0 0" }}>
                {activeBarbers.length} profissionais disponíveis hoje
              </p>
            </div>
            <span className="pill green" style={{ marginLeft: "auto" }}>Movimento moderado</span>
          </div>
        </div>

        <div className="barber-grid">
          {activeBarbers.map((barber) => {
            const queue = (data?.queue ?? []).filter(
              (item) => item.barberId === barber.id && !["completed", "cancelled"].includes(item.status),
            );
            const wait = queue.reduce((sum, item) => sum + item.durationMinutes, 0);
            return (
              <article className="barber-card" key={barber.id}>
                <div className="barber-head">
                  <span className="avatar">{barber.name[0]}</span>
                  <span className={`pill ${barber.status === "available" ? "green" : "yellow"}`}>
                    {barber.status === "available" ? "Disponível" : "Em atendimento"}
                  </span>
                </div>
                <h3>{barber.name}</h3>
                <p>{barber.specialty}</p>
                <div className="wait-value">{queue.length}</div>
                <div className="wait-caption">
                  <Users size={14} style={{ verticalAlign: "-2px" }} /> {queue.length === 1 ? "cliente na fila" : "clientes na fila"}
                </div>
                <div className="kanban-meta">
                  <span><Clock3 size={14} style={{ verticalAlign: "-2px" }} /> Espera: {waitEstimate(wait)}</span>
                  <span><Scissors size={14} style={{ verticalAlign: "-2px" }} /> Próximo: {queue[0]?.displayName ?? "sem espera"}</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="panel-card">
            <MapPin size={24} color="#ff7285" />
            <h2>Venha até a Titanium</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              O endereço e o botão de rota podem ser personalizados após a aprovação do projeto.
            </p>
          </div>
          <div className="panel-card">
            <h2>Já está na barbearia?</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Faça seu check-in no tablet ou use esta demonstração pelo celular.
            </p>
            <Link href="/checkin" className="btn btn-primary">
              Fazer check-in <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
