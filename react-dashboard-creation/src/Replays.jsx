import { useState, useEffect } from "react";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];

const CHAVE_FILTROS = "filtros_replays";
const CHAVE_CACHE   = "cache_replays";

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
  const hoje   = new Date();

  const [dados, setDados]         = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);

  const [setupsSel, setSetupsSel] = useState(null); // null = ainda não inicializado
  const [dataIni, setDataIni]     = useState("");
  const [dataFim, setDataFim]     = useState("");
  const [filtroMep, setFiltroMep] = useState("todos");

  const [mesVis, setMesVis] = useState(hoje.getMonth());
  const [anoVis, setAnoVis] = useState(hoje.getFullYear());

  // ---- carga ----
  function aplicar(j) {
    setDados(j);
    setCarregando(false);
  }

  useEffect(() => {
    try {
      const c = localStorage.getItem(CHAVE_CACHE);
      if (c) aplicar(JSON.parse(c));
    } catch (e) {}

    const t = setTimeout(() => {
      fetchComRetry(`${API_DIARIO}?action=getReplaysData`)
        .then(j => {
          if (j.erro) { setErroCarga(j.erro); setCarregando(false); return; }
          try { localStorage.setItem(CHAVE_CACHE, JSON.stringify(j)); } catch (e) {}
          aplicar(j);
        })
        .catch(e => { setErroCarga(e.message); setCarregando(false); });
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // ---- filtros persistidos ----
  useEffect(() => {
    if (!dados) return;
    if (setupsSel !== null) return;
    let salvo = null;
    try {
      const c = localStorage.getItem(CHAVE_FILTROS);
      if (c) salvo = JSON.parse(c);
    } catch (e) {}
    const todos = dados.listaSetups || [];
    if (salvo && Array.isArray(salvo.setups)) {
      // setups novos que ainda não existiam quando o filtro foi salvo entram marcados
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
  function marcarTodos()   { setSetupsSel(listaSetups); }
  function desmarcarTodos(){ setSetupsSel([]); }
  function limparDatas()   { setDataIni(""); setDataFim(""); }
  function limparTudo() {
    setSetupsSel(listaSetups);
    setDataIni(""); setDataFim("");
    setFiltroMep("todos");
    try { localStorage.removeItem(CHAVE_FILTROS); } catch (e) {}
  }

  const filtroAtivo =
    (listaSetups.length > 0 && sel.length !== listaSetups.length) || !!dataIni || !!dataFim;

  // ---- recálculo no cliente ----
  const trades = (dados?.trades || []).filter(t => {
    if (sel.indexOf(t.setup) < 0) return false;
    if (dataIni && t.data < dataIni) return false;
    if (dataFim && t.data > dataFim) return false;
    return true;
  });

  function calcular(lista) {
    const gains  = lista.filter(t => t.resultado === "gain");
    const losses = lista.filter(t => t.resultado === "loss");
    const bes    = lista.filter(t => t.resultado === "breakeven");
    const dec    = gains.length + losses.length;

    const somaG = gains.reduce((a, t) => a + t.financ, 0);
    const somaL = losses.reduce((a, t) => a + t.financ, 0);
    const mg = gains.length  ? somaG / gains.length  : 0;
    const ml = losses.length ? somaL / losses.length : 0;

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
      nota10: lista.filter(t => t.nota10).length,
    };
  }

  const geral = calcular(trades);

  const porSetup = {};
  trades.forEach(t => {
    if (!porSetup[t.setup]) porSetup[t.setup] = [];
    porSetup[t.setup].push(t);
  });
  const statsSetups = Object.keys(porSetup)
    .map(nome => ({ nome, ...calcular(porSetup[nome]) }))
    .sort((a, b) => b.financTotal - a.financTotal);

  // MEP/MEN — só gains e losses
  const baseMep = trades.filter(t => t.resultado === "gain" || t.resultado === "loss");
  const mepFiltrado = filtroMep === "todos" ? baseMep
    : baseMep.filter(t => t.resultado === (filtroMep === "vencedores" ? "gain" : "loss"));

  const mepPorSetup = {};
  mepFiltrado.forEach(t => {
    if (!mepPorSetup[t.setup]) mepPorSetup[t.setup] = { mep: [], men: [] };
    mepPorSetup[t.setup].mep.push(t.mep);
    mepPorSetup[t.setup].men.push(t.men);
  });
  const linhasMep = Object.keys(mepPorSetup).sort().map(nome => ({
    nome,
    mep: media(mepPorSetup[nome].mep),
    men: media(mepPorSetup[nome].men),
    n: mepPorSetup[nome].mep.length,
  }));
  const mepGeral = media(mepFiltrado.map(t => t.mep));
  const menGeral = media(mepFiltrado.map(t => t.men));

  // erros
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

  const trades10 = trades.filter(t => t.nota10).sort((a, b) => b.data.localeCompare(a.data));

  // gráfico acumulado
  const porDataAcum = {};
  trades.forEach(t => { porDataAcum[t.data] = (porDataAcum[t.data] || 0) + t.financ; });
  const datasOrd = Object.keys(porDataAcum).sort();
  let acum = 0;
  const serie = datasOrd.map(d => { acum += porDataAcum[d]; return { data: d, valor: r2(acum) }; });

  // calendário
  const prefixo = `${anoVis}-${String(mesVis + 1).padStart(2, "0")}`;
  const porDiaMes = {};
  trades.filter(t => t.data.startsWith(prefixo)).forEach(t => {
    const dia = parseInt(t.data.slice(8, 10), 10);
    if (!porDiaMes[dia]) porDiaMes[dia] = { financ: 0, n: 0, gains: 0, losses: 0 };
    porDiaMes[dia].financ += t.financ;
    porDiaMes[dia].n++;
    if (t.resultado === "gain") porDiaMes[dia].gains++;
    if (t.resultado === "loss") porDiaMes[dia].losses++;
  });

  function navegarMes(delta) {
    let m = mesVis + delta, a = anoVis;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMesVis(m); setAnoVis(a);
  }

  const semanas = [];
  {
    const ultimo = new Date(anoVis, mesVis + 1, 0).getDate();
    let sem = [];
    for (let d = 1; d <= ultimo; d++) {
      const ds = new Date(anoVis, mesVis, d).getDay();
      const col = ds === 0 ? 6 : ds - 1;
      if (sem.length === 0) for (let i = 0; i < col; i++) sem.push(null);
      sem.push(d);
      if (col === 6) { semanas.push(sem); sem = []; }
    }
    if (sem.length) { while (sem.length < 7) sem.push(null); semanas.push(sem); }
  }

  // ---- estilos ----
  const verde = dark ? "#7fb89a" : "#2f7d52";
  const verm  = dark ? "#c68888" : "#a83f31";
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
  const th_ = {
    fontSize: 10, fontWeight: 700, color: th.textMuted, textTransform: "uppercase",
    letterSpacing: "0.05em", textAlign: "right", padding: "6px 8px", whiteSpace: "nowrap",
  };
  const td_ = { fontSize: 12, color: th.text, textAlign: "right", padding: "7px 8px", whiteSpace: "nowrap" };

  if (carregando && !dados) {
    return (
      <div style={{ width: "100%", padding: "40px 0", textAlign: "center", color: th.textMuted, fontSize: 13 }}>
        Carregando replays…
      </div>
    );
  }
  if (erroCarga && !dados) {
    return (
      <div style={{ width: "100%", padding: 30 }}>
        <div style={{ ...card, color: verm, fontSize: 13 }}>Erro ao carregar: {erroCarga}</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minWidth: 0, paddingBottom: 40 }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: th.text, margin: 0, letterSpacing: "-0.02em" }}>Replays</h1>
          <p style={{ fontSize: 13, color: th.textMuted, margin: "4px 0 0" }}>
            {geral.trades} trades no recorte atual{filtroAtivo ? " · filtros ativos" : ""}
          </p>
        </div>
        {filtroAtivo && (
          <button onClick={limparTudo} style={{ ...btnMini, borderColor: accent, color: accent, padding: "7px 14px", fontSize: 12 }}>
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* ---- FILTROS ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, marginBottom: 16 }}>

        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
            <span style={tituloCard}>Setups <span style={{ color: th.textMuted, fontWeight: 600 }}>({sel.length}/{listaSetups.length})</span></span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={marcarTodos} style={btnMini}>Limpar</button>
              <button onClick={desmarcarTodos} style={btnMini}>Desmarcar todos</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))", gap: "6px 12px" }}>
            {listaSetups.map(s => {
              const on = sel.indexOf(s) >= 0;
              return (
                <div key={s} onClick={() => toggleSetup(s)}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "2px 0" }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${on ? accent : th.border2}`,
                    background: on ? accent : "transparent",
                  }} />
                  <span style={{ fontSize: 12, color: on ? th.text : th.textMuted, lineHeight: 1.3 }}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={tituloCard}>Período</span>
            <button onClick={limparDatas} style={btnMini}>Limpar</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[["De", dataIni, setDataIni], ["Até", dataFim, setDataFim]].map(([lb, val, setter]) => (
              <div key={lb} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: th.textSub, width: 28 }}>{lb}</span>
                <input type="date" value={val} onChange={e => setter(e.target.value)}
                  style={{
                    flex: 1, fontSize: 12.5, color: th.text, background: th.resumeBg,
                    border: `1px solid ${th.border2}`, borderRadius: 7, padding: "6px 9px",
                    outline: "none", fontFamily: "inherit", colorScheme: dark ? "dark" : "light",
                  }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- RESUMO ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 16 }}>
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

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>

        {/* ---- GRÁFICO ---- */}
        <div style={{ ...card, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={tituloCard}>Resultado acumulado</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: geral.financTotal >= 0 ? verde : verm }}>{fmtR$(geral.financTotal)}</span>
          </div>
          {serie.length < 2 ? (
            <div style={{ padding: "50px 0", textAlign: "center", color: th.textMuted, fontSize: 12 }}>Dados insuficientes no recorte</div>
          ) : (
            <svg viewBox="0 0 620 210" style={{ width: "100%", height: "auto", display: "block" }}>
              {(() => {
                const vals = serie.map(p => p.valor);
                const maxV = Math.max(...vals, 0), minV = Math.min(...vals, 0);
                const range = (maxV - minV) || 1;
                const padL = 52, padR = 14, padT = 16, padB = 26, W = 620, H = 210;
                const pw = W - padL - padR, ph = H - padT - padB;
                const pts = serie.map((p, i) => ({
                  ...p,
                  x: padL + (i / (serie.length - 1)) * pw,
                  y: padT + ph - ((p.valor - minV) / range) * ph,
                }));
                const zeroY = padT + ph - ((0 - minV) / range) * ph;
                const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
                const passo = Math.ceil(serie.length / 12);
                return (
                  <>
                    <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} stroke={th.border2} strokeWidth="1" strokeDasharray="3,3" />
                    {[minV, (minV + maxV) / 2, maxV].map((v, i) => {
                      const y = padT + ph - ((v - minV) / range) * ph;
                      return <text key={i} x={padL - 8} y={y + 4} textAnchor="end" fontSize="10.5" fill={th.textMuted}>{Math.round(v)}</text>;
                    })}
                    <path d={`${path} L${pts[pts.length - 1].x},${zeroY} L${pts[0].x},${zeroY} Z`} fill={accent} opacity="0.08" />
                    <path d={path} fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      (i % passo === 0 || i === pts.length - 1) && (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="3" fill={accent} stroke={th.cardBg} strokeWidth="1.5" />
                          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="9.5" fill={th.textMuted}>{p.data.slice(8, 10)}/{p.data.slice(5, 7)}</text>
                        </g>
                      )
                    ))}
                  </>
                );
              })()}
            </svg>
          )}
        </div>

        {/* ---- CALENDÁRIO ---- */}
        <div style={{ ...card, width: 340, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: th.text }}>{MESES_PT[mesVis]} {anoVis}</span>
            <button onClick={() => navegarMes(-1)} style={{ ...btnMini, padding: "2px 8px" }}>‹</button>
            <button onClick={() => navegarMes(1)} style={{ ...btnMini, padding: "2px 8px" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
            {DIAS_SEM.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 8.5, fontWeight: 700, color: th.textMuted }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {semanas.map((sem, si) => (
              <div key={si} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                {sem.map((dia, di) => {
                  if (dia === null) return <div key={`v${di}`} />;
                  const d = porDiaMes[dia];
                  let bg = "transparent", bd = `1px dashed ${th.border2}`, cor = dark ? "rgba(255,255,255,0.25)" : "#c2c2c8";
                  if (d) {
                    bg = d.financ >= 0 ? verdeBg : vermBg;
                    bd = `1px solid ${d.financ >= 0 ? verde + "66" : verm + "66"}`;
                    cor = th.text;
                  }
                  return (
                    <div key={dia} title={d ? `${d.n} trade(s) · ${fmtR$(d.financ)}` : undefined}
                      style={{
                        background: bg, border: bd, borderRadius: 7, minHeight: 42,
                        padding: "3px 4px", boxSizing: "border-box", display: "flex",
                        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                      }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: cor }}>{dia}</span>
                      {d && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: d.financ >= 0 ? verde : verm }}>
                          {d.financ >= 0 ? "+" : "−"}{Math.abs(d.financ).toFixed(0)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- ESTATÍSTICAS POR SETUP ---- */}
      <div style={{ ...card, marginBottom: 16, overflowX: "auto" }}>
        <div style={{ ...tituloCard, marginBottom: 10 }}>Desempenho por setup</div>
        {statsSetups.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: th.textMuted, fontSize: 12 }}>Nenhum trade no recorte.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.border}` }}>
                <th style={{ ...th_, textAlign: "left" }}>Setup</th>
                {["n", "Gain", "Loss", "BE", "Acerto", "Resultado", "Méd. gain", "Méd. loss", "RxR", "Téc. OK", "Desist."].map(h => (
                  <th key={h} style={th_}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statsSetups.map(s => (
                <tr key={s.nome} style={{ borderBottom: `1px solid ${th.border}` }}>
                  <td style={{ ...td_, textAlign: "left", fontWeight: 600 }}>{s.nome}</td>
                  <td style={{ ...td_, color: th.textMuted }}>{s.trades}</td>
                  <td style={{ ...td_, color: verde }}>{s.gains}</td>
                  <td style={{ ...td_, color: verm }}>{s.losses}</td>
                  <td style={{ ...td_, color: th.textMuted }}>{s.breakevens}</td>
                  <td style={td_}>{s.taxaAcerto === null ? "—" : `${s.taxaAcerto}%`}</td>
                  <td style={{ ...td_, fontWeight: 700, color: s.financTotal >= 0 ? verde : verm }}>{fmtR$(s.financTotal)}</td>
                  <td style={td_}>{s.mediaGain === null ? "—" : s.mediaGain.toFixed(0)}</td>
                  <td style={td_}>{s.mediaLoss === null ? "—" : s.mediaLoss.toFixed(0)}</td>
                  <td style={td_}>{s.rxr === null ? "—" : s.rxr}</td>
                  <td style={td_}>
                    {s.tecPct === null ? "—" : `${s.tecPct}%`}
                    {(s.tecSimD > 0 || s.tecNao > 0) && (
                      <span style={{ fontSize: 9.5, color: th.textMuted }}> ({s.tecSimD}★ {s.tecNao}✕)</span>
                    )}
                  </td>
                  <td style={td_}>{s.desist || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ fontSize: 10, color: th.textMuted, marginTop: 8 }}>
          RxR e médias aparecem como "—" quando falta gain ou loss no recorte. ★ = "Sim*" · ✕ = "Não".
        </div>
      </div>

      {/* ---- MEP / MEN ---- */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
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

        <div style={{ display: "flex", gap: 22, marginBottom: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: th.text }}>{mepGeral === null ? "—" : mepGeral}</div>
            <div style={{ fontSize: 11, color: th.textMuted }}>MEP médio</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: th.text }}>{menGeral === null ? "—" : menGeral}</div>
            <div style={{ fontSize: 11, color: th.textMuted }}>MEN médio</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: th.textMuted }}>{mepFiltrado.length}</div>
            <div style={{ fontSize: 11, color: th.textMuted }}>trades na amostra</div>
          </div>
        </div>

        {linhasMep.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center", color: th.textMuted, fontSize: 12 }}>Sem trades decididos no recorte.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.border}` }}>
                <th style={{ ...th_, textAlign: "left" }}>Setup</th>
                <th style={th_}>n</th>
                <th style={th_}>MEP médio</th>
                <th style={th_}>MEN médio</th>
              </tr>
            </thead>
            <tbody>
              {linhasMep.map(l => (
                <tr key={l.nome} style={{ borderBottom: `1px solid ${th.border}` }}>
                  <td style={{ ...td_, textAlign: "left" }}>{l.nome}</td>
                  <td style={{ ...td_, color: th.textMuted }}>{l.n}</td>
                  <td style={{ ...td_, fontWeight: 700 }}>{l.mep}</td>
                  <td style={{ ...td_, fontWeight: 700 }}>{l.men}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ fontSize: 10, color: th.textMuted, marginTop: 8 }}>
          Breakevens ficam sempre fora desta tabela. MEP alto nos perdedores indica saída/alvo mal calibrado, não leitura errada.
        </div>
      </div>

      {/* ---- ERROS ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
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
          <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>{trades10.length}</span>
        </div>
        {trades10.length === 0 ? (
          <div style={{ fontSize: 12, color: th.textMuted, padding: "12px 0" }}>Nenhum trade marcado como 10/10 no recorte.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.border}` }}>
                <th style={{ ...th_, textAlign: "left" }}>Data</th>
                <th style={{ ...th_, textAlign: "left" }}>Setup</th>
                <th style={th_}>Resultado</th>
                <th style={th_}>R$</th>
                <th style={th_}>MEP</th>
                <th style={th_}>MEN</th>
                <th style={th_}>Técnica</th>
              </tr>
            </thead>
            <tbody>
              {trades10.map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${th.border}` }}>
                  <td style={{ ...td_, textAlign: "left", color: th.textMuted }}>{t.data.slice(8, 10)}/{t.data.slice(5, 7)}</td>
                  <td style={{ ...td_, textAlign: "left" }}>{t.setup}</td>
                  <td style={{ ...td_, color: t.resultado === "gain" ? verde : t.resultado === "loss" ? verm : th.textMuted }}>
                    {t.resultado === "gain" ? "Gain" : t.resultado === "loss" ? "Loss" : "BE"}
                  </td>
                  <td style={{ ...td_, fontWeight: 700, color: t.financ >= 0 ? verde : verm }}>{fmtR$(t.financ)}</td>
                  <td style={td_}>{t.mep}</td>
                  <td style={td_}>{t.men}</td>
                  <td style={{ ...td_, color: th.textMuted }}>
                    {t.tecnica === "sim" ? "Sim" : t.tecnica === "simd" ? "Sim*" : t.tecnica === "nao" ? "Não" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
