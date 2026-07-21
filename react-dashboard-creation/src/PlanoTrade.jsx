import React, { useState, useEffect } from "react";

/*
  PlanoTrade.jsx
  ---------------------------------------------------------------
  Nova página do dashboard: "Plano de Trade"
  Segue o padrão do projeto: tema recebido via prop `th`
  (mesmo padrão de App.jsx / Estatisticas.jsx / Estudos.jsx),
  accent #4ecb8d, fonte Plus Jakarta Sans.

  COMO INTEGRAR:
  1. Copie este arquivo para src/PlanoTrade.jsx
  2. No App.jsx, importe: import PlanoTrade from './PlanoTrade';
  3. Adicione um item na sidebar (mesmo padrão dos outros) e
     renderize <PlanoTrade th={th} /> quando a aba estiver ativa.
  4. Se seu objeto de tema (LIGHT/DARK) tiver chaves diferentes das
     usadas abaixo (th.bg, th.card, th.border, th.text, th.textMuted,
     th.accent), ajuste os nomes de propriedade no topo do arquivo
     ou no objeto FALLBACK_THEME.
  ---------------------------------------------------------------
*/

const ACCENT = "#4ecb8d";

const FALLBACK_THEME = {
  bg: "#0f1115",
  card: "#171a21",
  cardAlt: "#1d212a",
  border: "#2a2f3a",
  text: "#eef1f6",
  textMuted: "#9aa3b2",
  accent: ACCENT,
};

function useTheme(th) {
  return {
    bg: th?.bg ?? FALLBACK_THEME.bg,
    card: th?.cardBg ?? th?.surface ?? FALLBACK_THEME.card,
    cardAlt: th?.bg ?? FALLBACK_THEME.cardAlt,
    border: th?.border ?? FALLBACK_THEME.border,
    text: th?.text ?? FALLBACK_THEME.text,
    textMuted: th?.textMuted ?? th?.textSub ?? FALLBACK_THEME.textMuted,
    accent: ACCENT,
  };
}

/* ---------------- Ícones inline (sem libs externas) ---------------- */

const IcoChevron = ({ open, color }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    style={{
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 160ms ease",
      flexShrink: 0,
    }}
  >
    <path
      d="M9 6l6 6-6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------------- Accordion genérico ---------------- */

function Accordion({ id, title, subtitle, badge, badgeColor, level, defaultOpen, children, theme }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const isTop = level === "top";

  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: isTop ? 14 : 10,
        background: isTop ? theme.card : theme.cardAlt,
        marginBottom: isTop ? 14 : 10,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: isTop ? "16px 18px" : "12px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <IcoChevron open={open} color={theme.accent} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: isTop ? 16 : 14.5,
                fontWeight: 700,
                color: theme.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 12.5,
                  color: theme.textMuted,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {badge && (
          <span
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              color: badgeColor?.text ?? theme.accent,
              background: badgeColor?.bg ?? `${theme.accent}22`,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            padding: isTop ? "0 18px 18px 18px" : "0 14px 14px 14px",
            animation: "planoFadeIn 160ms ease",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------------- Blocos de texto reutilizáveis ---------------- */

function Field({ label, children, theme }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: theme.accent,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: theme.text }}>
        {children}
      </div>
    </div>
  );
}

function Pill({ children, theme, tone = "neutral" }) {
  const tones = {
    neutral: { bg: `${theme.border}`, text: theme.textMuted },
    good: { bg: `${theme.accent}22`, text: theme.accent },
    warn: { bg: "#e0a63a22", text: "#e0a63a" },
    bad: { bg: "#e0555522", text: "#e05555" },
  };
  const c = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.text,
      }}
    >
      {children}
    </span>
  );
}

function Quote({ children, theme }) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${theme.accent}`,
        paddingLeft: 12,
        margin: "10px 0",
        fontSize: 13.5,
        fontStyle: "italic",
        color: theme.textMuted,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Helpers de tom (cor por estado de fluência) ---------------- */

function toneBg(tone, theme) {
  const tones = {
    neutral: theme.border,
    good: `${theme.accent}22`,
    warn: "#e0a63a22",
    bad: "#e0555522",
  };
  return tones[tone] || tones.neutral;
}
function toneColor(tone, theme) {
  const tones = { neutral: theme.textMuted, good: theme.accent, warn: "#e0a63a", bad: "#e05555" };
  return tones[tone] || tones.neutral;
}

/* ---------------- Ícones por setup ---------------- */

const IconTRM = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
);
const IconFQ = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
  </svg>
);
const IconTCMM = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" />
  </svg>
);
const IconTCPos = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5" /><path d="M6 11l6-6 6 6" />
  </svg>
);
const IconTCSuper = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="14" r="1.6" /><circle cx="12" cy="7" r="1.6" /><circle cx="19" cy="16" r="1.6" /><path d="M6.3 12.8L10.7 8.5M13.3 8.3l4.4 6" />
  </svg>
);

const IconMapPinOff = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c-3.5-4-6-7.2-6-10.5A6 6 0 0 1 16.6 6.4" />
    <path d="M19.8 13.5c.13-.63.2-1.3.2-2a6 6 0 0 0-1.3-3.7" />
    <circle cx="12" cy="10.5" r="2" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);
const IconRepeatOff = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V6a2 2 0 0 1 2-2h11" />
    <path d="M20 15v3a2 2 0 0 1-2 2H7" />
    <polyline points="17 1 21 5 17 9" />
    <polyline points="7 15 3 19 7 23" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);
const IconZoomQuestion = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <line x1="20" y1="20" x2="15.5" y2="15.5" />
    <path d="M8.5 9a2 2 0 1 1 2.6 1.9c-.6.2-1.1.7-1.1 1.3" />
    <line x1="10" y1="14.2" x2="10" y2="14.2" />
  </svg>
);
const IconDoorExit = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4v16" />
    <path d="M13 4H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6" />
    <polyline points="17 9 21 12 17 15" />
    <line x1="21" y1="12" x2="10.5" y2="12" />
  </svg>
);
const IcoShield = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

/* ---------------- Blocos do painel de detalhe ---------------- */

function StatCard({ theme, label, value, sublabel, accent }) {
  return (
    <div
      style={{
        background: accent ? `${theme.accent}14` : theme.cardAlt,
        border: `1px solid ${accent ? theme.accent + "40" : theme.border}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 11, color: accent ? theme.accent : theme.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: accent ? 19 : 15, fontWeight: 800, color: accent ? theme.accent : theme.text, lineHeight: 1.3 }}>
        {value}
      </div>
      {sublabel && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{sublabel}</div>}
    </div>
  );
}

function NumberedList({ theme, items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 11 }}>
          <div
            style={{
              width: 21,
              height: 21,
              borderRadius: 999,
              background: theme.cardAlt,
              color: theme.textMuted,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.6 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function LetteredList({ theme, items, danger }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 11 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: danger ? "#e05555" : theme.textMuted,
              flexShrink: 0,
              width: 16,
            }}
          >
            {String.fromCharCode(97 + i)}
          </div>
          <div style={{ fontSize: 13, color: danger ? theme.text : theme.text, lineHeight: 1.6 }}>
            {item.label && <b style={{ fontWeight: 700 }}>{item.label}: </b>}
            {item.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ theme, children, danger }) {
  return (
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        color: danger ? "#e05555" : theme.accent,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SetupDetail({ s, theme }) {
  return (
    <div style={{ padding: "24px 26px 28px" }}>
      {/* 1. Descrição do setup */}
      <div style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
        {s.descricao}
      </div>

      {/* 2. Cards: stop aceito, gestão dos ganhos, RxR pretendido */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 26 }}>
        <StatCard theme={theme} label="Stop aceito" value={s.stopAceito} />
        <StatCard theme={theme} label="Gestão dos ganhos" value={s.gestaoGanhos} />
        <StatCard theme={theme} label="RxR pretendido" value={s.rxr} accent />
      </div>

      {/* 3. Regras */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel theme={theme}>Regras</SectionLabel>
        <NumberedList theme={theme} items={s.regrasList} />
      </div>

      {/* 4. Filtros */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel theme={theme}>Filtros</SectionLabel>
        <NumberedList theme={theme} items={s.filtrosList} />
      </div>

      {/* 5. Onde invalida (veto + invalidação consolidados) */}
      <div
        style={{
          background: "#e0555518",
          border: "1px solid #e0555540",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#e05555",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            marginBottom: 6,
          }}
        >
          Onde invalida
        </div>
        <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.6 }}>{s.ondeInvalida}</div>
      </div>

      {/* 6. Gatilhos aceitos */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel theme={theme}>Gatilhos aceitos</SectionLabel>
        <LetteredList theme={theme} items={s.gatilhos} />
      </div>

      {/* 7. Red flags conhecidos */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel theme={theme} danger>Red flags conhecidos</SectionLabel>
        <LetteredList theme={theme} items={s.redFlagsList.map((t) => ({ text: t }))} danger />
      </div>

      {/* 8. Exemplos âncora */}
      <div>
        <SectionLabel theme={theme}>Exemplos âncora</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {s.exemplosList.map((ex, i) => (
            <div key={i} style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
              {ex}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupPopover({ s, theme, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "planoFadeIn 140ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 640,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            background: theme.card,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <s.Icon color={toneColor(s.fluencia.tone, theme)} />
            <div style={{ fontWeight: 700, color: theme.text, fontSize: 14.5 }}>{s.nome}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              border: "none",
              background: theme.cardAlt,
              color: theme.textMuted,
              cursor: "pointer",
              fontSize: 15,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <SetupDetail s={s} theme={theme} />
      </div>
    </div>
  );
}

/* ---------------- Tabela comparativa de setups (abre popup ao clicar) ---------------- */

function SetupsTable({ theme, setups }) {
  const [openId, setOpenId] = useState(null);
  const openSetup = setups.find((s) => s.id === openId);

  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            minWidth: 700,
          }}
        >
          <thead>
            <tr>
              {["Setup", "Timeframe", "Barra de sinal", "Split / RxR", "Fluência", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    background: theme.cardAlt,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {setups.map((s, i) => {
              const Icon = s.Icon;
              return (
                <tr
                  key={s.id}
                  onClick={() => setOpenId(s.id)}
                  style={{
                    cursor: "pointer",
                    background: i % 2 === 1 ? `${theme.cardAlt}80` : "transparent",
                  }}
                >
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: toneBg(s.fluencia.tone, theme),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon color={toneColor(s.fluencia.tone, theme)} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: theme.text }}>{s.nomeCurto}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>{s.subtitulo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}>
                    {s.timeframeShort}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}>
                    {s.barraSinalChips.join(" · ")}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontWeight: 700, color: theme.text }}>{s.split}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted }}>{s.rxr}</div>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}>
                    <Pill theme={theme} tone={s.fluencia.tone}>{s.fluencia.label}</Pill>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, textAlign: "center", color: theme.textMuted }}>
                    <IcoChevron open={false} color={theme.textMuted} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openSetup && <SetupPopover s={openSetup} theme={theme} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/* ---------------- Tabela de gestão de saída por contrato ---------------- */

function TabelaSaida({ theme }) {
  const rows = [
    { ctts: 7, stopMax: "150 pts", plano: "Parcial de 2x1 ainda antes dos 450pts" },
    { ctts: 6, stopMax: "175 pts", plano: "Parcial de 2x1 ainda antes dos 450pts" },
    { ctts: 5, stopMax: "200 pts", plano: "Parcial de 2x1 ainda antes dos 450pts" },
    { ctts: 4, stopMax: "250 pts", plano: "Parcial de 2x1 pouco além dos 450 → realizar em 450" },
    { ctts: 3, stopMax: "300 pts", plano: "1 em 1x1, 1 em 1,5x1 (450), 1 em 2x1" },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <thead>
          <tr>
            {["Contratos", "Stop máximo", "Plano de saída"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderBottom: `1px solid ${theme.border}`,
                  color: theme.accent,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ctts}>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${theme.border}`, color: theme.text, fontWeight: 700 }}>
                {r.ctts} ctts
              </td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${theme.border}`, color: theme.text }}>
                {r.stopMax}
              </td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}>
                {r.plano}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Dados dos setups ---------------- */

const SETUPS = [
  {
    id: "trm",
    nomeCurto: "TRM",
    nome: "TRM — Trade de Retorno às Médias",
    subtitulo: "Retorno às médias",
    Icon: IconTRM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside/outside", "Martelo/invertido", "Engolfo"],
    stopAceito: "Até 300pts",
    split: "3/1/1",
    rxr: "1,2x1",
    gestaoGanhos: "60% em 1x1 · 20% em 300pts · 20% em 400pts",
    badge: "Fluente",
    badgeColor: { bg: "#4ecb8d22", text: "#4ecb8d" },
    fluencia: { label: "Fluente", tone: "good", detalhe: "80% de acerto no período (4G/1L/1BE em 6 trades)" },
    descricao: "Mercado esticado demais de um movimento direcional atinge um ponto de resistência real (confluência de níveis), onde a probabilidade de continuidade cai e a de reação/correção sobe — captura o \"elástico esticado\" antes de um retorno às médias.",
    regrasList: [
      "Mercado esticado — 3+ barras do M5 sem tocar a MME9 do M5",
      "Região de trava presente — S/R, LT/CL, Fibo, MA longa ou VWAP",
      "Gatilho de qualidade adequada dentro da região",
    ],
    filtrosList: [
      "Confluência de 2 a 3 níveis coincidindo na mesma região",
      "A favor da tendência macro (semanal/diário)",
      "Espaço até a MME9 do M2 suficiente para viabilizar a parcial",
    ],
    ondeInvalida: "Sem o esticamento mínimo (3+ barras sem tocar a MME9 do M5), o setup nem é candidato. Já posicionado, invalida se o preço romper além do nível de origem da reação — na maioria dos casos, isso já coincide com o stop técnico.",
    gatilhos: [
      { label: "Melhor", text: "inside/outside favoráveis à reversão" },
      { label: "Bom", text: "martelo/invertido, engolfo" },
      { label: "Aceitável", text: "doji ou cor oposta, só como inside e com pavio de força clara a favor da reversão — do contrário, não se enquadra" },
    ],
    redFlagsList: [
      "Entrar sem espaço até a MME9 do M2 — mata a possibilidade de realizar a parcial",
      "Pegar reação contra o M2 sem confirmação de fechamento — entrada por violação antecipa o que a barra ainda não provou",
      "Doji fora do critério — cor a favor da reversão mas sem pavio de força real, tratado como se fosse válido",
    ],
    exemplosList: [
      "22/06 — DB exato macro + alvo 3 pivô + alvo 1 pivô maior + inside. Trade impecável.",
      "12/06 — DB exato + inside positiva na região + 61,8% da perna macro.",
    ],
  },
  {
    id: "fq",
    nomeCurto: "FQ",
    nome: "FQ — Falha de Estrutura",
    subtitulo: "Falha de estrutura",
    Icon: IconFQ,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Martelo/invertido", "2BR", "Inside", "Outside"],
    stopAceito: "Até 250pts",
    split: "3/1/1",
    rxr: "1,3x1",
    gestaoGanhos: "60% em 1x1 · 20% em 300pts · 20% em 400pts",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "Reformulado com o Mateus, jul/2026 — histórico anterior: 41% de acerto" },
    descricao: "Falha de continuidade expõe traders posicionados a favor da tendência com stop técnico no nível que acabou de ser rompido — a quebra de estrutura gera o próprio combustível da reversão ao acionar esses stops. Fechado para exigir região de alta confluência e condição que já demonstre força reversiva real, não hipotética. Papel no operacional: (a) alternativa ao TRM quando esticado mas sem ter dado para participar; (b) captura de reversão real numa localização onde a reversão já era esperada e a força reversiva já aconteceu, deixando correção + gatilho.",
    regrasList: [
      "Região — mínimo 2 de 4 simultâneas: topo/fundo isolado",
      "S/R validado (2+ toques prévios)",
      "Médias do tempo gráfico maior",
      "Alvo de fibo + 1 confluência adicional",
    ],
    filtrosList: [
      "Condição (uma das duas) — Esticado: 3+ candles afastado da MME9 do M5, com espaço para 1x1 na MME9 do M2",
      "Estruturado: quebra de microestrutura anterior + calço da MME9 do M2 + espaço gráfico de 1x1 até o T/F mais próximo",
    ],
    ondeInvalida: "Sem uma das duas condições (esticado ou estruturado) com o espaço gráfico exigido, não há trade — veto automático. Já posicionado, invalida se o preço retornar além do nível que gerou a falha — isso é continuação disfarçada, não FQ.",
    gatilhos: [
      { label: "a", text: "Martelo/martelo invertido" },
      { label: "b", text: "2BR (inclui engolfo)" },
      { label: "c", text: "Inside bar favorável, ou doji com fechamento nos 30% superiores/inferiores + pavio consistente" },
      { label: "d", text: "Outside bar" },
    ],
    redFlagsList: [
      "Doji fora do critério objetivo de pavio — cor a favor sem o fechamento nos 30% + pavio consistente exigido",
      "Região com só 1 confluência — abaixo do mínimo de 2 exigido",
      "Condição sem espaço gráfico (esticado sem espaço até a 9 do M2, ou estruturado sem espaço até o T/F) — veto automático, não apenas red flag",
    ],
    exemplosList: [
      "29/06 — FQ realmente acima da 9 e da VWAP, vindo da MM20 do 60' + 50% fibo do dia anterior.",
    ],
  },
  {
    id: "tc-mm",
    nomeCurto: "TC Meio de Mov.",
    nome: "TC — Meio de Movimento (MME9)",
    subtitulo: "Pullback na MME9",
    Icon: IconTCMM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Padrão", "Inside/outside reforça"],
    stopAceito: "Até 300pts",
    split: "3/1/1",
    rxr: "1,2x1",
    gestaoGanhos: "60% em 1x1 · 20% em 300pts · 20% em 400pts",
    badge: "Funcional",
    badgeColor: { bg: "#4ecb8d22", text: "#4ecb8d" },
    fluencia: { label: "Funcional", tone: "good", detalhe: "54% de acerto no período" },
    descricao: "Dentro de uma tendência já estabelecida, o pullback até a média de referência oferece entrada de continuidade — o viés a favor já está validado pelo alinhamento das médias.",
    regrasList: [
      "Médias alinhadas — 9>20>50>200 (ou inverso na baixa)",
      "Estrutura de tendência prévia — mínimo 2 T/F/T/F",
      "Preço calçado na MME9 ou MME20",
    ],
    filtrosList: [
      "Espaço gráfico mínimo 1x1 até o próximo alvo",
      "Gatilho a favor do 60'/D",
      "VWAP próxima e confluência no ponto de PB",
      "Ausência de FQ contra (ou FQ a favor reforça)",
    ],
    ondeInvalida: "Sem médias alinhadas e estrutura de tendência prévia, o setup não é candidato. Já posicionado, invalida no T/F prévio do swing que sustenta a correção — a menos que a barra de sinal seja especial (inside/outside), que já protege sozinha contra violinada.",
    gatilhos: [
      { label: "Padrão", text: "não precisa ser excepcional" },
      { label: "Reforça", text: "inside/outside, quando é ela mesma a fonte de invalidação" },
    ],
    redFlagsList: [
      "Entrar sem estrutura de tendência clara no M5",
      "Pullback raso após pullback profundo exige barra de sinal 10/10",
      "Usar doji fora de contexto muito favorável",
    ],
    exemplosList: [
      "15/06 — TC na 9 com boa barra, manteve disciplina apesar de tensão durante o trade (\"MUITO BOM não ter desistido\"), pagou bem.",
    ],
  },
  {
    id: "tc-pos",
    nomeCurto: "TC Pós BO",
    nome: "TC — Pós BO (rompimento)",
    subtitulo: "Continuidade pós-rompimento",
    Icon: IconTCPos,
    timeframeShort: "M2 / M5 (janela 40 barras)",
    barraSinalChips: ["Inside", "Outside", "Martelo/shooting star", "2BR"],
    stopAceito: "Até 300pts",
    split: "2/2/1",
    rxr: "1,6x1",
    gestaoGanhos: "40% em 1x1 · 40% em 400pts · 20% em 550pts",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "44% de acerto no período, raiz recém-reformulada" },
    descricao: "Captura continuidade após um rompimento genuíno de uma região relevante (lateralidade mín. 2T/2F, triângulo, ou máx/mín do dia) que já provou ter distanciado e retornado — é o teste do rompimento, não a entrada nele.",
    regrasList: [
      "Precisa ter rompido de fato — sem TC de pós de topo/fundo micro",
      "Barra de rompimento fechando perto do extremo",
      "Barra de continuidade a favor — peso inverso: rompimento fraco pede continuidade forte, e vice-versa",
    ],
    filtrosList: [
      "Timeframe M2 se o nível está contido em até ~40 barras (~80min); acima disso, sobe para M5/M15",
      "Gatilho a favor do 60'/D e VWAP próxima",
      "Confluência no ponto de retorno",
      "Ausência de FQ contra",
    ],
    ondeInvalida: "Sem afastamento real e barra de continuidade a favor, não há candidato — mesmo com as duas confirmadas, se o preço não avançar antes de puxar o pullback, desconfiar. Já posicionado, invalida na própria barra de sinal: perder a mín/máx dela na sequência é falha confirmada.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "Martelo/shooting star" },
      { label: "d", text: "2BR" },
    ],
    redFlagsList: [
      "Romper topo/fundo micro sem afastamento real — \"fez zero sentido no M5\"",
      "Entrar antecipado na 9 do 2' em vez de esperar o toque na 9 do 5' ou na região rompida",
      "Repetir entrada na mesma região após stop",
      "Operar em ponto de decisão ainda aberto",
    ],
    exemplosList: [
      "17/06 — par de comparação: 1º trade (antecipado na 9 do 2', loss) vs. 2º trade no mesmo dia (esperou o toque na 9 do 5', +355pts).",
    ],
  },
  {
    id: "tc-super",
    nomeCurto: "TC Supertrend",
    nome: "TC — Supertrend (9 do 2')",
    subtitulo: "9 do M2",
    Icon: IconTCSuper,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Padrão"],
    stopAceito: "Até 300pts",
    split: "—",
    rxr: "—",
    gestaoGanhos: "— (amostra insuficiente)",
    badge: "Coletando dados",
    badgeColor: { bg: "#88888822", text: "#9aa3b2" },
    fluencia: { label: "Sem amostra", tone: "neutral", detalhe: "Poucas ocorrências com a regra já formalizada — observar próximas entradas" },
    descricao: "Mesmo cenário de tendência com médias alinhadas do TC de MM, mas usa especificamente a MME9 do M2 — exige que ela já tenha se provado como suporte/resistência viva antes, evitando ser o primeiro a testar um nível ainda não validado.",
    regrasList: [
      "Médias alinhadas (9>20>50>200)",
      "MME9 do M2 já reagiu pelo menos 1x antes — nunca ser o primeiro",
      "Pullback até a MME9 do M2, dentro do histórico de reação já estabelecido",
    ],
    filtrosList: [
      "Mesmos do TC de Meio de Movimento — gatilho a favor do 60'/D",
      "Confluência e ausência de FQ contra",
    ],
    ondeInvalida: "Sem histórico de reação prévia na 9 do M2, o setup não é candidato. Já posicionado, invalida no T/F prévio do swing — mesmo princípio do TC de Meio de Movimento.",
    gatilhos: [
      { label: "Padrão", text: "mesma lógica do TC de Meio de Movimento" },
    ],
    redFlagsList: [
      "Ser pioneiro na 9 do 2' sem histórico de reação prévia",
      "Médias desalinhadas mascarando tendência ainda não confirmada",
    ],
    exemplosList: [
      "A acumular — nenhum caso recente isolado o suficiente com a regra já formalizada.",
    ],
  },
];

/* ---------------- Componente principal ---------------- */

export default function PlanoTrade({ th }) {
  const theme = useTheme(th);

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "24px 32px 60px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: theme.text,
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes planoFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>Plano de trade</div>
        <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
          Trading System Starter · atualizado julho/2026
        </div>
      </div>

      {/* FILOSOFIA — 2 colunas: Filosofia Operacional | Mentalidade e Princípios base */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 28,
          marginBottom: 28,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, lineHeight: 1.2, marginBottom: 18 }}>
            Filosofia operacional
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
              O que procuro no mercado
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              Não movimentos. Meu operacional nos melhores contextos — momentos raros de
              probabilidade elevada onde o preço se encaixa naquilo que meu repertório permite
              operar com convicção.
            </div>
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
              Objetivo
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              Seguir o plano. Não é ganhar dinheiro no trade de hoje — é executar o processo que,
              seguido com consistência, gera resultado ao longo do tempo.
            </div>
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
              Critério de seletividade
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              Sempre que parecer "mais ou menos", esperar. Vem sinal melhor. Só o que eu faria
              100 vezes de novo, independente do resultado desse trade específico.
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, lineHeight: 1.2, marginBottom: 18 }}>
            Mentalidade e princípios base
          </div>

          <div
            style={{
              borderLeft: `2px solid ${theme.accent}`,
              paddingLeft: 18,
              paddingTop: 12,
              paddingBottom: 12,
              marginBottom: 18,
              background: `${theme.accent}12`,
              borderRadius: "0 10px 10px 0",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 4 }}>
              Mentalidade
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              2 a 3 trades por dia. Seletivo. Só o que faria 100x de novo, independente do
              resultado desse trade.
            </div>
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 8 }}>
              Princípios-guia
            </div>
            <Quote theme={theme}>
              Profissionais pensam, sentem e agem diferente de perdedores. Mudar é difícil, mas
              virar profissional exige comprometimento com essa mudança de postura.
            </Quote>
            <Quote theme={theme}>
              Ir all-in no trading é fazer o que sei ser necessário para ter sucesso. Não vou
              chegar lá mais rápido sendo exceção — preciso cortar a ideia de que "é diferente"
              pra mim e realmente me comprometer.
            </Quote>
            <Quote theme={theme}>
              No mercado, humildade é essencial — e às vezes a pessoa mais humilde que acho
              que sou ainda precisa melhorar muito.
            </Quote>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: "28px 0" }} />

      {/* GESTÃO DE SAÍDA | REGRAS UNIVERSAIS — 2 colunas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <IconDoorExit color={theme.accent} />
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>
              Gestão de saída · MEP/MEN real
            </div>
          </div>
          <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
            Apenas 26% dos vencedores passam de 500pts. Fechar a maior parte da posição por
            volta de 450pts captura a maioria do movimento antes da zona de reversão mais
            provável. Detalhe completo do split por setup na tabela de setups abaixo.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { ctts: "7 ctts", pts: "150 pts" },
              { ctts: "6 ctts", pts: "175 pts" },
              { ctts: "5 ctts", pts: "200 pts" },
              { ctts: "4 ctts", pts: "250 pts" },
              { ctts: "3 ctts", pts: "300 pts" },
            ].map((c) => (
              <div
                key={c.ctts}
                style={{
                  background: theme.cardAlt,
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "center",
                  minWidth: 70,
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: 11, color: theme.textMuted }}>{c.ctts}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.text, marginTop: 2 }}>{c.pts}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <IcoShield color={theme.accent} />
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Regras universais</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            {[
              { Icon: IconMapPinOff, text: "Ponto de decisão: não faço nada" },
              { Icon: IconRepeatOff, text: "Não tomo 2 stops na mesma região" },
              { Icon: IconZoomQuestion, text: "Não pego trades que não fazem sentido no M5" },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  background: theme.cardAlt,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <r.Icon color={theme.textMuted} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.text, marginTop: 10, lineHeight: 1.4 }}>
                  {r.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SETUPS */}
      <div style={{ margin: "24px 0 12px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Setups — Trading System Starter</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>
          Pré BO pausado no momento.
        </div>
      </div>

      <SetupsTable theme={theme} setups={SETUPS} />
    </div>
  );
}
