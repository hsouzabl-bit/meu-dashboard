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

// Seg a Sáb — domingo eliminado do calendário
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
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
      await fetch(`${GAS_DIARIO}?action=salvarRevisao&dados=${encodeURIComponent(JSON.stringify(revisao))}`);
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
    const limiteConta = contaSel === "ION OTS" ? 49 : 100;
    const total = new Date(ano, mes + 1, 0).getDate();
    const cells = [];

    DIAS_SEMANA.forEach((d, i) => (
      cells.push(
        <div key={`h${i}`} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: textSub, padding: "8px 0", letterSpacing: "0.05em", textTransform: "uppercase" }}>{d}</div>
      )
    ));

    // coluna 0 = Segunda ... coluna 5 = Sábado (domingo não é renderizado)
    const colDe = (diaSem) => diaSem === 0 ? null : diaSem - 1;

    // espaços iniciais até a coluna do primeiro dia útil do mês
    let primeiroDiaRenderizado = 1;
    while (new Date(ano, mes, primeiroDiaRenderizado).getDay() === 0) primeiroDiaRenderizado++;
    const colInicial = colDe(new Date(ano, mes, primeiroDiaRenderizado).getDay());
    for (let i = 0; i < colInicial; i++) cells.push(<div key={`e${i}`} />);

    let renderizados = 0;

    for (let d = 1; d <= total; d++) {
      const diaSem = new Date(ano, mes, d).getDay();
      if (diaSem === 0) continue; // domingo eliminado

      const dataStr  = isoData(ano, mes, d);
      const isSab    = diaSem === 6;
      const isHoje   = dataStr === hojeISO();
      const isAberto = painelDia === dataStr;
      renderizados++;

      if (isSab) {
        const sem = resumoSemana(dataStr, contaSel);
        const temDados = sem.diasComDados > 0;
        const revSem = semanasPorSab[dataStr] || null;
        const cores = temDados ? corResultado(sem.totalRes, limiteConta) : null;
        const sabBg = isAberto ? ACCENT + "22" : (cores ? cores.bg : camada1);
        const sabBorder = isAberto ? ACCENT : (cores ? cores.border : bordaSuave);

        cells.push(
          <div key={d} onClick={() => abrirSemana(dataStr)} style={{ background: sabBg, border: `2px solid ${sabBorder}`, borderRadius: 10, padding: "11px 12px 10px", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", gap: 5, boxSizing: "border-box", overflow: "hidden", userSelect: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: isHoje ? 800 : 600, color: isHoje ? ACCENT : textSub }}>{d}</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {revSem && <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />}
                <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT, background: ACCENT + "20", borderRadius: 4, padding: "1px 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>semana</span>
              </div>
            </div>
            {temDados ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: cores ? cores.text : textSub, lineHeight: 1.1, marginTop: 2 }}>{fmtVal(sem.totalRes)}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{contaSel} · {sem.diasComDados}d</div>
                <div style={{ height: 1, background: bordaSuave, margin: "1px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {sem.totalOps > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: textSub }}>Ops</span><span style={{ fontSize: 11, fontWeight: 700, color: text }}>{sem.totalOps}</span></div>}
                  {sem.acertoMedio !== null && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: textSub }}>Acerto</span><span style={{ fontSize: 11, fontWeight: 700, color: text }}>{sem.acertoMedio}%</span></div>}
                  {sem.totalErros > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: textSub }}>Erros</span><span style={{ fontSize: 11, fontWeight: 700, color: isDark ? "#e07d7d" : "#a04040" }}>{sem.totalErros}</span></div>}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: textSub, marginTop: 4, lineHeight: 1.4 }}>Sem dados<br/>na semana</div>
            )}
          </div>
        );
        continue;
      }

      // dias úteis
      const rev = revisaoPorData[dataStr];
      const dd  = dadosDoDia(dataStr, contaSel);
      const rVal = parseFloat(dd?.resultado ?? "NaN");
      const temDados = !isNaN(rVal);
      const semTrades = !dd && !rev;
      const cores = temDados ? corResultado(rVal, limiteConta) : null;
      const bgCard = semTrades ? (isDark ? "rgba(255,255,255,0.025)" : "#e8e8e8") : isAberto ? ACCENT + "22" : (cores ? cores.bg : camada1);
      const bdCard = isAberto ? ACCENT : semTrades ? bordaSuave : cores ? cores.border : isHoje ? ACCENT + "88" : bordaSuave;
      const corApagada = isDark ? "rgba(255,255,255,0.3)" : "#aaa";

      let temLinks = false;
      try {
        const s = JSON.parse(rev?.resumoCurto || "{}");
        temLinks = (s.linksIon3 || s.linksIon2 || []).length > 0 || (s.linksOts || []).length > 0;
      } catch {}

      cells.push(
        <div key={d} onClick={() => abrirDia(dataStr)} style={{ background: bgCard, border: `2px solid ${bdCard}`, borderRadius: 10, padding: "11px 12px 10px", cursor: "pointer", height: "100%", transition: "border-color .15s, background .15s", display: "flex", flexDirection: "column", gap: 5, userSelect: "none", boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: isHoje ? 800 : 600, color: isHoje ? ACCENT : semTrades ? corApagada : text }}>{d}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {temLinks && <span title="Tem links" style={{ fontSize: 10, color: ACCENT }}>🔗</span>}
              {semTrades ? (
                <span style={{ fontSize: 10, fontWeight: 800, color: corApagada, background: isDark ? "rgba(255,255,255,0.06)" : "#d4d4d4", borderRadius: 4, padding: "1px 5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>sem trades</span>
              ) : (
                rev && <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
              )}
            </div>
          </div>

          {semTrades ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 800, color: corApagada, lineHeight: 1.2, marginTop: 2 }}>—</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: corApagada, textTransform: "uppercase", letterSpacing: "0.04em" }}>{contaSel}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: corApagada }}>—</span>
              </div>
            </>
          ) : (
            <>
              {temDados && <div style={{ fontSize: 15, fontWeight: 800, color: cores ? cores.text : textSub, lineHeight: 1.2, marginTop: 2 }}>{fmtVal(rVal)}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: "0.04em" }}>{contaSel}</span>
              </div>
              {dd && (
                <>
                  <div style={{ height: 1, background: bordaSuave, margin: "2px 0" }} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {dd.trades != null && <span style={{ fontSize: 12, color: textSub }}>{dd.trades} ops</span>}
                    {dd.taxaAcerto != null && <span style={{ fontSize: 12, color: textSub }}>· {dd.taxaAcerto}%</span>}
                    {dd.erros > 0 && <span style={{ fontSize: 12, color: isDark ? "#e07d7d" : "#a04040" }}>· {dd.erros} err</span>}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      );
    }

    const totalCells = colInicial + renderizados;
    const resto = totalCells % 6;
    if (resto !== 0) for (let i = 0; i < (6 - resto); i++) cells.push(<div key={`ef${i}`} />);

    const mesR = resumoMensal(contaSel);
    const coresMes = mesR.diasComDados > 0 ? corResultado(mesR.totalRes, limiteConta) : null;
    
    cells.push(
      <div key="card-mensal" style={{ gridColumn: "1 / -1", background: coresMes ? coresMes.bg : camada1, border: `2px solid ${coresMes ? coresMes.border : bordaSuave}`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 150 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.07em" }}>Resumo do mês · {contaSel}</span>
          <span style={{ fontSize: 23, fontWeight: 800, color: coresMes ? coresMes.text : textSub, lineHeight: 1.1 }}>{mesR.diasComDados > 0 ? fmtVal(mesR.totalRes) : "—"}</span>
          <span style={{ fontSize: 12, color: textSub }}>{mesR.diasComDados} dias com trades</span>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[["Ops", mesR.totalOps > 0 ? mesR.totalOps : "—"],["Acerto médio", mesR.acertoMedio !== null ? `${mesR.acertoMedio}%` : "—"],["Erros", mesR.totalErros > 0 ? mesR.totalErros : "—"]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
              <span style={{ fontSize: 19, fontWeight: 800, color: label === "Erros" && mesR.totalErros > 0 ? (isDark ? "#e07d7d" : "#a04040") : text }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return cells;
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
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.8, color: text, textTransform: "uppercase", marginBottom: 4 }}>Updates Operacionais</div>
            <div style={{ fontSize: 14, color: textSub }}>Registro cronológico de ajustes e novas regras no seu operacional</div>
          </div>
          <button onClick={() => { setShowUpdateForm(v => !v); setUpdateForm({ titulo: "", descricao: "" }); }} style={{ ...btnPrimary, padding: "9px 15px", fontSize: 13, flexShrink: 0 }}>
            {showUpdateForm ? "Cancelar" : "+ Novo update"}
          </button>
        </div>

        {showUpdateForm && (
          <div style={{ background: camada1, border: `1px solid ${ACCENT}55`, borderRadius: 12, padding: "18px 20px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Título do update</label>
              <input type="text" placeholder="ex: Regra de correção rasa pós-dia ruim" value={updateForm.titulo} onChange={e => setUpdateForm(p => ({ ...p, titulo: e.target.value }))} style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea placeholder="Descreva a regra, o contexto e como aplicar..." value={updateForm.descricao} onChange={e => setUpdateForm(p => ({ ...p, descricao: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowUpdateForm(false)} style={btnGhost}>Cancelar</button>
              <button onClick={salvarUpdate} disabled={saving || !updateForm.titulo.trim()} style={btnPrimary}>{saving ? "Salvando..." : "Salvar update"}</button>
            </div>
          </div>
        )}

        {updates.length === 0 && !showUpdateForm && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: textSub, fontSize: 14, border: `1px dashed ${bordaSuave}`, borderRadius: 12 }}>
            Nenhum update registrado ainda.<br />
            <span style={{ fontSize: 13 }}>Clique em "+ Novo update" para registrar uma mudança no operacional.</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {updates.map(upd => {
            const isExp = expandedUpdate === upd.id;
            const dtStr = (() => {
              if (!upd.data) return "—";
              const raw = upd.data.toString();
              if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                const dt = new Date(raw + "T12:00:00");
                return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`;
              }
              return raw;
            })();
            return (
              <div key={upd.id} style={{ background: camada1, border: `1px solid ${bordaSuave}`, borderLeft: `3px solid ${ACCENT}`, borderRadius: 10, overflow: "hidden" }}>
                <div onClick={() => setExpandedUpdate(isExp ? null : upd.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: textSub, background: camada2, borderRadius: 5, padding: "3px 9px", flexShrink: 0 }}>{dtStr}</span>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upd.titulo}</span>
                  </div>
                  <span style={{ color: textSub, fontSize: 14, flexShrink: 0 }}>{isExp ? "▲" : "▼"}</span>
                </div>
                {isExp && (
                  <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${bordaSuave}` }}>
                    {upd.descricao && <p style={{ margin: "0 0 12px", fontSize: 14.5, color: text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{upd.descricao}</p>}
                    <button onClick={() => deletarUpdateFn(upd.id)} style={{ ...btnGhost, fontSize: 12, padding: "6px 13px", color: "#f06b6b", border: "1px solid #f06b6b44" }}>Excluir</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: "36px 40px 56px", overflowY: "auto", minWidth: 0, width: "100%", maxWidth: "calc(75vw - 240px)", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: text, position: "relative" }}>
      {painelDia && (
        <div onClick={fecharPainel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 199 }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: 0 }}>Revisões</h1>
          <p style={{ fontSize: 14, color: textSub, margin: "4px 0 0" }}>Registro diário e semanal. Clique num dia para ver ou editar.</p>
        </div>
        {/* Seletor de conta */}
        <div style={{ display: "flex", gap: 4, background: camada2, border: `1px solid ${bordaSuave}`, borderRadius: 10, padding: 4 }}>
          {CONTAS.map(c => (
            <button key={c} onClick={() => setContaSel(c)} style={{
              background: contaSel === c ? ACCENT : "transparent",
              color: contaSel === c ? "#fff" : textSub,
              border: "none", borderRadius: 7, padding: "8px 16px",
              fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textSub, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 14, padding: "22px 26px", boxShadow: cardShadow, border: `1px solid ${border}`, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: text }}>{MESES[mes]} {ano}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { if (mes === 0) { setMes(11); setAno(a => a-1); } else setMes(m => m-1); }} style={{ border: `1px solid ${bordaSuave}`, background: camada2, borderRadius: 7, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>‹</button>
              <button onClick={() => { if (mes === 11) { setMes(0); setAno(a => a+1); } else setMes(m => m+1); }} style={{ border: `1px solid ${bordaSuave}`, background: camada2, borderRadius: 7, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>›</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, fontSize: 13, color: textSub }}>
          {[["#4ecb8d",`Gain (≥ +R$ ${contaSel === "ION OTS" ? 40 : 100})`],["#e0c040","Breakeven"],["#f06b6b",`Loss (≤ −R$ ${contaSel === "ION OTS" ? 40 : 100})`]].map(([c,l]) => (
  <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: c, display: "inline-block" }} />{l}
              </span>
            ))}
            <span style={{ opacity: 0.75 }}>Sábado = resumo da semana (clique para preencher)</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "170px", gap: 8, width: "100%" }}>
            {renderCalendario()}
          </div>
        </div>
      )}

      {!loading && renderUpdates()}
      {renderPainel()}
    </div>
  );
}
