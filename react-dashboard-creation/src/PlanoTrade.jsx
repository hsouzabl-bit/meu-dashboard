import React, { useState } from "react";

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

function StatCard({ theme, label, value, accent }) {
  return (
    <div style={{ background: theme.cardAlt, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: accent ? theme.accent : theme.text }}>{value}</div>
    </div>
  );
}

function DetailBlock({ theme, label, children, danger }) {
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, padding: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: danger ? "#e05555" : theme.accent,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: theme.text, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Chip({ theme, children }) {
  return (
    <span style={{ background: theme.cardAlt, color: theme.textMuted, fontSize: 11.5, padding: "4px 9px", borderRadius: 7 }}>
      {children}
    </span>
  );
}

function SetupDetail({ s, theme }) {
  const blockA = s.data.regiao
    ? {
        label: "Região (mín. 2 de 4)",
        content: (
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
            {s.data.regiao.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ),
      }
    : { label: "Pré-condição (veto)", content: s.data.veto };

  const blockB = s.data.condicao
    ? { label: "Condição", content: s.data.condicao }
    : { label: "Regras de entrada", content: [s.data.regras, s.data.filtros].filter(Boolean).join(" ") };

  return (
    <div style={{ padding: "18px 20px 20px", background: theme.bg }}>
      <div style={{ fontSize: 12.5, color: theme.textMuted, lineHeight: 1.6, marginBottom: 14 }}>{s.data.logica}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
        <StatCard theme={theme} label="Stop aceito" value={s.stopAceito} />
        <StatCard theme={theme} label="Split (5 ctts)" value={s.split} />
        <StatCard theme={theme} label="RxR combinado" value={s.rxr} accent />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <DetailBlock theme={theme} label={blockA.label}>{blockA.content}</DetailBlock>
        <DetailBlock theme={theme} label={blockB.label}>{blockB.content}</DetailBlock>
        <DetailBlock theme={theme} label="Gatilhos aceitos">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {s.barraSinalChips.map((c, i) => (
              <Chip key={i} theme={theme}>{c}</Chip>
            ))}
          </div>
        </DetailBlock>
        <DetailBlock theme={theme} label="Onde invalida" danger>{s.data.invalidacao}</DetailBlock>
      </div>

      <div
        style={{
          background: "#e0555518",
          border: "1px solid #e0555540",
          borderRadius: 10,
          padding: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "#e05555", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
          Red flags conhecidos
        </div>
        <div style={{ fontSize: 12.5, color: theme.text, lineHeight: 1.6 }}>{s.data.redFlags}</div>
      </div>

      <div style={{ fontSize: 12.5, color: theme.textMuted, lineHeight: 1.6 }}>
        {s.papel && (
          <div style={{ marginBottom: 6 }}>
            <b style={{ color: theme.text }}>Papel no operacional: </b>
            {s.papel}
          </div>
        )}
        <div>
          <b style={{ color: theme.text }}>Exemplo âncora: </b>
          {s.data.exemplo}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabela comparativa de setups (expansão inline) ---------------- */

function SetupsTable({ theme, setups }) {
  const [openId, setOpenId] = useState(null);

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
              const isOpen = openId === s.id;
              const Icon = s.Icon;
              return (
                <React.Fragment key={s.id}>
                  <tr
                    onClick={() => setOpenId(isOpen ? null : s.id)}
                    style={{
                      cursor: "pointer",
                      background: isOpen ? theme.cardAlt : i % 2 === 1 ? `${theme.cardAlt}80` : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 14px", borderBottom: isOpen ? "none" : `1px solid ${theme.border}` }}>
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
                    <td style={{ padding: "12px 14px", borderBottom: isOpen ? "none" : `1px solid ${theme.border}`, color: theme.textMuted }}>
                      {s.timeframeShort}
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: isOpen ? "none" : `1px solid ${theme.border}`, color: theme.textMuted }}>
                      {s.barraSinalChips.join(" · ")}
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: isOpen ? "none" : `1px solid ${theme.border}` }}>
                      <div style={{ fontWeight: 700, color: theme.text }}>{s.split}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>{s.rxr}</div>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: isOpen ? "none" : `1px solid ${theme.border}` }}>
                      <Pill theme={theme} tone={s.fluencia.tone}>{s.fluencia.label}</Pill>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: isOpen ? "none" : `1px solid ${theme.border}`, textAlign: "center" }}>
                      <IcoChevron open={isOpen} color={theme.textMuted} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, borderBottom: `1px solid ${theme.border}` }}>
                        <SetupDetail s={s} theme={theme} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
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
    stopAceito: "Variável (esticamento)",
    split: "3/1/1",
    rxr: "1,2x1",
    badge: "Fluente",
    badgeColor: { bg: "#4ecb8d22", text: "#4ecb8d" },
    fluencia: { label: "Fluente", tone: "good", detalhe: "80% de acerto no período (4G/1L/1BE em 6 trades)" },
    data: {
      logica: "Mercado esticado demais de um movimento direcional atinge um ponto de resistência real (confluência de níveis), onde a probabilidade de continuidade cai e a de reação/correção sobe — captura o \"elástico esticado\" antes de um retorno às médias.",
      timeframe: "M5 para identificar o esticamento e a região de confluência; M60/D para checar tendência macro a favor; execução no M2.",
      veto: "Esticamento mínimo: 3+ barras do M5 sem tocar a MME9 do M5. Sem esse afastamento, não é candidato.",
      regras: "Mercado esticado (3+ barras sem testar MME9 do M5) + região de trava (S/R, LT/CL, Fibo, MA longa, VWAP) + gatilho de qualidade adequada na região.",
      filtros: "Confluência de pelo menos 2-3 níveis coincidindo na mesma região; a favor da tendência macro (semanal/diário); espaço suficiente até a MME9 do M2 em supertrend para viabilizar parcial.",
      barraSinal: "Melhor: inside/outside favoráveis à reversão. Bom: martelo/invertido, engolfo. Aceitável: doji ou cor oposta somente se for inside, e ainda assim o pavio precisa sinalizar força claramente a favor da reversão — do contrário, não se enquadra.",
      invalidacao: "Rompimento além do nível de origem da reação (além do fundo/topo que gerou a reversão, ou além da região de confluência que sustentava o trade) — na maioria dos casos, isso já coincide com o stop técnico.",
      redFlags: "Entrar sem espaço até a MME9 do M2 (mata a parcial); pegar reação contra o M2 sem confirmação; doji fora do critério acima (cor a favor sem pavio de força).",
      exemplo: "22/06 (DB exato macro + alvo 3 pivô + alvo 1 pivô maior + inside — \"trade simplesmente IMPECÁVEL\"); 12/06 (DB exato + inside positiva na região + 61,8% da perna macro).",
    },
  },
  {
    id: "fq",
    nomeCurto: "FQ",
    nome: "FQ — Falha de Estrutura",
    subtitulo: "Falha de estrutura",
    Icon: IconFQ,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Martelo/invertido", "2BR", "Inside", "Outside"],
    stopAceito: "Até 250 pts",
    split: "3/1/1",
    rxr: "1,3x1",
    papel: "(a) alternativa ao TRM quando esticado mas sem ter dado para participar; (b) captura de reversão real numa localização onde a reversão já era esperada e a força reversiva já aconteceu, deixando correção + gatilho.",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "Reformulado com o Mateus, jul/2026 — histórico anterior: 41% de acerto" },
    data: {
      logica: "Falha de continuidade expõe traders posicionados a favor da tendência com stop técnico no nível que acabou de ser rompido — a quebra de estrutura gera o próprio combustível da reversão ao acionar esses stops. Fechado para exigir região de alta confluência e condição que já demonstre força reversiva real, não hipotética.",
      timeframe: "M5 para região e condição; M2 para MME9, espaço e execução.",
      regiao: [
        "Topo/fundo isolado",
        "Suporte/Resistência validado (2+ toques prévios)",
        "Médias do tempo gráfico maior",
        "Alvo de fibo + 1 confluência adicional",
      ],
      condicao: "Esticado: 3+ candles afastado da MME9 do M5, com espaço para 1x1 na MME9 do M2. Estruturado: quebra de microestrutura anterior + calço da MME9 do M2 + espaço gráfico de 1x1 até o T/F mais próximo (da perna que gerou a falha) — sem esse espaço, não há trade.",
      barraSinal: "Martelo/martelo invertido · 2BR (inclui engolfo) · inside bar (favorável, ou doji com fechamento nos 30% superiores/inferiores + pavio consistente) · outside bar.",
      invalidacao: "A falha precisa se confirmar rápido — retorno além do nível que gerou a falha é continuação disfarçada, não FQ.",
      redFlags: "Doji fora do critério objetivo de pavio; região com só 1 confluência; condição \"esticado\" sem espaço até a 9 do M2; condição \"estruturado\" sem espaço até o T/F (veto automático).",
      exemplo: "29/06 (FQ realmente acima da 9 e da VWAP, vindo da MM20 do 60' + 50% fibo do dia anterior).",
    },
  },
  {
    id: "tc-mm",
    nomeCurto: "TC Meio de Mov.",
    nome: "TC — Meio de Movimento (MME9)",
    subtitulo: "Pullback na MME9",
    Icon: IconTCMM,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Padrão", "Inside/outside reforça"],
    stopAceito: "Variável (T/F do swing)",
    split: "3/1/1",
    rxr: "1,2x1",
    badge: "Funcional",
    badgeColor: { bg: "#4ecb8d22", text: "#4ecb8d" },
    fluencia: { label: "Funcional", tone: "good", detalhe: "54% de acerto no período" },
    data: {
      logica: "Dentro de uma tendência já estabelecida, o pullback até a média de referência oferece entrada de continuidade — o viés a favor já está validado pelo alinhamento das médias.",
      timeframe: "M5 para checar alinhamento de médias e estrutura de tendência; M2 para execução do PB.",
      veto: "Médias alinhadas: 9>20>50>200 (ou inverso na baixa). Estrutura de tendência prévia (mín. 2 T/F/T/F).",
      regras: "Preço calçado na MME9 ou MME20, com espaço gráfico mínimo 1x1 até o próximo alvo.",
      filtros: "Gatilho a favor do 60'/D; VWAP próxima; confluência no ponto de PB; ausência de FQ contra (ou FQ a favor reforça).",
      barraSinal: "Padrão — não precisa ser excepcional, exceto se for ela mesma a fonte de invalidação (inside/outside), caso em que vira mais robusta por definição.",
      invalidacao: "T/F prévio do swing que sustenta a correção — a menos que a SB seja especial (inside/outside), que já protege sozinha contra violinada.",
      redFlags: "Entrar sem estrutura de tendência clara no M5; PB raso após PB profundo exige SB 10/10; usar doji fora de contexto muito favorável.",
      exemplo: "15/06 — TC na 9 com boa barra, manteve disciplina apesar de tensão durante o trade (\"MUITO BOM não ter desistido\"), pagou bem.",
    },
  },
  {
    id: "tc-pos",
    nomeCurto: "TC Pós BO",
    nome: "TC — Pós BO (rompimento)",
    subtitulo: "Continuidade pós-rompimento",
    Icon: IconTCPos,
    timeframeShort: "M2 / M5 (janela 40 barras)",
    barraSinalChips: ["Inside", "Outside", "Martelo/shooting star", "2BR"],
    stopAceito: "Variável (a própria SB)",
    split: "2/2/1",
    rxr: "1,6x1",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "44% de acerto no período, raiz recém-reformulada" },
    data: {
      logica: "Captura continuidade após um rompimento genuíno de uma região relevante (lateralidade mín. 2T/2F, triângulo, ou máx/mín do dia) que já provou ter distanciado e retornado — é o teste do rompimento, não a entrada nele.",
      timeframe: "M2 se o nível estiver contido em até ~40 barras de M2 (~80min); acima disso, sobe para M5/M15 — e o trade correto passa a ser meio de movimento pós-rompimento, não entrada direto no rompimento.",
      veto: "Precisa ter de fato rompido algo — não há TC de pós de topo/fundo micro. Rompimento = barra de rompimento fechando perto do extremo + barra de continuidade a favor (peso inverso: rompimento fraco pede continuidade forte, e vice-versa; sempre as duas barras). Ideal que o preço ande um pouco antes de puxar o pullback.",
      regras: "Retorno até a região rompida, após o afastamento de verdade já confirmado.",
      filtros: "Gatilho a favor do 60'/D; VWAP próxima; confluência no ponto de retorno; ausência de FQ contra.",
      barraSinal: "Excelente, sem meio-termo: inside, outside, martelo/shooting star ou 2BR. A barra carrega sozinha o peso da invalidação.",
      invalidacao: "A própria barra de sinal — perder a mín/máx dela imediatamente após acionar é falha confirmada. Se não reverte na hora mas também não avança X pontos antes de cair X, a ideia também estava errada; o stop \"curto\" aqui é preciso, não frágil.",
      redFlags: "Romper topo/fundo micro sem afastamento real (\"fez zero sentido no M5\"); entrar antecipado na 9 do 2' em vez de esperar o toque na 9 do 5' ou na região rompida; repetir entrada na mesma região após stop; operar em ponto de decisão ainda aberto.",
      exemplo: "17/06 — par de comparação: 1º trade (antecipado na 9 do 2', loss) vs. 2º trade no mesmo dia (esperou o toque na 9 do 5', +355pts).",
    },
  },
  {
    id: "tc-super",
    nomeCurto: "TC Supertrend",
    nome: "TC — Supertrend (9 do 2')",
    subtitulo: "9 do M2",
    Icon: IconTCSuper,
    timeframeShort: "M5 → M2",
    barraSinalChips: ["Padrão"],
    stopAceito: "—",
    split: "—",
    rxr: "—",
    badge: "Coletando dados",
    badgeColor: { bg: `#8888` + "22", text: "#9aa3b2" },
    fluencia: { label: "Sem amostra", tone: "neutral", detalhe: "Poucas ocorrências com a regra já formalizada — observar próximas entradas" },
    data: {
      logica: "Mesmo cenário de tendência com médias alinhadas do TC de MM, mas usa especificamente a MME9 do M2 — exige que ela já tenha se provado como suporte/resistência viva antes, evitando ser o primeiro a testar um nível ainda não validado.",
      timeframe: "M5 para contexto de tendência e alinhamento de médias; M2 para a reação na 9 e execução.",
      veto: "Médias alinhadas (9>20>50>200); a MME9 do M2 precisa já ter reagido pelo menos 1x antes — nunca ser o primeiro a comprar/vender nela.",
      regras: "Pullback até a MME9 do M2, dentro do histórico de reação já estabelecido.",
      filtros: "Mesmos do TC de MM — gatilho a favor do 60'/D, confluência, ausência de FQ contra.",
      barraSinal: "Padrão — mesma lógica do TC de MM. A estrutura maior (médias alinhadas + histórico de reação) já valida, a barra só precisa cumprir o mínimo.",
      invalidacao: "Mesmo princípio do TC de MM — T/F prévio do swing, exceto se a SB for especial (inside/outside).",
      redFlags: "Ser pioneiro na 9 do 2' sem histórico de reação prévia; médias desalinhadas mascarando tendência ainda não confirmada.",
      exemplo: "A acumular — nenhum caso recente isolado o suficiente com a regra já formalizada.",
    },
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

      {/* FILOSOFIA — estilo revista, sempre visível */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: theme.accent,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 6,
          }}
        >
          Plano de trade
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, lineHeight: 1.2, marginBottom: 20 }}>
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

        <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: 18, marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textMuted, marginBottom: 4 }}>
            Critério de seletividade
          </div>
          <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>
            Sempre que parecer "mais ou menos", esperar. Vem sinal melhor. Só o que eu faria
            100 vezes de novo, independente do resultado desse trade específico.
          </div>
        </div>

        <div
          style={{
            borderLeft: `2px solid ${theme.accent}`,
            paddingLeft: 18,
            paddingTop: 12,
            paddingBottom: 12,
            marginBottom: 22,
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

      <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: "28px 0" }} />

      {/* GESTÃO DE SAÍDA — painel, sempre visível */}
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
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
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
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

      {/* REGRAS UNIVERSAIS — painel, sempre visível */}
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IcoShield color={theme.accent} />
          <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Regras universais</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
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
