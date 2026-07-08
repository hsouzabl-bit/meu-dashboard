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

const FALLBACK_THEME = {
  bg: "#0f1115",
  card: "#171a21",
  cardAlt: "#1d212a",
  border: "#2a2f3a",
  text: "#eef1f6",
  textMuted: "#9aa3b2",
  accent: "#4ecb8d",
};

function useTheme(th) {
  return {
    bg: th?.bg ?? FALLBACK_THEME.bg,
    card: th?.card ?? FALLBACK_THEME.card,
    cardAlt: th?.cardAlt ?? th?.card ?? FALLBACK_THEME.cardAlt,
    border: th?.border ?? FALLBACK_THEME.border,
    text: th?.text ?? FALLBACK_THEME.text,
    textMuted: th?.textMuted ?? th?.muted ?? FALLBACK_THEME.textMuted,
    accent: th?.accent ?? FALLBACK_THEME.accent,
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

/* ---------------- Cartão de setup (estrutura fixa de colunas) ---------------- */

function SetupCard({ nome, badge, badgeColor, fluencia, data, theme }) {
  return (
    <Accordion
      title={nome}
      badge={badge}
      badgeColor={badgeColor}
      theme={theme}
    >
      <Field label="Lógica do setup" theme={theme}>{data.logica}</Field>
      <Field label="Timeframe de leitura" theme={theme}>{data.timeframe}</Field>
      <Field label="Pré-condição (veto)" theme={theme}>{data.veto}</Field>
      <Field label="Regras de entrada" theme={theme}>{data.regras}</Field>
      <Field label="Filtros" theme={theme}>{data.filtros}</Field>
      <Field label="Barra de sinal exigida" theme={theme}>{data.barraSinal}</Field>
      <Field label="Onde invalida" theme={theme}>{data.invalidacao}</Field>
      <Field label="Red flags conhecidos" theme={theme}>{data.redFlags}</Field>
      <Field label="Estado de fluência" theme={theme}>
        <Pill theme={theme} tone={fluencia.tone}>{fluencia.label}</Pill>
        {fluencia.detalhe && (
          <span style={{ marginLeft: 8, color: theme.textMuted, fontSize: 13 }}>
            {fluencia.detalhe}
          </span>
        )}
      </Field>
      <Field label="Exemplo âncora" theme={theme}>{data.exemplo}</Field>
    </Accordion>
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
    nome: "TRM — Trade de Retorno às Médias",
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
    nome: "FQ — Falha de Estrutura",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "Regras reformuladas — histórico anterior: 38% de acerto, maior detrator financeiro do período" },
    data: {
      logica: "Falha de continuidade expõe traders posicionados a favor da tendência com stop técnico no nível que acabou de ser rompido — a quebra de estrutura (topo mais baixo / fundo mais alto) gera o próprio combustível da reversão ao acionar esses stops.",
      timeframe: "M5 para estrutura, esticamento e veto de tendência (20 barras); M2 para confirmação de rompimento do nível relevante e execução.",
      veto: "Candidato somente em uma de duas situações: (1) esticado 3+ barras do M5 sem tocar a MME9 do M5 (mesma régua do TRM) ou (2) calçado pela MME9 no M2 e rompimento de um topo/fundo relevante anterior (o T/F que perdeu o fundo/topo que o sustentava — onde estaria o stop técnico de quem opera a favor da tendência). Veto adicional: se as últimas ~20 barras do M5 mostram tendência direcional clara sem sinal de exaustão (clímax, 3+ puxadas sem correção profunda), FQ não é candidato.",
      regras: "Estrutura de tendência prévia (T/F/T/F, mín. 2 de cada lado) + região de trava (S/R, LT/CL, Fibo, MA longa, VWAP) + falha de estrutura confirmada + gatilho na região.",
      filtros: "MME9 do M2 a favor da nova direção; gatilho em região de fibored (38-61,8% da perna); espaço até a MME9 do M2 para viabilizar parcial — pegar longe dela (espaço) ou depois dela (apoio), nunca no meio do caminho.",
      barraSinal: "Rejeição decisiva da região — martelo, engolfo ou inside claro a favor da reversão. Doji nunca é aceitável como SB de agressão neste setup.",
      invalidacao: "A falha de estrutura precisa se confirmar rápido — se o preço volta a romper além do nível que gerou a falha, não é FQ, é continuação disfarçada.",
      redFlags: "Doji como SB (recorrente: 09/06, 18/06 ×2, 23/06); operar contra canal estreito/muito perto das médias sem quebra real de estrutura; vender no fundo de um range pequeno sem violação de fundo relevante; repetir a mesma região após FQ anterior (\"FQ do FQ\").",
      exemplo: "29/06 (FQ realmente acima da 9 e da VWAP, vindo da MM20 do 60' + 50% fibo do dia anterior).",
    },
  },
  {
    nome: "TC — Meio de Movimento (MME9)",
    badge: "Funcional",
    badgeColor: { bg: "#4ecb8d22", text: "#4ecb8d" },
    fluencia: { label: "Funcional", tone: "good", detalhe: "60% de acerto no período (3G/2L), +R$227" },
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
    nome: "TC — Pós BO (rompimento)",
    badge: "Em validação",
    badgeColor: { bg: "#e0a63a22", text: "#e0a63a" },
    fluencia: { label: "Em validação", tone: "warn", detalhe: "25% de acerto no período (2G/6L), -R$834 — raiz recém-reformulada" },
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
    nome: "TC — Supertrend (9 do 2')",
    badge: "Coletando dados",
    badgeColor: { bg: `#8888` + "22", text: "#9aa3b2" },
    fluencia: { label: "Dados insuficientes", tone: "neutral", detalhe: "Poucas ocorrências com a regra já formalizada — observar próximas entradas" },
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
        maxWidth: "calc(75vw - 240px)",
        margin: "0 auto",
        padding: "24px 0 60px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: theme.text,
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

      {/* FILOSOFIA */}
      <Accordion level="top" title="Filosofia operacional" theme={theme} defaultOpen>
        <Field label="O que estou procurando no mercado" theme={theme}>
          Não estou procurando movimentos. Estou procurando meu operacional nos melhores
          contextos — momentos raros de probabilidade elevada onde o preço se encaixa
          naquilo que meu repertório me permite operar com convicção.
        </Field>
        <Field label="Objetivo" theme={theme}>
          Meu único objetivo é seguir o plano. Não é ganhar dinheiro no trade de hoje —
          é executar o processo que, seguido com consistência, gera resultado ao longo do tempo.
        </Field>
        <Field label="Critério de seletividade" theme={theme}>
          Sempre que uma operação parecer "mais ou menos", esperar. Vem sinal melhor. Não me
          contento com "dá pra fazer" — busco apenas o que eu faria 100 vezes se acontecesse
          de novo, independente do resultado desse trade específico.
        </Field>
        <Field label="Mentalidade" theme={theme}>
          Não preciso operar todo dia. Não preciso acertar tudo. Entre 2 e 3 trades por dia,
          seletivo, operando gatilhos no contexto correto, apenas trades de alta probabilidade.
          Só preciso seguir meu plano.
        </Field>
        <Field label="Princípios-guia" theme={theme}>
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
        </Field>
      </Accordion>

      {/* GESTÃO DE RISCO */}
      <Accordion level="top" title="Gestão de risco" theme={theme}>
        <Field label="RxR fixo" theme={theme}>
          Todo trade é pautado em R. Norma fixa neste momento: risco 1R para buscar 1,5R —
          sem exceção, independente da qualidade aparente do setup. Resultado esperado de
          cada operação: gain de 1,5R, loss de 1R, ou breakeven quando a parcial foi
          realizada e o restante voltou no stop técnico.
        </Field>
        <Field label="Evolução futura (condicionada)" theme={theme}>
          Reavaliar a lógica de deixar parte da posição correr além do 1,5x1 quando o
          aumento do R e do número de contratos tornar cada fatia individual
          proporcionalmente menor — reduzindo o impacto de uma reversão parcial no RxR
          final da operação. Só entra em vigor com performance consistente e R maior que o
          atual (R$200).
        </Field>
        <Field label="Stops técnicos" theme={theme}>
          Uso sempre os stops técnicos definidos por setup neste plano, e respeito a
          exigência de barra de sinal de cada um, sem negociar isso por convicção momentânea.
        </Field>
        <Field label="Não-abandono de operação" theme={theme}>
          Saída de qualquer operação só ocorre em: alvo técnico, stop técnico, ou condução
          prevista no plano de saída por contrato. Nunca por antecipação de medo do
          resultado. Se cliquei, aceito — gain vira resultado, loss vira objeto de estudo.
        </Field>
      </Accordion>

      {/* GESTÃO DE SAÍDA */}
      <Accordion level="top" title="Gestão de saída atual — julho/2026" theme={theme}
        subtitle="Baseada em MEP/MEN real de ION 2">
        <Field label="Dados de base" theme={theme}>
          MEP médio dos trades vencedores: ~460pts (geral, 71 trades) / 425pts (últimos 30).
          Apenas 26% dos trades passam de 500pts, apenas 20% passam de 600pts. MEN médio dos
          perdedores: ~220pts — quase exatamente metade do MEP médio.
        </Field>
        <Field label="Leitura" theme={theme}>
          Segurar por alvo maior na maioria das vezes pede um comportamento estatisticamente
          incomum do mercado. Fechar a maior parte da posição por volta de 450pts captura a
          esmagadora maioria do movimento disponível antes da zona onde a reversão fica mais
          provável.
        </Field>
        <Field label="Plano de saída por contrato" theme={theme}>
          <TabelaSaida theme={theme} />
        </Field>
        <Field label="Nota" theme={theme}>
          Revisar periodicamente conforme mais dados de MEP/MEN se acumulam. Quando houver
          volume suficiente, quebrar essa estatística por setup — TRM provavelmente tem MEP
          maior que TC de Pós, por exemplo.
        </Field>
      </Accordion>

      {/* REGRAS TRANSVERSAIS */}
      <Accordion level="top" title="Regras universais" theme={theme}
        subtitle="Aplicam-se a qualquer setup, não presas a um só">
        <Field label="Vetar ponto de decisão" theme={theme}>
          Não operar em ponto de decisão ainda aberto — especialmente rompimentos de S/R
          macro "acreditando que já rompeu" no M5. Rompimentos avaliados sempre dentro da
          lógica de 40 barras (ver TC de Pós BO).
        </Field>
        <Field label="Não repetir região" theme={theme}>
          Jamais entrar em 2 trades seguidos com a mesma ideia, na mesma região, após um
          stop. Aguardar nova definição de estrutura antes de qualquer nova tentativa ali.
        </Field>
        <Field label="Faz sentido no M5?" theme={theme}>
          Pergunta obrigatória antes de qualquer entrada de execução no M2: essa entrada vai
          fazer sentido depois quando observada no M5? Se não fizer sentido no M5, normalmente
          é forçado no M2.
        </Field>
        <Field label="Disposição" theme={theme}>
          Registrar disposição (1 a 5) antes da primeira entrada do dia, para correlacionar
          com stops e identificar se a qualidade de decisão cai após determinado tempo de
          pregão (fadiga/tempo de sessão — categoria própria no diário, separada de
          técnico/emocional).
        </Field>
      </Accordion>

      {/* SETUPS */}
      <div style={{ margin: "24px 0 12px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Setups — Trading System Starter</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>
          Pré BO pausado no momento.
        </div>
      </div>

      {SETUPS.map((s) => (
        <SetupCard key={s.nome} {...s} theme={theme} />
      ))}
    </div>
  );
}
