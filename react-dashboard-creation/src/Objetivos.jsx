import { useState, useEffect } from "react";

const GAS_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT = "#4ecb8d";

const CATEGORIAS = ["Técnico", "Emocional", "Rotina", "Estudo"];
const CORES_SEMANA = [
  { id: "verde",    label: "Ótima",   bg: "#f0faf5", border: "#6bbf96", text: "#2e7d5a", bgDark: "#172b20", borderDark: "#2e5c40", textDark: "#3daa78" },
  { id: "amarelo",  label: "Parcial", bg: "#fafaf0", border: "#b8b06a", text: "#7a7030", bgDark: "#252210", borderDark: "#5c5010", textDark: "#b09830" },
  { id: "vermelho", label: "Fraca",   bg: "#faf0f0", border: "#c47878", text: "#a04040", bgDark: "#2b1717", borderDark: "#5c2e2e", textDark: "#c05858" },
  { id: "neutro",   label: "—",       bg: null,      border: null,      text: null,      bgDark: null,      borderDark: null,      textDark: null },
];

function gerarId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function semanaISO(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return {
    ano: d.getFullYear(),
    semana: 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7),
  };
}

function inicioSemana(ano, semana) {
  const jan4 = new Date(ano, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7;
  const inicio = new Date(jan4);
  inicio.setDate(jan4.getDate() - dayOfWeek + (semana - 1) * 7);
  return inicio;
}

function fmtSemana(ano, semana) {
  const inicio = inicioSemana(ano, semana);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  const opts = { day: "2-digit", month: "2-digit" };
  return `Semana ${semana} — ${inicio.toLocaleDateString("pt-BR", opts)} a ${fim.toLocaleDateString("pt-BR", opts)}`;
}

function gerarListaSemanas() {
  const hoje = new Date();
  const { ano, semana: semAtual } = semanaISO(hoje);
  const lista = [];
  for (let s = semAtual; s >= 1; s--) {
    lista.push({ ano, semana: s, label: fmtSemana(ano, s) });
  }
  return lista;
}

export default function Objetivos({ th }) {
  const bg        = th?.bg        || "#f4f5f7";
  const surface   = th?.surface   || "#ffffff";
  const cardBg    = th?.cardBg    || "#ffffff";
  const border    = th?.border    || "#ebebeb";
  const border2   = th?.border2   || "#e0e0e0";
  const text      = th?.text      || "#0f1117";
  const textSub   = th?.textSub   || "#4a5568";
  const textMuted = th?.textMuted || "#8a96a3";
  const resumeBg  = th?.resumeBg  || "#f8f9fa";
  const cardShadow = th?.cardShadow || "0 1px 4px rgba(0,0,0,0.06)";
  const isDark    = bg === "#1a1d23" || bg.startsWith("#1") || bg.startsWith("#0");

  const semanas = gerarListaSemanas();
  const { ano: anoAtual, semana: semAtual } = semanaISO(new Date());

  const [semSel, setSemSel]     = useState({ ano: anoAtual, semana: semAtual });
  const [dadosSem, setDadosSem] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // dados da semana selecionada
  const chave = `${semSel.ano}-S${String(semSel.semana).padStart(2, "0")}`;
  const semDados = dadosSem[chave] || { objetivos: [], cor: "neutro", comentario: "" };

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const r = await fetch(`${GAS_DIARIO}?action=lerObjetivos`).then(r => r.json());
      const mapa = {};
      (r.objetivos || []).forEach(s => { mapa[s.chave] = s; });
      setDadosSem(mapa);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function salvar(novosDados) {
    setSaving(true);
    const payload = { chave, ano: semSel.ano, semana: semSel.semana, ...novosDados };
    fetch(`${GAS_DIARIO}?action=salvarObjetivos&dados=${encodeURIComponent(JSON.stringify(payload))}`).catch(() => {});
    setDadosSem(prev => ({ ...prev, [chave]: { ...semDados, ...novosDados } }));
    setSaving(false);
  }

  function setCor(cor) { salvar({ ...semDados, cor }); }
  function setComentario(comentario) { setDadosSem(prev => ({ ...prev, [chave]: { ...semDados, comentario } })); }
  function salvarComentario() { salvar({ ...semDados }); }

  function addObjetivo() {
    const novo = { id: gerarId(), texto: "", categoria: "Técnico", feito: false, nota: "", comentario: "" };
    const obj = [...(semDados.objetivos || []), novo];
    salvar({ ...semDados, objetivos: obj });
  }

  function updateObjetivo(id, campo, valor) {
    const obj = (semDados.objetivos || []).map(o => o.id === id ? { ...o, [campo]: valor } : o);
    setDadosSem(prev => ({ ...prev, [chave]: { ...semDados, objetivos: obj } }));
  }

  function salvarObjetivo(id) {
    const obj = semDados.objetivos || [];
    salvar({ ...semDados, objetivos: obj });
  }

  function removeObjetivo(id) {
    const obj = (semDados.objetivos || []).filter(o => o.id !== id);
    salvar({ ...semDados, objetivos: obj });
  }

  function toggleFeito(id) {
    const obj = (semDados.objetivos || []).map(o => o.id === id ? { ...o, feito: !o.feito } : o);
    salvar({ ...semDados, objetivos: obj });
  }

  const corSel = CORES_SEMANA.find(c => c.id === semDados.cor) || CORES_SEMANA[3];
  const cardCorBg = isDark ? (corSel.bgDark || cardBg) : (corSel.bg || cardBg);
  const cardCorBorder = isDark ? (corSel.borderDark || border) : (corSel.border || border);
  const cardCorText = isDark ? (corSel.textDark || text) : (corSel.text || text);

  const totalObj = semDados.objetivos?.length || 0;
  const feitosObj = semDados.objetivos?.filter(o => o.feito).length || 0;

  const inputStyle = {
    background: resumeBg, border: `1px solid ${border2}`, borderRadius: 8,
    color: text, padding: "8px 12px", fontSize: 13, outline: "none",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", width: "100%", boxSizing: "border-box",
  };

  const tagColors = {
    "Técnico":  { bg: isDark ? "#1a2a3a" : "#e8f0fe", text: isDark ? "#60a5fa" : "#1a56db" },
    "Emocional":{ bg: isDark ? "#2d1a2d" : "#fce8fe", text: isDark ? "#c084fc" : "#7e22ce" },
    "Rotina":   { bg: isDark ? "#1a2a1a" : "#e8fce8", text: isDark ? "#4ade80" : "#166534" },
    "Estudo":   { bg: isDark ? "#2a2a1a" : "#fefce8", text: isDark ? "#facc15" : "#854d0e" },
  };

  return (
    <div style={{ flex: 1, padding: "36px 52px 56px", overflowY: "auto", minWidth: 0, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: text }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: 0 }}>Objetivos</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Metas semanais e acompanhamento</p>
        </div>

        {/* Dropdown de semanas */}
        <select
          value={`${semSel.ano}-${semSel.semana}`}
          onChange={e => {
            const [ano, sem] = e.target.value.split("-").map(Number);
            setSemSel({ ano, semana: sem });
          }}
          style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${border2}`, background: surface, color: text, fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
        >
          {semanas.map(s => (
            <option key={`${s.ano}-${s.semana}`} value={`${s.ano}-${s.semana}`}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textMuted, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Card principal da semana */}
          <div style={{ background: cardCorBg, border: `2px solid ${cardCorBorder}`, borderRadius: 14, padding: "24px 28px", boxShadow: cardShadow }}>

            {/* Topo do card */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: text }}>
                  {fmtSemana(semSel.ano, semSel.semana)}
                </span>
                {totalObj > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: feitosObj === totalObj ? ACCENT : textMuted, background: resumeBg, padding: "2px 10px", borderRadius: 20, border: `1px solid ${border}` }}>
                    {feitosObj}/{totalObj} feitos
                  </span>
                )}
              </div>

              {/* Seletor de cor */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: textMuted, marginRight: 4 }}>Semana:</span>
                {CORES_SEMANA.filter(c => c.id !== "neutro").map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCor(semDados.cor === c.id ? "neutro" : c.id)}
                    title={c.label}
                    style={{
                      width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isDark ? c.borderDark : c.border}`,
                      background: isDark ? c.bgDark : c.bg, cursor: "pointer",
                      outline: semDados.cor === c.id ? `2px solid ${text}` : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Lista de objetivos */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {(semDados.objetivos || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: textMuted, fontSize: 13, border: `1px dashed ${border2}`, borderRadius: 10 }}>
                  Nenhum objetivo ainda. Clique em "+ Objetivo" para adicionar.
                </div>
              )}

              {(semDados.objetivos || []).map(obj => (
                <div key={obj.id} style={{ background: isDark ? "#1e222a" : "#fff", border: `1px solid ${border}`, borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Linha principal */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Checkbox */}
                    <div
                      onClick={() => toggleFeito(obj.id)}
                      style={{
                        width: 18, height: 18, borderRadius: 5, border: `2px solid ${obj.feito ? ACCENT : border2}`,
                        background: obj.feito ? ACCENT : "transparent", cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {obj.feito && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>

                    {/* Tag categoria */}
                    <select
                      value={obj.categoria}
                      onChange={e => updateObjetivo(obj.id, "categoria", e.target.value)}
                      onBlur={() => salvarObjetivo(obj.id)}
                      style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "none", cursor: "pointer", outline: "none", fontFamily: "inherit", background: tagColors[obj.categoria]?.bg, color: tagColors[obj.categoria]?.text, flexShrink: 0 }}
                    >
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Texto do objetivo */}
                    <input
                      value={obj.texto}
                      onChange={e => updateObjetivo(obj.id, "texto", e.target.value)}
                      onBlur={() => salvarObjetivo(obj.id)}
                      placeholder="Descreva o objetivo..."
                      style={{ ...inputStyle, flex: 1, textDecoration: obj.feito ? "line-through" : "none", color: obj.feito ? textMuted : text }}
                    />

                    {/* Nota */}
                    <input
                      type="number" min="1" max="10"
                      value={obj.nota}
                      onChange={e => updateObjetivo(obj.id, "nota", e.target.value)}
                      onBlur={() => salvarObjetivo(obj.id)}
                      placeholder="Nota"
                      style={{ ...inputStyle, width: 64, textAlign: "center" }}
                    />

                    {/* Remover */}
                    <button
                      onClick={() => removeObjetivo(obj.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 18, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}
                    >×</button>
                  </div>

                  {/* Comentário do objetivo */}
                  <input
                    value={obj.comentario || ""}
                    onChange={e => updateObjetivo(obj.id, "comentario", e.target.value)}
                    onBlur={() => salvarObjetivo(obj.id)}
                    placeholder="Comentário sobre este objetivo..."
                    style={{ ...inputStyle, fontSize: 12, color: textMuted }}
                  />
                </div>
              ))}
            </div>

            {/* Botão adicionar */}
            <button
              onClick={addObjetivo}
              style={{ background: "none", border: `1px dashed ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, width: "100%" }}
            >
              + Objetivo
            </button>

            {/* Comentário geral da semana */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, display: "block" }}>
                Comentário geral da semana
              </label>
              <textarea
                value={semDados.comentario || ""}
                onChange={e => setComentario(e.target.value)}
                onBlur={salvarComentario}
                placeholder="Como foi a semana? O que funcionou? O que melhorar?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>

          {/* Resumo rápido */}
          {totalObj > 0 && (
            <div style={{ display: "flex", gap: 12 }}>
              {CATEGORIAS.map(cat => {
                const catObjs = (semDados.objetivos || []).filter(o => o.categoria === cat);
                if (catObjs.length === 0) return null;
                const feitos = catObjs.filter(o => o.feito).length;
                const notaMedia = catObjs.filter(o => o.nota).length > 0
                  ? Math.round(catObjs.filter(o => o.nota).reduce((s, o) => s + Number(o.nota), 0) / catObjs.filter(o => o.nota).length * 10) / 10
                  : null;
                return (
                  <div key={cat} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 16px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: tagColors[cat]?.text, background: tagColors[cat]?.bg, borderRadius: 20, padding: "2px 10px", display: "inline-block", marginBottom: 8 }}>{cat}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: feitos === catObjs.length ? ACCENT : text }}>{feitos}/{catObjs.length}</div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{notaMedia !== null ? `Nota média: ${notaMedia}` : "Sem nota"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
