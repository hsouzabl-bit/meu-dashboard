import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["s","t","q","q","s","s","d"];

// Contas disponíveis. "arquivo" = conta encerrada, dado congelado.
// fonte decide de onde os números saem — e o que existe para cada uma.
const CONTAS = [
  { id: "MIDE 3",  fonte: "contas", arquivo: false },
  { id: "Real",    fonte: "contas", arquivo: false },
  { id: "ION 3",   fonte: "diario", arquivo: true  },
  { id: "ION 2",   fonte: "diario", arquivo: true  },
  { id: "ION OTS", fonte: "ots",    arquivo: true  },
];

const CHAVE_A = "est_conta_a";
const CHAVE_B = "est_conta_b";

function fetchComRetryEst(url, tentativas = 3, delayMs = 1200) {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err => {
      if (tentativas <= 1) throw err;
      return new Promise(res => setTimeout(res, delayMs))
        .then(() => fetchComRetryEst(url, tentativas - 1, delayMs));
    });
}

function r2(v) { return Math.round(v * 100) / 100; }
function media(arr) {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
function fmtRS(v) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return (v >= 0 ? "+" : "−") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}
function chaveData(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}
function ddmm(iso) { return iso.slice(8, 10) + "/" + iso.slice(5, 7); }

// Ciclos do PA OTS têm nomenclatura própria; o resto é TSS.
function grupoDoSetup(nome) {
  const n = (nome || "").toLowerCase();
  if (n.includes("dmf") || n.includes("dfo") || n.includes("dfr") || n.includes("eql")) return "OTS";
  if (n.includes("fq")) return "Fora do operacional";
  return "TSS";
}
const ORDEM_GRUPO = { "TSS": 0, "OTS": 1, "Fora do operacional": 2 };
const COR_GRUPO = { "TSS": "#5FA8AE", "OTS": "#6B8CC4", "Fora do operacional": "#B98FC2" };

// ─── normalizadores: cada fonte vira o MESMO formato ────────────────────────

function blocoVazio() {
  return { trades: 0, gains: 0, losses: 0, breakevens: 0, financTotal: 0,
           financGains: 0, financLosses: 0, riscoTotal: 0, riscoCount: 0,
           mep: { todos: [], gains: [], losses: [] },
           men: { todos: [], gains: [], losses: [] } };
}

function fecharBloco(b) {
  const dec = b.gains + b.losses;
  const mg = b.gains > 0 ? b.financGains / b.gains : 0;
  const ml = b.losses > 0 ? b.financLosses / b.losses : 0;
  return {
    trades: b.trades, gains: b.gains, losses: b.losses, breakevens: b.breakevens,
    taxaAcerto: dec > 0 ? Math.round((b.gains / dec) * 100) : 0,
    financTotal: r2(b.financTotal),
    mediaGain: r2(mg), mediaLoss: r2(ml),
    rxrMedio: ml !== 0 ? r2(mg / Math.abs(ml)) : 0,
    stopMedio: b.riscoCount > 0 ? r2(b.riscoTotal / b.riscoCount) : 0,
    mep: { todos: media(b.mep.todos), gains: media(b.mep.gains), losses: media(b.mep.losses) },
    men: { todos: media(b.men.todos), gains: media(b.men.gains), losses: media(b.men.losses) },
    amostra: { todos: b.mep.todos.length, gains: b.mep.gains.length, losses: b.mep.losses.length },
  };
}

// Conta atual: tudo calculado a partir da lista crua, então qualquer recorte
// de data é instantâneo e sem rede.
function normalizarTrades(lista) {
  const geral = blocoVazio();
  const porSetup = {};
  const porDia = {};
  const errosTec = {};
  const errosEmo = {};
  const nota10PorSetup = {};

  lista.forEach(t => {
    const isGain = t.resultado === "gain";
    const isLoss = t.resultado === "loss";
    const isBe = t.resultado === "breakeven";
    if (!porSetup[t.setup]) porSetup[t.setup] = blocoVazio();

    [geral, porSetup[t.setup]].forEach(b => {
      b.trades++;
      b.financTotal += t.financ;
      if (isGain) { b.gains++; b.financGains += t.financ; }
      else if (isLoss) { b.losses++; b.financLosses += t.financ; }
      else if (isBe) b.breakevens++;
      if (t.risco > 0) { b.riscoTotal += t.risco; b.riscoCount++; }
      if (isGain || isLoss) {
        b.mep.todos.push(t.mep); b.men.todos.push(t.men);
        if (isGain) { b.mep.gains.push(t.mep); b.men.gains.push(t.men); }
        else { b.mep.losses.push(t.mep); b.men.losses.push(t.men); }
      }
    });

    if (!porDia[t.data]) porDia[t.data] = { resultado: 0, trades: 0, gains: 0, losses: 0 };
    porDia[t.data].resultado += t.financ;
    porDia[t.data].trades++;
    if (isGain) porDia[t.data].gains++;
    else if (isLoss) porDia[t.data].losses++;

    if (t.erro) {
      const alvo = t.tipoErro === "emocional" ? errosEmo : (t.tipoErro === "tecnico" ? errosTec : null);
      if (alvo) {
        if (!alvo[t.erro]) alvo[t.erro] = { count: 0, custo: 0 };
        alvo[t.erro].count++;
        alvo[t.erro].custo += t.financ;
      }
    }
    if (t.nota10) {
      if (!nota10PorSetup[t.setup]) nota10PorSetup[t.setup] = { n: 0, soma: 0, mep: [], men: [] };
      const k = nota10PorSetup[t.setup];
      k.n++; k.soma += t.financ; k.mep.push(t.mep); k.men.push(t.men);
    }
  });

  const datas = Object.keys(porDia).sort();
  let acum = 0;
  const grafico = datas.map(d => { acum += porDia[d].resultado; return { data: d, valor: r2(acum) }; });
  Object.keys(porDia).forEach(d => { porDia[d].resultado = r2(porDia[d].resultado); });

  function topErros(obj) {
    return Object.entries(obj).sort((a, b) => a[1].custo - b[1].custo).slice(0, 5)
      .map(([nome, v]) => ({ nome, count: v.count, custo: r2(v.custo) }));
  }

  return {
    temDetalhe: true,
    kpis: fecharBloco(geral),
    setups: Object.keys(porSetup).map(nome => ({ nome, grupo: grupoDoSetup(nome), ...fecharBloco(porSetup[nome]) }))
      .sort((a, b) => (ORDEM_GRUPO[a.grupo] - ORDEM_GRUPO[b.grupo]) || (b.financTotal - a.financTotal)),
    porDia, grafico,
    errosTecnicos: topErros(errosTec),
    errosEmocionais: topErros(errosEmo),
    nota10: Object.keys(nota10PorSetup).map(nome => {
      const k = nota10PorSetup[nome];
      return { nome, n: k.n, medio: r2(k.soma / k.n), mep: media(k.mep), men: media(k.men) };
    }).sort((a, b) => b.n - a.n),
  };
}

// Contas encerradas: o GAS só devolve agregado do período inteiro.
// Sem MEP/MEN e sem recorte por dia — e a tela diz isso.
function normalizarDiario(dados, conta) {
  if (!dados) return null;
  const c = dados.contas?.[conta];
  const curva = conta === "ION 2" ? (dados.graficoION2 || []) : (dados.graficoION3 || []);
  const porDia = {};
  let ant = 0;
  curva.forEach(p => { porDia[p.data] = { resultado: r2(p.valor - ant), trades: null, gains: 0, losses: 0 }; ant = p.valor; });

  return {
    temDetalhe: false,
    kpis: c ? {
      trades: c.trades, gains: c.gains, losses: c.losses, breakevens: c.breakevens,
      taxaAcerto: c.taxaAcerto, financTotal: c.financTotal,
      mediaGain: c.mediaGain, mediaLoss: c.mediaLoss,
      rxrMedio: c.rxrMedio, stopMedio: c.stopMedio,
      mep: null, men: null,
    } : null,
    setups: (dados.setupsPorConta?.[conta] || []).map(s => ({
      nome: s.nome, grupo: grupoDoSetup(s.nome),
      trades: s.trades, taxaAcerto: s.taxaAcerto, financTotal: s.financTotal,
      mediaGain: null, mediaLoss: null, rxrMedio: null, mep: null, men: null,
    })).sort((a, b) => (ORDEM_GRUPO[a.grupo] - ORDEM_GRUPO[b.grupo]) || (b.financTotal - a.financTotal)),
    porDia, grafico: curva,
    // top3Tecnicos/Emocionais são calculados no GAS só para ION 3
    errosTecnicos: conta === "ION 3" ? (dados.top3Tecnicos || []) : [],
    errosEmocionais: conta === "ION 3" ? (dados.top3Emocionais || []) : [],
    nota10: [],
  };
}

function normalizarOts(ots) {
  if (!ots) return null;
  const porDia = {};
  const tec = {}, emo = {};
  Object.keys(ots.porData || {}).forEach(d => {
    const p = ots.porData[d];
    porDia[d] = { resultado: p.resultado, trades: p.trades, gains: 0, losses: 0 };
    (p.errosTecnico || []).forEach(e => { if (!tec[e]) tec[e] = { count: 0, custo: 0 }; tec[e].count++; });
    (p.errosEmocional || []).forEach(e => { if (!emo[e]) emo[e] = { count: 0, custo: 0 }; emo[e].count++; });
  });
  const lista = o => Object.entries(o).sort((a, b) => b[1].count - a[1].count).slice(0, 5)
    .map(([nome, v]) => ({ nome, count: v.count, custo: null }));

  return {
    temDetalhe: false,
    kpis: {
      trades: ots.trades, gains: ots.gains, losses: ots.losses, breakevens: ots.breakevens,
      taxaAcerto: ots.taxaAcerto, financTotal: ots.financTotal,
      mediaGain: ots.mediaGain, mediaLoss: ots.mediaLoss,
      rxrMedio: ots.rxrMedio, stopMedio: ots.stopMedio,
      mep: null, men: null,
    },
    setups: (ots.setups || []).map(s => ({
      nome: s.nome, grupo: grupoDoSetup(s.nome),
      trades: s.trades, taxaAcerto: s.taxaAcerto, financTotal: s.financTotal,
      mediaGain: null, mediaLoss: null, rxrMedio: null, mep: null, men: null,
    })).sort((a, b) => (ORDEM_GRUPO[a.grupo] - ORDEM_GRUPO[b.grupo]) || (b.financTotal - a.financTotal)),
    porDia, grafico: ots.grafico || [],
    errosTecnicos: lista(tec),
    errosEmocionais: lista(emo),
    nota10: [],
  };
}

// ─── peças visuais ─────────────────────────────────────────────────────────

function Celula({ th, titulo, extra, children, semPad }) {
  return (
    <div style={{ background: th.cardBg, border: `1px solid ${th.border}`, borderRadius: 14,
      padding: semPad ? "16px 18px 14px" : "16px 18px", minWidth: 0,
      display: "flex", flexDirection: "column", boxShadow: th.cardShadow }}>
      {(titulo || extra) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 11 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: th.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{titulo}</span>
          {extra}
        </div>
      )}
      {children}
    </div>
  );
}

function Aviso({ th, children }) {
  return <div style={{ fontSize: 12, color: th.textMuted, padding: "22px 0", textAlign: "center", lineHeight: 1.5 }}>{children}</div>;
}

function Pill({ th, dark, wr }) {
  const c = wr >= 60 ? (dark ? { bg: "#182420", bd: "#3d6b52", tx: "#7fb89a" } : { bg: "#eaf7f0", bd: "#5cb583", tx: "#2f7d52" })
          : wr >= 45 ? (dark ? { bg: "#211f18", bd: "#6b6142", tx: "#c2b184" } : { bg: "#fbf6e6", bd: "#d1a53d", tx: "#8a6f1a" })
          :            (dark ? { bg: "#211a1a", bd: "#6b4444", tx: "#c68888" } : { bg: "#fbeceb", bd: "#d9776b", tx: "#a83f31" });
  return <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 7px", color: c.tx, background: c.bg, border: `1px solid ${c.bd}` }}>{wr}%</span>;
}

function Tabela({ th, cabecalho, children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr>
          {cabecalho.map((h, i) => (
      
            <th key={i} style={{ fontSize: 9.5, fontWeight: 800, color: th.textMuted, textTransform: "uppercase",
              letterSpacing: "0.06em", textAlign: i === 0 ? "left" : "right", padding: "0 0 7px",
              paddingRight: i === 0 ? 14 : 0,
              borderBottom: `1px solid ${th.border}`, whiteSpace: "nowrap" }}>{h}</th>
      
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Td({ th, children, primeira, cor, forte }) {
  return (

    <td style={{ padding: "7px 0", paddingRight: primeira ? 14 : 0,
      borderBottom: `1px solid ${th.border}`,
      textAlign: primeira ? "left" : "right", color: cor || (primeira ? th.text : th.textSub),
      fontWeight: forte ? 700 : 400, fontVariantNumeric: "tabular-nums",
      whiteSpace: primeira ? "normal" : "nowrap", lineHeight: 1.45 }}>{children}</td>
    
  );
}

// Calendário clicável: 1º clique marca o início, 2º clique (data posterior)
// fecha o intervalo, 3º limpa. Em conta de arquivo fica só de leitura.
function Calendario({ th, dark, porDia, mes, ano, onNavegar, sel, onDia, ativo }) {
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const primeiro = new Date(ano, mes, 1).getDay();
  const offset = primeiro === 0 ? 6 : primeiro - 1;

  const celulas = [];
  for (let i = 0; i < offset; i++) celulas.push(<div key={`v${i}`} />);
  for (let d = 1; d <= ultimoDia; d++) {
    const chave = chaveData(ano, mes, d);
    const info = porDia[chave];
    const dentro = sel.ini && ((sel.fim && chave >= sel.ini && chave <= sel.fim) || (!sel.fim && chave === sel.ini));
    let bg = "transparent", bd = `1px solid ${th.border}`, tx = th.textMuted, peso = 500;
    if (info) {
      bg = info.resultado >= 0 ? (dark ? "#1a7048" : "#eaf7f0") : (dark ? "#421c26" : "#fbeceb");
      tx = dark ? "#e8eaee" : th.text; peso = 800; bd = "none";
    }
    celulas.push(
      <div key={d}
        onClick={() => ativo && info && onDia(chave)}
        title={info ? `${ddmm(chave)} · ${fmtRS(info.resultado)}` : undefined}
        style={{ aspectRatio: "1 / 1", borderRadius: 6, background: bg, border: bd,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11.5, fontWeight: peso, color: tx, boxSizing: "border-box",
          cursor: ativo && info ? "pointer" : "default",
          outline: dentro ? `2px solid ${th.accent}` : "none", outlineOffset: -2 }}>
        {d}
      </div>
    );
  }

  const btn = { background: "none", border: `1px solid ${th.border2}`, color: th.textSub,
    borderRadius: 6, width: 22, height: 22, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
        <button onClick={() => onNavegar(-1)} style={btn}>‹</button>
        <button onClick={() => onNavegar(1)} style={btn}>›</button>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: th.textSub }}>{MESES_PT[mes]} {ano}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {DIAS_SEM.map((d, i) => <div key={i} style={{ fontSize: 9, color: th.textMuted, textAlign: "center" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>{celulas}</div>
    </>
  );
}

// ─── página ────────────────────────────────────────────────────────────────

export default function Estatisticas({ th, dadosCache, otsCache, loadingCache, onRecarregar }) {
  const dark = th?.dark ?? ((th?.bg || "").startsWith("#1") || (th?.bg || "").startsWith("#0"));
  const ACCENT = th?.accent || "#4ecb8d";
  const hoje = new Date();

  const [tradesContas, setTradesContas] = useState(null);
  const [otsDados, setOtsDados] = useState(otsCache || null);

  const [contaA, setContaA] = useState(() => {
    try { const v = localStorage.getItem(CHAVE_A); if (CONTAS.some(c => c.id === v)) return v; } catch (e) {}
    return "MIDE 3";
  });
  const [contaB, setContaB] = useState(() => {
    try { const v = localStorage.getItem(CHAVE_B); if (CONTAS.some(c => c.id === v)) return v; } catch (e) {}
    return "Real";
  });
  const trocarA = v => { setContaA(v); setSelA({ ini: null, fim: null }); try { localStorage.setItem(CHAVE_A, v); } catch (e) {} };
  const trocarB = v => { setContaB(v); setSelB({ ini: null, fim: null }); try { localStorage.setItem(CHAVE_B, v); } catch (e) {} };

  const [mesA, setMesA] = useState(hoje.getMonth());
  const [anoA, setAnoA] = useState(hoje.getFullYear());
  const [mesB, setMesB] = useState(hoje.getMonth());
  const [anoB, setAnoB] = useState(hoje.getFullYear());
  const [selA, setSelA] = useState({ ini: null, fim: null });
  const [selB, setSelB] = useState({ ini: null, fim: null });

  // Lista crua das contas atuais: cache imediato, fetch atrasado para não
  // competir com o getDashboardInit.
  useEffect(() => {
    try {
      const c = localStorage.getItem("cache_contas_trades");
      if (c) setTradesContas(JSON.parse(c).contas || null);
    } catch (e) {}
    const t = setTimeout(() => {
      fetchComRetryEst(`${API_DIARIO}?action=getContasTrades`)
        .then(j => {
          if (j.erro) return;
          setTradesContas(j.contas || {});
          try { localStorage.setItem("cache_contas_trades", JSON.stringify(j)); } catch (e) {}
        })
        .catch(() => {});
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { if (otsCache) setOtsDados(otsCache); }, [otsCache]);
  useEffect(() => {
    if (otsCache) return;
    try {
      const c = localStorage.getItem("cache_ots");
      if (c) setOtsDados(JSON.parse(c));
    } catch (e) {}
  }, []);

  function clicarDia(sel, setSel, chave) {
    if (!sel.ini || sel.fim) return setSel({ ini: chave, fim: null });
    if (chave === sel.ini) return setSel({ ini: null, fim: null });
    if (chave > sel.ini) return setSel({ ini: sel.ini, fim: chave });
    return setSel({ ini: chave, fim: sel.ini });
  }

  function montar(contaId, sel) {
    const meta = CONTAS.find(c => c.id === contaId);
    if (!meta) return null;
    if (meta.fonte === "contas") {
      const lista = (tradesContas || {})[contaId];
      if (!lista) return null;
      const recorte = sel.ini
        ? lista.filter(t => t.data >= sel.ini && t.data <= (sel.fim || sel.ini))
        : lista;
      const full = normalizarTrades(lista);
      const vis = normalizarTrades(recorte);
      // o calendário sempre mostra o histórico inteiro; o resto segue o recorte
      return { ...vis, porDia: full.porDia, meta };
    }
    if (meta.fonte === "diario") { const n = normalizarDiario(dadosCache, contaId); return n && { ...n, meta }; }
    const n = normalizarOts(otsDados); return n && { ...n, meta };
  }

  const A = useMemo(() => montar(contaA, selA), [contaA, selA, tradesContas, dadosCache, otsDados]);
  const B = useMemo(() => montar(contaB, selB), [contaB, selB, tradesContas, dadosCache, otsDados]);

  const lados = [
    { d: A, conta: contaA, trocar: trocarA, mes: mesA, ano: anoA, sel: selA,
      navegar: delta => { let m = mesA + delta, a = anoA; if (m < 0) { m = 11; a--; } if (m > 11) { m = 0; a++; } setMesA(m); setAnoA(a); },
      onDia: ch => clicarDia(selA, setSelA, ch), limpar: () => setSelA({ ini: null, fim: null }) },
    { d: B, conta: contaB, trocar: trocarB, mes: mesB, ano: anoB, sel: selB,
      navegar: delta => { let m = mesB + delta, a = anoB; if (m < 0) { m = 11; a--; } if (m > 11) { m = 0; a++; } setMesB(m); setAnoB(a); },
      onDia: ch => clicarDia(selB, setSelB, ch), limpar: () => setSelB({ ini: null, fim: null }) },
  ];

  const faixa = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14, alignItems: "stretch" };
  const duplo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minWidth: 0 };
  const corV = dark ? "#7fb89a" : "#2f7d52";
  const corN = dark ? "#c68888" : "#a83f31";

  function KPI({ v, l, cor }) {
    return (
      <div style={{ background: th.resumeBg, border: `1px solid ${th.border}`, borderRadius: 10, padding: "9px 11px", minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, color: cor || th.text, fontVariantNumeric: "tabular-nums" }}>{v}</div>
        <div style={{ fontSize: 10.5, color: th.textMuted, marginTop: 3 }}>{l}</div>
      </div>
    );
  }

  function linhasSetups(d) {
    const linhas = [];
    let grupoAtual = null;
    d.setups.forEach(s => {
      if (s.grupo !== grupoAtual) {
        grupoAtual = s.grupo;
        linhas.push(
          <tr key={`g-${s.grupo}`}>
            <td colSpan={4} style={{ fontSize: 9.5, fontWeight: 800, color: th.textMuted, textTransform: "uppercase",
              letterSpacing: "0.06em", padding: "12px 0 5px", opacity: s.grupo === "Fora do operacional" ? 0.5 : 1 }}>{s.grupo}</td>
          </tr>
        );
      }
      const fosco = s.grupo === "Fora do operacional";
      linhas.push(
        <tr key={s.nome} style={{ opacity: fosco ? 0.5 : 1 }}>
          <Td th={th} primeira>
            <span style={{ display: "inline-block", width: 3, height: 11, borderRadius: 2, marginRight: 7,
              verticalAlign: -1, background: COR_GRUPO[s.grupo] }} />
            {s.nome}
          </Td>
          <Td th={th}>{s.trades}</Td>
          <Td th={th}><Pill th={th} dark={dark} wr={s.taxaAcerto} /></Td>
          <Td th={th} forte cor={s.financTotal >= 0 ? corV : corN}>{fmtRS(s.financTotal)}</Td>
        </tr>
      );
    });
    return linhas;
  }

  const semDados = l => !l.d;

  return (
    <div style={{ flex: 1, padding: "18px 26px 48px", overflowY: "auto", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: th.text, margin: 0, letterSpacing: "-0.02em" }}>Estatísticas</h1>
        <p style={{ fontSize: 13, color: th.textMuted, margin: "4px 0 0" }}>
          Duas contas lado a lado. Clique num dia do calendário para filtrar, e num segundo dia para marcar um intervalo.
        </p>
      </div>

      {/* FAIXA 1 — conta + números principais */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 13, flexWrap: "wrap" }}>
              <select value={l.conta} onChange={e => l.trocar(e.target.value)}
                style={{ background: th.resumeBg, color: th.text, border: `1px solid ${th.border2}`, borderRadius: 8,
                  padding: "7px 11px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                {CONTAS.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {l.d?.meta?.arquivo && (
                  <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                    color: dark ? "#c2a15f" : "#8a6f1a", background: dark ? "rgba(194,161,95,0.14)" : "#fbf6e6",
                    borderRadius: 5, padding: "2px 7px" }}>arquivo · encerrada</span>
                )}
                {l.sel.ini && (
                  <span onClick={l.limpar} style={{ fontSize: 11, color: ACCENT, fontWeight: 700, cursor: "pointer" }}>
                    {ddmm(l.sel.ini)}{l.sel.fim ? ` – ${ddmm(l.sel.fim)}` : ""} ×
                  </span>
                )}
              </div>
            </div>
            {semDados(l) || !l.d.kpis ? <Aviso th={th}>Sem dados carregados para esta conta.</Aviso> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                <KPI v={fmtRS(l.d.kpis.financTotal)} l="Resultado" cor={l.d.kpis.financTotal >= 0 ? corV : corN} />
                <KPI v={`${l.d.kpis.taxaAcerto}%`} l={`${l.d.kpis.gains}G / ${l.d.kpis.losses}L`} />
                <KPI v={`${l.d.kpis.rxrMedio}x`} l="RxR médio" />
                <KPI v={`R$ ${Math.round(l.d.kpis.stopMedio)}`} l="Stop médio" />
              </div>
            )}
          </Celula>
        ))}
      </div>

      {/* FAIXA 2 — curva */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th} titulo="Curva acumulada"
            extra={l.d && <span style={{ fontSize: 10.5, color: th.textMuted }}>{l.d.kpis?.trades ?? 0} trades</span>}>
            {semDados(l) || (l.d.grafico || []).length < 2 ? <Aviso th={th}>Dados insuficientes para a curva.</Aviso> : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={l.d.grafico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: th.textMuted }} tickFormatter={ddmm}
                    minTickGap={26} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: th.textMuted }} width={44} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: th.surface, border: `1px solid ${th.border2}`, borderRadius: 9, fontSize: 12.5, color: th.text }}
                    itemStyle={{ color: th.text }} labelStyle={{ color: th.textMuted }}
                    labelFormatter={ddmm} formatter={v => [fmtRS(v), "Acumulado"]} />
                  <ReferenceLine y={0} stroke={th.border2} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="valor" stroke={ACCENT} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Celula>
        ))}
      </div>

      {/* FAIXA 3 — calendário */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th} titulo="Calendário"
            extra={<span style={{ fontSize: 10.5, color: th.textMuted }}>
              {l.d?.temDetalhe ? "clique para filtrar" : "somente leitura"}
            </span>}>
            {semDados(l) ? <Aviso th={th}>Sem dados.</Aviso> : (
              <Calendario th={{ ...th, accent: ACCENT }} dark={dark} porDia={l.d.porDia}
                mes={l.mes} ano={l.ano} onNavegar={l.navegar} sel={l.sel}
                onDia={l.onDia} ativo={l.d.temDetalhe} />
            )}
          </Celula>
        ))}
      </div>

      {/* FAIXA 4 — setups */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th} titulo="Desempenho por setup">
            {semDados(l) || !l.d.setups.length ? <Aviso th={th}>Nenhum setup no recorte.</Aviso> : (
              <Tabela th={th} cabecalho={["Setup", "n", "Acerto", "Resultado"]}>{linhasSetups(l.d)}</Tabela>
            )}
          </Celula>
        ))}
      </div>

      {/* FAIXA 5 — MEP / MEN */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th} titulo="MEP / MEN · pontos">
            {semDados(l) || !l.d.kpis?.mep ? (
              <Aviso th={th}>Esta conta não guarda MEP/MEN na planilha.</Aviso>
            ) : (
              <div style={duplo}>
                <Tabela th={th} cabecalho={["MEP", "Média", "n"]}>
                  <tr><Td th={th} primeira>Gains</Td><Td th={th} forte>{l.d.kpis.mep.gains}</Td><Td th={th}>{l.d.kpis.amostra.gains}</Td></tr>
                  <tr><Td th={th} primeira>Losses</Td><Td th={th} forte>{l.d.kpis.mep.losses}</Td><Td th={th}>{l.d.kpis.amostra.losses}</Td></tr>
                  <tr><Td th={th} primeira>Todos</Td><Td th={th} forte>{l.d.kpis.mep.todos}</Td><Td th={th}>{l.d.kpis.amostra.todos}</Td></tr>
                </Tabela>
                <Tabela th={th} cabecalho={["MEN", "Média", "n"]}>
                  <tr><Td th={th} primeira>Gains</Td><Td th={th} forte>{l.d.kpis.men.gains}</Td><Td th={th}>{l.d.kpis.amostra.gains}</Td></tr>
                  <tr><Td th={th} primeira>Losses</Td><Td th={th} forte>{l.d.kpis.men.losses}</Td><Td th={th}>{l.d.kpis.amostra.losses}</Td></tr>
                  <tr><Td th={th} primeira>Todos</Td><Td th={th} forte>{l.d.kpis.men.todos}</Td><Td th={th}>{l.d.kpis.amostra.todos}</Td></tr>
                </Tabela>
              </div>
            )}
          </Celula>
        ))}
      </div>

      {/* FAIXA 6 — erros */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th} titulo="Erros nomeados">
            {semDados(l) ? <Aviso th={th}>Sem dados.</Aviso> : (
              <div style={duplo}>
                <Tabela th={th} cabecalho={["Técnico", "n", "Custo"]}>
                  {l.d.errosTecnicos.length === 0
                    ? <tr><td colSpan={3} style={{ fontSize: 12, color: th.textMuted, padding: "12px 0" }}>Nenhum</td></tr>
                    : l.d.errosTecnicos.map((e, k) => (
                        <tr key={k}>
                          <Td th={th} primeira>{e.nome}</Td>
                          <Td th={th}>{e.count}</Td>
                          <Td th={th} cor={corN}>{e.custo == null ? "—" : fmtRS(e.custo)}</Td>
                        </tr>
                      ))}
                </Tabela>
                <Tabela th={th} cabecalho={["Emocional", "n", "Custo"]}>
                  {l.d.errosEmocionais.length === 0
                    ? <tr><td colSpan={3} style={{ fontSize: 12, color: th.textMuted, padding: "12px 0" }}>Nenhum</td></tr>
                    : l.d.errosEmocionais.map((e, k) => (
                        <tr key={k}>
                          <Td th={th} primeira>{e.nome}</Td>
                          <Td th={th}>{e.count}</Td>
                          <Td th={th} cor={corN}>{e.custo == null ? "—" : fmtRS(e.custo)}</Td>
                        </tr>
                      ))}
                </Tabela>
              </div>
            )}
          </Celula>
        ))}
      </div>

      {/* FAIXA 7 — trades 10/10 */}
      <div style={faixa}>
        {lados.map((l, i) => (
          <Celula key={i} th={th} titulo="Trades 10/10">
            {semDados(l) || !l.d.temDetalhe ? (
              <Aviso th={th}>Esta conta não marca 10/10 na planilha.</Aviso>
            ) : l.d.nota10.length === 0 ? (
              <Aviso th={th}>Nenhum trade marcado 10/10 no recorte.</Aviso>
            ) : (
              <Tabela th={th} cabecalho={["Setup", "n", "R$ médio", "MEP", "MEN"]}>
                {l.d.nota10.map(s => (
                  <tr key={s.nome}>
                    <Td th={th} primeira>{s.nome}</Td>
                    <Td th={th}>{s.n}</Td>
                    <Td th={th} forte cor={s.medio >= 0 ? corV : corN}>{fmtRS(s.medio)}</Td>
                    <Td th={th}>{s.mep}</Td>
                    <Td th={th}>{s.men}</Td>
                  </tr>
                ))}
              </Tabela>
            )}
          </Celula>
        ))}
      </div>
    </div>
  );
}
