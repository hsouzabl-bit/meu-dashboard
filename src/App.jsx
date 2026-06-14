import { useState, useEffect } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbzBEgswS-Jy8HvgYOQITuS6YgRrT7am5DlR3Mhd6KC4sTpl_Xg5It7XBnIKdr1QWfzi/exec";

const METAS_MENSAIS = { horasEstudo:80, paginasLidas:100, videoAulas:10, replays:20 };
const METAS_ANUAIS  = { horasEstudo:480, paginasLidas:600, videoAulas:60, replays:120 };
const DIAS_SEMANA   = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];
const MESES_PT      = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const ACCENT        = "#4ecb8d";

const LIGHT = {
  bg:"#f4f5f7", surface:"#ffffff", border:"#ebebeb", border2:"#e0e0e0",
  text:"#0f1117", textSub:"#4a5568", textMuted:"#8a96a3",
  navActiveBg:"#f0fdf8", cardBg:"#ffffff", cardShadow:"0 1px 4px rgba(0,0,0,0.06)",
  resumeBg:"#f8f9fa", skeletonA:"#efefef", skeletonB:"#e5e5e5",
  calDayBg:{ 1:"#e6faf2", 2:"#fff8e1", 3:"#fce4ec", 0:"#f5f5f5" },
  calDayBorder:{ 1:"#a7e9c9", 2:"#ffe082", 3:"#f48fb1", 0:"transparent" },
};
const DARK = {
  bg:"#1a1d23", surface:"#22262f", border:"#2c3040", border2:"#353a4a",
  text:"#f0f2f5", textSub:"#c0c8d4", textMuted:"#8a96a8",
  navActiveBg:"#1c2e25", cardBg:"#22262f", cardShadow:"0 1px 6px rgba(0,0,0,0.35)",
  resumeBg:"#1a1d23", skeletonA:"#2c3040", skeletonB:"#363d4d",
  calDayBg:{ 1:"#1a3028", 2:"#2d2710", 3:"#2d1420", 0:"#262930" },
  calDayBorder:{ 1:"#2d6b4f", 2:"#856404", 3:"#8b3252", 0:"transparent" },
};

function pct(v,total){ return !total?0:Math.min(100,Math.round((v/total)*100)); }
function minParaHM(min){ const h=Math.floor(min/60),m=min%60; return m>0?`${h}h ${m}m`:`${h}h`; }

function buildCalendario(cal,ano,mes){
  const primeiro=new Date(ano,mes,1);
  let inicio=primeiro.getDay(); inicio=inicio===0?6:inicio-1;
  const ultimo=new Date(ano,mes+1,0).getDate();
  const cells=[];
  for(let i=0;i<inicio;i++) cells.push({num:null,tipo:null});
  for(let d=1;d<=ultimo;d++) cells.push({num:d,tipo:cal[d]!==undefined?cal[d]:null});
  while(cells.length%7!==0) cells.push({num:null,tipo:null});
  const semanas=[];
  for(let i=0;i<cells.length;i+=7) semanas.push(cells.slice(i,i+7));
  return semanas;
}

const Ico = {
  Clock:   ({s=18,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Book:    ({s=18,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Camera:  ({s=18,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Check:   ({s=16,c=ACCENT})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       ({s=16,c="#f87171"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Target:  ({s=20,c=ACCENT})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Trend:   ({s=20,c=ACCENT})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  BookOpen:({s=20,c=ACCENT})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Play:    ({s=20,c=ACCENT})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Repeat:  ({s=20,c=ACCENT})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Moon:    ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun:     ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Calendar:({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

function Skeleton({w="100%",h=20,r=6,th}){
  return <div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${th.skeletonA} 25%,${th.skeletonB} 50%,${th.skeletonA} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>;
}

function MetricCard({icon,color,label,value,unit,sub,pctVal,barColor,th}){
  return(
    <div style={{background:th.cardBg,borderRadius:14,padding:"20px 22px",flex:1,boxShadow:th.cardShadow,border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:6,transition:"background 0.3s,border 0.3s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:11,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>{label}</span>
        {icon}
      </div>
      <div style={{fontSize:32,fontWeight:800,color,lineHeight:1.1}}>
        {value}<span style={{fontSize:16,fontWeight:600}}>{unit}</span>
      </div>
      {sub&&<div style={{fontSize:12,color:th.textMuted}}>{sub}</div>}
      {pctVal!==undefined&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
          <div style={{flex:1,background:th.resumeBg,borderRadius:4,height:5}}>
            <div style={{width:`${pctVal}%`,background:barColor,borderRadius:4,height:5,transition:"width 0.8s ease"}}/>
          </div>
          <span style={{fontSize:11,color:th.textMuted,fontWeight:600,minWidth:28}}>{pctVal}%</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({label,icon,value,meta,pctVal,color,th}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:16,padding:"13px 0",borderBottom:`1px solid ${th.border}`}}>
      <span style={{flexShrink:0}}>{icon}</span>
      <span style={{width:150,fontSize:13,color:th.text,fontWeight:500,flexShrink:0}}>{label}</span>
      <div style={{flex:1,background:th.resumeBg,borderRadius:6,height:6}}>
        <div style={{width:`${pctVal}%`,background:color,borderRadius:6,height:6,transition:"width 0.8s ease"}}/>
      </div>
      <span style={{fontSize:12,color:th.textMuted,width:130,textAlign:"right",flexShrink:0}}>{value} / {meta}</span>
      <span style={{fontSize:12,fontWeight:700,color:th.text,width:36,textAlign:"right",flexShrink:0}}>{pctVal}%</span>
    </div>
  );
}

function OntemCard({ontem,ontemData,th}){
  if(!ontem) return(
    <div style={{background:th.cardBg,borderRadius:14,padding:"16px 24px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Ico.Calendar s={14} c={th.textMuted}/>
        <span style={{fontSize:11,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>Meu Dia Ontem</span>
        <span style={{fontSize:11,color:th.textMuted,marginLeft:4}}>— sem registro</span>
      </div>
    </div>
  );

  const metricas=[
    {label:"Estudo",  value:`${ontem.horas}h`,        icon:<Ico.Clock    s={14} c={th.textMuted}/>},
    {label:"Páginas", value:`${ontem.paginas}`,        icon:<Ico.BookOpen s={14} c={th.textMuted}/>},
    {label:"Vídeo",   value:minParaHM(ontem.videoMin), icon:<Ico.Play     s={14} c={th.textMuted}/>},
    {label:"Replays", value:`${ontem.replays}`,        icon:<Ico.Repeat   s={14} c={th.textMuted}/>},
  ];

  return(
    <div style={{background:th.cardBg,borderRadius:14,padding:"16px 24px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,marginBottom:18,transition:"background 0.3s,border 0.3s"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <Ico.Calendar s={14} c={ACCENT}/>
        <span style={{fontSize:11,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>Meu Dia Ontem</span>
        <span style={{fontSize:11,color:th.textMuted,marginLeft:2}}>— {ontemData}</span>
        <span style={{marginLeft:8,fontSize:11,fontWeight:600,color:ACCENT,background:th.navActiveBg,padding:"2px 10px",borderRadius:20,border:`1px solid ${ACCENT}33`}}>{ontem.tipo}</span>
      </div>
      <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
        <div style={{display:"flex",gap:8,flex:1}}>
          {metricas.map(m=>(
            <div key={m.label} style={{background:th.resumeBg,borderRadius:10,padding:"10px 16px",display:"flex",flexDirection:"column",gap:4,flex:1,border:`1px solid ${th.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                {m.icon}
                <span style={{fontSize:10,fontWeight:700,color:th.textMuted,textTransform:"uppercase",letterSpacing:0.6}}>{m.label}</span>
              </div>
              <span style={{fontSize:20,fontWeight:800,color:th.text}}>{m.value}</span>
            </div>
          ))}
        </div>
        <div style={{width:1,background:th.border,margin:"0 18px"}}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px 16px",alignContent:"center",flex:1.2}}>
          {ontem.habitos.map(h=>(
            <div key={h.nome} style={{display:"flex",alignItems:"center",gap:6,minWidth:"45%"}}>
              {h.feito?<Ico.Check s={13} c={ACCENT}/>:<Ico.X s={13} c="#f87171"/>}
              <span style={{fontSize:12,color:h.feito?th.text:th.textMuted,fontWeight:h.feito?500:400}}>{h.nome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [dados,setDados]       = useState(null);
  const [erro,setErro]         = useState(null);
  const [loading,setLoading]   = useState(true);
  const [activeNav,setActiveNav] = useState("Dashboard");
  const [dark,setDark]         = useState(false);
  const [diaSel,setDiaSel]     = useState(null);
  const hoje = new Date();
  const [mesVis,setMesVis]     = useState(hoje.getMonth());
  const [anoVis,setAnoVis]     = useState(hoje.getFullYear());

  const th = dark ? DARK : LIGHT;

  const carregar=()=>{
    setLoading(true);
    fetch(API_URL)
      .then(r=>r.json())
      .then(j=>{if(j.erro)throw new Error(j.erro);setDados(j);setLoading(false);})
      .catch(e=>{setErro(e.message);setLoading(false);});
  };
  useEffect(()=>{carregar();},[]);

  const navItems=[
    {label:"Dashboard",    icon:<Ico.Target   s={17} c="currentColor"/>},
    {label:"Registros",    icon:<Ico.Book     s={17} c="currentColor"/>},
    {label:"Hábitos",      icon:<Ico.Check    s={17} c="currentColor"/>},
    {label:"Estatísticas", icon:<Ico.Trend    s={17} c="currentColor"/>},
    {label:"Livros",       icon:<Ico.BookOpen s={17} c="currentColor"/>},
    {label:"Replays",      icon:<Ico.Repeat   s={17} c="currentColor"/>},
    {label:"Configurações",icon:<Ico.Target   s={17} c="currentColor"/>},
  ];

  const m       = dados?.metricas    || {};
  const seq     = dados?.sequencias  || [];
  const rotinas = dados?.rotinas     || [];
  const resumo  = dados?.resumoMes   || {};
  const calObj  = dados?.calendario  || {};
  const diasDia = dados?.diasDetalhes|| {};
  const ontem   = dados?.ontem       || null;
  const ontemData = dados?.ontemData || "";

  const totalDiasMes = resumo.totalDias||1;
  const semanas = buildCalendario(calObj,anoVis,mesVis);
  const dataFormatada = hoje.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});

  const diaKey  = diaSel?`${anoVis}-${String(mesVis+1).padStart(2,"0")}-${String(diaSel).padStart(2,"0")}`:null;
  const detalhe = diaKey&&diasDia[diaKey];
  const modoDia = !!detalhe;

  const cardHoras   = modoDia?(detalhe.horas||0):(m.horasEstudoMes||0);
  const cardPaginas = modoDia?(detalhe.paginas||0):(m.paginasLidasMes||0);
  const cardVideo   = modoDia?(detalhe.videoMin||0):((m.videoAulasHMes||0)*60+(m.videoAulasMMin||0));
  const cardReplays = modoDia?(detalhe.replays||0):(m.replaysMes||0);
  const cardTipo    = modoDia?(detalhe.tipo||""):null;
  const metaH=modoDia?4:METAS_MENSAIS.horasEstudo;
  const metaP=modoDia?6:METAS_MENSAIS.paginasLidas;
  const metaV=modoDia?30:METAS_MENSAIS.videoAulas*60;
  const metaR=modoDia?1:METAS_MENSAIS.replays;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:th.bg,fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",transition:"background 0.3s,color 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        *{box-sizing:border-box;} button{font-family:inherit;} body{margin:0;}
      `}</style>

      {/* Sidebar */}
      <aside style={{width:240,background:th.surface,borderRight:`1px solid ${th.border}`,display:"flex",flexDirection:"column",padding:"28px 0",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto",transition:"background 0.3s,border 0.3s"}}>
        <div style={{padding:"0 24px 28px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:11,background:`linear-gradient(135deg,${ACCENT},#2da86e)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico.Target s={20} c="#fff"/>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:12,color:th.text,letterSpacing:0.5}}>EVOLUÇÃO DIÁRIA</div>
            <div style={{fontSize:10,color:th.textMuted,marginTop:2}}>Foco • Consistência • Resultado</div>
          </div>
        </div>

        <nav style={{flex:1,padding:"0 12px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(item=>(
            <button key={item.label} onClick={()=>setActiveNav(item.label)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,border:"none",cursor:"pointer",background:activeNav===item.label?th.navActiveBg:"transparent",color:activeNav===item.label?ACCENT:th.textSub,fontWeight:activeNav===item.label?700:500,fontSize:14,textAlign:"left",width:"100%",transition:"all 0.15s"}}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{padding:"20px 24px 0",borderTop:`1px solid ${th.border}`,margin:"16px 12px 0"}}>
          <div style={{fontSize:26,color:ACCENT,lineHeight:1,marginBottom:6,fontWeight:800}}>"</div>
          <p style={{fontSize:12,color:th.textSub,lineHeight:1.7,margin:0}}>Disciplina é fazer o que você sabe que é certo mesmo quando você não quer.</p>
          <p style={{fontSize:11,color:th.textMuted,marginTop:8,marginBottom:0}}>– Luciano / Al Brooks Técnico</p>
        </div>

        <div style={{padding:"16px 24px 0",margin:"0 12px"}}>
          <div style={{fontSize:10,fontWeight:700,color:th.textMuted,letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>Check-in Diário</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:dados?.checkinHoje?ACCENT:th.border2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {dados?.checkinHoje&&<Ico.Check s={12} c="#fff"/>}
            </div>
            <span style={{fontSize:13,color:dados?.checkinHoje?th.text:th.textMuted}}>{dados?.checkinHoje?"Feito hoje!":"Não registrado"}</span>
          </div>
          <button style={{width:"100%",padding:"9px 0",borderRadius:9,border:`1.5px solid ${th.border2}`,background:th.surface,color:th.text,fontWeight:600,fontSize:13,cursor:"pointer"}}>
            {dados?.checkinHoje?"Ver registro de hoje":"Fazer check-in agora"}
          </button>
        </div>
      </aside>

{/* Main */}
      {activeNav === "Estatísticas" ? <Estatisticas th={th}/> : (
      <main style={{flex:1,padding:"36px 52px 56px",overflowY:"auto",minWidth:0}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <h1 style={{fontSize:28,fontWeight:800,color:th.text,margin:0}}>Dashboard</h1>
            <p style={{fontSize:13,color:th.textMuted,margin:"4px 0 0"}}>Visão geral da sua evolução</p>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {loading&&<span style={{fontSize:12,color:th.textMuted}}>Carregando...</span>}
            <button onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:`1px solid ${th.border2}`,background:th.surface,cursor:"pointer",color:th.textSub,fontSize:12,fontWeight:600}}>
              {dark?<Ico.Sun s={14} c={th.textSub}/>:<Ico.Moon s={14} c={th.textSub}/>}
              {dark?"Claro":"Escuro"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:7,border:`1px solid ${th.border2}`,borderRadius:9,padding:"8px 14px",background:th.surface,fontSize:13,color:th.text}}>
              <Ico.Calendar s={14} c={th.textMuted}/> {dataFormatada}
            </div>
            <button onClick={carregar} style={{border:`1px solid ${th.border2}`,borderRadius:9,padding:"8px 11px",background:th.surface,cursor:"pointer",display:"flex",alignItems:"center"}} title="Atualizar">
              <Ico.Repeat s={15} c={th.textMuted}/>
            </button>
          </div>
        </div>

        {erro&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"13px 18px",marginBottom:20,color:"#dc2626",fontSize:13}}>⚠️ {erro}</div>}

        {/* Cards */}
        <div style={{display:"flex",gap:14,marginBottom:18,flexWrap:"nowrap"}}>
          {loading?Array(5).fill(0).map((_,i)=>(
            <div key={i} style={{flex:1,background:th.cardBg,borderRadius:14,padding:"20px 22px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:10}}>
              <Skeleton h={12} w="55%" th={th}/><Skeleton h={32} w="70%" th={th}/><Skeleton h={8} th={th}/>
            </div>
          )):<>
            <MetricCard th={th} icon={<Ico.Target s={20} c={ACCENT}/>} color={ACCENT} label={modoDia?"Tipo do dia":"Dia Perfeito"} value={modoDia?(cardTipo||"—"):(m.diaPerfeitoAtual??0)} unit="" sub={modoDia?undefined:`Melhor sequência: ${m.melhorSequencia??0} dias`}/>
            <MetricCard th={th} icon={<Ico.Trend  s={20} c={ACCENT}/>} color={ACCENT} label="Horas de Estudo"  value={modoDia?minParaHM((cardHoras||0)*60):`${cardHoras}h`} unit="" sub={`Meta: ${modoDia?"4h/dia":`${metaH}h/mês`}`} pctVal={pct(modoDia?(cardHoras||0)*60:cardHoras*60,metaH*60)} barColor={ACCENT}/>
            <MetricCard th={th} icon={<Ico.BookOpen s={20} c={ACCENT}/>} color={ACCENT} label="Páginas Lidas"  value={cardPaginas} unit="" sub={`Meta: ${modoDia?"6/dia":`${metaP}/mês`}`} pctVal={pct(cardPaginas,metaP)} barColor={ACCENT}/>
            <MetricCard th={th} icon={<Ico.Play   s={20} c={ACCENT}/>} color={ACCENT} label="Vídeo Aulas"     value={minParaHM(cardVideo)} unit="" sub={`Meta: ${modoDia?"30min/dia":`${metaV/60}h/mês`}`} pctVal={pct(cardVideo,metaV)} barColor={ACCENT}/>
            <MetricCard th={th} icon={<Ico.Repeat s={20} c={ACCENT}/>} color={ACCENT} label="Replays"         value={cardReplays} unit="" sub={`Meta: ${modoDia?"1/dia":`${metaR}/mês`}`} pctVal={pct(cardReplays,metaR)} barColor={ACCENT}/>
          </>}
        </div>

        {/* Meu Dia Ontem */}
        {!loading && <OntemCard ontem={ontem} ontemData={ontemData} th={th}/>}

        {modoDia&&(
          <div style={{background:dark?"#1a3028":"#f0fdf8",border:`1px solid ${dark?"#2d6b4f":"#a7e9c9"}`,borderRadius:10,padding:"10px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:ACCENT,fontWeight:600}}>📅 Exibindo dados de {String(diaSel).padStart(2,"0")}/{String(mesVis+1).padStart(2,"0")}/{anoVis}</span>
            <button onClick={()=>setDiaSel(null)} style={{fontSize:12,color:ACCENT,background:"none",border:`1px solid ${ACCENT}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontWeight:600}}>Voltar ao mês</button>
          </div>
        )}

        {/* Calendário + Sequências */}
        <div style={{display:"flex",gap:16,marginBottom:18,alignItems:"flex-start"}}>

          <div style={{background:th.cardBg,borderRadius:14,padding:"22px 26px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,flex:1.6,transition:"background 0.3s,border 0.3s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <span style={{fontWeight:800,fontSize:12,letterSpacing:0.8,color:th.text,textTransform:"uppercase"}}>Calendário de Consistência</span>
              <div style={{display:"flex",gap:14,fontSize:11,color:th.textMuted}}>
                {[[ACCENT,"Perfeito"],["#fbbf24","Quase"],["#f87171","Fraco"],["#94a3b8","—"]].map(([c,l])=>(
                  <span key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:9,height:9,borderRadius:3,background:c,display:"inline-block"}}/>{l}
                  </span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:15,color:th.text}}>{MESES_PT[mesVis]} de {anoVis}</span>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>{setDiaSel(null);if(mesVis===0){setMesVis(11);setAnoVis(a=>a-1);}else setMesVis(m=>m-1);}} style={{border:`1px solid ${th.border2}`,background:th.surface,borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:th.text}}>‹</button>
                <button onClick={()=>{setDiaSel(null);if(mesVis===11){setMesVis(0);setAnoVis(a=>a+1);}else setMesVis(m=>m+1);}} style={{border:`1px solid ${th.border2}`,background:th.surface,borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:th.text}}>›</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:5}}>
              {DIAS_SEMANA.map(ds=><div key={ds} style={{textAlign:"center",fontSize:11,fontWeight:700,color:th.textMuted,padding:"4px 0"}}>{ds}</div>)}
            </div>
            {semanas.map((sem,si)=>(
              <div key={si} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:5}}>
                {sem.map((cel,di)=>(
                  <div key={di}
                    onClick={()=>{if(cel.num)setDiaSel(diaSel===cel.num?null:cel.num);}}
                    style={{
                      background:cel.num?(th.calDayBg[cel.tipo]||th.calDayBg[0]):"transparent",
                      border:cel.num===diaSel?`2px solid ${ACCENT}`:`1px solid ${cel.num?(th.calDayBorder[cel.tipo]||"transparent"):"transparent"}`,
                      borderRadius:9,padding:"13px 0",textAlign:"center",fontSize:13,
                      fontWeight:cel.num===diaSel?800:500,
                      color:cel.num?(cel.tipo===null?th.textMuted:th.text):"transparent",
                      cursor:cel.num?"pointer":"default",
                      opacity:cel.num?1:0,
                      transition:"all 0.15s",
                    }}>
                    {cel.num||""}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{background:th.cardBg,borderRadius:14,padding:"22px 24px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,flex:1,minWidth:260,transition:"background 0.3s,border 0.3s"}}>
            <div style={{fontWeight:800,fontSize:12,letterSpacing:0.8,color:th.text,textTransform:"uppercase",marginBottom:16}}>Sequências Atuais</div>
            {loading?Array(3).fill(0).map((_,i)=><div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${th.border}`}}><Skeleton th={th}/></div>)
              :[
                {label:"Estudo 4h",        dias:seq[0]?.dias||0,icon:<Ico.Clock  s={15} c={th.textMuted}/>},
                {label:"Leitura 6 páginas",dias:seq[1]?.dias||0,icon:<Ico.Book   s={15} c={th.textMuted}/>},
                {label:"Vídeo aulas 30min",dias:seq[2]?.dias||0,icon:<Ico.Camera s={15} c={th.textMuted}/>},
              ].map(s=>(
                <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${th.border}`}}>
                  <span style={{display:"flex",alignItems:"center",gap:9,fontSize:13,color:th.textSub}}>{s.icon}{s.label}</span>
                  <span style={{fontSize:14}}>
                    <span style={{fontWeight:800,color:ACCENT}}>{s.dias}</span>
                    <span style={{color:th.textMuted,fontWeight:400}}> dias</span>
                  </span>
                </div>
              ))
            }
            <div style={{fontWeight:700,fontSize:10,color:th.textMuted,letterSpacing:1,textTransform:"uppercase",margin:"18px 0 10px"}}>Rotinas de Mercado</div>
            {loading?Array(7).fill(0).map((_,i)=><div key={i} style={{padding:"9px 0",borderBottom:`1px solid ${th.border}`}}><Skeleton th={th}/></div>)
              :rotinas.map(r=>(
                <div key={r.nome} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${th.border}`}}>
                  <span style={{display:"flex",alignItems:"center",gap:9,fontSize:13,color:th.textSub}}>
                    {r.dias>0?<Ico.Check s={14} c={ACCENT}/>:<Ico.X s={14} c="#f87171"/>}
                    {r.nome}
                  </span>
                  <span style={{fontSize:14}}>
                    <span style={{fontWeight:800,color:r.dias>0?ACCENT:th.textMuted}}>{r.dias}</span>
                    <span style={{color:th.textMuted,fontWeight:400}}> dias</span>
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Progresso + Resumo */}
        <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
          <div style={{background:th.cardBg,borderRadius:14,padding:"22px 26px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,flex:1.6,transition:"background 0.3s,border 0.3s"}}>
            <div style={{fontWeight:800,fontSize:12,letterSpacing:0.8,color:th.text,textTransform:"uppercase",marginBottom:16}}>
              Progresso das Metas
              <span style={{fontWeight:500,fontSize:12,color:th.textMuted,textTransform:"none",letterSpacing:0,marginLeft:8}}>(acumulado no ano)</span>
            </div>
            {loading?Array(4).fill(0).map((_,i)=><div key={i} style={{padding:"13px 0",borderBottom:`1px solid ${th.border}`}}><Skeleton th={th}/></div>):<>
              <ProgressBar th={th} label="Horas de estudo" icon={<Ico.Trend    s={16} c={ACCENT}/>} value={`${m.horasEstudo??0}h`}   meta={`${METAS_ANUAIS.horasEstudo}h`} pctVal={pct(m.horasEstudo,METAS_ANUAIS.horasEstudo)} color={ACCENT}/>
              <ProgressBar th={th} label="Páginas lidas"   icon={<Ico.BookOpen s={16} c={ACCENT}/>} value={m.paginasLidas??0}         meta={METAS_ANUAIS.paginasLidas}      pctVal={pct(m.paginasLidas,METAS_ANUAIS.paginasLidas)} color={ACCENT}/>
              <ProgressBar th={th} label="Vídeo aulas"     icon={<Ico.Play     s={16} c={ACCENT}/>} value={minParaHM((m.videoAulasH??0)*60+(m.videoAulasM??0))} meta={`${METAS_ANUAIS.videoAulas}h`} pctVal={pct((m.videoAulasH??0)*60+(m.videoAulasM??0),METAS_ANUAIS.videoAulas*60)} color={ACCENT}/>
              <ProgressBar th={th} label="Replays"         icon={<Ico.Repeat   s={16} c={ACCENT}/>} value={m.replays??0}              meta={METAS_ANUAIS.replays}           pctVal={pct(m.replays,METAS_ANUAIS.replays)} color={ACCENT}/>
            </>}
          </div>

          <div style={{background:th.cardBg,borderRadius:14,padding:"22px 24px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,flex:1,minWidth:260,transition:"background 0.3s,border 0.3s"}}>
            <div style={{fontWeight:800,fontSize:12,letterSpacing:0.8,color:th.text,textTransform:"uppercase",marginBottom:18}}>Resumo do Mês</div>
            {loading?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{Array(4).fill(0).map((_,i)=><Skeleton key={i} h={70} th={th}/>)}</div>
              :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[
                  {label:"Dias perfeitos",    val:resumo.diasPerfeitos??0,      color:ACCENT},
                  {label:"Quase perfeitos",   val:resumo.diasQuasePerfeitos??0, color:"#fbbf24"},
                  {label:"Dias fracos",       val:resumo.diasFracos??0,         color:"#f87171"},
                  {label:"Não registrados",   val:resumo.diasNaoRegistrados??0, color:th.textMuted},
                ].map(item=>(
                 <div key={item.label} style={{textAlign:"center",padding:"16px 8px",borderRadius:12,background:th.resumeBg,border:`1px solid ${th.border}`}}>
                    <div style={{fontSize:11,color:th.textMuted,marginBottom:6,fontWeight:500}}>{item.label}</div>
                    <div style={{fontSize:32,fontWeight:800,color:item.color,lineHeight:1}}>{item.val}</div>
                    <div style={{fontSize:12,color:th.textMuted,marginTop:5}}>{totalDiasMes>0?Math.round((item.val/totalDiasMes)*100):0}%</div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </main>
      )}
    </div>
  );
}
