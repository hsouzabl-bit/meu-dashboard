import { useState, useEffect, useRef } from "react";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_UTEIS = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];

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
  if(!v) return "0";
  return Number.isInteger(v) ? String(v) : String(v).replace(".", ",");
}

export default function Habitos({ th }){
  const dark = th.dark;
  const accent = th.accent;
  const hoje = new Date();

  const [habitos, setHabitos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mesVis, setMesVis] = useState(hoje.getMonth());
  const [anoVis, setAnoVis] = useState(hoje.getFullYear());
  const [diaSel, setDiaSel] = useState(null);

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

  function aplicarLista(lista){
    setHabitos(lista || []);
    setCarregando(false);
  }

  function carregar(){
    try {
      const c = localStorage.getItem("cache_habitos");
      if(c) aplicarLista(JSON.parse(c));
    } catch(e){}
    fetchComRetry(`${API_DIARIO}?action=lerHabitos`)
      .then(j=>{
        const lista = j.habitos || [];
        try { localStorage.setItem("cache_habitos", JSON.stringify(lista)); } catch(e){}
        aplicarLista(lista);
      })
      .catch(()=>setCarregando(false));
  }

  useEffect(()=>{
    const t = setTimeout(carregar, 3000);
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

  const totalGeral = { horas:0, replays:0, paginas:0 };
  habitos.forEach(h=>{
    totalGeral.horas += h.horas; totalGeral.replays += h.replays; totalGeral.paginas += h.paginas;
  });

  function completou(d){
    return d && d.horas >= 1 && d.replays >= 1 && d.paginas >= 1;
  }
  function temAlgo(d){
    return d && (d.horas > 0 || d.replays > 0 || d.paginas > 0);
  }

  const hojeChave = chaveData(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  function calcSequencia(teste){
    let cont = 0;
    const cursor = new Date(hoje);
    for(let i=0; i<400; i++){
      const ds = cursor.getDay();
      if(ds !== 0 && ds !== 6){
        const ch = chaveData(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        const d = porData[ch];
        if(ch === hojeChave && !temAlgo(d)){
          // dia corrente ainda em aberto: não quebra a sequência
        } else if(teste(d)) cont++;
        else break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return cont;
  }

  const seqTodos = calcSequencia(d=>completou(d));
  const seqPorHabito = {};
  HABITOS.forEach(h=>{ seqPorHabito[h.campo] = calcSequencia(d=>d && d[h.campo] >= 1); });

  const semanas = [];
  {
    const ultimoDia = new Date(anoVis, mesVis+1, 0).getDate();

    let semana = [];
    for(let dia=1; dia<=ultimoDia; dia++){
      const ds = new Date(anoVis, mesVis, dia).getDay();
      const col = ds === 0 ? 6 : ds - 1;
      if(semana.length === 0){
        for(let i=0; i<col; i++) semana.push(null);
      }
      semana.push(dia);
      if(col === 6){ semanas.push(semana); semana = []; }
    }
    if(semana.length){
      while(semana.length < 7) semana.push(null);
      semanas.push(semana);
    }

  const verdeBg  = dark ? "#16291f" : "#eaf7f0";
  const verdeBd  = dark ? "#2d6b4f" : "#5cb583";
  const vermBg   = dark ? "#231a1c" : "#fbeceb";
  const vermBd   = dark ? "#6b4444" : "#d9776b";
  const vazioTxt = dark ? "rgba(255,255,255,0.25)" : "#c2c2c8";

  const cardBase = {
    background: th.cardBg, borderRadius:12, border:`1px solid ${th.border}`,
    boxShadow: th.cardShadow, padding:"14px 16px",
  };

  function Linha({ label, valor, cor }){
    return (
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11}}>
        <span style={{color:th.textMuted}}>{label}</span>
        <span style={{fontWeight:700,color:cor||th.text}}>{valor}</span>
      </div>
    );
  }

  return (
    <div style={{width:"100%",minWidth:0,paddingBottom:30}}>

      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Hábitos</h1>
        <p style={{fontSize:13,color:th.textMuted,margin:"4px 0 0"}}>Clique num dia para registrar o que foi feito.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
        {HABITOS.map(h=>{
          const val = totalGeral[h.campo];
          const meta = Number(metas[h.campo]) || 1;
          const p = Math.min(100, Math.round((val/meta)*100));
          return (
            <div key={h.campo} style={{...cardBase,display:"flex",flexDirection:"column",gap:6}}>
              <span style={{fontSize:10.5,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>{h.labelLongo}</span>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <span style={{fontSize:28,fontWeight:800,color:accent,lineHeight:1.1}}>{fmtNum(val)}</span>
                <span style={{fontSize:13,color:th.textMuted}}>/</span>
                <input type="number" value={metas[h.campo]} onChange={e=>alterarMeta(h.campo, e.target.value)}
                  style={{width:58,fontSize:13,color:th.textMuted,background:"transparent",border:"none",outline:"none",padding:0,fontFamily:"inherit"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                <div style={{flex:1,background:th.resumeBg,borderRadius:4,height:5}}>
                  <div style={{width:`${p}%`,background:accent,borderRadius:4,height:5,transition:"width 0.8s ease"}}/>
                </div>
                <span style={{fontSize:11,color:th.textMuted,fontWeight:600,minWidth:28}}>{p}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:10.5,color:th.textMuted,margin:"-8px 0 18px"}}>Quarterly goals — meta editável, acumulado de todo o histórico.</div>

      <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>

        <div style={{flex:1,minWidth:0}}>
          <div style={{...cardBase,padding:"16px 18px"}}>

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontSize:13,fontWeight:700,color:th.text}}>{MESES_PT[mesVis]} {anoVis}</span>
              <button onClick={()=>navegarMes(-1)} style={{background:th.resumeBg,border:`1px solid ${th.border2}`,color:th.textMuted,borderRadius:7,width:26,height:24,cursor:"pointer",fontSize:12}}>‹</button>
              <button onClick={()=>navegarMes(1)} style={{background:th.resumeBg,border:`1px solid ${th.border2}`,color:th.textMuted,borderRadius:7,width:26,height:24,cursor:"pointer",fontSize:12}}>›</button>
              <span style={{marginLeft:"auto",fontSize:10.5,color:th.textMuted}}>
                <span style={{color:verdeBd}}>■</span> os 3 no dia &nbsp;
                <span style={{color:vermBd}}>■</span> faltou algum
              </span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr) 1.15fr",gap:5,marginBottom:6}}>
              {DIAS_UTEIS.map(d=>(
                <div key={d} style={{textAlign:"center",fontSize:9.5,fontWeight:700,color:th.textMuted,letterSpacing:0.6}}>{d}</div>
              ))}
              <div style={{textAlign:"center",fontSize:9.5,fontWeight:700,color:th.textMuted,letterSpacing:0.6}}>SEMANA</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {semanas.map((semana,si)=>{
                const tot = { horas:0, replays:0, paginas:0, dias:0 };
                semana.forEach(dia=>{
                  if(!dia) return;
                  const d = porData[chaveData(anoVis,mesVis,dia)];
                  if(!d) return;
                  tot.horas += d.horas; tot.replays += d.replays; tot.paginas += d.paginas;
                  if(temAlgo(d)) tot.dias++;
                });
                return (
                  <div key={si} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr) 1.15fr",gap:5}}>
                    {semana.map((dia,di)=>{
                      if(dia === null) return <div key={`v-${di}`}/>;
                      const chave = chaveData(anoVis,mesVis,dia);
                      const d = porData[chave];
                      const futuro = chave > hojeChave;
                      const ok = completou(d);
                      const parcial = temAlgo(d) && !ok;

                      let bg = "transparent", bd = `1px dashed ${th.border2}`, txt = vazioTxt;
                      if(ok){ bg = verdeBg; bd = `1px solid ${verdeBd}`; txt = th.textMuted; }
                      else if(parcial){ bg = vermBg; bd = `1px solid ${vermBd}`; txt = th.textMuted; }
                      else if(!futuro){ bg = th.resumeBg; bd = `1px solid ${th.border}`; txt = th.textMuted; }

                      return (
                        <div key={dia} onClick={()=>!futuro&&abrirDia(chave)}
                          style={{background:bg,border:bd,borderRadius:9,padding:"7px 8px",minHeight:76,
                            cursor:futuro?"default":"pointer",boxSizing:"border-box",
                            outline: diaSel===chave ? `2px solid ${accent}` : "none"}}>
                          <div style={{fontSize:11,fontWeight:700,color:txt,marginBottom:4}}>{dia}</div>
                          {temAlgo(d) ? (
                            <div style={{display:"flex",flexDirection:"column",gap:1}}>
                              {HABITOS.map(h=>(
                                <Linha key={h.campo} label={h.label}
                                  valor={fmtNum(d[h.campo])}
                                  cor={d[h.campo] >= 1 ? th.text : vermBd}/>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                    <div style={{background:th.resumeBg,border:`1px solid ${th.border}`,borderRadius:9,padding:"7px 8px",minHeight:76,boxSizing:"border-box"}}>
                      <div style={{fontSize:9,fontWeight:700,color:th.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>
                        {tot.dias ? `${tot.dias}d` : "—"}
                      </div>
                      {tot.dias ? (
                        <div style={{display:"flex",flexDirection:"column",gap:1}}>
                          {HABITOS.map(h=>(
                            <Linha key={h.campo} label={h.label} valor={fmtNum(tot[h.campo])}/>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{marginTop:12,background:th.resumeBg,border:`1px solid ${th.border}`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:26,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:9.5,fontWeight:700,color:th.textMuted,textTransform:"uppercase",letterSpacing:0.6}}>Resumo do mês</div>
                <div style={{fontSize:12,color:th.textMuted,marginTop:2}}>{totalMes.dias} dias com registro</div>
              </div>
              {HABITOS.map(h=>(
                <div key={h.campo}>
                  <div style={{fontSize:19,fontWeight:800,color:th.text}}>{fmtNum(totalMes[h.campo])}</div>
                  <div style={{fontSize:11,color:th.textMuted}}>{h.labelLongo}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <aside style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",gap:14}}>

          {diaSel && rascunho && (
            <div style={{...cardBase}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:11,fontWeight:700,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  {diaSel.slice(8,10)}/{diaSel.slice(5,7)}
                </span>
                {alterado && !salvando && (
                  <span style={{fontSize:10,fontWeight:700,color:"#d97706",background:dark?"#2a2210":"#fef3c7",padding:"2px 8px",borderRadius:20,border:`1px solid ${dark?"#5c4a10":"#fcd34d"}`}}>Não salvo</span>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {HABITOS.map(h=>(
                  <div key={h.campo}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:5}}>
                      <span style={{fontSize:12.5,color:th.textSub}}>{h.labelLongo}</span>
                      <input type="number" step={h.step} min="0" placeholder="0"
                        value={rascunho[h.campo]} onChange={e=>alterarRascunho(h.campo, e.target.value)}
                        style={{width:60,fontSize:15,fontWeight:800,color:accent,background:th.resumeBg,border:`1px solid ${th.border2}`,borderRadius:7,outline:"none",padding:"4px 7px",textAlign:"center",fontFamily:"inherit"}}/>
                    </div>
                    <textarea rows={2} placeholder="anotação..."
                      value={rascunho[h.nota]} onChange={e=>alterarRascunho(h.nota, e.target.value)}
                      style={{width:"100%",fontSize:12,padding:"7px 9px",border:`1px solid ${th.border2}`,borderRadius:8,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",background:th.resumeBg,color:th.text}}/>
                  </div>
                ))}
              </div>
              <button onClick={salvarDia} disabled={!alterado||salvando}
                style={{marginTop:14,background:alterado&&!salvando?accent:"transparent",
                  color:alterado&&!salvando?"#fff":th.textMuted,
                  border:`1px solid ${alterado&&!salvando?accent:th.border2}`,
                  borderRadius:8,padding:"8px 0",fontSize:12,fontWeight:700,
                  cursor:alterado&&!salvando?"pointer":"default",fontFamily:"inherit",width:"100%"}}>
                {salvando?"Salvando…":"Salvar"}
              </button>
            </div>
          )}

          <div style={{...cardBase}}>
            <div style={{fontSize:11,fontWeight:700,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Sequências atuais</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${th.border}`}}>
              <span style={{fontSize:12.5,color:th.textSub}}>Os 3 no dia</span>
              <span style={{fontSize:13,fontWeight:800,color:seqTodos>0?accent:th.textMuted}}>{seqTodos}d</span>
            </div>
            {HABITOS.map((h,i)=>(
              <div key={h.campo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<HABITOS.length-1?`1px solid ${th.border}`:"none"}}>
                <span style={{fontSize:12.5,color:th.textSub}}>{h.labelLongo}</span>
                <span style={{fontSize:13,fontWeight:700,color:seqPorHabito[h.campo]>0?th.text:th.textMuted}}>{seqPorHabito[h.campo]}d</span>
              </div>
            ))}
          </div>

          <div style={{...cardBase}}>
            <div style={{fontSize:11,fontWeight:700,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Acumulado do mês</div>
            {(() => {
              const dias = doMes.slice().sort((a,b)=>a.data.localeCompare(b.data));
              if(dias.length < 2) return <div style={{fontSize:12,color:th.textMuted,padding:"20px 0",textAlign:"center"}}>Dados insuficientes no mês</div>;
              const acum = { horas:0, replays:0, paginas:0 };
              const series = { horas:[], replays:[], paginas:[] };
              dias.forEach(d=>{
                HABITOS.forEach(h=>{
                  acum[h.campo] += d[h.campo];
                  series[h.campo].push(acum[h.campo]);
                });
              });
              const maxV = Math.max(1, ...HABITOS.map(h=>Math.max(...series[h.campo])));
              const W=260,H=110,padL=6,padR=6,padT=8,padB=14;
              const plotW=W-padL-padR, plotH=H-padT-padB;
              return (
                <>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
                    <line x1={padL} y1={padT+plotH} x2={W-padR} y2={padT+plotH} stroke={th.border2} strokeWidth="1"/>
                    {HABITOS.map(h=>{
                      const pts = series[h.campo].map((v,i)=>{
                        const x = padL + (dias.length===1?0:(i/(dias.length-1))*plotW);
                        const y = padT + plotH - (v/maxV)*plotH;
                        return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
                      }).join(" ");
                      return <path key={h.campo} d={pts} fill="none" stroke={h.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>;
                    })}
                  </svg>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:11,color:th.textMuted,marginTop:6}}>
                    {HABITOS.map(h=>(
                      <span key={h.campo}><span style={{color:h.cor}}>■</span> {h.label.toLowerCase()}</span>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

        </aside>
      </div>
    </div>
  );
}
