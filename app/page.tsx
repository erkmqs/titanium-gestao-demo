import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  MonitorPlay,
  Scissors,
  Smartphone,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ModeBadge } from "@/components/ModeBadge";

const modules = [
  {
    title: "Check-in do cliente",
    description: "Cadastro, escolha do serviço, barbeiro, pagamento e entrada na fila.",
    icon: ClipboardCheck,
    href: "/checkin",
    label: "Abrir check-in",
  },
  {
    title: "Painel da televisão",
    description: "Chamada em destaque e próximos clientes com atualização automática.",
    icon: MonitorPlay,
    href: "/painel",
    label: "Abrir painel",
  },
  {
    title: "Fila online",
    description: "Consulta pública da espera de cada barbeiro antes de sair de casa.",
    icon: Smartphone,
    href: "/fila",
    label: "Consultar fila",
  },
  {
    title: "Administração",
    description: "Kanban de atendimentos, financeiro, equipe e serviços.",
    icon: BarChart3,
    href: "/admin",
    label: "Entrar no admin",
  },
];

export default function Home() {
  return (
    <main className="page">
      <AppHeader title="MVP para apresentação" subtitle="Fila • Atendimento • Financeiro" />

      <section className="container hero">
        <div>
          <span className="eyebrow">Experiência digital para barbearias</span>
          <h1>
            Do check-in ao caixa, tudo em <span>um só lugar.</span>
          </h1>
          <p>
            Uma demonstração interativa da Titanium Gestão: fila em tempo real,
            atendimento organizado, experiência moderna para o cliente e visão financeira
            para o proprietário.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/checkin">
              Simular check-in <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-secondary" href="/admin">
              Acessar painel administrativo
            </Link>
          </div>
          <div style={{ marginTop: 18 }}>
            <ModeBadge />
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-top">
            <div>
              <span className="eyebrow">Fila ao vivo</span>
              <h2 style={{ margin: "7px 0 0" }}>Titanium Barbearia</h2>
            </div>
            <span className="pill green">
              <CheckCircle2 size={14} /> Aberta agora
            </span>
          </div>
          <div className="preview-cards">
            <div className="preview-card">
              <span className="preview-number">T001</span>
              <div>
                <strong>André C.</strong>
                <span>Corte + Barba • Bruno Titanium</span>
              </div>
              <span className="pill red">Atendendo</span>
            </div>
            <div className="preview-card">
              <span className="preview-number">T002</span>
              <div>
                <strong>Rafael S.</strong>
                <span>Corte • Matheus</span>
              </div>
              <span className="pill yellow">Chamado</span>
            </div>
            <div className="preview-card">
              <span className="preview-number">T003</span>
              <div>
                <strong>Lucas F.</strong>
                <span>Corte + Luzes • Diego</span>
              </div>
              <span className="pill blue">Em espera</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container feature-grid">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <article className="feature-card" key={module.href}>
              <span className="feature-icon"><Icon size={23} /></span>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <Link className="btn btn-secondary btn-block" href={module.href}>
                {module.label} <ArrowRight size={16} />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="container panel-card" style={{ marginBottom: 30 }}>
        <div className="grid-3">
          <div>
            <Scissors size={25} color="#ff7285" />
            <h3>Serviços e valores</h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Corte, barba, luzes e progressiva com duração e preço definidos.
            </p>
          </div>
          <div>
            <Users size={25} color="#ff7285" />
            <h3>Fila por profissional</h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              O cliente escolhe o barbeiro e visualiza sua estimativa de espera.
            </p>
          </div>
          <div>
            <BarChart3 size={25} color="#ff7285" />
            <h3>Visão de negócio</h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Indicadores de faturamento, ticket médio e desempenho da equipe.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer-note">
        Titanium Gestão • Protótipo demonstrativo preparado para validação da ideia
      </footer>
    </main>
  );
}
