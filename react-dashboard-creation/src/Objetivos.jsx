import { useState, useEffect } from "react";

const GAS_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT = "#4ecb8d";
const IcoMoon = ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IcoSun  = ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;

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

export default function Objetivos({ th, dark, setDark }) {
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

  const [semSel, setSemSel]       = useState({ ano: anoAtual, semana: semAtual });
  const [dadosSem, setDadosSem]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [expandidos, setExpandidos] = useState({});

  const chaveAtual = `${semSel.ano}-S${String(semSel.semana).padStart(2, "0")}`;
  const semDados = dadosSem[chaveAtual] || { objetivos: [], cor: "neutro", comentario: "" };

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
    const payload = { chave: chaveAtual, ano: semSel.ano, semana: semSel.semana, ...novosDados };
    fetch(`${GAS_DIARIO}?action=salvarObjetivos&dados=${encodeURIComponent(JSON.stringify(payload))}`).catch(() => {});
    setDadosSem(prev => ({ ...prev, [chaveAtual]: { ...semDados, ...novosDados } }));
    setSaving(false);
  }

  function setCor(cor) { salvar({ ...semDados, cor }); }
  function setComentario(comentario) { setDadosSem(prev => ({ ...prev, [chaveAtual]: { ...semDados, comentario } })); }
  function salvarComentario() { salvar({ ...semDados }); }

  function addObjetivo() {
    const novo = { id: gerarId(), texto: "", categoria: "Técnico", feito: false, nota: "", comentario: "" };
    const obj = [...(semDados.objetivos || []), novo];
    salvar({ ...semDados, objetivos: obj });
  }

  function updateObjetivo(id, campo, valor) {
    const obj = (semDados.objetivos || []).map(o => o.id === id ? { ...o, [campo]: valor } : o);
    setDadosSem(prev => ({ ...prev, [chaveAtual]: { ...semDados, objetivos: obj } }));
  }

  function salvarObjetivo() {
    salvar({ ...semDados });
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

  const tagColors = {
    "Técnico":  { bg: isDark ? "#1a2a3a" : "#e8f0fe", text: isDark ? "#60a5fa" : "#1a56db" },
    "Emocional":{ bg: isDark ? "#2d1a2d" : "#fce8fe", text: isDark ? "#c084fc" : "#7e22ce" },
    "Rotina":   { bg: isDark ? "#1a2a1a" : "#e8fce8", text: isDark ? "#4ade80" : "#166534" },
    "Estudo":   { bg: isDark ? "#2a2a1a" : "#fefce8", text: isDark ? "#facc15" : "#854d0e" },
  };

  const inputStyle = {
    background: resumeBg, border: `1px solid ${border2}`, borderRadius: 8,
    color: text, padding: "8px 12px", fontSize: 13, outline: "none",
    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", width: "100%", boxSizing: "border-box",
  };

  function renderCardEdicao() {
    const totalObj = semDados.objetivos?.length || 0;
    const feitosObj = semDados.objetivos?.filter(o => o.feito).length || 0;

    return (
      <div style={{ background: cardCorBg, border: `2px solid ${cardCorBorder}`, borderRadius: 14, padding: "24px 28px", boxShadow: cardShadow, marginBottom: 16 }}>
        {/* Topo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: text }}>{fmtSemana(semSel.ano, semSel.semana)}</span>
            {totalObj > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: feitosObj === totalObj ? ACCENT : textMuted, background: resumeBg, padding: "2px 10px", borderRadius: 20, border: `1px solid ${border}` }}>
                {feitosObj}/{totalObj} feitos
              </span>
            )}
            {saving && <span style={{ fontSize: 11, color: textMuted }}>Salvando…</span>}
          </div>
          {/* Seletor de cor */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: textMuted, marginRight: 4 }}>Semana:</span>
            {CORES_SEMANA.filter(c => c.id !== "neutro").map(c => (
              <button key={c.id} onClick={() => setCor(semDados.cor === c.id ? "neutro" : c.id)} title={c.label}
                style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isDark ? c.borderDark : c.border}`, background: isDark ? c.bgDark : c.bg, cursor: "pointer", outline: semDados.cor === c.id ? `2px solid ${text}` : "none", outlineOffset: 2 }}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => toggleFeito(obj.id)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${obj.feito ? ACCENT : border2}`, background: obj.feito ? ACCENT : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {obj.feito && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <select value={obj.categoria} onChange={e => updateObjetivo(obj.id, "categoria", e.target.value)} onBlur={salvarObjetivo}
                  style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "none", cursor: "pointer", outline: "none", fontFamily: "inherit", background: tagColors[obj.categoria]?.bg, color: tagColors[obj.categoria]?.text, flexShrink: 0 }}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={obj.texto} onChange={e => updateObjetivo(obj.id, "texto", e.target.value)} onBlur={salvarObjetivo}
                  placeholder="Descreva o objetivo..."
                  style={{ ...inputStyle, flex: 1, textDecoration: obj.feito ? "line-through" : "none", color: obj.feito ? textMuted : text }} />
                <input type="number" min="1" max="10" value={obj.nota} onChange={e => updateObjetivo(obj.id, "nota", e.target.value)} onBlur={salvarObjetivo}
                  placeholder="Nota"
                  style={{ ...inputStyle, width: 64, textAlign: "center" }} />
                <button onClick={() => removeObjetivo(obj.id)} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 18, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
              </div>
              <input value={obj.comentario || ""} onChange={e => updateObjetivo(obj.id, "comentario", e.target.value)} onBlur={salvarObjetivo}
                placeholder="Comentário sobre este objetivo..."
                style={{ ...inputStyle, fontSize: 12, color: textMuted }} />
            </div>
          ))}
        </div>

        <button onClick={addObjetivo} style={{ background: "none", border: `1px dashed ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, width: "100%" }}>
          + Objetivo
        </button>

        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, display: "block" }}>Comentário geral da semana</label>
          <textarea value={semDados.comentario || ""} onChange={e => setComentario(e.target.value)} onBlur={salvarComentario}
            placeholder="Como foi a semana? O que funcionou? O que melhorar?"
            rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>
    );
  }

  function renderCardVisualizacao(chave, dados) {
    if (!dados) return null;
    const cor = CORES_SEMANA.find(c => c.id === dados.cor) || CORES_SEMANA[3];
    const bgC = isDark ? (cor.bgDark || cardBg) : (cor.bg || cardBg);
    const bdC = isDark ? (cor.borderDark || border) : (cor.border || border);
    const txtC = isDark ? (cor.textDark || textMuted) : (cor.text || textMuted);
    const total = dados.objetivos?.length || 0;
    const feitos = dados.objetivos?.filter(o => o.feito).length || 0;
    const isOpen = expandidos[chave];

    // parse chave: "2026-S25" → ano 2026, semana 25
    const [ano, semStr] = chave.split("-S");
    const semana = parseInt(semStr);

    return (
      <div key={chave} style={{ background: bgC, border: `2px solid ${bdC}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", boxShadow: cardShadow }}>
        {/* Header colapsável */}
        <div onClick={() => setExpandidos(p => ({ ...p, [chave]: !p[chave] }))}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", cursor: "pointer", userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {cor.id !== "neutro" && (
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: isDark ? cor.borderDark : cor.border, display: "inline-block", flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{fmtSemana(Number(ano), semana)}</span>
            {total > 0 && (
              <span style={{ fontSize: 11, color: feitos === total ? ACCENT : textMuted, background: resumeBg, padding: "1px 8px", borderRadius: 20, border: `1px solid ${border}` }}>
                {feitos}/{total} feitos
              </span>
            )}
            {cor.id !== "neutro" && (
              <span style={{ fontSize: 11, fontWeight: 600, color: txtC }}>{cor.label}</span>
            )}
          </div>
          <span style={{ color: textMuted, fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
        </div>

        {/* Conteúdo expandido — só visualização */}
        {isOpen && (
          <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${bdC}` }}>
            {total === 0 && (
              <div style={{ color: textMuted, fontSize: 13, padding: "12px 0" }}>Nenhum objetivo registrado.</div>
            )}
            {(dados.objetivos || []).map(obj => (
              <div key={obj.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${obj.feito ? ACCENT : border2}`, background: obj.feito ? ACCENT : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {obj.feito && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: obj.comentario ? 4 : 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: tagColors[obj.categoria]?.bg, color: tagColors[obj.categoria]?.text }}>{obj.categoria}</span>
                    <span style={{ fontSize: 13, color: obj.feito ? textMuted : text, textDecoration: obj.feito ? "line-through" : "none" }}>{obj.texto || "—"}</span>
                    {obj.nota && <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700, marginLeft: "auto" }}>Nota: {obj.nota}</span>}
                  </div>
                  {obj.comentario && <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{obj.comentario}</div>}
                </div>
              </div>
            ))}
            {dados.comentario && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: resumeBg, borderRadius: 8, fontSize: 13, color: textSub, fontStyle: "italic" }}>
                {dados.comentario}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Semanas com dados registrados, ordenadas da mais recente pra mais antiga
  const semanasComDados = Object.keys(dadosSem)
    .filter(k => k !== chaveAtual)
    .sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ flex: 1, padding: "36px 52px 56px", overflowY: "auto", minWidth: 0, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", color: text }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: 0 }}>Objetivos</h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "4px 0 0" }}>Metas semanais e acompanhamento</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {setDark && (
            <button onClick={() => setDark(d => !d)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: `1px solid ${border2}`, background: surface, cursor: "pointer", color: textSub, fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
              {dark ? <IcoSun s={14} c={textSub}/> : <IcoMoon s={14} c={textSub}/>}
              {dark ? "Claro" : "Escuro"}
            </button>
          )}
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
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textMuted, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div>
          {/* Card de edição — semana selecionada */}
          {renderCardEdicao()}

          {/* Histórico — cards colapsáveis */}
          {semanasComDados.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Histórico</div>
              {semanasComDados.map(chave => renderCardVisualizacao(chave, dadosSem[chave]))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
