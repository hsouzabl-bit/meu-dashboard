import { useState, useEffect, Fragment } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MES_CURTO = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const DIAS_SEM = ["seg","ter","qua","qui","sex","sáb","dom"];

const CHAVE_FILTROS = "filtros_replays";
const CHAVE_CACHE   = "cache_replays";

const GRUPOS = [
  { id: "Operacional TSS", curto: "TSS" },
  { id: "Operacional OTS", curto: "OTS" },
  { id: "Operacional Al Brooks Técnico", curto: "Al Brooks" },
];

function ehFQ(nome) {
  return (nome || "").toLowerCase().trim() === "fq";
}

function grupoDoSetup(nome) {
  const n = (nome || "").toLowerCase().trim();
  if (n.indexOf("ots -") === 0 || n.indexOf("ots-") === 0) return "Operacional OTS";
  if (n === "trm" || n === "fq" || n.indexOf("trade de continua") === 0) return "Operacional TSS";
  return "Operacional Al Brooks Técnico";
}

function fetchComRetry(url, tentativas = 3, delayMs = 1200) {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err => {
      if (tentativas <= 1) throw err;
      return new Promise(res => setTimeout(res, delayMs)).then(() => fetchComRetry(url, tentativas - 1, delayMs));
    });
}

function fmtR$(n, comSinal = true) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const s = "R$ " + Math.abs(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  if (!comSinal) return s;
  return (n >= 0 ? "+" : "−") + s;
}
function media(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
function r2(v) { return Math.round(v * 100) / 100; }
function rotuloData(iso) {
  if (!iso) return "";
  return `${MES_CURTO[parseInt(iso.slice(5, 7), 10) - 1]} ${iso.slice(0, 4)}`;
}

export default function Replays({ th }) {
  const dark   = th.dark;
  const accent = th.accent;

  const [dados, setDados]           = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga]   = useState(null);

  const [setupsSel, setSetupsSel] = useState(null);
  const [dataIni, setDataIni]     = useState("");
  const [dataFim, setDataFim]     = useState("");
  const [filtroMep, setFiltroMep] = useState("todos");

  const [painelSetups, setPainelSetups] = useState(false);
  const [painelDatas, setPainelDatas]   = useState(false);

  const [mesVis, setMesVis] = useState(null);
  const [anoVis, setAnoVis] = useState(null);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CHAVE_CACHE);
      if (c) { setDados(JSON.parse(c)); setCarregando(false); }
    } catch (e) {}

    const t = setTimeout(() => {
      fetchComRetry(`${API_DIARIO}?action=getReplaysData`)
        .then(j => {
          if (j.erro) { setErroCarga(j.erro); setCarregando(false); return; }
          try { localStorage.setItem(CHAVE_CACHE, JSON.stringify(j)); } catch (e) {}
          setDados(j); setCarregando(false);
        })
        .catch(e => { setErroCarga(e.message); setCarregando(false); });
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!dados || setupsSel !== null) return;
    let salvo = null;
    try {
      const c = localStorage.getItem(CHAVE_FILTROS);
      if (c) salvo = JSON.parse(c);
    } catch (e) {}
    const todos = dados.listaSetups || [];
    if (salvo && Array.isArray(salvo.setups)) {
      const conhecidos = salvo.conhecidos || salvo.setups;
      const novos = todos.filter(s => conhecidos.indexOf(s) < 0);
      setSetupsSel([...salvo.setups.filter(s => todos.indexOf(s) >= 0), ...novos]);
      setDataIni(salvo.dataIni || "");
      setDataFim(salvo.dataFim || "");
    } else {
      setSetupsSel(todos);
    }
  }, [dados]);

  useEffect(() => {
    if (setupsSel === null || !dados) return;
    try {
      localStorage.setItem(CHAVE_FILTROS, JSON.stringify({
        setups: setupsSel, dataIni, dataFim, conhecidos: dados.listaSetups || [],
      }));
    } catch (e) {}
  }, [setupsSel, dataIni, dataFim]);

  const listaSetups = dados?.listaSetups || [];
  const sel = setupsSel || [];

  function toggleSetup(s) {
    setSetupsSel(prev => prev.indexOf(s) >= 0 ? prev.filter(x => x !== s) : [...prev, s]);
  }
  function toggleGrupo(g) {
    const doGrupo = listaSetups.filter(s => grupoDoSetup(s) === g);
    const todosOn = doGrupo.length > 0 && doGrupo.every(s => sel.indexOf(s) >= 0);
    setSetupsSel(prev => todosOn
      ? prev.filter(s => doGrupo.indexOf(s) < 0)
      : [...prev, ...doGrupo.filter(s => prev.indexOf(s) < 0)]);
  }
  function soGrupo(g) {
    setSetupsSel(listaSetups.filter(s => grupoDoSetup(s) === g));
  }
  function marcarTodos()    { setSetupsSel(listaSetups); }
  function desmarcarTodos() { setSetupsSel([]); }
  function limparDatas()    { setDataIni(""); setDataFim(""); }
  function limparTudo() {
    setSetupsSel(listaSetups);
    setDataIni(""); setDataFim(""); setFiltroMep("todos");
    try { localStorage.removeItem(CHAVE_FILTROS); } catch (e) {}
  }

  const filtroSetupsAtivo = listaSetups.length > 0 && sel.length !== listaSetups.length;
  const filtroDatasAtivo  = !!dataIni || !!dataFim;
  const filtroAtivo = filtroSetupsAtivo || filtroDatasAtivo;

  const trades = (dados?.trades || []).filter(t => {
    if (sel.indexOf(t.setup) < 0) return false;
    if (dataIni && t.data < dataIni) return false;
    if (dataFim && t.data > dataFim) return false;
    return true;
  });

  useEffect(() => {
    if (mesVis !== null || !dados?.trades?.length) return;
    const ultima = dados.trades.map(t => t.data).sort().pop();
    if (!ultima) return;
    setAnoVis(parseInt(ultima.slice(0, 4), 10));
    setMesVis(parseInt(ultima.slice(5, 7), 10) - 1);
  }, [dados]);

  function calcular(lista) {
    const gains  = lista.filter(t => t.resultado === "gain");
    const losses = lista.filter(t => t.resultado === "loss");
    const bes    = lista.filter(t => t.resultado === "breakeven");
    const dec    = gains.length + losses.length;

    const mg = gains.length  ? gains.reduce((a, t) => a + t.financ, 0) / gains.length   : 0;
    const ml = losses.length ? losses.reduce((a, t) => a + t.financ, 0) / losses.length : 0;

    const comRisco = lista.filter(t => t.risco > 0);
    const tecSim  = lista.filter(t => t.tecnica === "sim").length;
    const tecSimD = lista.filter(t => t.tecnica === "simd").length;
    const tecNao  = lista.filter(t => t.tecnica === "nao").length;
    const tecTot  = tecSim + tecSimD + tecNao;

    return {
      trades: lista.length,
      gains: gains.length,
      losses: losses.length,
      breakevens: bes.length,
      taxaAcerto: dec > 0 ? Math.round((gains.length / dec) * 100) : null,
      financTotal: r2(lista.reduce((a, t) => a + t.financ, 0)),
      mediaGain: gains.length  ? r2(mg) : null,
      mediaLoss: losses.length ? r2(ml) : null,
      rxr: (gains.length && losses.length) ? r2(mg / Math.abs(ml)) : null,
      stopMedio: comRisco.length ? r2(comRisco.reduce((a, t) => a + t.risco, 0) / comRisco.length) : null,
      tecSim, tecSimD, tecNao,
      tecPct: tecTot > 0 ? Math.round((tecSim / tecTot) * 100) : null,
      desist: lista.filter(t => t.desistiu).length,
    };
  }

  const geral = calcular(trades);

  const porSetup = {};
  trades.forEach(t => {
    if (!porSetup[t.setup]) porSetup[t.setup] = [];
    porSetup[t.setup].push(t);
  });

  const blocosDesempenho = GRUPOS.map(g => {
    const nomes = Object.keys(porSetup).filter(s => grupoDoSetup(s) === g.id);
    if (!nomes.length) return null;
    const linhas = nomes.map(nome => ({ nome, ...calcular(porSetup[nome]) }))
      .sort((a, b) => {
        if (ehFQ(a.nome) !== ehFQ(b.nome)) return ehFQ(a.nome) ? 1 : -1;
        return b.financTotal - a.financTotal;
      });
    const todosDoGrupo = [].concat(...nomes.map(n => porSetup[n]));
    return { grupo: g, linhas, total: calcular(todosDoGrupo) };
  }).filter(Boolean);

  const maxAbsSetup = Math.max(1, ...blocosDesempenho
    .reduce((acc, b) => acc.concat(b.linhas.map(l => Math.abs(l.financTotal))), []));

  const baseMep = trades.filter(t => t.resultado === "gain" || t.resultado === "loss");
  const mepFiltrado = filtroMep === "todos" ? baseMep
    : baseMep.filter(t => t.resultado === (filtroMep === "vencedores" ? "gain" : "loss"));

  const mepPorSetup = {};
  mepFiltrado.forEach(t => {
    if (!mepPorSetup[t.setup]) mepPorSetup[t.setup] = { mep: [], men: [] };
    mepPorSetup[t.setup].mep.push(t.mep);
    mepPorSetup[t.setup].men.push(t.men);
  });

  const blocosMep = GRUPOS.map(g => {
    const nomes = Object.keys(mepPorSetup).filter(s => grupoDoSetup(s) === g.id)
      .sort((a, b) => {
        if (ehFQ(a) !== ehFQ(b)) return ehFQ(a) ? 1 : -1;
        return a.localeCompare(b);
      });
    if (!nomes.length) return null;
    const linhas = nomes.map(nome => ({
      nome,
      mep: media(mepPorSetup[nome].mep),
      men: media(mepPorSetup[nome].men),
      n: mepPorSetup[nome].mep.length,
    }));
    const doGrupo = mepFiltrado.filter(t => grupoDoSetup(t.setup) === g.id);
    return {
      grupo: g, linhas,
      total: { n: doGrupo.length, mep: media(doGrupo.map(t => t.mep)), men: media(doGrupo.map(t => t.men)) },
    };
  }).filter(Boolean);

  const mepGeral = media(mepFiltrado.map(t => t.mep));
  const menGeral = media(mepFiltrado.map(t => t.men));

  function topErros(tipo) {
    const acc = {};
    trades.filter(t => t.erro && t.tipoErro === tipo).forEach(t => {
      if (!acc[t.erro]) acc[t.erro] = { count: 0, custo: 0 };
      acc[t.erro].count++;
      acc[t.erro].custo += t.financ;
    });
    return Object.entries(acc)
      .sort((a, b) => a[1].custo - b[1].custo)
      .slice(0, 5)
      .map(([nome, v]) => ({ nome, count: v.count, custo: r2(v.custo) }));
  }
  const top5Tec = topErros("tecnico");
  const top5Emo = topErros("emocional");

  const lista10 = trades.filter(t => t.nota10);
  const agr10 = {};
  lista10.forEach(t => {
    if (!agr10[t.setup]) agr10[t.setup] = [];
    agr10[t.setup].push(t);
  });
  const linhas10 = Object.keys(agr10).map(nome => {
    const l = agr10[nome];
    return {
      nome, n: l.length,
      mediaFinanc: r2(l.reduce((a, t) => a + t.financ, 0) / l.length),
      mep: media(l.map(t => t.mep)),
      men: media(l.map(t => t.men)),
    };
  }).sort((a, b) => {
    if (ehFQ(a.nome) !== ehFQ(b.nome)) return ehFQ(a.nome) ? 1 : -1;
    return b.n - a.n;
  });
  const total10 = lista10.length ? {
    n: lista10.length,
    mediaFinanc: r2(lista10.reduce((a, t) => a + t.financ, 0) / lista10.length),
    mep: media(lista10.map(t => t.mep)),
    men: media(lista10.map(t => t.men)),
  } : null;

  const porDataAcum = {};
  trades.forEach(t => { porDataAcum[t.data] = (porDataAcum[t.data] || 0) + t.financ; });
  const datasOrd = Object.keys(porDataAcum).sort();
  const serie = datasOrd.reduce((acc, d) => {
    const ant = acc.length ? acc[acc.length - 1].valor : 0;
    acc.push({ data: d, valor: r2(ant + porDataAcum[d]) });
    return acc;
  }, []);
  const periodoTxt = datasOrd.length
    ? (rotuloData(datasOrd[0]) === rotuloData(datasOrd[datasOrd.length - 1])
        ? rotuloData(datasOrd[0])
        : `${rotuloData(datasOrd[0])} – ${rotuloData(datasOrd[datasOrd.length - 1])}`)
    : "sem dados";

  const mesAtivo = mesVis === null ? new Date().getMonth() : mesVis;
  const anoAtivo = anoVis === null ? new Date().getFullYear() : anoVis;
  const prefixo = `${anoAtivo}-${String(mesAtivo + 1).padStart(2, "0")}`;
  const porDiaMes = {};
  trades.filter(t => t.data.startsWith(prefixo)).forEach(t => {
    const dia = parseInt(t.data.slice(8, 10), 10);
    if (!porDiaMes[dia]) porDiaMes[dia] = { financ: 0, n: 0 };
    porDiaMes[dia].financ += t.financ;
    porDiaMes[dia].n++;
  });
  const totalMesCal = Object.values(porDiaMes).reduce((a, d) => a + d.financ, 0);
  const nMesCal = Object.values(porDiaMes).reduce((a, d) => a + d.n, 0);

  function navegarMes(delta) {
    let m = mesAtivo + delta, a = anoAtivo;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMesVis(m); setAnoVis(a);
  }

  const semanas = [];
  {
    const ultimo = new Date(anoAtivo, mesAtivo + 1, 0).getDate();
    let sem = [];
    for (let d = 1; d <= ultimo; d++) {
      const ds = new Date(anoAtivo, mesAtivo, d).getDay();
      const col = ds === 0 ? 6 : ds - 1;
      if (sem.length === 0) for (let i = 0; i < col; i++) sem.push(null);
      sem.push(d);
      if (col === 6) { semanas.push(sem); sem = []; }
    }
    if (sem.length) { while (sem.length < 7) sem.push(null); semanas.push(sem); }
  }

  // ── tokens visuais ────────────────────────────────────────────────────────
  const verde   = dark ? "#7fb89a" : "#2f7d52";
  const verm    = dark ? "#c68888" : "#a83f31";
  const verdeBg = dark ? "rgba(127,184,154,0.13)" : "#eaf7f0";
  const vermBg  = dark ? "rgba(198,136,136,0.13)" : "#fbeceb";
  const linha   = th.border;
  const sutil   = dark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.022)";

  const secao = { fontSize: 16, fontWeight: 700, color: th.text, letterSpacing: "-0.01em" };
  const legenda = { fontSize: 12, color: th.textMuted };
  const grupoLabel = {
    fontSize: 10.5, fontWeight: 700, color: accent, letterSpacing: "0.08em",
    textTransform: "uppercase",
  };
  const thS = {
    fontSize: 10.5, fontWeight: 600, color: th.textMuted, letterSpacing: "0.04em",
    textAlign: "right", padding: "0 10px 8px", whiteSpace: "nowrap",
  };
  const tdS = {
    fontSize: 13, color: th.text, textAlign: "right", padding: "9px 10px",
    whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
  };
  const tdTot = { ...tdS, fontWeight: 700, color: th.textSub };
  const controle = {
    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
    background: th.cardBg, border: `1px solid ${th.border2}`, borderRadius: 9,
    padding: "8px 13px", fontSize: 13, color: th.text, fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
  const inputData = {
    fontSize: 13, color: th.text, background: th.resumeBg,
    border: `1px solid ${th.border2}`, borderRadius: 8, padding: "7px 10px",
    outline: "none", fontFamily: "inherit", colorScheme: dark ? "dark" : "light",
  };
  const btnTexto = {
    background: "none", border: "none", color: th.textMuted, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit", padding: "6px 4px",
  };

  function Barra({ valor, max, cor }) {
    const w = Math.max(2, Math.round((Math.abs(valor) / max) * 46));
    return (
      <span style={{ display: "inline-block", width: 46, textAlign: "left", verticalAlign: "middle" }}>
        <span style={{ display: "inline-block", width: w, height: 4, borderRadius: 3, background: cor, opacity: 0.75 }} />
      </span>
    );
  }

  if (carregando && !dados) {
    return <div style={{ padding: "60px 0", textAlign: "center", color: th.textMuted, fontSize: 13 }}>Carregando replays…</div>;
  }
  if (erroCarga && !dados) {
    return <div style={{ padding: "40px 0", color: verm, fontSize: 13 }}>Erro ao carregar: {erroCarga}</div>;
  }

  return (
    <div style={{ width: "100%", minWidth: 0, paddingBottom: 48 }}>

      {/* ═══ HERO ═══ */}
        <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 20, flexWrap: "wrap", paddingBottom: 18, borderBottom: `1px solid ${linha}`, marginBottom: 16,
        width: "75%", minWidth: 520,
      }}>
        <div>
          <div style={{ fontSize: 12.5, color: th.textMuted, marginBottom: 3 }}>Replays · resultado acumulado</div>
          <div style={{
            fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em",
            color: geral.trades === 0 ? th.textMuted : (geral.financTotal >= 0 ? verde : verm),
            fontVariantNumeric: "tabular-nums",
          }}>
            {geral.trades === 0 ? "—" : fmtR$(geral.financTotal)}
          </div>
          <div style={{ ...legenda, marginTop: 5 }}>
            {geral.trades} trades · {periodoTxt}{filtroAtivo ? " · filtrado" : ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, paddingBottom: 3, flexWrap: "wrap" }}>
          {[
            ["Acerto", geral.taxaAcerto === null ? "—" : `${geral.taxaAcerto}%`],
            ["RxR", geral.rxr === null ? "—" : geral.rxr.toFixed(2).replace(".", ",")],
            ["Técnica ok", geral.tecPct === null ? "—" : `${geral.tecPct}%`],
            ["Stop médio", geral.stopMedio === null ? "—" : fmtR$(geral.stopMedio, false)],
            ["Trades 10/10", lista10.length || "—"],
          ].map(([lb, val]) => (
            <div key={lb}>
              <div style={{ fontSize: 11.5, color: th.textMuted, marginBottom: 2 }}>{lb}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: th.text, fontVariantNumeric: "tabular-nums" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FILTROS ═══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 22, position: "relative" }}>

        <div style={{ position: "relative" }}>
          <div onClick={() => { setPainelSetups(v => !v); setPainelDatas(false); }}
            style={{ ...controle, borderColor: filtroSetupsAtivo ? accent : th.border2, color: filtroSetupsAtivo ? accent : th.text }}>
            <span>{sel.length === listaSetups.length ? "Todos os setups" : `${sel.length} de ${listaSetups.length} setups`}</span>
            <span style={{ fontSize: 10, color: th.textMuted }}>▾</span>
          </div>

          {painelSetups && (
            <>
              <div onClick={() => setPainelSetups(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }} />
              <div style={{
                position: "absolute", top: 44, left: 0, zIndex: 40, width: 320,
                background: th.cardBg, border: `1px solid ${th.border2}`, borderRadius: 12,
                boxShadow: "0 12px 36px rgba(0,0,0,0.28)", padding: "12px 14px",
                maxHeight: 420, overflowY: "auto",
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={marcarTodos} style={{ ...btnTexto, color: accent, fontWeight: 700 }}>Marcar todos</button>
                  <button onClick={desmarcarTodos} style={btnTexto}>Desmarcar todos</button>
                </div>
                {GRUPOS.map(g => {
                  const doGrupo = listaSetups.filter(s => grupoDoSetup(s) === g.id);
                  if (!doGrupo.length) return null;
                  const todosOn = doGrupo.every(s => sel.indexOf(s) >= 0);
                  return (
                    <div key={g.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                        <span onClick={() => toggleGrupo(g.id)} style={{ ...grupoLabel, cursor: "pointer" }}>
                          {todosOn ? "▪ " : "▫ "}{g.curto}
                        </span>
                        <span onClick={() => soGrupo(g.id)} style={{ fontSize: 10.5, color: th.textMuted, cursor: "pointer" }}>só este</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {doGrupo.map(s => {
                          const on = sel.indexOf(s) >= 0;
                          return (
                            <div key={s} onClick={() => toggleSetup(s)}
                              style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                              <div style={{
                                width: 14, height: 14, borderRadius: 4, flexShrink: 0, marginTop: 1,
                                border: `2px solid ${on ? accent : th.border2}`,
                                background: on ? accent : "transparent",
                              }} />
                              <span style={{ fontSize: 12.5, color: on ? th.text : th.textMuted, lineHeight: 1.3 }}>{s}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <div onClick={() => { setPainelDatas(v => !v); setPainelSetups(false); }}
            style={{ ...controle, borderColor: filtroDatasAtivo ? accent : th.border2, color: filtroDatasAtivo ? accent : th.text }}>
            <span>{filtroDatasAtivo ? `${dataIni || "início"} → ${dataFim || "hoje"}` : "Todo o período"}</span>
            <span style={{ fontSize: 10, color: th.textMuted }}>▾</span>
          </div>

          {painelDatas && (
            <>
              <div onClick={() => setPainelDatas(false)} style={{ position: "fixed", inset: 0, zIndex: 39 }} />
              <div style={{
                position: "absolute", top: 44, left: 0, zIndex: 40,
                background: th.cardBg, border: `1px solid ${th.border2}`, borderRadius: 12,
                boxShadow: "0 12px 36px rgba(0,0,0,0.28)", padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 12, color: th.textSub, width: 26 }}>De</span>
                  <input type="date" value={dataIni} onChange={e => setDataIni(e.target.value)} style={inputData} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 12, color: th.textSub, width: 26 }}>Até</span>
                  <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={inputData} />
                </div>
                <button onClick={limparDatas} style={{ ...btnTexto, textAlign: "left" }}>Limpar período</button>
              </div>
            </>
          )}
        </div>

        {filtroSetupsAtivo && GRUPOS.map(g => {
          const doGrupo = listaSetups.filter(s => grupoDoSetup(s) === g.id);
          const ativos = doGrupo.filter(s => sel.indexOf(s) >= 0).length;
          if (!ativos || ativos === 0) return null;
          return (
            <span key={g.id} onClick={() => toggleGrupo(g.id)}
              style={{
                fontSize: 11.5, fontWeight: 600, color: accent, background: th.navActiveBg,
                border: `1px solid ${accent}44`, borderRadius: 20, padding: "5px 12px",
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
              {g.curto} {ativos}/{doGrupo.length} ×
            </span>
          );
        })}

        <div style={{ flex: 1 }} />
        {filtroAtivo && <button onClick={limparTudo} style={{ ...btnTexto, color: accent, fontWeight: 700 }}>Limpar todos os filtros</button>}
      </div>

      {/* ═══ GRÁFICO ═══ */}
      <div style={{ marginBottom: 30, width: "75%", minWidth: 520 }}>
        {serie.length < 2 ? (
          <div style={{ padding: "70px 0", textAlign: "center", color: th.textMuted, fontSize: 12.5, background: sutil, borderRadius: 12 }}>
            Dados insuficientes no recorte atual
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={linha} vertical={false} />
              <XAxis dataKey="data" tick={{ fontSize: 10.5, fill: th.textMuted }} tickFormatter={d => d.slice(8, 10) + "/" + d.slice(5, 7)}
                minTickGap={30} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10.5, fill: th.textMuted }} width={46} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: th.surface, border: `1px solid ${th.border2}`, borderRadius: 9, fontSize: 12.5, color: th.text }}
                itemStyle={{ color: th.text }} labelStyle={{ color: th.textMuted, marginBottom: 4 }}
                formatter={v => [fmtR$(v), "Acumulado"]} labelFormatter={l => l.split("-").reverse().join("/")} />
              <ReferenceLine y={0} stroke={th.textMuted} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="valor" stroke={accent} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>


      {/* ═══ CALENDÁRIO ═══ */}
      <div style={{ marginBottom: 32, width: "75%", minWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={secao}>{MESES_PT[mesAtivo]} {anoAtivo}</span>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => navegarMes(-1)} style={{ ...btnTexto, border: `1px solid ${th.border2}`, borderRadius: 7, padding: "2px 10px", color: th.textSub }}>‹</button>
            <button onClick={() => navegarMes(1)} style={{ ...btnTexto, border: `1px solid ${th.border2}`, borderRadius: 7, padding: "2px 10px", color: th.textSub }}>›</button>
          </div>
          <span style={legenda}>
            {nMesCal ? `${nMesCal} trades · ${fmtR$(totalMesCal)}` : "sem replays neste mês"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 5 }}>
          {DIAS_SEM.map(d => (
            <div key={d} style={{ fontSize: 10.5, color: th.textMuted, paddingLeft: 3 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {semanas.map((sem, si) => (
            <div key={si} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
              {sem.map((dia, di) => {
                if (dia === null) return <div key={`v${di}`} />;
                const d = porDiaMes[dia];
                const pos = d && d.financ >= 0;
                return (
                  <div key={dia}
                    style={{
                      background: d ? (pos ? verdeBg : vermBg) : sutil,
                      border: d ? `1px solid ${(pos ? verde : verm)}33` : "1px solid transparent",
                      borderRadius: 9, minHeight: 58, padding: "7px 9px",
                      boxSizing: "border-box", display: "flex", flexDirection: "column",
                    }}>
                    <span style={{ fontSize: 11, color: th.textMuted, fontVariantNumeric: "tabular-nums" }}>{dia}</span>
                    {d && (
                      <div style={{ marginTop: "auto" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: pos ? verde : verm, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
                          {pos ? "+" : "−"}{Math.abs(d.financ).toFixed(0)}
                        </div>
                        <div style={{ fontSize: 10, color: th.textMuted }}>{d.n} op</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ DESEMPENHO POR SETUP ═══ */}
      <div style={{ marginBottom: 32 }}>
        <div style={secao}>Desempenho por setup</div>
        <div style={{ ...legenda, marginTop: 3, marginBottom: 14 }}>
          RxR e médias ficam em "—" quando falta gain ou loss no recorte · ★ técnica "Sim*" · ✕ técnica "Não"
        </div>

        {blocosDesempenho.length === 0 ? (
          <div style={{ padding: "34px 0", textAlign: "center", color: th.textMuted, fontSize: 12.5, background: sutil, borderRadius: 12 }}>
            Nenhum trade no recorte atual
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", maxWidth: 1124, borderCollapse: "collapse", minWidth: 840, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 292 }} />
                <col style={{ width: 46 }} /><col style={{ width: 46 }} /><col style={{ width: 46 }} /><col style={{ width: 46 }} />
                <col style={{ width: 66 }} />
                <col style={{ width: 96 }} />
                <col style={{ width: 62 }} />
                <col style={{ width: 68 }} /><col style={{ width: 68 }} />
                <col style={{ width: 58 }} />
                <col style={{ width: 84 }} />
                <col style={{ width: 62 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...thS, textAlign: "left", paddingLeft: 0 }}>Setup</th>
                  <th style={thS}>n</th>
                  <th style={thS}>G</th>
                  <th style={thS}>L</th>
                  <th style={thS}>BE</th>
                  <th style={thS}>Acerto</th>
                  <th style={thS}>Resultado</th>
                  <th style={{ ...thS, textAlign: "left", paddingLeft: 4 }}></th>
                  <th style={thS}>Méd. G</th>
                  <th style={thS}>Méd. L</th>
                  <th style={thS}>RxR</th>
                  <th style={thS}>Téc.</th>
                  <th style={{ ...thS, paddingRight: 0 }}>Desist.</th>
                </tr>
              </thead>
              <tbody>
                {blocosDesempenho.map(b => (
                  <Fragment key={b.grupo.id}>
                    <tr>
                      <td colSpan={13} style={{ ...grupoLabel, padding: "20px 0 8px" }}>{b.grupo.id}</td>
                    </tr>
                    {b.linhas.map(s => (
                      <tr key={s.nome} style={{ borderTop: `1px solid ${linha}`, opacity: ehFQ(s.nome) ? 0.42 : 1 }}>
                        <td style={{ ...tdS, textAlign: "left", paddingLeft: 0, fontWeight: 600, whiteSpace: "normal", lineHeight: 1.3, paddingRight: 18 }}>
                          {s.nome}
                          {ehFQ(s.nome) && <span style={{ fontSize: 10, color: th.textMuted, fontWeight: 400 }}> · encerrado</span>}
                        </td>
                        <td style={{ ...tdS, color: th.textMuted }}>{s.trades}</td>
                        <td style={{ ...tdS, color: verde }}>{s.gains || "·"}</td>
                        <td style={{ ...tdS, color: verm }}>{s.losses || "·"}</td>
                        <td style={{ ...tdS, color: th.textMuted }}>{s.breakevens || "·"}</td>
                        <td style={tdS}>{s.taxaAcerto === null ? "—" : `${s.taxaAcerto}%`}</td>
                        <td style={{ ...tdS, fontWeight: 700, color: s.financTotal >= 0 ? verde : verm }}>{fmtR$(s.financTotal)}</td>
                        <td style={{ ...tdS, textAlign: "left", padding: "9px 4px" }}>
                          <Barra valor={s.financTotal} max={maxAbsSetup} cor={s.financTotal >= 0 ? verde : verm} />
                        </td>
                        <td style={{ ...tdS, color: th.textSub }}>{s.mediaGain === null ? "—" : s.mediaGain.toFixed(0)}</td>
                        <td style={{ ...tdS, color: th.textSub }}>{s.mediaLoss === null ? "—" : s.mediaLoss.toFixed(0)}</td>
                        <td style={tdS}>{s.rxr === null ? "—" : s.rxr.toFixed(2).replace(".", ",")}</td>
                        <td style={tdS}>
                          {s.tecPct === null ? "—" : `${s.tecPct}%`}
                          {(s.tecSimD > 0 || s.tecNao > 0) && (
                            <span style={{ fontSize: 10, color: th.textMuted }}> {s.tecSimD > 0 ? `${s.tecSimD}★` : ""} {s.tecNao > 0 ? `${s.tecNao}✕` : ""}</span>
                          )}
                        </td>
                        <td style={{ ...tdS, paddingRight: 0, color: th.textMuted }}>{s.desist || "·"}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: `1px solid ${th.border2}`, background: sutil }}>
                      <td style={{ ...tdTot, textAlign: "left", paddingLeft: 0 }}>Total {b.grupo.curto}</td>
                      <td style={tdTot}>{b.total.trades}</td>
                      <td style={{ ...tdTot, color: verde }}>{b.total.gains || "·"}</td>
                      <td style={{ ...tdTot, color: verm }}>{b.total.losses || "·"}</td>
                      <td style={tdTot}>{b.total.breakevens || "·"}</td>
                      <td style={tdTot}>{b.total.taxaAcerto === null ? "—" : `${b.total.taxaAcerto}%`}</td>
                      <td style={{ ...tdTot, color: b.total.financTotal >= 0 ? verde : verm }}>{fmtR$(b.total.financTotal)}</td>
                      <td />
                      <td style={tdTot}>{b.total.mediaGain === null ? "—" : b.total.mediaGain.toFixed(0)}</td>
                      <td style={tdTot}>{b.total.mediaLoss === null ? "—" : b.total.mediaLoss.toFixed(0)}</td>
                      <td style={tdTot}>{b.total.rxr === null ? "—" : b.total.rxr.toFixed(2).replace(".", ",")}</td>
                      <td style={tdTot}>{b.total.tecPct === null ? "—" : `${b.total.tecPct}%`}</td>
                      <td style={{ ...tdTot, paddingRight: 0 }}>{b.total.desist || "·"}</td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ MEP / MEN ═══ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <div style={secao}>MEP / MEN <span style={{ fontWeight: 400, color: th.textMuted, fontSize: 13 }}>em pontos</span></div>
            <div style={{ ...legenda, marginTop: 3 }}>
              Breakevens sempre fora · MEP alto nos perdedores indica alvo mal calibrado, não leitura errada
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, background: sutil, border: `1px solid ${th.border2}`, borderRadius: 9, padding: 3 }}>
            {[["todos", "Todos"], ["vencedores", "Vencedores"], ["perdedores", "Perdedores"]].map(([v, lb]) => (
              <button key={v} onClick={() => setFiltroMep(v)} style={{
                background: filtroMep === v ? accent : "transparent",
                color: filtroMep === v ? "#fff" : th.textMuted,
                border: "none", borderRadius: 7, padding: "6px 13px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>{lb}</button>
            ))}
          </div>
        </div>

        {blocosMep.length === 0 ? (
          <div style={{ padding: "34px 0", textAlign: "center", color: th.textMuted, fontSize: 12.5, background: sutil, borderRadius: 12 }}>
            Sem trades decididos no recorte atual
          </div>
) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${blocosMep.length}, minmax(0,1fr))`, gap: 30 }}>
              {blocosMep.map(b => (
                <div key={b.grupo.id}>
                  <div style={{ ...grupoLabel, marginBottom: 8 }}>{b.grupo.curto}</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <colgroup>
                      <col /><col style={{ width: 34 }} /><col style={{ width: 52 }} /><col style={{ width: 52 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ ...thS, textAlign: "left", paddingLeft: 0 }}>Setup</th>
                        <th style={{ ...thS, padding: "0 5px 8px" }}>n</th>
                        <th style={{ ...thS, padding: "0 5px 8px" }}>MEP</th>
                        <th style={{ ...thS, padding: "0 0 8px 5px" }}>MEN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.linhas.map(l => (
                        <tr key={l.nome} style={{ borderTop: `1px solid ${linha}`, opacity: ehFQ(l.nome) ? 0.42 : 1 }}>
                          <td style={{ ...tdS, textAlign: "left", paddingLeft: 0, whiteSpace: "normal", lineHeight: 1.3, paddingRight: 10, fontSize: 12.5 }}>{l.nome}</td>
                          <td style={{ ...tdS, color: th.textMuted, padding: "9px 5px" }}>{l.n}</td>
                          <td style={{ ...tdS, fontWeight: 600, padding: "9px 5px" }}>{l.mep}</td>
                          <td style={{ ...tdS, fontWeight: 600, padding: "9px 0 9px 5px" }}>{l.men}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: `1px solid ${th.border2}`, background: sutil }}>
                        <td style={{ ...tdTot, textAlign: "left", paddingLeft: 0, fontSize: 12.5 }}>Total</td>
                        <td style={{ ...tdTot, padding: "9px 5px" }}>{b.total.n}</td>
                        <td style={{ ...tdTot, padding: "9px 5px" }}>{b.total.mep === null ? "—" : b.total.mep}</td>
                        <td style={{ ...tdTot, padding: "9px 0 9px 5px" }}>{b.total.men === null ? "—" : b.total.men}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div style={{
              display: "flex", gap: 30, alignItems: "baseline", marginTop: 18,
              paddingTop: 13, borderTop: `2px solid ${accent}55`, maxWidth: 460,
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: accent, flex: 1 }}>Total geral</span>
              {[["n", mepFiltrado.length], ["MEP", mepGeral === null ? "—" : mepGeral], ["MEN", menGeral === null ? "—" : menGeral]].map(([lb, v]) => (
                <span key={lb} style={{ fontSize: 13, color: th.textMuted }}>
                  {lb} <span style={{ fontWeight: 800, color: accent, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                </span>
              ))}
            </div>
          </>
        )}

      
        )}
      </div>

      {/* ═══ ERROS + 10/10 ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.15fr)", gap: 30, alignItems: "start", marginBottom: 32 }}>
        {[["Erros técnicos", top5Tec], ["Erros emocionais", top5Emo]].map(([titulo, lista]) => (
          <div key={titulo}>
            <div style={secao}>{titulo}</div>
            <div style={{ ...legenda, marginTop: 3, marginBottom: 12 }}>os 5 mais caros no recorte</div>
            {lista.length === 0 ? (
              <div style={{ fontSize: 12.5, color: th.textMuted, padding: "16px 0" }}>Nenhum registrado.</div>
            ) : lista.map(e => (
              <div key={e.nome} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                gap: 12, padding: "10px 0", borderTop: `1px solid ${linha}`,
              }}>
                <span style={{ fontSize: 13, color: th.text, flex: 1, minWidth: 0, lineHeight: 1.35 }}>{e.nome}</span>
                <span style={{ fontSize: 11, color: th.textMuted, flexShrink: 0 }}>{e.count}×</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: verm, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{fmtR$(e.custo)}</span>
              </div>
            ))}
          </div>
      ))}

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
          <span style={secao}>Trades 10/10</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{lista10.length}</span>
        </div>
        <div style={{ ...legenda, marginBottom: 12 }}>execução que você marcou como impecável, agrupada por setup</div>

        {linhas10.length === 0 ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: th.textMuted, fontSize: 12.5, background: sutil, borderRadius: 12 }}>
            Nenhum trade 10/10 no recorte atual
          </div>
        ) : (
          <table style={{ width: "100%", maxWidth: 720, borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 268 }} /><col style={{ width: 52 }} />
              <col style={{ width: 108 }} /><col style={{ width: 100 }} /><col style={{ width: 100 }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...thS, textAlign: "left", paddingLeft: 0 }}>Setup</th>
                <th style={thS}>n</th>
                <th style={thS}>R$ médio</th>
                <th style={thS}>MEP médio</th>
                <th style={{ ...thS, paddingRight: 0 }}>MEN médio</th>
              </tr>
            </thead>
            <tbody>
              {linhas10.map(l => (
                <tr key={l.nome} style={{ borderTop: `1px solid ${linha}`, opacity: ehFQ(l.nome) ? 0.42 : 1 }}>
                  <td style={{ ...tdS, textAlign: "left", paddingLeft: 0, fontWeight: 600, whiteSpace: "normal", lineHeight: 1.3, paddingRight: 18 }}>{l.nome}</td>
                  <td style={{ ...tdS, color: th.textMuted }}>{l.n}</td>
                  <td style={{ ...tdS, fontWeight: 700, color: l.mediaFinanc >= 0 ? verde : verm }}>{fmtR$(l.mediaFinanc)}</td>
                  <td style={tdS}>{l.mep}</td>
                  <td style={{ ...tdS, paddingRight: 0 }}>{l.men}</td>
                </tr>
              ))}
              {total10 && (
                <tr style={{ borderTop: `2px solid ${accent}55` }}>
                  <td style={{ ...tdS, textAlign: "left", paddingLeft: 0, paddingTop: 13, fontWeight: 800, color: accent }}>Total</td>
                  <td style={{ ...tdS, paddingTop: 13, fontWeight: 800, color: accent }}>{total10.n}</td>
                  <td style={{ ...tdS, paddingTop: 13, fontWeight: 800, color: accent }}>{fmtR$(total10.mediaFinanc)}</td>
                  <td style={{ ...tdS, paddingTop: 13, fontWeight: 800, color: accent }}>{total10.mep}</td>
                  <td style={{ ...tdS, paddingTop: 13, paddingRight: 0, fontWeight: 800, color: accent }}>{total10.men}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      </div>

    </div>
  );
}
