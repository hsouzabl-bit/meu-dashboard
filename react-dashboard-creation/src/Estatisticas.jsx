import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API_DIARIO = "https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec";
const ACCENT_LIGHT = "#2563EB";
const ACCENT_DARK  = "#38BDF8";

function fmt(val) {
  if (val === undefined || val === null) return "R$ 0,00";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v, t) { return t > 0 ? Math.round((v / t) * 100) : 0; }

function StatCard({ label, value, sub, color, th }) {
  return (
    <div style={{ background: th.cardBg, borderRadius: 12, padding: "16px 20px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow, display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 800, color: color || th.text }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: th.textMuted }}>{sub}</span>}
    </div>
  );
}

function ContaCard({ conta, dados, th }) {
  if (!dados) return null;
  const cor = dados.financTotal >= 0 ? ACCENT : "#f87171";
  return (
    <div style={{ background: th.cardBg, borderRadius: 14, padding: "20px 24px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow, flex: 1 }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: th.text, marginBottom: 16, letterSpacing: 0.5 }}>{conta}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatCard th={th} label="Resultado" value={fmt(dados.financTotal)} color={cor} />
        <StatCard th={th} label="Taxa de acerto" value={`${dados.taxaAcerto}%`} sub={`${dados.gains}G / ${dados.losses}L / ${dados.breakevens}BE`} color={dados.taxaAcerto >= 50 ? ACCENT : "#f87171"} />
        <StatCard th={th} label="RxR Médio" value={`${dados.rxrMedio}x`} color={dados.rxrMedio >= 1 ? ACCENT : "#f87171"} />
        <StatCard th={th} label="Stop Médio" value={fmt(dados.stopMedio)} color={th.text} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatCard th={th} label="Trades" value={dados.trades} />
        <StatCard th={th} label="Média Gain" value={fmt(dados.mediaGain)} color={ACCENT} />
        <StatCard th={th} label="Média Loss" value={fmt(dados.mediaLoss)} color="#f87171" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: th.resumeBg, borderRadius: 10, padding: "12px 16px", border: `1px solid ${th.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", marginBottom: 6 }}>🏆 Melhor Setup</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{dados.melhorSetup?.nome || "—"}</div>
          <div style={{ fontSize: 12, color: th.textMuted }}>{fmt(dados.melhorSetup?.valor)}</div>
        </div>
        <div style={{ background: th.resumeBg, borderRadius: 10, padding: "12px 16px", border: `1px solid ${th.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", marginBottom: 6 }}>⚠️ Pior Setup</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>{dados.piorSetup?.nome || "—"}</div>
          <div style={{ fontSize: 12, color: th.textMuted }}>{fmt(dados.piorSetup?.valor)}</div>
        </div>
      </div>
    </div>
  );
}

function SetupTable({ setups, th }) {
  return (
    <div style={{ background: th.cardBg, borderRadius: 14, padding: "20px 24px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow }}>
      <div style={{ fontWeight: 800, fontSize: 12, color: th.text, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>Performance por Setup</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${th.border}` }}>
              {["Setup", "Trades", "Acerto", "Resultado", "Média G", "Média L", "RxR"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: h === "Setup" ? "left" : "right", fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {setups.map((s, i) => (
              <tr key={s.nome} style={{ borderBottom: `1px solid ${th.border}`, background: i % 2 === 0 ? "transparent" : th.resumeBg + "44" }}>
                <td style={{ padding: "10px 12px", color: th.text, fontWeight: 600 }}>{s.nome}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: th.textSub }}>{s.trades}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: s.taxaAcerto >= 50 ? ACCENT : "#f87171", fontWeight: 700 }}>{s.taxaAcerto}%</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: s.financTotal >= 0 ? ACCENT : "#f87171", fontWeight: 700 }}>{fmt(s.financTotal)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: ACCENT }}>{fmt(s.mediaGain)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: "#f87171" }}>{fmt(s.mediaLoss)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: s.rxrMedio >= 1 ? ACCENT : "#f87171", fontWeight: 700 }}>{s.rxrMedio}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrosCard({ errosMacro, top3Tecnicos, top3Emocionais, th }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ background: th.cardBg, borderRadius: 14, padding: "20px 24px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow, flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: th.text, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>Erros por Categoria</div>
        {errosMacro.map(e => (
          <div key={e.nome} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${th.border}` }}>
            <div>
              <div style={{ fontSize: 13, color: th.text, fontWeight: 600 }}>{e.nome}</div>
              <div style={{ fontSize: 11, color: th.textMuted }}>{e.count} ocorrência{e.count !== 1 ? "s" : ""}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#f87171" }}>{fmt(e.custo)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div style={{ background: th.cardBg, borderRadius: 14, padding: "20px 24px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: th.text, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 }}>Top 3 Erros Técnicos</div>
          {top3Tecnicos.length === 0 && <div style={{ fontSize: 13, color: th.textMuted }}>Nenhum registrado</div>}
          {top3Tecnicos.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${th.border}` }}>
              <div style={{ fontSize: 12, color: th.textSub, flex: 1, paddingRight: 8 }}>{e.nome}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171", flexShrink: 0 }}>{fmt(e.custo)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: th.cardBg, borderRadius: 14, padding: "20px 24px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: th.text, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 }}>Top 3 Erros Emocionais</div>
          {top3Emocionais.length === 0 && <div style={{ fontSize: 13, color: th.textMuted }}>Nenhum registrado</div>}
          {top3Emocionais.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${th.border}` }}>
              <div style={{ fontSize: 12, color: th.textSub, flex: 1, paddingRight: 8 }}>{e.nome}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171", flexShrink: 0 }}>{fmt(e.custo)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GraficoPatrimonio({ graficoION2, graficoMIDE2, th }) {
  const dadosCombinados = {};
  graficoION2.forEach(d => { dadosCombinados[d.data] = { data: d.data, ion2: d.valor }; });
  graficoMIDE2.forEach(d => {
    if (!dadosCombinados[d.data]) dadosCombinados[d.data] = { data: d.data };
    dadosCombinados[d.data].mide2 = d.valor;
  });
  const dados = Object.values(dadosCombinados).sort((a, b) => a.data.localeCompare(b.data));
  return (
    <div style={{ background: th.cardBg, borderRadius: 14, padding: "20px 24px", border: `1px solid ${th.border}`, boxShadow: th.cardShadow }}>
      <div style={{ fontWeight: 800, fontSize: 12, color: th.text, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 20 }}>Patrimônio Acumulado</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={dados} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={th.border} />
          <XAxis dataKey="data" tick={{ fontSize: 11, fill: th.textMuted }} tickFormatter={d => d.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: th.textMuted }} tickFormatter={v => `R$${v}`} />
          <Tooltip contentStyle={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [fmt(v), n === "ion2" ? "ION 2" : "MIDE 2"]} labelFormatter={l => `Data: ${l}`} />
          <ReferenceLine y={0} stroke={th.textMuted} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="ion2" stroke={ACCENT} strokeWidth={2} dot={false} name="ION 2" />
          <Line type="monotone" dataKey="mide2" stroke="#60a5fa" strokeWidth={2} dot={false} name="MIDE 2" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: th.textMuted }}>
          <span style={{ width: 20, height: 3, background: ACCENT, borderRadius: 2, display: "inline-block" }} /> ION 2
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: th.textMuted }}>
          <span style={{ width: 20, height: 3, background: "#60a5fa", borderRadius: 2, display: "inline-block" }} /> MIDE 2
        </span>
      </div>
    </div>
  );
}

export default function Estatisticas({ th, dadosCache, loadingCache, onRecarregar }) {
  const isDark = th?.bg === "#111111" || th?.bg?.startsWith("#1") || th?.bg?.startsWith("#0");
  const ACCENT = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const [dados, setDados]           = useState(dadosCache || null);
  const [loading, setLoading]       = useState(!dadosCache);
  const [erro, setErro]             = useState(null);
  const [inicio, setInicio]         = useState("");
  const [fim, setFim]               = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  useEffect(() => {
    if (dadosCache && !filtroAtivo) {
      setDados(dadosCache);
      setLoading(false);
    }
  }, [dadosCache]);

  useEffect(() => {
    if (loadingCache && !dadosCache && !filtroAtivo) setLoading(true);
    else if (!loadingCache && dadosCache && !filtroAtivo) setLoading(false);
  }, [loadingCache, dadosCache]);

  const carregarFiltrado = (ini, fi) => {
    setLoading(true);
    let url = API_DIARIO;
    const params = [];
    if (ini) params.push(`inicio=${ini}`);
    if (fi)  params.push(`fim=${fi}`);
    if (params.length) url += "?" + params.join("&");
    fetch(url)
      .then(r => r.json())
      .then(j => { if (j.erro) throw new Error(j.erro); setDados(j); setLoading(false); })
      .catch(e => { setErro(e.message); setLoading(false); });
  };

  const aplicarFiltro = () => { setFiltroAtivo(true); carregarFiltrado(inicio, fim); };
  const limparFiltro  = () => { setInicio(""); setFim(""); setFiltroAtivo(false); setDados(dadosCache); };

  return (
    <div style={{ flex: 1, padding: "36px 52px 56px", overflowY: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: th.text, margin: 0 }}>Estatísticas</h1>
          <p style={{ fontSize: 13, color: th.textMuted, margin: "4px 0 0" }}>Performance do seu operacional</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 9, border: `1px solid ${th.border2}`, background: th.surface, color: th.text, fontSize: 13, fontFamily: "inherit" }} />
          <span style={{ color: th.textMuted, fontSize: 13 }}>até</span>
          <input type="date" value={fim} onChange={e => setFim(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 9, border: `1px solid ${th.border2}`, background: th.surface, color: th.text, fontSize: 13, fontFamily: "inherit" }} />
          <button onClick={aplicarFiltro} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: ACCENT, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Filtrar
          </button>
          {(inicio || fim) && (
            <button onClick={limparFiltro} style={{ padding: "7px 12px", borderRadius: 9, border: `1px solid ${th.border2}`, background: th.surface, color: th.textSub, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Limpar
            </button>
          )}
        </div>
      </div>

      {erro && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "13px 18px", marginBottom: 20, color: "#dc2626", fontSize: 13 }}>⚠️ {erro}</div>}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: th.textMuted, fontSize: 14 }}>Carregando dados do diário...</div>
      ) : dados ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <ContaCard conta="ION 2"  dados={dados.contas?.["ION 2"]}  th={th} />
            <ContaCard conta="MIDE 2" dados={dados.contas?.["MIDE 2"]} th={th} />
          </div>
          <GraficoPatrimonio graficoION2={dados.graficoION2 || []} graficoMIDE2={dados.graficoMIDE2 || []} th={th} />
          <SetupTable setups={dados.setups || []} th={th} />
          <ErrosCard errosMacro={dados.errosMacro || []} top3Tecnicos={dados.top3Tecnicos || []} top3Emocionais={dados.top3Emocionais || []} th={th} />
        </div>
      ) : null}
    </div>
  );
}
