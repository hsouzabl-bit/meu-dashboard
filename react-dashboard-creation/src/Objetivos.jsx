import { useState, useEffect } from "react";

const GAS_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT_LIGHT = "#2563EB";
const ACCENT_DARK  = "#38BDF8";

function fetchComRetryObj(url, tentativas=3, delayMs=1200){
  return fetch(url)
    .then(r=>{ if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err=>{
      if(tentativas<=1) throw err;
      return new Promise(resolve=>setTimeout(resolve, delayMs))
        .then(()=>fetchComRetryObj(url, tentativas-1, delayMs));
    });
}

const CATEGORIAS = ["Técnico", "Emocional", "Rotina", "Estudo"];
const CORES_SEMANA = [
  { id: "verde",    label: "Ótima",   bg: "#f0faf5", border: "#6bbf96", text: "#2e7d5a", bgDark: "#1e2f28", borderDark: "#3f7359", textDark: "#5cc294" },
  { id: "amarelo",  label: "Parcial", bg: "#fafaf0", border: "#b8b06a", text: "#7a7030", bgDark: "#2d2a1c", borderDark: "#736a35", textDark: "#ccb85c" },
  { id: "vermelho", label: "Fraca",   bg: "#faf0f0", border: "#c47878", text: "#a04040", bgDark: "#2f2020", borderDark: "#7a4040", textDark: "#d97b7b" },
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

  // usa a flag do próprio tema quando disponível (12 temas), com fallback pela cor de fundo
  const isDark = th?.dark ?? (bg === "#1a1d23" || bg.startsWith("#1") || bg.startsWith("#0"));
  // acompanha o accent do tema selecionado; cai no padrão antigo se o tema não tiver
  const ACCENT = th?.accent || (isDark ? ACCENT_DARK : ACCENT_LIGHT);

  // camadas de elevação: clareiam sobre qualquer fundo escuro, adaptando-se a todos os temas
  const camada1 = isDark ? "rgba(255,255,255,0.045)" : "#ffffff";   // card interno
  const camada2 = isDark ? "rgba(255,255,255,0.085)" : resumeBg;    // campo editável
  const bordaSuave = isDark ? "rgba(255,255,255,0.12)" : border2;

  const semanas = gerarListaSemanas();
  const { ano: anoAtual, semana: semAtual } = semanaISO(new Date());

  const [semSel, setSemSel]       = useState({ ano: anoAtual, semana: semAtual });
  const [dadosSem, setDadosSem]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [expandidos, setExpandidos] = useState({});
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  const chaveAtual = `${semSel.ano}-S${String(semSel.semana).padStart(2, "0")}`;
  const semDados = dadosSem[chaveAtual] || { objetivos: [], cor: "neutro", comentario: "" };

  useEffect(() => {
    const cache = localStorage.getItem("cache_objetivos");
    if (cache) {
      try { setDadosSem(JSON.parse(cache)); setLoading(false); } catch(e) {}
    }
    const timer = setTimeout(() => { carregar(!cache); }, 3000);
    return () => clearTimeout(timer);
  }, []);

  async function carregar(mostrarLoading = true) {
    if (mostrarLoading) setLoading(true);
    try {
      const r = await fetchComRetryObj(`${GAS_DIARIO}?action=lerObjetivos`);
      const mapa = {};
      (r.objetivos || []).forEach(s => { mapa[s.chave] = s; });
      setDadosSem(mapa);
      try { localStorage.setItem("cache_objetivos", JSON.stringify(mapa)); } catch(e) {}
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  // Edita só localmente e marca que há alterações pendentes
  function editarLocal(novosDados) {
    setDadosSem(prev => ({ ...prev, [chaveAtual]: { ...(prev[chaveAtual] || { objetivos: [], cor: "neutro", comentario: "" }), ...novosDados } }));
    setTemAlteracoes(true);
  }

  // Único ponto que envia ao GAS
  async function salvarTudo() {
    setSaving(true);
    setDadosSem(prev => {
      const atual = prev[chaveAtual] || { objetivos: [], cor: "neutro", comentario: "" };
      const payload = { chave: chaveAtual, ano: semSel.ano, semana: semSel.semana, ...atual };
      fetch(`${GAS_DIARIO}?action=salvarObjetivos&dados=${encodeURIComponent(JSON.stringify(payload))}`).catch(() => {});
      try { localStorage.setItem("cache_objetivos", JSON.stringify(prev)); } catch(e) {}
      return prev;
    });
    setTemAlteracoes(false);
    setSaving(false);
  }

  async function deletarSemana(chave) {
    const d = dadosSem[chave];
    const qtd = d?.objetivos?.length || 0;
    const msg = qtd > 0
      ? `Excluir ${chave}? São ${qtd} objetivo(s) registrado(s). Não dá pra desfazer.`
      : `Excluir ${chave}? Não dá pra desfazer.`;
    if (!window.confirm(msg)) return;

    setDadosSem(prev => {
      const novo = { ...prev };
      delete novo[chave];
      try { localStorage.setItem("cache_objetivos", JSON.stringify(novo)); } catch(e) {}
      return novo;
    });

    try {
      const r = await fetch(`${GAS_DIARIO}?action=deletarObjetivos&chave=${encodeURIComponent(chave)}`);
      const j = await r.json();
      if (j.erro) throw new Error(j.erro);
    } catch(e) {
      alert("Erro ao excluir na planilha. Recarregue a página para ver o estado real.");
    }
  }

  function setCor(cor) { editarLocal({ cor }); }
  function setComentario(comentario) { editarLocal({ comentario }); }

  function addObjetivo() {
    const novo = { id: gerarId(), texto: "", categoria: "Técnico", feito: false, nota: "", comentario: "" };
    setDadosSem(prev => {
      const atual = prev[chaveAtual] || { objetivos: [], cor: "neutro", comentario: "" };
      return { ...prev, [chaveAtual]: { ...atual, objetivos: [...(atual.objetivos || []), novo] } };
    });
    setTemAlteracoes(true);
  }

  function updateObjetivo(id, campo, valor) {
    setDadosSem(prev => {
      const atual = prev[chaveAtual] || { objetivos: [] };
      const obj = (atual.objetivos || []).map(o => o.id === id ? { ...o, [campo]: valor } : o);
      return { ...prev, [chaveAtual]: { ...atual, objetivos: obj } };
    });
    setTemAlteracoes(true);
  }

  function removeObjetivo(id) {
    setDadosSem(prev => {
      const atual = prev[chaveAtual] || { objetivos: [] };
      const obj = (atual.objetivos || []).filter(o => o.id !== id);
      return { ...prev, [chaveAtual]: { ...atual, objetivos: obj } };
    });
    setTemAlteracoes(true);
  }

  function toggleFeito(id) {
    setDadosSem(prev => {
      const atual = prev[chaveAtual] || { objetivos: [] };
      const obj = (atual.objetivos || []).map(o => o.id === id ? { ...o, feito: !o.feito } : o);
      return { ...prev, [chaveAtual]: { ...atual, objetivos: obj } };
    });
    setTemAlteracoes(true);
  }

  const corSel = CORES_SEMANA.find(c => c.id === semDados.cor) || CORES_SEMANA[3];
  const cardCorBg = isDark ? (corSel.bgDark || cardBg) : (corSel.bg || cardBg);
  const cardCorBorder = isDark ? (corSel.borderDark || border) : (corSel.border || border);

  const tagColors = {
    "Técnico":  { bg: isDark ? "#22384d" : "#e8f0fe", text: isDark ? "#8cc4fb" : "#1a56db" },
    "Emocional":{ bg: isDark ? "#3a2440" : "#fce8fe", text: isDark ? "#d4a5fc" : "#7e22ce" },
    "Rotina":   { bg: isDark ? "#213a25" : "#e8fce8", text: isDark ? "#7ee6a2" : "#166534" },
    "Estudo":   { bg: isDark ? "#3a3520" : "#fefce8", text: isDark ? "#f0dd6e" : "#854d0e" },
  };

  const inputStyle = {
    background: camada2, border: `1px solid ${bordaSuave}`, borderRadius: 8,
    color: text, padding: "10px 13px", fontSize: 15.5, outline: "none",
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
            <span style={{ fontSize: 16, fontWeight: 800, color: text }}>{fmtSemana(semSel.ano, semSel.semana)}</span>
            {totalObj > 0 && (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: feitosObj === totalObj ? ACCENT : textSub, background: camada2, padding: "3px 11px", borderRadius: 20, border: `1px solid ${bordaSuave}` }}>
                {feitosObj}/{totalObj} feitos
              </span>
            )}

            {saving && <span style={{ fontSize: 12, color: textSub }}>Salvando…</span>}
            {temAlteracoes && !saving && (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: isDark ? "#f0b955" : "#d97706", background: isDark ? "#3a2f14" : "#fef3c7", padding: "3px 11px", borderRadius: 20, border: `1px solid ${isDark ? "#7a6320" : "#fcd34d"}` }}>
                Alterações não salvas
              </span>
            )}
            <button onClick={salvarTudo} disabled={!temAlteracoes || saving}
              style={{
                background: temAlteracoes && !saving ? ACCENT : "transparent",
                color: temAlteracoes && !saving ? "#fff" : textSub,
                border: `1px solid ${temAlteracoes && !saving ? ACCENT : bordaSuave}`,
                borderRadius: 8, padding: "7px 20px", fontSize: 12.5, fontWeight: 700,
                cursor: temAlteracoes && !saving ? "pointer" : "default", fontFamily: "inherit",
              }}>
              {saving ? "Salvando…" : "Salvar"}
            </button>

          </div>
          {/* Seletor de cor */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: textSub, marginRight: 4 }}>Semana:</span>
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
            <div style={{ textAlign: "center", padding: "26px 0", color: textSub, fontSize: 14, border: `1px dashed ${bordaSuave}`, borderRadius: 10 }}>
              Nenhum objetivo ainda. Clique em "+ Objetivo" para adicionar.
            </div>
          )}
          {(semDados.objetivos || []).map(obj => (
            <div key={obj.id} style={{ background: camada1, border: `1px solid ${bordaSuave}`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => toggleFeito(obj.id)} style={{ width: 19, height: 19, borderRadius: 5, border: `2px solid ${obj.feito ? ACCENT : bordaSuave}`, background: obj.feito ? ACCENT : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {obj.feito && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <select value={obj.categoria} onChange={e => updateObjetivo(obj.id, "categoria", e.target.value)}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", outline: "none", fontFamily: "inherit", background: tagColors[obj.categoria]?.bg, color: tagColors[obj.categoria]?.text, flexShrink: 0 }}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={obj.texto} onChange={e => updateObjetivo(obj.id, "texto", e.target.value)}
                  placeholder="Descreva o objetivo..."
                  style={{ ...inputStyle, flex: 1, textDecoration: obj.feito ? "line-through" : "none", color: obj.feito ? textSub : text }} />
                <input type="number" min="1" max="10" value={obj.nota} onChange={e => updateObjetivo(obj.id, "nota", e.target.value)}
                  placeholder="Nota"
                  style={{ ...inputStyle, width: 72, textAlign: "center" }} />
                <button onClick={() => removeObjetivo(obj.id)} style={{ background: "none", border: "none", cursor: "pointer", color: textSub, fontSize: 19, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
              </div>
              <input value={obj.comentario || ""} onChange={e => updateObjetivo(obj.id, "comentario", e.target.value)}
                placeholder="Comentário sobre este objetivo..."
                style={{ ...inputStyle, fontSize: 15.5, color: text }} />
            </div>
          ))}
        </div>

        <button onClick={addObjetivo} style={{ background: "none", border: `1px dashed ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, width: "100%" }}>
          + Objetivo
        </button>

        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7, display: "block" }}>Comentário geral da semana</label>
          <textarea value={semDados.comentario || ""} onChange={e => setComentario(e.target.value)}
            placeholder="Como foi a semana? O que funcionou? O que melhorar?"
            rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
        </div>
      </div>
    );
  }

  function renderCardVisualizacao(chave, dados) {
    if (!dados) return null;
    const cor = CORES_SEMANA.find(c => c.id === dados.cor) || CORES_SEMANA[3];
    const bgC = isDark ? (cor.bgDark || cardBg) : (cor.bg || cardBg);
    const bdC = isDark ? (cor.borderDark || border) : (cor.border || border);
    const txtC = isDark ? (cor.textDark || textSub) : (cor.text || textSub);
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
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", cursor: "pointer", userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {cor.id !== "neutro" && (
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: isDark ? cor.borderDark : cor.border, display: "inline-block", flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 14.5, fontWeight: 700, color: text }}>{fmtSemana(Number(ano), semana)}</span>
            {total > 0 && (
              <span style={{ fontSize: 12, color: feitos === total ? ACCENT : textSub, background: camada2, padding: "2px 9px", borderRadius: 20, border: `1px solid ${bordaSuave}` }}>
                {feitos}/{total} feitos
              </span>
            )}
            {cor.id !== "neutro" && (
              <span style={{ fontSize: 12, fontWeight: 600, color: txtC }}>{cor.label}</span>
            )}
          </div>
          
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={e => { e.stopPropagation(); deletarSemana(chave); }}
              title="Excluir esta semana"
              style={{ background: "none", border: "none", cursor: "pointer", color: textSub, fontSize: 17, lineHeight: 1, padding: "0 2px", opacity: 0.55 }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#f06b6b"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 0.55; e.currentTarget.style.color = textSub; }}
            >×</button>
            <span style={{ color: textSub, fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
          </div>
        </div>        

        {/* Conteúdo expandido — só visualização */}
        {isOpen && (
          <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${bdC}` }}>
            {total === 0 && (
              <div style={{ color: textSub, fontSize: 14, padding: "12px 0" }}>Nenhum objetivo registrado.</div>
            )}
            {(dados.objetivos || []).map(obj => (
              <div key={obj.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 0", borderBottom: `1px solid ${bordaSuave}` }}>
                <div style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${obj.feito ? ACCENT : bordaSuave}`, background: obj.feito ? ACCENT : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {obj.feito && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: obj.comentario ? 5 : 0 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: tagColors[obj.categoria]?.bg, color: tagColors[obj.categoria]?.text }}>{obj.categoria}</span>
                    <span style={{ fontSize: 14.5, color: obj.feito ? textSub : text, textDecoration: obj.feito ? "line-through" : "none" }}>{obj.texto || "—"}</span>
                    {obj.nota && <span style={{ fontSize: 12, color: ACCENT, fontWeight: 700, marginLeft: "auto" }}>Nota: {obj.nota}</span>}
                  </div>
                  {obj.comentario && <div style={{ fontSize: 13.5, color: textSub, marginTop: 2, lineHeight: 1.55 }}>{obj.comentario}</div>}
                </div>
              </div>
            ))}
            {dados.comentario && (
              <div style={{ marginTop: 12, padding: "12px 15px", background: camada2, borderRadius: 8, fontSize: 14, color: text, fontStyle: "italic", lineHeight: 1.6 }}>
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
          <p style={{ fontSize: 13.5, color: textSub, margin: "4px 0 0" }}>Metas semanais e acompanhamento</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={`${semSel.ano}-${semSel.semana}`}
            onChange={e => {
              const [ano, sem] = e.target.value.split("-").map(Number);
              setSemSel({ ano, semana: sem });
            }}
            style={{ padding: "9px 14px", borderRadius: 9, border: `1px solid ${bordaSuave}`, background: camada2, color: text, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
          >
            {semanas.map(s => (
              <option key={`${s.ano}-${s.semana}`} value={`${s.ano}-${s.semana}`}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: textSub, fontSize: 14 }}>Carregando…</div>
      ) : (
        <div>
          {/* Card de edição — semana selecionada */}
          {renderCardEdicao()}

          {/* Histórico — cards colapsáveis */}
          {semanasComDados.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Histórico</div>
              {semanasComDados.map(chave => renderCardVisualizacao(chave, dadosSem[chave]))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
