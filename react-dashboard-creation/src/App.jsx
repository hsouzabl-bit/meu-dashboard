import { useState, useEffect, useRef } from "react";
import Estatisticas from "./Estatisticas";
import Estudos from "./Estudos";
import Revisoes from "./Revisoes";
import Objetivos from "./Objetivos";
import PlanoTrade from './PlanoTrade';
import Habitos from './Habitos';
import Replays from './Replays';

const API_URL    = "https://script.google.com/macros/s/AKfycbwHp4j2xXWBeQF9OcLghTy8tvcNN6tvKNX8hyE_3Dq_Z9x5Sz5fp9UGIPVFkJ9LN4v-/exec";
const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";

const DIAS_SEMANA = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"];
const MESES_PT    = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const BASE_DARK = {
  text:"#f2f2f5", textSub:"#c4c3cc", textMuted:"#8f8e9c",
  cardShadow:"0 1px 6px rgba(0,0,0,0.6)",
};
const BASE_LIGHT = {
  text:"#0f1117", textSub:"#4a5568", textMuted:"#8a96a3",
  cardShadow:"0 1px 4px rgba(0,0,0,0.06)",
};

const THEMES = [
  { id:"framboesa", nome:"Framboesa", dark:true, accent:"#A83259", ...BASE_DARK,
    bg:"#030303", surface:"#131218", border:"#26242d", border2:"#312e3a",
    cardBg:"#16151a", resumeBg:"#1e1c24", navActiveBg:"#2e1420",
    skeletonA:"#26242d", skeletonB:"#312e3a" },

  { id:"esmeralda", nome:"Esmeralda", dark:true, accent:"#2E9E6B", ...BASE_DARK,
    bg:"#030403", surface:"#141614", border:"#252a27", border2:"#303632",
    cardBg:"#171917", resumeBg:"#1f221f", navActiveBg:"#16291f",
    skeletonA:"#252a27", skeletonB:"#303632" },

  { id:"cobalto", nome:"Cobalto", dark:true, accent:"#3B6FD4", ...BASE_DARK,
    bg:"#020305", surface:"#101319", border:"#1f2531", border2:"#2a313f",
    cardBg:"#14181f", resumeBg:"#1b202a", navActiveBg:"#14264a",
    skeletonA:"#1f2531", skeletonB:"#2a313f" },

  { id:"ambar", nome:"Âmbar", dark:true, accent:"#C77A2B", ...BASE_DARK,
    bg:"#040403", surface:"#161514", border:"#2a2723", border2:"#35322d",
    cardBg:"#191714", resumeBg:"#221f1b", navActiveBg:"#2e2214",
    skeletonA:"#2a2723", skeletonB:"#35322d" },

  { id:"indigo", nome:"Índigo", dark:false, accent:"#2e2e8c", ...BASE_LIGHT,
    bg:"#f4f5f7", surface:"#ffffff", border:"#ebebeb", border2:"#e0e0e0",
    cardBg:"#ffffff", resumeBg:"#f8f9fa", navActiveBg:"#E5E1F9",
    skeletonA:"#efefef", skeletonB:"#e5e5e5" },

  { id:"grafite", nome:"Grafite", dark:false, accent:"#3a3a42", ...BASE_LIGHT,
    text:"#23242a", textSub:"#4d4f57", textMuted:"#7c7e88",
    cardShadow:"0 1px 3px rgba(0,0,0,0.05)",
    bg:"#dedee1", surface:"#ececed", border:"#cfcfd4", border2:"#c2c2c8",
    cardBg:"#e8e8ea", resumeBg:"#dfdfe2", navActiveBg:"#cdcdd3",
    skeletonA:"#d8d8dc", skeletonB:"#cccdd1" },

  { id:"musgo", nome:"Musgo", dark:false, accent:"#2F7D5A", ...BASE_LIGHT,
    bg:"#f3f6f4", surface:"#ffffff", border:"#e6ebe8", border2:"#dae1dd",
    cardBg:"#ffffff", resumeBg:"#f6f9f7", navActiveBg:"#dcefe5",
    skeletonA:"#eef1ef", skeletonB:"#e3e8e5" },

  { id:"ametista", nome:"Ametista", dark:true, accent:"#8B5CF6", ...BASE_DARK,
    bg:"#030304", surface:"#151418", border:"#27262e", border2:"#32313a",
    cardBg:"#18171c", resumeBg:"#201f26", navActiveBg:"#2b1d47",
    skeletonA:"#27262e", skeletonB:"#32313a" },

  { id:"aco", nome:"Aço", dark:true, accent:"#5B7C99", ...BASE_DARK,
    bg:"#030405", surface:"#141618", border:"#262a2e", border2:"#313539",
    cardBg:"#17191c", resumeBg:"#1f2226", navActiveBg:"#1d2f3d",
    skeletonA:"#262a2e", skeletonB:"#313539" },

  { id:"areia", nome:"Areia", dark:false, accent:"#8A6A3D", ...BASE_LIGHT,
    text:"#2a2721", textSub:"#55514a", textMuted:"#85807a",
    cardShadow:"0 1px 3px rgba(0,0,0,0.05)",
    bg:"#e3dfd8", surface:"#efece6", border:"#d4cfc5", border2:"#c8c2b6",
    cardBg:"#ebe8e2", resumeBg:"#e3dfd8", navActiveBg:"#d8cdb9",
    skeletonA:"#ddd8cf", skeletonB:"#d0cabf" },

  { id:"nevoa", nome:"Névoa", dark:false, accent:"#3E6C8C", ...BASE_LIGHT,
    text:"#22282c", textSub:"#4b5359", textMuted:"#7b848a",
    cardShadow:"0 1px 3px rgba(0,0,0,0.05)",
    bg:"#dce1e4", surface:"#eaeef0", border:"#cbd2d6", border2:"#bec6cb",
    cardBg:"#e6eaed", resumeBg:"#dde2e5", navActiveBg:"#c9dae4",
    skeletonA:"#d6dcdf", skeletonB:"#c9d1d5" },

  { id:"oliva", nome:"Oliva", dark:false, accent:"#5C7343", ...BASE_LIGHT,
    text:"#262a20", textSub:"#4f5449", textMuted:"#7e8378",
    cardShadow:"0 1px 3px rgba(0,0,0,0.05)",
    bg:"#dfe1da", surface:"#ebede6", border:"#cdd0c5", border2:"#c0c4b7",
    cardBg:"#e7e9e1", resumeBg:"#dfe1da", navActiveBg:"#d3ddc4",
    skeletonA:"#d9dbd2", skeletonB:"#cccfc3" },
];

function pct(v,total){ return !total?0:Math.min(100,Math.round((v/total)*100)); }

const Ico = {
  Check:   ({s=16,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Target:  ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Trend:   ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  BookOpen:({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Repeat:  ({s=20,c="#4ecb8d"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Calendar:({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Growth:  ({s=19,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><rect x="3" y="15" width="3.2" height="5" rx="0.4"/><rect x="8.4" y="11" width="3.2" height="9" rx="0.4"/><rect x="13.8" y="7.5" width="3.2" height="12.5" rx="0.4"/><path d="M3 9.5c3-0.3 6-1.6 8.2-4C13 3.7 15 2.5 17.5 2.2"/><path d="M13.5 2.4l4-0.3 0.3 4"/></svg>,
  Expand:  ({s=14,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Collapse:({s=14,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Palette: ({s=15,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".8"/><circle cx="17.5" cy="10.5" r=".8"/><circle cx="8.5" cy="7.5" r=".8"/><circle cx="6.5" cy="12.5" r=".8"/><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-10z"/></svg>,
  Clipboard:({s=18,c})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg>,
};

function Skeleton({w="100%",h=20,r=6,th}){
  return <div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${th.skeletonA} 25%,${th.skeletonB} 50%,${th.skeletonA} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>;
}

// Contas ativas desde out/2026 — os nomes são os das abas da planilha
// Gestão Trader 2026, e o GAS devolve porData chaveado por eles.
const CONTA_MIDE3 = "MIDE 3 (recovery)";
const CONTA_REAL  = "Conta Real XP";
const CONTA_M2K   = "Mide 2k";
const CONTA_M4    = "Mide 4 - Veloz";

// Ordem de exibição e rótulo curto. O id é o nome EXATO da aba da planilha —
// trocar o rótulo aqui não mexe em nada da leitura.
const CONTAS_DASH = [CONTA_MIDE3, CONTA_REAL, CONTA_M2K, CONTA_M4];
const ROTULO_CONTA = {
  [CONTA_MIDE3]: "MIDE 3",
  [CONTA_REAL]:  "Real XP",
  [CONTA_M2K]:   "MIDE 2k",
  [CONTA_M4]:    "MIDE 4",
};

// Trimestres de calendário — mesma lógica da aba Hábitos, e a chave de
// localStorage é a mesma, pra as duas telas nunca discordarem.
const NOMES_TRI_DASH = ["Jan–Mar", "Abr–Jun", "Jul–Set", "Out–Dez"];
function chaveTriDash(ano, tri){ return `${ano}-T${tri+1}`; }
function iniTriDash(ano, tri){ return `${ano}-${String(tri*3+1).padStart(2,"0")}-01`; }
function fimTriDash(ano, tri){
  const ultimoDia = new Date(ano, tri*3+3, 0).getDate();
  return `${ano}-${String(tri*3+3).padStart(2,"0")}-${String(ultimoDia).padStart(2,"0")}`;
}
function triDaDataDash(iso){
  return { ano: parseInt(iso.slice(0,4),10), tri: Math.floor((parseInt(iso.slice(5,7),10)-1)/3) };
}
function rotuloTriDash(chave){
  return `${NOMES_TRI_DASH[parseInt(chave.slice(6),10)-1]}/${chave.slice(2,4)}`;
}

export default function App(){
  const [dados,setDados]         = useState(null);
  const [erro,setErro]           = useState(null);
  const [loading,setLoading]     = useState(true);

  const [dadosDiario, setDadosDiario]         = useState(null);
  const [loadingDiario, setLoadingDiario]     = useState(true);
  const [revisoes, setRevisoes]               = useState([]);
  const [updates, setUpdates]                 = useState([]);
  const [loadingRevisoes, setLoadingRevisoes] = useState(true);

  const [activeNav,setActiveNav] = useState("Dashboard");

  const [temaId,setTemaId] = useState(()=>{
    try { return localStorage.getItem("tema_app") || "framboesa"; } catch(e){ return "framboesa"; }
  });
  const [menuTemaAberto,setMenuTemaAberto] = useState(false);
  const trocarTema = (id)=>{
    setTemaId(id);
    try { localStorage.setItem("tema_app", id); } catch(e){}
  };

  // sidebarExpandido = barra fixada aberta pela setinha.
  const [sidebarExpandido,setSidebarExpandido] = useState(()=>{
    try { return localStorage.getItem("sidebar_fixo") !== "0"; } catch(e){ return true; }
  });
  // Compacto, só o item sob o mouse se abre. A faixa reservada ao lado da
  // barra absorve essa abertura, então nada nunca cobre o conteúdo.
  const [itemHover,setItemHover] = useState(null);
  const RAIL_W = 64;    // largura da barra compacta
  const MENU_W = 196;   // largura reservada: barra + respiro
  const CONTEUDO_W = 1240;
  const menuAberto = sidebarExpandido || itemHover !== null;
  const fixarSidebar = ()=>{
    setSidebarExpandido(v=>{
      const novo = !v;
      try { localStorage.setItem("sidebar_fixo", novo ? "1" : "0"); } catch(e){}
      return novo;
    });
  };
  const [metasExpandido, setMetasExpandido] = useState(true);

  const [calFiltro,setCalFiltro] = useState(()=>{
    try {
      const v = localStorage.getItem("cal_filtro");
      return ["segue","todos","habitos"].concat(CONTAS_DASH).indexOf(v) >= 0 ? v : "segue";
    } catch(e){ return "todos"; }
  });
  const trocarCalFiltro = (v)=>{
    setCalFiltro(v);
    try { localStorage.setItem("cal_filtro", v); } catch(e){}
  };

  // Conta que governa "Resultados do Mês" e "Status dos Setups".
  const [contaDash,setContaDash] = useState(()=>{
    try {
      const v = localStorage.getItem("dash_conta_sel");
      return CONTAS_DASH.concat(["todas","habitos"]).indexOf(v) >= 0 ? v : "todas";
    } catch(e){ return "todas"; }
  });
  const trocarContaDash = (v)=>{
    setContaDash(v);
    try { localStorage.setItem("dash_conta_sel", v); } catch(e){}
  };

  // Chave própria dos setups. null = segue a chave de cima.
  const [setupConta, setSetupConta] = useState(null);

  // Janela da Constância, em sessões.
  const [janelaConst, setJanelaConst] = useState(()=>{
    try {
      const v = parseInt(localStorage.getItem("const_janela"),10);
      return [10,20,30,40].indexOf(v) >= 0 ? v : 20;
    } catch(e){ return 20; }
  });
  const trocarJanelaConst = (n)=>{
    setJanelaConst(n);
    try { localStorage.setItem("const_janela", String(n)); } catch(e){}
  };

  const [diaSel,setDiaSel] = useState(null);
  const [diaDisciplinaSel, setDiaDisciplinaSel] = useState(null);
  const hoje = new Date();
  const [mesVis,setMesVis] = useState(hoje.getMonth());
  const [anoVis,setAnoVis] = useState(hoje.getFullYear());
  const [dadosOts, setDadosOts] = useState(null);
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

  const planoSemanaRef = useRef([]);
  const pontosAtencaoRef = useRef([]);
  const salvarTimeoutRef = useRef(null);
  useEffect(()=>{ planoSemanaRef.current = planoSemana; },[planoSemana]);
  useEffect(()=>{ pontosAtencaoRef.current = pontosAtencao; },[pontosAtencao]);

  function salvarDashboardSemanalApp(novoPlanoArr, novosPontosArr){
    const { ano, semana } = semanaISOApp(new Date());
    const chave = `${ano}-S${String(semana).padStart(2,"0")}`;
    const payload = { chave, ano, semana, planoSemana: novoPlanoArr, pontosAtencao: novosPontosArr };
    fetch(`${API_DIARIO}?action=salvarDashboardSemanal&dados=${encodeURIComponent(JSON.stringify(payload))}`).catch(()=>{});
  }

  function salvarDashboardSemanalDebounced(){
    if(salvarTimeoutRef.current) clearTimeout(salvarTimeoutRef.current);
    salvarTimeoutRef.current = setTimeout(()=>{
      salvarDashboardSemanalApp(planoSemanaRef.current, pontosAtencaoRef.current);
    }, 700);
  }

  function addPlanoItem(){
    if(!novoPlano.trim()) return;
    const novo = [...planoSemanaRef.current, { id: Date.now(), texto: novoPlano.trim() }];
    planoSemanaRef.current = novo;
    setPlanoSemana(novo);
    setNovoPlano("");
    salvarDashboardSemanalDebounced();
  }
  function removePlanoItem(id){
    const novo = planoSemanaRef.current.filter(p=>p.id!==id);
    planoSemanaRef.current = novo;
    setPlanoSemana(novo);
    salvarDashboardSemanalDebounced();
  }
  function addPontoItem(){
    if(!novoPonto.trim()) return;
    const novo = [...pontosAtencaoRef.current, { id: Date.now(), texto: novoPonto.trim() }];
    pontosAtencaoRef.current = novo;
    setPontosAtencao(novo);
    setNovoPonto("");
    salvarDashboardSemanalDebounced();
  }
  function removePontoItem(id){
    const novo = pontosAtencaoRef.current.filter(p=>p.id!==id);
    pontosAtencaoRef.current = novo;
    setPontosAtencao(novo);
    salvarDashboardSemanalDebounced();
  }

  const [checklistHoje, setChecklistHoje] = useState([
    { id:1, label:"Pré MKT Gráfico", done:false },
    { id:2, label:"Pré MKT com Coach", done:false },
    { id:3, label:"Disposição registrada", done:false },
    { id:4, label:"Respiração 3-2-6", done:false },
    { id:5, label:"Diário de trades", done:false },
    { id:6, label:"Pós MKT com Coach", done:false },
  ]);
  const [checklistAlterado, setChecklistAlterado] = useState(false);
  const [checklistSalvando, setChecklistSalvando] = useState(false);

  // Hábitos: só leitura no Dashboard. A escrita acontece na página de Hábitos.
  const [habitosLista, setHabitosLista] = useState([]);
  const [habitosCarregado, setHabitosCarregado] = useState(false);
  // Contas MIDE 3 e Real — mesma chamada e mesmo cache que Revisões usa.
  const [contasPorData, setContasPorData] = useState({});

  // Trimestre exibido no card de metas. Chave compartilhada com a aba Hábitos.
  const triHojeDash = triDaDataDash(
    `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`
  );
  const [triDash,setTriDash] = useState(()=>{
    try {
      const c = localStorage.getItem("quarter_sel");
      if(c && /^\d{4}-T[1-4]$/.test(c)) return c;
    } catch(e){}
    return chaveTriDash(triHojeDash.ano, triHojeDash.tri);
  });
  const trocarTriDash = (v)=>{
    setTriDash(v);
    try { localStorage.setItem("quarter_sel", v); } catch(e){}
  };

  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;

  const [dsiValor, setDsiValor] = useState("0");
  const [dsiMeta, setDsiMeta] = useState("0");
  const [horasEstudoValor, setHorasEstudoValor] = useState("0");
  const [horasEstudoMeta, setHorasEstudoMeta]   = useState("80");
  const [backtestsValor, setBacktestsValor]     = useState("0");
  const [backtestsMeta, setBacktestsMeta]       = useState("100");
  const [replaysManualValor, setReplaysManualValor] = useState("0");
  const [replaysManualMeta, setReplaysManualMeta]   = useState("20");

  function salvarDSIApp(valor, meta){
    fetch(`${API_DIARIO}?action=salvarDSI&dados=${encodeURIComponent(JSON.stringify({
      valor, meta,
      horasEstudoValor, horasEstudoMeta,
      backtestsValor, backtestsMeta,
      replaysValor: replaysManualValor, replaysMeta: replaysManualMeta,
    }))}`).catch(()=>{});
  }

  function salvarChecklistHojeApp(){
    setChecklistSalvando(true);
    const payload = { data: hojeStr, checklist: checklistHoje, naoDevo: "", intencao: "" };
    fetch(`${API_DIARIO}?action=salvarChecklistDiario&dados=${encodeURIComponent(JSON.stringify(payload))}`)
      .catch(()=>{})
      .finally(()=>{ setChecklistSalvando(false); setChecklistAlterado(false); });
  }

  function toggleChecklistHoje(id){
    setChecklistHoje(prev => prev.map(i=>i.id===id?{...i,done:!i.done}:i));
    setChecklistAlterado(true);
  }

  // ── Estado do dia: disposição, sono, emocional e lembrete ───────────────────
  // Uma linha por dia na aba "Estado do Dia". O lembrete é por dia, mas se hoje
  // ainda não tem um, mostra o último escrito em vez de aparecer vazio.
  const [estadoDiaLista, setEstadoDiaLista] = useState([]);
  const [estadoHoje, setEstadoHoje] = useState({ disposicao:"", sono:"", emocional:"", lembrete:"" });
  const [estadoAlterado, setEstadoAlterado] = useState(false);
  const [estadoSalvando, setEstadoSalvando] = useState(false);
  const [erroEstado, setErroEstado] = useState(false);

  // Rascunho local: o que está digitado e ainda não foi salvo sobrevive a um
  // F5. Não é auto-save — o Salvar continua sendo explícito; isso só evita
  // perder o texto entre digitar e salvar.
  const CHAVE_RASCUNHO = `estado_dia_rascunho_${hojeStr}`;
  // Ref porque o fetch atrasado de 3s roda com o estado antigo em closure e
  // apagaria o que está sendo digitado nesse meio-tempo.
  const estadoAlteradoRef = useRef(false);

  function aplicarEstadoDia(lista){
    const arr = lista || [];
    setEstadoDiaLista(arr);

    // Nunca sobrescrever edição em andamento.
    if(estadoAlteradoRef.current) return;

    const doDia = arr.find(e=>e.data === hojeStr);
    const ultimoLembrete = arr.slice().reverse().find(e=>e.lembrete);
    const doServidor = {
      disposicao: doDia && doDia.disposicao != null ? String(doDia.disposicao) : "",
      sono:       doDia && doDia.sono       != null ? String(doDia.sono)       : "",
      emocional:  doDia && doDia.emocional  != null ? String(doDia.emocional)  : "",
      lembrete:   (doDia && doDia.lembrete) || (ultimoLembrete ? ultimoLembrete.lembrete : ""),
    };

    let rascunho = null;
    try {
      const r = localStorage.getItem(CHAVE_RASCUNHO);
      if(r) rascunho = JSON.parse(r);
    } catch(e){}

    const difere = rascunho && ["disposicao","sono","emocional","lembrete"]
      .some(k => String(rascunho[k] ?? "") !== String(doServidor[k] ?? ""));

    if(difere){
      setEstadoHoje(rascunho);
      estadoAlteradoRef.current = true;
      setEstadoAlterado(true);
    } else {
      setEstadoHoje(doServidor);
      estadoAlteradoRef.current = false;
      setEstadoAlterado(false);
      try { localStorage.removeItem(CHAVE_RASCUNHO); } catch(e){}
    }
  }

  function mudarEstadoHoje(campo, valor){
    setEstadoHoje(p=>{
      const novo = { ...p, [campo]: valor };
      try { localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(novo)); } catch(e){}
      return novo;
    });
    estadoAlteradoRef.current = true;
    setEstadoAlterado(true);
  }

  function salvarEstadoDiaApp(){
    setEstadoSalvando(true);
    setErroEstado(false);
    const payload = {
      data: hojeStr,
      disposicao: estadoHoje.disposicao === "" ? null : Number(estadoHoje.disposicao),
      sono:       estadoHoje.sono       === "" ? null : Number(estadoHoje.sono),
      emocional:  estadoHoje.emocional  === "" ? null : Number(estadoHoje.emocional),
      lembrete:   estadoHoje.lembrete || "",
    };
    fetch(`${API_DIARIO}?action=salvarEstadoDia&dados=${encodeURIComponent(JSON.stringify(payload))}`)
      .then(()=>{
        setEstadoAlterado(false);
        estadoAlteradoRef.current = false;
        try { localStorage.removeItem(CHAVE_RASCUNHO); } catch(e){}
        // O cache do init também precisa saber, senão um F5 logo depois
        // mostra o valor antigo até a busca nova chegar.
        try {
          const c = localStorage.getItem("cache_dashboard");
          if(c){
            const j = JSON.parse(c);
            const lista = (j.estadoDia || []).filter(e=>e.data !== hojeStr);
            j.estadoDia = [...lista, payload].sort((a,b)=>a.data < b.data ? -1 : 1);
            localStorage.setItem("cache_dashboard", JSON.stringify(j));
          }
        } catch(e){}
      })
      .catch(()=>{ setErroEstado(true); })
      .finally(()=>{
        setEstadoSalvando(false);
        setEstadoDiaLista(prev=>{
          const sem = prev.filter(e=>e.data !== hojeStr);
          return [...sem, payload].sort((a,b)=>a.data < b.data ? -1 : 1);
        });
      });
  }

  const tema = THEMES.find(t=>t.id===temaId) || THEMES[0];
  const th = tema;
  const dark = tema.dark;
  const ACCENT_ATUAL = tema.accent;
  // Mesma linguagem de "vidro" usada no Dashboard, disponível fora dele.
  const supApp    = dark ? "rgba(255,255,255,0.028)" : "rgba(15,23,42,0.022)";
  const supFioApp = dark ? "rgba(255,255,255,0.055)" : "rgba(15,23,42,0.075)";
  // compatibilidade: componentes filhos ainda chamam setDark
  const setDark = (v)=>{
    const querEscuro = typeof v === "function" ? v(tema.dark) : v;
    trocarTema(querEscuro ? "framboesa" : "indigo");
  };

  function fetchComRetry(url, tentativas=3, delayMs=1200){
    return fetch(url)
      .then(r=>{ if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .catch(err=>{
        if(tentativas<=1) throw err;
        return new Promise(resolve=>setTimeout(resolve, delayMs))
          .then(()=>fetchComRetry(url, tentativas-1, delayMs));
      });
  }

  const carregar=()=>{
    const cacheEstudos = localStorage.getItem("cache_estudos");
    if(cacheEstudos){
      try { setDados(JSON.parse(cacheEstudos)); setLoading(false); } catch(e){}
    } else {
      setLoading(true);
    }
    fetchComRetry(API_URL)
      .then(j=>{
        if(j.erro) throw new Error(j.erro);
        setDados(j);
        setLoading(false);
        try { localStorage.setItem("cache_estudos", JSON.stringify(j)); } catch(e){}
      })
      .catch(e=>{ if(!cacheEstudos){ setErro(e.message); } setLoading(false); });
  };

  const carregarDiario=(ini="",fi="")=>{
    setLoadingDiario(true);
    let url = API_DIARIO;
    const params=[];
    if(ini) params.push(`inicio=${ini}`);
    if(fi)  params.push(`fim=${fi}`);
    if(params.length) url += "?" + params.join("&");
    return fetchComRetry(url)
      .then(j=>{if(j.erro)throw new Error(j.erro);setDadosDiario(j);setLoadingDiario(false);})
      .catch(()=>setLoadingDiario(false));
  };

  const carregarRevisoes=async()=>{
    setLoadingRevisoes(true);
    try {
      const rRev = await fetchComRetry(`${API_DIARIO}?action=lerRevisoes`);
      setRevisoes(rRev.revisoes || []);
      const rUpd = await fetchComRetry(`${API_DIARIO}?action=lerUpdates`);
      setUpdates(rUpd.updates || []);
      const rContas = await fetchComRetry(`${API_DIARIO}?action=getContasData`);
      if(!rContas.erro){
        setContasPorData(rContas.porData || {});
        try { localStorage.setItem("cache_contas", JSON.stringify(rContas)); } catch(e){}
      }
    } catch(e){ console.error(e); }
    setLoadingRevisoes(false);
  };

  useEffect(()=>{
    carregar(); // script separado (Estudos), não compete pela mesma cota

    function aplicarDashboardInit(j){
      // diario e ots seguem alimentando a aba Estatísticas, não o Dashboard.
      if(j.diario && !j.diario.erro) setDadosDiario(j.diario);
      if(j.ots && !j.ots.erro) setDadosOts(j.ots);
      setRevisoes(j.revisoes || []);
      setUpdates(j.updates || []);
      if(j.estadoDia) aplicarEstadoDia(j.estadoDia);

      const {ano,semana} = semanaISOApp(new Date());
      const chave = `${ano}-S${String(semana).padStart(2,"0")}`;

      const foundObjetivo = (j.objetivos||[]).find(o=>o.chave===chave);
      setObjetivosSemanaAtual(foundObjetivo||null);

      const foundSemana = (j.semanas||[]).find(s=>s.chave===chave);
      setPlanoSemana(foundSemana?.planoSemana || []);
      setPontosAtencao(foundSemana?.pontosAtencao || []);

      if(j.dsi){
        setDsiValor(j.dsi.valor ?? "0");
        setDsiMeta(j.dsi.meta ?? "0");
        setHorasEstudoValor(j.dsi.horasEstudoValor ?? "0");
        setHorasEstudoMeta(j.dsi.horasEstudoMeta ?? "80");
        setBacktestsValor(j.dsi.backtestsValor ?? "0");
        setBacktestsMeta(j.dsi.backtestsMeta ?? "100");
        setReplaysManualValor(j.dsi.replaysValor ?? "0");
        setReplaysManualMeta(j.dsi.replaysMeta ?? "20");
      }

      const hojeChave = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
      const foundDia = (j.dias||[]).find(d=>d.data===hojeChave);
      if(foundDia && foundDia.checklist?.length) setChecklistHoje(foundDia.checklist);
    }

    async function carregarDashboardInit(){
      const cacheDash = localStorage.getItem("cache_dashboard");
      if(cacheDash){
        try {
          aplicarDashboardInit(JSON.parse(cacheDash));
          setLoadingDiario(false);
          setLoadingRevisoes(false);
        } catch(e){}
      } else {
        setLoadingDiario(true);
        setLoadingRevisoes(true);
      }

      try {
        const j = await fetchComRetry(`${API_DIARIO}?action=getDashboardInit`);
        aplicarDashboardInit(j);
        try { localStorage.setItem("cache_dashboard", JSON.stringify(j)); } catch(e){}
      } catch(e){
        console.error(e);
      }
      setLoadingDiario(false);
      setLoadingRevisoes(false);
    }

    carregarDashboardInit();
  },[]);

  // Hábitos: uma única chamada alimenta o card do Dashboard e a página de Hábitos.
  useEffect(()=>{
    function aplicar(lista){
      setHabitosLista(lista || []);
    }
    try {
      const c = localStorage.getItem("cache_habitos");
      if(c) aplicar(JSON.parse(c));
    } catch(e){}

    try {
      const cc = localStorage.getItem("cache_contas");
      if(cc) setContasPorData(JSON.parse(cc).porData || {});
    } catch(e){}

    const t = setTimeout(()=>{
      fetchComRetry(`${API_DIARIO}?action=lerHabitos`)
        .then(j=>{
          const lista = j.habitos || [];
          try { localStorage.setItem("cache_habitos", JSON.stringify(lista)); } catch(e){}
          aplicar(lista);
          setHabitosCarregado(true);
        })
        .catch(()=>setHabitosCarregado(true))
        // Contas logo depois, em sequência — nunca em paralelo com a chamada acima
        .finally(()=>{
          fetchComRetry(`${API_DIARIO}?action=getContasData`)
            .then(j=>{
              if(j.erro) return;
              setContasPorData(j.porData || {});
              try { localStorage.setItem("cache_contas", JSON.stringify(j)); } catch(e){}
            })
            .catch(()=>{});
        });
    }, 3000);

    return ()=>clearTimeout(t);
  },[]);

  const diasDia = dados?.diasDetalhes || {};

    // Horas e Replays vêm dos hábitos — total do mês corrente, sem preenchimento manual.
  const prefixoMesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
  const totaisMesHabitos = (habitosLista||[]).reduce((acc, h) => {
    if(String(h.data).startsWith(prefixoMesAtual)){
      acc.horas   += h.horas   || 0;
      acc.replays += h.replays || 0;
      acc.paginas += h.paginas || 0;
    }
    return acc;
  }, { horas:0, replays:0, paginas:0 });
  const fmtH = v => Number.isInteger(v) ? String(v) : String(Math.round(v*10)/10).replace(".", ",");

  const dataFormatada = hoje.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});

  const diaKey  = diaSel?`${anoVis}-${String(mesVis+1).padStart(2,"0")}-${String(diaSel).padStart(2,"0")}`:null;
  const detalhe = diaKey&&diasDia[diaKey];
  const modoDia = !!detalhe;

  const navItems = [
    {label:"Dashboard",      icon:<Ico.Target    s={19} c="currentColor"/>},
    {label:"Revisões",       icon:<Ico.Calendar  s={19} c="currentColor"/>},
    {label:"Hábitos",        icon:<Ico.Check     s={19} c="currentColor"/>},
    {label:"Objetivos",      icon:<Ico.Target    s={19} c="currentColor"/>},
    {label:"Replays",        icon:<Ico.Repeat    s={19} c="currentColor"/>},
    {label:"Estatísticas",   icon:<Ico.Trend     s={19} c="currentColor"/>},
    {label:"Estudos",        icon:<Ico.BookOpen  s={19} c="currentColor"/>},
    {label:"Plano de Trade", icon:<Ico.Clipboard s={19} c="currentColor"/>},
  ];

const topNav = [
    { label:"Diário",      target:null, href:"https://docs.google.com/spreadsheets/d/1tUS99Um-CjNX7mBpa4pXGzBsnb9jLPGes1UL7qJSUDI/edit" },
    { label:"Notion",      target:null, href:"https://app.notion.com/p/Studies-292c21dc2bf88080a4f3d4610f8f7944" },
    { label:"Abertura",    target:null, href:"https://br.tradingview.com/watchlists/166766889/" },
    { label:"Matilha App", target:null, href:"https://matilhaapp.mateustarterpack.com.br/diary/evolucao" },
  ];

  const renderMain = () => {
    if(activeNav === "Estatísticas") return (
      <div style={{flex:1,minWidth:0}}>
        <Estatisticas th={th} dark={dark} setDark={setDark} dadosCache={dadosDiario} otsCache={dadosOts} loadingCache={loadingDiario} onRecarregar={carregarDiario}/>
      </div>
    );
    if(activeNav === "Estudos") return (
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <Estudos th={th}/>
      </div>
    );
    if(activeNav === "Objetivos") return (
      <div style={{flex:1,minWidth:0}}>
        <Objetivos th={th} dark={dark} setDark={setDark}/>
      </div>
    );
    if(activeNav === "Revisões") return (
      <div style={{flex:1,overflowY:"auto",minWidth:0,display:"flex",flexDirection:"column",width:"100%"}}>
        <Revisoes th={th} dark={dark} setDark={setDark} revisoesProp={revisoes} updatesProp={updates} loadingProp={loadingRevisoes} onCarregar={carregarRevisoes}/>
      </div>
    );
    if(activeNav === "Hábitos") return (
      <div style={{flex:1,minWidth:0}}>
        <Habitos th={th} habitosProp={habitosLista}/>
      </div>
    );
    if(activeNav === "Replays") return (
      <div style={{flex:1,minWidth:0}}>
        <Replays th={th}/>
      </div>
    );
    if(activeNav === "Plano de Trade") return (
      <div style={{flex:1,minWidth:0}}>
        <PlanoTrade th={th}/>
      </div>
    );

    const GRUPO_SETUP = { TRM:"#6B8CC4", FQ:"#B98FC2", TC:"#5FA8AE", TL:"#C2A15F", AB:"#9B7FC2" };
    function corWRDash(wr){
      if(wr>=60) return dark?{bg:"#182420",border:"#3d6b52",text:"#7fb89a"}:{bg:"#eaf7f0",border:"#5cb583",text:"#2f7d52"};
      if(wr>=45) return dark?{bg:"#211f18",border:"#6b6142",text:"#c2b184"}:{bg:"#fbf6e6",border:"#d1a53d",text:"#8a6f1a"};
      return dark?{bg:"#211a1a",border:"#6b4444",text:"#c68888"}:{bg:"#fbeceb",border:"#d9776b",text:"#a83f31"};
    }

    function classificarSetup(nome){
      const n = (nome||"").toLowerCase();
      if(n === "trm") return {grupo:"TRM", label:"TRM"};
      if(n === "fq") return {grupo:"FQ", label:"FQ"};
      if(n === "tl" || n.includes("lateralidade")) return {grupo:"TL", label:"TL"};
      if(n.includes("barra de for")) return {grupo:"AB", label:"Abertura – Barra de Força"};
      if(n.includes("abertura")) return {grupo:"AB", label:"Trade de Abertura"};
      if(n.includes("meio de mov")) return {grupo:"TC", label:"TC Meio de Mov."};
      if(n.includes("supertrend")) return {grupo:"TC", label:"TC Supertrend"};
      if(n.includes("pós bo")||n.includes("pos bo")) return {grupo:"TC", label:"TC Pós BO"};
      if(n.includes("pré bo")||n.includes("pre bo")) return {grupo:"TC", label:"TC Pré BO"};
      return null;
    }

    // ── Contas: agregação por dia, mês e conta ───────────────────────────────
    // Tudo sai de contasPorData, que vem numa chamada só. Trocar mês ou conta
    // não gera requisição nova.
    // "habitos" não é conta: nesse modo os números de conta somam tudo, e o
    // que aparece na tela vem dos hábitos.
    const contasAtivas = (contaDash === "todas" || contaDash === "habitos")
      ? CONTAS_DASH : [contaDash];

    const prefixoMesVis = `${anoVis}-${String(mesVis+1).padStart(2,"0")}`;
    const diasDoMesOrdenados = Object.keys(contasPorData)
      .filter(d=>d.startsWith(prefixoMesVis)).sort();

    // Curva acumulada do mês + totais
    let acumMes = 0, gainsMes = 0, lossesMes = 0;
    const setupsDoMes = {};
    const pontosMesDash = [];
    diasDoMesOrdenados.forEach(d=>{
      const doDia = contasPorData[d];
      let temDia = false;
      contasAtivas.forEach(c=>{
        const dd = doDia[c];
        if(!dd) return;
        temDia = true;
        acumMes += dd.resultado || 0;
        gainsMes += dd.gains || 0;
        lossesMes += dd.losses || 0;
        Object.keys(dd.setups || {}).forEach(nome=>{
          const s = dd.setups[nome];
          if(!setupsDoMes[nome]) setupsDoMes[nome] = { trades:0, gains:0, losses:0, financTotal:0 };
          setupsDoMes[nome].trades += s.trades || 0;
          setupsDoMes[nome].gains  += s.gains  || 0;
          setupsDoMes[nome].losses += s.losses || 0;
          setupsDoMes[nome].financTotal += s.financTotal || 0;
        });
      });
      if(temDia) pontosMesDash.push({ data:d, valor: Math.round(acumMes*100)/100 });
    });

    const decMes = gainsMes + lossesMes;
    const financMes = pontosMesDash.length ? Math.round(acumMes*100)/100 : null;
    const wrMes = decMes > 0 ? Math.round((gainsMes/decMes)*100) : null;

    // Status dos Setups — mesmo recorte de mês e conta
    const setupsClassificados = {};
    Object.keys(setupsDoMes).forEach(nome=>{
      const c = classificarSetup(nome);
      if(!c) return;
      const s = setupsDoMes[nome];
      const atual = setupsClassificados[c.label] || { trades:0, gains:0, losses:0, financTotal:0, ...c };
      atual.trades += s.trades;
      atual.gains  += s.gains;
      atual.losses += s.losses;
      atual.financTotal += s.financTotal;
      setupsClassificados[c.label] = atual;
    });
    Object.keys(setupsClassificados).forEach(label=>{
      const s = setupsClassificados[label];
      const dec = s.gains + s.losses;
      s.taxaAcerto = dec > 0 ? Math.round((s.gains/dec)*100) : 0;
      s.financTotal = Math.round(s.financTotal*100)/100;
    });

    const setupsLinhasDash = [
      [setupsClassificados["Trade de Abertura"], setupsClassificados["Abertura – Barra de Força"]],
      [setupsClassificados["TC Meio de Mov."], setupsClassificados["TC Pós BO"], setupsClassificados["TC Supertrend"]],
      [setupsClassificados["TRM"], setupsClassificados["TL"]],
    ];

    const setupsMesLista = Object.keys(setupsClassificados).map(label=>{
      const s = setupsClassificados[label];
      return { nome: label, wr: s.taxaAcerto, financ: s.financTotal };
    }).sort((a,b)=>b.financ-a.financ);

    // O mini calendário tem filtro próprio (calFiltro), separado do seletor
    // que governa os dois cards da esquerda.
    function somarContasNoDia(dataStr, contas){
      const doDia = contasPorData[dataStr];
      if(!doDia) return null;
      let achou = false;
      const acc = { resultado:0, trades:0, gains:0, losses:0, erros:0 };
      contas.forEach(c=>{
        const d = doDia[c];
        if(!d) return;
        achou = true;
        acc.resultado += d.resultado || 0;
        acc.trades    += d.trades || 0;
        acc.gains     += d.gains || 0;
        acc.losses    += d.losses || 0;
        acc.erros     += d.qtdErros || 0;
      });
      if(!achou) return null;
      const dec = acc.gains + acc.losses;
      acc.taxaAcerto = dec > 0 ? Math.round((acc.gains/dec)*100) : 0;
      acc.resultado = Math.round(acc.resultado*100)/100;
      return acc;
    }
    // "segue" = usa a chave do topo. Antes o calendário tinha filtro próprio e
    // independente, então um dia operado numa conta fora do filtro sumia do
    // calendário mesmo estando somado na faixa de cima.
    const calEfetivo = calFiltro === "segue"
      ? (contaDash === "habitos" ? "habitos" : (contaDash === "todas" ? "todos" : contaDash))
      : calFiltro;
    function diaCalendario(dataStr){
      if(CONTAS_DASH.indexOf(calEfetivo) >= 0) return somarContasNoDia(dataStr, [calEfetivo]);
      return somarContasNoDia(dataStr, CONTAS_DASH);
    }

    function navegarMesDash(delta){
      let m = mesVis + delta, a = anoVis;
      if(m < 0){ m = 11; a--; }
      if(m > 11){ m = 0; a++; }
      setMesVis(m); setAnoVis(a); setDiaSel(null);
    }

    // Studies Streak — mesma fonte e mesmo critério da página de Hábitos:
    // 3/3 = perfeito · 2/3 = quase · resto = fraco. Registro começa em 07/08/2026.
    const INICIO_HABITOS = "2026-08-07";
    const habitosPorData = {};
    (habitosLista||[]).forEach(h=>{ habitosPorData[h.data] = h; });
    const hojeChaveStreak = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;

    const streakDias = [];
    let cursor = new Date(hoje);
    while (streakDias.length < 20) {
      const chave = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}-${String(cursor.getDate()).padStart(2,"0")}`;
      if (chave < INICIO_HABITOS) break;
      const h = habitosPorData[chave];
      const feitos = h ? ((h.horas>=1?1:0) + (h.replays>=1?1:0) + (h.paginas>=1?1:0)) : 0;
      let status;
      if (!habitosCarregado && !h) status = null;                        // ainda carregando
      else if (feitos === 0 && chave === hojeChaveStreak) status = null; // hoje em aberto
      else if (feitos === 3) status = "perfeito";
      else if (feitos === 2) status = "quase";
      else status = "fraco";
      streakDias.unshift({
        chave, status, dataObj: new Date(cursor),
        resumo: h ? `${h.horas}h · ${h.replays} replay(s) · ${h.paginas} pág.` : "sem registro",
      });
      cursor.setDate(cursor.getDate() - 1);
    }

    let streakAtual = 0;
    for (let i = streakDias.length - 1; i >= 0; i--) {
      if (streakDias[i].status === null) continue;
      if (streakDias[i].status === "perfeito") streakAtual++;
      else break;
    }

    // Sequências por hábito — mesma lógica da página de Hábitos
    const HABITOS_DASH = [
      { campo:"horas",   label:"Horas de estudo" },
      { campo:"replays", label:"Replays" },
      { campo:"paginas", label:"Páginas lidas" },
    ];
    function seqHabito(campo){
      let cont = 0;
      const cur = new Date(hoje);
      for(let i=0; i<400; i++){
        const ch = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,"0")}-${String(cur.getDate()).padStart(2,"0")}`;
        if(ch < INICIO_HABITOS) break;
        const h = habitosPorData[ch];
        const temAlgum = h && (h.horas>0 || h.replays>0 || h.paginas>0);
        if(ch === hojeChaveStreak && !temAlgum){ /* dia em aberto */ }
        else if(h && h[campo] >= 1) cont++;
        else break;
        cur.setDate(cur.getDate() - 1);
      }
      return cont;
    }
    const seqPorHabitoDash = {};
    HABITOS_DASH.forEach(h=>{ seqPorHabitoDash[h.campo] = seqHabito(h.campo); });

    // ── Metas de estudo do quarter — mesma base da página de Hábitos ──────────
    const METAS_PADRAO_DASH = { horas:240, replays:60, paginas:300 };
    const anoTriDash = parseInt(triDash.slice(0,4),10);
    const numTriDash = parseInt(triDash.slice(6),10) - 1;
    const QUARTER_INI_DASH = iniTriDash(anoTriDash, numTriDash);
    const QUARTER_FIM_DASH = fimTriDash(anoTriDash, numTriDash);

    const trisDisponiveisDash = (()=>{
      const set = new Set([chaveTriDash(triHojeDash.ano, triHojeDash.tri), triDash]);
      (habitosLista||[]).forEach(h=>{
        const t = triDaDataDash(h.data);
        set.add(chaveTriDash(t.ano, t.tri));
      });
      return [...set].sort().reverse();
    })();

    function diasEntreDash(a, b){
      return Math.round((new Date(b+"T12:00:00") - new Date(a+"T12:00:00")) / 86400000) + 1;
    }
    let metasQuarter = METAS_PADRAO_DASH;
    try {
      const cm = localStorage.getItem("metas_quarterly");
      if(cm) metasQuarter = { ...METAS_PADRAO_DASH, ...JSON.parse(cm) };
    } catch(e){}

    const diasQuarterDash = diasEntreDash(QUARTER_INI_DASH, QUARTER_FIM_DASH);
    const fimEfetivoDash = hojeChaveStreak < QUARTER_FIM_DASH ? hojeChaveStreak : QUARTER_FIM_DASH;
    const decorridosDash = hojeChaveStreak < QUARTER_INI_DASH ? 0
      : Math.min(diasEntreDash(QUARTER_INI_DASH, fimEfetivoDash), diasQuarterDash);
    const pctEsperadoDash = diasQuarterDash > 0 ? decorridosDash / diasQuarterDash : 0;

    const totalQuarterDash = { horas:0, replays:0, paginas:0 };
    (habitosLista||[]).forEach(h=>{
      if(h.data >= QUARTER_INI_DASH && h.data <= QUARTER_FIM_DASH){
        totalQuarterDash.horas   += h.horas   || 0;
        totalQuarterDash.replays += h.replays || 0;
        totalQuarterDash.paginas += h.paginas || 0;
      }
    });

    const metasEstudoDash = HABITOS_DASH.map(h=>{
      const val = totalQuarterDash[h.campo];
      // Trimestre cheio: a meta digitada é o alvo integral, sem proporcional.
      const metaEf = Number(metasQuarter[h.campo]) || 0;
      const alvoHoje = metaEf * pctEsperadoDash;
      return {
        campo: h.campo, label: h.label, valor: val,
        meta: Math.round(metaEf),
        pctVal: metaEf > 0 ? Math.min(100, Math.round((val/metaEf)*100)) : 0,
        noRitmo: val >= alvoHoje,
        falta: Math.max(0, Math.round((alvoHoje - val)*10)/10),
      };
    });

    const disciplineDias = [];
    let cursorD = new Date(hoje);
    while (disciplineDias.length < 40) {
      const diaSemanaD = cursorD.getDay();
      if (diaSemanaD !== 0 && diaSemanaD !== 6) {
        const chaveD = `${cursorD.getFullYear()}-${String(cursorD.getMonth()+1).padStart(2,"0")}-${String(cursorD.getDate()).padStart(2,"0")}`;
        // Disciplina olha SEMPRE as duas contas, independente do filtro de cima:
        // erro em qualquer uma delas queima o dia.
        const doDiaD = contasPorData[chaveD] || {};
        const emocD = [], tecD = [], todosD = [];
        let operouD = false;
        CONTAS_DASH.forEach(c=>{
          const d = doDiaD[c];
          if(!d) return;
          operouD = true;
          (d.errosEmocional||[]).forEach(e=>emocD.push(e));
          (d.errosTecnico||[]).forEach(e=>tecD.push(e));
          // erros sem "tipo de erro" preenchido não entram em nenhuma das duas
          // listas acima — por isso a contagem do mês podia não bater com os
          // chips aqui embaixo.
          (d.erros||[]).forEach(e=>todosD.push(e));
        });
        disciplineDias.unshift({
          chave: chaveD,
          dataObj: new Date(cursorD),
          statusEmocional: !operouD ? null : emocD.length > 0 ? "erro" : "ok",
          statusTecnico: !operouD ? null : tecD.length > 0 ? "erro" : "ok",
          errosEmocional: emocD,
          errosTecnico: tecD,
          errosTodos: todosD,
        });
      }
      cursorD.setDate(cursorD.getDate() - 1);
    }
    let disciplineStreakAtual = 0;
    for (let i = disciplineDias.length - 1; i >= 0; i--) {
      const d = disciplineDias[i];
      if (d.statusEmocional === null && d.statusTecnico === null) continue;
      if (d.statusEmocional === "ok" && d.statusTecnico === "ok") disciplineStreakAtual++;
      else break;
    }
    let streakEmocional = 0;
    for (let i = disciplineDias.length - 1; i >= 0; i--) {
      if (disciplineDias[i].statusEmocional === null) continue;
      if (disciplineDias[i].statusEmocional === "ok") streakEmocional++;
      else break;
    }
    let streakTecnico = 0;
    for (let i = disciplineDias.length - 1; i >= 0; i--) {
      if (disciplineDias[i].statusTecnico === null) continue;
      if (disciplineDias[i].statusTecnico === "ok") streakTecnico++;
      else break;
    }

    const diasNoMesAtual = new Date(anoVis, mesVis+1, 0).getDate();
    const primeiroDiaSemana = new Date(anoVis, mesVis, 1).getDay();
    const offsetInicio = primeiroDiaSemana===0 ? 6 : primeiroDiaSemana-1;
    const miniCalDias = [];
    for(let i=0; i<offsetInicio; i++){
      miniCalDias.push({ dia:null, dataStr:null, r:null });
    }

    const hojeChaveCal = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
    for(let d=1; d<=diasNoMesAtual; d++){
      const dataStr = `${anoVis}-${String(mesVis+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const r = diaCalendario(dataStr);
      const diaSemCal = new Date(anoVis, mesVis, d).getDay();
      const fimDeSemana = diaSemCal===0 || diaSemCal===6;
      miniCalDias.push({ dia:d, dataStr, r, futuro: dataStr > hojeChaveCal, fimDeSemana });
    }

    // ══ NOVO LAYOUT ══════════════════════════════════════════════════════════
    // Tokens derivados do tema, pra a linguagem "vidro" do design funcionar
    // tanto nos 6 temas escuros quanto nos 6 claros.
    const sup      = dark ? "rgba(255,255,255,0.028)" : "rgba(15,23,42,0.022)";
    const supFio   = dark ? "rgba(255,255,255,0.055)" : "rgba(15,23,42,0.075)";
    const trilho   = dark ? "rgba(255,255,255,0.09)"  : "rgba(15,23,42,0.10)";
    const pillBg   = dark ? "rgba(0,0,0,0.30)"        : "rgba(15,23,42,0.045)";
    const pillFio  = dark ? "rgba(255,255,255,0.06)"  : "rgba(15,23,42,0.06)";
    const faixaBg  = dark
      ? "linear-gradient(170deg, rgba(255,255,255,0.075), rgba(255,255,255,0.022) 48%, rgba(255,255,255,0.012))"
      : "linear-gradient(170deg, rgba(255,255,255,0.96), rgba(255,255,255,0.70))";
    const faixaFio = dark
      ? "inset 0 1px 0 rgba(255,255,255,0.09), inset 0 0 0 1px rgba(255,255,255,0.055), 0 30px 60px -36px rgba(0,0,0,0.9)"
      : "inset 0 0 0 1px rgba(15,23,42,0.07), 0 26px 50px -34px rgba(15,23,42,0.45)";
    const COR_NEG  = dark ? "#FF8A66" : "#C2502F";
    const COR_MEIO = dark ? "#E0B050" : "#A8761A";
    // Verde é o tema, mas disciplina ruim não pode sair verde só porque o
    // accent é verde. Abaixo de 60% vira vermelho, 60–79% âmbar.
    function corNivel(p){
      if(p >= 80) return ACCENT_ATUAL;
      if(p >= 60) return COR_MEIO;
      return COR_NEG;
    }

    function estiloPill(ativo, pequeno){
      return {
        border:"none", borderRadius:999, fontFamily:"inherit", cursor:"pointer", whiteSpace:"nowrap",
        padding: pequeno ? "5px 11px" : "6px 13px",
        fontSize: pequeno ? 11.5 : 12.5,
        fontWeight: ativo ? 700 : 600,
        background: ativo ? ACCENT_ATUAL : "transparent",
        color: ativo ? (dark ? "#06100B" : "#fff") : th.textMuted,
      };
    }

    // ── Disciplina do mês ─────────────────────────────────────────────────────
    // Trade limpo = sem erro nomeado. Um erro por linha do diário, então
    // "quantos trades tiveram erro" é o tamanho da lista de erros.
    function discipDoMes(contas){
      let trades = 0, comErro = 0, tec = 0, emo = 0;
      diasDoMesOrdenados.forEach(d=>{
        const doDia = contasPorData[d] || {};
        contas.forEach(c=>{
          const dd = doDia[c];
          if(!dd) return;
          trades  += dd.trades || 0;
          comErro += (dd.erros || []).length;
          tec     += (dd.errosTecnico || []).length;
          emo     += (dd.errosEmocional || []).length;
        });
      });
      return { trades, comErro, tec, emo, limpos: Math.max(0, trades - comErro) };
    }
    const dm = discipDoMes(contasAtivas);

    // ── Hábitos do mês: meta mensal = meta do trimestre ÷ 3 ───────────────────
    const habitosDoMes = { horas:0, replays:0, paginas:0 };
    const serieHabMes = [];
    (habitosLista||[]).forEach(h=>{
      if(!h.data || !h.data.startsWith(prefixoMesVis)) return;
      habitosDoMes.horas   += Number(h.horas)   || 0;
      habitosDoMes.replays += Number(h.replays) || 0;
      habitosDoMes.paginas += Number(h.paginas) || 0;
    });
    const metasMes = {
      horas:   Math.round((Number(metasQuarter.horas)   || 0) / 3),
      replays: Math.round((Number(metasQuarter.replays) || 0) / 3),
      paginas: Math.round((Number(metasQuarter.paginas) || 0) / 3),
    };
    const pctHab = (campo)=> metasMes[campo] > 0
      ? Math.min(100, Math.round((habitosDoMes[campo] / metasMes[campo]) * 100)) : 0;
    const pctHabMedio = Math.round((pctHab("horas") + pctHab("replays") + pctHab("paginas")) / 3);

    // Proporcional ao ponto do mês em que estamos: no dia 5 de um mês de 30,
    // a referência é 1/6 da meta, não a meta inteira.
    const diasMesTotal = new Date(anoVis, mesVis+1, 0).getDate();
    const diaCorrenteMes = (anoVis === hoje.getFullYear() && mesVis === hoje.getMonth())
      ? hoje.getDate()
      : (`${prefixoMesVis}-01` < hojeChaveStreak ? diasMesTotal : 0);
    const pctDecorridoMes = diasMesTotal > 0 ? diaCorrenteMes / diasMesTotal : 0;
    const esperadoHab = {
      horas:   metasMes.horas   * pctDecorridoMes,
      replays: metasMes.replays * pctDecorridoMes,
      paginas: metasMes.paginas * pctDecorridoMes,
    };
    const ritmoHab = (campo)=>{
      if(esperadoHab[campo] <= 0) return habitosDoMes[campo] > 0 ? 100 : 0;
      return Math.round((habitosDoMes[campo] / esperadoHab[campo]) * 100);
    };
    const pctHabRitmo = Math.round((ritmoHab("horas") + ritmoHab("replays") + ritmoHab("paginas")) / 3);

    // Curva de avanço dos hábitos no mês, acumulada dia a dia
    {
      const diasMes = new Date(anoVis, mesVis+1, 0).getDate();
      let ac = 0;
      const metaTotal = metasMes.horas + metasMes.replays + metasMes.paginas;
      for(let d=1; d<=diasMes; d++){
        const k = `${prefixoMesVis}-${String(d).padStart(2,"0")}`;
        if(k > hojeChaveStreak) break;
        const h = habitosPorData[k];
        if(h) ac += (Number(h.horas)||0) + (Number(h.replays)||0) + (Number(h.paginas)||0);
        serieHabMes.push({ dia:d, pct: metaTotal>0 ? (ac/metaTotal)*100 : 0 });
      }
    }

    const ehHabitos = contaDash === "habitos";
    const rotuloVisao = ehHabitos ? "Hábitos" : (contaDash === "todas" ? "todas as contas" : ROTULO_CONTA[contaDash]);

    // No modo hábitos o ponteiro mede ritmo (real ÷ esperado até hoje).
    const gaugePct = ehHabitos
      ? pctHabRitmo
      : (dm.trades > 0 ? Math.round((dm.limpos / dm.trades) * 100) : 0);

    function arcoGauge(p){
      if(p <= 0) return "M30,130";
      const rad = (180 - (Math.min(100,p) / 100) * 180) * Math.PI / 180;
      return `M30,130 A100,100 0 0 1 ${(130 + 100*Math.cos(rad)).toFixed(1)},${(130 - 100*Math.sin(rad)).toFixed(1)}`;
    }

    const miniCirculos = ehHabitos
      ? [
          { label:"Horas",   pct:ritmoHab("horas"),
            sub:`${Math.round(habitosDoMes.horas)} · esperado ${Math.round(esperadoHab.horas)} · ${pctHab("horas")}% do mês` },
          { label:"Replays", pct:ritmoHab("replays"),
            sub:`${habitosDoMes.replays} · esperado ${Math.round(esperadoHab.replays)} · ${pctHab("replays")}% do mês` },
          { label:"Páginas", pct:ritmoHab("paginas"),
            sub:`${habitosDoMes.paginas} · esperado ${Math.round(esperadoHab.paginas)} · ${pctHab("paginas")}% do mês` },
        ]
      : [
          { label:"Técnico",   pct: dm.trades>0 ? Math.round(((dm.trades-dm.tec)/dm.trades)*100) : 0,
            sub: dm.tec===0 ? "nenhum erro no mês" : `${dm.tec} no mês` },
          { label:"Emocional", pct: dm.trades>0 ? Math.round(((dm.trades-dm.emo)/dm.trades)*100) : 0,
            sub: dm.emo===0 ? "nenhum erro no mês" : `${dm.emo} no mês` },
        ];

    // ── Estado do dia (faixa ao vivo) ─────────────────────────────────────────
    const hojeContas = contasPorData[hojeStr] || {};
    const STOP_DIARIO = 500;
    // Cada conta tem o próprio limite diário, então o dia é lido conta a conta
    // em vez de somado num número só.
    const hojePorConta = CONTAS_DASH
      .filter(c=>hojeContas[c])
      .map(c=>{
        const d = hojeContas[c];
        return {
          conta: c,
          rotulo: ROTULO_CONTA[c],
          trades: d.trades || 0,
          resultado: d.resultado || 0,
          erros: (d.erros || []).length,
          erroNoPrimeiro: !!d.erroNoPrimeiro,
          restante: Math.max(0, STOP_DIARIO + Math.min(0, d.resultado || 0)),
        };
      });
    const operouHoje = hojePorConta.length > 0;
    const tradesHoje = hojePorConta.reduce((a,c)=>a+c.trades, 0);
    const contasCrivo = hojePorConta.filter(c=>c.erroNoPrimeiro);

    // ── Constância: janela de sessões e o que quebrou ─────────────────────────
    const sessoes = disciplineDias.filter(d=>d.statusTecnico !== null || d.statusEmocional !== null);
    const janelaSess = sessoes.slice(-janelaConst);
    const quebras = janelaSess
      .map((d,i)=>({ d, i }))
      .filter(({d})=>(d.errosTodos||[]).length > 0);
    let limposSeguidos = 0;
    for(let i = janelaSess.length - 1; i >= 0; i--){
      if((janelaSess[i].errosTodos||[]).length === 0) limposSeguidos++;
      else break;
    }
    const contagemErros = {};
    let totalErrosJanela = 0;
    quebras.forEach(({d})=>{
      (d.errosTodos||[]).forEach(e=>{
        const k = (e||"").trim();
        if(!k) return;
        totalErrosJanela++;
        contagemErros[k] = (contagemErros[k] || 0) + 1;
      });
    });
    const chipsErros = Object.keys(contagemErros)
      .sort((a,b)=>contagemErros[b]-contagemErros[a])
      .map(k=>({ texto:k, n:contagemErros[k] }));
    const pctVerdeConst = janelaSess.length > 0
      ? Math.round((limposSeguidos / janelaSess.length) * 100) : 0;

    // ── Setups: chave própria, por padrão colada na de cima ───────────────────
    const contaTopoSetup = ehHabitos ? "todas" : contaDash;
    const contaSetupEfetiva = setupConta || contaTopoSetup;
    const contasSetup = contaSetupEfetiva === "todas" ? CONTAS_DASH : [contaSetupEfetiva];
    const setupsDaConta = {};
    diasDoMesOrdenados.forEach(d=>{
      const doDia = contasPorData[d] || {};
      contasSetup.forEach(c=>{
        const dd = doDia[c];
        if(!dd || !dd.setups) return;
        Object.keys(dd.setups).forEach(nome=>{
          const s = dd.setups[nome];
          const a = setupsDaConta[nome] || { trades:0, gains:0, losses:0, financTotal:0 };
          a.trades += s.trades || 0; a.gains += s.gains || 0;
          a.losses += s.losses || 0; a.financTotal += s.financTotal || 0;
          setupsDaConta[nome] = a;
        });
      });
    });
    const listaSetupsNova = Object.keys(setupsDaConta).map(nome=>{
      const s = setupsDaConta[nome];
      const dec = s.gains + s.losses;
      return { nome, valor: Math.round(s.financTotal), ops: s.trades,
               wr: dec>0 ? Math.round((s.gains/dec)*100) : null };
    }).sort((a,b)=>b.valor-a.valor);
    const maxAbsSetup = listaSetupsNova.reduce((a,s)=>Math.max(a,Math.abs(s.valor)), 1);

    const pillsConta = [...CONTAS_DASH.map(c=>({id:c, label:ROTULO_CONTA[c]}))];
    const pillsTopo  = [{id:"todas", label:"Todas"}, ...pillsConta, {id:"habitos", label:"Hábitos"}];
    const pillsSetup = [{id:"todas", label:"Todas"}, ...pillsConta];

    const DIAS_SEM_CUR = ["S","T","Q","Q","S","S","D"];
    const dataExtenso = hoje.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});

    return (
      <div style={{width:"100%",minWidth:0}}>

        <div style={{marginBottom:22}}>
          <div style={{fontSize:12,color:th.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>{dataExtenso}</div>
          <h1 style={{fontSize:25,fontWeight:700,color:th.text,margin:"3px 0 0",letterSpacing:"-0.025em"}}>Evolução diária</h1>
        </div>

        {erro&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"13px 18px",marginBottom:20,color:"#dc2626",fontSize:13}}>⚠️ {erro}</div>}

        <div style={{display:"flex",gap:26,width:"100%",minWidth:0,alignItems:"flex-start",flexWrap:"wrap"}}>
          <main style={{flex:"999 1 560px",minWidth:0,display:"flex",flexDirection:"column",gap:30}}>

            {/* ══ FAIXA DE FOCO ══ */}
            <section style={{borderRadius:28,background:faixaBg,boxShadow:faixaFio,overflow:"hidden"}}>

              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",padding:"22px 28px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:2,background:pillBg,borderRadius:999,padding:3,boxShadow:`inset 0 0 0 1px ${pillFio}`}}>
                  <button onClick={()=>navegarMesDash(-1)} style={{width:27,height:27,border:"none",borderRadius:999,background:"transparent",color:th.textMuted,cursor:"pointer",fontSize:15,lineHeight:1,fontFamily:"inherit"}}>‹</button>
                  <span style={{fontSize:12.5,fontWeight:700,color:th.textSub,padding:"0 6px",fontVariantNumeric:"tabular-nums"}}>{MESES_PT[mesVis]} {anoVis}</span>
                  <button onClick={()=>navegarMesDash(1)} style={{width:27,height:27,border:"none",borderRadius:999,background:"transparent",color:th.textMuted,cursor:"pointer",fontSize:15,lineHeight:1,fontFamily:"inherit"}}>›</button>
                </div>
                <div style={{display:"flex",gap:2,background:pillBg,borderRadius:999,padding:3,boxShadow:`inset 0 0 0 1px ${pillFio}`,flexWrap:"wrap"}}>
                  {pillsTopo.map(p=>(
                    <button key={p.id} onClick={()=>trocarContaDash(p.id)} style={estiloPill(contaDash===p.id,false)}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",flexWrap:"wrap",gap:0}}>

                {/* velocímetro */}
                <div style={{flex:"1 1 360px",minWidth:0,padding:"10px 28px 26px",display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
                  <div style={{fontSize:11.5,color:th.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,textAlign:"center"}}>
                    {ehHabitos ? "Hábitos · ritmo até hoje" : "Disciplina do mês"}
                  </div>

                  <svg viewBox="0 0 260 172" style={{width:280,maxWidth:"100%",height:"auto",display:"block"}}>
                    <path d="M30,130 A100,100 0 0 1 230,130" fill="none" stroke={trilho} strokeWidth="14" strokeDasharray="6.6 3.87"/>
                    <path d={arcoGauge(gaugePct)} fill="none" stroke={corNivel(gaugePct)} strokeWidth="14" strokeDasharray="6.6 3.87"/>
                    <text x="130" y="114" textAnchor="middle" fontSize="54" fontWeight="800" fill={corNivel(gaugePct)} style={{fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"}}>{gaugePct}%</text>
                    <text x="130" y="141" textAnchor="middle" fontSize="12.5" fontWeight="500" fill={th.textMuted}>
                      {ehHabitos
                        ? `${pctHabMedio}% do mês cheio · dia ${diaCorrenteMes} de ${diasMesTotal}`
                        : (dm.trades>0 ? `${dm.limpos} de ${dm.trades} trades limpos` : "sem trades no mês")}
                    </text>
                    <text x="26" y="156" textAnchor="start" fontSize="10.5" fill={th.textMuted}>0</text>
                    <text x="234" y="156" textAnchor="end" fontSize="10.5" fill={th.textMuted}>100</text>
                  </svg>

                  {ehHabitos && (
                    <div style={{fontSize:12,color:th.textMuted,textAlign:"center",marginTop:-8,lineHeight:1.5}}>
                      100% = exatamente no ritmo que o mês pede até hoje.<br/>
                      Acima disso, adiantado.
                    </div>
                  )}

                  <div style={{display:"flex",gap:10,width:"100%",maxWidth:400,flexWrap:"wrap"}}>
                    {miniCirculos.map(m=>(
                      <div key={m.label} style={{flex:"1 1 150px",minWidth:0,display:"flex",alignItems:"center",gap:10,borderRadius:16,padding:"11px 12px",background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`}}>
                        <svg width="46" height="46" viewBox="0 0 56 56" style={{flexShrink:0}}>
                          <circle cx="28" cy="28" r="22" fill="none" stroke={trilho} strokeWidth="5"/>
                          <circle cx="28" cy="28" r="22" fill="none" stroke={corNivel(m.pct)} strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={`${(Math.min(100,m.pct)/100*138.23).toFixed(1)} 138.3`} transform="rotate(-90 28 28)"/>
                          <text x="28" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill={corNivel(m.pct)} style={{fontVariantNumeric:"tabular-nums"}}>{m.pct}%</text>
                        </svg>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:12.5,fontWeight:700,color:th.textSub}}>{m.label}</div>
                          <div style={{fontSize:11.5,color:th.textMuted,marginTop:2}}>{m.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* curva */}
                <div style={{flex:"1 1 420px",minWidth:0,position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end",minHeight:318}}>
                  <div style={{position:"absolute",top:14,left:10,right:28,display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:11.5,color:th.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>
                      {ehHabitos ? `Avanço dos hábitos · ${MESES_PT[mesVis].toLowerCase()}` : `Curva acumulada · ${rotuloVisao}`}
                    </span>
                    <span style={{fontSize:12.5,color:th.textMuted,fontVariantNumeric:"tabular-nums"}}>
                      <strong style={{color:ehHabitos||financMes===null||financMes>=0?ACCENT_ATUAL:COR_NEG,fontWeight:800,fontSize:15}}>
                        {ehHabitos ? `${pctHabMedio}%` : (financMes===null ? "—" : `${financMes>=0?"+":"−"}R$ ${Math.abs(financMes).toLocaleString("pt-BR",{maximumFractionDigits:0})}`)}
                      </strong>
                      {!ehHabitos && <>&nbsp;·&nbsp;{wrMes===null?"—":`${wrMes}% de acerto`} · {dm.trades} {dm.trades===1?"trade":"trades"}</>}
                    </span>
                  </div>

                  {!ehHabitos && (
                    pontosMesDash.length >= 2 ? (
                      <svg viewBox="0 0 640 250" preserveAspectRatio="none" style={{width:"100%",height:250,display:"block"}}>
                        <defs>
                          <linearGradient id="curvaFillDash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={ACCENT_ATUAL} stopOpacity="0.34"/>
                            <stop offset="100%" stopColor={ACCENT_ATUAL} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {(()=>{
                          const vals = pontosMesDash.map(p=>p.valor);
                          const maxV = Math.max(...vals,0), minV = Math.min(...vals,0);
                          const range = (maxV-minV)||1;
                          const X = i => (pontosMesDash.length===1?0:(i/(pontosMesDash.length-1))*640);
                          const Y = v => 240 - ((v-minV)/range)*200;
                          const d = pontosMesDash.map((p,i)=>`${i===0?"M":"L"}${X(i).toFixed(1)},${Y(p.valor).toFixed(1)}`).join(" ");
                          const zeroY = Y(0);
                          const ultX = X(pontosMesDash.length-1), ultY = Y(vals[vals.length-1]);
                          return (<>
                            <line x1="0" y1={zeroY} x2="640" y2={zeroY} stroke={trilho} strokeDasharray="3 5" vectorEffect="non-scaling-stroke"/>
                            <path d={`${d} L640,250 L0,250 Z`} fill="url(#curvaFillDash)"/>
                            <path d={d} fill="none" stroke={ACCENT_ATUAL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
                            <circle cx={ultX} cy={ultY} r="4.5" fill={ACCENT_ATUAL} stroke={th.bg} strokeWidth="2.5"/>
                          </>);
                        })()}
                      </svg>
                    ) : (
                      <div style={{padding:"0 28px 46px",fontSize:13,color:th.textMuted}}>Sem trades suficientes no mês para desenhar a curva.</div>
                    )
                  )}

                  {ehHabitos && (
                    <div style={{padding:"58px 28px 26px",display:"flex",flexDirection:"column",gap:18}}>
                      <p style={{margin:0,fontSize:12.5,lineHeight:1.5,color:th.textMuted}}>
                        A linha pontilhada é o ritmo que o mês pede até hoje. Acima dela, está em dia.
                      </p>
                      <svg viewBox="0 0 560 190" preserveAspectRatio="none" style={{width:"100%",height:190,display:"block"}}>
                        <line x1="0" y1="178" x2="560" y2="178" stroke={trilho} vectorEffect="non-scaling-stroke"/>
                        <line x1="0" y1="178" x2="560" y2="48" stroke="#86A9FF" strokeWidth="1.8" strokeDasharray="5 5" vectorEffect="non-scaling-stroke"/>
                        {serieHabMes.length >= 2 && (()=>{
                          const n = serieHabMes.length;
                          const d = serieHabMes.map((p,i)=>`${i===0?"M":"L"}${((i/(n-1))*560).toFixed(1)},${(178 - Math.min(100,p.pct)/100*140).toFixed(1)}`).join(" ");
                          const ult = serieHabMes[n-1];
                          return (<>
                            <path d={d} fill="none" stroke={ACCENT_ATUAL} strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                            <circle cx="560" cy={178 - Math.min(100,ult.pct)/100*140} r="4.5" fill={ACCENT_ATUAL} stroke={th.bg} strokeWidth="2.5"/>
                          </>);
                        })()}
                      </svg>
                      <div style={{display:"flex",gap:18,flexWrap:"wrap",fontSize:11.5,color:th.textMuted}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:7}}><span style={{width:18,height:2.5,borderRadius:2,background:ACCENT_ATUAL}}/>realizado</span>
                        <span style={{display:"inline-flex",alignItems:"center",gap:7}}><span style={{width:18,height:2.5,borderRadius:2,background:"#86A9FF"}}/>ritmo esperado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ══ ESTADO DO DIA ══ */}
            <section style={{borderRadius:18,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`,overflow:"hidden"}}>
              {!operouHoje ? (
                <div style={{padding:"15px 20px",fontSize:12.5,color:th.textMuted}}>
                  Nenhum trade hoje — dia sem trade é resultado, não empate.
                </div>
              ) : (
                <>
                  <div style={{display:"flex",flexWrap:"wrap"}}>
                    {hojePorConta.map((c,i)=>(
                      <div key={c.conta} style={{flex:"1 1 180px",minWidth:0,padding:"14px 20px",boxShadow:i<hojePorConta.length-1?`inset -1px 0 0 ${supFio}`:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                          <span style={{fontSize:10.5,color:th.textMuted,letterSpacing:"0.09em",textTransform:"uppercase",fontWeight:700}}>{c.rotulo}</span>
                          {c.erroNoPrimeiro && <span style={{width:6,height:6,borderRadius:999,background:COR_NEG}}/>}
                        </div>
                        <div style={{fontSize:17,fontWeight:800,fontVariantNumeric:"tabular-nums",color:c.resultado>=0?ACCENT_ATUAL:COR_NEG}}>
                          {c.resultado>=0?"+":"−"}R$ {Math.abs(Math.round(c.resultado)).toLocaleString("pt-BR")}
                        </div>
                        <div style={{fontSize:11.5,color:th.textMuted,marginTop:3,fontVariantNumeric:"tabular-nums"}}>
                          {c.trades} {c.trades===1?"trade":"trades"} · resta <strong style={{color:c.restante<=150?COR_NEG:th.textSub,fontWeight:700}}>R$ {c.restante.toLocaleString("pt-BR")}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"12px 20px",boxShadow:`inset 0 1px 0 ${supFio}`}}>
                    {contasCrivo.length > 0 ? (
                      <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
                        <span style={{width:7,height:7,borderRadius:999,background:COR_NEG,flexShrink:0,marginTop:5}}/>
                        <span style={{fontSize:12.5,lineHeight:1.45,color:th.textSub}}>
                          <strong style={{color:COR_NEG,fontWeight:700}}>Crivo elevado em {contasCrivo.map(c=>c.rotulo).join(" e ")}.</strong>{" "}
                          O 1º trade teve erro nomeado — o próximo só se for nota 10. A taxa de erro nos trades seguintes sobe de 30% para 46%.
                        </span>
                      </div>
                    ) : tradesHoje >= 2 ? (
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <span style={{width:7,height:7,borderRadius:999,background:ACCENT_ATUAL,flexShrink:0}}/>
                        <span style={{fontSize:12.5,lineHeight:1.45,color:th.textSub}}>1º trade sem erro. Antes do 3º clique: qual é a nota?</span>
                      </div>
                    ) : (
                      <span style={{fontSize:12.5,color:th.textMuted}}>Dia em aberto.</span>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* ══ ESTUDOS · RITMO DO TRIMESTRE ══ */}
            <section>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                <h2 style={{margin:0,fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>
                  Estudos <span style={{color:th.border2}}>·</span> Ritmo do trimestre
                </h2>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:12,color:th.textMuted,fontVariantNumeric:"tabular-nums"}}>{decorridosDash} de {diasQuarterDash} dias</span>
                  <select value={triDash} onChange={e=>trocarTriDash(e.target.value)}
                    style={{fontSize:11.5,fontWeight:600,color:th.textSub,background:pillBg,border:"none",boxShadow:`inset 0 0 0 1px ${pillFio}`,borderRadius:999,padding:"5px 10px",outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
                    {trisDisponiveisDash.map(c=>(<option key={c} value={c}>{rotuloTriDash(c)}</option>))}
                  </select>
                </div>
              </div>

              <div style={{display:"flex",flexWrap:"wrap",gap:0,borderRadius:22,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`}}>
                {metasEstudoDash.map((item,i)=>(
                  <div key={item.label} style={{flex:"1 1 200px",minWidth:0,padding:"19px 24px",boxShadow:i<metasEstudoDash.length-1?`inset -1px 0 0 ${supFio}`:"none"}}>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8}}>
                      <span style={{fontSize:13,color:th.textSub,fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:13,color:th.textMuted,fontVariantNumeric:"tabular-nums"}}>{item.valor} / {item.meta}</span>
                    </div>
                    <div style={{position:"relative",height:7,borderRadius:999,background:trilho,marginTop:11}}>
                      <div style={{position:"absolute",top:0,bottom:0,left:0,width:`${Math.min(100,item.pctVal)}%`,borderRadius:999,background:`linear-gradient(90deg, ${ACCENT_ATUAL}99, ${ACCENT_ATUAL})`,transition:"width 0.8s ease"}}/>
                      <div title="ritmo esperado" style={{position:"absolute",top:-3,left:`${Math.min(100,pctEsperadoDash*100)}%`,width:2,height:13,borderRadius:2,background:th.text,opacity:0.55}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11.5}}>
                      <span style={{color:th.textMuted,fontVariantNumeric:"tabular-nums"}}>{item.pctVal}%</span>
                      <span style={{fontWeight:700,color:item.noRitmo?ACCENT_ATUAL:COR_NEG}}>{item.noRitmo?"no ritmo":`faltam ${item.falta}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ══ CONSTÂNCIA ══ */}
            <section>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                <h2 style={{margin:0,fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>Constância</h2>
                <div style={{display:"flex",gap:2,background:pillBg,borderRadius:999,padding:3,boxShadow:`inset 0 0 0 1px ${pillFio}`}}>
                  {[10,20,30,40].map(n=>(
                    <button key={n} onClick={()=>trocarJanelaConst(n)} style={estiloPill(janelaConst===n,true)}>{n}</button>
                  ))}
                </div>
              </div>

              <div style={{borderRadius:22,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`,padding:"24px 28px 20px"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:22,flexWrap:"wrap"}}>
                  <span style={{fontSize:30,fontWeight:800,color:limposSeguidos>0?ACCENT_ATUAL:COR_NEG,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{limposSeguidos}</span>
                  <span style={{fontSize:13,color:th.textMuted}}>
                    dias limpos seguidos · {quebras.length} {quebras.length===1?"quebra":"quebras"} e {totalErrosJanela} {totalErrosJanela===1?"erro":"erros"} nas últimas {janelaSess.length} {janelaSess.length===1?"sessão":"sessões"}
                  </span>
                </div>

                <div style={{position:"relative",height:34}}>
                  <div style={{position:"absolute",top:9,left:0,right:0,height:2,borderRadius:2,background:trilho}}/>
                  <div style={{position:"absolute",top:9,right:0,width:`${pctVerdeConst}%`,height:2,borderRadius:2,background:ACCENT_ATUAL}}/>
                  {quebras.map(({d,i})=>(
                    <div key={d.chave} style={{position:"absolute",top:0,left:`${janelaSess.length>1?(i/(janelaSess.length-1))*100:0}%`,display:"flex",flexDirection:"column",alignItems:"center",gap:5,transform:"translateX(-50%)"}}>
                      <span style={{width:2,height:20,borderRadius:2,background:COR_NEG}}/>
                      <span style={{fontSize:10,color:th.textMuted,whiteSpace:"nowrap"}}>
                        {d.chave.slice(8,10)}/{d.chave.slice(5,7)}
                      </span>
                    </div>
                  ))}
                </div>

                {chipsErros.length > 0 && (
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginTop:16,paddingTop:15,boxShadow:`inset 0 1px 0 ${supFio}`}}>
                    <span style={{fontSize:12,color:th.textMuted}}>O que quebrou, nessas {janelaSess.length} sessões:</span>
                    {chipsErros.map(c=>(
                      <span key={c.texto} style={{fontSize:12,color:th.textSub,background:dark?"rgba(196,92,62,0.14)":"rgba(194,80,47,0.10)",boxShadow:`inset 0 0 0 1px ${dark?"rgba(196,92,62,0.30)":"rgba(194,80,47,0.22)"}`,borderRadius:999,padding:"3px 10px"}}>
                        {c.texto}{c.n>1 && <strong style={{fontWeight:800,marginLeft:5}}>×{c.n}</strong>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ══ CALENDÁRIO + SETUPS ══ */}
            <div style={{display:"flex",flexWrap:"wrap",gap:24}}>

              <section style={{flex:"1 1 320px",minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                  <h2 style={{margin:0,fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>{MESES_PT[mesVis]}</h2>
                  <select value={calFiltro} onChange={e=>trocarCalFiltro(e.target.value)}
                    style={{fontSize:11.5,fontWeight:600,color:th.textSub,background:pillBg,border:"none",boxShadow:`inset 0 0 0 1px ${pillFio}`,borderRadius:999,padding:"5px 10px",outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
                    <option value="segue">Segue o topo</option>
                    <option value="todos">Todas as contas</option>
                    {CONTAS_DASH.map(c=><option key={c} value={c}>{ROTULO_CONTA[c]}</option>)}
                    <option value="habitos">Hábitos</option>
                  </select>
                </div>

                <div style={{borderRadius:22,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`,padding:"20px 22px 22px",position:"relative"}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:7,marginBottom:9}}>
                    {DIAS_SEM_CUR.map((ds,i)=>(<span key={i} style={{textAlign:"center",fontSize:10.5,color:th.textMuted}}>{ds}</span>))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:7}}>
                    {miniCalDias.map((c,i)=>{
                      if(c.dia===null) return <span key={`v${i}`}/>;
                      const habD = habitosPorData[c.dataStr];
                      const okHab = habD ? ((habD.horas>=1?1:0)+(habD.replays>=1?1:0)+(habD.paginas>=1?1:0)) >= 3 : false;
                      const ehHoje = c.dataStr === hojeChaveCal;
                      let fundo = "transparent", cor = th.textMuted, peso = 500, fio = `inset 0 0 0 1px ${supFio}`;
                      if(calEfetivo === "habitos"){
                        if(habD){ fundo = okHab ? (dark?"#1E6B4B":"#cdebdb") : (dark?"#5E2A1E":"#f6d9cf"); cor = th.text; peso = 700; fio = "none"; }
                        else if(c.futuro){ fundo = "transparent"; }
                        else if(!c.fimDeSemana){ fundo = dark?"rgba(255,255,255,0.045)":"rgba(15,23,42,0.045)"; cor = th.textSub; fio = "none"; }
                      } else if(c.r){
                        const forte = Math.abs(c.r.resultado) >= 400;
                        fundo = c.r.resultado >= 0
                          ? (forte ? (dark?"#1E6B4B":"#9fd9bd") : (dark?"#11452F":"#cdebdb"))
                          : (forte ? (dark?"#8E3E2B":"#eeb8a7") : (dark?"#5E2A1E":"#f6d9cf"));
                        cor = dark ? (c.r.resultado>=0?"#DFF5EA":"#FDE4DA") : "#20262e";
                        peso = 700; fio = "none";
                      } else if(!c.futuro && !c.fimDeSemana){
                        fundo = dark?"rgba(255,255,255,0.045)":"rgba(15,23,42,0.045)"; cor = th.textSub; fio = "none";
                      }
                      const clicavel = !!c.r;
                      return (
                        <button key={c.dataStr} onClick={()=>clicavel && setDiaSel(diaSel===c.dataStr?null:c.dataStr)}
                          style={{
                            aspectRatio:"1",border:"none",borderRadius:11,background:fundo,color:cor,
                            fontFamily:"inherit",fontSize:12.5,fontWeight:peso,fontVariantNumeric:"tabular-nums",
                            display:"flex",alignItems:"center",justifyContent:"center",padding:0,
                            cursor:clicavel?"pointer":"default",
                            boxShadow: ehHoje ? `0 0 0 2px ${ACCENT_ATUAL}` : (diaSel===c.dataStr ? `0 0 0 2px ${th.text}` : fio),
                          }}>{c.dia}</button>
                      );
                    })}
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:9,marginTop:17,paddingTop:15,boxShadow:`inset 0 1px 0 ${supFio}`}}>
                    <span style={{fontSize:11.5,color:th.textMuted}}>perda</span>
                    <div style={{flex:1,height:6,borderRadius:999,background:dark
                      ? "linear-gradient(90deg,#8E3E2B,#5E2A1E,rgba(255,255,255,0.08),#11452F,#2B8A61)"
                      : "linear-gradient(90deg,#eeb8a7,#f6d9cf,rgba(15,23,42,0.07),#cdebdb,#9fd9bd)"}}/>
                    <span style={{fontSize:11.5,color:th.textMuted}}>ganho</span>
                  </div>

                  {diaSel && contasPorData[diaSel] && (
                    <>
                      <div onClick={()=>setDiaSel(null)} style={{position:"absolute",inset:0,borderRadius:22,background:dark?"rgba(6,10,14,0.55)":"rgba(15,23,42,0.22)",backdropFilter:"blur(3px)",zIndex:2}}/>
                      <div style={{
                        position:"absolute",zIndex:3,left:16,right:16,top:"50%",transform:"translateY(-50%)",
                        borderRadius:20,padding:"18px 20px 20px",
                        background:dark?"#141A20":"#ffffff",
                        boxShadow:dark
                          ? "inset 0 0 0 1px rgba(255,255,255,0.09), 0 28px 60px -22px rgba(0,0,0,0.85)"
                          : "inset 0 0 0 1px rgba(15,23,42,0.08), 0 28px 60px -26px rgba(15,23,42,0.45)",
                        maxHeight:"calc(100% - 32px)",overflowY:"auto",
                      }}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
                          <div>
                            <div style={{fontSize:10.5,color:th.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>
                              {new Date(`${diaSel}T12:00:00`).toLocaleDateString("pt-BR",{weekday:"long"})}
                            </div>
                            <div style={{fontSize:19,fontWeight:800,color:th.text,letterSpacing:"-0.02em",fontVariantNumeric:"tabular-nums"}}>
                              {diaSel.slice(8,10)}/{diaSel.slice(5,7)}
                            </div>
                          </div>
                          <button onClick={()=>setDiaSel(null)} style={{width:28,height:28,borderRadius:999,border:"none",background:dark?"rgba(255,255,255,0.07)":"rgba(15,23,42,0.06)",color:th.textMuted,cursor:"pointer",fontFamily:"inherit",fontSize:15,lineHeight:1}}>×</button>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:10}}>
                          {CONTAS_DASH.filter(c=>contasPorData[diaSel][c]).map(c=>{
                            const d = contasPorData[diaSel][c];
                            return (
                              <div key={c} style={{borderRadius:15,background:dark?"rgba(255,255,255,0.038)":"rgba(15,23,42,0.035)",padding:"12px 14px"}}>
                                <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8}}>
                                  <span style={{fontSize:12,fontWeight:700,color:th.textSub,letterSpacing:"0.02em"}}>{ROTULO_CONTA[c]}</span>
                                  <span style={{fontSize:15,fontWeight:800,fontVariantNumeric:"tabular-nums",color:d.resultado>=0?ACCENT_ATUAL:COR_NEG}}>
                                    {d.resultado>=0?"+":"−"}R$ {Math.abs(Math.round(d.resultado)).toLocaleString("pt-BR")}
                                  </span>
                                </div>
                                <div style={{display:"flex",gap:14,marginTop:7,fontSize:11.5,color:th.textMuted,fontVariantNumeric:"tabular-nums",flexWrap:"wrap"}}>
                                  <span>{d.trades} {d.trades===1?"trade":"trades"}</span>
                                  <span>{d.taxaAcerto}% de acerto</span>
                                  {d.gains>0 && <span>{d.gains} gain</span>}
                                  {d.losses>0 && <span>{d.losses} loss</span>}
                                  {d.nota10>0 && <span style={{color:ACCENT_ATUAL,fontWeight:700}}>{d.nota10} nota 10</span>}
                                </div>
                                {(d.erros||[]).length>0 && (
                                  <div style={{marginTop:10,paddingTop:9,boxShadow:`inset 0 1px 0 ${supFio}`,display:"flex",flexDirection:"column",gap:5}}>
                                    {(d.erros||[]).map((e,i)=>{
                                      const tec = (d.errosTecnico||[]).indexOf(e) >= 0;
                                      const emo = (d.errosEmocional||[]).indexOf(e) >= 0;
                                      return (
                                        <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                                          <span style={{flexShrink:0,marginTop:4,width:6,height:6,borderRadius:999,background:emo?COR_NEG:(tec?COR_MEIO:th.textMuted)}}/>
                                          <span style={{fontSize:12,color:th.textSub,lineHeight:1.45}}>
                                            {e}
                                            <span style={{color:th.textMuted,marginLeft:6,fontSize:10.5,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                                              {emo?"emocional":(tec?"técnico":"sem tipo")}
                                            </span>
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section style={{flex:"1 1 320px",minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                  <h2 style={{margin:0,fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>Setups do mês</h2>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    {setupConta && setupConta !== contaTopoSetup && (
                      <button onClick={()=>setSetupConta(null)} style={{border:"none",background:"transparent",color:th.textMuted,fontFamily:"inherit",fontSize:11,cursor:"pointer",padding:0,textDecoration:"underline",textUnderlineOffset:3}}>seguir o topo</button>
                    )}
                    <div style={{display:"flex",gap:2,background:pillBg,borderRadius:999,padding:3,boxShadow:`inset 0 0 0 1px ${pillFio}`,flexWrap:"wrap"}}>
                      {pillsSetup.map(p=>(
                        <button key={p.id} onClick={()=>setSetupConta(p.id)} style={estiloPill(contaSetupEfetiva===p.id,true)}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{borderRadius:22,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`,padding:"6px 24px 10px"}}>
                  {listaSetupsNova.length===0 ? (
                    <div style={{padding:"22px 0",fontSize:13,color:th.textMuted}}>Nenhum setup registrado no mês.</div>
                  ) : listaSetupsNova.map((s,i)=>{
                    const pos = s.valor >= 0;
                    const larg = `${(Math.abs(s.valor)/maxAbsSetup*100).toFixed(0)}%`;
                    return (
                      <div key={s.nome} style={{padding:"15px 0",boxShadow:i===listaSetupsNova.length-1?"none":`inset 0 -1px 0 ${supFio}`}}>
                        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10}}>
                          <span style={{fontSize:13.5,fontWeight:600,color:th.text}}>{s.nome}</span>
                          <span style={{fontSize:13.5,fontWeight:800,fontVariantNumeric:"tabular-nums",color:pos?ACCENT_ATUAL:COR_NEG}}>
                            {pos?"+R$ ":"−R$ "}{Math.abs(s.valor).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:11,marginTop:9}}>
                          <div style={{flex:1,display:"flex",height:6}}>
                            <div style={{width:"50%",display:"flex",justifyContent:"flex-end"}}>
                              {!pos && <span style={{display:"block",width:larg,height:6,background:COR_NEG,borderRadius:"999px 0 0 999px"}}/>}
                            </div>
                            <div style={{width:"50%"}}>
                              {pos && <span style={{display:"block",width:larg,height:6,background:ACCENT_ATUAL,borderRadius:"0 999px 999px 0"}}/>}
                            </div>
                          </div>
                          <span style={{fontSize:11.5,color:th.textMuted,flexShrink:0,fontVariantNumeric:"tabular-nums"}}>
                            {s.ops} {s.ops===1?"op":"ops"}{s.wr===null?"":` · ${s.wr}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </main>

          {/* ══ COLUNA DE FOCO ══ */}
          <aside style={{flex:"1 1 300px",minWidth:288,maxWidth:356,display:"flex",flexDirection:"column",gap:24}}>

            <div style={{borderRadius:20,padding:"18px 20px",background:`linear-gradient(160deg, ${ACCENT_ATUAL}1F, ${dark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.6)"})`,boxShadow:`inset 0 0 0 1px ${ACCENT_ATUAL}33`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9}}>
                <span style={{fontSize:11.5,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:ACCENT_ATUAL}}>Lembrete</span>
                {estadoAlterado && <span style={{fontSize:10.5,fontWeight:700,color:COR_MEIO,letterSpacing:"0.04em"}}>não salvo</span>}
              </div>
              <textarea value={estadoHoje.lembrete} onChange={e=>mudarEstadoHoje("lembrete",e.target.value)}
                rows={3} placeholder="O que você precisa lembrar hoje"
                style={{width:"100%",boxSizing:"border-box",background:"transparent",border:"none",outline:"none",resize:"none",
                  color:th.text,fontFamily:"inherit",fontSize:16.5,lineHeight:1.5,fontWeight:500,padding:0}}/>
            </div>

            <div>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10,marginBottom:14}}>
                <h2 style={{margin:0,fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>Pré-mercado de hoje</h2>
                <span style={{fontSize:11,color:th.textMuted}}>{hojeStr.slice(8,10)}/{hojeStr.slice(5,7)}</span>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:15}}>
                {[
                  { campo:"disposicao", rotulo:"Disposição", max:5, segs:5, sufixo:"/5", step:1,  larg:34 },
                  { campo:"sono",       rotulo:"Sono",       max:10, segs:10, sufixo:"h", step:0.5, larg:42, marca:80 },
                  { campo:"emocional",  rotulo:"Emocional",  max:5, segs:5, sufixo:"/5", step:1,  larg:34 },
                ].map(f=>{
                  const v = Number(estadoHoje[f.campo]) || 0;
                  return (
                    <div key={f.campo}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:7}}>
                        <label style={{fontSize:12.5,color:th.textSub}}>{f.rotulo}</label>
                        <span style={{display:"inline-flex",alignItems:"baseline",gap:3}}>
                          <input type="number" min="0" max={f.max} step={f.step} value={estadoHoje[f.campo]}
                            onChange={e=>mudarEstadoHoje(f.campo,e.target.value)}
                            style={{width:f.larg,background:dark?"rgba(255,255,255,0.05)":"rgba(15,23,42,0.04)",border:"none",
                              boxShadow:`inset 0 0 0 1px ${supFio}`,borderRadius:7,color:th.text,fontFamily:"inherit",
                              fontSize:12.5,fontWeight:700,textAlign:"center",padding:"3px 0",outline:"none"}}/>
                          <span style={{fontSize:11,color:th.textMuted}}>{f.sufixo}</span>
                        </span>
                      </div>
                      <div style={{position:"relative",display:"flex",gap:f.segs>5?3:4}}>
                        {Array.from({length:f.segs}).map((_,i)=>{
                          const cheio = v >= i+1;
                          const meio = !cheio && v > i;
                          return <span key={i} style={{flex:1,height:7,borderRadius:999,background:cheio?ACCENT_ATUAL:(meio?`${ACCENT_ATUAL}99`:trilho)}}/>;
                        })}
                        {f.marca && <span title="meta: 8h" style={{position:"absolute",top:-3,left:`${f.marca}%`,width:2,height:13,borderRadius:2,background:th.text,opacity:0.55}}/>}
                      </div>
                      {f.marca && <div style={{fontSize:10.5,color:th.textMuted,marginTop:6}}>o traço marca as 8h</div>}
                    </div>
                  );
                })}

                <button onClick={salvarEstadoDiaApp} disabled={!estadoAlterado||estadoSalvando}
                  style={{padding:"9px 0",borderRadius:11,fontSize:12.5,fontWeight:700,
                    background:estadoAlterado&&!estadoSalvando?ACCENT_ATUAL:"transparent",
                    color:estadoAlterado&&!estadoSalvando?"#fff":th.textMuted,
                    border:`1px solid ${estadoAlterado&&!estadoSalvando?ACCENT_ATUAL:th.border2}`,
                    cursor:estadoAlterado&&!estadoSalvando?"pointer":"default",fontFamily:"inherit",width:"100%"}}>
                  {estadoSalvando?"Salvando…":(estadoAlterado?"Salvar":"Salvo")}
                </button>
                {erroEstado && (
                  <div style={{fontSize:11.5,color:COR_NEG,lineHeight:1.45,marginTop:-6}}>
                    Não consegui salvar. O texto fica guardado aqui no navegador — tente de novo em instantes.
                  </div>
                )}
              </div>
            </div>

            <div style={{paddingTop:22,boxShadow:`inset 0 1px 0 ${supFio}`}}>
              <h2 style={{margin:"0 0 12px",fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>Plano da semana</h2>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {planoSemana.map(p=>(
                  <div key={p.id} style={{paddingLeft:14,boxShadow:`inset 2px 0 0 ${ACCENT_ATUAL}`,display:"flex",gap:8,alignItems:"flex-start"}}>
                    <p style={{margin:0,fontSize:13.5,lineHeight:1.5,color:th.textSub,flex:1}}>{p.texto}</p>
                    <span onClick={()=>removePlanoItem(p.id)} style={{cursor:"pointer",color:th.textMuted,fontSize:16,lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>
              {showFormPlano ? (
                <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:12}}>
                  <textarea autoFocus value={novoPlano} onChange={e=>setNovoPlano(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlanoItem()} placeholder="Novo item do plano..." rows={2}
                    style={{fontSize:13,padding:"8px 10px",border:"none",boxShadow:`inset 0 0 0 1px ${supFio}`,borderRadius:10,outline:"none",fontFamily:"inherit",resize:"none",boxSizing:"border-box",background:dark?"rgba(255,255,255,0.035)":"rgba(15,23,42,0.03)",color:th.text}}/>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>{addPlanoItem();setShowFormPlano(false);}} style={{flex:1,background:ACCENT_ATUAL,color:"#fff",border:"none",borderRadius:10,padding:"7px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Adicionar</button>
                    <button onClick={()=>{setShowFormPlano(false);setNovoPlano("");}} style={{background:"none",border:`1px solid ${th.border2}`,color:th.textMuted,borderRadius:10,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>setShowFormPlano(true)} style={{marginTop:12,width:"100%",padding:"9px 0",border:"none",borderRadius:11,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`,color:th.textMuted,fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer"}}>+ Adicionar item</button>
              )}
            </div>

            <div style={{paddingTop:22,boxShadow:`inset 0 1px 0 ${supFio}`}}>
              <h2 style={{margin:"0 0 12px",fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:COR_NEG}}>Pontos de atenção</h2>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {pontosAtencao.map(p=>(
                  <div key={p.id} style={{paddingLeft:14,boxShadow:`inset 2px 0 0 ${COR_NEG}`,display:"flex",gap:8,alignItems:"flex-start"}}>
                    <p style={{margin:0,fontSize:13.5,lineHeight:1.5,color:th.textSub,flex:1}}>{p.texto}</p>
                    <span onClick={()=>removePontoItem(p.id)} style={{cursor:"pointer",color:th.textMuted,fontSize:16,lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>
              {showFormPonto ? (
                <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:12}}>
                  <textarea autoFocus value={novoPonto} onChange={e=>setNovoPonto(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPontoItem()} placeholder="Novo ponto..." rows={2}
                    style={{fontSize:13,padding:"8px 10px",border:"none",boxShadow:`inset 0 0 0 1px ${supFio}`,borderRadius:10,outline:"none",fontFamily:"inherit",resize:"none",boxSizing:"border-box",background:dark?"rgba(255,255,255,0.035)":"rgba(15,23,42,0.03)",color:th.text}}/>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>{addPontoItem();setShowFormPonto(false);}} style={{flex:1,background:COR_NEG,color:"#fff",border:"none",borderRadius:10,padding:"7px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Adicionar</button>
                    <button onClick={()=>{setShowFormPonto(false);setNovoPonto("");}} style={{background:"none",border:`1px solid ${th.border2}`,color:th.textMuted,borderRadius:10,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>setShowFormPonto(true)} style={{marginTop:12,width:"100%",padding:"9px 0",border:"none",borderRadius:11,background:sup,boxShadow:`inset 0 0 0 1px ${supFio}`,color:th.textMuted,fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer"}}>+ Adicionar ponto</button>
              )}
            </div>

            {objetivosSemanaAtual && (objetivosSemanaAtual.objetivos||[]).length>0 && (
              <div style={{paddingTop:22,boxShadow:`inset 0 1px 0 ${supFio}`}}>
                <h2 style={{margin:"0 0 12px",fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:th.textMuted}}>Objetivos da semana</h2>
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {objetivosSemanaAtual.objetivos.map(o=>(
                    <div key={o.id} style={{display:"flex",gap:11,alignItems:"flex-start"}}>
                      <span style={{flexShrink:0,marginTop:2,width:16,height:16,borderRadius:6,
                        background:o.done?`${ACCENT_ATUAL}1F`:"transparent",
                        boxShadow:`inset 0 0 0 1px ${o.done?`${ACCENT_ATUAL}4D`:th.border2}`,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {o.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ACCENT_ATUAL} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                      </span>
                      <p style={{margin:0,fontSize:13.5,lineHeight:1.5,color:o.done?th.textMuted:th.textSub,textDecoration:o.done?"line-through":"none"}}>{o.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        <div style={{position:"relative"}}>
          <div onClick={()=>setMenuTemaAberto(v=>!v)} style={{
            padding:"9px 20px",borderRadius:24,fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",cursor:"pointer",
            background:th.surface,border:`1px solid ${th.border}`,color:th.textMuted,
            display:"flex",alignItems:"center",gap:8,
          }}>
            <Ico.Palette s={15} c={ACCENT_ATUAL}/> Temas
          </div>
          {menuTemaAberto && (
            <>
              <div onClick={()=>setMenuTemaAberto(false)} style={{position:"fixed",inset:0,zIndex:19,background:"transparent"}}/>
              <div style={{
                position:"absolute",top:46,right:0,zIndex:20,minWidth:190,
                background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:14,padding:6,
                boxShadow:"0 12px 32px rgba(0,0,0,0.35)",
              }}>
                {["Escuros","Claros"].map(grupo=>(
                  <div key={grupo}>
                    <div style={{fontSize:9.5,fontWeight:700,color:th.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",padding:"8px 10px 4px"}}>{grupo}</div>
                    {THEMES.filter(t=>t.dark===(grupo==="Escuros")).map(t=>(
                      <div key={t.id} onClick={()=>{trocarTema(t.id);setMenuTemaAberto(false);}} style={{
                        display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,cursor:"pointer",
                        background:t.id===temaId?th.navActiveBg:"transparent",
                      }}>
                        <span style={{width:14,height:14,borderRadius:"50%",background:t.accent,border:`1px solid ${th.border2}`,flexShrink:0}}/>
                        <span style={{fontSize:13,color:t.id===temaId?th.text:th.textSub,fontWeight:t.id===temaId?700:500}}>{t.nome}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{
        display:"flex", gap:18, alignItems:"flex-start",
        width:"100%", maxWidth:MENU_W+18+CONTEUDO_W, margin:"0 auto",
      }}>

        {/* MENU LATERAL */}
        {/* A coluna tem SEMPRE MENU_W e estica na altura (alignSelf stretch),
            que é o que dá ao sticky espaço pra grudar. A barra ocupa RAIL_W
            quando compacta e cresce até MENU_W ao passar o mouse — sempre
            DENTRO da coluna, então nunca cobre o conteúdo nem o desloca. */}
        <div style={{width:MENU_W,flexShrink:0,alignSelf:"stretch"}}>
          <aside
            onMouseLeave={()=>setItemHover(null)}
            style={{
              position:"sticky", top:0,
              width:menuAberto?MENU_W:RAIL_W, borderRadius:24,
              background: dark
                ? "linear-gradient(170deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03) 55%, rgba(255,255,255,0.022))"
                : "linear-gradient(170deg, rgba(255,255,255,0.98), rgba(255,255,255,0.86))",
              boxShadow: dark
                ? "inset 0 1px 0 rgba(255,255,255,0.09), inset 0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px -30px rgba(0,0,0,0.8)"
                : "inset 0 0 0 1px rgba(15,23,42,0.07), 0 18px 38px -30px rgba(15,23,42,0.35)",
              padding:"12px 10px", display:"flex", flexDirection:"column",
              alignItems:"stretch", gap:3,
              transition:"width 0.18s ease",
            }}>
            {navItems.map(item=>{
              const ativo = activeNav===item.label;
              const mostraLabel = sidebarExpandido || itemHover===item.label;
              return (
                <button key={item.label}
                  onClick={()=>setActiveNav(item.label)}
                  onMouseEnter={()=>setItemHover(item.label)}
                  title={menuAberto?undefined:item.label}
                  style={{
                    display:"flex",alignItems:"center",gap:11,justifyContent:"flex-start",
                    width:"100%",height:44,padding:"0 10px",
                    borderRadius:999,border:"none",cursor:"pointer",fontFamily:"inherit",
                    background:ativo
                      ? `${ACCENT_ATUAL}1F`
                      : (itemHover===item.label ? (dark?"rgba(255,255,255,0.06)":"rgba(15,23,42,0.05)") : "transparent"),
                    boxShadow:ativo?`inset 0 0 0 1px ${ACCENT_ATUAL}40`:"none",
                    color:ativo?ACCENT_ATUAL:th.textMuted,
                    fontSize:13.5,fontWeight:ativo?700:500,
                    overflow:"hidden",whiteSpace:"nowrap",
                    transition:"background 0.15s ease, color 0.15s ease",
                  }}>
                  <span style={{flexShrink:0,display:"flex",width:20,justifyContent:"center"}}>{item.icon}</span>
                  <span style={{opacity:mostraLabel?1:0,transition:"opacity 0.14s ease"}}>{item.label}</span>
                </button>
              );
            })}

            <div style={{marginTop:9,paddingTop:9,boxShadow:`inset 0 1px 0 ${supFioApp}`,display:"flex",justifyContent:menuAberto?"flex-start":"center",paddingLeft:menuAberto?10:0}}>
              <div onClick={fixarSidebar} title={sidebarExpandido?"Soltar — abre um item por vez ao passar o mouse":"Fixar aberto"} style={{
                width:32,height:32,borderRadius:999,cursor:"pointer",flexShrink:0,
                background:sidebarExpandido?`${ACCENT_ATUAL}1F`:supApp,
                boxShadow:`inset 0 0 0 1px ${sidebarExpandido?`${ACCENT_ATUAL}40`:supFioApp}`,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                {sidebarExpandido?<Ico.Collapse c={ACCENT_ATUAL}/>:<Ico.Expand c={th.textMuted}/>}
              </div>
            </div>
          </aside>
        </div>

        {renderMain()}
      </div>
    </div>
  );
}
