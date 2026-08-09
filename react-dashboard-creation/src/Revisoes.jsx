import React, { useState, useEffect } from "react";

const GAS_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT_FALLBACK = "#2563EB";

function fetchComRetryRev(url, tentativas = 3, delayMs = 1200) {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err => {
      if (tentativas <= 1) throw err;
      return new Promise(res => setTimeout(res, delayMs))
        .then(() => fetchComRetryRev(url, tentativas - 1, delayMs));
    });
}

// Seg a Sex + coluna de respiro + bloco Semana (sábado). Domingo não é exibido.
const CABECALHOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "", "Semana"];
const DIAS_NOME = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const CONTAS = ["ION 3", "ION OTS"];

function gerarId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtVal(n) {
  if (isNaN(n)) return "—";
  return (n >= 0 ? "+" : "−") + "R$ " + Math.abs(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function AutoTextarea({ value, placeholder, onChange, rows, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea ref={ref} value={value} placeholder={placeholder} onChange={onChange} rows={rows}
      style={{ ...style, resize: "none", overflow: "hidden", lineHeight: 1.55 }} />
  );
}

export default function Revisoes({ th, dark, setDark, revisoesProp, updatesProp, tradesPorDataProp, loadingProp, onCarregar }) {
  const bg         = th?.bg        || "#f4f5f7";
  const surface    = th?.surface   || "#ffffff";
  const cardBg     = th?.cardBg    || "#ffffff";
  const border     = th?.border    || "#ebebeb";
  const border2    = th?.border2   || "#e0e0e0";
  const text       = th?.text      || "#0f1117";
  const textSub    = th?.textSub   || "#4a5568";
  const textMuted  = th?.textMuted || "#8a96a3";
  const resumeBg   = th?.resumeBg  || "#f8f9fa";
  const cardShadow = th?.cardShadow|| "0 1px 4px rgba(0,0,0,0.06)";

  const isDark = th?.dark ?? (bg.startsWith("#0") || bg.startsWith("#1"));
  const ACCENT = th?.accent || ACCENT_FALLBACK;

  // camadas de elevação — clareiam sobre qualquer fundo escuro, servem aos 12 temas
  const camada1 = isDark ? "rgba(255,255,255,0.05)"  : "#ffffff";
  const camada2 = isDark ? "rgba(255,255,255,0.085)" : resumeBg;
  const bordaSuave = isDark ? "rgba(255,255,255,0.12)" : border2;

  // "Não cliquei" — cinza azulado sólido, distinto do dia futuro (tracejado/apagado)
  const naoCliquei = {
    bg:     isDark ? "#1c2430" : "#dde3ec",
    border: isDark ? "#38465c" : "#b6c1d2",
    text:   isDark ? "#8fa2bd" : "#5b6a80",
  };
  // Dia futuro — inerte
  const futuro = {
    bg:     "transparent",
    border: isDark ? "rgba(255,255,255,0.09)" : "#e6e6e9",
    text:   isDark ? "rgba(255,255,255,0.22)" : "#c2c2c8",
  };

  function corResultado(total, limite = 100) {
    const n = parseFloat(total);
    if (isNaN(n)) return null;
    if (n >= limite)  return {
      bg:     isDark ? "#1e3329" : "#f0faf5",
      border: isDark ? "#44916a" : "#6bbf96",
      text:   isDark ? "#6fdda6" : "#2e7d5a",
    };
    if (n <= -limite) return {
      bg:     isDark ? "#33211f" : "#faf0f0",
      border: isDark ? "#9a4444" : "#c47878",
      text:   isDark ? "#e07d7d" : "#a04040",
    };
    return {
      bg:     isDark ? "rgba(255,255,255,0.055)" : "#f0f2f5",
      border: isDark ? "rgba(255,255,255,0.18)"  : "#b4bcc6",
      text:   isDark ? "#c2ccd6" : "#4a6070",
    };
  }

  const [ano, setAno]             = useState(new Date().getFullYear());
  const [mes, setMes]             = useState(new Date().getMonth());
  const [contaSel, setContaSel]   = useState("ION 3");
  const [revisoes, setRevisoes]   = useState(revisoesProp || []);
  const [updates, setUpdates]     = useState(updatesProp  || []);
  const [tradesPorData, setTradesPorData] = useState(tradesPorDataProp || {});
  const [otsPorData, setOtsPorData]       = useState({});
  const [loading, setLoading]     = useState(loadingProp && !revisoesProp?.length);
  const [saving, setSaving]       = useState(false);

  const [painelDia, setPainelDia]   = useState(null);
  const [painelTipo, setPainelTipo] = useState("diario");
  const [formDados, setFormDados]   = useState({});
  const [formDirty, setFormDirty]   = useState(false);
  const [linksIon3, setLinksIon3]   = useState([]);
  const [linksOts, setLinksOts]     = useState([]);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm]         = useState({ titulo: "", descricao: "" });
  const [expandedUpdate, setExpandedUpdate] = useState(null);

  useEffect(() => { if (revisoesProp?.length)   setRevisoes(revisoesProp);   }, [revisoesProp]);
  useEffect(() => { if (updatesProp?.length)    setUpdates(updatesProp);     }, [updatesProp]);
  useEffect(() => { if (tradesPorDataProp && Object.keys(tradesPorDataProp).length) setTradesPorData(tradesPorDataProp); }, [tradesPorDataProp]);
  useEffect(() => { setLoading(loadingProp && !revisoesProp?.length); }, [loadingProp]);

  // OTS: cache imediato + busca em background, com atraso pra não competir com o Dashboard
  useEffect(() => {
    const cache = localStorage.getItem("cache_ots");
    if (cache) {
      try { setOtsPorData(JSON.parse(cache).porData || {}); } catch(e) {}
    }
    const timer = setTimeout(() => {
      fetchComRetryRev(`${GAS_DIARIO}?action=getOTSData`)
        .then(j => {
          if (!j.erro) {
            setOtsPorData(j.porData || {});
            try { localStorage.setItem("cache_ots", JSON.stringify(j)); } catch(e) {}
          }
        })
        .catch(() => {});
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const rRev = await fetchComRetryRev(`${GAS_DIARIO}?action=lerRevisoes`);
      setRevisoes(rRev.revisoes || []);
      const rUpd = await fetchComRetryRev(`${GAS_DIARIO}?action=lerUpdates`);
      setUpdates(rUpd.updates || []);
      const rTrades = await fetchComRetryRev(`${GAS_DIARIO}?action=lerTradesPorData`);
      setTradesPorData(rTrades.porData || {});
      if (onCarregar) onCarregar();
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const revisaoPorData = {};
  revisoes.forEach(r => { revisaoPorData[r.data] = r; });
  const semanasPorSab = {};
  revisoes.filter(r => r.tipo === "semanal").forEach(r => { semanasPorSab[r.data] = r; });

  function isoData(a, m, d) {
    return `${a}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  // ---- fonte de dados conforme a conta selecionada ----
  function dadosDoDia(dataStr, conta) {
    if (conta === "ION OTS") {
      const o = otsPorData[dataStr];
      if (!o) return null;
      return { resultado: o.resultado, trades: o.trades, taxaAcerto: o.taxaAcerto, erros: null };
    }
    const t = tradesPorData[dataStr] || {};
    return t["ION 3"] || t["ion 3"] || null;
  }

  function resumoSemana(sabadoStr, conta) {
    const sabado = new Date(sabadoStr + "T12:00:00");
    let totalRes = 0, totalOps = 0, somaAcerto = 0, diasAcerto = 0, totalErros = 0, diasComDados = 0;
    for (let offset = -5; offset <= -1; offset++) {
      const dt = new Date(sabado);
      dt.setDate(sabado.getDate() + offset);
      const dataStr = isoData(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const d = dadosDoDia(dataStr, conta);
      if (!d) continue;
      const r = parseFloat(d.resultado);
      if (!isNaN(r)) { totalRes += r; diasComDados++; }
      const ops = parseFloat(d.trades);
      if (!isNaN(ops)) totalOps += ops;
      const ac = parseFloat(d.taxaAcerto);
      if (!isNaN(ac)) { somaAcerto += ac; diasAcerto++; }
      const er = parseFloat(d.erros);
      if (!isNaN(er)) totalErros += er;
    }
    return { totalRes, totalOps, acertoMedio: diasAcerto > 0 ? Math.round(somaAcerto/diasAcerto) : null, totalErros, diasComDados };
  }

  function resumoMensal(conta) {
    const total = new Date(ano, mes + 1, 0).getDate();
    let totalRes = 0, totalOps = 0, somaAcerto = 0, diasAcerto = 0, totalErros = 0, diasComDados = 0;
    for (let d = 1; d <= total; d++) {
      const diaSem = new Date(ano, mes, d).getDay();
      if (diaSem === 0 || diaSem === 6) continue;
      const dd = dadosDoDia(isoData(ano, mes, d), conta);
      if (!dd) continue;
      const r = parseFloat(dd.resultado);
      if (!isNaN(r)) { totalRes += r; diasComDados++; }
      const ops = parseFloat(dd.trades);
      if (!isNaN(ops)) totalOps += ops;
      const ac = parseFloat(dd.taxaAcerto);
      if (!isNaN(ac)) { somaAcerto += ac; diasAcerto++; }
      const er = parseFloat(dd.erros);
      if (!isNaN(er)) totalErros += er;
    }
    return { totalRes, totalOps, acertoMedio: diasAcerto > 0 ? Math.round(somaAcerto/diasAcerto) : null, totalErros, diasComDados };
  }

  function abrirDia(dataStr) {
    const rev  = revisaoPorData[dataStr] || {};
    const ion3 = dadosDoDia(dataStr, "ION 3") || {};
    const ots  = dadosDoDia(dataStr, "ION OTS") || {};
    let saved = {};
    try { saved = JSON.parse(rev.resumoCurto || "{}"); } catch {}

    setPainelDia(dataStr);
    setPainelTipo("diario");
    setFormDados({
      // ION 3 — lê chave nova; se não existir, cai na antiga (dados salvos antes da reforma)
      resultadoIon3: saved.resultadoIon3 ?? (rev.resultadoIon2 !== undefined && rev.resultadoIon2 !== "" ? rev.resultadoIon2 : (ion3.resultado ?? "")),
      qtdOpsIon3:    saved.qtdOpsIon3    ?? saved.qtdOpsIon2  ?? (ion3.trades     ?? ""),
      acertoIon3:    saved.acertoIon3    ?? saved.acertoIon2  ?? (ion3.taxaAcerto ?? ""),
      errosIon3:     saved.errosIon3     ?? saved.errosIon2   ?? (ion3.erros      ?? ""),
      resumoIon3:    saved.resumoIon3    ?? saved.resumoIon2  ?? "",
      // ION OTS
      resultadoOts:  saved.resultadoOts  ?? (ots.resultado  ?? ""),
      qtdOpsOts:     saved.qtdOpsOts     ?? (ots.trades     ?? ""),
      acertoOts:     saved.acertoOts     ?? (ots.taxaAcerto ?? ""),
      errosOts:      saved.errosOts      ?? "",
      resumoOts:     saved.resumoOts     ?? "",
      // geral
      revisaoDetalhada: rev.revisaoDetalhada ?? "",
    });
    setLinksIon3(saved.linksIon3 || saved.linksIon2 || []);
    setLinksOts(saved.linksOts || []);
    setFormDirty(false);
  }

  function abrirSemana(sabStr) {
    const rev = semanasPorSab[sabStr] || {};
    let saved = {};
    try { saved = JSON.parse(rev.resumoCurto || "{}"); } catch {}
    setPainelDia(sabStr);
    setPainelTipo("semanal");
    setFormDados({
      semResultados: saved.semResultados ?? saved.resumoCurto ?? "",
      semMelhorar:   saved.semMelhorar   ?? "",
      semBem:        saved.semBem        ?? "",
      semRegra:      saved.semRegra      ?? "",
    });
    setLinksIon3([]);
    setLinksOts([]);
    setFormDirty(false);
  }

  function fecharPainel() {
    if (formDirty && !window.confirm("Há alterações não salvas. Descartar?")) return;
    setPainelDia(null);
    setFormDirty(false);
  }

  function setField(key, val) {
    setFormDados(p => ({ ...p, [key]: val }));
    setFormDirty(true);
  }

  function addLink(conta) {
    const novo = { id: gerarId(), descricao: "", url: "" };
    if (conta === "ION OTS") setLinksOts(p => [...p, novo]); else setLinksIon3(p => [...p, novo]);
    setFormDirty(true);
  }
  function updateLink(conta, id, campo, valor) {
    const fn = p => p.map(l => l.id === id ? { ...l, [campo]: valor } : l);
    if (conta === "ION OTS") setLinksOts(fn); else setLinksIon3(fn);
    setFormDirty(true);
  }
  function removeLink(conta, id) {
    const fn = p => p.filter(l => l.id !== id);
    if (conta === "ION OTS") setLinksOts(fn); else setLinksIon3(fn);
    setFormDirty(true);
  }

  async function salvar() {
    setSaving(true);
    const existente = painelTipo === "diario" ? (revisaoPorData[painelDia] || null) : (semanasPorSab[painelDia] || null);

    const payloadResumo = painelTipo === "semanal"
      ? {
          semResultados: formDados.semResultados ?? "",
          semMelhorar:   formDados.semMelhorar   ?? "",
          semBem:        formDados.semBem        ?? "",
          semRegra:      formDados.semRegra      ?? "",
        }
      : {
          resultadoIon3: formDados.resultadoIon3 ?? "",
          qtdOpsIon3:    formDados.qtdOpsIon3    ?? "",
          acertoIon3:    formDados.acertoIon3    ?? "",
          errosIon3:     formDados.errosIon3     ?? "",
          resumoIon3:    formDados.resumoIon3    ?? "",
          resultadoOts:  formDados.resultadoOts  ?? "",
          qtdOpsOts:     formDados.qtdOpsOts     ?? "",
          acertoOts:     formDados.acertoOts     ?? "",
          errosOts:      formDados.errosOts      ?? "",
          resumoOts:     formDados.resumoOts     ?? "",
          linksIon3:     linksIon3.filter(l => l.url || l.descricao),
          linksOts:      linksOts.filter(l => l.url || l.descricao),
        };

    const revisao = {
      id:              existente?.id || gerarId(),
      data:            painelDia,
      tipo:            painelTipo,
      resultadoIon2:   painelTipo === "diario" ? (formDados.resultadoIon3 ?? "") : "",
      resultadoMide2:  painelTipo === "diario" ? (formDados.resultadoOts ?? "") : "",
      qtdOps:          formDados.qtdOpsIon3 ?? "",
      acerto:          formDados.acertoIon3 ?? "",
      erros:           formDados.errosIon3  ?? "",
      resumoCurto:     JSON.stringify(payloadResumo),
      revisaoDetalhada: formDados.revisaoDetalhada ?? "",
    };
    try {
      
const resp = await fetch(`${GAS_DIARIO}?action=salvarRevisao&dados=${encodeURIComponent(JSON.stringify(revisao))}`);
      const jr = await resp.json();
      if (jr.erro) throw new Error(jr.erro);
      await carregar();
      
      setFormDirty(false);
      setPainelDia(null);
    } catch(e) { alert("Erro ao salvar."); }
    setSaving(false);
  }

  async function deletar() {
    const existente = painelTipo === "diario" ? (revisaoPorData[painelDia] || null) : (semanasPorSab[painelDia] || null);
    if (!existente || !window.confirm("Excluir esta revisão?")) return;
    setSaving(true);
    try {
      await fetch(`${GAS_DIARIO}?action=deletarRevisao&id=${existente.id}`);
      await carregar();
      setPainelDia(null);
    } catch(e) { alert("Erro ao excluir."); }
    setSaving(false);
  }

  async function salvarUpdate() {
    if (!updateForm.titulo.trim()) return;
    setSaving(true);
    const upd = { id: gerarId(), data: hojeISO(), titulo: updateForm.titulo.trim(), descricao: updateForm.descricao.trim() };
    try {
      await fetch(`${GAS_DIARIO}?action=salvarUpdate&dados=${encodeURIComponent(JSON.stringify(upd))}`);
      await carregar();
      setUpdateForm({ titulo: "", descricao: "" });
      setShowUpdateForm(false);
    } catch(e) { alert("Erro ao salvar update."); }
    setSaving(false);
  }

  async function deletarUpdateFn(id) {
    if (!window.confirm("Excluir este update?")) return;
    try {
      await fetch(`${GAS_DIARIO}?action=deletarUpdate&id=${id}`);
      await carregar();
    } catch(e) { alert("Erro ao excluir."); }
  }

  const inputStyle = {
    width: "100%", background: camada2, border: `1px solid ${bordaSuave}`,
    borderRadius: 8, color: text, padding: "10px 13px", fontSize: 14.5,
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  };
  const labelStyle = {
    fontSize: 11.5, fontWeight: 700, color: textSub, textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: 6, display: "block",
  };
  const btnPrimary = {
    background: ACCENT, color: "#fff", border: "none", borderRadius: 8,
    padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  };
  const btnGhost = {
    background: "transparent", color: textSub, border: `1px solid ${bordaSuave}`,
    borderRadius: 8, padding: "10px 18px", fontSize: 14, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  };

  function renderCalendario() {
    // ION OTS opera valores menores: ±50 já é gain/loss, não empate
    const limiteConta = contaSel === "ION OTS" ? 50 : 100;
    const total = new Date(ano, mes + 1, 0).getDate();
    const hoje = hojeISO();
    const cells = [];

    // Cabeçalhos: Seg..Sex + coluna de respiro + "Semana"
    CABECALHOS.forEach((d, i) => (
      cells.push(
        <div key={`h${i}`} style={{
          textAlign: "center", fontSize: i === 6 ? 11.5 : 12.5, fontWeight: i === 6 ? 800 : 700,
          color: i === 6 ? ACCENT : textSub, padding: 0, lineHeight: 1.1,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{d}</div>
      )
    ));

    // espaços iniciais até a coluna do primeiro dia renderizado
    let primeiroDia = 1;
    while (new Date(ano, mes, primeiroDia).getDay() === 0) primeiroDia++;
    const diaSemInicial = new Date(ano, mes, primeiroDia).getDay();
    const brancosIniciais = diaSemInicial === 6 ? 5 : diaSemInicial - 1;
    for (let i = 0; i < brancosIniciais; i++) cells.push(<div key={`e${i}`} />);

    let slots = brancosIniciais;

    for (let d = 1; d <= total; d++) {
      const diaSem = new Date(ano, mes, d).getDay();
      if (diaSem === 0) continue; // domingo não é exibido

      const dataStr  = isoData(ano, mes, d);
      const isSab    = diaSem === 6;
      const isHoje   = dataStr === hoje;
      const isFuturo = dataStr > hoje;
      const isAberto = painelDia === dataStr;

      if (isSab) {
        // coluna estreita de respiro antes do bloco da semana
        cells.push(<div key={`sp${d}`} />);
        slots++;

        const sem = resumoSemana(dataStr, contaSel);
        const temDados = sem.diasComDados > 0;
        const revSem = semanasPorSab[dataStr] || null;
        const cores = temDados ? corResultado(sem.totalRes, limiteConta) : null;

        cells.push(
          <div key={d} onClick={() => abrirSemana(dataStr)} style={{
            background: isAberto ? ACCENT + "22" : (cores ? cores.bg : (isFuturo ? futuro.bg : camada1)),
            border: `2px ${isFuturo && !temDados ? "dashed" : "solid"} ${isAberto ? ACCENT : (cores ? cores.border : (isFuturo ? futuro.border : ACCENT + "55"))}`,
            borderLeft: `5px solid ${isFuturo && !temDados ? futuro.border : ACCENT}`,
            borderRadius: 10, padding: "9px 11px", cursor: "pointer", height: "100%",
            display: "flex", flexDirection: "column", gap: 4, boxSizing: "border-box",
            overflow: "hidden", userSelect: "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: isFuturo && !temDados ? futuro.text : ACCENT, letterSpacing: "0.06em", textTransform: "uppercase" }}>Resumo</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {revSem && <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />}
                <span style={{ fontSize: 12, fontWeight: isHoje ? 800 : 600, color: isHoje ? ACCENT : isFuturo ? futuro.text : textSub }}>{d}</span>
              </div>
            </div>
            {temDados ? (
              <>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: cores ? cores.text : textSub, lineHeight: 1.1 }}>{fmtVal(sem.totalRes)}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{contaSel} · {sem.diasComDados}d</div>
                <div style={{ height: 1, background: bordaSuave, margin: "1px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {sem.totalOps > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10.5, color: textSub }}>Ops</span><span style={{ fontSize: 10.5, fontWeight: 700, color: text }}>{sem.totalOps}</span></div>}
                  {sem.acertoMedio !== null && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10.5, color: textSub }}>Acerto</span><span style={{ fontSize: 10.5, fontWeight: 700, color: text }}>{sem.acertoMedio}%</span></div>}
                  {sem.totalErros > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10.5, color: textSub }}>Erros</span><span style={{ fontSize: 10.5, fontWeight: 700, color: isDark ? "#e07d7d" : "#a04040" }}>{sem.totalErros}</span></div>}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 10.5, color: isFuturo ? futuro.text : textSub, marginTop: 3, lineHeight: 1.4 }}>
                {isFuturo ? "—" : <>Sem dados<br/>na semana</>}
              </div>
            )}
          </div>
        );
        slots++;
        continue;
      }

      // ---- dias úteis: três estados (futuro / não cliquei / com trades) ----
      const rev = revisaoPorData[dataStr];
      const dd  = dadosDoDia(dataStr, contaSel);
      const rVal = parseFloat(dd?.resultado ?? "NaN");
      const temDados = !isNaN(rVal);
      const semRegistro = !dd && !rev;
      const cores = temDados ? corResultado(rVal, limiteConta) : null;

      let bgCard, bdCard, estiloBorda, corNum;
      if (isAberto) {
        bgCard = ACCENT + "22"; bdCard = ACCENT; estiloBorda = "solid"; corNum = text;
      } else if (isFuturo && semRegistro) {
        bgCard = futuro.bg; bdCard = futuro.border; estiloBorda = "dashed"; corNum = futuro.text;
      } else if (semRegistro) {
        bgCard = naoCliquei.bg; bdCard = naoCliquei.border; estiloBorda = "solid"; corNum = naoCliquei.text;
      } else {
        bgCard = cores ? cores.bg : camada1;
        bdCard = cores ? cores.border : isHoje ? ACCENT + "88" : bordaSuave;
        estiloBorda = "solid";
        corNum = isHoje ? ACCENT : text;
      }

      let temLinks = false;
      try {
        const s = JSON.parse(rev?.resumoCurto || "{}");
        temLinks = (s.linksIon3 || s.linksIon2 || []).length > 0 || (s.linksOts || []).length > 0;
      } catch {}

      cells.push(
        <div key={d} onClick={() => !isFuturo && abrirDia(dataStr)} style={{
          background: bgCard, border: `2px ${estiloBorda} ${bdCard}`, borderRadius: 10,
          padding: "9px 11px", cursor: isFuturo ? "default" : "pointer", height: "100%",
          transition: "border-color .15s, background .15s", display: "flex", flexDirection: "column",
          gap: 4, userSelect: "none", boxSizing: "border-box", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13.5, fontWeight: isHoje ? 800 : 600, color: corNum }}>{d}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {temLinks && <span title="Tem links" style={{ fontSize: 10, color: ACCENT }}>🔗</span>}
              {!isFuturo && semRegistro && (
                <span style={{ fontSize: 9, fontWeight: 800, color: naoCliquei.text, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", borderRadius: 4, padding: "1px 5px", letterSpacing: "0.03em", textTransform: "uppercase" }}>não cliquei</span>
              )}
              {!semRegistro && rev && <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />}
            </div>
          </div>

          {isFuturo && semRegistro ? null : semRegistro ? (
            <div style={{ fontSize: 14.5, fontWeight: 800, color: naoCliquei.text, lineHeight: 1.2, marginTop: 1 }}>—</div>
          ) : (
            <>
              {temDados && <div style={{ fontSize: 14.5, fontWeight: 800, color: cores ? cores.text : textSub, lineHeight: 1.2, marginTop: 1 }}>{fmtVal(rVal)}</div>}
              <div style={{ fontSize: 10, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: "0.04em" }}>{contaSel}</div>
              {dd && (
                <>
                  <div style={{ height: 1, background: bordaSuave, margin: "1px 0" }} />
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {dd.trades != null && <span style={{ fontSize: 11.5, color: textSub }}>{dd.trades} ops</span>}
                    {dd.taxaAcerto != null && <span style={{ fontSize: 11.5, color: textSub }}>· {dd.taxaAcerto}%</span>}
                    {dd.erros > 0 && <span style={{ fontSize: 11.5, color: isDark ? "#e07d7d" : "#a04040" }}>· {dd.erros} err</span>}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      );
      slots++;
    }

    const resto = slots % 7;
    if (resto !== 0) for (let i = 0; i < (7 - resto); i++) cells.push(<div key={`ef${i}`} />);

    const mesR = resumoMensal(contaSel);
    const coresMes = mesR.diasComDados > 0 ? corResultado(mesR.totalRes, limiteConta) : null;

    cells.push(
      <div key="card-mensal" style={{ gridColumn: "1 / -1", background: coresMes ? coresMes.bg : camada1, border: `2px solid ${coresMes ? coresMes.border : bordaSuave}`, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 140 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.07em" }}>Resumo do mês · {contaSel}</span>
          <span style={{ fontSize: 21, fontWeight: 800, color: coresMes ? coresMes.text : textSub, lineHeight: 1.15 }}>{mesR.diasComDados > 0 ? fmtVal(mesR.totalRes) : "—"}</span>
          <span style={{ fontSize: 11.5, color: textSub }}>{mesR.diasComDados} dias com trades</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[["Ops", mesR.totalOps > 0 ? mesR.totalOps : "—"],["Acerto médio", mesR.acertoMedio !== null ? `${mesR.acertoMedio}%` : "—"],["Erros", mesR.totalErros > 0 ? mesR.totalErros : "—"]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
              <span style={{ fontSize: 17.5, fontWeight: 800, color: label === "Erros" && mesR.totalErros > 0 ? (isDark ? "#e07d7d" : "#a04040") : text }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return cells;
  }

  function renderPainel() {
    if (!painelDia) return null;
    const dt = new Date(painelDia + "T12:00:00");
    const dataDisplay = painelTipo === "semanal"
      ? (() => { const ini = new Date(dt); ini.setDate(dt.getDate()-5); return `Semana ${ini.getDate()}/${ini.getMonth()+1} – ${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`; })()
      : `${DIAS_NOME[dt.getDay()]}, ${dt.getDate()} de ${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;

    const existente = painelTipo === "diario" ? revisaoPorData[painelDia] : semanasPorSab[painelDia];

    function campo(label, key, tipo = "text", placeholder = "", rows = 3) {
      return (
        <div key={key}>
          <label style={labelStyle}>{label}</label>
          {tipo === "textarea"
            ? <AutoTextarea value={formDados[key] || ""} placeholder={placeholder} onChange={e => setField(key, e.target.value)} rows={rows} style={inputStyle} />
            : <input type={tipo} value={formDados[key] || ""} placeholder={placeholder} onChange={e => setField(key, e.target.value)} style={inputStyle} />}
        </div>
      );
    }

    function blocoLinks(conta, lista) {
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Links</label>
            <button onClick={() => addLink(conta)} style={{ background: "none", border: `1px dashed ${ACCENT}`, color: ACCENT, borderRadius: 6, padding: "4px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Link</button>
          </div>
          {lista.length === 0 && <div style={{ fontSize: 13, color: textSub, padding: "6px 0" }}>Nenhum link adicionado.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lista.map(link => (
              <div key={link.id} style={{ background: camada1, border: `1px solid ${bordaSuave}`, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={link.descricao} onChange={e => updateLink(conta, link.id, "descricao", e.target.value)} placeholder="Descrição do link..." style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => removeLink(conta, link.id)} style={{ background: "none", border: "none", cursor: "pointer", color: textSub, fontSize: 19, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={link.url} onChange={e => updateLink(conta, link.id, "url", e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
                  {link.url && <a href={link.url} target="_blank" rel="noreferrer" style={{ color: ACCENT, fontSize: 14, flexShrink: 0, textDecoration: "none", fontWeight: 600 }}>↗</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function contaBlock(conta, keys, lista) {
      return (
        <div style={{ background: camada1, border: `1px solid ${bordaSuave}`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{conta}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {campo("Resultado (R$)", keys.res, "number", "ex: 320")}
            {campo("Qtd ops", keys.ops, "number", "ex: 5")}
            {campo("Acerto %", keys.ac, "number", "ex: 60")}
            {campo("Erros", keys.err, "number", "ex: 2")}
          </div>
          {campo(`Resumo ${conta}`, keys.resumo, "textarea", "O que funcionou? O que errou?", 2)}
          {blocoLinks(conta, lista)}
        </div>
      );
    }

    return (
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(540px, 96vw)", background: cardBg, borderLeft: `1px solid ${border}`, boxShadow: "-8px 0 32px rgba(0,0,0,0.30)", zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${bordaSuave}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, background: painelTipo === "semanal" ? ACCENT+"22" : camada2, color: painelTipo === "semanal" ? ACCENT : textSub, borderRadius: 5, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {painelTipo === "semanal" ? "Resumo Semanal" : "Revisão Diária"}
              </span>
              {existente && <span style={{ fontSize: 11, color: ACCENT }}>● salvo</span>}
              {formDirty  && <span style={{ fontSize: 11, color: "#f0a04e" }}>● alterações</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: text }}>{dataDisplay}</div>
          </div>
          <button onClick={fecharPainel} style={{ background: "none", border: "none", cursor: "pointer", color: textSub, fontSize: 25, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {painelTipo === "diario" && (
            <>
              {contaBlock("ION 3", { res:"resultadoIon3", ops:"qtdOpsIon3", ac:"acertoIon3", err:"errosIon3", resumo:"resumoIon3" }, linksIon3)}
              {contaBlock("ION OTS", { res:"resultadoOts", ops:"qtdOpsOts", ac:"acertoOts", err:"errosOts", resumo:"resumoOts" }, linksOts)}
              {campo("Revisão geral e pontos para lembrar", "revisaoDetalhada", "textarea", "Análise do dia, lições, pontos a carregar pra amanhã...", 5)}
            </>
          )}
          {painelTipo === "semanal" && (
            <>
              {campo("1) Como foram meus resultados essa semana?", "semResultados", "textarea", "", 3)}
              {campo("2) O que poderia ter feito meu resultado ser melhor?", "semMelhorar", "textarea", "", 3)}
              {campo("3) O que fiz bem?", "semBem", "textarea", "", 3)}
              {campo("4) Cabe alguma regra ou filtro extra para a próxima semana?", "semRegra", "textarea", "", 3)}
            </>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${bordaSuave}`, display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={salvar} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{saving ? "Salvando..." : "Salvar"}</button>
          {existente && <button onClick={deletar} disabled={saving} style={{ ...btnGhost, color: "#f06b6b", border: "1px solid #f06b6b44" }}>Excluir</button>}
        </div>
      </div>
    );
  }

  function renderUpdates() {
    return (
      <aside style={{ width: 600, flexShrink: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 12.5, letterSpacing: 0.7, color: text, textTransform: "uppercase" }}>Updates Operacionais</div>
            <div style={{ fontSize: 12.5, color: textSub, marginTop: 3, lineHeight: 1.4 }}>Ajustes e novas regras do operacional</div>
          </div>
          <button onClick={() => { setShowUpdateForm(v => !v); setUpdateForm({ titulo: "", descricao: "" }); }} style={{ ...btnPrimary, padding: "7px 13px", fontSize: 12, flexShrink: 0 }}>
            {showUpdateForm ? "×" : "+ Novo"}
          </button>
        </div>

        {showUpdateForm && (
          <div style={{ background: camada1, border: `1px solid ${ACCENT}55`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={labelStyle}>Título</label>
              <input type="text" placeholder="ex: Regra de correção rasa" value={updateForm.titulo} onChange={e => setUpdateForm(p => ({ ...p, titulo: e.target.value }))} style={{ ...inputStyle, fontSize: 13.5 }} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea placeholder="Contexto e como aplicar..." value={updateForm.descricao} onChange={e => setUpdateForm(p => ({ ...p, descricao: e.target.value }))} rows={3} style={{ ...inputStyle, fontSize: 13.5, resize: "vertical", lineHeight: 1.5 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowUpdateForm(false)} style={{ ...btnGhost, padding: "7px 13px", fontSize: 12.5 }}>Cancelar</button>
              <button onClick={salvarUpdate} disabled={saving || !updateForm.titulo.trim()} style={{ ...btnPrimary, padding: "7px 13px", fontSize: 12.5 }}>{saving ? "..." : "Salvar"}</button>
            </div>
          </div>
        )}

        {updates.length === 0 && !showUpdateForm && (
          <div style={{ textAlign: "center", padding: "26px 14px", color: textSub, fontSize: 13, border: `1px dashed ${bordaSuave}`, borderRadius: 12, lineHeight: 1.5 }}>
            Nenhum update ainda.<br />
            <span style={{ fontSize: 12 }}>Clique em "+ Novo" para registrar.</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {updates.map(upd => {
            const isExp = expandedUpdate === upd.id;
            const dtStr = (() => {
              if (!upd.data) return "—";
              const raw = upd.data.toString();
              if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                const dt = new Date(raw + "T12:00:00");
                return `${dt.getDate()}/${dt.getMonth()+1}`;
              }
              return raw;
            })();
            return (
              <div key={upd.id} style={{ background: camada1, border: `1px solid ${bordaSuave}`, borderLeft: `3px solid ${ACCENT}`, borderRadius: 10, overflow: "hidden" }}>
                <div onClick={() => setExpandedUpdate(isExp ? null : upd.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", cursor: "pointer", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: textSub, background: camada2, borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>{dtStr}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upd.titulo}</span>
                  </div>
                  <span style={{ color: textSub, fontSize: 12, flexShrink: 0 }}>{isExp ? "▲" : "▼"}</span>
                </div>
                {isExp && (
                  <div style={{ padding: "10px 13px 12px", borderTop: `1px solid ${bordaSuave}` }}>
                    {upd.descricao && <p style={{ margin: "0 0 10px", fontSize: 13.5, color: text, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{upd.descricao}</p>}
                    <button onClick={() => deletarUpdateFn(upd.id)} style={{ ...btnGhost, fontSize: 11.5, padding: "5px 11px", color: "#f06b6b", border: "1px solid #f06b6b44" }}>Excluir</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <div style={{ flex: 1, padding: "18px 30px 40px", overflowY: "auto", minWidth: 0, width: "100%", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: text, position: "relative" }}>
      {painelDia && (
        <div onClick={fecharPainel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 199 }} />
      )}

      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: text, margin: 0 }}>Revisões</h1>
        <p style={{ fontSize: 12.5, color: textSub, margin: "2px 0 0" }}>Clique num dia para registrar, ou no bloco Semana para o resumo semanal.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textSub, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", width: "100%", minWidth: 0 }}>
          {/* Coluna principal — calendário */}
          <div style={{ flex: 1, minWidth: 0, background: cardBg, borderRadius: 14, padding: "14px 18px 16px", boxShadow: cardShadow, border: `1px solid ${border}`, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: text }}>{MESES[mes]} {ano}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => { if (mes === 0) { setMes(11); setAno(a => a-1); } else setMes(m => m-1); }} style={{ border: `1px solid ${bordaSuave}`, background: camada2, borderRadius: 7, width: 28, height: 28, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>‹</button>
                  <button onClick={() => { if (mes === 11) { setMes(0); setAno(a => a+1); } else setMes(m => m+1); }} style={{ border: `1px solid ${bordaSuave}`, background: camada2, borderRadius: 7, width: 28, height: 28, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>›</button>
                </div>
                <div style={{ display: "flex", gap: 11, flexWrap: "wrap", fontSize: 11.5, color: textSub }}>
                  {[["#4ecb8d",`≥ +${contaSel === "ION OTS" ? 50 : 100}`],["#e0c040","Neutro"],["#f06b6b",`≤ −${contaSel === "ION OTS" ? 50 : 100}`],[naoCliquei.border,"Não cliquei"]].map(([c,l]) => (
                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: c, display: "inline-block" }} />{l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seletor de conta — canto superior direito do calendário */}
              <div style={{ display: "flex", gap: 4, background: camada2, border: `1px solid ${bordaSuave}`, borderRadius: 9, padding: 3, flexShrink: 0 }}>
                {CONTAS.map(c => (
                  <button key={c} onClick={() => setContaSel(c)} style={{
                    background: contaSel === c ? ACCENT : "transparent",
                    color: contaSel === c ? "#fff" : textSub,
                    border: "none", borderRadius: 6, padding: "6px 13px",
                    fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  }}>{c}</button>
                ))}
              </div>
            </div>

            {/* primeira linha (cabeçalhos) com altura automática; demais linhas com altura fixa */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr) 12px 1.05fr", gridTemplateRows: "auto", gridAutoRows: "136px", columnGap: 6, rowGap: 6, width: "100%" }}>
              {renderCalendario()}
            </div>
          </div>

          {/* Coluna lateral — updates operacionais */}
          {renderUpdates()}
        </div>
      )}

      {renderPainel()}
    </div>
  );
}
