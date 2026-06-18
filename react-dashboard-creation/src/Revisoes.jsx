import { useState, useEffect, useCallback } from "react";

const GAS_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT = "#4ecb8d";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function gerarId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function fmtBRL(val) {
  const n = parseFloat(val);
  if (isNaN(n) || val === "" || val === null || val === undefined) return null;
  return (n >= 0 ? "+" : "−") + "R$ " + Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function corResultado(total) {
  if (total === null || total === undefined || total === "") return null;
  const n = parseFloat(total);
  if (isNaN(n)) return null;
  if (n >= 100)  return { bg: "#1a3a28", border: "#2d6b4f", text: "#4ecb8d" };
  if (n <= -100) return { bg: "#3a1a1a", border: "#6b2d2d", text: "#f06b6b" };
  return { bg: "#2d2a14", border: "#6b5c00", text: "#e0c040" };
}

export default function Revisoes({ th }) {
  // ── tema: usa exatamente os tokens do App.jsx ─────────────────────────────
  const bg        = th?.bg       || "#f4f5f7";
  const surface   = th?.surface  || "#ffffff";
  const cardBg    = th?.cardBg   || "#ffffff";
  const border    = th?.border   || "#ebebeb";
  const border2   = th?.border2  || "#e0e0e0";
  const text      = th?.text     || "#0f1117";
  const textSub   = th?.textSub  || "#4a5568";
  const textMuted = th?.textMuted|| "#8a96a3";
  const resumeBg  = th?.resumeBg || "#f8f9fa";
  const cardShadow= th?.cardShadow|| "0 1px 4px rgba(0,0,0,0.06)";

  // ── state ──────────────────────────────────────────────────────────────────
  const [ano, setAno]     = useState(new Date().getFullYear());
  const [mes, setMes]     = useState(new Date().getMonth());
  const [revisoes, setRevisoes] = useState([]);
  const [updates,  setUpdates]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const [painelDia,  setPainelDia]  = useState(null);
  const [painelTipo, setPainelTipo] = useState("diario");
  const [formDados,  setFormDados]  = useState({});
  const [formDirty,  setFormDirty]  = useState(false);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm,     setUpdateForm]     = useState({ titulo: "", descricao: "" });
  const [expandedUpdate, setExpandedUpdate] = useState(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [rRev, rUpd] = await Promise.all([
        fetch(`${GAS_DIARIO}?action=lerRevisoes`).then(r => r.json()),
        fetch(`${GAS_DIARIO}?action=lerUpdates`).then(r => r.json()),
      ]);
      setRevisoes(rRev.revisoes || []);
      setUpdates(rUpd.updates   || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── índices rápidos ────────────────────────────────────────────────────────
  const revisaoPorData = {};
  revisoes.forEach(r => { revisaoPorData[r.data] = r; });
  const semanasPorDom = {};
  revisoes.filter(r => r.tipo === "semanal").forEach(r => { semanasPorDom[r.data] = r; });

  // ── calendário ─────────────────────────────────────────────────────────────
  function isoData(a, m, d) {
    return `${a}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }
  function domingoSemana(a, m, d) {
    const dt = new Date(a, m, d);
    const dom = new Date(dt);
    dom.setDate(dt.getDate() - dt.getDay());
    return `${dom.getFullYear()}-${String(dom.getMonth()+1).padStart(2,"0")}-${String(dom.getDate()).padStart(2,"0")}`;
  }

  // ── abrir painel ───────────────────────────────────────────────────────────
  function abrirDia(dataStr) {
    const rev = revisaoPorData[dataStr] || {};
    setPainelDia(dataStr);
    setPainelTipo("diario");
    setFormDados({
      resultadoIon2:      rev.resultadoIon2    ?? "",
      resultadoMide2:     rev.resultadoMide2   ?? "",
      qtdOpsIon2:         rev.qtdOpsIon2       ?? "",
      qtdOpsMide2:        rev.qtdOpsMide2      ?? "",
      acertoIon2:         rev.acertoIon2       ?? "",
      acertoMide2:        rev.acertoMide2      ?? "",
      errosIon2:          rev.errosIon2        ?? "",
      errosMide2:         rev.errosMide2       ?? "",
      resumoIon2:         rev.resumoIon2       ?? "",
      resumoMide2:        rev.resumoMide2      ?? "",
      revisaoDetalhada:   rev.revisaoDetalhada ?? "",
    });
    setFormDirty(false);
  }

  function abrirSemana(domStr) {
    const rev = semanasPorDom[domStr] || {};
    setPainelDia(domStr);
    setPainelTipo("semanal");
    setFormDados({
      resumoCurto:      rev.resumoCurto      ?? "",
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

  // ── salvar revisão ─────────────────────────────────────────────────────────
  async function salvar() {
    setSaving(true);
    const existente = painelTipo === "diario"
      ? (revisaoPorData[painelDia] || null)
      : (semanasPorDom[painelDia]  || null);

    // Para compatibilidade com o GAS que usa campos antigos,
    // mapeamos os campos novos mantendo os legados também
    const revisao = {
      id:   existente?.id || gerarId(),
      data: painelDia,
      tipo: painelTipo,
      resultadoIon2:    formDados.resultadoIon2    ?? "",
      resultadoMide2:   formDados.resultadoMide2   ?? "",
      qtdOps:           formDados.qtdOpsIon2       ?? "", // col legada = ION2
      acerto:           formDados.acertoIon2       ?? "",
      erros:            formDados.errosIon2        ?? "",
      // campos extras no resumo_curto e revisao_detalhada como JSON
      resumoCurto:      JSON.stringify({
        qtdOpsIon2:   formDados.qtdOpsIon2   ?? "",
        qtdOpsMide2:  formDados.qtdOpsMide2  ?? "",
        acertoIon2:   formDados.acertoIon2   ?? "",
        acertoMide2:  formDados.acertoMide2  ?? "",
        errosIon2:    formDados.errosIon2    ?? "",
        errosMide2:   formDados.errosMide2   ?? "",
        resumoIon2:   formDados.resumoIon2   ?? "",
        resumoMide2:  formDados.resumoMide2  ?? "",
        // semanal
        resumoCurto:  formDados.resumoCurto  ?? "",
      }),
      revisaoDetalhada: formDados.revisaoDetalhada ?? "",
    };

    try {
      await fetch(GAS_DIARIO, {
        method: "POST",
        body: JSON.stringify({ action: "salvarRevisao", revisao }),
      });
      await carregar();
      setFormDirty(false);
    } catch(e) { alert("Erro ao salvar. Tente novamente."); }
    setSaving(false);
  }

  async function deletar() {
    const existente = painelTipo === "diario"
      ? (revisaoPorData[painelDia] || null)
      : (semanasPorDom[painelDia]  || null);
    if (!existente) return;
    if (!window.confirm("Excluir esta revisão?")) return;
    setSaving(true);
    try {
      await fetch(GAS_DIARIO, {
        method: "POST",
        body: JSON.stringify({ action: "deletarRevisao", id: existente.id }),
      });
      await carregar();
      setPainelDia(null);
    } catch(e) { alert("Erro ao excluir."); }
    setSaving(false);
  }

  // helper: extrai campos extras do resumoCurto (JSON)
  function extrairMeta(rev) {
    if (!rev) return {};
    try { return JSON.parse(rev.resumoCurto || "{}"); } catch { return {}; }
  }

  // ── updates operacionais ────────────────────────────────────────────────────
  async function salvarUpdate() {
    if (!updateForm.titulo.trim()) return;
    setSaving(true);
    const upd = { id: gerarId(), data: hoje(), titulo: updateForm.titulo.trim(), descricao: updateForm.descricao.trim() };
    try {
      await fetch(GAS_DIARIO, { method: "POST", body: JSON.stringify({ action: "salvarUpdate", update: upd }) });
      await carregar();
      setUpdateForm({ titulo: "", descricao: "" });
      setShowUpdateForm(false);
    } catch(e) { alert("Erro ao salvar update."); }
    setSaving(false);
  }

  async function deletarUpdateFn(id) {
    if (!window.confirm("Excluir este update?")) return;
    try {
      await fetch(GAS_DIARIO, { method: "POST", body: JSON.stringify({ action: "deletarUpdate", id }) });
      await carregar();
    } catch(e) { alert("Erro ao excluir."); }
  }

  // ── estilos reutilizáveis ─────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", background: resumeBg, border: `1px solid ${border2}`,
    borderRadius: 8, color: text, padding: "9px 12px", fontSize: 13,
    outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
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

  // ── render: grade do calendário ───────────────────────────────────────────
  function renderCalendario() {
    const primeiro = new Date(ano, mes, 1).getDay();
    const total    = new Date(ano, mes + 1, 0).getDate();
    const cells    = [];

    // cabeçalho
    DIAS_SEMANA.forEach((d, i) => {
      cells.push(
        <div key={`h${i}`} style={{
          textAlign: "center", fontSize: 11, fontWeight: 700,
          color: textMuted, padding: "6px 0",
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>{d}</div>
      );
    });

    // células vazias
    for (let i = 0; i < primeiro; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= total; d++) {
      const dataStr = isoData(ano, mes, d);
      const diaSem  = new Date(ano, mes, d).getDay();
      const isDom   = diaSem === 0;
      const isSab   = diaSem === 6;
      const isHoje  = dataStr === hoje();
      const rev     = revisaoPorData[dataStr];
      const isAberto= painelDia === dataStr;

      const revSem  = isDom ? semanasPorDom[dataStr] : null;
      const temRev  = !!rev;
      const temSem  = !!revSem;

      // calcular total e cor de fundo
      const rIon2  = parseFloat(rev?.resultadoIon2)  || 0;
      const rMide2 = parseFloat(rev?.resultadoMide2) || 0;
      const total_ = rIon2 + rMide2;
      const cores  = temRev ? corResultado(total_) : null;

      // domingo não tem resultado financeiro, só revisão semanal
      const bgCard = isDom
        ? (temSem ? (ACCENT + "12") : cardBg)
        : (cores ? cores.bg : cardBg);
      const bdCard = isDom
        ? (temSem ? ACCENT + "55" : border)
        : (cores ? cores.border : isHoje ? ACCENT + "88" : border);

      cells.push(
        <div
          key={d}
          onClick={() => {
            if (isSab) return;
            if (isDom) abrirSemana(dataStr);
            else abrirDia(dataStr);
          }}
          style={{
            position: "relative",
            background: isAberto ? (ACCENT + "22") : bgCard,
            border: `1px solid ${isAberto ? ACCENT : bdCard}`,
            borderRadius: 10,
            padding: "10px 10px 9px",
            cursor: isSab ? "default" : "pointer",
            minHeight: 92,
            transition: "border-color .15s, background .15s",
            opacity: isSab ? 0.35 : 1,
            display: "flex",
            flexDirection: "column",
            gap: 5,
            userSelect: "none",
          }}
        >
          {/* número do dia + dot */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 12, fontWeight: isHoje ? 800 : 600,
              color: isHoje ? ACCENT : isDom ? textMuted : text,
            }}>{d}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {temRev && !isDom && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
              )}
              {isDom && (
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  background: temSem ? (ACCENT + "22") : "transparent",
                  color: temSem ? ACCENT : textMuted,
                  borderRadius: 4, padding: "1px 5px",
                  border: temSem ? "none" : `1px dashed ${border2}`,
                }}>sem</span>
              )}
            </div>
          </div>

          {/* resultado financeiro total */}
          {temRev && !isDom && (
            <div style={{
              fontSize: 13, fontWeight: 800,
              color: cores ? cores.text : textMuted,
              lineHeight: 1.1,
            }}>
              {fmtBRL(total_) || "R$ 0"}
            </div>
          )}

          {/* linha ION 2 */}
          {temRev && !isDom && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>ION 2</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: parseFloat(rev.resultadoIon2) >= 0 ? "#4ecb8d" : "#f06b6b" }}>
                  {fmtBRL(rev.resultadoIon2) || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>MIDE 2</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: parseFloat(rev.resultadoMide2) >= 0 ? "#4ecb8d" : "#f06b6b" }}>
                  {fmtBRL(rev.resultadoMide2) || "—"}
                </span>
              </div>
            </div>
          )}

          {/* domingo: preview semanal */}
          {isDom && temSem && (() => {
            const meta = extrairMeta(revSem);
            const preview = meta.resumoCurto || revSem.resumoCurto || "";
            return preview ? (
              <div style={{
                fontSize: 9, color: textMuted, lineHeight: 1.4, marginTop: 2,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              }}>{preview}</div>
            ) : null;
          })()}
        </div>
      );
    }
    return cells;
  }

  // ── render: painel lateral ────────────────────────────────────────────────
  function renderPainel() {
    if (!painelDia) return null;

    const dt = new Date(painelDia + "T12:00:00");
    const dataDisplay = painelTipo === "semanal"
      ? (() => {
          const fim = new Date(dt); fim.setDate(dt.getDate() + 6);
          return `Semana ${dt.getDate()}/${dt.getMonth()+1} – ${fim.getDate()}/${fim.getMonth()+1}/${fim.getFullYear()}`;
        })()
      : `${DIAS_SEMANA[dt.getDay()]}, ${dt.getDate()} de ${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;

    const existente = painelTipo === "diario"
      ? revisaoPorData[painelDia]
      : semanasPorDom[painelDia];

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

    // bloco por conta: resultado + ops + acerto + erros + resumo
    function contaBlock(conta, keyResult, keyOps, keyAcerto, keyErros, keyResumo) {
      return (
        <div style={{
          background: resumeBg, border: `1px solid ${border}`,
          borderRadius: 10, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {conta}
          </div>
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
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(500px, 96vw)",
        background: cardBg, borderLeft: `1px solid ${border}`,
        boxShadow: "-8px 0 32px rgba(0,0,0,0.22)",
        zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: `1px solid ${border}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: painelTipo === "semanal" ? ACCENT + "22" : resumeBg,
                color: painelTipo === "semanal" ? ACCENT : textMuted,
                borderRadius: 5, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.07em",
              }}>
                {painelTipo === "semanal" ? "Revisão Semanal" : "Revisão Diária"}
              </span>
              {existente && <span style={{ fontSize: 10, color: ACCENT }}>● salvo</span>}
              {formDirty  && <span style={{ fontSize: 10, color: "#f0a04e" }}>● alterações</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{dataDisplay}</div>
          </div>
          <button onClick={fecharPainel} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 24, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
        </div>

        {/* corpo */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {painelTipo === "diario" && (
            <>
              {contaBlock("ION 2",  "resultadoIon2",  "qtdOpsIon2",  "acertoIon2",  "errosIon2",  "resumoIon2")}
              {contaBlock("MIDE 2", "resultadoMide2", "qtdOpsMide2", "acertoMide2", "errosMide2", "resumoMide2")}
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

        {/* footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${border}`,
          display: "flex", gap: 10, flexShrink: 0,
        }}>
          <button onClick={salvar} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {existente && (
            <button onClick={deletar} disabled={saving} style={{ ...btnGhost, color: "#f06b6b", border: "1px solid #f06b6b44" }}>
              Excluir
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── render: updates operacionais ──────────────────────────────────────────
  function renderUpdates() {
    return (
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 0.8, color: text, textTransform: "uppercase", marginBottom: 4 }}>
              Updates Operacionais
            </div>
            <div style={{ fontSize: 13, color: textMuted }}>
              Registro cronológico de ajustes e novas regras no seu operacional
            </div>
          </div>
          <button
            onClick={() => { setShowUpdateForm(v => !v); setUpdateForm({ titulo: "", descricao: "" }); }}
            style={{ ...btnPrimary, padding: "8px 14px", fontSize: 12, flexShrink: 0 }}
          >
            {showUpdateForm ? "Cancelar" : "+ Novo update"}
          </button>
        </div>

        {showUpdateForm && (
          <div style={{
            background: cardBg, border: `1px solid ${ACCENT}55`, borderRadius: 12,
            padding: "18px 20px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div>
              <label style={labelStyle}>Título do update</label>
              <input type="text" placeholder="ex: Regra de correção rasa pós-dia ruim" value={updateForm.titulo}
                onChange={e => setUpdateForm(p => ({ ...p, titulo: e.target.value }))} style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea placeholder="Descreva a regra, o contexto que gerou essa mudança e como aplicar..."
                value={updateForm.descricao} onChange={e => setUpdateForm(p => ({ ...p, descricao: e.target.value }))}
                rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowUpdateForm(false)} style={btnGhost}>Cancelar</button>
              <button onClick={salvarUpdate} disabled={saving || !updateForm.titulo.trim()} style={btnPrimary}>
                {saving ? "Salvando..." : "Salvar update"}
              </button>
            </div>
          </div>
        )}

        {updates.length === 0 && !showUpdateForm && (
          <div style={{
            textAlign: "center", padding: "40px 20px", color: textMuted, fontSize: 13,
            border: `1px dashed ${border2}`, borderRadius: 12,
          }}>
            Nenhum update registrado ainda.<br />
            <span style={{ fontSize: 12 }}>Clique em "+ Novo update" para registrar uma mudança no seu operacional.</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {updates.map(upd => {
            const isExp = expandedUpdate === upd.id;
            const dt = new Date(upd.data + "T12:00:00");
            const dtStr = `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`;
            return (
              <div key={upd.id} style={{
                background: cardBg, border: `1px solid ${border}`,
                borderLeft: `3px solid ${ACCENT}`, borderRadius: 10, overflow: "hidden",
              }}>
                <div onClick={() => setExpandedUpdate(isExp ? null : upd.id)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 16px", cursor: "pointer", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: textMuted, background: resumeBg,
                      borderRadius: 5, padding: "2px 8px", flexShrink: 0,
                    }}>{dtStr}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {upd.titulo}
                    </span>
                  </div>
                  <span style={{ color: textMuted, fontSize: 13, flexShrink: 0 }}>{isExp ? "▲" : "▼"}</span>
                </div>
                {isExp && (
                  <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${border}`, paddingTop: 12 }}>
                    {upd.descricao && (
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: textSub, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {upd.descricao}
                      </p>
                    )}
                    <button onClick={() => deletarUpdateFn(upd.id)}
                      style={{ ...btnGhost, fontSize: 11, padding: "5px 12px", color: "#f06b6b", border: "1px solid #f06b6b44" }}>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── render principal ──────────────────────────────────────────────────────
  return (
    <main style={{
      flex: 1, padding: "36px 52px 56px", overflowY: "auto", minWidth: 0,
      fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: text,
      position: "relative",
    }}>
      {/* overlay */}
      {painelDia && (
        <div onClick={fecharPainel} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 199,
        }} />
      )}

      {/* cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: 0 }}>Revisões</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>
            Registro diário e semanal das operações. Clique num dia para registrar.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textMuted, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 14, padding: "22px 26px", boxShadow: cardShadow, border: `1px solid ${border}` }}>
          {/* navegação mês */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: text }}>{MESES[mes]} {ano}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { if (mes === 0) { setMes(11); setAno(a => a-1); } else setMes(m => m-1); }}
                style={{ border: `1px solid ${border2}`, background: surface, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>‹</button>
              <button onClick={() => { if (mes === 11) { setMes(0); setAno(a => a+1); } else setMes(m => m+1); }}
                style={{ border: `1px solid ${border2}`, background: surface, borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: text }}>›</button>
            </div>
          </div>

          {/* legenda */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 11, color: textMuted }}>
            {[["#4ecb8d","Gain (+R$ 100)"],["#e0c040","Breakeven"],["#f06b6b","Loss (−R$ 100)"]].map(([c,l]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: c, display: "inline-block" }} />{l}
              </span>
            ))}
            <span style={{ opacity: 0.6 }}>Dom = revisão semanal</span>
          </div>

          {/* grade */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {renderCalendario()}
          </div>
        </div>
      )}

      {!loading && renderUpdates()}
      {renderPainel()}
    </main>
  );
}
