import { useState, useRef, useEffect } from "react";

// ─── DADOS ────────────────────────────────────────────────────────────────────

const RESUMO_EBOOK = `# Resumo — Al Brooks Técnico E-book

## 1. CONCEITO DE GAP
Gap é um deslocamento ou aceleração de preço que ocorre entre o fechamento do dia anterior e a primeira barra do dia, ou por micro canal inicial sem sobreposição entre barras. Indica **desequilíbrio temporário** entre compradores e vendedores.

## 2. AS 3 POSSIBILIDADES DE GAP

### BO + Continuidade
- B1 forte (fechamento >60% do corpo), B2 com mínima acima da máxima da B1
- Pouco pavio contrário, pouca sobreposição
- **Leitura:** mercado aceita o gap → alta probabilidade de continuação direcional
- ⚠️ Correções acima de 20 barras = Endless Pullback

### BO + Correção
- Movimento lento contra o gap, barras sobrepostas, retorno às médias (mm20/mm200)
- **Leitura:** correção saudável antes de possível retomada
- ⚠️ MC estreito na correção → chance de segunda perna contra o gap

### BO + FBO
- Gap grande/climático, forte rejeição, barra de reversão ou inside/outside contra o gap
- **Leitura:** mercado rejeita os preços → lateralidade ou reversão

## 3. PRIMEIRA BARRA (B1)
| B1 | Interpretação |
|----|--------------|
| Forte + continuidade B2 | Direção confirmada |
| Doji ou fraca | Lateralidade provável |
| Fraca sem continuidade | Raramente sustenta rompimentos |

> A primeira barra diz muito sobre o dia, mas a continuidade confirma tudo.

## 4. MM200
- Duelando entre tempos → lateralidade provável
- Ao meio do range → lateralidade
- Alinhada em todos os tempos → melhores movimentos direcionais

## 5. TRIPLO SCREEN
| Tempo | Função |
|-------|--------|
| M15 | Contexto e direção macro |
| M5 | Estrutura e pressão |
| M2 | Gatilhos de entrada |

> O macro define a direção; o micro oferece o gatilho.

## 6. EXEMPLOS GRÁFICOS (Pág. 42+)

**Volta em V (Pág. 42):** Reversão com força igual ou superior ao impulso anterior gera alvos na direção da reversão. Extremamente incomum novo MC de baixa reverter MC de alta.

**FAB4 no M2 (Pág. 43):** mm200 ao meio do gap serve como suporte. Estado comprimido (mm20 + mm200 próximas) + B1 forte + B2 como 2BR = cenário ideal.

**BO + FBO → Reversão Climática (Pág. 44):** Gap de alta que falha rapidamente inverte o viés. M15 identifica; M5 e M2 oferecem gatilhos.

**MC Inicial → Modo Sempre Vendido (Pág. 45):** B1 que falha em múltiplos níveis simultâneos (POC, mm200, VWAP anterior, DT) é sinal poderoso de venda.

**B1 Doji + MC de Baixa (Pág. 46):** Ausência de compradores (sem H1, sem tentativa de retomada) → vendas com boa probabilidade até alvos.

**BO Forte Sem Correção → 3º Alvo (Pág. 47):** Quando não há nem correção de 1 barra, conduza até 2º e 3º alvos.

**Perna 2 após FBO (Pág. 48):** Ciclos extremos geram premissa de segunda perna. Se as barras confirmarem, opere a favor.

**Gap de Média em Correção de 2 Pernas (Pág. 49):** Um dos setups mais confiáveis. Outside + MC confirmam modo e projetam segunda perna.

**BO + Correção com DB/VWAP (Pág. 51):** Após BO e correção, DB, VWAP anterior e mm20 são zonas de compra.

**Compra de Gap de Média + M2B (Pág. 53):** Em MC de baixa, aguardar BO e correção → entrar no H2 ou H3, não no H1.

**BO + FBO = Lateralidade (Pág. 54):** 80% das reversões falham. Nesses dias evite continuidade nas extremidades; opere POC e setups de venda.

**Ciclo Forte — Múltiplas Entradas (Pág. 61-62):** Fase forte: H1 → fase amadurecida: H2 → H3 → gap de média. Correções ficam maiores com o tempo.

**MTR após Gap de Média (Pág. 66):** Gap de média ao final da tendência = esgotamento. DT + forte outside no M15 = maior sinal de reversão disponível.

**Contexto do M15 Define o Dia (Pág. 68):** Apenas o M15 poderia prever a grande reversão. O macro é sempre responsável pelos movimentos do micro.

## 7. GLOSSÁRIO
| Sigla | Significado |
|-------|-------------|
| BO | Breakout (rompimento) |
| FBO | Failed Breakout (falha de rompimento) |
| MC | Micro canal |
| MTR | Major Trend Reversal |
| TBTL | Ten Bars, Two Legs |
| FAB4 | Abertura acima mm200 com médias comprimidas |
| POC | Point of Control |
| VWAP | Volume Weighted Average Price |
| M2B/M2S | 2 pernas de correção na média (compra/venda) |`;

const RESUMO_PADROES = `# Resumo — Padrões de Abertura: Triplo Screen

## 1. ESTRUTURA
Price Action (Al Brooks) + Análise Técnica aplicados ao day trade no Ibovespa Mini com triplo screen M2/M5/M15.

**Objetivo:** Leitura de contexto, localização correta e decisão operacional — sem entradas impulsivas.

## 2. AS 3 POSSIBILIDADES DE GAP (rápido)
| Cenário | Leitura |
|---------|---------|
| BO + Continuidade | Aceita o gap → seguir a direção |
| BO + Correção | Correção saudável → possível retomada |
| BO + FBO | Rejeita o gap → lateralidade ou reversão |

## 3. MM200 E TEMPOS
- Duelando → lateralidade
- Alinhada → melhores movimentos direcionais
- Ao meio do range → lateralidade

## 4. CHECKLIST DA ABERTURA
✅ **Antes:** onde está a mm200? Dia anterior foi direcional? Há lateralidade longa no fechamento?
✅ **Na Abertura:** B1 forte ou doji? Houve continuidade na B2? Gap pequeno, médio ou grande?
✅ **Durante:** há continuidade ou sobreposição? Correção saudável ou MC estreito? Favor do tempo maior?
❌ **Evitar:** BO sem continuidade, comprar alto/vender baixo longe das médias, operar contra tendência sem pressão prévia

## 5. PADRÕES DE ALTA PROBABILIDADE
- **FAB4** — abertura acima mm200, médias comprimidas
- **Wedge** — 3 puxadas; após 3º alvo aguardar TBTL antes de reentrar
- **DB / DT** — fundos e topos duplos como referência
- **Gap de Média** — preço distante das médias → retorno como setup

## 6. MÁXIMAS
> "A primeira barra diz muito sobre o dia, mas a continuidade confirma tudo."
> "O macro define a direção; o micro oferece o gatilho."
> "BO sem continuidade é apenas tentativa, não confirmação."
> "Sem gap de média, a tendência continua forte."
> "Clareza gera confiança. Contexto gera probabilidade. Probabilidade gera consistência."`;

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Qual das características abaixo NÃO é necessária para confirmar um padrão de BO + Continuidade?",
    options: [
      "B1 com fechamento acima de 60% do corpo",
      "B2 com mínima acima da máxima da B1",
      "Retorno às médias (mm20/mm200) na B2",
      "Pouco ou nenhum pavio contrário"
    ],
    correct: 2,
    explanation: "O retorno às médias na B2 caracteriza o padrão BO + Correção, não BO + Continuidade. No BO + Continuidade a B2 deve confirmar a direção, não corrigir contra ela.",
    topic: "Padrões de Gap"
  },
  {
    id: 2,
    question: "Correções acima de quantas barras configuram um Endless Pullback?",
    options: ["10 barras", "15 barras", "20 barras", "30 barras"],
    correct: 2,
    explanation: "Correções acima de 20 barras configuram Endless Pullback — o que parecia uma correção se torna uma grande tendência contrária ou reversão climática.",
    topic: "Endless Pullback"
  },
  {
    id: 3,
    question: "No Triplo Screen, qual é a função do M15?",
    options: [
      "Gatilhos de entrada",
      "Estrutura e pressão",
      "Contexto e direção macro",
      "Definição de stop"
    ],
    correct: 2,
    explanation: "M15 = contexto e direção macro. M5 = estrutura e pressão. M2 = gatilhos de entrada. O macro define a direção; o micro oferece o gatilho.",
    topic: "Triplo Screen"
  },
  {
    id: 4,
    question: "Quando a mm200 está ao meio do range (entre a máxima e a mínima do dia), qual é a leitura mais provável?",
    options: [
      "Alta probabilidade de tendência de alta",
      "Alta probabilidade de lateralidade",
      "Sinal de rompimento iminente",
      "Confirmação de BO + Continuidade"
    ],
    correct: 1,
    explanation: "mm200 ao meio do range indica alta probabilidade de lateralidade. Em lateralidades, trades de continuidade nas extremidades têm baixa probabilidade (80% dos rompimentos falham).",
    topic: "MM200"
  },
  {
    id: 5,
    question: "Uma B1 como doji indica:",
    options: [
      "Alta probabilidade de tendência forte desde a abertura",
      "Confirmação de BO + Continuidade",
      "Possibilidade de lateralidade por mais barras",
      "Sinal de reversão climática"
    ],
    correct: 2,
    explanation: "B1 como doji é uma lateralidade em uma barra — indica a possibilidade de gerar mais lateralidade, mantendo os preços no range por mais barras antes de um eventual rompimento.",
    topic: "Primeira Barra (B1)"
  },
  {
    id: 6,
    question: "O que caracteriza um BO + FBO (Failed Breakout)?",
    options: [
      "B1 forte com continuidade na B2",
      "Gap grande com forte rejeição do preço (barra de reversão ou inside/outside contra o gap)",
      "Retorno lento às médias com barras sobrepostas",
      "Micro canal de alta com correções sintéticas"
    ],
    correct: 1,
    explanation: "BO + FBO apresenta gap frequentemente climático, forte rejeição do preço e barra de reversão ou inside/outside bar contra a direção do gap. O mercado não aceita os preços → lateralidade ou reversão.",
    topic: "Padrões de Gap"
  },
  {
    id: 7,
    question: "No padrão FAB4, qual é o estado ideal das médias mm20 e mm200?",
    options: [
      "mm200 muito acima da mm20, ambas direcionais",
      "mm20 e mm200 em estado comprimido (próximas), com preço acima da mm200",
      "mm200 abaixo do preço e mm20 acima do preço",
      "Ambas as médias flat e sobrepostas ao preço"
    ],
    correct: 1,
    explanation: "FAB4 é caracterizado pela abertura acima da mm200 com mm20 e mm200 em estado comprimido (próximas). Esse estado comprimido gera a possibilidade de um bom afastamento entre as médias — ou seja, um movimento direcional.",
    topic: "FAB4"
  },
  {
    id: 8,
    question: "Após 3 puxadas de alta (wedge), qual é a conduta recomendada?",
    options: [
      "Comprar o rompimento imediatamente",
      "Parar de comprar e aguardar pelo menos uma correção TBTL (10 barras, 2 pernas)",
      "Vender imediatamente na máxima",
      "Aguardar a mm200 para comprar"
    ],
    correct: 1,
    explanation: "Após 3 puxadas, a indicação é parar de comprar por pelo menos uma correção TBTL (10 barras, 2 pernas normalmente descendentes). Correções acima de 20 barras em MC já configuram endless pullback ou reversão climática.",
    topic: "Wedge / TBTL"
  },
  {
    id: 9,
    question: "Segundo o material, qual é a estatística de tentativas de reversão de tendência que falham?",
    options: ["50%", "60%", "75%", "80%"],
    correct: 3,
    explanation: "80% das tentativas de reversão de tendência tendem a falhar inicialmente. Por isso, barras de baixa em tendência de alta devem ser vistas como bandeiras de alta, não como reversões.",
    topic: "Tendências"
  },
  {
    id: 10,
    question: "O que é um 'Endless Pullback' e como ele se manifesta?",
    options: [
      "Uma correção de 1 a 2 barras em uma forte tendência",
      "Uma correção de 10 barras e 2 pernas (TBTL)",
      "Uma correção acima de 20 barras em micro canal ou canal estreito que se torna uma grande tendência contrária",
      "Um rompimento sem continuidade que gera lateralidade"
    ],
    correct: 2,
    explanation: "Endless Pullback ocorre quando correções acima de 20 barras em micro canal ou canal estreito se tornam, na verdade, uma grande tendência contrária ou reversão climática — o que parecia correção virou tendência.",
    topic: "Endless Pullback"
  },
  {
    id: 11,
    question: "Qual é o sinal mais forte de reversão majoritária (MTR) no M15, segundo os exemplos gráficos?",
    options: [
      "Doji na B1 seguido de barras sobrepostas",
      "Gap de média com retorno às médias",
      "Forte barra outside em contexto de alto na lateralidade ou DT após gap de média",
      "Micro canal de alta com correções sintéticas"
    ],
    correct: 2,
    explanation: "Uma forte outside bar no M15 em contexto de alto na lateralidade ou MTR HH (após gap de média de compra no dia anterior) é descrita como: 'se essa barra não te convence a vender, possivelmente nenhuma outra irá'.",
    topic: "MTR / Reversão"
  },
  {
    id: 12,
    question: "Em um micro canal de alta (modo sempre comprado), a primeira correção tende a ter quantas barras?",
    options: [
      "5 a 10 barras",
      "1 a 2 barras (L1)",
      "3 a 5 barras",
      "Mais de 10 barras"
    ],
    correct: 1,
    explanation: "Em micro canal, a primeira correção tende a ter apenas 1 a 2 barras (L1), seguida de compra de H1 que normalmente leva a nova máxima. Às vezes é apenas sintética (sem perda real de mínima no tempo analisado).",
    topic: "Micro Canal"
  },
  {
    id: 13,
    question: "Quando a mm200 está duelando entre tempos gráficos (acima em um tempo, abaixo em outro), qual é o cenário mais provável?",
    options: [
      "Tendência forte e direcional",
      "Rompimento iminente para cima",
      "Lateralidade e movimentos mais difíceis",
      "Gap de média de compra"
    ],
    correct: 2,
    explanation: "mm200 duelando entre tempos (ex: M5 com mm200 acima do preço e M15 com mm200 abaixo do preço) indica tempos conflitantes → movimentos de alta mais difíceis, tendência a lateralidade com encerramentos nas médias.",
    topic: "MM200"
  },
  {
    id: 14,
    question: "O que significa 'gap de média' em termos operacionais?",
    options: [
      "Um gap entre o fechamento e a abertura do dia",
      "Quando o preço abre com desconto/prêmio significativo em relação às médias (duas barras completas abaixo/acima da mm20)",
      "Quando a mm20 e mm200 estão separadas por mais de 50 pontos",
      "Um micro canal que se afasta das médias"
    ],
    correct: 1,
    explanation: "Gap de média ocorre quando o preço se distancia significativamente das médias (duas barras completas abaixo da mm20 para venda, ou acima para compra). É um setup de continuidade pós-tendência, mas o último antes de uma possível lateralidade ou MTR.",
    topic: "Gap de Média"
  },
  {
    id: 15,
    question: "Qual é a conduta correta ao identificar um forte BO sem nenhuma correção (nem H1)?",
    options: [
      "Aguardar a correção e entrar no H1",
      "Não entrar pois pode ser armadilha",
      "Buscar alvos maiores (2º e 3º alvos) sem tentar operar contra",
      "Vender no primeiro sinal de fraqueza"
    ],
    correct: 2,
    explanation: "Rompimentos sem correção no M15 (que 'passam reto') deixam possibilidade de buscar alvos maiores (2º e 3º). Busque qualquer razão para seguir a tendência; normalmente leva a uma tendência em tempos menores com múltiplos gatilhos saindo da mm9 ou mm20.",
    topic: "BO Forte"
  },
  {
    id: 16,
    question: "O que NÃO é uma condição necessária para operar contra a tendência vigente?",
    options: [
      "Pressão vendedora prévia",
      "Quebra da linha de tendência (LTA)",
      "Gap de média",
      "Abertura com B1 forte na direção da tendência"
    ],
    correct: 3,
    explanation: "Para operar contra tendência é necessário: pressão vendedora anterior, quebra da LTA, gap de média e algum tipo de teste da máxima da tendência (preferencialmente DT mais baixo). B1 forte na direção da tendência é o oposto — reforça a tendência existente.",
    topic: "Contra-tendência"
  },
  {
    id: 17,
    question: "Qual é a diferença entre um trade na fase forte da tendência versus a fase madura?",
    options: [
      "Na fase forte há MC; na fase madura aparecem H2, H3 e gap de média",
      "Na fase forte aparecem H2 e H3; na fase madura há apenas H1",
      "Na fase forte o mercado está em lateralidade; na fase madura há MC",
      "Não há diferença operacional entre as fases"
    ],
    correct: 0,
    explanation: "Fase forte: entradas de H1 (1-2 barras de correção) ou H1 sintética. Fase amadurecida: entradas de H2, depois H3, depois gap de média — correções ficam maiores com o tempo até o ponto em que compradores não conseguem nova máxima.",
    topic: "Fases da Tendência"
  },
  {
    id: 18,
    question: "O que é uma 'volta em V' e qual é sua interpretação?",
    options: [
      "Uma correção de duas pernas seguida de retomada da tendência",
      "Um forte impulso revertido com igual ou maior força, gerando alvos na direção oposta",
      "Um fundo duplo com mínima mais alta",
      "Um BO seguido de FBO imediato"
    ],
    correct: 1,
    explanation: "Volta em V ocorre quando um forte impulso é revertido por igual ou maior força. É extremamente incomum ter um novo MC na direção original revertendo um MC na direção contrária — quando acontece, os alvos são a favor da reversão. O 1º alvo tem alta probabilidade.",
    topic: "Volta em V"
  },
  {
    id: 19,
    question: "Ao operar em tendência forte com correção em canal estreito de baixa no M5, qual é a conduta recomendada para compra?",
    options: [
      "Comprar no H1 imediatamente",
      "Aguardar BO e correção do canal → entrar no H2 ou H3",
      "Comprar na mm200 sem esperar gatilho",
      "Não operar em canal estreito contra tendência"
    ],
    correct: 1,
    explanation: "Em MC ou canal estreito de baixa, a compra de H1 pode não se realizar. A forma operacional correta é aguardar o rompimento e a correção para comprar — entradas de H2 ou H3, esperando retomada de alta. No M2 o gatilho aparecerá como forte barra de reversão em MC ou canal estreito de alta.",
    topic: "Canal Estreito"
  },
  {
    id: 20,
    question: "Qual é o princípio fundamental que resume a relação entre tempos gráficos no Triplo Screen?",
    options: [
      "O micro define a direção; o macro oferece o gatilho",
      "M2 e M5 têm igual importância; M15 é apenas referência",
      "O macro define a direção; o micro oferece o gatilho",
      "M15 define o stop; M5 define o alvo; M2 define a entrada"
    ],
    correct: 2,
    explanation: "O princípio fundamental é: 'O macro define a direção, o micro oferece o gatilho.' Tempos menores sozinhos não devem ser operados — apenas a favor dos tempos maiores, com gatilhos em localizações corretas (baixo na lateralidade, retornos às médias, gap de média).",
    topic: "Triplo Screen"
  }
];

// ─── COMPONENTE MARKDOWN SIMPLES ──────────────────────────────────────────────
function SimpleMarkdown({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 1) {
      const headers = tableRows[0].split('|').filter(c => c.trim());
      const rows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim()));
      elements.push(
        <div key={`table-${elements.length}`} style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{headers.map((h, i) => <th key={i} style={{ background: '#1e293b', color: '#94a3b8', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #334155' }}>{h.trim()}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #1e293b' }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', color: '#cbd5e1' }}>{cell.trim()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line);
      return;
    }
    if (inTable) flushTable();

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, marginTop: 8, borderBottom: '2px solid #3b82f6', paddingBottom: 8 }}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: 17, fontWeight: 700, color: '#3b82f6', marginBottom: 8, marginTop: 20 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa', marginBottom: 6, marginTop: 14 }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 12, margin: '10px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>{line.slice(2)}</blockquote>);
    } else if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('❌ ') || line.startsWith('⚠️ ')) {
      const text = line.replace(/^[-✅❌⚠️]\s?/, '');
      const icon = line.startsWith('✅') ? '✅ ' : line.startsWith('❌') ? '❌ ' : line.startsWith('⚠️') ? '⚠️ ' : '• ';
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 13, color: '#cbd5e1' }}>
          <span style={{ flexShrink: 0 }}>{icon}</span>
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>') }} />
        </div>
      );
    } else if (line.trim() === '' || line.startsWith('---')) {
      elements.push(<div key={i} style={{ height: line.startsWith('---') ? 1 : 8, background: line.startsWith('---') ? '#1e293b' : 'transparent', margin: line.startsWith('---') ? '16px 0' : 0 }} />);
    } else if (line.trim()) {
      elements.push(<p key={i} style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>') }} />);
    }
  });

  if (inTable) flushTable();
  return <div>{elements}</div>;
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function EstudosAlBrooks() {
  const [activeTab, setActiveTab] = useState("resumos");
  const [activeResumo, setActiveResumo] = useState("ebook");
  const [activePDF, setActivePDF] = useState("ebook");

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [wrongQueue, setWrongQueue] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQ, setReviewQ] = useState(0);

  // Assistente state
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Olá! Sou seu assistente de análise baseado na metodologia Al Brooks. Descreva um trade que está considerando e avaliarei se está alinhado com os princípios dos materiais (Triplo Screen, padrões de Gap, MM200, contexto e localização)."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const SYSTEM_PROMPT = `Você é um assistente especializado na metodologia de Price Action de Al Brooks, especificamente conforme ensinado pelo canal Al Brooks Técnico (@albrookstecnico). Você avalia trades do Ibovespa Mini (WINFUT) com base nos seguintes princípios:

TRIPLO SCREEN: M15 = contexto macro, M5 = estrutura e pressão, M2 = gatilhos
MM200: alinhada = direcional; duelando entre tempos = lateralidade; ao meio do range = lateralidade
GAPS: BO+Continuidade (B1 forte, B2 confirma), BO+Correção (retorno às médias), BO+FBO (rejeição = lateral/reversão)
B1: forte+continuidade = direcional; doji = lateral provável
MICRO CANAL: modo sempre posicionado; 1ª correção = 1-2 barras; não operar contra
FAB4: abertura acima mm200, mm20+mm200 comprimidas
GAP DE MÉDIA: distância das médias como setup; último setup antes de lateral/MTR
REGRAS DE OURO: nunca contra MC sem pressão prévia; 80% das reversões falham; sem gap de média a tendência continua; macro sempre prevalece sobre o micro

Ao avaliar um trade, responda em português e cubra: 
1) Se o trade está ALINHADO ou NÃO com os princípios 
2) O que está correto na análise 
3) O que está problemático ou em conflito 
4) Uma recomendação clara
Seja direto e objetivo. Se faltar informação (ex: onde está a mm200 no M15), peça antes de avaliar.`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Erro ao obter resposta.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Erro de conexão. Tente novamente." }]);
    }
    setLoading(false);
  };

  // Quiz logic
  const activeQuestions = reviewMode ? wrongQueue : QUIZ_QUESTIONS;
  const currentQuestion = activeQuestions[reviewMode ? reviewQ : currentQ];

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === currentQuestion.correct;
    setResults(prev => [...prev, { id: currentQuestion.id, correct: isCorrect, question: currentQuestion.question, topic: currentQuestion.topic }]);
  };

  const nextQuestion = () => {
    const qIdx = reviewMode ? reviewQ : currentQ;
    const questions = activeQuestions;
    if (qIdx + 1 < questions.length) {
      if (reviewMode) setReviewQ(qIdx + 1);
      else setCurrentQ(qIdx + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setQuizDone(true);
    }
  };

  const startReview = () => {
    const wrong = results
      .filter(r => !r.correct)
      .map(r => QUIZ_QUESTIONS.find(q => q.id === r.id))
      .filter(Boolean);
    setWrongQueue(wrong);
    setReviewMode(true);
    setReviewQ(0);
    setResults([]);
    setQuizDone(false);
    setSelected(null);
    setAnswered(false);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setResults([]);
    setQuizDone(false);
    setReviewMode(false);
    setReviewQ(0);
    setWrongQueue([]);
  };

  const correctCount = results.filter(r => r.correct).length;
  const wrongResults = results.filter(r => !r.correct);

  const PDFS = {
    ebook: { label: "E-book Al Brooks Técnico", url: "/mnt/user-data/uploads/Al_Brooks_Técnico_-_E-book.pdf" },
    padroes: { label: "Padrões de Abertura — Triplo Screen", url: "/mnt/user-data/uploads/Padrões_de_Abertura_-_triplo_screen.pdf" },
    plano: { label: "Plano de Trade 2023", url: "/mnt/user-data/uploads/Plano_de_trade.pdf" }
  };

  const tabs = [
    { id: "resumos", label: "📄 Resumos" },
    { id: "pdfs", label: "📚 PDFs" },
    { id: "assistente", label: "🤖 Assistente" },
    { id: "quiz", label: "🎯 Quiz" }
  ];

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Estudos — Al Brooks Técnico</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Price Action · Triplo Screen · WINFUT</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', padding: '0 24px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? '#3b82f6' : '#64748b', borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent', transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>

        {/* ── RESUMOS ── */}
        {activeTab === "resumos" && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[{ id: "ebook", label: "E-book (completo)" }, { id: "padroes", label: "Padrões de Abertura" }].map(r => (
                <button key={r.id} onClick={() => setActiveResumo(r.id)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeResumo === r.id ? '#3b82f6' : '#1e293b', color: activeResumo === r.id ? '#fff' : '#94a3b8' }}>
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155' }}>
              <SimpleMarkdown content={activeResumo === "ebook" ? RESUMO_EBOOK : RESUMO_PADROES} />
            </div>
          </div>
        )}

        {/* ── PDFs ── */}
        {activeTab === "pdfs" && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {Object.entries(PDFS).map(([id, { label }]) => (
                <button key={id} onClick={() => setActivePDF(id)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activePDF === id ? '#3b82f6' : '#1e293b', color: activePDF === id ? '#fff' : '#94a3b8' }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>📄 {PDFS[activePDF].label}</span>
              </div>
              <div style={{ height: 680, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 40 }}>📄</span>
                <span style={{ fontSize: 14 }}>Visualizador de PDF</span>
                <span style={{ fontSize: 12, color: '#334155', textAlign: 'center', maxWidth: 300 }}>
                  Para integrar no seu dashboard, use um componente {'<iframe>'} ou react-pdf com o caminho do arquivo após upload para seu servidor.
                </span>
                <div style={{ background: '#0f172a', borderRadius: 6, padding: '8px 16px', fontSize: 12, color: '#60a5fa', fontFamily: 'monospace' }}>
                  {PDFS[activePDF].url}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSISTENTE ── */}
        {activeTab === "assistente" && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 580 }}>
            <div style={{ background: '#1e293b', borderRadius: '12px 12px 0 0', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>🤖 Avaliador de Trades — Al Brooks</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Descreva seu trade e receba avaliação baseada nos materiais do Al Brooks Técnico</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: '#0f172a', border: '1px solid #334155', borderTop: 'none' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? '#3b82f6' : '#1e293b',
                    color: '#f1f5f9', fontSize: 13, lineHeight: 1.6, border: msg.role === 'assistant' ? '1px solid #334155' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 2px', background: '#1e293b', border: '1px solid #334155', fontSize: 13, color: '#64748b' }}>
                    Analisando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 8, padding: 12, background: '#1e293b', borderRadius: '0 0 12px 12px', border: '1px solid #334155', borderTop: 'none' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ex: Vou comprar no M5 com mm200 acima do preço no M15, B1 como doji..."
                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                Enviar
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {activeTab === "quiz" && (
          <div>
            {!quizStarted && !quizDone && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Quiz — Al Brooks Técnico</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>20 perguntas sobre Price Action, Triplo Screen, Gaps e Padrões de Abertura.<br/>Respostas erradas ficam salvas para revisão.</p>
                <button onClick={() => setQuizStarted(true)}
                  style={{ padding: '12px 32px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  Iniciar Quiz
                </button>
              </div>
            )}

            {quizStarted && !quizDone && currentQuestion && (
              <div>
                {/* Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    {reviewMode ? '🔄 Revisando erros' : ''} Pergunta {(reviewMode ? reviewQ : currentQ) + 1} de {activeQuestions.length}
                  </span>
                  <span style={{ fontSize: 12, padding: '4px 10px', background: '#1e293b', borderRadius: 20, color: '#94a3b8' }}>{currentQuestion.topic}</span>
                </div>
                <div style={{ background: '#1e2945', borderRadius: 4, height: 4, marginBottom: 20 }}>
                  <div style={{ height: 4, borderRadius: 4, background: '#3b82f6', width: `${(((reviewMode ? reviewQ : currentQ) + 1) / activeQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
                </div>

                {/* Question */}
                <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155', marginBottom: 16 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.5, marginBottom: 0 }}>{currentQuestion.question}</p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {currentQuestion.options.map((opt, idx) => {
                    let bg = '#1e293b', borderColor = '#334155', color = '#cbd5e1';
                    if (answered) {
                      if (idx === currentQuestion.correct) { bg = '#052e16'; borderColor = '#16a34a'; color = '#4ade80'; }
                      else if (idx === selected && idx !== currentQuestion.correct) { bg = '#2d1212'; borderColor = '#dc2626'; color = '#f87171'; }
                    } else if (selected === idx) { bg = '#1e3a5f'; borderColor = '#3b82f6'; }
                    return (
                      <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                        style={{ padding: '12px 16px', background: bg, border: `2px solid ${borderColor}`, borderRadius: 8, color, fontSize: 14, textAlign: 'left', cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#0f172a', border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                          {answered && idx === currentQuestion.correct ? '✓' : answered && idx === selected && idx !== currentQuestion.correct ? '✗' : String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {answered && (
                  <div style={{ background: selected === currentQuestion.correct ? '#052e16' : '#2d1212', border: `1px solid ${selected === currentQuestion.correct ? '#16a34a' : '#dc2626'}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: selected === currentQuestion.correct ? '#4ade80' : '#f87171', marginBottom: 6 }}>
                      {selected === currentQuestion.correct ? '✅ Correto!' : '❌ Incorreto'}
                    </div>
                    <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{currentQuestion.explanation}</p>
                  </div>
                )}

                {answered && (
                  <button onClick={nextQuestion}
                    style={{ width: '100%', padding: '12px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    {(reviewMode ? reviewQ : currentQ) + 1 < activeQuestions.length ? 'Próxima →' : 'Ver Resultado'}
                  </button>
                )}
              </div>
            )}

            {quizDone && (
              <div>
                <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{correctCount === results.length ? '🏆' : correctCount >= results.length * 0.7 ? '👍' : '📚'}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
                    {correctCount} / {results.length} corretas
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 14 }}>
                    {correctCount === results.length ? 'Perfeito! Domínio total.' : correctCount >= results.length * 0.7 ? 'Bom resultado! Alguns pontos para revisar.' : 'Revise os conceitos e tente de novo.'}
                  </p>
                </div>

                {wrongResults.length > 0 && (
                  <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155', marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171', marginBottom: 12 }}>❌ Erros para revisar ({wrongResults.length})</div>
                    {wrongResults.map((r, i) => (
                      <div key={i} style={{ padding: '8px 0', borderBottom: i < wrongResults.length - 1 ? '1px solid #334155' : 'none' }}>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>Tópico: {r.topic}</span>
                        <span style={{ fontSize: 13, color: '#cbd5e1' }}>{r.question}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  {wrongResults.length > 0 && (
                    <button onClick={startReview}
                      style={{ flex: 1, padding: '12px', background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      🔄 Revisar Erros ({wrongResults.length})
                    </button>
                  )}
                  <button onClick={resetQuiz}
                    style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    🎯 Novo Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
