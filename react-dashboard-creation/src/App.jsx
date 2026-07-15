import { useState, useEffect } from "react";
import Estatisticas from "./Estatisticas";
import Estudos from "./Estudos";
import Revisoes from "./Revisoes";
import Objetivos from "./Objetivos";
import PlanoTrade from './PlanoTrade';

const API_URL    = "https://script.google.com/macros/s/AKfycbwHp4j2xXWBeQF9OcLghTy8tvcNN6tvKNX8hyE_3Dq_Z9x5Sz5fp9UGIPVFkJ9LN4v-/exec";
const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const METAS_MENSAIS = { horasEstudo:80, paginasLidas:100, videoAulas:10, replays:20 };
const METAS_ANUAIS  = { horasEstudo:480, paginasLidas:500, videoAulas:60, replays:120 };
const DIAS_SEMANA   = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];
const MESES_PT      = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const ACCENT_LIGHT  = "#2563EB";
const ACCENT_DARK   = "#4C74C9";
const ACCENT        = ACCENT_LIGHT;

const LIGHT = {
  bg:"#f4f5f7", surface:"#ffffff", border:"#ebebeb", border2:"#e0e0e0",
  text:"#0f1117", textSub:"#4a5568", textMuted:"#8a96a3",
  navActiveBg:"#EEF2FF", cardBg:"#ffffff", cardShadow:"0 1px 4px rgba(0,0,0,0.06)",
  resumeBg:"#f8f9fa", skeletonA:"#efefef", skeletonB:"#e5e5e5",
  calDayBg:{ 1:"#e6faf2", 2:"#fff8e1", 3:"#fce4ec", 0:"#f5f5f5" },
  calDayBorder:{ 1:"#a7e9c9", 2:"#ffe082", 3:"#f48fb1", 0:"transparent" },
};
const DARK = {
  bg:"#050506", surface:"#17151d", border:"#2a2833", border2:"#343240",
  text:"#f2f2f5", textSub:"#c4c3cc", textMuted:"#8f8e9c",
  navActiveBg:"#1e2440", cardBg:"#1a1820", cardShadow:"0 1px 6px rgba(0,0,0,0.5)",
  resumeBg:"#211f28", skeletonA:"#2a2833", skeletonB:"#343240",
  calDayBg:{ 1:"#182420", 2:"#211f18", 3:"#211a1a", 0:"#161520" },
  calDayBorder:{ 1:"#3d6b52", 2:"#6b6142", 3:"#6b4444", 0:"transparent" },
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
  Check:   ({s=16,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       ({s=16,c="#f87171"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Target:  ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Trend:   ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  BookOpen:({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Play:    ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Repeat:  ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Moon:    ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun:     ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Calendar:({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Growth:  ({s=19,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><rect x="3" y="15" width="3.2" height="5" rx="0.4"/><rect x="8.4" y="11" width="3.2" height="9" rx="0.4"/><rect x="13.8" y="7.5" width="3.2" height="12.5" rx="0.4"/><path d="M3 9.5c3-0.3 6-1.6 8.2-4C13 3.7 15 2.5 17.5 2.2"/><path d="M13.5 2.4l4-0.3 0.3 4"/></svg>,
  Search:  ({s=16,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell:    ({s=16,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Expand:  ({s=14,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Collapse:({s=14,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Clipboard:({s=18,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg>,
};

function Skeleton({w="100%",h=20,r=6,th}){
  return <div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${th.skeletonA} 25%,${th.skeletonB} 50%,${th.skeletonA} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>;
}

function MetricCard({icon,color,label,value,unit,sub,pctVal,barColor,th}){
  return(
    <div style={{background:th.cardBg,borderRadius:14,padding:"14px 16px",flex:1,boxShadow:th.cardShadow,border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:5,transition:"background 0.3s,border 0.3s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:10.5,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>{label}</span>
        {icon}
      </div>
      <div style={{fontSize:26,fontWeight:800,color,lineHeight:1.1}}>
        {value}<span style={{fontSize:14,fontWeight:600}}>{unit}</span>
      </div>
      {sub&&<div style={{fontSize:11,color:th.textMuted}}>{sub}</div>}
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

function OntemCard({ontem,ontemData,th,accent}){
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
        <Ico.Calendar s={14} c={accent}/>
        <span style={{fontSize:11,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>Meu Dia Ontem</span>
        <span style={{fontSize:11,color:th.textMuted,marginLeft:2}}>— {ontemData}</span>
        <span style={{marginLeft:8,fontSize:11,fontWeight:600,color:accent,background:th.navActiveBg,padding:"2px 10px",borderRadius:20,border:`1px solid ${accent}33`}}>{ontem.tipo}</span>
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
              {h.feito?<Ico.Check s={13} c={accent}/>:<Ico.X s={13} c="#f87171"/>}
              <span style={{fontSize:12,color:h.feito?th.text:th.textMuted,fontWeight:h.feito?500:400}}>{h.nome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [dados,setDados]         = useState(null);
  const [erro,setErro]           = useState(null);
  const [loading,setLoading]     = useState(true);

  const [dadosDiario, setDadosDiario]         = useState(null);
  const [loadingDiario, setLoadingDiario]     = useState(true);
  const [revisoes, setRevisoes]               = useState([]);
  const [updates, setUpdates]                 = useState([]);
  const [tradesPorData, setTradesPorData]     = useState({});
  const [loadingRevisoes, setLoadingRevisoes] = useState(true);

  const [activeNav,setActiveNav]     = useState("Dashboard");
  const [dark,setDark]               = useState(true);
  const [sidebarExpandido,setSidebarExpandido] = useState(true);
  const [metasExpandido, setMetasExpandido] = useState(false);
    const [seqExpandido, setSeqExpandido] = useState(false);


  const [diaSel,setDiaSel]           = useState(null);
  const hoje = new Date();
  const [mesVis,setMesVis]       = useState(hoje.getMonth());
  const [anoVis,setAnoVis]       = useState(hoje.getFullYear());
  const [dadosMes, setDadosMes] = useState(null);
  const [objetivosSemanaAtual, setObjetivosSemanaAtual] = useState(null);

  function semanaISOApp(date){
    const d=new Date(date); d.setHours(0,0,0,0);
    d.setDate(d.getDate()+3-(d.getDay()+6)%7);
    const week1=new Date(d.getFullYear(),0,4);
    return { ano:d.getFullYear(), semana:1+Math.round(((d-week1)/86400000-3+(week1.getDay()+6)%7)/7) };
  }

  const [planoSemana, setPlanoSemana] = useState([]);
  const [pontosAtencao, setPontosAtencao] = useState([]);
  const [novoPlano, setNovoPlano] = useState("");
  const [novoPonto, setNovoPonto] = useState("");
  const [showFormPlano, setShowFormPlano] = useState(false);
  const [showFormPonto, setShowFormPonto] = useState(false);
  const [chaveSemanaAtual, setChaveSemanaAtual] = useState("");

  function salvarDashboardSemanalApp(novoPlanoArr, novosPontosArr){
    const { ano, semana } = semanaISOApp(new Date());
    const chave = `${ano}-S${String(semana).padStart(2,"0")}`;
    const payload = { chave, ano, semana, planoSemana: novoPlanoArr, pontosAtencao: novosPontosArr };
    fetch(`${API_DIARIO}?action=salvarDashboardSemanal&dados=${encodeURIComponent(JSON.stringify(payload))}`).catch(()=>{});
  }

  function addPlanoItem(){
    if(!novoPlano.trim()) return;
    const novo = [...planoSemana, { id: Date.now(), texto: novoPlano.trim() }];
    setPlanoSemana(novo);
    setNovoPlano("");
    salvarDashboardSemanalApp(novo, pontosAtencao);
  }
  function removePlanoItem(id){
    const novo = planoSemana.filter(p=>p.id!==id);
    setPlanoSemana(novo);
    salvarDashboardSemanalApp(novo, pontosAtencao);
  }
  function addPontoItem(){
    if(!novoPonto.trim()) return;
    const novo = [...pontosAtencao, { id: Date.now(), texto: novoPonto.trim() }];
    setPontosAtencao(novo);
    setNovoPonto("");
    salvarDashboardSemanalApp(planoSemana, novo);
  }
  function removePontoItem(id){
    const novo = pontosAtencao.filter(p=>p.id!==id);
    setPontosAtencao(novo);
    salvarDashboardSemanalApp(planoSemana, novo);
  }

  const [checklistHoje, setChecklistHoje] = useState([
    { id:1, label:"Pré MKT Gráfico", done:false },
    { id:2, label:"Pré MKT com Coach", done:false },
    { id:3, label:"Disposição registrada", done:false },
    { id:4, label:"Respiração 3-2-6", done:false },
    { id:5, label:"Diário de trades", done:false },
    { id:6, label:"Pós MKT com Coach", done:false },
  ]);
  const [naoDevoHoje, setNaoDevoHoje] = useState("");
  const [intencaoHoje, setIntencaoHoje] = useState("");
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
  const [dsiValor, setDsiValor] = useState("0");
  const [dsiMeta, setDsiMeta] = useState("0");

  function salvarDSIApp(valor, meta){
    fetch(`${API_DIARIO}?action=salvarDSI&dados=${encodeURIComponent(JSON.stringify({valor,meta}))}`).catch(()=>{});
  }

  function salvarChecklistHojeApp(novoChecklist, novoNaoDevo, novaIntencao){
    const payload = { data: hojeStr, checklist: novoChecklist, naoDevo: novoNaoDevo, intencao: novaIntencao };
    fetch(`${API_DIARIO}?action=salvarChecklistDiario&dados=${encodeURIComponent(JSON.stringify(payload))}`).catch(()=>{});
  }

  function toggleChecklistHoje(id){
    const novo = checklistHoje.map(i=>i.id===id?{...i,done:!i.done}:i);
    setChecklistHoje(novo);
    salvarChecklistHojeApp(novo, naoDevoHoje, intencaoHoje);
  }

  const th = dark ? DARK : LIGHT;
  const ACCENT_ATUAL = dark ? ACCENT_DARK : ACCENT_LIGHT;

  const carregar=()=>{
    setLoading(true);
    fetch(API_URL)
      .then(r=>r.json())
      .then(j=>{if(j.erro)throw new Error(j.erro);setDados(j);setLoading(false);})
      .catch(e=>{setErro(e.message);setLoading(false);});
  };

  const carregarDiario=(ini="",fi="")=>{
    setLoadingDiario(true);
    let url = API_DIARIO;
    const params=[];
    if(ini) params.push(`inicio=${ini}`);
    if(fi)  params.push(`fim=${fi}`);
    if(params.length) url += "?" + params.join("&");
    fetch(url)
      .then(r=>r.json())
      .then(j=>{if(j.erro)throw new Error(j.erro);setDadosDiario(j);setLoadingDiario(false);})
      .catch(()=>setLoadingDiario(false));
  };

  const carregarRevisoes=async()=>{
    setLoadingRevisoes(true);
    try {
      const [rRev, rUpd, rTrades] = await Promise.all([
        fetch(`${API_DIARIO}?action=lerRevisoes`).then(r=>r.json()),
        fetch(`${API_DIARIO}?action=lerUpdates`).then(r=>r.json()),
        fetch(`${API_DIARIO}?action=lerTradesPorData`).then(r=>r.json()),
      ]);
      setRevisoes(rRev.revisoes || []);
      setUpdates(rUpd.updates   || []);
      setTradesPorData(rTrades.porData || {});
    } catch(e){ console.error(e); }
    setLoadingRevisoes(false);
  };

  useEffect(()=>{
    carregar();
    carregarDiario();
    carregarRevisoes();

    const ini = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-01`;
    const fim = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
    fetch(`${API_DIARIO}?inicio=${ini}&fim=${fim}`)
      .then(r=>r.json())
      .then(j=>{ if(!j.erro) setDadosMes(j); })
      .catch(()=>{});

    const {ano,semana} = semanaISOApp(new Date());
    const chave = `${ano}-S${String(semana).padStart(2,"0")}`;
    fetch(`${API_DIARIO}?action=lerObjetivos`)
      .then(r=>r.json())
      .then(j=>{
        const found=(j.objetivos||[]).find(o=>o.chave===chave);
        setObjetivosSemanaAtual(found||null);
      })
      .catch(()=>{});

    fetch(`${API_DIARIO}?action=lerDashboardSemanal`)
      .then(r=>r.json())
      .then(j=>{
        const { ano, semana } = semanaISOApp(new Date());
        const chave = `${ano}-S${String(semana).padStart(2,"0")}`;
        setChaveSemanaAtual(chave);
        const found = (j.semanas||[]).find(s=>s.chave===chave);
        setPlanoSemana(found?.planoSemana || []);
        setPontosAtencao(found?.pontosAtencao || []);
      })
      .catch(()=>{});

 fetch(`${API_DIARIO}?action=lerDSI`)
      .then(r=>r.json())
      .then(j=>{
        setDsiValor(j.valor ?? "0");
        setDsiMeta(j.meta ?? "0");
      })
      .catch(()=>{});
    fetch(`${API_DIARIO}?action=lerChecklistDiario`)
      .then(r=>r.json())
      .then(j=>{
        const hojeChave = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
        const found = (j.dias||[]).find(d=>d.data===hojeChave);
        if(found){
          if(found.checklist?.length) setChecklistHoje(found.checklist);
          setNaoDevoHoje(found.naoDevo||"");
          setIntencaoHoje(found.intencao||"");
        }
      })
      .catch(()=>{});
  },[]);

  const m         = dados?.metricas    || {};
  const seq       = dados?.sequencias  || [];
  const rotinas   = dados?.rotinas     || [];
  const resumo    = dados?.resumoMes   || {};
  const calObj    = dados?.calendario  || {};
  const diasDia   = dados?.diasDetalhes|| {};
  const ontem     = dados?.ontem       || null;
  const ontemData = dados?.ontemData   || "";

  const totalDiasMes  = resumo.totalDias||1;
  const semanas       = buildCalendario(calObj,anoVis,mesVis);
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
  const metaP=modoDia?3:METAS_MENSAIS.paginasLidas;
  const metaV=modoDia?30:METAS_MENSAIS.videoAulas*60;
  const metaR=modoDia?1:METAS_MENSAIS.replays;

  const navItems = [
    {label:"Dashboard",      icon:<Ico.Target    s={19} c="currentColor"/>},
    {label:"Plano de Trade", icon:<Ico.Clipboard s={19} c="currentColor"/>},
    {label:"Estatísticas",   icon:<Ico.Trend     s={19} c="currentColor"/>},
    {label:"Revisões",       icon:<Ico.Calendar  s={19} c="currentColor"/>},
    {label:"Objetivos",      icon:<Ico.Target    s={19} c="currentColor"/>},
    {label:"Estudos",        icon:<Ico.BookOpen  s={19} c="currentColor"/>},
    {label:"Registros",      icon:<Ico.Book      s={19} c="currentColor"/>},
    {label:"Hábitos",        icon:<Ico.Check     s={19} c="currentColor"/>},
    {label:"Replays",        icon:<Ico.Repeat    s={19} c="currentColor"/>},
  ];

  const topNav = [
    { label:"Overview", target:"Dashboard", href:null },
    { label:"Diário",   target:null, href:"https://docs.google.com/spreadsheets/d/1tUS99Um-CjNX7mBpa4pXGzBsnb9jLPGes1UL7qJSUDI/edit" },
    { label:"Studies",  target:null, href:"https://app.notion.com/p/Studies-292c21dc2bf88080a4f3d4610f8f7944" },
    { label:"Reviews",  target:"Revisões", href:null },
  ];

  const renderMain = () => {
    if(activeNav === "Estatísticas") return (
      <div style={{flex:1,overflowY:"auto",minWidth:0,maxWidth:"calc(75vw - 240px)"}}>
        <Estatisticas th={th} dark={dark} setDark={setDark} dadosCache={dadosDiario} loadingCache={loadingDiario} onRecarregar={carregarDiario}/>
      </div>
    );
    if(activeNav === "Estudos") return (
      <div style={{flex:1,overflowY:"auto",minWidth:0,maxWidth:"calc(75vw - 240px)",display:"flex",flexDirection:"column"}}>
        <Estudos th={th}/>
      </div>
    );
    if(activeNav === "Objetivos") return (
      <div style={{flex:1,overflowY:"auto",minWidth:0,maxWidth:"calc(75vw - 240px)"}}>
        <Objetivos th={th} dark={dark} setDark={setDark}/>
      </div>
    );
    if(activeNav === "Revisões") return (
      <div style={{flex:1,overflowY:"auto",minWidth:0,display:"flex",flexDirection:"column",width:"100%"}}>
        <Revisoes th={th} dark={dark} setDark={setDark} revisoesProp={revisoes} updatesProp={updates} tradesPorDataProp={tradesPorData} loadingProp={loadingRevisoes} onCarregar={carregarRevisoes}/>
      </div>
    );
    if(activeNav === "Plano de Trade") return (
      <div style={{flex:1,overflowY:"auto",minWidth:0,maxWidth:"calc(75vw - 240px)"}}>
        <PlanoTrade th={th}/>
      </div>
    );

    const GRUPO_SETUP = { TRM:"#6B8CC4", FQ:"#B98FC2", TC:"#5FA8AE" };
    function corWRDash(wr){
      if(wr>=60) return dark?{bg:"#182420",border:"#3d6b52",text:"#7fb89a"}:{bg:"#eaf7f0",border:"#5cb583",text:"#2f7d52"};
      if(wr>=45) return dark?{bg:"#211f18",border:"#6b6142",text:"#c2b184"}:{bg:"#fbf6e6",border:"#d1a53d",text:"#8a6f1a"};
      return dark?{bg:"#211a1a",border:"#6b4444",text:"#c68888"}:{bg:"#fbeceb",border:"#d9776b",text:"#a83f31"};
    }
    function classificarSetup(nome){
      const n = (nome||"").toLowerCase();
      if(n === "trm") return {grupo:"TRM", label:"TRM"};
      if(n === "fq") return {grupo:"FQ", label:"FQ"};
      if(n.includes("meio de mov")) return {grupo:"TC", label:"TC Meio de Mov."};
      if(n.includes("supertrend")) return {grupo:"TC", label:"TC Supertrend"};
      if(n.includes("pós bo")||n.includes("pos bo")) return {grupo:"TC", label:"TC Pós BO"};
      if(n.includes("pré bo")||n.includes("pre bo")) return {grupo:"TC", label:"TC Pré BO"};
      return null;
    }
    const setupsClassificados = {};
    (dadosDiario?.setups||[]).forEach(s=>{
      const c = classificarSetup(s.nome);
      if(c) setupsClassificados[c.label] = { ...s, ...c };
    });
    const setupsLinhasDash = [
      [setupsClassificados["TRM"], setupsClassificados["TC Pré BO"]],
      [setupsClassificados["FQ"], setupsClassificados["TC Pós BO"]],
      [setupsClassificados["TC Meio de Mov."], setupsClassificados["TC Supertrend"]],
    ];
    const setupsMesLista = (dadosMes?.setups||[]).map(s=>{
      const c = classificarSetup(s.nome);
      return c ? { nome:c.label, wr:s.taxaAcerto, financ:s.financTotal } : null; 
    }).filter(Boolean);
    const financMes = dadosMes?.contas?.["ION 2"]?.financTotal ?? null;
    const wrMes = dadosMes?.contas?.["ION 2"]?.taxaAcerto ?? null;
const diasNoMesAtual = new Date(anoVis, mesVis+1, 0).getDate();
    const primeiroDiaSemana = new Date(anoVis, mesVis, 1).getDay();
    const offsetInicio = primeiroDiaSemana===0 ? 6 : primeiroDiaSemana-1;
    const miniCalDias = [];
    for(let i=0; i<offsetInicio; i++){
      miniCalDias.push({ dia:null, dataStr:null, r:null });
    }
    for(let d=1; d<=diasNoMesAtual; d++){
      const dataStr = `${anoVis}-${String(mesVis+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const r = tradesPorData[dataStr]?.["ION 2"] || tradesPorData[dataStr]?.["ion 2"] || null;
      miniCalDias.push({ dia:d, dataStr, r });
    }

    return (
      <div style={{width:"100%",minWidth:0,maxWidth:"calc(85vw - 240px)"}}>

        {/* Header — título, fora do split de colunas */}
        <div style={{marginBottom:16}}>
          <h1 style={{fontSize:26,fontWeight:700,color:th.text,margin:0,letterSpacing:"-0.02em"}}>Dashboard</h1>
          <p style={{fontSize:13,color:th.textMuted,margin:"4px 0 0"}}>Visão geral da sua evolução</p>
        </div>

        {erro&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"13px 18px",marginBottom:20,color:"#dc2626",fontSize:13}}>⚠️ {erro}</div>}

        {/* Split de colunas — main + sidebar direita, alinhados a partir daqui */}
        <div style={{display:"flex",gap:16,width:"100%",minWidth:0,alignItems:"flex-start"}}>
          <main style={{flex:1,minWidth:0}}>

            {/* Metric cards + data/reload na mesma linha */}
            <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"stretch"}}>
              {loading?Array(3).fill(0).map((_,i)=>(
                <div key={i} style={{flex:1,background:th.cardBg,borderRadius:14,padding:"14px 16px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:8}}>
                  <Skeleton h={10} w="55%" th={th}/><Skeleton h={26} w="70%" th={th}/><Skeleton h={6} th={th}/>
                </div>
              )):<>
                <MetricCard th={th} icon={<Ico.Trend  s={18} c={ACCENT_ATUAL}/>} color={ACCENT_ATUAL} label="Horas de Estudo" value={modoDia?minParaHM((cardHoras||0)*60):`${cardHoras}h`} unit="" sub={`Meta: ${modoDia?"4h/dia":`${metaH}h/mês`}`} pctVal={pct(modoDia?(cardHoras||0)*60:cardHoras*60,metaH*60)} barColor={ACCENT_ATUAL}/>
                <MetricCard th={th} icon={<Ico.BookOpen s={18} c={ACCENT_ATUAL}/>} color={ACCENT_ATUAL} label="Backtests" value={cardPaginas} unit="" sub={`Meta: ${modoDia?"3/dia":`${metaP}/mês`}`} pctVal={pct(cardPaginas,metaP)} barColor={ACCENT_ATUAL}/>
<MetricCard th={th} icon={<Ico.Repeat s={18} c={ACCENT_ATUAL}/>} color={ACCENT_ATUAL} label="Replays" value={cardReplays} unit="" sub={`Meta: ${modoDia?"1/dia":`${metaR}/mês`}`} pctVal={pct(cardReplays,metaR)} barColor={ACCENT_ATUAL}/>

<div style={{background:th.cardBg,borderRadius:14,padding:"14px 16px",flex:1,boxShadow:th.cardShadow,border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:5}}>
                  <span style={{fontSize:10.5,fontWeight:700,color:th.textMuted,letterSpacing:0.8,textTransform:"uppercase"}}>DSI</span>
                  <input
                    type="number"
                    value={dsiValor}
                    onChange={e=>setDsiValor(e.target.value)}
                    onBlur={()=>salvarDSIApp(dsiValor, dsiMeta)}
                    style={{fontSize:26,fontWeight:800,color:ACCENT_ATUAL,background:"transparent",border:"none",outline:"none",width:"100%",padding:0,fontFamily:"inherit"}}
                  />
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:th.textMuted}}>
                    Meta:
                    <input
                      type="number"
                      value={dsiMeta}
                      onChange={e=>setDsiMeta(e.target.value)}
                      onBlur={()=>salvarDSIApp(dsiValor, dsiMeta)}
                      style={{fontSize:11,color:th.textMuted,background:"transparent",border:"none",outline:"none",width:50,padding:0,fontFamily:"inherit"}}
                    />
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                    <div style={{flex:1,background:th.resumeBg,borderRadius:4,height:5}}>
                      <div style={{width:`${pct(Number(dsiValor)||0, Number(dsiMeta)||1)}%`,background:ACCENT_ATUAL,borderRadius:4,height:5,transition:"width 0.8s ease"}}/>
                    </div>
                    <span style={{fontSize:11,color:th.textMuted,fontWeight:600,minWidth:28}}>{pct(Number(dsiValor)||0, Number(dsiMeta)||1)}%</span>
                  </div>
                </div>
              </>}
              <div style={{flexShrink:0,marginLeft:8,display:"flex",flexDirection:"column",justifyContent:"center",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7,border:`1px solid ${th.border2}`,borderRadius:9,padding:"8px 14px",background:th.surface,fontSize:13,color:th.text,whiteSpace:"nowrap"}}>
                  <Ico.Calendar s={14} c={th.textMuted}/> {dataFormatada}
                </div>
                <button onClick={carregar} style={{border:`1px solid ${th.border2}`,borderRadius:9,padding:"8px 0",background:th.surface,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,color:th.textMuted}} title="Atualizar">
                  <Ico.Repeat s={14} c={th.textMuted}/> Atualizar
                </button>
              </div>
            </div>

            {!loading && <OntemCard ontem={ontem} ontemData={ontemData} th={th} accent={ACCENT_ATUAL}/>}

            {modoDia&&(
              <div style={{background:dark?"#1a3028":"#f0fdf8",border:`1px solid ${dark?"#2d6b4f":"#a7e9c9"}`,borderRadius:10,padding:"10px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:ACCENT_ATUAL,fontWeight:600}}>📅 Exibindo dados de {String(diaSel).padStart(2,"0")}/{String(mesVis+1).padStart(2,"0")}/{anoVis}</span>
                <button onClick={()=>setDiaSel(null)} style={{fontSize:12,color:ACCENT_ATUAL,background:"none",border:`1px solid ${ACCENT_ATUAL}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontWeight:600}}>Voltar ao mês</button>
              </div>
            )}

{/* Resultados do Mês + Status dos Setups | Calendário + (Hoje / Não devo+Intenção) */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gridAutoRows:"auto",gap:16,marginBottom:18}}>

              {/* Linha 1, Coluna A: Resultados do Mês */}
              <div style={{background:th.cardBg,borderRadius:14,padding:"20px 22px",border:`1px solid ${th.border}`,boxShadow:th.cardShadow,display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontWeight:700,fontSize:11.5,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.08em"}}>Resultados do Mês</span>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <span style={{fontSize:18,fontWeight:800,color:financMes==null?th.textMuted:(financMes>=0?(dark?"#7fb89a":"#2f7d52"):(dark?"#c68888":"#a83f31"))}}>
                      {financMes==null?"—":(financMes>=0?"+":"−")+"R$ "+Math.abs(financMes).toFixed(0)}
                    </span>
                    <span style={{fontSize:11,color:th.textMuted}}>{wrMes!=null?`WR ${wrMes}%`:""}</span>
                  </div>
                </div>
                {(dadosDiario?.graficoION2?.length||0) > 0 ? (
                  <svg viewBox="0 0 600 200" style={{width:"100%",height:"auto",display:"block"}}>
                    {(() => {
                      const pontosMes = dadosDiario.graficoION2.filter(p=>p.data.startsWith(`${anoVis}-${String(mesVis+1).padStart(2,"0")}`));
                      if(pontosMes.length < 2) return <text x="300" y="100" textAnchor="middle" fontSize="13" fill={th.textMuted}>Dados insuficientes no mês</text>;
                      const vals = pontosMes.map(p=>p.valor);
                      const maxV = Math.max(...vals,0), minV = Math.min(...vals,0);
                      const range = (maxV-minV)||1;
                      const padL=48,padR=14,padT=18,padB=26,W=600,H=200;
                      const plotW=W-padL-padR, plotH=H-padT-padB;
                      const pts = pontosMes.map((p,i)=>({
                        ...p,
                        x: padL+(i/(pontosMes.length-1))*plotW,
                        y: padT+plotH-((p.valor-minV)/range)*plotH,
                      }));
                      const zeroY = padT+plotH-((0-minV)/range)*plotH;
                      const linePath = pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
                      return (
                        <>
                          <line x1={padL} y1={zeroY} x2={W-padR} y2={zeroY} stroke={th.border2} strokeWidth="1" strokeDasharray="3,3"/>
                          {[minV,(minV+maxV)/2,maxV].map((v,i)=>{
                            const y = padT+plotH-((v-minV)/range)*plotH;
                            return <text key={i} x={padL-8} y={y+4} textAnchor="end" fontSize="11" fill={th.textMuted}>{Math.round(v)}</text>;
                          })}
                          <path d={`${linePath} L${pts[pts.length-1].x},${zeroY} L${pts[0].x},${zeroY} Z`} fill={ACCENT_ATUAL} opacity="0.08"/>
                          <path d={linePath} fill="none" stroke={ACCENT_ATUAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          {pts.map((p,i)=>(
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="3.5" fill={ACCENT_ATUAL} stroke={th.cardBg} strokeWidth="2"/>
                              {(i===pts.length-1 || i%3===0) && (
                                <text x={p.x} y={p.y-10} textAnchor="middle" fontSize="11" fontWeight="700" fill={th.text}>{p.valor>=0?"+":""}{Math.round(p.valor)}</text>
                              )}
                              <text x={p.x} y={H-6} textAnchor="middle" fontSize="10" fill={th.textMuted}>{p.data.slice(8,10)}/{p.data.slice(5,7)}</text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                ) : <div style={{padding:"40px 0",textAlign:"center",color:th.textMuted,fontSize:12}}>Carregando gráfico...</div>}

                {setupsMesLista.length>0 && (
                  <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
                    {setupsMesLista.map(s=>(
                      <div key={s.nome} style={{flex:1,minWidth:130,background:th.resumeBg,borderRadius:10,padding:"12px 16px",border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:4}}>
                        <div style={{fontSize:13,fontWeight:700,color:th.text}}>{s.nome}</div>
                        <div style={{fontSize:12,color:th.textMuted}}>WR {s.wr}%</div>
                        <div style={{fontSize:15,fontWeight:800,color:s.financ>=0?(dark?"#7fb89a":"#2f7d52"):(dark?"#c68888":"#a83f31")}}>{s.financ>=0?"+":"−"}R$ {Math.abs(s.financ).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linha 1, Coluna B: Calendário — mesma linha do grid, estica pra mesma altura automaticamente */}
              <div style={{background:th.cardBg,borderRadius:14,padding:"18px 20px",border:`1px solid ${th.border}`,boxShadow:th.cardShadow,position:"relative",display:"flex",flexDirection:"column",height:"100%"}}>
                <span style={{fontSize:12,fontWeight:700,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,display:"block"}}>{MESES_PT[mesVis]}</span>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
                  {DIAS_SEMANA.map(ds=>(
                    <div key={ds} style={{textAlign:"center",fontSize:10,fontWeight:700,color:th.textMuted,padding:"2px 0"}}>{ds}</div>
                  ))}
                </div>
                <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(7,1fr)",gridTemplateRows:`repeat(${Math.ceil(miniCalDias.length/7)},1fr)`,gap:4}}>
                  {miniCalDias.map(({dia,r},idx)=>{
                    if(dia===null) return <div key={`vazio-${idx}`}/>;
                    const cor = !r ? th.resumeBg : (r.resultado>=0 ? (dark?"#1a7048":"#eaf7f0") : (dark?"#421c26":"#fbeceb"));
                    return (
                      <div key={dia} onClick={()=>setDiaSel(dia===diaSel?null:dia)}
                        style={{borderRadius:6,background:cor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:r?th.text:th.textMuted,cursor:"pointer",fontWeight:r?700:400}}>
                        {dia}
                      </div>
                    );
                  })}
                </div>
                {diaSel && tradesPorData[`${anoVis}-${String(mesVis+1).padStart(2,"0")}-${String(diaSel).padStart(2,"0")}`]?.["ION 2"] && (() => {
                  const key = `${anoVis}-${String(mesVis+1).padStart(2,"0")}-${String(diaSel).padStart(2,"0")}`;
                  const r = tradesPorData[key]["ION 2"];
                  return (
                    <>
                      <div onClick={()=>setDiaSel(null)} style={{position:"fixed",inset:0,zIndex:9,background:"transparent"}}/>
                      <div style={{position:"absolute",top:52,right:8,left:8,background:th.cardBg,borderRadius:14,padding:"18px 20px",boxShadow:"0 8px 24px rgba(0,0,0,0.4)",border:`1px solid ${th.border}`,zIndex:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                          <span style={{fontSize:14,fontWeight:700,color:th.text}}>{String(diaSel).padStart(2,"0")}/{String(mesVis+1).padStart(2,"0")}</span>
                        </div>
                        <div style={{display:"flex",gap:16,marginBottom:14}}>
                          <div><div style={{fontSize:19,fontWeight:800,color:r.resultado>=0?(dark?"#7fb89a":"#2f7d52"):(dark?"#c68888":"#a83f31")}}>{r.resultado>=0?"+":"−"}R$ {Math.abs(r.resultado).toFixed(0)}</div><div style={{fontSize:12,color:th.textMuted}}>Resultado</div></div>
                          <div><div style={{fontSize:19,fontWeight:800,color:th.text}}>{r.trades}</div><div style={{fontSize:12,color:th.textMuted}}>Operações</div></div>
                          <div><div style={{fontSize:19,fontWeight:800,color:th.text}}>{r.taxaAcerto}%</div><div style={{fontSize:12,color:th.textMuted}}>Acerto</div></div>
                        </div>
                        <div onClick={()=>setActiveNav("Revisões")} style={{fontSize:13,color:ACCENT_ATUAL,fontWeight:700,cursor:"pointer"}}>Mais detalhes →</div>
                      </div>
                    </>
                  );
                })()}
              </div>

{/* Linha 2, Coluna A: Status dos Setups */}
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{fontWeight:700,fontSize:11.5,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Status dos Setups</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,flex:1}}>
                  {setupsLinhasDash.map((linha,li)=>(
                    <div key={li} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,flex:1}}>
                      {linha.map((s,ci)=> s ? (
                        <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:th.cardBg,border:`1px solid ${th.border}`,borderLeft:`3px solid ${GRUPO_SETUP[s.grupo]}`,height:"100%",boxSizing:"border-box"}}>
                          <span style={{fontSize:11.5,fontWeight:700,color:th.text}}>{s.label}</span>
                          <div style={{display:"flex",gap:5,alignItems:"center"}}>
                            <span style={{fontSize:10,fontWeight:700,color:corWRDash(s.taxaAcerto).text,background:corWRDash(s.taxaAcerto).bg,border:`1px solid ${corWRDash(s.taxaAcerto).border}`,borderRadius:20,padding:"1px 6px"}}>{s.taxaAcerto}%</span>
                            <span style={{fontSize:9,color:th.textMuted}}>n={s.trades}</span>
                          </div>
                        </div>
                      ) : <div key={ci} style={{padding:"8px 12px",borderRadius:10,background:th.resumeBg,border:`1px dashed ${th.border2}`,fontSize:10,color:th.textMuted,display:"flex",alignItems:"center",height:"100%",boxSizing:"border-box"}}>Sem dados</div>)}
                    </div>
                  ))}
                </div>
              </div>

{/* Linha 2, Coluna B: Hoje | Não devo + Intenção */}
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{fontWeight:700,fontSize:11.5,color:"transparent",marginBottom:10,userSelect:"none"}}>.</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,flex:1}}>
                  <div style={{background:th.cardBg,borderRadius:14,padding:"16px 18px",border:`1px solid ${th.border}`,boxShadow:th.cardShadow}}>
                    <span style={{fontSize:11,fontWeight:700,color:th.textSub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Hoje</span>
                    <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:12}}>
                      {checklistHoje.map(item=>(
                        <div key={item.id} onClick={()=>toggleChecklistHoje(item.id)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                          <div style={{width:15,height:15,borderRadius:4,border:`2px solid ${item.done?ACCENT_ATUAL:th.border2}`,background:item.done?ACCENT_ATUAL:"transparent",flexShrink:0}}/>
                          <span style={{fontSize:13,color:item.done?th.text:th.textMuted}}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{flex:1,background:th.cardBg,borderRadius:14,padding:"14px 16px",border:`1px solid ${th.border}`,boxShadow:th.cardShadow,borderLeft:"3px solid #A6795F",display:"flex",flexDirection:"column"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#A6795F",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>⚠ Hoje eu NÃO devo</div>
                      <textarea
                        value={naoDevoHoje}
                        onChange={e=>setNaoDevoHoje(e.target.value)}
                        onBlur={()=>salvarChecklistHojeApp(checklistHoje, naoDevoHoje, intencaoHoje)}
                        placeholder="O que evitar hoje..."
                        style={{width:"100%",flex:1,background:"transparent",border:"none",outline:"none",fontSize:12.5,color:th.textSub,lineHeight:1.5,resize:"none",fontFamily:"inherit",boxSizing:"border-box"}}
                      />
                    </div>

                    <div style={{flex:1,background:ACCENT_ATUAL+"0f",borderRadius:14,padding:"14px 16px",border:`1px solid ${ACCENT_ATUAL}33`,display:"flex",flexDirection:"column"}}>
                      <div style={{fontSize:9,fontWeight:800,color:ACCENT_ATUAL,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Intenção do dia</div>
                      <textarea
                        value={intencaoHoje}
                        onChange={e=>setIntencaoHoje(e.target.value)}
                        onBlur={()=>salvarChecklistHojeApp(checklistHoje, naoDevoHoje, intencaoHoje)}
                        placeholder="Foco de hoje..."
                        style={{width:"100%",flex:1,background:"transparent",border:"none",outline:"none",fontSize:12.5,color:th.text,lineHeight:1.5,resize:"none",fontFamily:"inherit",boxSizing:"border-box"}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            </main>

          {/* Sidebar direita — não estica até o fim, só até a altura do próprio conteúdo */}
          <aside style={{width:340,flexShrink:0,display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:th.cardBg,borderRadius:14,border:`1px solid ${th.border}`,padding:"16px 16px",boxShadow:th.cardShadow}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <Ico.Clipboard s={16} c={ACCENT_ATUAL}/>
                <span style={{fontWeight:700,fontSize:12,color:ACCENT_ATUAL,textTransform:"uppercase",letterSpacing:"0.06em"}}>Plano da Semana</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
                {planoSemana.map(p=>(
                  <div key={p.id} style={{background:th.resumeBg,borderRadius:8,padding:"9px 11px",border:`1px solid ${th.border}`,display:"flex",gap:8,alignItems:"flex-start",minWidth:0,overflow:"hidden"}}>
                    <span style={{fontSize:13,color:th.text,lineHeight:1.4,flex:1,wordBreak:"break-word",overflowWrap:"break-word",minWidth:0}}>{p.texto}</span>
                    <span onClick={()=>removePlanoItem(p.id)} style={{cursor:"pointer",color:th.textMuted,fontSize:16}}>×</span>
                  </div>
                ))}
                {planoSemana.length===0 && <div style={{fontSize:12,color:th.textMuted}}>Nenhum item ainda.</div>}
              </div>
              {showFormPlano ? (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <textarea autoFocus value={novoPlano} onChange={e=>setNovoPlano(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlanoItem()} placeholder="Novo item do plano..." rows={2} style={{fontSize:13,padding:"8px 10px",border:`1px solid ${th.border2}`,borderRadius:8,outline:"none",fontFamily:"inherit",resize:"none",boxSizing:"border-box",background:th.resumeBg,color:th.text}}/>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{addPlanoItem();setShowFormPlano(false);}} style={{flex:1,background:ACCENT_ATUAL,color:"#fff",border:"none",borderRadius:8,padding:"7px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Adicionar</button>
                    <button onClick={()=>{setShowFormPlano(false);setNovoPlano("");}} style={{background:"none",border:`1px solid ${th.border2}`,color:th.textMuted,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <button onClick={()=>setShowFormPlano(true)} style={{background:"none",border:`1px solid ${ACCENT_ATUAL}`,color:ACCENT_ATUAL,borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Adicionar</button>
                </div>
              )}
            </div>

            <div style={{background:th.cardBg,borderRadius:14,border:`1px solid ${th.border}`,padding:"16px 16px",boxShadow:th.cardShadow}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{width:16,height:16,borderRadius:"50%",background:"#c68888",color:"#1a1219",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>!</span>
                <span style={{fontWeight:700,fontSize:12,color:"#c68888",textTransform:"uppercase",letterSpacing:"0.06em"}}>Pontos de Atenção</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
                {pontosAtencao.map(p=>(
                  <div key={p.id} style={{background:th.resumeBg,borderRadius:8,padding:"9px 11px",border:`1px solid ${th.border}`,display:"flex",gap:8,alignItems:"flex-start",minWidth:0,overflow:"hidden"}}>
                    <span style={{fontSize:13,color:th.text,lineHeight:1.4,flex:1,wordBreak:"break-word",overflowWrap:"break-word",minWidth:0}}>{p.texto}</span>
                    <span onClick={()=>removePontoItem(p.id)} style={{cursor:"pointer",color:th.textMuted,fontSize:16}}>×</span>
                  </div>
                ))}
                {pontosAtencao.length===0 && <div style={{fontSize:12,color:th.textMuted}}>Nenhum ponto ainda.</div>}
              </div>
              {showFormPonto ? (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <textarea autoFocus value={novoPonto} onChange={e=>setNovoPonto(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPontoItem()} placeholder="Novo ponto..." rows={2} style={{fontSize:13,padding:"8px 10px",border:`1px solid ${th.border2}`,borderRadius:8,outline:"none",fontFamily:"inherit",resize:"none",boxSizing:"border-box",background:th.resumeBg,color:th.text}}/>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{addPontoItem();setShowFormPonto(false);}} style={{flex:1,background:"#c68888",color:"#1a1219",border:"none",borderRadius:8,padding:"7px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Adicionar</button>
                    <button onClick={()=>{setShowFormPonto(false);setNovoPonto("");}} style={{background:"none",border:`1px solid ${th.border2}`,color:th.textMuted,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <button onClick={()=>setShowFormPonto(true)} style={{background:"none",border:`1px solid #c68888`,color:"#c68888",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Adicionar</button>
                </div>
              )}
            </div>

            {objetivosSemanaAtual && (objetivosSemanaAtual.objetivos||[]).length>0 && (
              <div style={{background:th.cardBg,borderRadius:14,border:`1px solid ${th.border}`,padding:"16px 16px",boxShadow:th.cardShadow}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:13}}>🎯</span>
                  <span style={{fontWeight:700,fontSize:12,color:"#7fb89a",textTransform:"uppercase",letterSpacing:"0.06em"}}>Objetivos da Semana</span>
                </div>
                <div style={{fontSize:10,color:th.textMuted,marginBottom:10}}>Sincronizado com a aba Objetivos</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {objetivosSemanaAtual.objetivos.map(o=>(
                    <div key={o.id} style={{background:th.resumeBg,borderRadius:8,padding:"9px 11px",border:`1px solid ${th.border}`,display:"flex",flexDirection:"column",gap:5,opacity:o.feito?0.55:1}}>
                      <span style={{fontSize:10,fontWeight:700,padding:"1px 8px",borderRadius:20,background:th.navActiveBg,color:ACCENT_ATUAL,width:"fit-content"}}>{o.categoria}</span>
                      <span style={{fontSize:12,color:th.text,textDecoration:o.feito?"line-through":"none",lineHeight:1.4}}>{o.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{background:th.cardBg,borderRadius:14,padding:"16px 18px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`}}>
              <div onClick={()=>setSeqExpandido(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <span style={{fontWeight:700,fontSize:11,letterSpacing:"0.06em",color:th.textSub,textTransform:"uppercase"}}>Sequências Atuais</span>
                <span style={{color:th.textMuted,fontSize:13}}>{seqExpandido?"▲":"▼"}</span>
              </div>
              {seqExpandido && (
                <div style={{marginTop:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${th.border}`}}>
                    <span style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:th.textSub}}><Ico.Clock s={14} c={th.textMuted}/>Estudo 4h</span>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13}}>
                        <span style={{fontWeight:800,color:ACCENT_ATUAL}}>{seq[0]?.dias||0}</span>
                        <span style={{color:th.textMuted,fontWeight:400}}> dias</span>
                      </span>
                      <span style={{fontSize:10,color:th.textMuted,minWidth:40,textAlign:"right"}}>PR: {seq[0]?.pr||0}</span>
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${th.border}`}}>
                    <span style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:th.textSub}}><Ico.BookOpen s={14} c={th.textMuted}/>3+ Backtests/dia</span>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13}}>
                        <span style={{fontWeight:800,color:ACCENT_ATUAL}}>{seq[1]?.dias||0}</span>
                        <span style={{color:th.textMuted,fontWeight:400}}> dias</span>
                      </span>
                      <span style={{fontSize:10,color:th.textMuted,minWidth:40,textAlign:"right"}}>PR: {seq[1]?.pr||0}</span>
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0"}}>
                    <span style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:th.textSub}}><Ico.Repeat s={14} c={th.textMuted}/>1 Replay por dia</span>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13}}>
                        <span style={{fontWeight:800,color:ACCENT_ATUAL}}>{rotinas.find(r=>r.nome.toLowerCase().includes("replay"))?.dias||0}</span>
                        <span style={{color:th.textMuted,fontWeight:400}}> dias</span>
                      </span>
                      <span style={{fontSize:10,color:th.textMuted,minWidth:40,textAlign:"right"}}>PR: {rotinas.find(r=>r.nome.toLowerCase().includes("replay"))?.pr||0}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div style={{background:th.cardBg,borderRadius:14,padding:"16px 18px",boxShadow:th.cardShadow,border:`1px solid ${th.border}`}}>
              <div onClick={()=>setMetasExpandido(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <span style={{fontWeight:700,fontSize:11,letterSpacing:"0.06em",color:th.textSub,textTransform:"uppercase"}}>Progresso das Metas</span>
                <span style={{color:th.textMuted,fontSize:13}}>{metasExpandido?"▲":"▼"}</span>
              </div>
{metasExpandido && (
                <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:12}}>
                  {[
                    {label:"Horas de estudo", icon:<Ico.Trend  s={14} c={ACCENT_ATUAL}/>, value:`${m.horasEstudo??0}h`, meta:`${METAS_ANUAIS.horasEstudo}h`, pctVal:pct(m.horasEstudo,METAS_ANUAIS.horasEstudo)},
                    {label:"Backtests",       icon:<Ico.BookOpen s={14} c={ACCENT_ATUAL}/>, value:m.paginasLidas??0, meta:METAS_ANUAIS.paginasLidas, pctVal:pct(m.paginasLidas,METAS_ANUAIS.paginasLidas)},
                    {label:"Replays",         icon:<Ico.Repeat s={14} c={ACCENT_ATUAL}/>, value:m.replays??0, meta:METAS_ANUAIS.replays, pctVal:pct(m.replays,METAS_ANUAIS.replays)},
                  ].map(item=>(
                    <div key={item.label}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <span style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:th.textSub}}>{item.icon}{item.label}</span>
                        <span style={{fontSize:11,color:th.textMuted}}>{item.value} / {item.meta}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,background:th.resumeBg,borderRadius:6,height:6}}>
                          <div style={{width:`${item.pctVal}%`,background:ACCENT_ATUAL,borderRadius:6,height:6,transition:"width 0.8s ease"}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:th.text,minWidth:30,textAlign:"right"}}>{item.pctVal}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
</div>
          </aside>
        </div>
      </div>
    );
  };

  return(
    <div style={{background:th.bg,minHeight:"100vh",padding:"22px 26px",fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",transition:"background 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        *{box-sizing:border-box;} button{font-family:inherit;} body{margin:0;display:block;min-width:unset;min-height:unset;}
      `}</style>

      {/* TOP FLOATING PILL NAV */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:th.surface,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ico.Growth c={ACCENT_ATUAL} s={19}/>
          </div>
          <span style={{fontWeight:700,fontSize:14,color:th.text}}>Evolução Diária</span>
        </div>

        <nav style={{display:"flex",gap:10}}>
          {topNav.map(n=>{
            const isActiveTarget = n.target && activeNav===n.target;
            const content=(
              <div onClick={()=>n.target && setActiveNav(n.target)} style={{
                padding:"9px 22px",borderRadius:24,fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",cursor:"pointer",
                background:isActiveTarget?ACCENT_ATUAL:th.surface,
                border:`1px solid ${isActiveTarget?ACCENT_ATUAL:th.border}`,
                color:isActiveTarget?"#fff":th.textMuted,
              }}>
                {n.label}
              </div>
            );
            return n.href
              ? <a key={n.label} href={n.href} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>{content}</a>
              : <div key={n.label}>{content}</div>;
          })}
        </nav>

        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setDark(d=>!d)} style={{width:36,height:36,borderRadius:"50%",background:th.surface,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} title={dark?"Tema claro":"Tema escuro"}>
            {dark?<Ico.Sun s={15} c={th.textMuted}/>:<Ico.Moon s={15} c={th.textMuted}/>}
          </button>
          <div style={{width:36,height:36,borderRadius:"50%",background:th.surface,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico.Search c={th.textMuted}/>
          </div>
          <div style={{width:36,height:36,borderRadius:"50%",background:th.surface,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico.Bell c={th.textMuted}/>
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:28,alignItems:"flex-start"}}>

        {/* SIDEBAR FLUTUANTE — não estica até o fim, altura pelo próprio conteúdo */}
        <aside style={{
          width:sidebarExpandido?230:74, background:th.surface, borderRadius:30, border:`1px solid ${th.border}`,
          padding:sidebarExpandido?"18px 12px":"18px 0", display:"flex", flexDirection:"column",
          alignItems:sidebarExpandido?"stretch":"center", gap:3, flexShrink:0,
          transition:"width 0.2s ease",
        }}>
          {navItems.map(item=>{
            const ativo = activeNav===item.label;
            return (
              <button key={item.label} onClick={()=>setActiveNav(item.label)} title={sidebarExpandido?undefined:item.label} style={{
                display:"flex",alignItems:"center",gap:sidebarExpandido?10:0,justifyContent:sidebarExpandido?"flex-start":"center",
                width:sidebarExpandido?"100%":46,height:sidebarExpandido?"auto":46,padding:sidebarExpandido?"11px 14px":0,
                borderRadius:sidebarExpandido?14:16,border:"none",cursor:"pointer",
                background:ativo?ACCENT_ATUAL:"transparent",color:ativo?"#fff":th.textMuted,
                fontSize:14,fontWeight:ativo?600:500,
              }}>
                {item.icon}
                {sidebarExpandido && <span>{item.label}</span>}
              </button>
            );
          })}

          <div style={{marginTop:sidebarExpandido?12:8,borderTop:`1px solid ${th.border}`,paddingTop:sidebarExpandido?12:8,display:"flex",justifyContent:"center"}}>
            <div onClick={()=>setSidebarExpandido(v=>!v)} style={{width:32,height:32,borderRadius:12,background:th.resumeBg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              {sidebarExpandido?<Ico.Collapse c={th.textMuted}/>:<Ico.Expand c={th.textMuted}/>}
            </div>
          </div>
        </aside>

        {renderMain()}
      </div>
    </div>
  );
}
