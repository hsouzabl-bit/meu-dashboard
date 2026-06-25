import { useState, useEffect } from "react";

const GAS_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT = "#4ecb8d";
const IcoMoon = ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IcoSun  = ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

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
  const isDark     = bg === "#1a1d23" || bg.startsWith("#1") || bg.startsWith("#0");

  function corResultado(total) {
    const n = parseFloat(total);
    if (isNaN(n)) return null;
    if (n >= 100)  return {
      bg:     isDark ? "#172b20" : "#f0faf5",
      border: isDark ? "#2e5c40" : "#6bbf96",
      text:   isDark ? "#3daa78" : "#2e7d5a",
    };
    if (n <= -100) return {
      bg:     isDark ? "#2b1717" : "#faf0f0",
      border: isDark ? "#5c2e2e" : "#c47878",
      text:   isDark ? "#c05858" : "#a04040",
    };
    return {
      bg:     isDark ? "#252210" : "#fafaf0",
      border: isDark ? "#5c5010" : "#b8b06a",
      text:   isDark ? "#b09830" : "#7a7030",
    };
  }

  const [ano, setAno]             = useState(new Date().getFullYear());
  const [mes, setMes]             = useState(new Date().getMonth());
  const [revisoes, setRevisoes]   = useState(revisoesProp || []);
  const [updates, setUpdates]     = useState(updatesProp  || []);
  const [tradesPorData, setTradesPorData] = useState(tradesPorDataProp || {});
  const [loading, setLoading]     = useState(loadingProp && !revisoesProp?.length);
  const [saving, setSaving]       = useState(false);

  const [painelDia, setPainelDia]   = useState(null);
  const [painelTipo, setPainelTipo] = useState("diario");
  const [formDados, setFormDados]   = useState({});
  const [formDirty, setFormDirty]   = useState(false);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm]         = useState({ titulo: "", descricao: "" });
  const [expandedUpdate, setExpandedUpdate] = useState(null);

  // Sincroniza com props quando chegam do cache
  useEffect(() => { if (revisoesProp?.length)   setRevisoes(revisoesProp);   }, [revisoesProp]);
  useEffect(() => { if (updatesProp?.length)    setUpdates(updatesProp);     }, [updatesProp]);
  useEffect(() => { if (tradesPorDataProp && Object.keys(tradesPorDataProp).length) setTradesPorData(tradesPorDataProp); }, [tradesPorDataProp]);
  useEffect(() => { setLoading(loadingProp && !revisoesProp?.length); }, [loadingProp]);

  const carregar = async () => {
    setLoading(true);
    try {
      const [rRev, rUpd, rTrades] = await Promise.all([
        fetch(`${GAS_DIARIO}?action=lerRevisoes`).then(r => r.json()),
        fetch(`${GAS_DIARIO}?action=lerUpdates`).then(r => r.json()),
        fetch(`${GAS_DIARIO}?action=lerTradesPorData`).then(r => r.json()),
      ]);
      setRevisoes(rRev.revisoes || []);
      setUpdates(rUpd.updates   || []);
      setTradesPorData(rTrades.porData || {});
      if (onCarregar) onCarregar();
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const revisaoPorData = {};
  revisoes.forEach(r => { revisaoPorData[r.data] = r; });
  const semanasPorDom = {};
  revisoes.filter(r => r.tipo === "semanal").forEach(r => { semanasPorDom[r.data] = r; });

  function isoData(a, m, d) {
    return `${a}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  // Retorna o domingo da semana de uma data qualquer (para agrupar Seg–Sáb)
  function domingoAnterior(dataStr) {
    const dt = new Date(dataStr + "T12:00:00");
    const dom = new Date(dt);
    dom.setDate(dt.getDate() - dt.getDay());
    return isoData(dom.getFullYear(), dom.getMonth(), dom.getDate());
  }

  // Calcula o resumo semanal ION 2 para um sábado específico (Seg a Sex daquela semana)
  function resumoSemanalIon2(sabadoStr) {
    const sabado = new Date(sabadoStr + "T12:00:00");
    let totalRes = 0, totalOps = 0, somaAcerto = 0, diasAcerto = 0, totalErros = 0, diasComDados = 0;

    for (let offset = -5; offset <= -1; offset++) { // Seg(-5) a Sex(-1) em relação ao Sáb
      const dt = new Date(sabado);
      dt.setDate(sabado.getDate() + offset);
      const dataStr = isoData(dt.getFullYear(), dt.getMonth(), dt.getDate());
      const trades  = tradesPorData[dataStr] || {};
      const ion2    = trades["ION 2"] || trades["ion 2"] || null;
      const rev     = revisaoPorData[dataStr] || null;

      const rIon2 = parseFloat(rev?.resultadoIon2 ?? ion2?.resultado ?? "NaN");
      if (!isNaN(rIon2)) { totalRes += rIon2; diasComDados++; }

      const ops = parseFloat(ion2?.trades ?? "NaN");
      if (!isNaN(ops)) totalOps += ops;

      const ac = parseFloat(ion2?.taxaAcerto ?? "NaN");
      if (!isNaN(ac)) { somaAcerto += ac; diasAcerto++; }

      const er = parseFloat(ion2?.erros ?? "NaN");
      if (!isNaN(er)) totalErros += er;
    }

    return {
      totalRes,
      totalOps: totalOps || 0,
      acertoMedio: diasAcerto > 0 ? Math.round(somaAcerto / diasAcerto) : null,
      totalErros: totalErros || 0,
      diasComDados,
    };
  }

  function abrirDia(dataStr) {
    const rev    = revisaoPorData[dataStr] || {};
    const trades = tradesPorData[dataStr]  || {};
    const ion2   = trades["ION 2"]  || trades["ion 2"]  || {};
    let saved = {};
    try { saved = JSON.parse(rev.resumoCurto || "{}"); } catch {}

    setPainelDia(dataStr);
    setPainelTipo("diario");
    setFormDados({
      resultadoIon2:    rev.resultadoIon2  !== undefined && rev.resultadoIon2  !== "" ? rev.resultadoIon2  : (ion2.resultado  ?? ""),
      resultadoMide2:   rev.resultadoMide2 !== undefined && rev.resultadoMide2 !== "" ? rev.resultadoMide2 : "",
      qtdOpsIon2:   saved.qtdOpsIon2  !== undefined ? saved.qtdOpsIon2  : (ion2.trades      ?? ""),
      qtdOpsMide2:  saved.qtdOpsMide2 !== undefined ? saved.qtdOpsMide2 : "",
      acertoIon2:   saved.acertoIon2  !== undefined ? saved.acertoIon2  : (ion2.taxaAcerto  ?? ""),
      acertoMide2:  saved.acertoMide2 !== undefined ? saved.acertoMide2 : "",
      errosIon2:    saved.errosIon2   !== undefined ? saved.errosIon2   : (ion2.erros  ?? ""),
      errosMide2:   saved.errosMide2  !== undefined ? saved.errosMide2  : "",
      resumoIon2:       saved.resumoIon2       ?? "",
      resumoMide2:      saved.resumoMide2      ?? "",
      revisaoDetalhada: rev.revisaoDetalhada   ?? "",
    });
    setFormDirty(false);
  }

  function abrirSemana(domStr) {
    const rev = semanasPorDom[domStr] || {};
    let saved = {};
    try { saved = JSON.parse(rev.resumoCurto || "{}"); } catch {}
    setPainelDia(domStr);
    setPainelTipo("semanal");
    setFormDados({
      resumoCurto:      saved.resumoCurto    ?? "",
      revisaoDetalhada: rev.revisaoDetalhada ?? "",
    });
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

  async function salvar() {
    setSaving(true);
    const existente = painelTipo === "diario" ? (revisaoPorData[painelDia] || null) : (semanasPorDom[painelDia] || null);
    const revisao = {
      id:              existente?.id || gerarId(),
      data:            painelDia,
      tipo:            painelTipo,
      resultadoIon2:   formDados.resultadoIon2  ?? "",
      resultadoMide2:  "",
      qtdOps:          formDados.qtdOpsIon2     ?? "",
      acerto:          formDados.acertoIon2     ?? "",
      erros:           formDados.errosIon2      ?? "",
      resumoCurto: JSON.stringify({
        qtdOpsIon2:  formDados.qtdOpsIon2  ?? "",
        acertoIon2:  formDados.acertoIon2  ?? "",
        errosIon2:   formDados.errosIon2   ?? "",
        resumoIon2:  formDados.resumoIon2  ?? "",
        resumoCurto: formDados.resumoCurto ?? "",
      }),
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
    const existente = painelTipo === "diario" ? (revisaoPorData[painelDia] || null) : (semanasPorDom[painelDia] || null);
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
    width: "100%", background: resumeBg, border: `1px solid ${border2}`,
    borderRadius: 8, color: text, padding: "9px 12px", fontSize: 13,
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: textMuted, textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: 5, display: "block",
  };
  const btnPrimary = {
    background: ACCENT, color: "#fff", border: "none", borderRadius: 8,
    padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  };
  const btnGhost = {
    background: "transparent", color: textMuted, border: `1px solid ${border2}`,
    borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
  };

  // Calcula resumo mensal ION 2 (todos os dias úteis do mês)
  function resumoMensalIon2() {
    const total = new Date(ano, mes + 1, 0).getDate();
    let totalRes = 0, totalOps = 0, somaAcerto = 0, diasAcerto = 0, totalErros = 0, diasComDados = 0;
    for (let d = 1; d <= total; d++) {
      const dataStr = isoData(ano, mes, d);
      const diaSem  = new Date(ano, mes, d).getDay();
      if (diaSem === 0 || diaSem === 6) continue;
      const trades = tradesPorData[dataStr] || {};
      const ion2   = trades["ION 2"] || trades["ion 2"] || null;
      const rev    = revisaoPorData[dataStr] || null;
      const rIon2  = parseFloat(rev?.resultadoIon2 ?? ion2?.resultado ?? "NaN");
      if (!isNaN(rIon2)) { totalRes += rIon2; diasComDados++; }
      const ops = parseFloat(ion2?.trades ?? "NaN");
      if (!isNaN(ops)) totalOps += ops;
      const ac = parseFloat(ion2?.taxaAcerto ?? "NaN");
      if (!isNaN(ac)) { somaAcerto += ac; diasAcerto++; }
      const er = parseFloat(ion2?.erros ?? "NaN");
      if (!isNaN(er)) totalErros += er;
    }
    return { totalRes, totalOps, acertoMedio: diasAcerto > 0 ? Math.round(somaAcerto / diasAcerto) : null, totalErros, diasComDados };
  }

  function renderCalendario() {
    const primeiro = new Date(ano, mes, 1).getDay();
    const total    = new Date(ano, mes + 1, 0).getDate();
    const cells    = [];

    DIAS_SEMANA.forEach((d, i) => (
      cells.push(
        <div key={`h${i}`} style={{
          textAlign: "center", fontSize: 12, fontWeight: 700,
          color: textMuted, padding: "8px 0",
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>{d}</div>
      )
    ));

    for (let i = 0; i < primeiro; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= total; d++) {
      const dataStr  = isoData(ano, mes, d);
      const diaSem   = new Date(ano, mes, d).getDay();
      const isDom    = diaSem === 0;
      const isSab    = diaSem === 6;
      const isHoje   = dataStr === hojeISO();
      const isAberto = painelDia === dataStr;

      // ── SÁBADO: card de resumo semanal ──────────────────────────────────
      if (isSab) {
        const sem = resumoSemanalIon2(dataStr);
        const temDados = sem.diasComDados > 0;
        const cores = temDados ? corResultado(sem.totalRes) : null;
        const sabBg = isDark
          ? (cores ? cores.bg : ACCENT + "08")
          : (cores ? cores.bg : ACCENT + "08");
        const sabBorder = cores ? cores.border : ACCENT + "33";

        cells.push(
          <div key={d} style={{
            background: sabBg,
            border: `2px solid ${sabBorder}`,
            borderRadius: 10,
            padding: "11px 12px 10px",
            cursor: "default",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            boxSizing: "border-box",
            overflow: "hidden",
          }}>
            {/* número + badge SEM */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: isHoje ? 800 : 600, color: isHoje ? ACCENT : textMuted }}>{d}</span>
              <span style={{
                fontSize: 9, fontWeight: 800, color: ACCENT,
                background: ACCENT + "18", borderRadius: 4, padding: "1px 6px",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>semana</span>
            </div>

            {temDados ? (
              <>
                {/* total ION 2 */}
                <div style={{ fontSize: 15, fontWeight: 800, color: cores ? cores.text : textMuted, lineHeight: 1.1, marginTop: 2 }}>
                  {fmtVal(sem.totalRes)}
                </div>
                {/* label */}
                <div style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  ION 2 · {sem.diasComDados}d
                </div>
                {/* divider */}
                <div style={{ height: 1, background: isDark ? sabBorder : "#ddd", margin: "1px 0" }} />
                {/* stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {sem.totalOps > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: textMuted }}>Ops</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: text }}>{sem.totalOps}</span>
                    </div>
                  )}
                  {sem.acertoMedio !== null && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: textMuted }}>Acerto</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: text }}>{sem.acertoMedio}%</span>
                    </div>
                  )}
                  {sem.totalErros > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: textMuted }}>Erros</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "#c05858" : "#a04040" }}>{sem.totalErros}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 10, color: textMuted, marginTop: 4, lineHeight: 1.4 }}>
                Sem dados<br/>na semana
              </div>
            )}
          </div>
        );
        continue;
      }

      // ── DOMINGO ──────────────────────────────────────────────────────────
      if (isDom) {
        const revSem = semanasPorDom[dataStr] || null;
        const temSem = !!revSem;
        const bgCard = isDom && temSem ? ACCENT + "15" : cardBg;
        const bdCard = isAberto ? ACCENT : isHoje ? ACCENT + "88" : isDom && temSem ? ACCENT + "55" : border;

        cells.push(
          <div key={d}
            onClick={() => abrirSemana(dataStr)}
            style={{
              background: isAberto ? ACCENT + "22" : bgCard,
              border: `2px solid ${bdCard}`,
              borderRadius: 10, padding: "11px 12px 10px",
              cursor: "pointer", height: "100%",
              transition: "border-color .15s, background .15s",
              display: "flex", flexDirection: "column", gap: 5,
              userSelect: "none", boxSizing: "border-box", overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: isHoje ? 800 : 600, color: isHoje ? ACCENT : textMuted }}>{d}</span>
              <span style={{
                fontSize: 9, fontWeight: 700,
                background: temSem ? ACCENT + "22" : "transparent",
                color: temSem ? ACCENT : textMuted,
                borderRadius: 4, padding: "1px 5px",
                border: temSem ? "none" : `1px dashed ${border2}`,
              }}>sem</span>
            </div>
            {isDom && temSem && (() => {
              let preview = "";
              try { preview = JSON.parse(revSem.resumoCurto || "{}").resumoCurto || ""; } catch {}
              if (!preview) preview = revSem.resumoCurto || "";
              return preview ? (
                <div style={{
                  fontSize: 10, color: textMuted, lineHeight: 1.4, marginTop: 2,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                }}>{preview}</div>
              ) : null;
            })()}
          </div>
        );
        continue;
      }

      // ── DIAS ÚTEIS (Seg–Sex) ─────────────────────────────────────────────
      const rev    = revisaoPorData[dataStr];
      const tradesHoje = tradesPorData[dataStr] || {};
      const ion2dia    = tradesHoje["ION 2"] || tradesHoje["ion 2"] || null;

      const rIon2    = parseFloat(rev?.resultadoIon2 ?? ion2dia?.resultado ?? "NaN");
      const temDados = !isNaN(rIon2);
      const semTrades = !ion2dia && !rev;
      const cores    = temDados ? corResultado(rIon2) : null;

      const bgCard  = semTrades
        ? (isDark ? "#2a2a2a" : "#e8e8e8")
        : isAberto ? ACCENT + "22" : (cores ? cores.bg : cardBg);
      const bdCard  = isAberto ? ACCENT : semTrades
        ? (isDark ? "#404040" : "#c0c0c0")
        : cores ? cores.border : isHoje ? ACCENT + "88" : border;

      const opsIon2 = ion2dia?.trades     ?? null;
      const acIon2  = ion2dia?.taxaAcerto ?? null;
      const erIon2  = ion2dia?.erros      ?? null;

      cells.push(
        <div
          key={d}
          onClick={() => abrirDia(dataStr)}
          style={{
            background: bgCard,
            border: `2px solid ${bdCard}`,
            borderRadius: 10, padding: "11px 12px 10px",
            cursor: "pointer", height: "100%",
            transition: "border-color .15s, background .15s",
            display: "flex", flexDirection: "column", gap: 5,
            userSelect: "none", boxSizing: "border-box", overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: isHoje ? 800 : 600, color: isHoje ? ACCENT : semTrades ? (isDark ? "#666" : "#999") : text }}>{d}</span>
            {semTrades ? (
              <span style={{
                fontSize: 9, fontWeight: 800,
                color: isDark ? "#666" : "#999",
                background: isDark ? "#333" : "#d4d4d4",
                borderRadius: 4, padding: "1px 5px",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>sem trades</span>
            ) : (
              rev && <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
            )}
          </div>

          {semTrades ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? "#555" : "#aaa", lineHeight: 1.2, marginTop: 2 }}>—</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "#555" : "#aaa", textTransform: "uppercase", letterSpacing: "0.04em" }}>ION 2</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? "#555" : "#aaa" }}>—</span>
              </div>
              <div style={{ height: 1, background: isDark ? "#333" : "#ccc", margin: "2px 0" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 11, color: isDark ? "#555" : "#aaa" }}>— ops · —% · — err</span>
              </div>
            </>
          ) : (
            <>
              {temDados && (
                <div style={{ fontSize: 14, fontWeight: 800, color: cores ? cores.text : textMuted, lineHeight: 1.2, marginTop: 2 }}>
                  {fmtVal(rIon2)}
                </div>
              )}

              {(ion2dia || rev) && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>ION 2</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: !isNaN(rIon2) && rIon2 >= 0 ? (isDark ? "#3daa78" : "#2e7d5a") : (isDark ? "#c05858" : "#a04040") }}>
                    {fmtVal(rIon2)}
                  </span>
                </div>
              )}

              {ion2dia && (
                <>
                  <div style={{ height: 1, background: border, margin: "2px 0" }} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {opsIon2 !== null && <span style={{ fontSize: 11, color: textMuted }}>{opsIon2} ops</span>}
                    {acIon2  !== null && <span style={{ fontSize: 11, color: textMuted }}>· {acIon2}%</span>}
                    {erIon2  > 0      && <span style={{ fontSize: 11, color: isDark ? "#c05858" : "#a04040" }}>· {erIon2} err</span>}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      );
    }

    // ── CARD MENSAL — após o último sábado ───────────────────────────────
    // Preenche células vazias até completar a linha, depois adiciona o card ocupando 7 colunas
    const totalCells = primeiro + total;
    const resto = totalCells % 7;
    if (resto !== 0) {
      for (let i = 0; i < (7 - resto); i++) cells.push(<div key={`ef${i}`} />);
    }

    const sem = resumoMensalIon2();
    const coresMes = sem.diasComDados > 0 ? corResultado(sem.totalRes) : null;
    const mesBg    = coresMes ? coresMes.bg : (isDark ? ACCENT + "08" : ACCENT + "08");
    const mesBd    = coresMes ? coresMes.border : ACCENT + "44";

    cells.push(
      <div key="card-mensal" style={{ gridColumn: "1 / -1", background: mesBg, border: `2px solid ${mesBd}`, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 140 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.07em" }}>Resumo do mês · ION 2</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: coresMes ? coresMes.text : textMuted, lineHeight: 1.1 }}>
            {sem.diasComDados > 0 ? fmtVal(sem.totalRes) : "—"}
          </span>
          <span style={{ fontSize: 11, color: textMuted }}>{sem.diasComDados} dias com trades</span>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            ["Ops", sem.totalOps > 0 ? sem.totalOps : "—"],
            ["Acerto médio", sem.acertoMedio !== null ? `${sem.acertoMedio}%` : "—"],
            ["Erros", sem.totalErros > 0 ? sem.totalErros : "—"],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: label === "Erros" && sem.totalErros > 0 ? (isDark ? "#c05858" : "#a04040") : text }}>{val}</span>
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
      ? (() => { const fim = new Date(dt); fim.setDate(dt.getDate()+6); return `Semana ${dt.getDate()}/${dt.getMonth()+1} – ${fim.getDate()}/${fim.getMonth()+1}/${fim.getFullYear()}`; })()
      : `${DIAS_SEMANA[dt.getDay()]}, ${dt.getDate()} de ${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;

    const existente = painelTipo === "diario" ? revisaoPorData[painelDia] : semanasPorDom[painelDia];

    function campo(label, key, tipo = "text", placeholder = "", rows = 3) {
      return (
        <div key={key}>
          <label style={labelStyle}>{label}</label>
          {tipo === "textarea"
            ? <textarea value={formDados[key] || ""} placeholder={placeholder} onChange={e => setField(key, e.target.value)} rows={rows} style={{ ...inputStyle, resize: "vertical" }} />
            : <input type={tipo} value={formDados[key] || ""} placeholder={placeholder} onChange={e => setField(key, e.target.value)} style={inputStyle} />
          }
        </div>
      );
    }

    function contaBlock(conta, keyResult, keyOps, keyAcerto, keyErros, keyResumo) {
      return (
        <div style={{ background: resumeBg, border: `1px solid ${border}`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{conta}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {campo("Resultado (R$)", keyResult, "number", "ex: 320")}
            {campo("Qtd ops", keyOps, "number", "ex: 5")}
            {campo("Acerto %", keyAcerto, "number", "ex: 60")}
            {campo("Erros", keyErros, "number", "ex: 2")}
          </div>
          {campo(`Resumo ${conta}`, keyResumo, "textarea", "O que funcionou? O que errou?", 2)}
        </div>
      );
    }

    return (
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(500px, 96vw)", background: cardBg, borderLeft: `1px solid ${border}`, boxShadow: "-8px 0 32px rgba(0,0,0,0.22)", zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: painelTipo === "semanal" ? ACCENT+"22" : resumeBg, color: painelTipo === "semanal" ? ACCENT : textMuted, borderRadius: 5, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {painelTipo === "semanal" ? "Revisão Semanal" : "Revisão Diária"}
              </span>
              {existente && <span style={{ fontSize: 10, color: ACCENT }}>● salvo</span>}
              {formDirty  && <span style={{ fontSize: 10, color: "#f0a04e" }}>● alterações</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{dataDisplay}</div>
          </div>
          <button onClick={fecharPainel} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 24, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {painelTipo === "diario" && (
            <>
              {contaBlock("ION 2",  "resultadoIon2",  "qtdOpsIon2",  "acertoIon2",  "errosIon2",  "resumoIon2")}
              {campo("Revisão detalhada", "revisaoDetalhada", "textarea", "Análise técnica e emocional aprofundada, lições, próximos passos...", 5)}
            </>
          )}
          {painelTipo === "semanal" && (
            <>
              {campo("Resumo da semana", "resumoCurto", "textarea", "O que funcionou? Padrão emocional identificado?", 3)}
              {campo("Revisão detalhada", "revisaoDetalhada", "textarea", "O que melhorar? Foco da semana seguinte...", 5)}
            </>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${border}`, display: "flex", gap: 10, flexShrink: 0 }}>
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
            <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 0.8, color: text, textTransform: "uppercase", marginBottom: 4 }}>Updates Operacionais</div>
            <div style={{ fontSize: 13, color: textMuted }}>Registro cronológico de ajustes e novas regras no seu operacional</div>
          </div>
          <button onClick={() => { setShowUpdateForm(v => !v); setUpdateForm({ titulo: "", descricao: "" }); }} style={{ ...btnPrimary, padding: "8px 14px", fontSize: 12, flexShrink: 0 }}>
            {showUpdateForm ? "Cancelar" : "+ Novo update"}
          </button>
        </div>

        {showUpdateForm && (
          <div style={{ background: cardBg, border: `1px solid ${ACCENT}55`, borderRadius: 12, padding: "18px 20px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Título do update</label>
              <input type="text" placeholder="ex: Regra de correção rasa pós-dia ruim" value={updateForm.titulo} onChange={e => setUpdateForm(p => ({ ...p, titulo: e.target.value }))} style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea placeholder="Descreva a regra, o contexto e como aplicar..." value={updateForm.descricao} onChange={e => setUpdateForm(p => ({ ...p, descricao: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowUpdateForm(false)} style={btnGhost}>Cancelar</button>
              <button onClick={salvarUpdate} disabled={saving || !updateForm.titulo.trim()} style={btnPrimary}>{saving ? "Salvando..." : "Salvar update"}</button>
            </div>
          </div>
        )}

        {updates.length === 0 && !showUpdateForm && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: textMuted, fontSize: 13, border: `1px dashed ${border2}`, borderRadius: 12 }}>
            Nenhum update registrado ainda.<br />
            <span style={{ fontSize: 12 }}>Clique em "+ Novo update" para registrar uma mudança no operacional.</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {updates.map(upd => {
            const isExp = expandedUpdate === upd.id;
            const dtStr = (() => {
              if (!upd.data) return "—";
              // defende contra número serial do Sheets ou string inválida
              const raw = upd.data.toString();
              if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                const dt = new Date(raw + "T12:00:00");
                return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`;
              }
              return raw;
            })();
            return (
              <div key={upd.id} style={{ background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${ACCENT}`, borderRadius: 10, overflow: "hidden" }}>
                <div onClick={() => setExpandedUpdate(isExp ? null : upd.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", cursor: "pointer", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, background: resumeBg, borderRadius: 5, padding: "2px 8px", flexShrink: 0 }}>{dtStr}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upd.titulo}</span>
                  </div>
                  <span style={{ color: textMuted, fontSize: 13, flexShrink: 0 }}>{isExp ? "▲" : "▼"}</span>
                </div>
                {isExp && (
                  <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${border}` }}>
                    {upd.descricao && <p style={{ margin: "0 0 12px", fontSize: 13, color: textSub, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{upd.descricao}</p>}
                    <button onClick={() => deletarUpdateFn(upd.id)} style={{ ...btnGhost, fontSize: 11, padding: "5px 12px", color: "#f06b6b", border: "1px solid #f06b6b44" }}>Excluir</button>
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
    <div style={{
      flex: 1, padding: "36px 40px 56px", overflowY: "auto", minWidth: 0,
      width: "100%", boxSizing: "border-box",
      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: text,
      position: "relative",
    }}>
      {painelDia && (
        <div onClick={fecharPainel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 199 }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: 0 }}>Revisões</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Registro diário e semanal. Clique num dia para ver ou editar.</p>
        </div>
        {setDark && (
          <button onClick={() => setDark(d => !d)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: `1px solid ${border2}`, background: surface, cursor: "pointer", color: textSub, fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
            {dark ? <IcoSun s={14} c={textSub}/> : <IcoMoon s={14} c={textSub}/>}
            {dark ? "Claro" : "Escuro"}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textMuted, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 14, padding: "22px 26px", boxShadow: cardShadow, border: `1px solid ${border}`, width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: text }}>{MESES[mes]} {ano}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { if (mes === 0) { setMes(11); setAno(a => a-1); } else setMes(m => m-1); }} style={{ border: `1px solid ${border2}`, background: surface, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>‹</button>
              <button onClick={() => { if (mes === 11) { setMes(0); setAno(a => a+1); } else setMes(m => m+1); }} style={{ border: `1px solid ${border2}`, background: surface, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>›</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, fontSize: 12, color: textMuted }}>
            {[["#4ecb8d","Gain (≥ +R$ 100)"],["#e0c040","Breakeven"],["#f06b6b","Loss (≤ −R$ 100)"]].map(([c,l]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: c, display: "inline-block" }} />{l}
              </span>
            ))}
            <span style={{ opacity: 0.6 }}>Dom = revisão semanal · Sáb = resumo da semana</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "170px", gap: 8, width: "100%" }}>
            {renderCalendario()}
          </div>
        </div>
      )}

      {!loading && renderUpdates()}
      {renderPainel()}
    </div>
  );
}
