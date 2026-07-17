"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Clock3,
  CreditCard,
  ScanFace,
  Scissors,
  Smartphone,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Loading } from "@/components/Loading";
import { createCheckin, findExistingClient } from "@/lib/api";
import { currency, normalizePhone, paymentLabel, waitEstimate } from "@/lib/format";
import { usePublicSnapshot } from "@/lib/use-public-snapshot";
import type { ExistingClientResult, PaymentMethod, QueueItem } from "@/lib/types";

async function compressPhoto(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });
    const max = 420;
    const ratio = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível processar a foto.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.68);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function CheckinPage() {
  const { data, loading, error } = usePublicSnapshot();
  const [step, setStep] = useState(0);
  const [clientMode, setClientMode] = useState<"new" | "existing" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [allergy, setAllergy] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [photoData, setPhotoData] = useState("");
  const [existing, setExisting] = useState<ExistingClientResult | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<QueueItem | null>(null);

  const activeServices = useMemo(
    () => data?.services.filter((item) => item.active) ?? [],
    [data],
  );
  const activeBarbers = useMemo(
    () => data?.barbers.filter((item) => item.active) ?? [],
    [data],
  );

  const selectedService = activeServices.find((item) => item.id === serviceId);
  const selectedBarber = activeBarbers.find((item) => item.id === barberId);

  function barberQueueInfo(id: string) {
    const items = (data?.queue ?? []).filter(
      (item) => item.barberId === id && !["completed", "cancelled"].includes(item.status),
    );
    return {
      people: items.length,
      minutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
    };
  }

  async function identifyExisting() {
    setMessage("");
    const normalized = normalizePhone(phone);
    if (normalized.length < 10) {
      setMessage("Digite um telefone válido com DDD.");
      return;
    }
    setBusy(true);
    try {
      const result = await findExistingClient(normalized);
      if (!result) {
        setMessage("Cadastro não encontrado. Você pode criar um novo cadastro.");
        return;
      }
      setExisting(result);
      setName(result.customer.name);
      setAllergy(result.customer.allergy || "");
      setPhotoData(result.customer.photoData || "");
      setStep(1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha na identificação.");
    } finally {
      setBusy(false);
    }
  }

  function advanceRegistration() {
    setMessage("");
    if (name.trim().split(/\s+/).length < 2) {
      setMessage("Digite o nome e o sobrenome do cliente.");
      return;
    }
    if (normalizePhone(phone).length < 10) {
      setMessage("Digite um telefone válido com DDD.");
      return;
    }
    setStep(1);
  }

  async function finishCheckin() {
    if (!selectedService || !selectedBarber) return;
    setBusy(true);
    setMessage("");
    try {
      const item = await createCheckin({
        name,
        phone,
        allergy,
        preferredTime,
        photoData,
        serviceId,
        barberId,
        paymentMethod,
      });
      setCreated(item);
      setStep(4);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível concluir o check-in.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(0);
    setClientMode(null);
    setName("");
    setPhone("");
    setAllergy("");
    setPreferredTime("");
    setPhotoData("");
    setExisting(null);
    setServiceId("");
    setBarberId("");
    setPaymentMethod("pix");
    setCreated(null);
    setMessage("");
  }

  if (loading) return <Loading label="Preparando o check-in..." />;

  return (
    <main className="page">
      <AppHeader title="Check-in de atendimento" subtitle="Totem do cliente" />
      <section className="container" style={{ maxWidth: 920 }}>
        <div className="section-title">
          <span className="eyebrow">Bem-vindo à Titanium</span>
          <h1>{step === 4 ? "Check-in concluído" : "Entre na fila em poucos passos"}</h1>
          <p>
            Escolha seu atendimento, profissional preferido e forma de pagamento.
          </p>
        </div>

        {step < 4 && (
          <div className="steps" aria-label="Progresso do check-in">
            {[0, 1, 2, 3].map((item) => (
              <span className={`step ${item <= step ? "active" : ""}`} key={item} />
            ))}
          </div>
        )}

        {error && <div className="alert">{error}</div>}
        {message && <div className="alert" style={{ marginBottom: 15 }}>{message}</div>}

        {step === 0 && !clientMode && (
          <div className="choice-grid">
            <button className="choice-card" onClick={() => setClientMode("new")}>
              <UserPlus size={30} color="#ff7285" />
              <strong>É meu primeiro atendimento</strong>
              <p>Faça um cadastro rápido e escolha seu serviço.</p>
            </button>
            <button className="choice-card" onClick={() => setClientMode("existing")}>
              <Smartphone size={30} color="#ff7285" />
              <strong>Já sou cliente</strong>
              <p>Localize seu cadastro pelo número do celular.</p>
            </button>
            <div className="panel-card" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="feature-icon"><ScanFace size={23} /></span>
                <div>
                  <strong>Reconhecimento facial</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                    Recurso previsto para uma próxima fase, após validação da experiência e adequação de privacidade.
                  </p>
                </div>
                <span className="pill yellow" style={{ marginLeft: "auto" }}>Em desenvolvimento</span>
              </div>
            </div>
          </div>
        )}

        {step === 0 && clientMode === "existing" && (
          <div className="panel-card">
            <button className="btn btn-secondary btn-sm" onClick={() => setClientMode(null)}>
              <ArrowLeft size={15} /> Voltar
            </button>
            <h2>Localizar cadastro</h2>
            <p style={{ color: "var(--muted)" }}>
              Digite o mesmo telefone utilizado no primeiro atendimento.
            </p>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label>Telefone com DDD</label>
              <input
                className="input"
                value={phone}
                inputMode="tel"
                placeholder="(11) 99999-0001"
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 15 }} onClick={identifyExisting} disabled={busy}>
              {busy ? "Buscando..." : "Continuar"} <ArrowRight size={17} />
            </button>
            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: 9 }}
              onClick={() => { setClientMode("new"); setMessage(""); }}
            >
              Criar novo cadastro
            </button>
          </div>
        )}

        {step === 0 && clientMode === "new" && (
          <div className="panel-card">
            <button className="btn btn-secondary btn-sm" onClick={() => setClientMode(null)}>
              <ArrowLeft size={15} /> Voltar
            </button>
            <h2>Novo cadastro</h2>
            <div className="form-grid">
              <div className="form-group full">
                <label>Nome completo</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome e sobrenome" />
              </div>
              <div className="form-group">
                <label>Telefone com DDD</label>
                <input className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
              </div>
              <div className="form-group">
                <label>Preferência de horário</label>
                <input className="input" type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
              </div>
              <div className="form-group full">
                <label>Alergia ou sensibilidade a lâmina/produtos</label>
                <textarea className="textarea" value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="Ex.: sensibilidade a produtos com álcool. Deixe em branco caso não possua." />
              </div>
              <div className="form-group full">
                <label>Foto opcional para o cadastro</label>
                <label className="choice-card" style={{ display: "flex", alignItems: "center", gap: 15 }}>
                  {photoData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoData} alt="Foto capturada" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 15 }} />
                  ) : (
                    <span className="feature-icon"><Camera size={23} /></span>
                  )}
                  <span>
                    <strong>{photoData ? "Foto capturada" : "Abrir câmera do tablet"}</strong>
                    <p>Usada apenas para demonstrar o futuro cadastro visual.</p>
                  </span>
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (file) setPhotoData(await compressPhoto(file));
                    }}
                  />
                </label>
              </div>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={advanceRegistration}>
              Escolher atendimento <ArrowRight size={17} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="panel-card" style={{ marginBottom: 15, display: "flex", alignItems: "center", gap: 14 }}>
              {photoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoData} alt="Cliente" style={{ width: 58, height: 58, objectFit: "cover", borderRadius: 15 }} />
              ) : <span className="avatar">{name[0]}</span>}
              <div>
                <strong>{name}</strong>
                <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                  {existing ? `${existing.history.length} atendimento(s) localizado(s)` : "Novo cliente"}
                </p>
              </div>
            </div>
            <h2>Qual serviço você deseja?</h2>
            <div className="choice-grid">
              {activeServices.map((service) => (
                <button
                  className={`choice-card ${serviceId === service.id ? "selected" : ""}`}
                  onClick={() => setServiceId(service.id)}
                  key={service.id}
                >
                  <Scissors size={25} color="#ff7285" />
                  <strong>{service.name}</strong>
                  <p>{service.description}</p>
                  <p style={{ marginTop: 8 }}><Clock3 size={14} style={{ verticalAlign: "-2px" }} /> {service.durationMinutes} minutos</p>
                  <div className="price">{currency(service.price)}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => { setStep(0); setClientMode(existing ? "existing" : "new"); }}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <button className="btn btn-primary" disabled={!serviceId} onClick={() => setStep(2)}>
                Escolher barbeiro <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Escolha seu barbeiro</h2>
            <p style={{ color: "var(--muted)" }}>A previsão considera os serviços que já estão na fila.</p>
            <div className="barber-grid">
              {activeBarbers.map((barber) => {
                const info = barberQueueInfo(barber.id);
                return (
                  <button
                    key={barber.id}
                    className={`choice-card ${barberId === barber.id ? "selected" : ""}`}
                    onClick={() => setBarberId(barber.id)}
                  >
                    <div className="barber-head">
                      <span className="avatar">{barber.name[0]}</span>
                      <span className={`pill ${barber.status === "available" ? "green" : "yellow"}`}>
                        {barber.status === "available" ? "Disponível" : "Atendendo"}
                      </span>
                    </div>
                    <strong>{barber.name}</strong>
                    <p>{barber.specialty}</p>
                    <div className="wait-value">{info.people}</div>
                    <div className="wait-caption">
                      {info.people === 1 ? "pessoa na frente" : "pessoas na frente"} • {waitEstimate(info.minutes)}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /> Voltar</button>
              <button className="btn btn-primary" disabled={!barberId} onClick={() => setStep(3)}>
                Forma de pagamento <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedService && selectedBarber && (
          <div className="grid-2">
            <div className="panel-card">
              <h2>Como pretende pagar?</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {([
                  ["pix", "Pix", Smartphone],
                  ["debit", "Cartão de débito", WalletCards],
                  ["credit", "Cartão de crédito", CreditCard],
                  ["cash", "Dinheiro", Users],
                ] as const).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    className={`choice-card ${paymentMethod === value ? "selected" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: 13 }}
                    onClick={() => setPaymentMethod(value)}
                  >
                    <Icon size={22} color="#ff7285" />
                    <strong style={{ margin: 0 }}>{label}</strong>
                    {paymentMethod === value && <Check size={19} style={{ marginLeft: "auto" }} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-card">
              <span className="eyebrow">Resumo do check-in</span>
              <h2>{name}</h2>
              <div className="kanban-meta" style={{ fontSize: ".9rem", gap: 11 }}>
                <span><strong>Serviço:</strong> {selectedService.name}</span>
                <span><strong>Profissional:</strong> {selectedBarber.name}</span>
                <span><strong>Duração prevista:</strong> {selectedService.durationMinutes} min</span>
                <span><strong>Pagamento:</strong> {paymentLabel[paymentMethod]}</span>
              </div>
              <div style={{ fontSize: "2.3rem", fontWeight: 950, margin: "18px 0" }}>{currency(selectedService.price)}</div>
              <button className="btn btn-primary btn-block" disabled={busy} onClick={finishCheckin}>
                {busy ? "Finalizando..." : "Confirmar e entrar na fila"} <Check size={18} />
              </button>
              <button className="btn btn-secondary btn-block" style={{ marginTop: 9 }} onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Alterar barbeiro
              </button>
            </div>
          </div>
        )}

        {step === 4 && created && (
          <div className="panel-card success-box">
            <span className="feature-icon" style={{ margin: "0 auto", width: 62, height: 62 }}><Check size={31} /></span>
            <p className="eyebrow" style={{ marginTop: 20 }}>Você está na fila</p>
            <div className="ticket-big">{created.ticket}</div>
            <h2>{created.displayName}, acompanhe a chamada no painel</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Atendimento com <strong>{created.barberName}</strong> para <strong>{created.serviceName}</strong>.
              O pagamento será confirmado ao final.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link className="btn btn-primary" href="/painel">Ver painel da TV</Link>
              <button className="btn btn-secondary" onClick={reset}>Novo check-in</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
