import { useState, useEffect, Fragment } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];

const CHAVE_FILTROS = "filtros_replays";
const CHAVE_CACHE   = "cache_replays";

// ── agrupamento por operacional ────────────────────────────────────────────
const GRUPOS = ["Operacional TSS", "Operacional OTS", "Operacional Al Brooks Técnico"];

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

function fmtR$(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return (n >= 0 ? "+" : "−") + "R$ " + Math.abs(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}
function media(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
function r2(v) { return Math.round(v * 100) / 100; }

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

  // null até saber qual é o último mês com dados
  const [mesVis, setMesVis] = useState(null);
  const [anoVis, setAnoVis] = useState(null);

  // ---- carga ----
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

  // ---- filtros persistidos ----
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
    const todosOn = doGrupo.every(s => sel.indexOf(s) >= 0);
    setSetupsSel(prev => todosOn
      ? prev.filter(s => doGrupo.indexOf(s) < 0)
      : [...prev, ...doGrupo.filter(s => prev.indexOf(s) < 0)]);
  }
  function marcarTodos()    { setSetupsSel(listaSetups); }
  function desmarcarTodos() { setSetupsSel([]); }
  function limparDatas()    { setDataIni(""); setDataFim(""); }
  function limparTudo() {
    setSetupsSel(listaSetups);
    setDataIni(""); setDataFim(""); setFiltroMep("todos");
    try { localStorage.removeItem(CHAVE_FILTROS); } catch (e) {}
  }

  const filtroAtivo =
    (listaSetups.length > 0 && sel.length !== listaSetups.length) || !!dataIni || !!dataFim;

  // ---- recorte ----
  const trades = (dados?.trades || []).filter(t => {
    if (sel.indexOf(t.setup) < 0) return false;
    if (dataIni && t.data < dataIni) return false;
    if (dataFim && t.data > dataFim) return false;
    return true;
  });

  // calendário abre no último mês COM dados, não no mês corrente
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

  // ---- por setup, agrupado por operacional ----
  const porSetup = {};
  trades.forEach(t => {
    if (!porSetup[t.setup]) porSetup[t.setup] = [];
    porSetup[t.setup].push(t);
  });

  const blocosDesempenho = GRUPOS.map(g => {
    const nomes = Object.keys(porSetup).filter(s => grupoDoSetup(s) === g);
    if (!nomes.length) return null;
    const linhas = nomes.map(nome => ({ nome, ...calcular(porSetup[nome]) }))
      .sort((a, b) => b.financTotal - a.financTotal);
    const todosDoGrupo = [].concat(...nomes.map(n => porSetup[n]));
    return { grupo: g, linhas, total: calcular(todosDoGrupo) };
  }).filter(Boolean);

  // ---- MEP / MEN ----
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
    const nomes = Object.keys(mepPorSetup).filter(s => grupoDoSetup(s) === g).sort();
    if (!nomes.length) return null;
    const linhas = nomes.map(nome => ({
      nome,
      mep: media(mepPorSetup[nome].mep),
      men: media(mepPorSetup[nome].men),
      n: mepPorSetup[nome].mep.length,
    }));
    const doGrupo = mepFiltrado.filter(t => grupoDoSetup(t.setup) === g);
    return {
      grupo: g, linhas,
      total: { n: doGrupo.length, mep: media(doGrupo.map(t => t.mep)), men: media(doGrupo.map(t => t.men)) },
    };
  }).filter(Boolean);

  const mepGeral = media(mepFiltrado.map(t => t.mep));
  const menGeral = media(mepFiltrado.map(t => t.men));

  // ---- erros ----
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

  // ---- trades 10/10 agrupados por setup ----
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
  }).sort((a, b) => b.n - a.n);
  const total10 = lista10.length ? {
    n: lista10.length,
    mediaFinanc: r2(lista10.reduce((a, t) => a + t.financ, 0) / lista10.length),
    mep: media(lista10.map(t => t.mep)),
    men: media(lista10.map(t => t.men)),
  } : null;

  // ---- série do gráfico ----
  const porDataAcum = {};
  trades.forEach(t => { porDataAcum[t.data] = (porDataAcum[t.data] || 0) + t.financ; });
  const serie = Object.keys(porDataAcum).sort().reduce((acc, d) => {
    const ant = acc.length ? acc[acc.length - 1].valor : 0;
    acc.push({ data: d, valor: r2(ant + porDataAcum[d]) });
    return acc;
  }, []);

  // ---- calendário ----
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

  // ---- estilos ----
  const verde   = dark ? "#7fb89a" : "#2f7d52";
  const verm    = dark ? "#c68888" : "#a83f31";
  const verdeBg = dark ? "#16291f" : "#eaf7f0";
  const vermBg  = dark ? "#231a1c" : "#fbeceb";

  const card = {
    background: th.cardBg, borderRadius: 12, border: `1px solid ${th.border}`,
    boxShadow: th.cardShadow, padding: "14px 16px",
  };
  const btnMini = {
    background: "none", border: `1px solid ${th.border2}`, color: th.textMuted,
    borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  };
  const tituloCard = {
    fontSize: 11, fontWeight: 700, color: th.textSub,
    textTransform: "uppercase", letterSpacing: "0.06em",
  };
  const thS = {
    fontSize: 10, fontWeight: 700, color: th.textMuted, textTransform: "uppercase",
    letterSpacing: "0.05em", textAlign: "right", padding: "6px 8px", whiteSpace: "nowrap",
  };
  const tdS = { fontSize: 12, color: th.text, textAlign: "right", padding: "7px 8px", whiteSpace: "nowrap" };
  const tdTot = { ...tdS, fontWeight: 800 };
  const inputData = {
    fontSize: 12.5, color: th.text, background: th.resumeBg,
    border: `1px solid ${th.border2}`, borderRadius: 8, padding: "7px 11px",
    outline: "none", fontFamily: "inherit", colorScheme: dark ? "dark" : "light",
  };

  if (carregando && !dados) {
    return <div style={{ width: "100%", padding: "40px 0", textAlign: "center", color: th.textMuted, fontSize: 13 }}>Carregando replays…</div>;
  }
  if (erroCarga && !dados) {
    return <div style={{ width: "100%", padding: 30 }}><div style={{ ...card, color: verm, fontSize: 13 }}>Erro ao carregar: {erroCarga}</div></div>;
  }

  return (
    <div style={{ width: "100%", minWidth: 0, paddingBottom: 40 }}>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: th.text, margin: 0, letterSpacing: "-0.02em" }}>Replays</h1>
        <p style={{ fontSize: 13, color: th.textMuted, margin: "4px 0 0" }}>
          {geral.trades} trades no recorte atual{filtroAtivo ? " · filtros ativos" : ""}
        </p>
      </div>

      {/* ---- RESUMO ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          ["Resultado", fmtR$(geral.financTotal), geral.financTotal >= 0 ? verde : verm],
          ["Trades", geral.trades, th.text],
          ["Acerto", geral.taxaAcerto === null ? "—" : `${geral.taxaAcerto}%`, th.text],
          ["RxR", geral.rxr === null ? "—" : geral.rxr, th.text],
          ["Técnica OK", geral.tecPct === null ? "—" : `${geral.tecPct}%`, th.text],
          ["Stop médio", geral.stopMedio === null ? "—" : `R$ ${geral.stopMedio.toFixed(0)}`, th.text],
        ].map(([lb, val, cor]) => (
          <div key={lb} style={{ ...card, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>{lb}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: cor, lineHeight: 1.15 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* ---- FILTRO DE PERÍODO (faixa horizontal) ---- */}
      <div style={{ ...card, marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ ...tituloCard, marginRight: 4 }}>Período</span>
        <input type="date" value={dataIni} onChange={e => setDataIni(e.target.value)} style={inputData} />
        <span style={{ color: th.textMuted, fontSize: 12.5 }}>até</span>
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={inputData} />
        {(dataIni || dataFim) && <button onClick={limparDatas} style={btnMini}>Limpar período</button>}
        <div style={{ flex: 1 }} />
        {filtroAtivo && (
          <button onClick={limparTudo} style={{ ...btnMini, borderColor: accent, color: accent, padding: "6px 14px", fontSize: 12 }}>
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* ---- SETUPS | GRÁFICO | CALENDÁRIO ---- */}
      <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginBottom: 14 }}>

        <div style={{ ...card, width: 250, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={tituloCard}>Setups</span>
            <span style={{ fontSize: 10.5, color: th.textMuted, fontWeight: 600 }}>{sel.length}/{listaSetups.length}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={marcarTodos} style={{ ...btnMini, flex: 1 }}>Limpar</button>
            <button onClick={desmarcarTodos} style={{ ...btnMini, flex: 1 }}>Desmarcar</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 330, display: "flex", flexDirection: "column", gap: 10 }}>
            {GRUPOS.map(g => {
              const doGrupo = listaSetups.filter(s => grupoDoSetup(s) === g);
              if (!doGrupo.length) return null;
              return (
                <div key={g}>
                  <div onClick={() => toggleGrupo(g)}
                    style={{ fontSize: 9.5, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, cursor: "pointer" }}>
                    {g.replace("Operacional ", "")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {doGrupo.map(s => {
                      const on = sel.indexOf(s) >= 0;
                      return (
                        <div key={s} onClick={() => toggleSetup(s)}
                          style={{ display: "flex", alignItems: "flex-start", gap: 7, cursor: "pointer" }}>
                          <div style={{
                            width: 13, height: 13, borderRadius: 4, flexShrink: 0, marginTop: 1,
                            border: `2px solid ${on ? accent : th.border2}`,
                            background: on ? accent : "transparent",
                          }} />
                          <span style={{ fontSize: 11.5, color: on ? th.text : th.textMuted, lineHeight: 1.3 }}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={tituloCard}>Resultado acumulado</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: geral.financTotal >= 0 ? verde : verm }}>{fmtR$(geral.financTotal)}</span>
          </div>
          {serie.length < 2 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: th.textMuted, fontSize: 12 }}>Dados insuficientes no recorte</div>
          ) : (
            <ResponsiveContainer width="100%" height={185}>
              <LineChart data={serie} margin={{ top: 5, right: 16, left: 6, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={th.border} />
                <XAxis dataKey="data" tick={{ fontSize: 10.5, fill: th.textMuted }} tickFormatter={d => d.slice(5)} minTickGap={22} />
                <YAxis tick={{ fontSize: 10.5, fill: th.textMuted }} tickFormatter={v => `${v}`} width={44} />
                <Tooltip
                  contentStyle={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 8, fontSize: 12, color: th.text }}
                  itemStyle={{ color: th.text }} labelStyle={{ color: th.text }}
                  formatter={v => [fmtR$(v), "Acumulado"]} labelFormatter={l => `Data: ${l}`} />
                <ReferenceLine y={0} stroke={th.textMuted} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="valor" stroke={accent} strokeWidth={2} dot={false} name="Acumulado" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ ...card, width: 420, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: th.text }}>{MESES_PT[mesAtivo]} {anoAtivo}</span>
            <button onClick={() => navegarMes(-1)} style={{ ...btnMini, padding: "2px 9px" }}>‹</button>
            <button onClick={() => navegarMes(1)} style={{ ...btnMini, padding: "2px 9px" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
            {DIAS_SEM.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: th.textMuted }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {semanas.map((sem, si) => (
              <div key={si} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {sem.map((dia, di) => {
                  if (dia === null) return <div key={`v${di}`} />;
                  const d = porDiaMes[dia];
                  let bg = "transparent", bd = `1px dashed ${th.border2}`, cor = dark ? "rgba(255,255,255,0.25)" : "#c2c2c8";
                  if (d) {
                    bg = d.financ >= 0 ? verdeBg : vermBg;
                    bd = `1px solid ${d.financ >= 0 ? verde + "66" : verm + "66"}`;
                    cor = th.textMuted;
                  }
                  return (
                    <div key={dia} title={d ? `${d.n} trade(s)` : undefined}
                      style={{
                        background: bg, border: bd, borderRadius: 8, minHeight: 54,
                        padding: "4px 5px", boxSizing: "border-box", display: "flex",
                        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                      }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: cor }}>{dia}</span>
                      {d && (
                        <>
                          <span style={{ fontSize: 11, fontWeight: 800, color: d.financ >= 0 ? verde : verm }}>
                            {d.financ >= 0 ? "+" : "−"}{Math.abs(d.financ).toFixed(0)}
                          </span>
                          <span style={{ fontSize: 8.5, color: th.textMuted }}>{d.n} op</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- DESEMPENHO POR SETUP ---- */}
      <div style={{ ...card, marginBottom: 14, overflowX: "auto" }}>
        <div style={{ ...tituloCard, marginBottom: 10 }}>Desempenho por setup</div>
        {blocosDesempenho.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: th.textMuted, fontSize: 12 }}>Nenhum trade no recorte.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.border}` }}>
                <th style={{ ...thS, textAlign: "left" }}>Setup</th>
                {["n", "Gain", "Loss", "BE", "Acerto", "Resultado", "Méd. gain", "Méd. loss", "RxR", "Téc. OK", "Desist."].map(h => (
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blocosDesempenho.map(b => (
                <Fragment key={b.grupo}>
                  <tr>
                    <td colSpan={12} style={{
                      fontSize: 9.5, fontWeight: 800, color: accent, textTransform: "uppercase",
                      letterSpacing: "0.07em", padding: "14px 8px 5px",
                    }}>{b.grupo}</td>
                  </tr>
                  {b.linhas.map(s => (
                    <tr key={s.nome} style={{ borderBottom: `1px solid ${th.border}` }}>
                      <td style={{ ...tdS, textAlign: "left", fontWeight: 600 }}>{s.nome}</td>
                      <td style={{ ...tdS, color: th.textMuted }}>{s.trades}</td>
                      <td style={{ ...tdS, color: verde }}>{s.gains}</td>
                      <td style={{ ...tdS, color: verm }}>{s.losses}</td>
                      <td style={{ ...tdS, color: th.textMuted }}>{s.breakevens}</td>
                      <td style={tdS}>{s.taxaAcerto === null ? "—" : `${s.taxaAcerto}%`}</td>
                      <td style={{ ...tdS, fontWeight: 700, color: s.financTotal >= 0 ? verde : verm }}>{fmtR$(s.financTotal)}</td>
                      <td style={tdS}>{s.mediaGain === null ? "—" : s.mediaGain.toFixed(0)}</td>
                      <td style={tdS}>{s.mediaLoss === null ? "—" : s.mediaLoss.toFixed(0)}</td>
                      <td style={tdS}>{s.rxr === null ? "—" : s.rxr}</td>
                      <td style={tdS}>
                        {s.tecPct === null ? "—" : `${s.tecPct}%`}
                        {(s.tecSimD > 0 || s.tecNao > 0) && (
                          <span style={{ fontSize: 9.5, color: th.textMuted }}> ({s.tecSimD}★ {s.tecNao}✕)</span>
                        )}
                      </td>
                      <td style={tdS}>{s.desist || "—"}</td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: `2px solid ${th.border2}`, background: dark ? "rgba(255,255,255,0.03)" : th.resumeBg }}>
                    <td style={{ ...tdTot, textAlign: "left" }}>Total do grupo</td>
                    <td style={tdTot}>{b.total.trades}</td>
                    <td style={{ ...tdTot, color: verde }}>{b.total.gains}</td>
                    <td style={{ ...tdTot, color: verm }}>{b.total.losses}</td>
                    <td style={tdTot}>{b.total.breakevens}</td>
                    <td style={tdTot}>{b.total.taxaAcerto === null ? "—" : `${b.total.taxaAcerto}%`}</td>
                    <td style={{ ...tdTot, color: b.total.financTotal >= 0 ? verde : verm }}>{fmtR$(b.total.financTotal)}</td>
                    <td style={tdTot}>{b.total.mediaGain === null ? "—" : b.total.mediaGain.toFixed(0)}</td>
                    <td style={tdTot}>{b.total.mediaLoss === null ? "—" : b.total.mediaLoss.toFixed(0)}</td>
                    <td style={tdTot}>{b.total.rxr === null ? "—" : b.total.rxr}</td>
                    <td style={tdTot}>{b.total.tecPct === null ? "—" : `${b.total.tecPct}%`}</td>
                    <td style={tdTot}>{b.total.desist || "—"}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ fontSize: 10, color: th.textMuted, marginTop: 8 }}>
          RxR e médias aparecem como "—" quando falta gain ou loss no recorte. ★ = "Sim*" · ✕ = "Não".
        </div>
      </div>

      {/* ---- MEP / MEN ---- */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
          <span style={tituloCard}>MEP / MEN <span style={{ fontWeight: 600, color: th.textMuted }}>(pontos)</span></span>
          <div style={{ display: "flex", gap: 4, background: th.resumeBg, border: `1px solid ${th.border2}`, borderRadius: 8, padding: 3 }}>
            {[["todos", "Todos"], ["vencedores", "Vencedores"], ["perdedores", "Perdedores"]].map(([v, lb]) => (
              <button key={v} onClick={() => setFiltroMep(v)} style={{
                background: filtroMep === v ? accent : "transparent",
                color: filtroMep === v ? "#fff" : th.textMuted,
                border: "none", borderRadius: 6, padding: "5px 12px",
                fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>{lb}</button>
            ))}
          </div>
        </div>

        {blocosMep.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center", color: th.textMuted, fontSize: 12 }}>Sem trades decididos no recorte.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.border}` }}>
                <th style={{ ...thS, textAlign: "left" }}>Setup</th>
                <th style={thS}>n</th>
                <th style={thS}>MEP médio</th>
                <th style={thS}>MEN médio</th>
              </tr>
            </thead>
            <tbody>
              {blocosMep.map(b => (
                <Fragment key={b.grupo}>
                  <tr>
                    <td colSpan={4} style={{
                      fontSize: 9.5, fontWeight: 800, color: accent, textTransform: "uppercase",
                      letterSpacing: "0.07em", padding: "14px 8px 5px",
                    }}>{b.grupo}</td>
                  </tr>
                  {b.linhas.map(l => (
                    <tr key={l.nome} style={{ borderBottom: `1px solid ${th.border}` }}>
                      <td style={{ ...tdS, textAlign: "left" }}>{l.nome}</td>
                      <td style={{ ...tdS, color: th.textMuted }}>{l.n}</td>
                      <td style={{ ...tdS, fontWeight: 700 }}>{l.mep}</td>
                      <td style={{ ...tdS, fontWeight: 700 }}>{l.men}</td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: `2px solid ${th.border2}`, background: dark ? "rgba(255,255,255,0.03)" : th.resumeBg }}>
                    <td style={{ ...tdTot, textAlign: "left" }}>Total do grupo</td>
                    <td style={tdTot}>{b.total.n}</td>
                    <td style={tdTot}>{b.total.mep === null ? "—" : b.total.mep}</td>
                    <td style={tdTot}>{b.total.men === null ? "—" : b.total.men}</td>
                  </tr>
                </Fragment>
              ))}
              <tr style={{ borderTop: `2px solid ${accent}55` }}>
                <td style={{ ...tdTot, textAlign: "left", color: accent, paddingTop: 12 }}>Total geral</td>
                <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{mepFiltrado.length}</td>
                <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{mepGeral === null ? "—" : mepGeral}</td>
                <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{menGeral === null ? "—" : menGeral}</td>
              </tr>
            </tbody>
          </table>
        )}
        <div style={{ fontSize: 10, color: th.textMuted, marginTop: 8 }}>
          Breakevens ficam sempre fora desta tabela. MEP alto nos perdedores indica saída/alvo mal calibrado, não leitura errada.
        </div>
      </div>

      {/* ---- ERROS ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {[["Top 5 erros técnicos", top5Tec], ["Top 5 erros emocionais", top5Emo]].map(([titulo, lista]) => (
          <div key={titulo} style={card}>
            <div style={{ ...tituloCard, marginBottom: 10 }}>{titulo}</div>
            {lista.length === 0 ? (
              <div style={{ fontSize: 12, color: th.textMuted, padding: "12px 0" }}>Nenhum erro registrado no recorte.</div>
            ) : lista.map(e => (
              <div key={e.nome} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${th.border}` }}>
                <span style={{ fontSize: 12, color: th.text, flex: 1, minWidth: 0 }}>{e.nome}</span>
                <span style={{ fontSize: 10.5, color: th.textMuted, flexShrink: 0 }}>{e.count}×</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: verm, flexShrink: 0, minWidth: 62, textAlign: "right" }}>{fmtR$(e.custo)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ---- TRADES 10/10 ---- */}
      <div style={{ ...card, borderLeft: `3px solid ${accent}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={tituloCard}>Trades 10/10</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>{lista10.length}</span>
        </div>
        {linhas10.length === 0 ? (
          <div style={{ fontSize: 12, color: th.textMuted, padding: "12px 0" }}>Nenhum trade marcado como 10/10 no recorte.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.border}` }}>
                <th style={{ ...thS, textAlign: "left" }}>Setup</th>
                <th style={thS}>n</th>
                <th style={thS}>R$ médio</th>
                <th style={thS}>MEP médio</th>
                <th style={thS}>MEN médio</th>
              </tr>
            </thead>
            <tbody>
              {linhas10.map(l => (
                <tr key={l.nome} style={{ borderBottom: `1px solid ${th.border}` }}>
                  <td style={{ ...tdS, textAlign: "left", fontWeight: 600 }}>{l.nome}</td>
                  <td style={{ ...tdS, color: th.textMuted }}>{l.n}</td>
                  <td style={{ ...tdS, fontWeight: 700, color: l.mediaFinanc >= 0 ? verde : verm }}>{fmtR$(l.mediaFinanc)}</td>
                  <td style={tdS}>{l.mep}</td>
                  <td style={tdS}>{l.men}</td>
                </tr>
              ))}
              {total10 && (
                <tr style={{ borderTop: `2px solid ${accent}55` }}>
                  <td style={{ ...tdTot, textAlign: "left", color: accent, paddingTop: 12 }}>Total</td>
                  <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{total10.n}</td>
                  <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{fmtR$(total10.mediaFinanc)}</td>
                  <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{total10.mep}</td>
                  <td style={{ ...tdTot, color: accent, paddingTop: 12 }}>{total10.men}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
