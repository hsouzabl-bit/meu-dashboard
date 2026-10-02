import React, { useState, useEffect } from "react";

/*
  PlanoTrade.jsx
  ---------------------------------------------------------------
  Página "Plano de Trade" — v2.0, outubro/2026.
  Dois planos selecionáveis, com persistência da última escolha:
  - MESA PROP (MIDE 3) — conta aprovada; ION 3 e ION OTS encerradas
    pela mesa, setups delas migrados para Encerrados / Stand-by
  - CONTA REAL — 1 contrato, GR R$150/dia, alvo fixo 350 pts,
    300 protege no 0x0 · 350 sai
  Removido nesta versão: todo o bloco de filtro de folga (alvo − stop).
  Motivo: a folga foi calibrada sobre stops abaixo de 300 pts das contas
  de mesa; com stop estrutural de 500 pts ela exigiria alvo de 850,
  que não é factível.
  ---------------------------------------------------------------
*/

const ACCENT = "#4ecb8d";
const REPLAY_TONE = "#6aa6e8";
const STORAGE_KEY = "planoTrade.planoSelecionado";

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
    // listra da tabela: escurece em vez de clarear, para nao lavar o texto no tema escuro
    zebra: isDark ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.035)",
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
    replay: { bg: `${REPLAY_TONE}22`, text: REPLAY_TONE },
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
    replay: `${REPLAY_TONE}22`,
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
    replay: REPLAY_TONE,
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
const IconM2B = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16c4 0 5-9 9-9s5 5 9 5" /><path d="M9 13v6" /><path d="M6.5 16.5L9 19l2.5-2.5" />
  </svg>
);
const IconGapMedia = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h6" /><path d="M15 8h6" /><path d="M3 16h6" /><path d="M15 16h6" /><path d="M12 5v14" />
  </svg>
);
const IconConfluencia = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="5" /><circle cx="15" cy="15" r="5" /><circle cx="15" cy="9" r="5" />
  </svg>
);
const IconFalhaH1 = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18l5-8 4 4 3-5" /><path d="M16 9l4 9" /><line x1="14" y1="4" x2="20" y2="4" />
  </svg>
);
const IconWedge = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l18 7" /><path d="M3 19l18 -7" />
  </svg>
);
const IconFBO = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h18" /><path d="M3 16h18" /><path d="M9 12l3-3 3 3" /><path d="M12 9v9" />
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
const IcoAlerta = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16.5" x2="12" y2="16.5" />
  </svg>
);
const IcoBarra = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 15h4" />
  </svg>
);
const IcoCanal = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18L21 6" />
    <path d="M3 21L21 9" />
    <line x1="3" y1="3" x2="7" y2="3" />
  </svg>
);
const IcoTentativas = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14l4-4 4 4 4-6 4 6" />
    <line x1="3" y1="20" x2="21" y2="20" />
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
            {s.dataEncerramento ? `Setup encerrado — ${s.dataEncerramento}` : "Setup encerrado"}
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>{s.motivoEncerramento}</div>
        </div>
      )}

      {/* Aviso de setup em stand-by */}
      {s.standby && (
        <div
          style={{
            background: "#e0a63a14",
            border: "1px solid #e0a63a40",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e0a63a", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>
            Em stand-by — pode ser retomado
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>{s.motivoStandby}</div>
        </div>
      )}

      {/* Aviso de setup em validação em replay */}
      {s.validacaoReplay && (
        <div
          style={{
            background: `${REPLAY_TONE}14`,
            border: `1px solid ${REPLAY_TONE}40`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: REPLAY_TONE, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>
            Em validação em replay — fora do operacional ao vivo
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>{s.notaReplay}</div>
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
function SetupsTable({ theme, setups: setupsRaw, bare }) {
  const [openId, setOpenId] = useState(null);

  // ordem: ativos > stand-by > em validacao em replay > encerrados; alfabetica dentro de cada grupo
  const rank = (s) => (s.encerrado ? 3 : s.validacaoReplay ? 2 : s.standby ? 1 : 0);
  const setups = [...setupsRaw].sort((a, b) => {
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    return a.nomeCurto.localeCompare(b.nomeCurto, "pt-BR");
  });

  const openSetup = setups.find((s) => s.id === openId);

  return (
    <div
      style={{
        border: bare ? "none" : `1px solid ${theme.border}`,
        borderRadius: bare ? 0 : 14,
        overflow: "hidden",
      }}
    >
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
                    background: i % 2 === 1 ? theme.zebra : "transparent",
                    opacity: off ? 0.6 : s.validacaoReplay || s.standby ? 0.85 : 1,
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

/* ---------------- Categorias de mercado ---------------- */
const CATEGORIAS = [
  {
    id: "abertura",
    titulo: "Abertura",
    subtitulo: "Desequilíbrio inicial do dia, janela até a b2 do M5",
  },
  {
    id: "tendencia",
    titulo: "Tendência",
    subtitulo: "Continuidade a favor da direção estabelecida",
  },
  {
    id: "lateralidade",
    titulo: "Lateralidade",
    subtitulo: "Extremos de range e exaustão dentro dele",
  },
  {
    id: "reversao",
    titulo: "Reversão",
    subtitulo: "Movimento esticado chegando em região de trava",
  },
  {
    id: "standby",
    titulo: "Stand-by",
    subtitulo: "Fora do operacional por decisão temporária — podem ser retomados",
  },
  {
    id: "encerrado",
    titulo: "Encerrados",
    subtitulo: "Fora do operacional de forma definitiva — registro e trava anti-recaída",
  },
];

/* =========================================================================
   SETUPS — MESA PROP (MIDE 3)
   ========================================================================= */
const SETUPS_MESA = [
  {
    id: "mesa-m2b-m2s",
    categoria: "tendencia",
    nomeCurto: "M2B / M2S",
    nome: "M2B / M2S — Setup na MM20 em tendência",
    subtitulo: "Pullback na MM20",
    Icon: IconM2B,
    timeframeShort: "M5 (contexto) → M2 (gatilho)",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Atrás da barra de sinal + gordura, ou T/F prévio",
    split: "Alvo decide",
    rxr: "2x1+",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega · Alvo fixo: 100% no alvo",
    badge: "Prioritário",
    badgeColor: null,
    fluencia: { label: "Prioritário", tone: "good", detalhe: "Maior contribuidor da amostra: 14 trades, 57,1% de acerto, +5,47R" },
    descricao: "Com tendência já estabelecida — mais de 20 barras acima ou abaixo da MM20 — o pullback até a média oferece entrada de continuidade com invalidação próxima. É o setup com maior contribuição da auditoria de 253 trades: 14 operações, 57,1% de acerto, +5,47R. Merece prioridade de mapeamento no pré-mercado, não apenas reação quando aparece.",
    regrasList: [
      "Mais de 20 barras acima/abaixo da MM20 no M5 — tendência estabelecida, não presumida",
      "Pullback até a MM20 (ou até a MME9, na variante)",
      "Entrada pela contagem de barras do Brooks: H1/L1, H2/L2, H3/L3 — não existe exigência de \"segunda tentativa\"",
      "Gatilho no M2 — inside, outside ou 2BR",
    ],
    filtrosList: [
      "M60 alinhado com a direção do trade — é o filtro que separou ganhadores de perdedores na amostra",
      "Premissa prévia definida no pré-mercado",
      "Preferir a entrada pelo M2, não pelo M5 — mesmo tamanho de stop, melhor posição dentro do ciclo",
    ],
    ondeInvalida: "Atrás da barra de sinal com gordura de 20–30%, ou no fundo/topo prévio do swing. Com menos de 20 barras de um lado da MM20, o setup não é candidato — é outra coisa.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
    ],
    redFlagsList: [
      "Ignorar o M60 — dois dos cinco perdedores da amostra são exatamente isso (#83 \"localização do 60 pesou mais\"; #105 \"era tendência de alta no 60, não me liguei\")",
      "Usar stop intermediário quando o técnico é longo (#99: \"stop técnico era de 800pts, usei um intermediário\") — violinado",
      "Entrar pelo M5 quando havia entrada melhor no M2 (#28) — mesmo tamanho de stop, pior posição no ciclo",
      "Ignorar o único argumento contrário (#64: \"tinha uma POC perto, mas era o único argumento contra\")",
    ],
    exemplosList: [
      "21/01 (#26) — rompimento de topo prévio, correção em micro canal fraco, inside de corpo comprador. \"Entrada, gestão e saída PERFEITAS.\" +1,74R",
      "23/03 (#100) — logo após uma violinada no mesmo dia, segundo M2B com inside positiva e stop mais claro. Pagou 1.300 pts limpos.",
      "22/01 (#28) — o contra-exemplo útil: +1,77R, mas entrada pelo M5 em vez do M2. \"Fica a anotação da diferença de um trade bem estruturado para um mais ou menos bem estruturado.\"",
    ],
  },
  {
    id: "mesa-trm",
    categoria: "reversao",
    nomeCurto: "TRM",
    nome: "TRM — Trade de Retorno às Médias",
    subtitulo: "Retorno às médias",
    Icon: IconTRM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Atrás da barra de sinal + gordura 20–30%",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo curto: 100% no alvo · Alvo aberto: primeira parcial no 1,5x1 + carrega",
    badge: "Atenção",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Atenção", tone: "warn", detalhe: "Historicamente o setup mais confiável, mas fechou julho em −4R" },
    descricao: "Mercado esticado demais de um movimento direcional atinge um ponto de resistência real (confluência de níveis), onde a probabilidade de continuidade cai e a de reação/correção sobe — captura o \"elástico esticado\" antes de um retorno às médias.",
    regrasList: [
      "Afastamento — 3 barras sem tocar a MME9 do M5",
      "Região de trava / alvo / confluência presente — S/R, LT/CL, Fibo, MA longa ou VWAP",
      "Gatilho de qualidade adequada dentro da região",
    ],
    filtrosList: [
      "CLX logo antes da barra de sinal — nos replays, 9 trades com esse filtro e 89% de acerto",
      "Alvo de fibo na região da entrada",
      "Confluência de fatores / cluster de alvos na mesma região",
      "Esticado até da MME9 do M2",
      "Só entrar quando a direção contrária não fizer sentido — havendo argumento razoável para o outro lado, segurar",
    ],
    ondeInvalida: "Stop técnico atrás da barra de sinal, com gordura de 20–30% do tamanho da barra: barra de ~100–150 pts → ~30 pts; ~200 pts → 50–60 pts; ~400 pts → 50–100 pts no máximo. Sem o afastamento mínimo de 3 barras sem tocar a MME9 do M5, o setup nem é candidato.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Antecipar a região — esperar o preço chegar lá; nos replays isso aparece como erro nomeado em 13/01: \"ANTECIPAR região\"",
      "\"Muito esticado\" como único argumento — nos replays esse rótulo aparece mais nos perdedores (44% de acerto) do que nos vencedores (62% sem ele)",
      "Pegar reação contra o M2 sem confirmação de fechamento",
      "Ignorar o caso contrário legítimo na mesma região — foi o que gerou o −4R de julho",
    ],
    exemplosList: [
      "25/05 — ii no M2 e inside no M5 pós CLX claro, alvo 2 de fibo, região de resistência macro. \"Trade simplesmente IMPECÁVEL.\" +2,36R, melhor do mês.",
      "29/07 — TRM de compra das ~10h30: havia argumentos a favor E contra na mesma região. Deu mais peso ao lado a favor e stopou. Origem do filtro do lado contrário.",
    ],
  },
  {
    id: "mesa-tc-mm",
    categoria: "tendencia",
    nomeCurto: "TC Meio de Mov.",
    nome: "TC — Meio de Movimento (MME9)",
    subtitulo: "Pullback na MME9",
    Icon: IconTCMM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Barra de sinal (se excelente) ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega · Alvo fixo: 100% no alvo",
    badge: "Funcional",
    badgeColor: null,
    fluencia: { label: "Funcional", tone: "good", detalhe: "Setup de continuidade — apoia-se no que o mercado já demonstrou" },
    descricao: "Dentro de uma tendência já estabelecida, o pullback até a média de referência oferece entrada de continuidade — o viés a favor já está validado pelo alinhamento completo das médias.",
    regrasList: [
      "Alinhamento COMPLETO de todas as médias — 200/50/20/9",
      "Estrutura de tendência prévia — mínimo 2 T/F/T/F",
      "Preço calçado na MME9 ou MME20",
    ],
    filtrosList: [
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
      "Encurtar o stop para o trade caber no risco — se a invalidação está longe, esperar entrada mais perto ou passar",
    ],
    exemplosList: [
      "29/07 — b30 do M5: 1º PB na MME9 após impulso + micro canal, quase 20 barras abaixo da MM20, barra de sinal inside minúscula. Pagou.",
      "29/07 — b44 do M5: MME9 seguindo segurando os preços, excelente barra de sinal quase tocando a MM20, bom espaço até as mínimas do dia.",
    ],
  },
  {
    id: "mesa-tc-pos",
    categoria: "tendencia",
    nomeCurto: "TC Pós BO",
    nome: "TC — Pós BO (rompimento)",
    subtitulo: "Continuidade pós-rompimento",
    Icon: IconTCPos,
    timeframeShort: "M2 / M5 (janela 40 barras)",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Barra de sinal (se excelente) ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega · Alvo fixo: 100% no alvo",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "Subtipo com histórico mais fraco — exige rigor no critério de rompimento" },
    descricao: "Captura continuidade após um rompimento genuíno de uma região relevante (lateralidade mín. 2T/2F, triângulo, ou máx/mín do dia) que já provou ter distanciado e retornado — é o teste do rompimento, não a entrada nele.",
    regrasList: [
      "Precisa ter rompido de fato — sem TC de pós de topo/fundo micro",
      "Barra de rompimento fechando perto do extremo",
      "Barra de continuidade a favor — peso inverso: rompimento fraco pede continuidade forte, e vice-versa",
      "Alinhamento completo das médias",
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
    id: "mesa-tc-super",
    categoria: "tendencia",
    nomeCurto: "TC Supertrend",
    nome: "TC — Supertrend (9 do 2')",
    subtitulo: "9 do M2",
    Icon: IconTCSuper,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR"],
    stopAceito: "Barra de sinal (se excelente) ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega · Alvo fixo: 100% no alvo",
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
      "Caminho livre até alvos em aberto — sem obstáculo relevante no meio",
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
      "Fazer o setup sem espaço até o alvo — erro nomeado em 11/02: \"TC de ST sem muito ESPAÇO\"",
    ],
    exemplosList: [
      "29/07 — b26 do M5: acionado na b65 do M2 com inside bar; 1ª correção após micro canal de 6 barras sem sinal de CLX; inside tanto no M5 quanto no M2.",
    ],
  },
  {
    id: "mesa-abertura-forca",
    categoria: "abertura",
    nomeCurto: "Abertura — Barra de Força",
    nome: "Abertura com Barra de FORÇA",
    subtitulo: "Impulso da b1/b2",
    Icon: IconForca,
    timeframeShort: "M5 (janela) → M2 (gatilho)",
    barraSinalChips: ["A própria barra de força"],
    stopAceito: "Atrás da barra forte · teto 700 pts",
    split: "100% no alvo",
    rxr: "1x1",
    gestaoGanhos: "Alvo SEMPRE 1x1 da própria barra · proteção obrigatória nos 350 pts de MEP",
    badge: "Contador aberto",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Contador n=3", tone: "warn", detalhe: "Teto de 700 pts é provisório — revisão na 10ª ocorrência" },
    descricao: "A primeira barra forte da abertura carrega o desequilíbrio inicial do dia. Opera esse impulso enquanto ele ainda é jovem, com alvo curto e objetivo.",
    regrasList: [
      "Janela até a b2 do M5",
      "B1 forte, engolfando muitas barras ou rompendo com força um T/F claro, a favor de ideia prévia do pré-mercado",
      "Não operar contra a força do gap",
      "Sem confirmação na barra seguinte, sai — não espera os 700 pts",
    ],
    filtrosList: [
      "Premissa prévia definida no pré-mercado",
      "Localização da abertura — compradora / vendedora / neutra (neutra não opera)",
      "Teto de stop teórico de 700 pts",
    ],
    ondeInvalida: "Stop atrás da própria barra forte, teto teórico de 700 pts; ou na abertura da barra, se a reversão do corpo já invalidar a leitura. Andou 350 pts a favor, protege — não volta mais ao stop. Fora da janela até a b2 do M5, não é mais este setup.",
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
      "Deixar o trade voltar ao stop depois de ter andado 350 pts a favor",
    ],
    exemplosList: [
      "Contador aberto, n=3. Anotar por ocorrência: stop assumido · MEN máximo · MEP máximo · protegeu nos 350? · resultado. Revisão do teto de 700 na 10ª ocorrência.",
    ],
  },
  {
    id: "mesa-tl",
    categoria: "lateralidade",
    nomeCurto: "TL",
    nome: "TL — Trade de Lateralidade",
    subtitulo: "Extremos de range",
    Icon: IconTL,
    timeframeShort: "M5 (range) → M2 (gatilho)",
    barraSinalChips: ["Entrada na violação do doji"],
    stopAceito: "Estrutural · nos replays 375–625, mediana 500",
    split: "100% no alvo",
    rxr: "1x1",
    gestaoGanhos: "Alvo = 50% do range · saída 100% no alvo, sem parcial",
    badge: "Funcional",
    badgeColor: null,
    fluencia: { label: "Funcional", tone: "good", detalhe: "Replays: 7 trades, 4 ganhos, +2,07R — e os 4 ganhos entraram na violação do doji, sem barra de sinal" },
    descricao: "Em lateralidade, os extremos do range são onde a probabilidade de reversão é maior e o risco é mais barato. Opera o que o mercado já demonstrou — range validado — e não o que ele pode vir a fazer. Ocupa o vácuo que antes era preenchido pelo FQ: operar extremos em dias travados.",
    regrasList: [
      "TR com 2 topos E 2 fundos JÁ demarcados — estrutura pré-existente, nunca antecipada",
      "B1 doji, no mínimo no M5",
      "O extremo do doji tem que coincidir com uma referência já mapeada — extremo do range, média relevante, T/F prévio, alvo de fibo ou linha de canal",
      "Entrada na violação do doji, SEM barra de sinal — com barra de sinal o trade vira FBO de TR c/ SB, que está encerrado",
    ],
    filtrosList: [
      "B1 do M15 também doji",
      "Bem afastado das médias",
      "Direção preferida da lateralidade, quando houver",
      "Qualidade do extremo — isolado, já testado",
    ],
    ondeInvalida: "Stop estrutural. A regra antiga de 20% além do extremo do range foi herdada do EQL do OTS e saiu — nos replays os stops praticados ficaram entre 375 e 625 pts, mediana 500, sem relação com o tamanho do range.",
    gatilhos: [
      { label: "a", text: "Violação do extremo do doji — por ordem limit ou aguardando o rompimento" },
    ],
    redFlagsList: [
      "Operar range que ainda está se formando — exige 2 topos E 2 fundos já demarcados",
      "Esperar barra de sinal — nos replays os 3 perdedores incluem 2 com gatilho marcado, e os 4 ganhos foram todos sem gatilho",
      "Entrada antecipada, antes do preço chegar ao extremo (23/04: \"FOMO + Violinada\")",
      "M15 fechando barra forte contra a direção do trade (11/03)",
      "GM iminente no M5 ou M15 contra, ou o M2 acabou de falhar o GM dele (08/05)",
    ],
    exemplosList: [
      "02/04 — compra abaixo de doji do M15, MM200 e alvo 2 de dois pivôs na região, mercado extremamente esticado das médias. +1,00R",
      "08/04 — gap de 5 mil pontos mais 2 mil de subida, b1 do M15 doji, venda do DT. +1,84R, MEP de 2.350 pts.",
    ],
  },
  {
    id: "mesa-gap-media",
    categoria: "tendencia",
    nomeCurto: "Gap de média",
    nome: "Gap de média",
    subtitulo: "Quebra da MM20 com fechamento além",
    Icon: IconGapMedia,
    timeframeShort: "M15 / M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: "Barra de sinal ou T/F prévio",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega",
    badge: "Funcional",
    badgeColor: null,
    fluencia: { label: "Funcional", tone: "good", detalhe: "Replays: 10 trades sem antecipação, 67% de acerto. Os 5 antecipados foram 5 losses." },
    descricao: "Quebra da MM20 com no mínimo 1 fechamento completamente além dela. O gap entre preço e média vira magneto e o retorno é o movimento operado. O que separa ganhador de perdedor nos replays não é o contexto nem o timeframe: é não antecipar.",
    regrasList: [
      "Quebra da MM20 com no mínimo 1 fechamento completamente além dela",
      "Tendência prévia de 20+ barras",
      "Dentro ou testando T/F duplo",
      "Setup completo, nunca antecipado — barra de sinal boa e fechada, nunca por violação",
    ],
    filtrosList: [
      "Correção comportada até a MM20",
      "Excelente barra de sinal — inside, outside ou reversão clara fechando na extremidade",
      "Setup para a mesma direção também no M15 (ex.: gap de média do M5 que seja também M2B/M2S no M15)",
    ],
    ondeInvalida: "Atrás da barra de sinal, ou no extremo do movimento se a barra for frágil. Doji não serve como barra de sinal — erro nomeado em 27/01: \"DOJI como SB + Stop inadequado\". No meio de TTR o setup não existe.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Antecipar o gap — nos replays, 5 antecipações e 5 losses, nenhuma chegou a 350 pts a favor",
      "Aceitar doji como barra de sinal por causa de confluência — a confluência não conserta a barra",
      "Entrar na violação perto do fim da barra em vez de esperar o fechamento (#57)",
      "Fazer o setup no meio de TTR",
      "Entrar com força relevante vindo do lado oposto",
    ],
    exemplosList: [
      "12/01 (#14) — GM no M2 + M5, micro canal no 5/15/60, alvo aberto para baixo. \"Trade IMPECÁVEL e executado PERFEITAMENTE.\" +1,90R",
      "02/03 (#65) — GM logo após um M2S stopado; espaço grande levou a parcial a quase 2x o risco. +1,79R",
      "01/04 — o contra-exemplo: \"Antecipação do GM do M5 por meio de inside no M2\". Stop cheio.",
    ],
  },

  /* ---------- Stand-by ---------- */
  {
    id: "mesa-wedge-tr",
    categoria: "standby",
    nomeCurto: "Wedge top/bottom em TR",
    nome: "Wedge top / bottom em TR c/ SB",
    subtitulo: "Cunha no extremo do range",
    Icon: IconWedge,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside"],
    stopAceito: "Além do ponto de inflexão da cunha",
    split: "Alvo decide",
    rxr: "1,5x1+",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega",
    standby: true,
    motivoStandby: "É bom e é uma forma funcional de operar TRs — 5 trades nos replays, 3 ganhos e 1 perda, +2,21R. Mas neste momento ele só quer fazer esse tipo de trade se estiver dentro das regras do TRM. Não está eliminado eternamente.",
    badge: "Stand-by",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Stand-by", tone: "warn", detalhe: "5 trades nos replays · 3G/1L · +2,21R · só dentro das regras do TRM" },
    descricao: "Três empurrões consecutivos perdendo força dentro de um trading range formam uma cunha no extremo. A cunha sinaliza exaustão da tentativa de romper e devolve o preço ao miolo do range.",
    regrasList: [
      "Cunha formada no extremo de um TR já demarcado",
      "Três empurrões com perda de amplitude",
      "Barra de sinal no ponto de inflexão",
      "Neste momento: só se também atender as regras do TRM",
    ],
    filtrosList: [
      "TR com estrutura clara — 2 topos e 2 fundos",
      "Preferência quando a cunha viola o ponto de inflexão e volta",
    ],
    ondeInvalida: "Além do ponto de inflexão da cunha, com stop mais longo do que o de barra — o setup chacoalha por natureza. Registro de 27/03: saiu no 0x0 ao travar na MM20 do M2, \"já havia pegado um MEN maior que o dos trades que normalmente dão certo\".",
    gatilhos: [
      { label: "a", text: "Inside bar no ponto de inflexão" },
      { label: "b", text: "Outside bar rompendo as médias" },
    ],
    redFlagsList: [
      "Usar stop de barra — o padrão exige gordura",
      "Entrar antes da cunha ter os três empurrões",
      "Insistir depois que o MEN já passou do que é normal nos ganhadores",
    ],
    exemplosList: [
      "26/03 — wedge que violou o ponto de inflexão, compra em inside no M2 rompendo as médias, stop e alvo mais longos. +1,13R",
      "11/05 — o contra-exemplo: \"Wedge bottom perfeita com inside positiva em dia já totalmente lateral e após todas as aberturas. Falhou direto.\"",
    ],
  },
  {
    id: "mesa-falha-h1l1",
    categoria: "standby",
    nomeCurto: "Falha de H1/L1",
    nome: "Falha de H1 / L1",
    subtitulo: "Primeira tentativa falha",
    Icon: IconFalhaH1,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Outside", "Inside"],
    stopAceito: "Atrás da barra de falha",
    split: "Alvo decide",
    rxr: "2x1",
    gestaoGanhos: "Alvo aberto: primeira parcial no 1,5x1 + carrega",
    standby: true,
    motivoStandby: "Bom setup, ajuda muito na tomada de decisão e na manutenção do trade. Mas neste momento ele só quer fazer quando for pelo menos na 9 do M2: pegar esticado exige stops mais amplos, e o teto de 500 pts muitas vezes não basta. Não sai do arsenal — ganha o filtro \"tem que testar alguma média\". Aceita ficar de fora algumas vezes.",
    badge: "Stand-by",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Stand-by", tone: "warn", detalhe: "7 trades nos replays · 4G/2L · +1,53R · só testando alguma média" },
    descricao: "A primeira tentativa de continuidade falha e arma os traders que entraram nela. A falha do H1 ou do L1 vira gatilho na direção oposta — mas só quando o contexto maior já apontava para esse lado.",
    regrasList: [
      "H1 ou L1 acionado e falhando",
      "Médias alinhadas na direção do trade — condição obrigatória",
      "Barra de sinal confirmando a falha",
      "Neste momento: só quando a falha ocorrer testando alguma média, no mínimo a 9 do M2",
    ],
    filtrosList: [
      "Contexto do M15/M60 a favor",
      "Região de referência relevante — LTB/LTA de canal, M2S/M2B em TF maior",
    ],
    ondeInvalida: "Atrás da barra que produziu a falha. Sem médias alinhadas, o setup não é candidato — é a diferença exata entre os dois casos da amostra.",
    gatilhos: [
      { label: "a", text: "Outside bar fechando no extremo" },
      { label: "b", text: "Inside bar após a falha" },
    ],
    redFlagsList: [
      "Operar em contexto lateral sem médias alinhadas (#22: \"contexto geral mais lateral e dia onde já caiu forte e subiu forte\")",
      "Confundir violação com falha — falha exige o acionamento e a reversão",
      "Pegar a falha esticado, longe de qualquer média — é o motivo do stand-by",
    ],
    exemplosList: [
      "06/03 — LTB de canal amplo + M2S no M15 em tendência + M2S na 9 do 60 + falha de H1 no M2 com outside fechando na mínima. Pagou 2x1 em 5 minutos.",
      "20/01 — o contra-exemplo: falha de L1 com micro canal no M5, mas contexto lateral. Stop. Origem do filtro das médias alinhadas.",
    ],
  },

  /* ---------- Encerrados ---------- */
  {
    id: "mesa-fq",
    categoria: "encerrado",
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
    dataEncerramento: "30/07/2026",
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Fora do operacional desde 31/07/2026" },
    motivoEncerramento: "Eliminado e sem necessidade de retornar ao assunto. A partir de 31/07 nem procurar o padrão, usando os dias como treino de desaprender a busca.",
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
      "Replay jan–mar/2026: 17 trades, 41,2% de acerto, +3,18R — mas a pior captura de todas as famílias (33% do MEP). Erra muito e não coleta quando acerta.",
    ],
  },
  {
    id: "mesa-ta",
    categoria: "encerrado",
    nomeCurto: "Trade de Abertura TSS",
    nome: "Trade de Abertura TSS (TA)",
    subtitulo: "Encerrado em 11/09/2026",
    Icon: IconAbertura,
    timeframeShort: "—",
    barraSinalChips: ["—"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    gestaoGanhos: "—",
    encerrado: true,
    dataEncerramento: "11/09/2026",
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Eliminado em TODAS as contas em 11/09/2026" },
    motivoEncerramento: "\"Não é pra mim, ao menos neste momento da minha vida como trader.\" Desconfortável, parece aleatório, exige clique para entrar e parcial absurdamente rápidos, o que não é a praia dele. Motivo original da eliminação: tomar stop sem uma única barra fechando a favor da ideia, nem no M1.",
    descricao: "Capturava a volatilidade inicial do mercado com entrada a mercado nos primeiros 15 minutos, sem barra de sinal. Mantido como registro e trava anti-recaída.",
    regrasList: [
      "Entrada sempre a mercado — não espera barra de sinal",
      "Só nos primeiros 15 minutos de mercado",
      "Exigia escora como regra, não filtro",
    ],
    filtrosList: [
      "Setup encerrado — nenhum filtro em uso",
    ],
    ondeInvalida: "Setup encerrado em 11/09/2026, em todas as contas.",
    gatilhos: [
      { label: "—", text: "Setup fora do operacional" },
    ],
    redFlagsList: [
      "Qualquer tentativa de reintroduzir entrada a mercado na abertura sem barra fechada",
      "Confundir com a Abertura com Barra de Força, que exige barra e tem alvo 1x1 da própria barra",
    ],
    exemplosList: [
      "11/09 — dois trades de abertura TSS no MIDE 3, dois stops, conta encerrada por limite. Origem da decisão definitiva.",
    ],
  },
  {
    id: "mesa-fbo-tr",
    categoria: "encerrado",
    nomeCurto: "FBO de TR c/ SB",
    nome: "FBO de TR com barra de sinal",
    subtitulo: "Encerrado em 01/10/2026",
    Icon: IconFBO,
    timeframeShort: "—",
    barraSinalChips: ["—"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    gestaoGanhos: "—",
    encerrado: true,
    dataEncerramento: "01/10/2026",
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Replays: 12 trades, 25% de acerto, −3,52R" },
    motivoEncerramento: "Não desempenha bem. Para operar TR no longo prazo ele quer usar APENAS o operacional OTS, que é também o que o Al Brooks ensina. E o Luciano, em lateralidade, opera quando estica — ou seja, a maioria daquelas situações se encaixa em TRM ou wedge top/bottom, não em FBO. O TL já cobre as melhores situações para operar TR.",
    descricao: "Falha de rompimento de trading range com barra de sinal. Nos replays: 12 trades, 25% de acerto, −3,52R. É o oposto do TL da b1 doji — ali a entrada é na violação sem barra de sinal, aqui a barra de sinal é o que define o setup.",
    regrasList: [
      "Setup encerrado — as situações de TR vão para TL, TRM ou wedge, ou simplesmente não são operadas",
    ],
    filtrosList: [
      "Setup encerrado — nenhum filtro em uso",
    ],
    ondeInvalida: "Setup encerrado em 01/10/2026, de forma definitiva.",
    gatilhos: [
      { label: "—", text: "Setup fora do operacional" },
    ],
    redFlagsList: [
      "Chamar de TL um trade que tem barra de sinal — se tem SB dentro de TR, é este setup, e ele está encerrado",
      "Operar o miolo do TR com qualquer gatilho bonito — assinatura de 75% de taxa de erro",
    ],
    exemplosList: [
      "Replays jan–jun/2026: 12 trades, 3 ganhos, −3,52R.",
    ],
  },
  {
    id: "mesa-rev-3conf",
    categoria: "encerrado",
    nomeCurto: "Reversão em 3 confluências",
    nome: "Reversão em 3 confluências c/ SB",
    subtitulo: "Encerrado em 01/10/2026",
    Icon: IconConfluencia,
    timeframeShort: "—",
    barraSinalChips: ["—"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    gestaoGanhos: "—",
    encerrado: true,
    dataEncerramento: "01/10/2026",
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Replays: 16 trades, 31% de acerto, −3,53R" },
    motivoEncerramento: "Isso tem que ser TRM. Se a reversão não está esticada, é melhor ele NÃO fazer o trade. Ele só se sente confortável quando há espaço claro; sem isso exige stop muito amplo e ainda assim é capaz de stopar e só depois reverter com algum sinal afastado das médias.",
    descricao: "A categoria existia justamente para registrar as reversões em que a regra do TRM não encaixava. Nos replays: 16 trades, 31,2% de acerto, −3,53R. Tirando os três de teimosia de 02/06, ainda fica negativo.",
    regrasList: [
      "Setup encerrado — reversão só acontece dentro das regras do TRM",
    ],
    filtrosList: [
      "Setup encerrado — nenhum filtro em uso",
    ],
    ondeInvalida: "Setup encerrado em 01/10/2026, de forma definitiva.",
    gatilhos: [
      { label: "—", text: "Setup fora do operacional" },
    ],
    redFlagsList: [
      "Operar reversão que não preenche o afastamento do TRM",
      "Empilhar confluências para compensar a falta de esticamento",
    ],
    exemplosList: [
      "02/06 — três tentativas na mesma ideia no mesmo dia, três losses. Erro nomeado: \"TEIMOSIA CONTRA DIA ESCROTO\".",
    ],
  },
  {
    id: "mesa-abertura-rc",
    categoria: "encerrado",
    nomeCurto: "Abertura — Rompimento + Correção",
    nome: "Abertura com Rompimento + Correção",
    subtitulo: "Encerrado em 01/10/2026",
    Icon: IconAbertura,
    timeframeShort: "—",
    barraSinalChips: ["—"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    gestaoGanhos: "—",
    encerrado: true,
    dataEncerramento: "01/10/2026",
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Replays: 4 trades, 25% de acerto, −1,11R" },
    motivoEncerramento: "Era teste. Não vale fazer trade só com essa premissa; precisa haver outros fatores. Quando forem bons trades, caberão em TC de pós BO, porque estarão rompendo alguma coisa.",
    descricao: "Rompimento na abertura seguido de correção, como premissa isolada. Nos replays: 4 trades, 1 ganho, −1,11R. Os casos bons migram para o TC de pós BO.",
    regrasList: [
      "Setup encerrado — o destino dos casos bons é o TC de pós BO",
    ],
    filtrosList: [
      "Setup encerrado — nenhum filtro em uso",
    ],
    ondeInvalida: "Setup encerrado em 01/10/2026, de forma definitiva.",
    gatilhos: [
      { label: "—", text: "Setup fora do operacional" },
    ],
    redFlagsList: [
      "Fazer trade na abertura só porque houve rompimento e correção, sem outros fatores",
    ],
    exemplosList: [
      "28/01 — \"Sem estrutura de tendência / Violinada\". Stop.",
      "05/03 — \"Leitura ruim de rompimento\". Stop.",
    ],
  },
  {
    id: "mesa-tc-pre",
    categoria: "encerrado",
    nomeCurto: "TC Pré BO",
    nome: "TC — Pré BO (antes do rompimento)",
    subtitulo: "Encerrado em 01/10/2026",
    Icon: IconTCPos,
    timeframeShort: "—",
    barraSinalChips: ["—"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    gestaoGanhos: "—",
    encerrado: true,
    dataEncerramento: "01/10/2026",
    badge: "Encerrado",
    badgeColor: { bg: "#88888818", text: "#7d838d" },
    fluencia: { label: "Encerrado", tone: "off", detalhe: "Replays: 3 trades, +0,22R — e o último foi feito para eliminar a ideia" },
    motivoEncerramento: "Pré-rompimento ele prefere não fazer. Se houver trade antes de um rompimento, o mercado já precisa estar em tendência de 20+ barras, e aí o trade vira M2B/M2S.",
    descricao: "Entrada antes do rompimento de uma região, apostando que ele vai acontecer. Nos replays: 3 trades, +0,22R somados, e o último foi feito explicitamente para eliminar a ideia — custou o stop e o melhor trade do dia.",
    regrasList: [
      "Setup encerrado — o destino é o M2B/M2S, quando houver as 20 barras",
    ],
    filtrosList: [
      "Setup encerrado — nenhum filtro em uso",
    ],
    ondeInvalida: "Setup encerrado em 01/10/2026, de forma definitiva.",
    gatilhos: [
      { label: "—", text: "Setup fora do operacional" },
    ],
    redFlagsList: [
      "Antecipar rompimento — o mesmo mecanismo que condenou o FQ",
    ],
    exemplosList: [
      "Replays jan–jun/2026: 3 trades, +0,22R.",
    ],
  },
];

/* =========================================================================
   SETUPS — CONTA REAL
   Comuns a todos, exceto a abertura: 1 contrato · stop estrutural teto 500
   pts · alvo 350 pts com ordem desde a entrada · 300 protege no 0x0 · 350
   sai · saída antecipada permitida após 2 tentativas falhadas, teto de
   custo 0x0 a −150 pts · só barra fechada · doji não entra.
   ========================================================================= */

const SAIDA_REAL = "300 protege no 0x0 · 350 sai";
const STOP_REAL = "Estrutural · teto 500 pts";

const SETUPS_REAL = [
  {
    id: "real-abertura-forca",
    categoria: "abertura",
    nomeCurto: "Abertura — Barra de Força",
    nome: "Abertura com Barra de FORÇA",
    subtitulo: "Impulso da b1/b2",
    Icon: IconForca,
    timeframeShort: "M5 (janela) → M2 (gatilho)",
    barraSinalChips: ["A própria barra de força"],
    stopAceito: "Atrás da barra forte · teto 500 pts",
    split: "100% no alvo",
    rxr: "1x1 da própria barra",
    gestaoGanhos: "Alvo 1x1 da própria barra · proteção nos 350 pts de MEP",
    badge: "Único com alvo próprio",
    badgeColor: null,
    fluencia: { label: "Melhor acerto", tone: "good", detalhe: "Replays: 13 trades, 77% de acerto, captura de 93% do MEP" },
    descricao: "Única exceção ao alvo fixo de 350 pts: aqui o alvo é 1x1 da própria barra, o que na prática dá por volta de 500 pts. É o setup de melhor acerto do arsenal nos replays (77%) e o de maior captura (93% do MEP), justamente porque o alvo é fixo e a saída é 100%.",
    regrasList: [
      "Janela até a b2 do M5",
      "B1 forte, engolfando muitas barras OU rompendo com força um T/F claro, a favor de ideia prévia mapeada no pré-mercado",
      "Entrada no fechamento da b1 ou na violação da b1",
      "Se a b1 fechar rápido demais para dimensionar o stop, entra na barra seguinte — desde que o preço esteja além do fechamento da b1 (abaixo na venda, acima na compra). Não é pegar recuo, é pegar a violação.",
    ],
    filtrosList: [
      "Premissa prévia definida no pré-mercado",
      "Localização da abertura — compradora / vendedora / neutra (neutra não opera)",
      "Não operar contra a força do gap",
    ],
    ondeInvalida: "Stop estrutural atrás da barra de força, com TETO DE 500 PTS mesmo quando a estrutura pediria até 700. Razão: se o trade é bom não volta 500; se voltou 500, a chance de voltar 700 é altíssima — nos 13 replays, o vencedor que mais andou contra foi 300 pts, nenhum passou disso. Se a devolução de 70–90% da barra já invalida a tese, o stop vai aí.",
    gatilhos: [
      { label: "a", text: "Fechamento da b1 forte" },
      { label: "b", text: "Violação da b1" },
      { label: "c", text: "Barra seguinte, se o preço estiver além do fechamento da b1" },
    ],
    redFlagsList: [
      "A barra seguinte à entrada não ser de continuidade — na venda, fechamento abaixo da mínima da b1; na compra, acima da máxima. Não fechou assim, SAI NA HORA, não espera o stop",
      "Perseguir movimento já esticado",
      "Operar contra o gap",
      "Forçar entrada fora da janela da b2 do M5",
      "Segurar além do 1x1 — o alvo deste setup é fixo",
    ],
    exemplosList: [
      "27/05 — b1 fortíssima partindo do fundo do triângulo macro, revertendo ~13 fechamentos no M2. MEN zero, pagou direto o alvo. +1,00R",
      "12/06 — b1 outside fortíssima, pivô de baixa, rompimento e falha de ii no 60, 2 CLX consecutivos do dia anterior. \"Trade melhor impossível! Pagou em 2 barras do M2.\"",
      "17/03 — o contra-exemplo da regra da barra seguinte: \"B2 foi uma barra de reversão (martelo) e stopei acima dela. Reverteu a b1 inteira.\" Andou 550 contra.",
    ],
  },
  {
    id: "real-m2bs-9",
    categoria: "tendencia",
    nomeCurto: "M2B / M2S na 9",
    nome: "M2B / M2S na MME9",
    subtitulo: "PB na 9 com tendência",
    Icon: IconM2B,
    timeframeShort: "M2 ou M5 (20+ barras) → gatilho",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Melhor R/trade",
    badgeColor: null,
    fluencia: { label: "Melhor R/trade", tone: "good", detalhe: "Replays: 12 trades, 67% de acerto — o melhor R/trade da planilha" },
    descricao: "Pullback até a MME9 dentro de tendência estabelecida. É o setup de melhor R por trade de toda a planilha de replays. Quando a estrutura ainda não tem as 20 barras no timeframe do gatilho, o trade é o mesmo mas é lançado como TC MM na 9.",
    regrasList: [
      "Tendência no M2 OU no M5 — 20+ barras acima/abaixo da MM20",
      "Pullback até a MME9",
      "Não esticou demais antes: se veio muitas barras direto, ou corrigiu 1 barra e retomou, o PB na 9 é pequeno demais em relação à perna e não serve",
      "Sem correção profunda com cara de canal amplo — se houve, o trade é PB na 20, não na 9",
      "Barra de sinal fechada. Doji não entra.",
    ],
    filtrosList: [
      "Primeiro teste da média no dia",
      "Alvo de alta probabilidade já nomeado antes da entrada",
      "Horário promissor — a correção produzida pela pancada da abertura do à vista ou de NY",
      "Barra de sinal o mais bonita possível",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, NÃO FAZ O TRADE — nunca encurtar o stop para caber. Nos replays, dois dos três perdedores deste setup são exatamente stop encurtado.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Encurtar o stop para o trade caber (23/03: \"stop técnico era de 800pts, usei um intermediário\" — violinado)",
      "Contexto macro em tendência contrária com iminência de setup macro (26/03: \"Falta de atenção ao M60\")",
      "Sair antes de 2 tentativas falhadas — metade dos vencedores passou de 140 pts contra antes de andar",
      "Renegociar o alvo no meio do trade — a ordem nos 350 fica posicionada desde a entrada",
    ],
    exemplosList: [
      "23/03 — logo após uma violinada no mesmo dia, segundo M2B na 9 com inside positiva e stop mais claro. \"Pagou LISO 1.300pts!\"",
      "28/04 — M2S com tendência de baixa no 5, 15 e 60, primeiro teste da 9 do 5 no dia, outside no 2 e no 5. +1,00R",
      "15/05 — o contra-exemplo: \"Violinada / Stop errado\". Voltou 340 pts em uma barra de 1 minuto.",
    ],
  },
  {
    id: "real-m2bs-20",
    categoria: "tendencia",
    nomeCurto: "M2B / M2S na 20",
    nome: "M2B / M2S na MM20",
    subtitulo: "PB na 20 com tendência",
    Icon: IconM2B,
    timeframeShort: "M2 ou M5 (20+ barras) → gatilho",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Ativo",
    badgeColor: null,
    fluencia: { label: "Ativo", tone: "good", detalhe: "Replays: 11 trades, 45% de acerto. Chacoalha mais — nenhum vencedor com MEN zero." },
    descricao: "Pullback até a MM20. O PB na 20 é sinal de que o mercado já transicionou para canal amplo, então a nova mínima (ou máxima) passa a ser região de realização. Chacoalha mais que a variante da 9: nos replays nenhum vencedor veio com MEN zero, mediana de 135 pts contra.",
    regrasList: [
      "Tendência no M2 OU no M5 — 20+ barras acima/abaixo da MM20",
      "SOMENTE H2/H3 ou L2/L3. H1/L1 na 20 não faz sentido — o PB até a 20 é correção profunda, e H1/L1 só cabe em correção rasa",
      "MM200 a favor, ou bem longe se estiver contra",
      "Barra de sinal fechada. Doji não entra.",
    ],
    filtrosList: [
      "Primeiro teste da média no dia",
      "Alvo de alta probabilidade já nomeado antes da entrada",
      "Horário promissor — abertura do à vista ou de NY",
      "Barra de sinal o mais bonita possível",
      "Espaço mínimo de 300 pts até o fundo anterior (ou topo, na venda) — como o objetivo é sair nos 350, precisa desse espaço no mínimo, já contando a folga dos ~50 pts que uma violação costuma consumir",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, não faz o trade. Nos replays, os cinco perdedores desta variante têm stop de 350 ou mais, sendo quatro com exatamente 500.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Entrar em H1/L1 — não é este setup",
      "MM200 contra e perto",
      "Menos de 300 pts até o fundo/topo anterior",
      "Contexto macro em tendência contrária com iminência de setup macro",
      "Sair antes de 2 tentativas falhadas — aqui a chacoalhada é a norma, não a exceção",
    ],
    exemplosList: [
      "29/05 — M2S após correção muito forte, boa SB tanto no M2 quanto no M5, rompimento e correção, tendência de baixa no 5, 15 e 60. \"A ideia era ser sniper, pegar 1R e cair fora.\" +1,37R",
      "16/06 — M2S no M5 com boa SB em tendência, b1 do M15 engolfando 10+ fechamentos. Pagou e ele não tentou alongar. +1,00R",
      "09/04 — o contra-exemplo: \"Insistir em dia onde nada dá certo\". Stop cheio.",
    ],
  },
  {
    id: "real-tcmm-9",
    categoria: "tendencia",
    nomeCurto: "TC MM na 9",
    nome: "TC Meio de Movimento na MME9",
    subtitulo: "PB na 9 sem as 20 barras",
    Icon: IconTCMM,
    timeframeShort: "M2 ou M5 (sem 20 barras) → gatilho",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Estrutura incompleta",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Estrutura incompleta", tone: "warn", detalhe: "Mesmas regras do M2B/M2S na 9 — o nome separado existe para permitir a análise depois" },
    descricao: "É o M2B/M2S na 9 pego antes da estrutura fechar: ainda não há as 20 barras no timeframe do gatilho. As regras são as mesmas; o nome separado existe para que, com amostra maior, seja possível comparar o desempenho com e sem a estrutura completa. O timeframe do gatilho sai da coluna Nº barra do diário.",
    regrasList: [
      "Pullback até a MME9, SEM as 20 barras acima/abaixo da MM20 no timeframe do gatilho",
      "Se houver rompimento antes do pullback, o trade é TC de pós BO, não este",
      "Não esticou demais antes — mesmo critério da variante com estrutura completa",
      "Barra de sinal fechada. Doji não entra.",
    ],
    filtrosList: [
      "Primeiro teste da média no dia",
      "Alvo de alta probabilidade já nomeado antes da entrada",
      "Horário promissor — a correção produzida pela pancada da abertura do à vista ou de NY",
      "Barra de sinal o mais bonita possível",
      "Saber de qual timeframe vem o argumento, e qual deles ainda não concorda",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, não faz o trade. Antecipar a estrutura exige mais espaço — nos replays, os TC MM com gatilho no M5 têm o stop mediano mais alto de toda a família tendência (500 pts).",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Entrar antes do gatilho acionar (02/02: \"TC ANTECIPADO antes de acionar o gatilho — FOMO TOTAL\")",
      "Operar contra a tendência do M5 que ainda está de pé (29/01: \"ignorei o fato de que era TENDÊNCIA AINDA NO 5\")",
      "Insistir em dia de reversão (14/05)",
      "Tentar conduzir depois do alvo — nos replays, quatro dos doze TC MM perderam valor na gestão e nenhum na seleção",
    ],
    exemplosList: [
      "05/03 — ao bater na 9 do 5 formou outside no 2 imediatamente; entrada na violação, stop acima da máxima da outside. Chegou a andar 1.000 pts.",
      "08/05 — 1º teste da 9 no dia, premissa de nova máxima ainda viva, força do dia toda compradora. Precisava de continuidade imediata, ela veio.",
      "03/06 — a origem da etiqueta: \"coloquei como TC MM porque ainda não tinha 20 barras abaixo da 20 no M5\".",
    ],
  },
  {
    id: "real-tcmm-20",
    categoria: "tendencia",
    nomeCurto: "TC MM na 20",
    nome: "TC Meio de Movimento na MM20",
    subtitulo: "PB na 20 sem as 20 barras",
    Icon: IconTCMM,
    timeframeShort: "M2 ou M5 (sem 20 barras) → gatilho",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Estrutura incompleta",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Estrutura incompleta", tone: "warn", detalhe: "Mesmas regras do M2B/M2S na 20 — o nome separado existe para permitir a análise depois" },
    descricao: "É o M2B/M2S na 20 pego antes da estrutura fechar. Mesmas regras, inclusive a exigência de H2/H3 ou L2/L3 e o espaço mínimo de 300 pts até o fundo anterior. O nome separado existe para permitir comparar depois.",
    regrasList: [
      "Pullback até a MM20, SEM as 20 barras acima/abaixo dela no timeframe do gatilho",
      "SOMENTE H2/H3 ou L2/L3 — H1/L1 na 20 não faz sentido",
      "MM200 a favor, ou bem longe se estiver contra",
      "Se houver rompimento antes do pullback, o trade é TC de pós BO, não este",
      "Barra de sinal fechada. Doji não entra.",
    ],
    filtrosList: [
      "Primeiro teste da média no dia",
      "Alvo de alta probabilidade já nomeado antes da entrada",
      "Horário promissor — abertura do à vista ou de NY",
      "Barra de sinal o mais bonita possível",
      "Espaço mínimo de 300 pts até o fundo anterior (ou topo, na venda)",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, não faz o trade.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Entrar em H1/L1",
      "MM200 contra e perto",
      "Menos de 300 pts até o fundo/topo anterior",
      "Antecipar o gatilho",
      "Tentar conduzir depois do alvo",
    ],
    exemplosList: [
      "31/03 — outside na 50 do M2 antecipando um M2B na 20 do M5; acabou fechando excelente barra de sinal no M5. +1,87R, MEP de 1.180 pts.",
      "18/05 — M2S após a abertura de NY dar uma pancada e parar na MM20, gap de média pelo M2, boa localização no M60. Pagou o alvo e reverteu imediatamente.",
      "01/06 — 1º PB na 20 junto com GM do M2 e outside no M5. Pagou, mas \"fui tentar conduzir já tarde no dia e devolvi metade do R\".",
    ],
  },
  {
    id: "real-tc-pos",
    categoria: "tendencia",
    nomeCurto: "TC Pós BO",
    nome: "TC de Pós BO — rompimento e correção",
    subtitulo: "Correção do rompimento",
    Icon: IconTCPos,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Separação mais limpa",
    badgeColor: null,
    fluencia: { label: "Separação limpa", tone: "good", detalhe: "Replays: nenhum vencedor andou mais de 170 pts contra, nenhum perdedor passou de 220 a favor" },
    descricao: "Especificamente após um rompimento: a força do rompimento cria a direção, e a entrada é na correção dele. Ainda não há as 20 barras — se houver, o trade é M2B/M2S. É o setup com a separação inicial mais limpa dos replays: nenhum vencedor andou mais de 170 pts contra, e nenhum perdedor passou de 220 pts a favor.",
    regrasList: [
      "Houve rompimento — este setup é especificamente pós-rompimento",
      "Ainda não há as 20 barras acima/abaixo da MM20; se houver, o trade é M2B/M2S na 9 ou na 20",
      "Força no rompimento, critério mínimo: afastamento do ponto de rompimento, com pelo menos uma barra rompendo (fechamento deixando gap de barra em relação ao topo/fundo rompido) e outra fechando além dela",
      "Entrada na correção POR CIMA do ponto rompido na compra, ou POR BAIXO na venda. Nunca dentro do ponto de rompimento — aí tem cara de FBO",
      "Barra de sinal favorável é REGRA, e são só estas: inside · outside · 2BR · martelo · shooting star",
    ],
    filtrosList: [
      "Alvo de alta probabilidade já nomeado antes da entrada",
      "Horário promissor",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, não faz o trade. Se a entrada cairia dentro do ponto de rompimento, o trade não existe.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Rompimento sem força pelo critério mínimo (22/05: \"TC de pós s/ força de BO\")",
      "Entrada dentro do ponto de rompimento",
      "H1/L1 contra micro canal (09/01: \"H1 contra MC + FOMO\")",
      "Segunda tentativa na mesma ideia depois de falhar (18/03: \"erro foi entrar de novo no mesmo trade quando ele havia acabado de falhar\")",
      "Contexto macro em tendência contrária com iminência de setup macro",
    ],
    exemplosList: [
      "12/02 — três insides após uma barra do M5 engolfar mais de 60 fechamentos do dia anterior. A movimentação sobrepôs toda a estrutura anterior. +0,88R",
      "11/03 — rompeu fundos prévios, M15 engolfou 28 fechamentos, ordem na perda da nova mínima. +1,88R, MEP de 920 pts.",
      "12/05 — o contra-exemplo: \"dia travadíssimo, rompeu a favor da tendência, voltou com PB meio forte... Stopou direto.\"",
    ],
  },
  {
    id: "real-gap-media",
    categoria: "tendencia",
    nomeCurto: "Gap de média",
    nome: "Gap de média",
    subtitulo: "Quebra da MM20 com fechamento além",
    Icon: IconGapMedia,
    timeframeShort: "M15 / M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Nunca antecipado",
    badgeColor: null,
    fluencia: { label: "Nunca antecipado", tone: "good", detalhe: "Replays: sem antecipar, 10 trades e 67% de acerto. Os 5 antecipados foram 5 losses." },
    descricao: "Quebra da MM20 com no mínimo 1 fechamento completamente além dela. Nos replays o setup inteiro parece medíocre (43% de acerto), mas a separação é brutal: os 5 trades antecipados foram 5 losses, nenhum chegando a 350 pts a favor; os 10 não antecipados deram 67% de acerto. Antecipar é operar um setup que ainda não aconteceu.",
    regrasList: [
      "Quebra da MM20 com no mínimo 1 fechamento completamente além dela",
      "Tendência prévia de 20+ barras",
      "Dentro ou testando T/F duplo",
      "NUNCA no meio de TTR",
      "Sem muita força ou pressão vindo do lado oposto",
      "Setup completo, nunca antecipado. Barra de sinal boa e fechada, nunca por violação",
    ],
    filtrosList: [
      "Correção comportada até a MM20",
      "Excelente barra de sinal — inside, outside ou reversão clara fechando na extremidade",
      "Setup para a mesma direção também no M15 (ex.: gap de média do M5 que seja também M2B/M2S no M15)",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, não faz o trade. Antes do fechamento completo além da média, o setup não existe. Doji não serve como barra de sinal.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
    ],
    redFlagsList: [
      "Antecipar o gap — 5 antecipações, 5 losses nos replays",
      "Entrar no meio de TTR",
      "Entrar por violação em vez de esperar o fechamento (23/02: \"Entrar na violação já perto do fim da barra\")",
      "Aceitar doji como barra de sinal por causa de confluência (27/01)",
      "Entrar com força relevante vindo do lado oposto",
    ],
    exemplosList: [
      "12/01 — GM no M2 e no M5, micro canal no 5, 15 e 60, alvo aberto para baixo. \"Trade IMPECÁVEL e executado PERFEITAMENTE.\" +1,90R",
      "06/03 — segundo GM do dia, após conclusão de alvo intraday e teste da MM50 do M2. Pagou muito bem. +1,06R",
      "01/04 — o contra-exemplo: \"Antecipação do GM do M5 por meio de inside no M2 após barra forte... Nem assim o mercado andou.\" Stop cheio.",
    ],
  },
  {
    id: "real-trm",
    categoria: "reversao",
    nomeCurto: "TRM",
    nome: "TRM — Trade de Retorno às Médias",
    subtitulo: "Afastamento + região de trava",
    Icon: IconTRM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Inside", "Outside", "2BR", "Martelo", "Shooting star"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Maior volume",
    badgeColor: null,
    fluencia: { label: "Maior volume", tone: "good", detalhe: "Replays: 26 trades, 54% de acerto. Vencedores praticamente não andam contra — 8 de 14 com MEN zero." },
    descricao: "O setup são três coisas e só três: afastamento, região de trava e gatilho. Nos replays é o de maior volume e tem a assinatura mais nítida — os vencedores praticamente não andam contra (metade em 28 pts ou menos, oito dos catorze em zero) e os perdedores nunca passam de 300 pts a favor.",
    regrasList: [
      "Afastamento — 3 barras sem tocar a MME9 do M5",
      "Região de trava",
      "Gatilho — barra de sinal fechada, doji não entra",
    ],
    filtrosList: [
      "CLX logo antes da barra de sinal",
      "Alvo de fibo na região da entrada",
      "Confluência de fatores / cluster de alvos",
      "Esticado até da MME9 do M2",
    ],
    ondeInvalida: "Stop estrutural onde invalida a leitura, teto de 500 pts. Se o estrutural não cabe, não faz o trade. Sem o afastamento de 3 barras sem tocar a MME9 do M5, ou sem região de trava, o setup não é candidato.",
    gatilhos: [
      { label: "a", text: "Inside bar" },
      { label: "b", text: "Outside bar" },
      { label: "c", text: "2BR" },
      { label: "d", text: "Martelo / shooting star" },
      { label: "e", text: "L3 / H3 no M2" },
    ],
    redFlagsList: [
      "Não ter chegado na região de trava — esperar ir lá, não antecipar (13/01: \"ANTECIPAR região\")",
      "Vender em cima de suporte ativo, ou comprar em cima de resistência ativa (04/03)",
      "Entrar sem ver pressão anterior para aquele lado (28/05)",
      "Contexto macro em tendência contrária com iminência de setup macro",
      "Sair antes de 2 tentativas falhadas",
    ],
    exemplosList: [
      "25/05 — ii no M2 e inside no M5 pós CLX claro, alvo 2 de fibo, esticado com o gap, região de resistência macro. \"Trade simplesmente IMPECÁVEL e DESABOU após a entrada! Melhor do mês!\" +2,36R",
      "24/04 — 3 puxadas + afastado + barra de CLX + inside muito positiva + cluster de 3 alvos diferentes. Saída em 1R.",
      "02/06 — o contra-exemplo: \"Vendendo doji contra um MC e sem espaço para as médias. Trade muito ruim.\"",
    ],
  },
  {
    id: "real-tl-doji",
    categoria: "lateralidade",
    nomeCurto: "TL da b1 doji",
    nome: "TL da b1 doji",
    subtitulo: "Violação do doji no extremo",
    Icon: IconTL,
    timeframeShort: "M15 / M5 (doji) → entrada na violação",
    barraSinalChips: ["Sem barra de sinal — entrada na violação"],
    stopAceito: STOP_REAL,
    split: "350 pts fixo · 100%",
    rxr: "Alvo 350 fixo",
    gestaoGanhos: SAIDA_REAL,
    badge: "Único de lateralidade",
    badgeColor: null,
    fluencia: { label: "Único de lateralidade", tone: "good", detalhe: "Replays: 7 trades, 4 ganhos, +2,07R — e os 4 ganhos entraram sem barra de sinal" },
    descricao: "O único trade de lateralidade da conta real. Nos replays, os 4 ganhos entraram na violação do próprio doji, sem barra de sinal; dos 3 perdedores, 2 tinham gatilho marcado. Faz sentido: aqui o doji É o setup, não o contexto. Esperar barra de sinal depois do doji é esperar uma coisa que o setup não pede — e transforma o trade em FBO de TR c/ SB, que está encerrado.",
    regrasList: [
      "Lateralidade — range com 2 topos e 2 fundos já demarcados",
      "B1 doji, no mínimo no M5",
      "O EXTREMO DO DOJI tem que coincidir com uma referência já mapeada — extremo do range, média relevante, T/F prévio, alvo de fibo ou linha de canal. Sem referência no extremo, não tem trade",
      "Entrada na violação do doji, SEM barra de sinal — por ordem limit ou aguardando o rompimento do extremo do doji",
    ],
    filtrosList: [
      "B1 do M15 também doji",
      "Bem afastado das médias",
      "Alvo de alta probabilidade já nomeado antes da entrada",
      "Horário promissor",
    ],
    ondeInvalida: "Stop estrutural, teto de 500 pts. A regra antiga de 20% além do extremo do range saiu — era herdada do EQL do OTS e nos replays nunca foi usada: os stops praticados ficaram entre 375 e 625 pts, mediana 500.",
    gatilhos: [
      { label: "a", text: "Violação do extremo do doji — ordem limit ou aguardando o rompimento" },
    ],
    redFlagsList: [
      "Esperar barra de sinal — com SB o trade vira FBO de TR c/ SB, que está encerrado",
      "Não haver referência mapeada no extremo do doji",
      "M15 fechando barra forte contra a direção do trade (11/03)",
      "GM iminente no M5 ou M15 contra, ou o M2 acabou de falhar o GM dele (08/05)",
      "Entrada antecipada, antes do preço chegar ao extremo (23/04: \"FOMO + Violinada\", stop mal dimensionado)",
    ],
    exemplosList: [
      "02/04 — compra abaixo de doji do M15, MM200 e alvo 2 de dois pivôs na região, mercado extremamente esticado das médias em todos os TFs. +1,00R",
      "10/04 — compra abaixo da b1 do M15 que era doji também no M5, MM50 na região. Esperou reação pelo M1 em vez de comprar na violação direto. +1,00R",
      "08/05 — o contra-exemplo: \"B1 como doji na iminência de GM do 5 e do 15. Acabei não reparando que o M2 havia acabado de falhar o GM dele.\" Stop evitável.",
    ],
  },
];

/* ---------------- Dados por plano ---------------- */
const PLANOS = [
  { id: "mesa", rotulo: "Mesa prop · MIDE 3" },
  { id: "real", rotulo: "Conta real" },
];

/* ---------------- Componente principal ---------------- */
export default function PlanoTrade({ th }) {
  const theme = useTheme(th);

  // persiste a ultima aba escolhida, no mesmo padrao das outras telas
  const [plano, setPlano] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo === "mesa" || salvo === "real") return salvo;
    } catch (e) {
      /* localStorage indisponivel — segue com o default */
    }
    return "real";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, plano);
    } catch (e) {
      /* falha ao persistir nao deve quebrar a tela */
    }
  }, [plano]);

  const isReal = plano === "real";
  const setups = isReal ? SETUPS_REAL : SETUPS_MESA;

  /* ---- Risco por plano ---- */
  const riscoMesa = [
    { k: "R fixo", v: "R$ 380", accent: true },
    { k: "Risco por trade", v: "R$ 330 – 380" },
    { k: "Loss diário", v: "R$ 700" },
    { k: "Limites na plataforma", v: "3 entradas / 3 stops (OCO)" },
    { k: "Trades por janela", v: "1 · 9h–10h · 10h–11h · 11h–12h30" },
    { k: "Teto de stop", v: "500 pts · exceção 700 (abertura)" },
  ];

  const riscoReal = [
    { k: "Capital alocado", v: "R$ 1.000", accent: true },
    { k: "Contratos", v: "1 contrato" },
    { k: "GR diário", v: "R$ 150" },
    { k: "Teto de stop", v: "500 pts · R$ 100" },
    { k: "Alvo", v: "350 pts · R$ 70" },
    { k: "1x1 médio da planilha", v: "~400 pts" },
  ];

  const contratosMesa = [
    { stop: "330 pts", ctts: "2 ctts" },
    { stop: "380 pts", ctts: "2 ctts" },
    { stop: "500 pts", ctts: "2 ctts" },
  ];

  /* ---- Regras universais por plano ---- */
  const regrasMesa = [
    { Icon: IcoShield, text: "Andou 350 pts → protege. Não volta ao stop.", hi: true },
    { Icon: IcoCanal, text: "Canal estreito no M5 define o lado do dia", hi: true },
    { Icon: IcoAlerta, text: "Erro no 1º trade → o 2º só se for nota 10", hi: false },
    { Icon: IcoBarra, text: "Stop de barra não substitui estrutural longo", hi: false },
    { Icon: IconMapPinOff, text: "Ponto de decisão: não faço nada", hi: false },
    { Icon: IconRepeatOff, text: "Não tomo 2 stops na mesma região", hi: false },
    { Icon: IconZoomQuestion, text: "Não pego trades que não fazem sentido no M5", hi: false },
  ];

  const regrasReal = [
    { Icon: IcoShield, text: "Andou 300 pts → autobreakeven", hi: true },
    { Icon: IcoCanal, text: "Canal estreito no M5 define o lado do dia", hi: true },
    { Icon: IcoTentativas, text: "Só pode desistir após 2 tentativas falhadas", hi: true },
    { Icon: IcoBarra, text: "Só barra fechada · doji não entra", hi: false },
    { Icon: IcoAlerta, text: "Erro no 1º trade → o 2º só se for nota 10", hi: false },
    { Icon: IconMapPinOff, text: "Ponto de decisão: não faço nada", hi: false },
    { Icon: IconRepeatOff, text: "Não tomo 2 stops na mesma região", hi: false },
    { Icon: IconZoomQuestion, text: "Não pego trades que não fazem sentido no M5", hi: false },
  ];

  /* ---- Taxonomia por plano ---- */
  const taxonomiaMesa = [
    { m: "Abertura com força direcional", s: "Abertura com Barra de Força" },
    { m: "Tendência estabelecida na MM20", s: "M2B / M2S" },
    { m: "Tendência clara", s: "TC Meio de Movimento · TC Supertrend" },
    { m: "Rompimento e correção", s: "TC Pós BO" },
    { m: "Quebra da MM20 em tendência prévia", s: "Gap de média" },
    { m: "Movimentos climáticos em região de trava", s: "TRM" },
    { m: "Lateralidade com b1 doji", s: "TL" },
  ];

  const taxonomiaReal = [
    { m: "Abertura com força direcional", s: "Abertura com Barra de Força" },
    { m: "Tendência estabelecida — 20+ barras", s: "M2B / M2S na 9 · M2B / M2S na 20" },
    { m: "Tendência sem as 20 barras", s: "TC MM na 9 · TC MM na 20" },
    { m: "Rompimento e correção", s: "TC de Pós BO" },
    { m: "Quebra da MM20 em tendência prévia", s: "Gap de média" },
    { m: "Movimento afastado em região de trava", s: "TRM" },
    { m: "Lateralidade com b1 doji", s: "TL da b1 doji" },
  ];

  const risco = isReal ? riscoReal : riscoMesa;
  const regrasUniversais = isReal ? regrasReal : regrasMesa;
  const taxonomia = isReal ? taxonomiaReal : taxonomiaMesa;

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

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>Plano de trade</div>
        <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 4 }}>
          Meu Trading System v2.0 · atualizado outubro/2026
        </div>
      </div>

      {/* SELETOR DE PLANO */}
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          background: theme.cardAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 4,
          marginBottom: 26,
        }}
      >
        {PLANOS.map((p) => {
          const ativo = p.id === plano;
          return (
            <button
              key={p.id}
              onClick={() => setPlano(p.id)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 9,
                padding: "9px 18px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13.5,
                fontWeight: 700,
                background: ativo ? theme.accent : "transparent",
                color: ativo ? (theme.isDark ? "#0f1115" : "#ffffff") : theme.textMuted,
                transition: "background 140ms ease, color 140ms ease",
              }}
            >
              {p.rotulo}
            </button>
          );
        })}
      </div>

      {/* FILOSOFIA — compartilhada entre os dois planos */}
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
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>
              Risco · {isReal ? "conta real" : "MIDE 3"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {risco.map((r) => (
              <div key={r.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                <span style={{ color: theme.textMuted }}>{r.k}</span>
                <span style={{ color: r.accent ? theme.accent : theme.text, fontWeight: 700, textAlign: "right" }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>

          {isReal ? (
            <div
              style={{
                background: `${theme.accent}14`,
                border: `1px solid ${theme.accent}40`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                lineHeight: 1.55,
                color: theme.text,
              }}
            >
              <b style={{ color: theme.accent }}>Objetivo desta fase.</b> A conta real não tem
              placar — o trabalho dela é reacostumar com dinheiro entrando e saindo da corretora
              diariamente. Para pensar em 2 contratos: 10 ganhos líquidos de 350 pts, ou seja
              +R$700. Com 1 contrato não existe parcial nem carrego: ou sai tudo no alvo, ou fica
              tudo.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 8 }}>
                Contratos são <b style={{ color: theme.text }}>consequência</b> do stop, não escolha:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {contratosMesa.map((c) => (
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
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 10, lineHeight: 1.5 }}>
                Conta aprovada em outubro/2026. ION 3 e ION OTS foram canceladas — a mesa ION
                encerrou as atividades.
              </div>
            </>
          )}
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
              Gestão de saída {isReal ? "· mecanizada" : "· o alvo decide"}
            </div>
          </div>

          {isReal ? (
            <>
              <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                Nada é decidido durante o trade. A ordem no alvo fica posicionada{" "}
                <b style={{ color: theme.text }}>desde a entrada</b>.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    background: `${theme.accent}14`,
                    border: `1px solid ${theme.accent}40`,
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                    A regra inteira
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, lineHeight: 1.5 }}>
                    300 protege no 0x0 · 350 sai
                  </div>
                </div>
                <div style={{ background: theme.cardAlt, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                    Exceção — abertura com barra de força
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                    Alvo 1x1 da própria barra, saída 100%. Proteção nos 350 pts de MEP.
                  </div>
                </div>
                <div style={{ background: theme.cardAlt, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                    Saída antecipada é permissão, não gatilho
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                    Só pode sair depois de <b>2 tentativas falhadas</b>, lidas pelo M2. 1ª: entrou
                    na barra de sinal ativada e houve alguma continuidade imediata, mesmo que só um
                    pavio. 2ª: recuou e avançou de novo. A partir daí, se voltar a andar contra,{" "}
                    <b>pode</b> sair no 0x0 ou no máximo a −150 pts. Antes de duas tentativas,
                    segura. Passou de −150, deixa ir até o stop.
                  </div>
                </div>
                <div style={{ background: theme.cardAlt, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                    Por que 350 e não mais
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                    Nos replays, dos trades que chegaram a 350 pts, 70% seguiram até 500 — e a conta
                    para valer a troca precisa de mais de 70%. É empate, e estender por um empate
                    reintroduz decisão no meio do trade.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
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
                    Abertura 1x1 · TL nos 50% do range → sai 100% no alvo, sem parcial.
                  </div>
                </div>
                <div style={{ background: theme.cardAlt, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                    Alvo aberto
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                    TC em tendência · TRM em confluência · M2B/M2S → <b>primeira parcial no 1,5x1</b>{" "}
                    + carrega.
                  </div>
                </div>
                <div
                  style={{
                    background: `${theme.accent}14`,
                    border: `1px solid ${theme.accent}40`,
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.accent, marginBottom: 3 }}>
                    Não girar sem estar no positivo
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.5 }}>
                    Parciais e recolocações servem para maximizar lucro em posição a favor, nunca
                    para reduzir prejuízo em posição parada.
                  </div>
                </div>
              </div>
            </>
          )}
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
            {regrasUniversais.map((r, i) => (
              <div
                key={i}
                style={{
                  background: r.hi ? `${theme.accent}14` : theme.cardAlt,
                  border: `1px solid ${r.hi ? theme.accent + "40" : theme.border}`,
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <r.Icon color={r.hi ? theme.accent : theme.textMuted} />
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: r.hi ? theme.accent : theme.text,
                    marginTop: 10,
                    lineHeight: 1.4,
                  }}
                >
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
          Quatro contextos: abertura · tendência · lateralidade · reversão. Canal estreito no M5
          define o lado do dia — não se opera contra ele, nem a favor do macro.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {taxonomia.map((t) => (
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

      {/* SETUPS — agrupados por categoria de mercado */}
      <div style={{ margin: "24px 0 14px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>
          Setups — {isReal ? "conta real" : "mesa prop · MIDE 3"}
        </div>
        <div style={{ fontSize: 13.5, color: theme.textMuted, marginTop: 2 }}>
          {isReal
            ? "Nove trades em quatro famílias. Comum a todos, exceto a abertura: 1 contrato · stop estrutural com teto de 500 pts · alvo 350 pts com ordem desde a entrada · 300 protege no 0x0 · 350 sai · só barra fechada · doji não entra."
            : "Agrupados por categoria de mercado. Dentro de cada grupo: ativos primeiro · stand-by depois · encerrados no fim."}
        </div>
      </div>

      {CATEGORIAS.map((c) => {
        const doGrupo = setups.filter((s) => s.categoria === c.id);
        if (doGrupo.length === 0) return null;
        const emStandby = doGrupo.filter((s) => s.standby).length;
        const encerrados = doGrupo.filter((s) => s.encerrado).length;
        let badge = `${doGrupo.length} setup${doGrupo.length > 1 ? "s" : ""}`;
        let badgeColor = { bg: `${theme.accent}22`, text: theme.accent };
        if (c.id === "standby" || emStandby > 0) {
          badge = `${doGrupo.length} em stand-by`;
          badgeColor = { bg: "#e0a63a22", text: "#e0a63a" };
        }
        if (c.id === "encerrado" || encerrados === doGrupo.length) {
          badge = `${doGrupo.length} encerrado${doGrupo.length > 1 ? "s" : ""}`;
          badgeColor = { bg: "#88888818", text: "#7d838d" };
        }
        return (
          <Accordion
            key={c.id}
            level="top"
            theme={theme}
            title={c.titulo}
            subtitle={c.subtitulo}
            badge={badge}
            badgeColor={badgeColor}
          >
            <SetupsTable theme={theme} setups={doGrupo} bare />
          </Accordion>
        );
      })}
    </div>
  );
}
