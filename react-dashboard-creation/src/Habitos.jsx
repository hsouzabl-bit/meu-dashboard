import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["seg","ter","qua","qui","sex","sáb","dom"];

// Registro de hábitos começa aqui. Antes disso não há dado — não conta como falha.
const INICIO_REGISTRO = "2026-08-07";
// Quarter corrente recortado: só o proporcional deste intervalo.
const QUARTER_INI = "2026-08-07";
const QUARTER_FIM = "2026-09-30";
const DIAS_QUARTER_CHEIO = 92; // referência de um trimestre completo

const HABITOS = [
  { campo:"horas",   nota:"notaHoras",   label:"Horas",   labelLongo:"Horas de estudo", step:"0.5", cor:"#1D9E75", metaPadrao:240 },
  { campo:"replays", nota:"notaReplays", label:"Replays", labelLongo:"Replays",         step:"1",   cor:"#BA7517", metaPadrao:60  },
  { campo:"paginas", nota:"notaPaginas", label:"Páginas", labelLongo:"Páginas lidas",   step:"1",   cor:"#378ADD", metaPadrao:300 },
];

function fetchComRetry(url, tentativas=3, delayMs=1200){
  return fetch(url)
    .then(r=>{ if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err=>{
      if(tentativas<=1) throw err;
      return new Promise(res=>setTimeout(res, delayMs)).then(()=>fetchComRetry(url, tentativas-1, delayMs));
    });
}

function chaveData(ano, mes, dia){
  return `${ano}-${String(mes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
}
function fmtNum(v){
  if(v === null || v === undefined) return "—";
  if(!v) return "0";
  return Number.isInteger(v) ? String(v) : String(Math.round(v*10)/10).replace(".", ",");
}
function diasEntre(iniISO, fimISO){
  const a = new Date(iniISO + "T12:00:00");
  const b = new Date(fimISO + "T12:00:00");
  return Math.round((b - a) / 86400000) + 1;
}

export default function Habitos({ th }){
  const dark = th.dark;
  const accent = th.accent;
  const hoje = new Date();
  const hojeChave = chaveData(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const [habitos, setHabitos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mesVis, setMesVis] = useState(hoje.getMonth());
  const [anoVis, setAnoVis] = useState(hoje.getFullYear());
  const [diaSel, setDiaSel] = useState(null);
  const [serieSel, setSerieSel] = useState("horas");

  const [rascunho, setRascunho] = useState(null);
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [metas, setMetas] = useState(()=>{
    try {
      const c = localStorage.getItem("metas_quarterly");
      if(c) return JSON.parse(c);
    } catch(e){}
    const m = {};
    HABITOS.forEach(h=>{ m[h.campo] = h.metaPadrao; });
    return m;
  });

  const habitosRef = useRef([]);
  useEffect(()=>{ habitosRef.current = habitos; },[habitos]);

  // Cache lido IMEDIATAMENTE; só o fetch é atrasado.
  // (antes a leitura do cache estava dentro do setTimeout e esperava 3s junto)
  useEffect(()=>{
    try {
      const c = localStorage.getItem("cache_habitos");
      if(c){ setHabitos(JSON.parse(c) || []); setCarregando(false); }
    } catch(e){}

    const t = setTimeout(()=>{
      fetchComRetry(`${API_DIARIO}?action=lerHabitos`)
        .then(j=>{
          const lista = j.habitos || [];
          try { localStorage.setItem("cache_habitos", JSON.stringify(lista)); } catch(e){}
          setHabitos(lista);
          setCarregando(false);
        })
        .catch(()=>setCarregando(false));
    }, 3000);
    return ()=>clearTimeout(t);
  },[]);

  function alterarMeta(campo, valor){
    const novo = { ...metas, [campo]: valor };
    setMetas(novo);
    try { localStorage.setItem("metas_quarterly", JSON.stringify(novo)); } catch(e){}
  }

  const porData = {};
  habitos.forEach(h=>{ porData[h.data] = h; });

  function abrirDia(chave){
    if(diaSel === chave){ setDiaSel(null); return; }
    const d = porData[chave] || {};
    setDiaSel(chave);
    setRascunho({
      horas:   d.horas   ? String(d.horas)   : "",
      replays: d.replays ? String(d.replays) : "",
      paginas: d.paginas ? String(d.paginas) : "",
      notaHoras:   d.notaHoras   || "",
      notaReplays: d.notaReplays || "",
      notaPaginas: d.notaPaginas || "",
    });
    setAlterado(false);
  }
  function alterarRascunho(campo, valor){
    setRascunho(prev=>({ ...prev, [campo]: valor }));
    setAlterado(true);
  }
  function salvarDia(){
    if(!diaSel || !rascunho) return;
    setSalvando(true);
    const payload = {
      data: diaSel,
      horas:   Number(rascunho.horas)   || 0,
      replays: Number(rascunho.replays) || 0,
      paginas: Number(rascunho.paginas) || 0,
      notaHoras:   rascunho.notaHoras   || "",
      notaReplays: rascunho.notaReplays || "",
      notaPaginas: rascunho.notaPaginas || "",
    };
    fetch(`${API_DIARIO}?action=salvarHabitos&dados=${encodeURIComponent(JSON.stringify(payload))}`)
      .then(()=>{
        const lista = habitosRef.current.filter(h=>h.data !== diaSel);
        const novo = [...lista, { data: diaSel, ...payload }].sort((a,b)=>a.data.localeCompare(b.data));
        setHabitos(novo);
        try { localStorage.setItem("cache_habitos", JSON.stringify(novo)); } catch(e){}
      })
      .catch(()=>{})
      .finally(()=>{ setSalvando(false); setAlterado(false); });
  }

  function navegarMes(delta){
    let m = mesVis + delta, a = anoVis;
    if(m < 0){ m = 11; a--; }
    if(m > 11){ m = 0; a++; }
    setMesVis(m); setAnoVis(a); setDiaSel(null);
  }

  const prefixoMes = `${anoVis}-${String(mesVis+1).padStart(2,"0")}`;
  const doMes = habitos.filter(h=>h.data.startsWith(prefixoMes));

  const totalMes = { horas:0, replays:0, paginas:0, dias:0 };
  doMes.forEach(h=>{
    totalMes.horas += h.horas; totalMes.replays += h.replays; totalMes.paginas += h.paginas;
    if(h.horas || h.replays || h.paginas) totalMes.dias++;
  });

  // ── quarter recortado ──────────────────────────────────────────────────────
  const diasQuarter = diasEntre(QUARTER_INI, QUARTER_FIM);
  const fator = diasQuarter / DIAS_QUARTER_CHEIO;
  const fimEfetivo = hojeChave < QUARTER_FIM ? hojeChave : QUARTER_FIM;
  const diasDecorridos = hojeChave < QUARTER_INI ? 0 : Math.min(diasEntre(QUARTER_INI, fimEfetivo), diasQuarter);
  const pctEsperado = diasQuarter > 0 ? (diasDecorridos / diasQuarter) : 0;

  const doQuarter = habitos.filter(h => h.data >= QUARTER_INI && h.data <= QUARTER_FIM);
  const totalQuarter = { horas:0, replays:0, paginas:0 };
  doQuarter.forEach(h=>{
    totalQuarter.horas += h.horas; totalQuarter.replays += h.replays; totalQuarter.paginas += h.paginas;
  });

  function metaEfetiva(campo){
    return (Number(metas[campo]) || 0) * fator;
  }

  // ── sequências (só a partir do início do registro) ─────────────────────────
  function completou(d){ return d && d.horas >= 1 && d.replays >= 1 && d.paginas >= 1; }
  function temAlgo(d){ return d && (d.horas > 0 || d.replays > 0 || d.paginas > 0); }

  function calcSequencia(teste){
    let cont = 0;
    const cursor = new Date(hoje);
    for(let i=0; i<400; i++){
      const ch = chaveData(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      if(ch < INICIO_REGISTRO) break; // antes do registro não conta como falha
      const d = porData[ch];
      if(ch === hojeChave && !temAlgo(d)){
        // dia corrente em aberto não quebra a sequência
      } else if(teste(d)) cont++;
      else break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return cont;
  }

  const seqTodos = calcSequencia(d=>completou(d));
  const seqPorHabito = {};
  HABITOS.forEach(h=>{ seqPorHabito[h.campo] = calcSequencia(d=>d && d[h.campo] >= 1); });

  // trilha de quadradinhos, do início do registro até hoje (máx. 30 últimos)
  const trilha = [];
  {
    const cursor = new Date(INICIO_REGISTRO + "T12:00:00");
    const fim = new Date(hoje); fim.setHours(12,0,0,0);
    while(cursor <= fim){
      const ch = chaveData(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      const d = porData[ch];
      trilha.push({ chave: ch, ok: completou(d), parcial: temAlgo(d) && !completou(d), vazio: !temAlgo(d) });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  const trilhaVis = trilha.slice(-30);

  // ── séries dos gráficos ───────────────────────────────────────────────────
  const habSel = HABITOS.find(h=>h.campo === serieSel) || HABITOS[0];
  const serieDiaria = doMes.slice().sort((a,b)=>a.data.localeCompare(b.data))
    .reduce((acc, d)=>{
      const ant = acc.length ? acc[acc.length-1].acum : 0;
      acc.push({ data: d.data, valor: d[serieSel], acum: Math.round((ant + d[serieSel])*10)/10 });
      return acc;
    }, []);

  const serieRitmo = doQuarter.slice().sort((a,b)=>a.data.localeCompare(b.data))
    .reduce((acc, d)=>{
      const ant = acc.length ? acc[acc.length-1] : null;
      const ponto = { data: d.data };
      HABITOS.forEach(h=>{
        const acumAnt = ant ? ant[`_${h.campo}`] : 0;
        const acum = acumAnt + d[h.campo];
        ponto[`_${h.campo}`] = acum;
        const me = metaEfetiva(h.campo);
        ponto[h.campo] = me > 0 ? Math.round((acum / me) * 1000) / 10 : 0;
      });
      const dec = Math.min(diasEntre(QUARTER_INI, d.data), diasQuarter);
      ponto.esperado = Math.round((dec / diasQuarter) * 1000) / 10;
      acc.push(ponto);
      return acc;
    }, []);

  // ── calendário ────────────────────────────────────────────────────────────
  const semanas = [];
  {
    const ultimoDia = new Date(anoVis, mesVis+1, 0).getDate();
    let semana = [];
    for(let dia=1; dia<=ultimoDia; dia++){
      const ds = new Date(anoVis, mesVis, dia).getDay();
      const col = ds === 0 ? 6 : ds - 1;
      if(semana.length === 0){ for(let i=0; i<col; i++) semana.push(null); }
      semana.push(dia);
      if(col === 6){ semanas.push(semana); semana = []; }
    }
    if(semana.length){ while(semana.length < 7) semana.push(null); semanas.push(semana); }
  }

  // ── tokens ────────────────────────────────────────────────────────────────
  const verde   = dark ? "#7fb89a" : "#2f7d52";
  const verm    = dark ? "#c68888" : "#a83f31";
  const verdeBg = dark ? "rgba(127,184,154,0.13)" : "#eaf7f0";
  const vermBg  = dark ? "rgba(198,136,136,0.13)" : "#fbeceb";
  const linha   = th.border;
  const sutil   = dark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.022)";
  const vazioTxt = dark ? "rgba(255,255,255,0.25)" : "#c2c2c8";

  const cardBase = {
    background: th.cardBg, borderRadius: 12, border: `1px solid ${th.border}`,
    boxShadow: th.cardShadow, padding: "13px 15px",
  };
  const secao = { fontSize: 15.5, fontWeight: 700, color: th.text, letterSpacing: "-0.01em" };
  const legenda = { fontSize: 11.5, color: th.textMuted };
  const btnMini = {
    background: "none", border: `1px solid ${th.border2}`, color: th.textSub,
    borderRadius: 7, padding: "2px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ width:"100%", minWidth:0, paddingBottom:40 }}>

      <div style={{ marginBottom:16 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:th.text, margin:0, letterSpacing:"-0.02em" }}>Hábitos</h1>
        <p style={{ fontSize:13, color:th.textMuted, margin:"4px 0 0" }}>
          Clique num dia para registrar o que foi feito.
          {carregando && <span style={{ marginLeft:8, opacity:0.7 }}>atualizando…</span>}
        </p>
      </div>

      {/* ═══ CARDS DE META + SEQUÊNCIAS ═══ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr)) 260px", gap:12, marginBottom:8, alignItems:"stretch" }}>
        {HABITOS.map(h=>{
          const val = totalQuarter[h.campo];
          const me = metaEfetiva(h.campo);
          const p = me > 0 ? Math.min(100, Math.round((val/me)*100)) : 0;
          const alvoHoje = me * pctEsperado;
          const noRitmo = val >= alvoHoje;
          return (
            <div key={h.campo} style={{ ...cardBase, display:"flex", flexDirection:"column", justifyContent:"space-between", gap:8 }}>
              <div>
                <span style={{ fontSize:10, fontWeight:700, color:th.textMuted, letterSpacing:0.7, textTransform:"uppercase" }}>{h.labelLongo}</span>
                <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:3 }}>
                  <span style={{ fontSize:25, fontWeight:800, color:accent, lineHeight:1.05, fontVariantNumeric:"tabular-nums" }}>{fmtNum(val)}</span>
                  <span style={{ fontSize:12.5, color:th.textMuted }}>/ {Math.round(me)}</span>
                </div>
              </div>
              <div>
                <div style={{ position:"relative", background:th.resumeBg, borderRadius:5, height:9, marginBottom:5 }}>
                  <div style={{ width:`${p}%`, background:accent, borderRadius:5, height:9, transition:"width .8s ease" }}/>
                  <div title="ritmo esperado hoje" style={{
                    position:"absolute", top:-2, left:`${Math.min(100, pctEsperado*100)}%`,
                    width:2, height:13, background:th.text, opacity:0.45, borderRadius:2,
                  }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5 }}>
                  <span style={{ color:th.textMuted }}>{p}%</span>
                  <span style={{ color: noRitmo ? verde : verm, fontWeight:600 }}>
                    {noRitmo ? "no ritmo" : `faltam ${fmtNum(Math.max(0, alvoHoje - val))}`}
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10.5, color:th.textMuted }}>
                meta do quarter cheio:
                <input type="number" value={metas[h.campo]} onChange={e=>alterarMeta(h.campo, e.target.value)}
                  style={{ width:46, fontSize:10.5, color:th.textSub, background:"transparent", border:"none",
                    borderBottom:`1px solid ${th.border2}`, outline:"none", padding:0, fontFamily:"inherit" }}/>
              </div>
            </div>
          );
        })}

        <div style={{ ...cardBase, display:"flex", flexDirection:"column" }}>
          <span style={{ fontSize:10, fontWeight:700, color:th.textMuted, letterSpacing:0.7, textTransform:"uppercase" }}>Sequências atuais</span>
          <div style={{ display:"flex", alignItems:"baseline", gap:7, margin:"4px 0 8px" }}>
            <span style={{ fontSize:25, fontWeight:800, color: seqTodos>0 ? accent : th.textMuted, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{seqTodos}</span>
            <span style={{ fontSize:11.5, color:th.textMuted }}>dias com os 3</span>
          </div>
          <div style={{ display:"flex", gap:2.5, flexWrap:"wrap", marginBottom:9 }}>
            {trilhaVis.map(d=>(
              <div key={d.chave} title={d.chave.split("-").reverse().join("/")}
                style={{
                  width:10, height:10, borderRadius:3, flexShrink:0,
                  background: d.ok ? verde : d.parcial ? verm : "transparent",
                  border: d.vazio ? `1px solid ${th.border2}` : "none",
                  opacity: d.ok ? 0.9 : d.parcial ? 0.55 : 1,
                }}/>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3, marginTop:"auto" }}>
            {HABITOS.map(h=>(
              <div key={h.campo} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11.5, color:th.textMuted }}>{h.labelLongo}</span>
                <span style={{ fontSize:12, fontWeight:700, color: seqPorHabito[h.campo]>0 ? th.text : th.textMuted, fontVariantNumeric:"tabular-nums" }}>
                  {seqPorHabito[h.campo]}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ ...legenda, marginBottom:22 }}>
        Metas do quarter recortado: 07/08 a 30/09 ({diasQuarter} dias) · o traço na barra marca o ritmo esperado até hoje
      </div>

      {/* ═══ CALENDÁRIO + GRÁFICO DIÁRIO ═══ */}
      <div style={{ display:"flex", gap:18, alignItems:"flex-start", marginBottom:26 }}>

        <div style={{ flex:1, minWidth:420 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:11, flexWrap:"wrap" }}>
            <span style={secao}>{MESES_PT[mesVis]} {anoVis}</span>
            <div style={{ display:"flex", gap:5 }}>
              <button onClick={()=>navegarMes(-1)} style={btnMini}>‹</button>
              <button onClick={()=>navegarMes(1)} style={btnMini}>›</button>
            </div>
            <span style={legenda}>{totalMes.dias} dias com registro</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
            {DIAS_SEM.map(d=>(
              <div key={d} style={{ fontSize:9.5, color:th.textMuted, paddingLeft:2 }}>{d}</div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {semanas.map((semana,si)=>(
              <div key={si} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                {semana.map((dia,di)=>{
                  if(dia === null) return <div key={`v-${di}`}/>;
                  const chave = chaveData(anoVis,mesVis,dia);
                  const d = porData[chave];
                  const futuro = chave > hojeChave;
                  const antes = chave < INICIO_REGISTRO;
                  const ok = completou(d);
                  const parcial = temAlgo(d) && !ok;

                  let bg = sutil, bd = "1px solid transparent", txt = th.textMuted;
                  if(ok){ bg = verdeBg; bd = `1px solid ${verde}33`; }
                  else if(parcial){ bg = vermBg; bd = `1px solid ${verm}33`; }
                  else if(futuro || antes){ bg = "transparent"; bd = `1px dashed ${th.border2}`; txt = vazioTxt; }

                  return (
                    <div key={dia} onClick={()=>!futuro && !antes && abrirDia(chave)}
                    style={{ background:bg, border:bd, borderRadius:9, minHeight:86, padding:"8px 9px",
        boxSizing:"border-box", cursor:(futuro||antes)?"default":"pointer",
                        outline: diaSel===chave ? `2px solid ${accent}` : "none", display:"flex", flexDirection:"column" }}>
                      <span style={{ fontSize:11.5, color:txt, fontVariantNumeric:"tabular-nums" }}>{dia}</span>
                      {temAlgo(d) && (
                        <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:0 }}>
                          {HABITOS.map(h=>(
                            <span key={h.campo} style={{
                              fontSize:12, lineHeight:1.4, fontVariantNumeric:"tabular-nums",
                              color: d[h.campo] >= 1 ? th.text : verm,
                            }}>{fmtNum(d[h.campo])}<span style={{ color:th.textMuted, fontSize:8.5 }}>{h.label[0].toLowerCase()}</span></span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

{diaSel && rascunho && (
          <div style={{ ...cardBase, width:330, flexShrink:0, borderLeft:`3px solid ${accent}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:700, color:th.text }}>
                {diaSel.split("-").reverse().join("/")}
              </span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {alterado && !salvando && (
                  <span style={{ fontSize:10, fontWeight:700, color:"#d97706", background:dark?"#2a2210":"#fef3c7", padding:"2px 8px", borderRadius:20, border:`1px solid ${dark?"#5c4a10":"#fcd34d"}` }}>Não salvo</span>
                )}
                <span onClick={()=>setDiaSel(null)} style={{ cursor:"pointer", color:th.textMuted, fontSize:19, lineHeight:1 }}>×</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {HABITOS.map(h=>(
                <div key={h.campo}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:5 }}>
                    <span style={{ fontSize:12.5, color:th.textSub }}>{h.labelLongo}</span>
                    <input type="number" step={h.step} min="0" placeholder="0"
                      value={rascunho[h.campo]} onChange={e=>alterarRascunho(h.campo, e.target.value)}
                      style={{ width:62, fontSize:15, fontWeight:800, color:accent, background:th.resumeBg,
                        border:`1px solid ${th.border2}`, borderRadius:7, outline:"none", padding:"4px 7px",
                        textAlign:"center", fontFamily:"inherit" }}/>
                  </div>
                  <textarea rows={2} placeholder="anotação..."
                    value={rascunho[h.nota]} onChange={e=>alterarRascunho(h.nota, e.target.value)}
                    style={{ width:"100%", fontSize:12, padding:"7px 9px", border:`1px solid ${th.border2}`,
                      borderRadius:8, outline:"none", fontFamily:"inherit", resize:"vertical",
                      boxSizing:"border-box", background:th.resumeBg, color:th.text }}/>
                </div>
              ))}
            </div>
            <button onClick={salvarDia} disabled={!alterado||salvando}
              style={{ marginTop:14, background: alterado&&!salvando ? accent : "transparent",
                color: alterado&&!salvando ? "#fff" : th.textMuted,
                border:`1px solid ${alterado&&!salvando ? accent : th.border2}`,
                borderRadius:8, padding:"8px 0", fontSize:12, fontWeight:700,
                cursor: alterado&&!salvando ? "pointer" : "default", fontFamily:"inherit", width:"100%" }}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        )}
      </div>

      {/* ═══ GRÁFICOS ═══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:26, alignItems:"start" }}>

        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:11, flexWrap:"wrap" }}>
            <div>
              <div style={secao}>Acumulado no mês</div>

        
              <div style={{ ...legenda, marginTop:2 }}>
                {MESES_PT[mesVis]}: {fmtNum(totalMes[serieSel])} {habSel.label.toLowerCase()}
              </div>
            </div>
            <div style={{ display:"flex", gap:3, background:sutil, border:`1px solid ${th.border2}`, borderRadius:9, padding:3 }}>
              {HABITOS.map(h=>(
                <button key={h.campo} onClick={()=>setSerieSel(h.campo)} style={{
                  background: serieSel===h.campo ? accent : "transparent",
                  color: serieSel===h.campo ? "#fff" : th.textMuted,
                  border:"none", borderRadius:7, padding:"5px 13px",
                  fontSize:11.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                }}>{h.label}</button>
              ))}
            </div>
          </div>

          {serieDiaria.length < 2 ? (
            <div style={{ padding:"70px 0", textAlign:"center", color:th.textMuted, fontSize:12.5, background:sutil, borderRadius:12 }}>
              Dados insuficientes neste mês
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={215}>
              <LineChart data={serieDiaria} margin={{ top:8, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={linha} vertical={false}/>
                <XAxis dataKey="data" tick={{ fontSize:10.5, fill:th.textMuted }}
                  tickFormatter={d=>d.slice(8,10)+"/"+d.slice(5,7)} minTickGap={26} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10.5, fill:th.textMuted }} width={38} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{ background:th.surface, border:`1px solid ${th.border2}`, borderRadius:9, fontSize:12.5, color:th.text }}
                  itemStyle={{ color:th.text }} labelStyle={{ color:th.textMuted, marginBottom:4 }}
                  labelFormatter={l=>l.split("-").reverse().join("/")}
                  formatter={(v,n)=>[fmtNum(v), n === "acum" ? "Acumulado" : "No dia"]}/>
                <Line type="monotone" dataKey="acum" stroke={accent} strokeWidth={2} dot={false} activeDot={{ r:4 }}/>
                <Line type="monotone" dataKey="valor" stroke={th.textMuted} strokeWidth={1.4} strokeDasharray="4 3" dot={false}/>
              </LineChart>
            </ResponsiveContainer>

          )}
        </div>

        <div style={{ minWidth:0 }}>
          <div style={secao}>Ritmo do quarter</div>
      
        <div style={{ ...legenda, marginTop:3, marginBottom:12 }}>
          % da meta efetiva por hábito · a linha cinza é o ritmo necessário para fechar 30/09 em dia
        </div>

        {serieRitmo.length < 2 ? (
          <div style={{ padding:"60px 0", textAlign:"center", color:th.textMuted, fontSize:12.5, background:sutil, borderRadius:12 }}>
            Ainda sem dados suficientes no quarter
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={215}>
              <LineChart data={serieRitmo} margin={{ top:8, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={linha} vertical={false}/>
                <XAxis dataKey="data" tick={{ fontSize:10.5, fill:th.textMuted }}
                  tickFormatter={d=>d.slice(8,10)+"/"+d.slice(5,7)} minTickGap={26} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10.5, fill:th.textMuted }} width={40} axisLine={false} tickLine={false}
                  tickFormatter={v=>`${v}%`} domain={[0, dataMax=>Math.max(20, Math.ceil(dataMax/10)*10)]}/>
                <Tooltip
                  contentStyle={{ background:th.surface, border:`1px solid ${th.border2}`, borderRadius:9, fontSize:12.5, color:th.text }}
                  itemStyle={{ color:th.text }} labelStyle={{ color:th.textMuted, marginBottom:4 }}
                  labelFormatter={l=>l.split("-").reverse().join("/")}
                  formatter={(v,n)=>[`${v}%`, n === "esperado" ? "Esperado" : (HABITOS.find(h=>h.campo===n)?.labelLongo || n)]}/>
                <ReferenceLine y={100} stroke={th.textMuted} strokeDasharray="2 4"/>
                <Line type="monotone" dataKey="esperado" stroke={th.textMuted} strokeWidth={1.6} strokeDasharray="5 4" dot={false}/>
                {HABITOS.map(h=>(
                  <Line key={h.campo} type="monotone" dataKey={h.campo} stroke={h.cor} strokeWidth={2} dot={false} activeDot={{ r:4 }}/>
                ))}
              </LineChart>
              
           </ResponsiveContainer>
            <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginTop:8 }}>
              {HABITOS.map(h=>(
                <span key={h.campo} style={{ fontSize:11.5, color:th.textMuted }}>
                  <span style={{ color:h.cor }}>■</span> {h.labelLongo}
                </span>
              ))}
              <span style={{ fontSize:11.5, color:th.textMuted }}>
                <span style={{ color:th.textMuted }}>▬</span> ritmo esperado
              </span>
            </div>
          </>
        )}
        </div>
      </div>

    </div>
  );
}
