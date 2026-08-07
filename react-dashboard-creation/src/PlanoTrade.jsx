import React, { useState, useEffect } from "react";

/*
  PlanoTrade.jsx
  ---------------------------------------------------------------
  Página "Plano de Trade" — atualizada conforme o Plano Operacional
  de Agosto/2026.

  Principais mudanças desta versão:
  - FQ encerrado (mantido na tabela, riscado e em cinza, por último)
  - Novos setups: Trade de Abertura (TSS), Abertura Barra de Força, TL
  - Stop técnico substituindo stop aritmético
  - Regra de saída: o ALVO decide, não a quantidade
  - Risco e tabela de contratos de agosto
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
  const bg = th?.bg ?? FALLBACK_THEME.bg;
  const isDark = th?.dark ?? (bg.startsWith("#0") || bg.startsWith("#1"));
  return {
    bg,
    isDark,
    card: th?.cardBg ?? th?.surface ?? FALLBACK_THEME.card,
    // camada de elevacao: clareia sobre qualquer fundo escuro, adapta a todos os temas
    cardAlt: isDark ? "rgba(255,255,255,0.05)" : (th?.resumeBg ?? FALLBACK_THEME.cardAlt),
    border: isDark ? "rgba(255,255,255,0.11)" : (th?.border ?? FALLBACK_THEME.border),
    text: th?.text ?? FALLBACK_THEME.text,
    textMuted: th?.textSub ?? th?.textMuted ?? FALLBACK_THEME.textMuted,
    // segue o accent do tema selecionado
    accent: th?.accent ?? ACCENT,
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
                  fontSize: 13.5,
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
              fontSize: 12,
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
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: theme.accent,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: theme.text }}>
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
    off: { bg: "#88888818", text: "#7d838d" },
  };
  const c = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
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
        fontSize: 14.5,
        fontStyle: "italic",
        color: theme.text,
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
    off: "#88888818",
  };
  return tones[tone] || tones.neutral;
}
function toneColor(tone, theme) {
  const tones = {
    neutral: theme.textMuted,
    good: theme.accent,
    warn: "#e0a63a",
    bad: "#e05555",
    off: "#7d838d",
  };
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
const IconAbertura = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const IconForca = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z" />
  </svg>
);
const IconTL = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h18" /><path d="M3 17h18" /><path d="M7 7v10M17 7v10" />
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
const IcoRisk = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l9 16H3l9-16z" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="12" y1="17" x2="12" y2="17" />
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
      <div style={{ fontSize: 12, color: accent ? theme.accent : theme.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: accent ? 19 : 15, fontWeight: 800, color: accent ? theme.accent : theme.text, lineHeight: 1.3 }}>
        {value}
      </div>
      {sublabel && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{sublabel}</div>}
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
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>{item}</div>
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
              fontSize: 13,
              fontWeight: 700,
              color: danger ? "#e05555" : theme.textMuted,
              flexShrink: 0,
              width: 16,
            }}
          >
            {String.fromCharCode(97 + i)}
          </div>
          <div style={{ fontSize: 14, color: danger ? theme.text : theme.text, lineHeight: 1.6 }}>
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
        fontSize: 12.5,
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
      {/* Aviso de setup encerrado */}
      {s.encerrado && (
        <div
          style={{
            background: "#88888814",
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7d838d", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>
            Setup encerrado — 30/07/2026
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>{s.motivoEncerramento}</div>
        </div>
      )}

      {/* 1. Descrição do setup */}
      <div style={{ fontSize: 14.5, color: theme.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
        {s.descricao}
      </div>

      {/* 2. Cards: stop, gestão dos ganhos, RxR pretendido */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 26 }}>
        <StatCard theme={theme} label="Stop (técnico)" value={s.stopAceito} />
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

      {/* 5. Onde invalida */}
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
            fontSize: 12.5,
            fontWeight: 700,
            color: "#e05555",
            textTransform: "uppercase",
            letterSpacing: 0.4,
            marginBottom: 6,
          }}
        >
          Onde invalida
        </div>
        <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>{s.ondeInvalida}</div>
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
            <div key={i} style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
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
            <div
              style={{
                fontWeight: 700,
                color: s.encerrado ? "#7d838d" : theme.text,
                fontSize: 14.5,
                textDecoration: s.encerrado ? "line-through" : "none",
              }}
            >
              {s.nome}
            </div>
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
              fontSize: 16,
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

function SetupsTable({ theme, setups: setupsRaw }) {
  const [openId, setOpenId] = useState(null);
  // ordem alfabetica; setups encerrados sempre ao final
  const setups = [...setupsRaw].sort((a, b) => {
    if (!!a.encerrado !== !!b.encerrado) return a.encerrado ? 1 : -1;
    return a.nomeCurto.localeCompare(b.nomeCurto, "pt-BR");
  });
  const openSetup = setups.find((s) => s.id === openId);

  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14.5,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            minWidth: 700,
          }}
        >
          <thead>
            <tr>
              {["Setup", "Timeframe", "Barra de sinal", "Saída / RxR", "Fluência", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                    fontSize: 13,
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
              const off = !!s.encerrado;
              const corTexto = off ? "#7d838d" : theme.text;
              const corSub = off ? "#6b7078" : theme.textMuted;
              const risco = off ? "line-through" : "none";
              return (
                <tr
                  key={s.id}
                  onClick={() => setOpenId(s.id)}
                  style={{
                    cursor: "pointer",
                    background: i % 2 === 1 ? `${theme.cardAlt}80` : "transparent",
                    opacity: off ? 0.6 : 1,
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
                        <div style={{ fontWeight: 700, color: corTexto, textDecoration: risco }}>{s.nomeCurto}</div>
                        <div style={{ fontSize: 12, color: corSub }}>{s.subtitulo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, color: corSub }}>
                    {s.timeframeShort}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}`, color: corSub }}>
                    {s.barraSinalChips.join(" · ")}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontWeight: 700, color: corTexto, textDecoration: risco }}>{s.split}</div>
                    <div style={{ fontSize: 12, color: corSub }}>{s.rxr}</div>
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

/* ---------------- Dados dos setups ---------------- */

const SETUPS = [
  {
    id: "trm",
    nomeCurto: "TRM",
    nome: "TRM — Trade de Retorno às Médias",
    subtitulo: "Retorno às médias",
    Icon: IconTRM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Atrás da barra de sinal + gordura 20–30%",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo curto: 100% no alvo · Alvo aberto: parcial 1x1 + carrega (3+ ctts)",
    badge: "Atenção",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Atenção", tone: "warn", detalhe: "Historicamente o setup mais confiável, mas fechou julho em −4R" },
    descricao: "Mercado esticado demais de um movimento direcional atinge um ponto de resistência real (confluência de níveis), onde a probabilidade de continuidade cai e a de reação/correção sobe — captura o \"elástico esticado\" antes de um retorno às médias.",
    regrasList: [
      "Mercado esticado — 3+ barras afastado da MME9",
      "Região de trava / alvo / confluência presente — S/R, LT/CL, Fibo, MA longa ou VWAP",
      "Gatilho de qualidade adequada dentro da região",
    ],
    filtrosList: [
      "Confluência de 2 a 3 níveis coincidindo na mesma região",
      "A favor da tendência macro (semanal/diário)",
      "Espaço até a MME9 do M2 suficiente para viabilizar a parcial",
      "Só entrar quando a direção contrária não fizer sentido — havendo argumento razoável para o outro lado, segurar",
    ],
    ondeInvalida: "Stop técnico atrás da barra de sinal, com gordura de 20–30% do tamanho da barra: barra de ~100–150 pts → ~30 pts; ~200 pts → 50–60 pts; ~400 pts → 50–100 pts no máximo. Sem o esticamento mínimo de 3+ barras da MME9, o setup nem é candidato.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
    ],
    redFlagsList: [
      "Entrar sem espaço até a MME9 do M2 — mata a possibilidade de realizar a parcial",
      "Pegar reação contra o M2 sem confirmação de fechamento",
      "Ignorar o caso contrário legítimo na mesma região — foi o que gerou o −4R de julho",
    ],
    exemplosList: [
      "22/06 — DB exato macro + alvo 3 pivô + alvo 1 pivô maior + inside. Trade impecável.",
      "29/07 — TRM de compra das ~10h30: havia argumentos a favor E contra na mesma região. Deu mais peso ao lado a favor e stopou. Origem do filtro do lado contrário.",
    ],
  },
  {
    id: "tc-mm",
    nomeCurto: "TC Meio de Mov.",
    nome: "TC — Meio de Movimento (MME9)",
    subtitulo: "Pullback na MME9",
    Icon: IconTCMM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Barra de sinal (se excelente) ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "2 ctts: 100% no 1x1 (regra de agosto) · 3+ ctts: parcial 1x1 + carrega",
    badge: "Funcional",
    badgeColor: null,
    fluencia: { label: "Funcional", tone: "good", detalhe: "Setup de continuidade — apoia-se no que o mercado já demonstrou" },
    descricao: "Dentro de uma tendência já estabelecida, o pullback até a média de referência oferece entrada de continuidade — o viés a favor já está validado pelo alinhamento completo das médias.",
    regrasList: [
      "Alinhamento COMPLETO de todas as médias — 200/50/20/9 (regra nova de agosto)",
      "Estrutura de tendência prévia — mínimo 2 T/F/T/F",
      "Preço calçado na MME9 ou MME20",
    ],
    filtrosList: [
      "Espaço gráfico mínimo 1x1 até o próximo alvo",
      "Gatilho a favor do 60'/D",
      "VWAP próxima e confluência no ponto de PB",
    ],
    ondeInvalida: "Stop atrás da barra de sinal se ela for excelente (mesma gordura de 20–30%); caso contrário, no T/F prévio ou no ponto de invalidação total da leitura. Sem alinhamento completo das médias e estrutura de tendência prévia, o setup não é candidato.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR — barra de força revertendo barra de força contrária" },
    ],
    redFlagsList: [
      "Entrar sem alinhamento completo das médias",
      "Pullback raso após pullback profundo exige barra de sinal 10/10",
      "Com 2 contratos, tentar carregar em vez de sair 100% no 1x1 — decisão discricionária com lucro na tela é onde a execução mais oscila",
    ],
    exemplosList: [
      "29/07 — b30 do M5: 1º PB na MME9 após impulso + micro canal, quase 20 barras abaixo da MM20, barra de sinal inside minúscula. Pagou.",
      "29/07 — b44 do M5: MME9 seguindo segurando os preços, excelente barra de sinal quase tocando a MM20, bom espaço até as mínimas do dia.",
    ],
  },
  {
    id: "tc-pos",
    nomeCurto: "TC Pós BO",
    nome: "TC — Pós BO (rompimento)",
    subtitulo: "Continuidade pós-rompimento",
    Icon: IconTCPos,
    timeframeShort: "M2 / M5 (janela 40 barras)",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Barra de sinal (se excelente) ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "2 ctts: 100% no 1x1 (regra de agosto) · 3+ ctts: parcial 1x1 + carrega",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "Subtipo com histórico mais fraco — exige rigor no critério de rompimento" },
    descricao: "Captura continuidade após um rompimento genuíno de uma região relevante (lateralidade mín. 2T/2F, triângulo, ou máx/mín do dia) que já provou ter distanciado e retornado — é o teste do rompimento, não a entrada nele.",
    regrasList: [
      "Precisa ter rompido de fato — sem TC de pós de topo/fundo micro",
      "Barra de rompimento fechando perto do extremo",
      "Barra de continuidade a favor — peso inverso: rompimento fraco pede continuidade forte, e vice-versa",
      "Alinhamento completo das médias (regra de agosto)",
    ],
    filtrosList: [
      "Timeframe M2 se o nível está contido em até ~40 barras (~80min); acima disso, sobe para M5/M15",
      "Gatilho a favor do 60'/D e VWAP próxima",
      "Confluência no ponto de retorno",
    ],
    ondeInvalida: "Stop atrás da barra de sinal se ela for excelente; caso contrário, no T/F prévio. Sem afastamento real e barra de continuidade a favor, não há candidato — mesmo com as duas confirmadas, se o preço não avançar antes de puxar o pullback, desconfiar.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
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
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Barra de sinal (se excelente) ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "2 ctts: 100% no 1x1 (regra de agosto) · 3+ ctts: parcial 1x1 + carrega",
    badge: "Coletando dados",
    badgeColor: { bg: "#88888822", text: "#9aa3b2" },
    fluencia: { label: "Sem amostra", tone: "neutral", detalhe: "Poucas ocorrências com a regra já formalizada — observar próximas entradas" },
    descricao: "Mesmo cenário de tendência com médias alinhadas do TC de MM, mas usa especificamente a MME9 do M2 — exige que ela já tenha se provado como suporte/resistência viva antes, evitando ser o primeiro a testar um nível ainda não validado.",
    regrasList: [
      "Alinhamento completo das médias (200/50/20/9)",
      "MME9 do M2 já reagiu pelo menos 1x antes — nunca ser o primeiro",
      "Pullback até a MME9 do M2, dentro do histórico de reação já estabelecido",
    ],
    filtrosList: [
      "Mesmos do TC de Meio de Movimento — gatilho a favor do 60'/D",
      "Confluência no ponto de entrada",
    ],
    ondeInvalida: "Stop atrás da barra de sinal se excelente; caso contrário, no T/F prévio do swing. Sem histórico de reação prévia na 9 do M2, o setup não é candidato.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
    ],
    redFlagsList: [
      "Ser pioneiro na 9 do 2' sem histórico de reação prévia",
      "Médias desalinhadas mascarando tendência ainda não confirmada",
    ],
    exemplosList: [
      "29/07 — b26 do M5: acionado na b65 do M2 com inside bar; 1ª correção após micro canal de 6 barras sem sinal de CLX; inside tanto no M5 quanto no M2.",
    ],
  },
  {
    id: "ta",
    nomeCurto: "Trade de Abertura",
    nome: "TA — Trade de Abertura (TSS)",
    subtitulo: "Volatilidade inicial",
    Icon: IconAbertura,
    timeframeShort: "M5/M15 · entrada a mercado",
    barraSinalChips: ["Não se aplica"],
    stopAceito: "Máximo 250 pts",
    split: "Parcial 1x1 fixa",
    rxr: "2x1+",
    gestaoGanhos: "Parcial no 1x1 com 50% ou 2/3 · alvo final 2x1 em diante",
    badge: "Ativo",
    badgeColor: null,
    fluencia: { label: "Ativo", tone: "good", detalhe: "Setup do repertório TSS — gestão validada estatisticamente pelo Mateus" },
    descricao: "Capturar a volatilidade inicial do mercado, levando em conta como estão os mercados externos correlacionados ao nosso antes da nossa abertura. Entrada sempre a mercado — não espera barra de sinal.",
    regrasList: [
      "Cálculo da abertura aponta a direção (alta / baixa / lateral)",
      "Trade precisa estar em região de compra ou de venda",
      "Entrada sempre a mercado — não espera barra de sinal",
      "Só nos primeiros 15 minutos de mercado",
    ],
    filtrosList: [
      "Só faço TA se houver escora",
      "Só faço TA se já queria comprar ou vender naquela região no pré-mercado",
      "Mercados externos correlacionados lidos antes da abertura",
    ],
    ondeInvalida: "Stop máximo de 250 pts. Fora da janela dos primeiros 15 minutos, sem escora, ou em região que não estava no plano do pré-mercado, o trade não existe.",
    gatilhos: [
      { label: "Entrada", text: "a mercado — não há barra de sinal neste setup" },
    ],
    redFlagsList: [
      "Entrar sem escora",
      "Entrar em região que não estava no plano do pré-mercado",
      "Esticar a janela além dos primeiros 15 minutos",
      "Mexer na parcial do 1x1 — é regra do Mateus e a estatística do setup toda se apoia nela",
    ],
    exemplosList: [
      "A acumular — tag própria criada no diário em agosto/2026.",
    ],
  },
  {
    id: "abertura-forca",
    nomeCurto: "Abertura — Barra de Força",
    nome: "Abertura com Barra de FORÇA",
    subtitulo: "Impulso da b1/b2",
    Icon: IconForca,
    timeframeShort: "M5 (janela) → M2 (gatilho)",
    barraSinalChips: ["A própria barra de força"],
    stopAceito: "Atrás da barra forte · teto 600 pts",
    split: "100% no alvo",
    rxr: "1x1",
    gestaoGanhos: "Alvo SEMPRE 1x1 da própria barra · saída 100% no alvo, sem parcial",
    badge: "Novo",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Novo", tone: "warn", detalhe: "Setup novo, sem histórico — tag própria no diário para atribuição em setembro" },
    descricao: "A primeira barra forte da abertura carrega o desequilíbrio inicial do dia. Opera esse impulso enquanto ele ainda é jovem, com alvo curto e objetivo.",
    regrasList: [
      "Janela até a b2 do M5 (até 9h10)",
      "Um dos três gatilhos presentes (ver abaixo)",
      "Não operar contra a força do gap",
    ],
    filtrosList: [
      "Premissa prévia definida no pré-mercado",
      "Localização da abertura — compradora / vendedora / neutra (neutra não opera)",
      "Teto de stop de 600 pts na abertura",
    ],
    ondeInvalida: "Stop atrás da própria barra forte; ou na abertura da barra, se a reversão do corpo já invalidar a leitura. Fora da janela até a b2 do M5, não é mais este setup.",
    gatilhos: [
      { label: "a", text: "Barra expressiva no M2+ revertendo fechamentos anteriores" },
      { label: "b", text: "Rompimento de região importante a favor de premissa prévia" },
      { label: "c", text: "Falha de gap em região de trava — sem operar contra a força do gap" },
    ],
    redFlagsList: [
      "Perseguir movimento já esticado",
      "Operar contra o gap",
      "Forçar entrada fora da janela da b2",
      "Segurar além do 1x1 — o alvo deste setup é fixo",
    ],
    exemplosList: [
      "A acumular — setup estreando em agosto/2026.",
    ],
  },
  {
    id: "tl",
    nomeCurto: "TL",
    nome: "TL — Trade de Lateralidade",
    subtitulo: "Extremos de range",
    Icon: IconTL,
    timeframeShort: "M5 (range) → M2 (gatilho)",
    barraSinalChips: ["Inside/outside favorável", "Martelo", "Shooting star"],
    stopAceito: "20% além do extremo do range (recalibrar)",
    split: "100% no alvo",
    rxr: "1x1",
    gestaoGanhos: "Alvo = 50% do range · saída 100% no alvo, sem parcial",
    badge: "Novo no TSS",
    badgeColor: null,
    fluencia: { label: "Maduro", tone: "good", detalhe: "Configuração já executada com sucesso no OTS (EQL) — nova apenas no operacional TSS" },
    descricao: "Em lateralidade, os extremos do range são onde a probabilidade de reversão é maior e o risco é mais barato. Opera o que o mercado já demonstrou — range validado — e não o que ele pode vir a fazer. Ocupa o vácuo que antes era preenchido pelo FQ: operar extremos em dias travados.",
    regrasList: [
      "TR com 2 topos E 2 fundos JÁ demarcados — estrutura pré-existente, nunca antecipada",
      "Preço tocando extremo do range validado",
      "Barra de sinal clara obrigatória",
      "Espaço de 1x1 até os 50% do range",
    ],
    filtrosList: [
      "Direção preferida da lateralidade, quando houver",
      "Qualidade do extremo — isolado, já testado",
      "Variação: ordem limite abaixo/acima da b1 quando ela for doji AMPLO (500pts+), a favor de premissa",
    ],
    ondeInvalida: "20% além do extremo do range — nunca colado em máxima/mínima isolada. ATENÇÃO: esta regra foi herdada do EQL do OTS e os replays mostraram que todos os stops levados em EQL vieram de stop muito próximo dos 20%, com o preço violando e o trade dando certo depois. Recalibrar antes de rodar em volume.",
    gatilhos: [
      { label: "a", text: "Inside bar favorável" },
      { label: "b", text: "Outside bar favorável" },
      { label: "c", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Operar range que ainda está se formando — exige 2 topos E 2 fundos já demarcados",
      "Passar a depender de antecipar algo — se isso acontecer, virou outra coisa",
      "Stop colado no extremo — é justamente o defeito herdado a corrigir",
    ],
    exemplosList: [
      "Julho/2026 — diversos EQL executados na conta OTS, mês que fechou +6R.",
    ],
  },
  {
    id: "fq",
    nomeCurto: "FQ",
    nome: "FQ — Falha de Estrutura",
    subtitulo: "Encerrado em 30/07/2026",
    Icon: IconFQ,
    timeframeShort: "—",
    barraSinalChips: ["—"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    gestaoGanhos: "—",
    encerrado: true,
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Fora do operacional desde 31/07/2026" },
    motivoEncerramento: "Não é mais \"em avaliação\" — está fora do operacional. A partir de 31/07 nem procurar o padrão, usando os dias como treino de desaprender a busca.",
    descricao: "Falha de continuidade expõe traders posicionados a favor da tendência com stop técnico no nível que acabou de ser rompido. Mantido nesta tabela apenas como registro histórico e como trava anti-recaída.",
    regrasList: [
      "Dados do Mateus: mesmo com ~60% de assertividade, representa MENOS DE 20% do resultado anual dele",
      "Dados próprios: setup de maior volume (29 trades desde março), 41% de acerto, maior detrator financeiro do período",
      "É reversão — entra contra a pressão dominante, logo nasce com desconforto máximo em posição aberta",
      "Permite empilhar argumentos a favor que mascaram o argumento contra",
      "Consumia o recurso mais escasso (atenção e regulação emocional) no setup que menos paga",
    ],
    filtrosList: [
      "Diagnóstico estrutural: o FQ era SUBSTITUTO de uma capacidade ausente no repertório — operar extremos em lateralidade",
      "Em dias travados, era a única porta disponível para clicar, e por isso aparecia justamente nos piores dias",
      "Esse vácuo passa a ser ocupado pelo TL",
    ],
    ondeInvalida: "Setup encerrado. Conclusão de 30/07: falta a habilidade de TIMING que o FQ exige — mesmo com construção macro e ideia direcional boas, participar gera perdas consistentes.",
    gatilhos: [
      { label: "—", text: "Setup fora do operacional" },
    ],
    redFlagsList: [
      "Qualquer tentativa de reintroduzir o padrão com nome novo",
      "TL que passe a depender de FALHA + QUEBRA antecipada — isso é FQ disfarçado",
    ],
    exemplosList: [
      "30/07 — último teste consciente: 2 FQs, 2 stops, −R$320 no dia. Confirmou a decisão de 27/07.",
    ],
  },
];

/* ---------------- Componente principal ---------------- */

export default function PlanoTrade({ th }) {
  const theme = useTheme(th);

  const contratos = [
    { stop: "500 pts", ctts: "2 ctts" },
    { stop: "350 pts", ctts: "3 ctts" },
    { stop: "250 pts", ctts: "4 ctts" },
    { stop: "200 pts", ctts: "5 ctts" },
  ];

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
        <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 4 }}>
          Meu Trading System v.1.0 · atualizado agosto/2026
        </div>
      </div>

      {/* FILOSOFIA — 2 colunas: Filosofia Operacional | Mentalidade */}
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
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
              O que procuro no mercado
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              Não preciso acertar tudo ou de muitos trades. 2 a 3 trades por dia, os melhores
              trades, onde eu entre confortável com tudo que está acontecendo.
            </div>
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
              Objetivo do mês
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              Máximo de 40 trades no mês (~10/semana em ~20 pregões). Só operar dentro dos
              setups. Zero erro operacional intencional. Acompanhar a performance semanal —
              objetivo, não meta de resultado: o mecanismo é forçar a pergunta "encaixa, mas é
              BOM mesmo?".
            </div>
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
              Critério de seletividade
            </div>
            <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
              Se parecer "mais ou menos", esperar. Só operar o que eu faria 100 vezes de novo,
              independente do resultado desse trade específico.
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, lineHeight: 1.2, marginBottom: 18 }}>
            Mentalidade
          </div>

          <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18 }}>
            <Quote theme={theme}>
              Professionals think, feel and act differently from losers. Changing is hard, but
              becoming a professional demands commitment to that shift in posture.
            </Quote>
            <Quote theme={theme}>
              Going all-in on trading is doing what I know is necessary to succeed. I won't get
              there faster by being an exception — I need to cut the idea that it's "different"
              for me and truly commit.
            </Quote>
            <Quote theme={theme}>
              No mercado, a gente tem que ser muito humilde e, às vezes, a pessoa mais humilde
              que você acha que é, ainda precisa melhorar muito.
            </Quote>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: "28px 0" }} />

      {/* RISCO | GESTÃO DE SAÍDA | REGRAS UNIVERSAIS */}
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
            <IcoRisk color={theme.accent} />
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Risco · agosto/2026</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {[
              { k: "R fixo", v: "R$ 200" },
              { k: "Stop diário", v: "R$ 500" },
              { k: "Stop por trade", v: "R$ 200–250 (até 300 em caso excepcional)" },
              { k: "Teto em pontos", v: "600 na abertura · 500 no resto do dia" },
            ].map((r) => (
              <div key={r.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                <span style={{ color: theme.textMuted }}>{r.k}</span>
                <span style={{ color: theme.text, fontWeight: 700, textAlign: "right" }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 8 }}>
            Contratos são <b style={{ color: theme.text }}>consequência</b> do stop, não escolha:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {contratos.map((c) => (
              <div
                key={c.stop}
                style={{
                  background: theme.cardAlt,
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "center",
                  minWidth: 70,
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: 12, color: theme.textMuted }}>{c.stop}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text, marginTop: 2 }}>{c.ctts}</div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <IconDoorExit color={theme.accent} />
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>
              Gestão de saída · o alvo decide
            </div>
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
            Quem decide a saída é o <b style={{ color: theme.text }}>alvo</b>, não a quantidade de
            contratos.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: theme.cardAlt, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                Alvo fixo e curto
              </div>
              <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                Abertura 1x1 · TRM de correção simples · TL nos 50% do range → sai 100% no alvo,
                sem parcial.
              </div>
            </div>
            <div style={{ background: theme.cardAlt, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                Alvo aberto
              </div>
              <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                TC em tendência · TRM em confluência de reversão → parcial no 1x1 + carrega. Só
                faz sentido com 3+ contratos.
              </div>
            </div>
            <div
              style={{
                background: "#e0a63a14",
                border: "1px solid #e0a63a40",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e0a63a", marginBottom: 3 }}>
                Decisão de agosto · revisar em setembro
              </div>
              <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                TC de 2 contratos sai 100% no 1x1, sem exceção. Contrapartida obrigatória: anotar
                no diário quanto teria pago se carregasse (MEP máximo).
              </div>
            </div>
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
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Regras universais</div>
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
                <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text, marginTop: 10, lineHeight: 1.4 }}>
                  {r.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TAXONOMIA */}
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 4 }}>
          Que setup para que mercado
        </div>
        <div style={{ fontSize: 13.5, color: theme.textMuted, marginBottom: 16 }}>
          TC para tendência · TRM para reversões · TL para lateralidades
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {[
            { m: "Movimentos climáticos", s: "TRM" },
            { m: "Tendência clara", s: "TC Meio de Movimento · TC Supertrend" },
            { m: "Rompimento e correção", s: "TC Pós BO" },
            { m: "Tendência testando S/R estruturado", s: "TC Pré BO (pausado)" },
            { m: "Laterais com direção preferida", s: "TL" },
            { m: "Abertura com força direcional", s: "Trade de Abertura · Barra de Força" },
          ].map((t) => (
            <div
              key={t.m}
              style={{
                background: theme.cardAlt,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 4 }}>{t.m}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, lineHeight: 1.4 }}>{t.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SETUPS */}
      <div style={{ margin: "24px 0 12px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Setups — Trading System Starter</div>
        <div style={{ fontSize: 13.5, color: theme.textMuted, marginTop: 2 }}>
          TC Pré BO pausado · FQ encerrado em 30/07/2026
        </div>
      </div>

      <SetupsTable theme={theme} setups={SETUPS} />
    </div>
  );
}
