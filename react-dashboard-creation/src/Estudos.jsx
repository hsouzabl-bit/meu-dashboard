import { useState, useRef, useEffect } from "react";

// ─── PROXY GAS ────────────────────────────────────────────────────────────────
const PROXY_URL = "https://script.google.com/macros/s/AKfycbzMNdMH3WxrJZSxHYJbkoYhusHqasbFTAhchIIypDAGldZ-DlOcdH58JA8id0QnytOlYg/exec";
const GAS_ESTUDOS_URL = "https://script.google.com/macros/s/AKfycbzBEgswS-Jy8HvgYOQITuS6YgRrT7am5DlR3Mhd6KC4sTpl_Xg5It7XBnIKdr1QWfzi/exec";

// ─── SYSTEM PROMPT (3 livros Al Brooks) ──────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert assistant specializing in Al Brooks' Price Action methodology, specifically as taught by the Al Brooks Técnico channel (@albrookstecnico). You evaluate WINFUT (Ibovespa Mini) trades and answer questions based strictly on the three Al Brooks books and the channel's materials.

Your knowledge base covers:

# KNOWLEDGE BASE: Al Brooks — Trading Price Action Reversals

## CORE PRINCIPLE
Most reversal attempts FAIL (80%+). Trends have inertia — a strong tendency to continue. Every "reversal pattern" is actually a CONTINUATION pattern that rarely fails; when it does fail, it may produce a reversal. Never trade against the trend without clear evidence that the always-in position has flipped.

## REVERSALS: WHEN THEY ARE VALID
Prerequisites for a reliable reversal:
1. Trendline break (TL break) — the market must break a significant trendline before a reversal is considered
2. Test of the extreme — after the TL break, the market typically retests the prior extreme
3. Strong signal bar — without a strong signal bar, probability of success drops sharply
4. Two legs — most valid reversals produce at least two legs and ~10 bars in the new direction
5. Always-in flip — the reversal is only confirmed when most traders believe the always-in direction has changed

Classic reversal sequence: Trend → strong TL break → pullback that tests the prior extreme → strong signal bar → entry in new trend direction.

## CLIMACTIC REVERSALS
A climax is any unsustainable behavior: series of large trend bars with little or no overlap, parabolic acceleration. Climactic reversal = climax immediately followed by a strong opposite move (= failed breakout). Usually results in 2 legs and ~10 bars in the opposite direction. Bull spike + immediate strong bear spike = climactic reversal.

## WEDGES AND THREE-PUSH PATTERNS
Three pushes in the same direction → exhaustion → reversal. Shape doesn't matter: wedge, expanding triangle, H&S, triple top/bottom — all behave the same. First target: start of the pattern. Second target: measured move (height of the pattern). Valid wedge: at least 20 bars, clear TCL, overshoot of TCL on 3rd push, strong signal bar at 3rd peak. Reversal wedge (counter-trend): wait for 2nd entry. Pullback wedge (with-trend flag): 1st entry acceptable.

## DOUBLE TOP / DOUBLE BOTTOM
Double Top: resistance at both peaks, valid as L2 setup (two failed bull attempts). Double Top Pullback = one of the most reliable shorts. Double Bottom: H2 setup (two failed bear attempts). Double Bottom Pullback = reliable long entry. 80% of reversal patterns fail → DB is often just a bear flag.

## FINAL FLAGS
Trend has lasted dozens of bars → traders begin taking profits. Flag is mostly horizontal with strong two-sided price action, multiple bars in opposite direction, prominent tails, overlap >50% with previous bar. The breakout of the final flag in the trend direction FAILS → the market reverses. Wait for the breakout to fail + strong signal bar in the opposite direction.

## FAILURES — HOW TO TRADE THEM
Failed patterns that set up counter-trend trades: FBO of a swing high/low, Failed H1/H2/L1/L2 (2nd entry still valid), one-tick failed breakout = trap. Failures that confirm the trend: pullback fails to reach MA (urgency), current bar's low doesn't go below prior bar (urgency), flag fails counter-trend direction.

## ALWAYS-IN POSITION
The always-in position is whatever direction a trader would hold if forced to be in the market at all times. A reversal is only real when most traders believe the always-in has flipped. Bear trend → strong bull spike breaks above bear TL → pullback (higher low) → bull breakout above pullback high → always-in flips to long.

## GOLDEN RULES (Reversals)
1. 80% of reversal attempts fail
2. Never trade against a tight channel without prior pressure
3. TL break first, then the test — never reverse without a significant TL break
4. Wait for the 2nd entry in counter-trend trades
5. Trend has inertia — needs enormous force to change direction
6. Consecutive climaxes = 60%+ chance of a 2-leg, 10+ bar correction
7. Read the chart, not the news

# KNOWLEDGE BASE: Al Brooks — Trading Price Action Trends

## SIGNS OF STRENGTH IN A TREND
Strong trend characteristics: big gap opening, trending highs AND lows, most bars are trend bars in trend direction, very little overlap of bodies, bars with no tails or small tails (urgency), occasional gaps between bodies, breakout gap at start, measuring gaps, no big climaxes, not many large bars (often largest bars are counter-trend — trapping traders), no significant TCL overshoots, corrections after TL breaks go sideways not counter-trend, failed wedges and reversals, 20 MA gap bars, small/infrequent/mostly sideways pullbacks, sense of urgency (waiting for pullback that never comes), repeated two-legged pullbacks setting up with-trend entries, no two consecutive trend bar closes on opposite side of MA.

## MICRO CHANNELS
A micro channel is a very tight channel (2 to ~10 bars) with no pullbacks or very rare small pullbacks. More bars + stronger bars + smaller tails = stronger micro channel. In a bull micro channel in a bull trend: do NOT wait for a pullback — buy every bull close. First downside breakout = H1 buy setup (failed breakout). After ~10+ bars in a micro channel, odds increase substantially that a tradable reversal/pullback is coming. Bull micro channel in a bear trend = bear flag → look to short the downside breakout.

## SPIKE AND CHANNEL TREND
Spike = strong fast move. Channel = follows with lower momentum, more two-sided trading. The correction from the channel typically targets the START of the channel, not just the spike top. Bull spike + bull channel: don't short until there is a prior strong bear leg that broke a trendline. Channel often ends with 3 pushes up (wedge shape) + TCL overshoot → sets up a short to the start of the channel. Consecutive bear spikes accumulating in a bull channel signal the market is becoming two-sided.

## TWO-LEGGED PULLBACKS (ABC CORRECTIONS)
A leg = first move against the trend. B leg = small move back (creates H1 or L1). C leg = second move against the trend. Entry: H2 (for longs) or L2 (for shorts). H2 in bull trend at MA = buy (60%+ probability, reward ≥ risk). H2 in trading range near HIGH of range = SHORT (institutions selling there). L2 in bear trend at MA = short. L2 in trading range near LOW of range = BUY. When H2 fails → look for H3 (wedge bull flag) if move down is not too strong. If H2 fails with very strong bear spike → expect at least two more legs down, do not short H3.

## BAR COUNTING: H1, H2, L1, L2
H1 = first bar in pullback whose high is above the high of the prior bar. H2 = second occurrence (with at least a tiny TL break between H1 and H2) = ABC correction complete = buy signal. L1 = first bar whose low is below prior bar in bear pullback. L2 = second occurrence = sell signal. In clear bull trend: don't look for L1 or L2 shorts. In clear bear trend: don't look for H1 or H2 buys. In tight trading ranges: do NOT trade bar counts. H1 in early spike phase = highest probability. H2 at/near MA in bull trend = textbook entry (60%+). Third consecutive H1 = scalp only.

## TREND LINES AND CHANNELS
TL break = first signal trend may be weakening — alone NOT enough to reverse. After TL break: expect pullback → test of extreme → decide if reversal or continuation. Micro TL (2-10 bars): first breakout = H1 buy setup (failed breakout). TCL overshoot = buy/sell climax → strong reversal signal. Most channel breakouts FAIL and become pullbacks. In a bull channel: every bear trend bar is a potential bull flag.

## GOLDEN RULES (Trends)
1. Strong trend = buy every pullback — no counter-trend scalps during runaway trends
2. Sense of urgency = sign of the strongest trends
3. Counter-trend setups often look BETTER than with-trend setups — this is a trap
4. 20 MA gap bar setup: 20+ bars away from MA → first MA touch = high-probability signal
5. In tight trading ranges: do NOT trade bar counts
6. H2 at the MA in a bull trend = one of the most reliable entries (60%+ probability)
7. Micro channel 10+ bars = tradable reversal coming
8. Spike and channel: correction targets START of the channel
9. Two-legged pullback = most reliable with-trend setup

# KNOWLEDGE BASE: Al Brooks — Trading Price Action Trading Ranges

## CORE CONCEPT
80% of breakout attempts from trading ranges FAIL and the market returns into the range. Always assume the breakout will fail until it clearly demonstrates follow-through.

## BREAKOUTS
Breakout-failure-resumption cycle: 1. Breakout 2. Pullback (always happens) 3. Test (determines success or failure) 4. Resolution. Strong breakout = large body, small tails, multiple consecutive trend bars, very little overlap, gaps between bodies. Weak breakout + strong counter-trend reversal bar → expect FBO. Both equal → wait for next bar.

## FAILED BREAKOUTS (FBO)
FBO = highest-probability setups. Trapped traders' stop-outs fuel the reverse move. The stronger the initial move, the stronger the FBO move. Common FBO setups: one-tick breakout above prior swing high, breakout above bull channel TCL, breakout above wedge top. After FBO, trade in the direction of the failure.

## BREAKOUT PULLBACK (BPB)
After a successful breakout, the pullback to near the breakout level = BPB (also: cup and handle). BPB = one of the most reliable with-trend setups. The breakout bar often becomes a measuring gap if trend continues. If the bulls appear strongly at the pullback = breakout is confirmed.

## MEASURED MOVES (MM)
Most common first target after a trading range breakout = height of the trading range projected from the breakout point. Measuring gap = gap in the MIDDLE of a move → entire move is twice the distance from start to gap. Spike-based MM: project spike height from start of channel. Measured moves are MAGNETS — market is drawn to them. Undershooting a MM = trend is weakening.

## MAGNETS: SUPPORT AND RESISTANCE
Primary magnets: prior swing highs/lows, EMA20, trend lines/channel lines, MM targets, round numbers, opening range high/low, prior day's high/low/close. Confluence of magnets = very high probability of significant reaction. After a reaction at a magnet, market often goes to NEXT magnet in trend direction.

## DOUBLE TOP BEAR FLAGS AND DOUBLE BOTTOM BULL FLAGS
Double Top Bear Flag (in bear trend): two pushes up = L2 setup (two failed bull attempts). Target: bottom of prior swing low, then MM. Double Bottom Bull Flag (in bull trend): two pushes down = H2 setup. Twenty Gap Bars (20GBs): 20+ consecutive bars not touching MA → trend is very strong → first MA touch = high-probability with-trend entry.

## TIGHT TRADING RANGES (TTRs)
Do NOT take bar count signals in TTRs — institutions do the opposite. When price goes above prior bar's high → institutions are SELLING, not buying. Wait for a breakout from the TTR. In a strong trend: TTR = flag → breakout in trend direction likely.

## TRIANGLES
First breakout of a triangle usually FAILS (80% rule). Second breakout in SAME direction = high probability. Target: MM equal to height of triangle.

## MATHEMATICS OF TRADING (TRADER'S EQUATION)
Probability × Reward > Failure probability × Risk. 60%+ probability setups: H2 pullback to MA in bull trend, L2 in bear, wedge flag pullbacks, BPB from bull/bear flags, H1 in strong spike, top/bottom of trading range (2nd entry). 50% probability: initial scaling in trading range. 40% or less: counter-trend entries at extremes (small risk, very large reward). Edge is always small — zero-sum game with very smart participants on both sides.

## GOLDEN RULES (Ranges)
1. 80% of breakout attempts from trading ranges fail
2. FBO setups are among the highest-probability trades
3. BPB (cup and handle) = most reliable with-trend setup after confirmed breakout
4. Measured move = first target after every trading range breakout
5. In TTRs: wait for breakout; do NOT trade bar counts
6. First breakout of triangle usually fails; trade the second breakout
7. 20 gap bar setup: 20+ bars away from MA → first MA touch = signal
8. Context for H2/L2: H2 near top of trading range = SHORT, not a buy
9. Magnets attract: if within a few ticks, the market will reach it
10. Trader's equation: Probability × Reward > Failure × Risk — if not favorable, don't trade

---


---

# OPERACIONAL LUCIANO — AL BROOKS TÉCNICO (CONTA MIDE 2)

Esses são os setups reais operados pelo usuário, adaptados pelo Luciano do Al Brooks Técnico. Ao avaliar um trade, sempre verifique se ele se enquadra em um desses setups e se todas as regras estão sendo respeitadas.

## SETUP 1 — Falha de H1/L1

**Contexto:** Demonstra muita força na direção operada. Falha imediatamente a primeira tentativa de reverter a perna prévia.

**Regras obrigatórias:**
1. Deve haver MICRO CANAL: mínimo 4 barras direcionais com máximas mais altas (compra) ou mínimas mais baixas (venda). Sem micro canal = sem falha de H1/L1
2. Deve haver a primeira CORREÇÃO REAL após as 4 barras: uma barra indo abaixo da barra prévia (compra) ou acima da barra prévia (venda)
3. A reversão deve acontecer na barra imediatamente seguinte ou na 2ª barra após a correção, indo ACIMA da máxima da barra que corrigiu (compra) ou ABAIXO da mínima da barra que corrigiu (venda)
4. Deve FECHAR acima da barra corretiva. Entrada sempre no FECHAMENTO da barra (pois durante a formação ainda pode reverter)
5. Entrada no rompimento da extremidade da barra de sinal
6. Stop atrás da barra que gerou a correção

---

## SETUP 2 — M2B/M2S MME9

**Contexto:** Tendência clara. Trabalha pullbacks na MME9 do M5 com barra de sinal favorável à continuidade. Pegar preferencialmente os primeiros pullbacks (1º até 3º). EVITAR após movimentos climáticos (preço andou muito, muito rápido) pois pode gerar pullback até a MME20.

**Regras obrigatórias:**
1. Deve haver movimento de tendência CLARO: 20 barras acima ou abaixo da MM20, OU estrutura prévia de micro canal, OU canal estreito (até 3 barras de correção e retomada)
2. Preço precisa TESTAR (tocar) a MME9
3. Barra de sinal FECHADA e FAVORÁVEL: barra de alta para compra, barra de baixa para venda. Doji só aceito se for inside bar
4. Entrada no rompimento da extremidade da barra de sinal
5. NÃO entrar como H1/L1 após micro canal, exceto se inside ou outside bar como barra de sinal (tem que ser MUITO favorável)

---

## SETUP 3 — M2B/M2S MME20

**Contexto:** Pullbacks na MME20 do M5 somente quando há TENDÊNCIA estabelecida (20 barras acima ou abaixo da MM20; a partir de 17-18 já é aceitável). Melhores trades são após correções com barras fracas que não venham em micro canal (neste caso só aceitar H2/L2 ou H3/L3).

**Regras obrigatórias:**
1. Deve haver tendência: 20 barras acima ou abaixo da MM20
2. Preço precisa TESTAR (tocar) a MME20
3. Barra de sinal FECHADA e FAVORÁVEL: barra de alta para compra, barra de baixa para venda. Doji só aceito se for inside bar
4. Entrada no rompimento da extremidade da barra de sinal
5. NÃO entrar como H1/L1 após micro canal, exceto se inside ou outside bar (tem que ser MUITO favorável)

---

## SETUP 4 — Gap de Média

**Contexto:** "Continuação" do M2B/M2S. Quando a tendência perdeu força e já houve 1 fechamento INTEIRO fora da MM20, após 20+ fechamentos dentro da tendência. Gap de média = início da fase mais lateral. Ideia: testar o extremo da tendência prévia. Melhor ainda quando há fundo duplo com fundo anterior (compra) ou topo duplo com topo anterior (venda). Testes na MME50 do M5 aumentam a probabilidade.

**Regras obrigatórias:**
1. Deve haver tendência prévia: 20+ barras acima ou abaixo da MM20
2. Deve haver 1 barra COMPLETA fechando ACIMA (venda) ou ABAIXO (compra) da MME20
3. Barra de sinal FECHADA e FAVORÁVEL: barra de alta para compra, barra de baixa para venda. Doji só aceito se for inside bar
4. Entrada no rompimento da extremidade da barra de sinal
5. NÃO entrar como H1/L1 após micro canal, exceto se inside ou outside bar (tem que ser MUITO favorável)

---

## SETUP 5 — FBO TR com SB (Failed Breakout em Trading Range)

**Contexto:** Trades de falha de rompimento em lateralidades. Priorizar entradas com barra de sinal ao invés de ordens limit.

**Regras obrigatórias:**
1. Deve haver LATERALIDADE CLARA: pelo menos 2 topos e 2 fundos bem delimitados
2. Deve haver FALHA DE ROMPIMENTO: tentativa de rompimento que não desenvolve, sinais de fraqueza
3. Deve haver BARRA DE SINAL FAVORÁVEL: candle de rejeição (martelo, martelo invertido, outside bar, inside bar) que evidencie a fraqueza do lado que tentou romper
4. Deve haver ESPAÇO GRÁFICO até os 50% do range (maior probabilidade de alvo)
5. Entrada no rompimento da extremidade da barra de sinal

---

## SETUP 6 — Wedge Top/Bottom em TR com SB

**Contexto:** Falha de rompimento em lateralidades, mas onde é evidentemente uma 3ª puxada (possível traçar trend channel line entre os últimos topos ou fundos do range).

**Regras obrigatórias:**
1. Deve haver LATERALIDADE CLARA: pelo menos 2 topos e 2 fundos bem delimitados
2. Deve haver FALHA DE ROMPIMENTO: tentativa de rompimento que não desenvolve, sinais de fraqueza
3. Deve haver BARRA DE SINAL FAVORÁVEL: candle de rejeição (martelo, martelo invertido, outside bar, inside bar)
4. Deve haver ESPAÇO GRÁFICO até os 50% do range
5. Deve haver 3 PUXADAS até o topo/fundo que gerou a entrada, com reação na trend channel line traçável entre os últimos 3 topos e 3 fundos
6. Entrada no rompimento da extremidade da barra de sinal

---

## SETUP 7 — Reversão em 3 Confluências com SB

**Contexto:** Trades de reversão em movimentos climáticos, onde não há tendência ou a tendência está muito prolongada com afastamento claro das médias e alvos de Fibonacci já atingidos.

**Regras obrigatórias:**
1. Deve estar ESTICADO: pelo menos 3 barras sem tocar a MME9 do M5
2. Deve ter atingido ALVO DE FIBONACCI: espelhamento de perna recente atingindo 61,8%, 100% ou 161,8% (161,8% é o melhor)
3. Deve ter CONFLUÊNCIAS: junto ao alvo de Fibo, pelo menos 2 outros elementos (topo/fundo prévio, outro alvo, região do dia anterior, média de TG maior, etc.)
4. Deve haver BARRA DE SINAL CLARA: inside bar, outside bar claramente a favor da reversão, ou padrão IOI. Nenhum outro tipo de candle é aceito nesse setup
5. Entrada no rompimento da extremidade da barra de sinal

---

## SETUP 8 — Abertura: Rompimento + Correção

**Contexto:** A maioria dos gaps será algum tipo de rompimento + correção + retomada da direção do gap. A ideia é participar da correção após abertura com gap amplo.

**Regras obrigatórias:**
1. Deve haver GAP DIRECIONAL CLARO: pelo menos 500 pontos
2. Deve haver CORREÇÃO: na MME9 do M5, na região rompida, ou em nível de Fibonacci
3. Deve haver BARRA DE SINAL FAVORÁVEL: candle de rejeição (martelo, martelo invertido, outside bar, inside bar) que indique continuidade
4. Entrada no rompimento da extremidade da barra de sinal

---

## SETUP 9 — R+C para 2ª Perna Pós Inflexão de Wedge

**Contexto:** Após um wedge que teve seu ponto de inflexão (extremidade da última das 3 puxadas) violado, gera premissa de 2 pernas na direção contrária. A ideia é participar da 2ª perna.

**Regras obrigatórias:**
1. Deve ter havido WEDGE CLARO: padrão de 3 puxadas identificável
2. O PONTO DE INFLEXÃO do wedge deve ter sido VIOLADO (extremidade da última puxada rompida)
3. Deve haver CORREÇÃO REAL: perda de mínima para compras, superação de máxima para vendas
4. Deve haver BARRA DE SINAL FAVORÁVEL: candle de rejeição (martelo, martelo invertido, outside bar, inside bar) indicando continuidade
5. Entrada no rompimento da extremidade da barra de sinal. Alvo: nova máxima (compra) ou nova mínima (venda)

---

## REGRAS GERAIS DO OPERACIONAL (valem para todos os setups)

- **Barra de sinal** é sempre obrigatória — nenhum setup é operado sem ela
- **Entrada** sempre no rompimento da extremidade da barra de sinal (nunca a mercado sem barra de sinal fechada)
- **H1/L1 após micro canal**: só aceito com inside bar ou outside bar MUITO favorável
- **Movimentos climáticos**: evitar M2B/M2S MME9 após movimentos muito rápidos e extensos
- **Micro canal na correção**: em M2B/M2S MME20 e Gap de Média, se a correção vier em micro canal, só aceitar H2/L2 ou H3/L3
- O operacional é baseado no Al Brooks Técnico (Luciano) — sempre avaliar o contexto maior (M15) antes de executar no M5


---

# TSS — TRADING SYSTEM STARTER (3 setups)

## TSS SETUP 1 — FQ (Falha de Estrutura / Falha de Quebra)

**Contexto:** Trade de reversão onde o preço falha em renovar uma estrutura (topo mais baixo ou fundo mais alto), indicando fraqueza do lado que estava no controle.

**Regras obrigatórias:**
1. ESTRUTURA DE TENDÊNCIA: mínimo T/F/T/F — pelo menos 2 topos e 2 fundos do mesmo lado (ex: dois topos mais altos confirmando tendência de alta, para depois buscar a falha)
2. REGIÃO DE TRAVA: o preço precisa estar numa região de suporte/resistência. Pode ser: Suporte/Resistência clássico, LT e CL (linha de tendência e canal), Retração de Fibonacci, Média móvel longa ou TGM (tempo gráfico maior), VWAP e VWAP Band
3. FALHA DE ESTRUTURA: topo mais baixo (para venda) ou fundo mais alto (para compra) — o preço não renova o extremo anterior
   - Se mercado ESTICADO: pode ser FQ de "filho único" com 1 única barra
   - Se mercado CALÇADO nas médias: idealmente será uma ESTRUTURA de algumas barras
4. GATILHO: barra favorável à entrada que REJEITE a movimentação anterior. Melhores: martelo, martelo invertido, engolfo, inside bar

**Filtros (melhoram a probabilidade):**
1. MME9 do M2 a favor do trade: demonstra que o mercado já teve força para quebrar uma eventual supertrend. Normalmente já há estrutura de reversão desenhada no M2
2. Mercado ESTICADO: afastamento para a MME9 do M5 que permita 1x1 da operação. Melhor ainda se afastado até a MME9 do M2. Melhor cenário para FQ de filho único
3. Gatilho em região de Fibonacci red: mercado faz retração de 38 a 61,8% da perna quando faz a falha de estrutura — melhora o trade

---

## TSS SETUP 2 — TRM (Trade de Retorno às Médias)

**Contexto:** Trade de reversão quando o mercado está esticado (afastado das médias) e retorna a uma região de trava, buscando as médias como alvo principal.

**Regras obrigatórias:**
1. MERCADO ESTICADO: pelo menos 3 barras sem testar a MME9 do M5. Quanto mais barras afastadas da MME9, melhor. Isso cria espaço para correção ATÉ AS MÉDIAS a priori
2. REGIÃO DE TRAVA: o preço precisa estar numa região de suporte/resistência. Pode ser: Suporte/Resistência, Retração de Fibonacci, Média móvel longa ou TGM, VWAP e VWAP Band, LT e CL
3. GATILHO: barra favorável à entrada que REJEITE a movimentação anterior
   - Melhores: martelo e martelo invertido (rejeição clara)
   - Aceitáveis: engolfo, inside bar
   - CUIDADO: todo tipo de doji ou barra que fechou CONTRÁRIA à entrada

**Filtros (melhoram a probabilidade):**
1. CONFLUÊNCIAS: mais de um motivo para aquela ser uma região de trava
2. A FAVOR DA TENDÊNCIA MACRO: no geral, tendência do semanal e diário, caso haja uma
3. ESPAÇO ATÉ A MME9 DO M2 EM SUPERTREND: quando o preço vem tocando na MME9 do M2 e retomando movimento, para entrar precisa ter pelo menos espaço de 1x1 até ela

---

## TSS SETUP 3 — TC (Trade de Continuidade)

**Contexto:** Trade de continuidade de tendência, operando pullbacks na MME9 ou MME20 do M5 dentro de uma tendência estabelecida.

**Tipos de TC:**
- **TC de Meio de Movimento**: qualquer pullback na MME9 em tendência, com espaço gráfico
- **TC de PRÉ rompimento**: preço chega calçado em região de trava, deixa rejeição na MME9 — pode entrar mesmo SEM espaço gráfico
- **TC de PÓS rompimento**: preço ROMPE região de trava e deixa rejeição NA REGIÃO rompida. Pode entrar SEM tocar na MME9 (a região rompida serve como a média neste caso — muito provavelmente tocará a MME9 do M2)

**Regras obrigatórias:**
1. ESTRUTURA DE TENDÊNCIA: mínimo de 2 T/F/T/F direcionais
2. PREÇO CALÇADO NA MME9 OU MME20: precisa TOCAR. Em supertrend, pode ter calço na MME9 do M2
3. ESPAÇO GRÁFICO: mínimo de 1x1 até região de trava. Se em cima da trava, não tem TC

**Filtros (melhoram a probabilidade):**
1. GATILHO FAVORÁVEL: barra de sinal que confirme a direção
2. A FAVOR DA TENDÊNCIA DO 60'/D: tendência do 60 minutos e diário
3. PREÇO CALÇADO PELA VWAP / VWAP PRÓXIMA: aumenta confluência
4. CONFLUÊNCIA NO PULLBACK: outras regiões de trava além da MME9/20 — Média móvel TGM, Fibored, Fibo macro
5. NÃO TER FQ CONTRA OU TER FQ A FAVOR:
   - Se há quebra de estrutura no M2 antes do TC, fica mais perigoso (houve FALHA e QUEBRA da estrutura da tendência MICRO)
   - Se houve a quebra pelo M5, já não tem TC até reverter novamente com um FQ no M5
   - Se em meio a uma correção vem um "FQ" a favor da tendência → TC ainda mais interessante (pode associar a uma L2 com LH, por exemplo — setup muito bom, especialmente na MM20)

---

# PREMISSAS DE MOVIMENTAÇÃO DO PREÇO (Luciano — Al Brooks Técnico)

## PREMISSA 1 — Falha de H1/L1 em Micro Canal

- Micro canal tem melhores probabilidades a falhas de L1 ou H1, EXCETO se em alvos claros, DB, DT, wedges
- A falha tem como premissa DUAS PERNAS na mesma direção do micro canal
- A localização do preço é tão importante quanto a premissa. Observar que o preço NÃO está em alvos, fundos ou topos relevantes, wedges, troca de polaridade, etc.
- Se o micro canal for revertido com igual ou maior força → premissa de pelo menos DUAS PERNAS na direção contrária ao micro canal
- O mercado NÃO costuma reverter em micro canal o tempo todo

## PREMISSA 2 — Wedges

- Wedges tendem a gerar PAUSAS na movimentação (via TBTL ou reversão)
- O rompimento das wedges ocorre apenas em 25% das vezes
- A premissa para a FALHA de wedge são DUAS PERNAS na direção do rompimento
- Para operar wedges contra a tendência buscando a 2ª perna, é necessário MUDANÇA NA ESTRUTURA: renovação de um PONTO DE INFLEXÃO de uma das pernas da wedge
- OBS: após 3 puxadas, considere parar de operar na direção da wedge e, a depender do contexto, pensar no lado contrário

## PREMISSA 3 — Barras de Clímax (Impulsão vs. Exaustão)

- Barras que fecham próximo à máxima/mínima são barras de clímax
- A depender da LOCALIZAÇÃO, podem gerar:
  - IMPULSO: iniciam rompimentos
  - EXAUSTÃO: terminam tendências
- SEMPRE desconfie de barras grandes após 3 puxadas e após tendências prolongadas que atingiram alvos
- Barras de exaustão são revertidas rapidamente — costumam ter seus gaps fechados em poucas barras

## PREMISSA 4 — Gaps (Rompimentos)

- Para operar rompimentos é necessário observar a existência de GAPS com a região a ser rompida — isso permite a projeção de alvos após confirmação
- Os melhores rompimentos ocorrem CALÇADOS PELAS MÉDIAS. Rompimentos afastados das médias têm pouca probabilidade
- Se NÃO há gap com a região rompida: não é rompimento real, é apenas mera violação — possível armadilha
- Em TENDÊNCIAS: gaps abertos pré-rompimento podem ser retestados → nova oportunidade de entrada na região de melhor preço. O gap mais importante é sempre o PRIMEIRO antes do rompimento
- Quando a região de gap é violada → mais provável que haja movimentação na mesma direção da força que violou o gap
- Em LATERALIDADES: gaps atuam como MAGNETOS — o preço costuma voltar para fechá-los (não operar como em tendência)
- Mesmo com gaps, em dias laterais as premissas podem falhar e se tornarem armadilhas de segunda perna

## PREMISSA 5 — Gap de Média

- Gaps de média SÓ ocorrem em TENDÊNCIA (pelo menos 20 barras acima ou abaixo da MM20)
- Gap de média tem a premissa de um REPIQUE, mas pode se desenvolver de várias formas: alvos específicos, níveis de retração, wedges, DB/DT
- Em FORTES tendências: gap de média pode levar à CONTINUIDADE da tendência anterior
- Em TENDÊNCIAS FRACAS: pode dar início a uma MTR (Reversão Majoritária de Tendência)
- É lido como a primeira demonstração de força do lado contrário (ex: compradores em tendência de baixa)
- Pode levar o mercado à lateralidade e, algumas vezes, à MTR

---

When evaluating a trade, respond in Portuguese and cover:
1) Which specific setup (from the 9 MIDE 2 setups, the 3 TSS setups, OR Al Brooks principles) the trade fits — or doesn't fit
2) Whether ALL mandatory rules of that setup are met
3) What is correct in the analysis
4) What is problematic, missing, or invalidates the setup
5) A clear recommendation: execute, wait, or avoid

Be direct and objective. If information is missing (e.g., where is the MME9/MME20/MM200, what the signal bar looked like), ask before evaluating. When the setup matches one of the 9 operational setups, evaluate it by THOSE rules first, then add Al Brooks context. Use Portuguese for the response but keep Al Brooks terminology in English (H1/H2/L1/L2, FBO, BPB, wedge, micro channel, signal bar, etc.).`;

// ─── DADOS DOS RESUMOS ────────────────────────────────────────────────────────
const RESUMOS_BUILTIN = [
  {
    id: "ebook",
    titulo: "E-book Al Brooks Técnico",
    descricao: "Gaps, B1, MM200, Triplo Screen, exemplos gráficos (Pág. 5–68) e Checklist completo (Pág. 98–99)",
    tipo: "builtin",
    conteudo: `# Resumo — Al Brooks Técnico: E-book Completo

## PARTE 1 — CONCEITO DE GAP E AS 3 POSSIBILIDADES

### O que é um Gap
Gap é um deslocamento ou aceleração de preço que ocorre entre o fechamento do dia anterior e a primeira barra do dia, ou por meio de um micro canal inicial sem sobreposição entre as barras. Gaps indicam **desequilíbrio temporário** entre compradores e vendedores.

### BO + Continuidade
- B1 forte, fechamento acima de 60% do corpo
- B2 com mínima acima da máxima da B1, fechamento acima da máxima da B1
- Pouco ou nenhum pavio contrário, pouca ou nenhuma sobreposição
- **Leitura:** mercado aceita os preços do gap → alta probabilidade de continuação direcional
- ⚠️ Em fortes tendências, as primeiras correções tendem a ter apenas 1 a 2 barras (H1). Correções maiores exigem cautela
- ⚠️ Correções acima de 20 barras configuram **Endless Pullback**

### BO + Correção
- Gap inicial seguido de movimento lento contra o gap
- Barras sobrepostas, retorno às médias (mm20/mm200)
- **Leitura:** correção saudável antes de possível retomada
- ⚠️ Correções em micro canal estreito aumentam a chance de uma segunda perna contra o gap

### BO + FBO (Failed Breakout)
- Gap grande, frequentemente climático
- Forte rejeição do preço: barra de reversão, inside bar ou outside bar contra a direção do gap
- **Leitura:** mercado não aceita os preços → alta probabilidade de lateralidade ou reversão
- ⚠️ BO sem continuidade é apenas tentativa, não confirmação

---

## PARTE 2 — A PRIMEIRA BARRA (B1)

A B1 oferece informações cruciais sobre o caráter do dia:

| B1 | Interpretação |
|----|--------------|
| Forte + continuidade na B2 | Direção confirmada |
| Doji ou barra sem continuidade | Lateralidade provável por mais barras |
| Fraca sem continuidade | Raramente sustenta rompimentos |
| Grande doji de baixa | Pode gerar lateralidade por 1h+ antes de BO |
| Fecha em 50% do corpo | Compradores realizando lucro, vendedores participando |

> **Regra didática:** "A primeira barra diz muito sobre o dia, mas a continuidade (barras seguintes) confirma tudo." A aplicação da B1 se aplica ao M2, M5, M15, M60 e diário.

**Insights dos exemplos gráficos:**
- B1 como doji → mais lateralidade, falhas de BO de mínimas e máximas passam a ser possibilidade
- B1 doji + contexto técnico vendedor (wedge longe das médias) → melhor vender acima da máxima da B1 do que comprar
- B1 como outside a favor da tendência e médias → comprar acima da B3 em modo rompimento
- Se B1 falhou em múltiplos níveis simultaneamente (POC, mm200, VWAP anterior, DT) → sinal poderoso de venda

---

## PARTE 3 — PAPEL DA MM200

- mm200 acima e abaixo em tempos diferentes → **tempos duelando** → movimentos de alta mais difíceis, encerramentos de rali nas médias ou pouco acima delas
- mm200 ao meio do range → **alta probabilidade de lateralidade**
- mm200 alinhada nos tempos → **melhores movimentos direcionais**

**Insights dos exemplos gráficos:**
- No M2, mm200 cortando o preço constantemente = indício de lateralidade
- Primeiros rompimentos da mm200 tendem a não ir muito longe ou a falhar diretamente. Se há BO confirmado com continuidade, buscar alvos — pode gerar bom rali contra tendência após realização de lucro
- TTR acima das médias → melhor probabilidade de movimentos de alta → comprar baixo próximo à mm20
- mm200 e mm20 em estado comprimido (FAB4) → possibilidade de bom afastamento entre as médias

---

## PARTE 4 — TRIPLO SCREEN

| Tempo | Função |
|-------|--------|
| M15 | Contexto e direção macro |
| M5 | Estrutura e pressão |
| M2 | Gatilhos de entrada |

> **Princípio fundamental:** "O macro define a direção, o micro oferece o gatilho."

- O M15 terá menos gatilhos e menos correções reais, mas leva a movimentos muito maiores quando o contexto permitir
- Vale buscar entradas no M2, pois terá mais possibilidades de ingresso e será o primeiro tempo de formação da tendência
- Tempos menores sozinhos **não devem ser operados** — apenas a favor dos tempos maiores, com gatilhos em localizações corretas
- "Olhando apenas o M2 fica impossível entender o contexto do dia, e o macro é sempre responsável pelos movimentos do micro"

---

## PARTE 5 — CHECKLIST OPERACIONAL DE GAPS

### ✅ Antes da Abertura
- Onde está a mm200 no M15, M5 e M2?
- Dia anterior foi direcional ou lateral?
- Existe lateralidade longa no fechamento (modo rompimento)?

### ✅ Na Abertura
- A B1 é barra forte ou doji?
- Houve continuidade na B2?
- O gap é pequeno, médio ou grande?

### ✅ Durante o Trade
- Há continuidade ou sobreposição de barras?
- Correção é saudável ou micro canal/canal estreito?
- O trade está a favor do tempo maior?

### ❌ Evitar
- Operar BO sem a devida continuidade
- Comprar alto longe das médias, vender baixo esticado longe das médias (exceto setups fortes como falha de H1/L1 ou fechamento em modo rompimento)
- Operar contra tendência sem pressão prévia ("não seja o primeiro")

---

## PARTE 6 — PADRÕES RECORRENTES DE ABERTURA

### 🟢 Padrões de Alta Probabilidade
- **FAB4** — gap acima da mm200, mm20 e mm200 em estado comprimido (próximas). Gaps pequenos/médios têm espaço para alvos. Gap muito grande já pode ter pago alvos, tendendo a lateral ou retorno às médias
- **Wedge** — 3 puxadas. Após 3º alvo aguardar TBTL (10 barras, 2 pernas) antes de reentrar. Rompimento de wedge ocorre apenas 25% das vezes. Pós wedge pode gerar reversão ou falha de wedge com 2 pernas na direção do BO
- **DB / DT** — fundos e topos duplos como referência de entrada e reversão. DB mais alto = fundo mais alto = estrutura de compra
- **Gap de média** — preço distante das médias como setup. Entradas típicas: H1 e H2. Se correção vier em MC/canal estreito, aguardar BO e correção para comprar (H2 ou H3)

### 🔴 Padrões de Alerta
- Rompimento sem continuidade
- Compras contra mm200 / vendas contra mm200 sem contexto
- Vendas sem pressão prévia, sem tendência de baixa ou MC anterior
- Compras sem pressão prévia, sem tendência de alta ou MC anterior
- Dias que abrem onde fecharam sem tendência no dia anterior → B1 doji → aguardar mais barras
- Barras sobrepostas, médias planas e emboladas → lateralidade → rompimentos iniciais tendem a falhar

---

## PARTE 7 — INSIGHTS DOS EXEMPLOS GRÁFICOS (Pág. 5–68)

### mm200 duelando (Pág. 5–6)
mm200 acima do preço no M5, abaixo no M15 → tempos conflitantes → movimentos de alta mais difíceis com encerramentos nas médias. Gap de baixa + 3 puxadas de alta em contexto vendedor = venda. "Sem gap de média a tendência continua forte."

### Rompimentos da mm200 (Pág. 6)
Primeiros rompimentos da mm200 tendem a não ir muito longe. Se há BO confirmado com continuidade, buscar alvos — pode gerar bom rali contra tendência após realização de lucro dos vendidos.

### B1 doji + MC lateral → TTR (Pág. 7, 11, 13)
B1 doji = lateralidade em uma barra → mais lateralidade. No M2, mm200 ao meio das barras e flat = ainda mais lateralidade. Atenção à qualidade do BO e continuidade. Evitar trades de BO em extremidades nesse contexto.

### Grande gap de alta em Wedge (Pág. 8)
Gap muito grande levando a wedge com 3 puxadas rápidas. B1 sem fechamento forte = B2 nega continuidade → buscar setups de venda de retorno às médias. Gap grande deixa todas as médias ascendentes → mercado irá descer de forma lateral para encontrar compradores nas médias.

### Endless Pullback (Pág. 9)
O que parecia correção após grande gap se tornou tendência de baixa. B35 com continuidade convenceu todos do modo sempre vendido. Antes disso: endless pullback — o que parecia correção virou grande tendência de baixa.

### VWAP como preço justo (Pág. 9, 12)
VWAP dia = preço justo. Primeiro fechamento acima da VWAP após série abaixo tende a falhar. Considerar pegar a segunda entrada (até 5 barras depois) se vier rapidamente.

### Gap de baixa + mm200 abaixo → BO e FBO → Estrutura de alta (Pág. 10, 32)
Gap de baixa colocou o preço contra as médias. Em nenhum tempo gráfico havia continuidade após a B1. Em lateralidade acima das médias, TTR → comprar baixo até BO e continuidade.

### FAB4 — 3 tipos de gap (Pág. 15, 28, 43)
Gap pequeno: muito espaço para ganhar a favor do FAB4. Gap médio: ainda deixa espaço com alvos. Gap muito grande: já pagou alvos, pode lateralizar ou retornar às médias — não interessante comprar acima de máximas.
FAB4 com mm200 ao meio do gap = suporte ao preço. Se houver correção para a mm200, leitura de pullback para retomada — local para adicionar lotes.

### DT como L2 + inside = venda (Pág. 14, 17, 18)
Todo DT é potencial venda de L2. Inside em DT = modo rompimento para venda. Todo rompimento precisa de continuidade — sem ela, FBO.

### Contra-tendência exige confirmação (Pág. 24)
Para vender contra tendência: pressão vendedora anterior + quebra da LTA + gap de média + algum tipo de teste da máxima (DT mais baixo de preferência). "A tendência pode se prolongar muito mais do que você pode imaginar."

### Gap de média: último setup antes de lateral/MTR (Pág. 25, 35, 66)
Gap de média em tempo menor com forte tendência no M5 e M15 → correções são bandeiras de alta. Operar apenas as falhas de reversão de baixa, entrar nas retomadas. "Sem gap de média, a tendência continua forte."

### Micro canal → modo sempre posicionado (Pág. 26, 45, 57, 61)
MC = modo sempre comprado/vendido. Primeira correção: 1-2 barras (L1/H1). A H1/L1 sintética: correção apenas em tempo menor. Quanto antes identificar MC, mais entradas a favor serão possíveis.

### Fases da tendência (Pág. 61–62)
Fase forte: H1 (1-2 barras). Fase amadurecida: H2 (2 pernas), depois H3, depois gap de média. Correções ficam maiores com o tempo até o ponto em que compradores não conseguem nova máxima. Final do ciclo = lateralidade longa (~70 barras) antes de BO na direção oposta.

### BO sem correção → 2º e 3º alvos (Pág. 35, 47)
Rompimentos que passam reto no M15 (sem H1, H2) → possibilidade de buscar 2º e 3º alvos. Normalmente leva a tendência em tempos menores com muitos gatilhos saindo da mm9 ou mm20.

### Volta em V (Pág. 42)
Extremamente incomum ter novo MC na direção original revertendo MC oposto. Quando acontece, ganha alvos a favor da segunda reversão. O 1º alvo é de alta probabilidade.

### MTR — contexto do M15 (Pág. 66, 67, 68)
Gap de média de compra pós tendência de alta = último setup de compra antes de lateral ou reversão. Se chegou a DT → alto na lateralidade ou MTR HH. No M15: forte outside bar = "se essa barra não te convence a vender, possivelmente nenhuma outra irá." Wedge no M5 ligado ao contexto do M15 = ao renovar inflexão, ganhou premissa de continuidade.

### Canais estreitos no M5 = micro canais no M15 (Pág. 58)
Ao confirmar BO, operar apenas a favor até alvos. Canais estreitos no M5 normalmente são micro canais no M15.

### OCO e OCOI = variações de wedge (Pág. 63, 64)
Padrão de 3 puxadas (mesmo horizontal) tem o mesmo potencial de uma wedge: gera TBTL, reversão ou falha de wedge ao renovar inflexão. BO e correção em 2 pernas antes de reversão.

---

## GLOSSÁRIO

| Sigla | Significado |
|-------|-------------|
| BO | Breakout (rompimento) |
| FBO | Failed Breakout (falha de rompimento) |
| B1/B2 | Primeira e segunda barras do dia |
| MC | Micro canal |
| TR | Trading Range (lateralidade) |
| TTR | Lateralidade Estreita |
| TBTL | Ten Bars, Two Legs (10 barras, 2 pernas) |
| DT/DB | Double Top / Double Bottom |
| HH/LL | Máxima mais alta / Mínima mais baixa |
| HL/LH | Mínima mais alta / Máxima mais baixa |
| MTR | Major Trend Reversal (reversão majoritária) |
| FAB4 | Gap acima da mm200 com médias comprimidas |
| POC | Point of Control |
| VWAP | Volume Weighted Average Price |
| M2B/M2S | Compra/venda na média de 2 períodos |
| OCO/OCOI | Padrões de 3 puxadas variação de wedge |

> "Clareza gera confiança. Contexto gera probabilidade. Probabilidade gera consistência."

---

## PARTE 8 — CHECKLIST COMPLETO (Pág. 98–99)

### ✅ Antes de Operar — Preparação Diária
- Dia anterior fechou em tendência ou lateralidade? Ainda há alvos abertos?
- Gap de hoje está a favor ou contra a MM200 nos tempos maiores?
- MM9, MM20, MM50 e MM200 estão alinhadas? Em qual direção?
- Há setups no diário, M60 ou M15? Para qual direção o macro aponta?
- Onde estão os magnetos: VWAP, wedges, DB/DT, MM200, alvos?
- Há lateralidade nas últimas horas do dia anterior? Atenção ao FAB4

### ✅ Leitura do Mercado — Em Tempo Real
- O mercado está em tendência ou lateralidade? Evite continuidade com médias flat
- **Always-in definido:** se fosse obrigado a entrar agora, qual lado escolheria?
- Há micro canal ativo? Opere somente a favor — venda contra micro canal = baixa probabilidade
- As barras de tendência têm corpo grande, pouco pavio e fechamento nas extremidades?
- O setup está alinhado com o macro? O contexto justifica a entrada?

### ✅ Na Entrada — Checklist de Execução
- Barra de sinal identificada: fecha na extremidade correta, contexto favorável?
- Entrada: 1 tick acima da máxima (compra) ou 1 tick abaixo da mínima (venda) da barra de sinal
- Stop técnico definido: abaixo/acima de estrutura relevante — nunca na média
- Alvo identificado: máxima/mínima anterior, POC, gap aberto, MM200, wedge, alvo do pivô
- Preço está longe demais das médias? Não entre em clímax
- Risco proporcional ao alvo? Relação mínima 1:1 (ideal 2:1 ou mais)
- Ainda estou dentro do meu limite diário de perda?

### ✅ Gestão do Trade — Condução
- Máximo de 3 trades/dia
- Parcial em nova máxima/mínima para reduzir risco
- Mover stop somente após forte barra de rompimento acima de novo pivô
- Se o contexto mudou, a premissa mudou — comprado com gatilho de venda = algo errado
- Reconhecer falha do setup e sair
- ⚠️ **Jamais faça preço médio contra tendência — isso destrói contas**
- Aumento de contratos sempre aritmético — nunca dobre a mão de uma vez

### ✅ Psicologia — Disciplina Mental
- Não operar por impulso
- Perdeu uma entrada? Aguarde o próximo setup — entrar em clímax é armadilha
- Respeite sua janela operacional (09h–12h). Cansado, a tomada de decisão piora
- Qualidade × quantidade — trades seletivos têm maior vantagem matemática
- Iniciando: 1–2 contratos. Mais capital é irrelevante no começo — o foco é aprender a operar

### ✅ Evolução — Crescimento Profissional
- Backtest semanal realizado: o que funcionou? O que deve melhorar?
- Diário de trade preenchido: entradas, contexto, sentimento emocional e resultado
- Revisão das partes em que está errando mais
- 3 meses positivos para subir de nível
- Todo resultado começa e termina nas suas decisões — estude o que melhorou
`
  },
  {
    id: "padroes",
    titulo: "Padrões de Abertura — Triplo Screen",
    descricao: "Checklist de abertura, padrões de alta probabilidade e máximas operacionais",
    tipo: "builtin",
    conteudo: `# Resumo — Padrões de Abertura: Triplo Screen

## 1. ESTRUTURA
Price Action (Al Brooks) + Análise Técnica aplicados ao day trade no Ibovespa Mini com triplo screen M2/M5/M15.

**Objetivo:** Leitura de contexto, localização correta e decisão operacional — sem entradas impulsivas.

## 2. AS 3 POSSIBILIDADES DE GAP
| Cenário | Leitura |
|---------|---------|
| BO + Continuidade | Aceita o gap → seguir a direção |
| BO + Correção | Correção saudável → possível retomada |
| BO + FBO | Rejeita o gap → lateralidade ou reversão |

## 3. MM200 E TEMPOS
- Duelando → lateralidade
- Alinhada → melhores movimentos direcionais
- Ao meio do range → lateralidade

## 4. CHECKLIST DA ABERTURA
✅ **Antes:** onde está a mm200? Dia anterior foi direcional? Há lateralidade longa no fechamento?
✅ **Na Abertura:** B1 forte ou doji? Houve continuidade na B2? Gap pequeno, médio ou grande?
✅ **Durante:** há continuidade ou sobreposição? Correção saudável ou MC estreito? Favor do tempo maior?
❌ **Evitar:** BO sem continuidade, comprar alto/vender baixo longe das médias, operar contra tendência sem pressão prévia

## 5. PADRÕES DE ALTA PROBABILIDADE
- **FAB4** — abertura acima mm200, médias comprimidas
- **Wedge** — 3 puxadas; após 3º alvo aguardar TBTL antes de reentrar
- **DB / DT** — fundos e topos duplos como referência
- **Gap de Média** — preço distante das médias → retorno como setup

## 6. MÁXIMAS
> "A primeira barra diz muito sobre o dia, mas a continuidade confirma tudo."
> "O macro define a direção; o micro oferece o gatilho."
> "BO sem continuidade é apenas tentativa, não confirmação."
> "Sem gap de média, a tendência continua forte."
> "Clareza gera confiança. Contexto gera probabilidade. Probabilidade gera consistência."`
  }
];

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const TEMAS_QUIZ = [
  "Todos",
  "Padrões de Gap",
  "Endless Pullback",
  "Triplo Screen",
  "MM200",
  "Primeira Barra (B1)",
  "FAB4",
  "Wedge / TBTL",
  "Tendências",
  "Micro Canal",
  "Reversões / MTR",
  "Fases da Tendência",
  "Canal Estreito",
  "Gap de Média",
  "Melhores Trades",
];

const QUIZ_QUESTIONS = [
  { id:1, question:"Qual das características abaixo NÃO é necessária para confirmar um padrão de BO + Continuidade?", options:["B1 com fechamento acima de 60% do corpo","B2 com mínima acima da máxima da B1","Retorno às médias (mm20/mm200) na B2","Pouco ou nenhum pavio contrário"], correct:2, explanation:"O retorno às médias na B2 caracteriza o padrão BO + Correção, não BO + Continuidade. No BO + Continuidade a B2 deve confirmar a direção, não corrigir contra ela.", topic:"Padrões de Gap" },
  { id:2, question:"Correções acima de quantas barras configuram um Endless Pullback?", options:["10 barras","15 barras","20 barras","30 barras"], correct:2, explanation:"Correções acima de 20 barras configuram Endless Pullback — o que parecia uma correção se torna uma grande tendência contrária ou reversão climática.", topic:"Endless Pullback" },
  { id:3, question:"No Triplo Screen, qual é a função do M15?", options:["Gatilhos de entrada","Estrutura e pressão","Contexto e direção macro","Definição de stop"], correct:2, explanation:"M15 = contexto e direção macro. M5 = estrutura e pressão. M2 = gatilhos de entrada. O macro define a direção; o micro oferece o gatilho.", topic:"Triplo Screen" },
  { id:4, question:"Quando a mm200 está ao meio do range, qual é a leitura mais provável?", options:["Alta probabilidade de tendência de alta","Alta probabilidade de lateralidade","Sinal de rompimento iminente","Confirmação de BO + Continuidade"], correct:1, explanation:"mm200 ao meio do range indica alta probabilidade de lateralidade. Em lateralidades, 80% dos rompimentos falham.", topic:"MM200" },
  { id:5, question:"Uma B1 como doji indica:", options:["Alta probabilidade de tendência forte desde a abertura","Confirmação de BO + Continuidade","Possibilidade de lateralidade por mais barras","Sinal de reversão climática"], correct:2, explanation:"B1 como doji é uma lateralidade em uma barra — indica a possibilidade de gerar mais lateralidade, mantendo os preços no range por mais barras.", topic:"Primeira Barra (B1)" },
  { id:6, question:"O que caracteriza um BO + FBO (Failed Breakout)?", options:["B1 forte com continuidade na B2","Gap grande com forte rejeição do preço (barra de reversão ou inside/outside contra o gap)","Retorno lento às médias com barras sobrepostas","Micro canal de alta com correções sintéticas"], correct:1, explanation:"BO + FBO apresenta gap frequentemente climático, forte rejeição do preço e barra de reversão ou inside/outside bar contra a direção do gap.", topic:"Padrões de Gap" },
  { id:7, question:"No padrão FAB4, qual é o estado ideal das médias mm20 e mm200?", options:["mm200 muito acima da mm20, ambas direcionais","mm20 e mm200 em estado comprimido (próximas), com preço acima da mm200","mm200 abaixo do preço e mm20 acima do preço","Ambas as médias flat e sobrepostas ao preço"], correct:1, explanation:"FAB4 é caracterizado pela abertura acima da mm200 com mm20 e mm200 em estado comprimido (próximas). Esse estado gera a possibilidade de um bom afastamento — ou seja, um movimento direcional.", topic:"FAB4" },
  { id:8, question:"Após 3 puxadas de alta (wedge), qual é a conduta recomendada?", options:["Comprar o rompimento imediatamente","Parar de comprar e aguardar pelo menos uma correção TBTL (10 barras, 2 pernas)","Vender imediatamente na máxima","Aguardar a mm200 para comprar"], correct:1, explanation:"Após 3 puxadas, a indicação é parar de comprar por pelo menos uma correção TBTL (10 barras, 2 pernas normalmente descendentes).", topic:"Wedge / TBTL" },
  { id:9, question:"Qual é a estatística de tentativas de reversão de tendência que falham?", options:["50%","60%","75%","80%"], correct:3, explanation:"80% das tentativas de reversão de tendência tendem a falhar inicialmente. Por isso, barras de baixa em tendência de alta devem ser vistas como bandeiras de alta, não como reversões.", topic:"Tendências" },
  { id:10, question:"O que é um 'Endless Pullback' e como ele se manifesta?", options:["Uma correção de 1 a 2 barras em uma forte tendência","Uma correção de 10 barras e 2 pernas (TBTL)","Uma correção acima de 20 barras em micro canal ou canal estreito que se torna uma grande tendência contrária","Um rompimento sem continuidade que gera lateralidade"], correct:2, explanation:"Endless Pullback ocorre quando correções acima de 20 barras em micro canal ou canal estreito se tornam uma grande tendência contrária ou reversão climática.", topic:"Endless Pullback" },
  { id:11, question:"Qual é o sinal mais forte de MTR (Major Trend Reversal) no M15?", options:["Doji na B1 seguido de barras sobrepostas","Gap de média com retorno às médias","Forte barra outside em contexto de DT após gap de média","Micro canal de alta com correções sintéticas"], correct:2, explanation:"Uma forte outside bar no M15 em contexto de DT (após gap de média) é descrita como o maior sinal de reversão disponível no material.", topic:"Reversões / MTR" },
  { id:12, question:"Em um micro canal de alta (modo sempre comprado), a primeira correção tende a ter quantas barras?", options:["5 a 10 barras","1 a 2 barras (L1)","3 a 5 barras","Mais de 10 barras"], correct:1, explanation:"Em micro canal, a primeira correção tende a ter apenas 1 a 2 barras (L1), seguida de compra de H1 que normalmente leva a nova máxima.", topic:"Micro Canal" },
  { id:13, question:"Quando a mm200 está duelando entre tempos gráficos, qual é o cenário mais provável?", options:["Tendência forte e direcional","Rompimento iminente para cima","Lateralidade e movimentos mais difíceis","Gap de média de compra"], correct:2, explanation:"mm200 duelando entre tempos indica conflito → movimentos mais difíceis, tendência a lateralidade.", topic:"MM200" },
  { id:14, question:"O que significa 'gap de média' em termos operacionais?", options:["Um gap entre o fechamento e a abertura do dia","Quando o preço se distancia das médias (duas barras completas abaixo/acima da mm20)","Quando a mm20 e mm200 estão separadas por mais de 50 pontos","Um micro canal que se afasta das médias"], correct:1, explanation:"Gap de média ocorre quando o preço se distancia significativamente das médias. É um setup de continuidade pós-tendência, mas o último antes de uma possível lateralidade ou MTR.", topic:"Gap de Média" },
  { id:15, question:"Qual é a conduta correta ao identificar um forte BO sem nenhuma correção?", options:["Aguardar a correção e entrar no H1","Não entrar pois pode ser armadilha","Buscar alvos maiores (2º e 3º alvos) sem tentar operar contra","Vender no primeiro sinal de fraqueza"], correct:2, explanation:"Rompimentos sem correção no M15 deixam possibilidade de buscar alvos maiores. Busque qualquer razão para seguir a tendência.", topic:"Tendências" },
  { id:16, question:"O que NÃO é uma condição necessária para operar contra a tendência vigente?", options:["Pressão vendedora prévia","Quebra da linha de tendência (LTA)","Gap de média","Abertura com B1 forte na direção da tendência"], correct:3, explanation:"Para operar contra tendência é necessário: pressão vendedora anterior, quebra da LTA, gap de média e teste da máxima (preferencialmente DT). B1 forte na direção da tendência reforça a tendência existente.", topic:"Reversões / MTR" },
  { id:17, question:"Qual é a diferença entre fase forte e fase madura da tendência?", options:["Na fase forte há MC; na fase madura aparecem H2, H3 e gap de média","Na fase forte aparecem H2 e H3; na fase madura há apenas H1","Na fase forte o mercado está em lateralidade; na fase madura há MC","Não há diferença operacional entre as fases"], correct:0, explanation:"Fase forte: entradas de H1 (1-2 barras de correção). Fase madura: entradas de H2, depois H3, depois gap de média — correções ficam maiores com o tempo.", topic:"Fases da Tendência" },
  { id:18, question:"Ao operar em tendência forte com correção em canal estreito de baixa no M5, qual é a conduta para compra?", options:["Comprar no H1 imediatamente","Aguardar BO e correção do canal → entrar no H2 ou H3","Comprar na mm200 sem esperar gatilho","Não operar em canal estreito contra tendência"], correct:1, explanation:"Em MC ou canal estreito de baixa, a compra de H1 pode não se realizar. Aguarde o BO e a correção para comprar — entradas de H2 ou H3.", topic:"Canal Estreito" },
  { id:19, question:"Qual é o princípio fundamental que resume a relação entre tempos gráficos no Triplo Screen?", options:["O micro define a direção; o macro oferece o gatilho","M2 e M5 têm igual importância; M15 é apenas referência","O macro define a direção; o micro oferece o gatilho","M15 define o stop; M5 define o alvo; M2 define a entrada"], correct:2, explanation:"'O macro define a direção, o micro oferece o gatilho.' Tempos menores sozinhos não devem ser operados — apenas a favor dos tempos maiores.", topic:"Triplo Screen" },
  { id:20, question:"Qual dos setups abaixo é considerado um dos mais confiáveis para compra segundo os materiais?", options:["H1 no topo da tendência","Gap de média ao final de uma tendência longa","Double Bottom Pullback (DB Pullback) após rompimento e reteste","Comprar o FBO na primeira tentativa"], correct:2, explanation:"O Double Bottom Pullback — quando o mercado rompe acima do DB, corrige de volta ao nível e inverte — é descrito como uma das entradas de compra mais confiáveis, pois combina suporte duplo confirmado com breakout pullback.", topic:"Melhores Trades" },
  { id:21, question:"O que caracteriza uma reversão climática válida?", options:["Qualquer correção após uma tendência longa","Um spike forte imediatamente seguido por um spike igualmente forte na direção oposta","Uma barra doji após várias barras de tendência","Um gap de abertura grande sem continuidade"], correct:1, explanation:"Reversão climática = spike + spike oposto imediato. O segundo spike indica que as instituições entraram pesado no lado oposto. Geralmente resulta em 2 pernas e ~10 barras na direção oposta.", topic:"Reversões / MTR" },
  { id:22, question:"Em um Spike and Channel, qual é o alvo esperado da correção após o canal terminar?", options:["O topo do spike","O meio do canal","O início do canal (onde o canal começou)","A mm200"], correct:2, explanation:"Na estrutura Spike and Channel, quando o canal termina (geralmente com 3 puxadas + overshoot da TCL), a correção típica vai até o INÍCIO do canal, não apenas o topo do spike.", topic:"Melhores Trades" },
  { id:23, question:"O que é um 20 Gap Bar setup?", options:["20 barras consecutivas acima da mm200","20 ou mais barras consecutivas que não tocam a média móvel, e quando o preço finalmente toca a MA é um sinal de alta probabilidade","20 barras de lateralidade antes de um rompimento","Um gap de 20 pontos na abertura"], correct:1, explanation:"20 Gap Bars = 20+ barras consecutivas sem tocar a MA. Isso indica tendência muito forte. Quando a MA é finalmente tocada, é um sinal de alta probabilidade na direção da tendência.", topic:"Melhores Trades" },
  { id:24, question:"Como se define a posição always-in (sempre-in)?", options:["A posição de maior tamanho do trader","A direção que o trader manteria se obrigado a estar no mercado o tempo todo, ou comprado ou vendido","A posição que usa a maior alavancagem","O lado onde há mais volume"], correct:1, explanation:"Always-in é a direção que você manteria se obrigado a estar no mercado sempre. A reversão só é real quando a maioria dos traders acredita que o always-in flipou para o lado oposto.", topic:"Reversões / MTR" },
  { id:25, question:"Qual é a sequência correta de uma MTR (Major Trend Reversal)?", options:["Sinal bar forte → TL break → entrada imediata","TL break forte → pullback/teste da extrema anterior → signal bar forte → flip do always-in","Gap de abertura → doji → entrada contrária","H2 falho → H3 → H4 → reversão"], correct:1, explanation:"MTR clássica: 1) TL break com momentum 2) Pullback que testa o extremo anterior (higher low, equal ou lower) 3) Signal bar forte 4) Always-in flip confirmado 5) Pelo menos 2 pernas e ~10 barras na nova direção.", topic:"Reversões / MTR" },

  // ── SITUACIONAIS — aplicadas ao trade real ──
  { id:26, question:"São 9h02. O WIN abriu com gap de alta de 800 pontos. A B1 fechou forte, no topo, sem pavio superior. A B2 abriu acima da máxima da B1 e está subindo. Qual é a leitura correta?", options:["Aguardar correção para a mm20 antes de comprar","BO + Continuidade confirmado — mercado aceitou o gap, alta probabilidade de perna direcional","Gap grande demais, provável FBO — vender","Lateralidade esperada pois gap grande gera exaustão"], correct:1, explanation:"B1 forte (fechamento no topo, sem pavio) + B2 com abertura acima da máxima da B1 = BO + Continuidade clássico. O mercado aceitou o gap. Conduta: operar a favor, buscar alvos direcionais sem tentar reverter.", topic:"Padrões de Gap" },
  { id:27, question:"Gap de alta na abertura. B1 foi um doji com pavio longo para cima. B2 já está revertendo abaixo da mínima da B1. O que está acontecendo e qual a conduta?", options:["BO + Continuidade — comprar o rompimento da B2","BO + Correção saudável — aguardar retorno às médias para comprar","BO + FBO em formação — mercado está rejeitando o gap, viés muda para venda ou lateralidade","Endless Pullback iniciando — aguardar 20 barras"], correct:2, explanation:"B1 doji com pavio longo para cima (rejeição) + B2 revertendo abaixo da mínima da B1 = sinal claro de FBO. O mercado não aceitou os preços do gap. Conduta: não comprar. Aguardar lateralidade ou buscar venda se houver setup.", topic:"Padrões de Gap" },
  { id:28, question:"Gap de alta moderado. B1 foi uma barra de tendência de alta razoável. B2 corrigiu levemente e está próxima da mm20 no M5, sem perder a mínima da B1. Qual o cenário mais provável?", options:["FBO — mercado vai reverter totalmente o gap","BO + Correção — correção saudável, possível retomada de alta após suporte na mm20","Endless Pullback — correção vai durar mais de 20 barras","Lateralidade definitiva — operar nas extremidades do range"], correct:1, explanation:"Correção lenta, barras sobrepostas, retorno à mm20 sem perder a mínima da B1 = BO + Correção. Correção saudável dentro da estrutura de alta. Aguardar sinal de entrada (H1 ou H2) próximo à média.", topic:"Padrões de Gap" },
  { id:29, question:"No M5, o WIN está em micro canal de alta há 8 barras seguidas, todas com mínima acima do fechamento anterior. A barra atual perdeu a mínima da barra anterior por 50 pontos. Qual é a conduta correta?", options:["Vender — o micro canal quebrou, reversão confirmada","Aguardar — primeira quebra de micro canal é H1, provável compra acima da máxima da barra atual","Ignorar — micro canal continua válido","Comprar imediatamente abaixo da mínima atual"], correct:1, explanation:"Primeira quebra de micro canal de alta = H1 buy setup (failed bear breakout). A maioria dos traders que estava esperando qualquer pullback vai comprar aqui. Conduta: buy stop acima da máxima da barra que quebrou o canal.", topic:"Micro Canal" },
  { id:30, question:"Micro canal de alta no M5 com 14 barras. Ainda não houve nenhuma correção. Você está fora do trade. Qual é a abordagem mais correta?", options:["Comprar a mercado — tendência forte, qualquer entrada funciona","Aguardar — com 14 barras em MC, probabilidade de pullback tradeable aumentou substancialmente. Preparar para comprar o primeiro recuo","Vender — MC longo demais, reversão iminente","Não operar — perdeu o trade, esperar próxima oportunidade"], correct:1, explanation:"Micro canal com 10+ barras = tendência climática, pullback tradeable iminente. Não compre no topo do MC. Prepare-se para o primeiro recuo — idealmente um H1 ou H2 após a quebra do MC — que será a entrada de maior probabilidade.", topic:"Micro Canal" },
  { id:31, question:"No M15, você identifica um micro canal de baixa de 6 barras em uma tendência de alta mais longa. O que esse micro canal representa e como operar?", options:["Reversão da tendência de alta — vender","Bear flag dentro da tendência de alta — aguardar breakout de alta acima do MC para comprar","Endless Pullback — tendência de alta acabou","Lateralidade — operar nas extremidades"], correct:1, explanation:"Micro canal de baixa dentro de uma tendência de alta = bear flag. Não vender. Aguardar o BO acima do MC e, se possível, o BPB (breakout pullback) para entrar comprado com alta probabilidade.", topic:"Micro Canal" },
  { id:32, question:"M15 mostra tendência de baixa com mm200 acima do preço. M5 está em correção de alta com H2 formando na mm20. M2 tem uma barra de reversão de baixa forte. Qual é a conduta correta?", options:["Comprar no H2 do M5","Ignorar o M2 e comprar no H2 do M5","Vender no M2 usando o H2 do M5 como localização e o M2 como gatilho — está a favor do macro (M15 de baixa)","Aguardar o M15 virar de alta antes de operar"], correct:2, explanation:"O macro (M15 baixa) define a direção: venda. O M5 oferece a estrutura: correção de alta = bear flag = localização ideal para vender. O M2 oferece o gatilho: barra de reversão de baixa. Essa é a leitura de Triplo Screen correta — macro define, micro executa.", topic:"Triplo Screen" },
  { id:33, question:"M15 em lateralidade com mm200 ao meio do range. M5 com tendência de alta aparente, rompendo máximas. Você deve comprar o rompimento no M5?", options:["Sim — tendência de alta clara no M5","Não — o M15 em lateralidade com mm200 ao meio indica que 80% dos rompimentos falham. O M5 não tem confirmação do macro","Sim, mas apenas scalp","Depende do volume"], correct:1, explanation:"M15 em lateralidade + mm200 ao meio do range = contexto de duas faces. 80% dos rompimentos falham. O M5 em alta é apenas um swing dentro da lateralidade maior. Comprar rompimento no M5 sem confirmação do macro é operar contra a probabilidade.", topic:"Triplo Screen" },
  { id:34, question:"No M15, a mm200 está abaixo do preço apontando para cima. No M5, a mm200 está acima do preço. O que essa configuração indica?", options:["Tendência de alta confirmada em todos os tempos","Tempos duelando — movimentos de alta são mais difíceis, tendência a lateralidade com encerramentos nas médias","Tendência de baixa confirmada — vender","Setup FAB4 em formação"], correct:1, explanation:"MM200 duelando entre tempos = conflito entre compradores e vendedores. Movimentos direcionais são mais difíceis. O mercado tende a encerramentos nas médias. Evitar trades de swing, preferir scalps nas extremidades se houver setup.", topic:"MM200" },
  { id:35, question:"O WIN está 1200 pontos abaixo da mm200 no M5, em tendência de baixa. De repente aparece uma forte barra de alta. Qual é a leitura mais provável?", options:["Reversão confirmada — comprar","Gap de média de compra — possível setup, mas é o último antes de lateral/MTR. Aguardar confirmação antes de comprar","Ignorar — barra isolada não tem significado","Vender o rompimento da barra de alta"], correct:1, explanation:"Preço muito distante da mm200 = gap de média. A forte barra de alta pode ser o início de um retorno à média (setup de compra), mas atenção: gap de média é o ÚLTIMO setup antes de uma possível lateralidade ou MTR. Aguardar confirmação (H1 ou H2) antes de entrar.", topic:"MM200" },
  { id:36, question:"No M5, o WIN fez 3 puxadas de alta com topos progressivos. A 3ª puxada ultrapassou a linha de canal de tendência (TCL) e reverteu com uma barra de tendência de baixa forte. Qual é a conduta?", options:["Comprar — ainda é tendência de alta","Aguardar — pode ser apenas correção antes de nova alta","Vender — wedge com overshoot da TCL + barra de reversão forte = setup de venda de alta probabilidade. Alvo: início do wedge","Vender apenas se perder a mm200"], correct:2, explanation:"Wedge de alta (3 puxadas) + overshoot da TCL + strong bear reversal bar = um dos setups de reversão mais confiáveis do Al Brooks. Primeiro alvo: início do wedge (base da 1ª puxada). Segundo alvo: movimento medido igual à altura do wedge.", topic:"Wedge / TBTL" },
  { id:37, question:"Você entrou vendido após o 3º topo de um wedge. O mercado caiu 2 pernas e atingiu o fundo do wedge. Agora está formando uma barra de reversão de alta. O que fazer?", options:["Segurar a venda — pode cair mais","Realizar lucro parcial ou total — alvo primário (início do wedge) atingido. Após TBTL, nova oportunidade de compra pode surgir","Adicionar mais vendas","Ignorar a barra de reversão"], correct:1, explanation:"Alvo primário atingido (fundo do wedge). O Al Brooks instrui: após a correção do wedge em 2 pernas, aguardar TBTL (10 barras, 2 pernas) antes de reentrar na direção original. Realizar lucros aqui é a conduta correta.", topic:"Wedge / TBTL" },
  { id:38, question:"Tendência de alta no M5. Primeira correção foi de 2 barras (H1). Segunda foi de 5 barras com 2 pernas (H2 na mm20). Agora aparece uma terceira correção mais profunda, chegando perto da mm200. O que isso sinaliza?", options:["Nada especial — comprar H3 normalmente","A tendência está amadurecendo. Correções maiores sinalizam transição para fase madura. H3 pode funcionar mas com menor probabilidade. Gap de média pode ser o próximo setup","Reversão confirmada — vender","Endless Pullback — aguardar 20 barras"], correct:1, explanation:"Fase forte: H1 (1-2 barras). Fase madura: H2 (5+ barras, 2 pernas). Terceira correção mais profunda = tendência amadurecendo, trading bilateral crescente. H3 ainda funciona mas com menor probabilidade. Após H3/H4, o gap de média costuma ser o último setup.", topic:"Fases da Tendência" },
  { id:39, question:"No M15, após uma longa tendência de alta, o preço está 2 barras completas acima da mm20 sem tocar a média por 22 barras. Aparece uma forte barra de baixa. Qual é a leitura?", options:["Comprar — tendência forte, qualquer correção é oportunidade","20+ gap bars + barra de baixa forte = possível início de correção mais profunda ou MTR. Esse é o último setup de compra antes de uma possível mudança de regime","Vender imediatamente","Ignorar — gap bars não têm significado operacional"], correct:1, explanation:"22 gap bars + barra de baixa forte = sinal de exaustão. O gap de média é o ÚLTIMO setup de compra antes de lateral ou reversão. Após esse nível, a tendência perde momentum. Conduta: realizar lucros em posições abertas, não adicionar compras.", topic:"Fases da Tendência" },
  { id:40, question:"No M15, houve uma quebra forte da LTA com 3 barras de tendência de baixa consecutivas. O mercado agora está puxando de volta para cima. Você deve vender imediatamente?", options:["Sim — TL break confirmado, vender a mercado","Não ainda. Aguardar o teste da máxima anterior. A entrada de maior probabilidade é no pullback que testa o extremo antigo, não no TL break em si","Comprar — pullback em tendência de alta","Aguardar o M2 para gatilho imediato"], correct:1, explanation:"TL break é o PRIMEIRO passo da MTR, não o sinal de entrada. A sequência correta: TL break → pullback que testa a máxima anterior → signal bar forte → entrada. Entrar no TL break é arriscado pois o pullback frequentemente leva stop antes da reversão começar.", topic:"Reversões / MTR" },
  { id:41, question:"Após tendência de alta, o mercado quebrou a LTA e o pullback formou um higher low. O preço voltou para testar a máxima antiga e formou barra de reversão de baixa forte exatamente no topo anterior. Qual é a conduta?", options:["Aguardar — pode romper para nova alta","Vender com stop acima da máxima — TL break + higher low + teste do extremo + signal bar forte = MTR completa de alta probabilidade","Comprar — double bottom formado","Operar apenas no M2"], correct:1, explanation:"Sequência MTR completa: 1) TL break forte 2) Higher low 3) Teste da máxima anterior 4) Strong bear reversal bar no teste. Todos os 4 elementos presentes = entrada de venda de alta probabilidade com stop acima do topo.", topic:"Reversões / MTR" },
  { id:42, question:"Mercado em tendência de baixa. Houve rali forte que quebrou a LTB mas formou um lower high (abaixo da máxima da tendência de baixa) e reverteu. Isso é uma MTR de alta?", options:["Sim — TL break confirma reversão","Não ainda. Lower high após TL break não flipa o always-in. Precisa de higher high ou teste claro do extremo com barra de reversão forte","Sim, se o M2 confirmar","Não — precisa de double bottom antes"], correct:1, explanation:"TL break necessário mas não suficiente. Lower high significa que os ursos ainda são fortes. O always-in ainda pode ser short. Para flip completo: precisa de higher high confirmado ou teste do extremo com sinal forte. Lower high = apenas pullback, não MTR.", topic:"Reversões / MTR" },
  { id:43, question:"No M5, o WIN fez double bottom com os dois fundos no mesmo nível, rompeu para cima com barra forte, voltou para testar o nível sem perdê-lo e formou barra de reversão de alta (Double Bottom Pullback). O que fazer?", options:["Aguardar — double bottom pode falhar","Comprar acima da máxima da barra de reversão — DB Pullback é um dos setups de maior probabilidade. Stop abaixo do fundo do DB","Comprar apenas se a mm200 estiver abaixo","Aguardar 2ª entrada antes de comprar"], correct:1, explanation:"Double Bottom Pullback: DB confirmado + BO acima do DB + reteste sem perder + barra de reversão = entrada de alta probabilidade. Combina suporte duplo + breakout pullback. Entrada: acima da máxima da barra de reversão. Stop: abaixo do fundo.", topic:"Melhores Trades" },
  { id:44, question:"M15 em tendência de alta forte, sem tocar a mm20 por 18 barras. O mercado finalmente recuou e tocou a mm20 com uma barra de reversão de alta. Qual é a probabilidade desse setup?", options:["Baixa — muitas barras sem toque indica exaustão","Alta — 18 gap bars indica tendência forte. Primeiro toque na mm20 após 18+ barras = 20 gap bar setup, uma das entradas mais confiáveis em tendência forte","Média — depende do contexto do M5","Baixa — tendência pode estar revertendo"], correct:1, explanation:"18 gap bars + primeiro toque na mm20 = setup de alta probabilidade. O Al Brooks descreve: '20 gap bars indica tendência muito forte e as chances são altas de que haverá compradores na média móvel.' Entrada de alta probabilidade na fase forte da tendência.", topic:"Melhores Trades" },
  { id:45, question:"Spike and Channel de alta no M5. O canal terminou com 3 puxadas e overshoot da TCL. O mercado reverteu e está corrigindo. Qual é o alvo mais provável da correção?", options:["Topo do spike (início do canal)","mm200","Início do canal (onde o canal começou, não o spike)","50% do movimento total"], correct:2, explanation:"Na estrutura Spike and Channel, quando o canal termina (3 puxadas + TCL overshoot), a correção típica vai até o INÍCIO DO CANAL, não o topo do spike. O spike fica intacto. O canal é o que corrige. Esse é um dos alvos mais precisos do Al Brooks.", topic:"Melhores Trades" },
  { id:46, question:"O WIN está em lateralidade de 200 pontos há 45 minutos. Uma barra de tendência de alta grande rompe acima. Na barra seguinte, o mercado já está voltando para dentro da lateralidade. O que fazer?", options:["Comprar — rompimento confirmado","Vender — FBO clássico. 80% dos rompimentos de lateralidade falham. Barra voltando para dentro da range = trap nos compradores. Stop acima da máxima do rompimento","Aguardar mais barras antes de decidir","Comprar abaixo da mínima da barra de retorno"], correct:1, explanation:"FBO clássico: rompimento forte + imediata reversão para dentro da range = trap. Os compradores presos vão sair com stop e empurrar o preço para baixo. Vender aqui é operar exatamente onde os traders presos vão alimentar o move. Stop curto acima da máxima.", topic:"Melhores Trades" },
  { id:47, question:"No M5, tendência de alta com H1 e H2 funcionando. Agora aparece um H3 mas a correção foi em canal estreito de baixa (micro canal de baixa). Você compra o H3?", options:["Sim — H3 é entrada válida em tendência de alta","Com cautela. Canal estreito no pullback sugere força dos ursos. Melhor aguardar o BO acima do canal estreito e o BPB antes de comprar","Não — H3 nunca funciona","Comprar, mas com stop mais amplo"], correct:1, explanation:"Canal estreito de baixa no pullback = ursos em controle naquela correção. H1 em canal estreito frequentemente falha. Conduta correta: aguardar o BO acima do canal estreito e o BPB. H2 ou H3 após o BPB tem probabilidade muito maior.", topic:"Canal Estreito" },
  { id:48, question:"São 9h15. B1 foi doji. B2 e B3 foram barras sobrepostas sem direção. O mercado está em lateralidade apertada de 150 pontos. Você deve operar?", options:["Sim — comprar na mínima e vender na máxima da lateralidade","Sim — esperar H2 ou L2 para entrar","Não — lateralidade apertada no início do dia com B1 doji = contexto de baixa probabilidade. Aguardar rompimento com barras direcionais claras","Sim — vender pois o gap falhou"], correct:2, explanation:"B1 doji + barras sobrepostas + lateralidade apertada = contexto de duas faces, baixa probabilidade. Em tight trading ranges, 80% dos rompimentos falham e H1/H2/L1/L2 frequentemente são falsos. Aguardar rompimento claro com barra de tendência forte.", topic:"Padrões de Gap" },
  { id:49, question:"Você está comprado em tendência de alta. O mercado formou um wedge (3ª puxada) e parece estar revertendo. Ainda não bateu seu alvo. O que fazer?", options:["Aguardar — pode retomar depois do wedge","Realizar lucros parciais ou totais. Wedge = 3 puxadas = exaustão. Não segure comprado contra wedge sem antes ver TBTL de confirmação","Adicionar compras na reversão","Vender para reversão completa"], correct:1, explanation:"Wedge de alta = exaustão compradora. Quando você está comprado e o mercado forma um wedge, realizar parcial ou total é a conduta correta. Tentar segurar contra wedge é arriscar o lucro acumulado. Após TBTL (10 barras, 2 pernas de baixa), nova oportunidade pode surgir.", topic:"Wedge / TBTL" },
  { id:50, question:"Tendência de alta no M15. No M5, formou-se um double top na máxima do dia. O mercado perdeu a mínima entre os dois topos com barra de tendência de baixa. Isso é sinal para vender swing?", options:["Não — nunca vender contra o M15","Sim, scalp apenas. DT no M5 em M15 de alta = L2 setup. Scalp de baixa com alvo na mm20 do M5, stop acima do topo","Sim — reversão completa confirmada","Aguardar — DT sozinho não é sinal suficiente"], correct:1, explanation:"DT no M5 com M15 de alta = oportunidade de scalp de baixa, não swing de reversão. Duas tentativas de alta no mesmo nível falharam (L2). Scalp para mm20 do M5 é razoável. Swing short contra o M15 de alta = baixa probabilidade.", topic:"Reversões / MTR" },
];

// ─── MARKDOWN ─────────────────────────────────────────────────────────────────
function SimpleMarkdown({ content, th }) {
  const lines = content.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];

  const accent = "#4ecb8d";

  const flushTable = () => {
    if (tableRows.length > 1) {
      const headers = tableRows[0].split('|').filter(c => c.trim());
      const rows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim()));
      elements.push(
        <div key={`table-${elements.length}`} style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{headers.map((h, i) => <th key={i} style={{ background: th.resumeBg, color: th.textMuted, padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${th.border}`, fontWeight: 700, fontSize: 12 }}>{h.trim()}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid ${th.border}` }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', color: th.textSub, fontSize: 13 }}>{cell.trim()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.startsWith('|')) { inTable = true; tableRows.push(line); return; }
    if (inTable) flushTable();

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: 20, fontWeight: 800, color: th.text, marginBottom: 12, marginTop: 8, borderBottom: `2px solid ${accent}`, paddingBottom: 8 }}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: 15, fontWeight: 700, color: accent, marginBottom: 8, marginTop: 20 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: 13, fontWeight: 600, color: th.text, marginBottom: 6, marginTop: 14 }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 12, margin: '10px 0', color: th.textSub, fontStyle: 'italic', fontSize: 13 }}>{line.slice(2)}</blockquote>);
    } else if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('❌ ') || line.startsWith('⚠️ ')) {
      const text = line.replace(/^[-✅❌⚠️]\s?/, '');
      const icon = line.startsWith('✅') ? '✅ ' : line.startsWith('❌') ? '❌ ' : line.startsWith('⚠️') ? '⚠️ ' : '• ';
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 13, color: th.textSub }}>
          <span style={{ flexShrink: 0 }}>{icon}</span>
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${th.text}">$1</strong>`) }} />
        </div>
      );
    } else if (line.trim() === '' || line.startsWith('---')) {
      elements.push(<div key={i} style={{ height: line.startsWith('---') ? 1 : 8, background: line.startsWith('---') ? th.border : 'transparent', margin: line.startsWith('---') ? '16px 0' : 0 }} />);
    } else if (line.trim()) {
      elements.push(<p key={i} style={{ fontSize: 13, color: th.textSub, marginBottom: 6, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${th.text}">$1</strong>`) }} />);
    }
  });

  if (inTable) flushTable();
  return <div>{elements}</div>;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function EstudosAlBrooks({ th = {} }) {
  const accent = "#4ecb8d";

  const [activeTab, setActiveTab] = useState("resumos");

  // Resumos state
  const [resumos, setResumos] = useState(RESUMOS_BUILTIN);
  const [resumoSel, setResumoSel] = useState(null);
  const [showAddResumo, setShowAddResumo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoConteudo, setNovoConteudo] = useState("");
  const [novoLink, setNovoLink] = useState("");
  const [tipoNovo, setTipoNovo] = useState("texto");

  // PDFs state
  const [pdfSel, setPdfSel] = useState(null);
  const PDFS = [
    { id: "ebook",     titulo: "E-book Al Brooks Técnico",            url: "https://drive.google.com/file/d/1bD50azdngXOMsYpRaEBwhDeZzfRpzLSH/preview" },
    { id: "padroes",   titulo: "Padrões de Abertura — Triplo Screen",  url: "https://drive.google.com/file/d/13bYKhJS0P8stpqPxAWopRdDg13cRqh9F/preview" },
    { id: "plano",     titulo: "Plano de Trade",                       url: "https://drive.google.com/file/d/1iiZBEcdyWaXj_DT3VOhtRpp3YlUDu-km/preview" },
    { id: "premissas", titulo: "Premissas da Movimentação de Preço",   url: "https://drive.google.com/file/d/1B9uJWqgnqDmFePjsOv7eFXcthTKZXW-b/preview" },
    { id: "trends",    titulo: "Trading Price Action — Trends",         url: "https://drive.google.com/file/d/1nzV1Ky3Lek4WvOVBAFyIVb68CeXqTPUs/preview" },
    { id: "ranges",    titulo: "Trading Price Action — Trading Ranges", url: "https://drive.google.com/file/d/1mNKYzZ_jFaGNpeiQZzrVnJ_VjR-_mT7E/preview" },
    { id: "reversals", titulo: "Trading Price Action — Reversals",      url: "https://drive.google.com/file/d/1jR-IfsxWuMPVuFsPrAwMhb5XgE0ZP_cE/preview" },
  ];

  // Assistente state
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Olá! Sou seu assistente de análise baseado nos três livros do Al Brooks (Trends, Trading Ranges e Reversals) e nos materiais do Al Brooks Técnico. Descreva um trade ou cenário e avaliarei com base nos princípios de Price Action — contexto, localização, always-in, signal bars e probabilidade."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetch(`${GAS_ESTUDOS_URL}?action=lerHistorico`)
      .then(r => r.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  }, []);

  // Quiz state
  const [temaSel, setTemaSel] = useState("Todos");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const [wrongQueue, setWrongQueue] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQ, setReviewQ] = useState(0);
  const [questoesAtivas, setQuestoesAtivas] = useState([]);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const questoesFiltradas = temaSel === "Todos" ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter(q => q.topic === temaSel);
  const activeQuestions = reviewMode ? wrongQueue : questoesAtivas;
  const currentQuestion = activeQuestions[reviewMode ? reviewQ : currentQ];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();
    const updatedMessages = [...newMessages, { role: "assistant", content: data.reply || "Sem resposta." }];
      setMessages(updatedMessages);
      fetch(GAS_ESTUDOS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "salvarHistorico", messages: updatedMessages })
      }).catch(() => {});
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Erro de conexão. Verifique o proxy GAS e tente novamente." }]);
    }
    setLoading(false);
  };

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === currentQuestion.correct;
    setResults(prev => [...prev, { id: currentQuestion.id, correct: isCorrect, question: currentQuestion.question, topic: currentQuestion.topic }]);
  };

  const nextQuestion = () => {
    const qIdx = reviewMode ? reviewQ : currentQ;
    if (qIdx + 1 < activeQuestions.length) {
      reviewMode ? setReviewQ(qIdx + 1) : setCurrentQ(qIdx + 1);
      setSelected(null); setAnswered(false);
    } else { setQuizDone(true); }
  };

  const startReview = () => {
    const wrong = results.filter(r => !r.correct).map(r => QUIZ_QUESTIONS.find(q => q.id === r.id)).filter(Boolean);
    setWrongQueue(wrong); setReviewMode(true); setReviewQ(0);
    setResults([]); setQuizDone(false); setSelected(null); setAnswered(false);
  };

  const resetQuiz = () => {
    setQuizStarted(false); setCurrentQ(0); setSelected(null); setAnswered(false);
    setResults([]); setQuizDone(false); setReviewMode(false); setReviewQ(0); setWrongQueue([]);
    setQuestoesAtivas([]);
  };

  const salvarResumo = () => {
    if (!novoTitulo.trim()) return;
    const novo = {
      id: `user-${Date.now()}`,
      titulo: novoTitulo,
      descricao: tipoNovo === "link" ? "Link externo (Notion/Web)" : "Resumo pessoal",
      tipo: tipoNovo,
      conteudo: tipoNovo === "texto" ? novoConteudo : null,
      link: tipoNovo === "link" ? novoLink : null,
    };
    setResumos(prev => [...prev, novo]);
    setNovoTitulo(""); setNovoConteudo(""); setNovoLink(""); setShowAddResumo(false);
  };

  const correctCount = results.filter(r => r.correct).length;
  const wrongResults = results.filter(r => !r.correct);

  const tabs = [
    { id: "resumos",    label: "📄 Resumos" },
    { id: "pdfs",       label: "📚 PDFs" },
    { id: "assistente", label: "🤖 Assistente" },
    { id: "quiz",       label: "🎯 Quiz" },
  ];

  const inputStyle = {
    background: th.surface, border: `1px solid ${th.border}`, borderRadius: 8,
    padding: "9px 14px", color: th.text, fontSize: 13, outline: "none",
    fontFamily: "inherit", width: "100%",
  };

  const btnPrimary = {
    padding: "9px 20px", background: accent, border: "none", borderRadius: 8,
    color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
  };

  const btnSecondary = {
    padding: "9px 20px", background: "transparent", border: `1px solid ${th.border}`,
    borderRadius: 8, color: th.textSub, fontWeight: 600, fontSize: 13, cursor: "pointer",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: th.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ background: th.surface, borderBottom: `1px solid ${th.border}`, padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${accent},#2da86e)`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📈</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: th.text }}>Estudos — Al Brooks</div>
          <div style={{ fontSize: 11, color: th.textMuted }}>Price Action · Triplo Screen · WINFUT</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: th.surface, borderBottom: `1px solid ${th.border}`, display: "flex", padding: "0 32px" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "12px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            color: activeTab === tab.id ? accent : th.textMuted,
            borderBottom: activeTab === tab.id ? `2px solid ${accent}` : "2px solid transparent",
          }}>{tab.label}</button>
        ))}
      </div>

    <div style={{ flex: 1, padding: activeTab === "pdfs" && pdfSel ? "28px 32px 56px" : "28px 52px 56px", overflowY: "auto", minWidth: 0, boxSizing: "border-box", maxWidth: activeTab === "pdfs" && pdfSel ? "100%" : 1200 }}>

        {/* ── RESUMOS ── */}
        {activeTab === "resumos" && (
          <div>
            {!resumoSel ? (
              <>
                <p style={{ fontSize: 13, color: th.textMuted, marginBottom: 20, marginTop: 0 }}>
                  Aqui ficam os resumos dos materiais já estudados. Clique em um para ler.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {resumos.map(r => (
                    <div key={r.id} onClick={() => r.tipo === "link" ? window.open(r.link, "_blank") : setResumoSel(r)}
                      style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = th.border}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: th.text, marginBottom: 3 }}>{r.titulo}</div>
                        <div style={{ fontSize: 12, color: th.textMuted }}>{r.descricao}</div>
                      </div>
                      <span style={{ fontSize: 18, color: th.textMuted }}>{r.tipo === "link" ? "🔗" : "›"}</span>
                    </div>
                  ))}
                </div>

                {/* Adicionar resumo */}
                {!showAddResumo ? (
                  <button onClick={() => setShowAddResumo(true)} style={{ ...btnSecondary, width: "100%" }}>
                    + Adicionar resumo
                  </button>
                ) : (
                  <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: th.text, marginBottom: 16 }}>Novo resumo</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      {["texto", "link"].map(t => (
                        <button key={t} onClick={() => setTipoNovo(t)} style={{ ...tipoNovo === t ? btnPrimary : btnSecondary, padding: "7px 16px" }}>
                          {t === "texto" ? "📝 Texto" : "🔗 Link (Notion)"}
                        </button>
                      ))}
                    </div>
                    <input placeholder="Título do resumo" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
                    {tipoNovo === "texto" ? (
                      <textarea placeholder="Cole seu resumo aqui (suporta Markdown: ## Título, **negrito**, - lista)" value={novoConteudo} onChange={e => setNovoConteudo(e.target.value)}
                        style={{ ...inputStyle, height: 180, resize: "vertical", marginBottom: 10 }} />
                    ) : (
                      <input placeholder="URL do Notion ou outro link" value={novoLink} onChange={e => setNovoLink(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={salvarResumo} style={btnPrimary}>Salvar</button>
                      <button onClick={() => setShowAddResumo(false)} style={btnSecondary}>Cancelar</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setResumoSel(null)} style={{ ...btnSecondary, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
                  ← Voltar
                </button>
                <div style={{ background: th.surface, borderRadius: 12, padding: 28, border: `1px solid ${th.border}` }}>
                  <SimpleMarkdown content={resumoSel.conteudo || ""} th={th} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PDFs ── */}
        {activeTab === "pdfs" && (
          <div>
            {!pdfSel ? (
              <>
                <p style={{ fontSize: 13, color: th.textMuted, marginBottom: 20, marginTop: 0 }}>
                  Aqui ficam os documentos completos já estudados. Clique em um para abrir.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PDFS.map(p => (
                    <div key={p.id} onClick={() => setPdfSel(p)}
                      style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = th.border}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 28 }}>📄</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>{p.titulo}</div>
                          <div style={{ fontSize: 12, color: th.textMuted, marginTop: 2 }}>Google Drive · PDF</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 18, color: th.textMuted }}>›</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <button onClick={() => setPdfSel(null)} style={{ ...btnSecondary, display: "flex", alignItems: "center", gap: 6 }}>
                    ← Voltar
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: th.text }}>{pdfSel.titulo}</span>
                  <a href={pdfSel.url.replace("/preview", "/view")} target="_blank" rel="noreferrer" style={{ ...btnSecondary, textDecoration: "none", fontSize: 12 }}>
                    Abrir no Drive ↗
                  </a>
                </div>
                <div style={{ background: th.surface, borderRadius: 12, overflow: "hidden", border: `1px solid ${th.border}` }}>
                <iframe
                    src={pdfSel.url}
                    title={pdfSel.titulo}
                    width="100%"
                    height="calc(100vh - 160px)"
                    style={{ border: "none", display: "block", minHeight: 600 }}
                    allow="autoplay"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ASSISTENTE ── */}
        {activeTab === "assistente" && (
          <div style={{ display: "flex", flexDirection: "column", height: 600 }}>
            <div style={{ background: th.surface, borderRadius: "12px 12px 0 0", padding: "12px 18px", borderBottom: `1px solid ${th.border}`, border: `1px solid ${th.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>🤖 Avaliador de Trades — Al Brooks</div>
              <div style={{ fontSize: 11, color: th.textMuted, marginTop: 2 }}>Baseado nos 3 livros: Trends, Trading Ranges e Reversals</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: th.bg, border: `1px solid ${th.border}`, borderTop: "none" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "82%", padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: msg.role === "user" ? accent : th.surface,
                    color: msg.role === "user" ? "#fff" : th.text,
                    fontSize: 13, lineHeight: 1.6,
                    border: msg.role === "assistant" ? `1px solid ${th.border}` : "none",
                    whiteSpace: "pre-wrap",
                  }}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "12px 12px 12px 2px", background: th.surface, border: `1px solid ${th.border}`, fontSize: 13, color: th.textMuted }}>
                    Analisando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8, padding: 12, background: th.surface, borderRadius: "0 0 12px 12px", border: `1px solid ${th.border}`, borderTop: "none" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ex: Vou comprar no M5 com mm200 acima do preço no M15, B1 como doji..."
                style={{ ...inputStyle }} />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ ...btnPrimary, opacity: loading || !input.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}>
                Enviar
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {activeTab === "quiz" && (
          <div>
            {!quizStarted && !quizDone && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: th.text, marginBottom: 8 }}>Quiz — Al Brooks Técnico</h2>
                <p style={{ color: th.textMuted, fontSize: 13, marginBottom: 28 }}>
                  {QUIZ_QUESTIONS.length} perguntas sobre Price Action, Triplo Screen, Gaps, Reversões e Melhores Trades.<br />
                  Selecione um tema ou faça o quiz completo.
                </p>

                {/* Seleção de tema */}
                <div style={{ marginBottom: 28, maxWidth: 520, margin: "0 auto 28px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Filtrar por tema</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {TEMAS_QUIZ.map(t => (
                      <button key={t} onClick={() => setTemaSel(t)} style={{
                        padding: "6px 14px", borderRadius: 20, border: `1px solid ${temaSel === t ? accent : th.border}`,
                        background: temaSel === t ? accent : th.surface,
                        color: temaSel === t ? "#fff" : th.textSub,
                        fontWeight: temaSel === t ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                      }}>
                        {t}
                        {t !== "Todos" && <span style={{ marginLeft: 5, opacity: 0.7 }}>({QUIZ_QUESTIONS.filter(q => q.topic === t).length})</span>}
                        {t === "Todos" && <span style={{ marginLeft: 5, opacity: 0.7 }}>({QUIZ_QUESTIONS.length})</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => {
                  if (questoesFiltradas.length > 0) {
                    setQuestoesAtivas(shuffleArray(questoesFiltradas));
                    setQuizStarted(true);
                  }
                }} style={{ ...btnPrimary, padding: "12px 36px", fontSize: 15 }}>
                  Iniciar ({questoesFiltradas.length} {questoesFiltradas.length === 1 ? "pergunta" : "perguntas"})
                </button>
              </div>
            )}

            {quizStarted && !quizDone && currentQuestion && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={resetQuiz} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 12 }}>
                      ✕ Sair
                    </button>
                    <span style={{ fontSize: 13, color: th.textMuted }}>
                      {reviewMode ? "🔄 Revisando erros — " : ""}Pergunta {(reviewMode ? reviewQ : currentQ) + 1} de {activeQuestions.length}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, padding: "4px 10px", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20, color: th.textSub }}>{currentQuestion.topic}</span>
                </div>
                <div style={{ background: th.resumeBg, borderRadius: 4, height: 4, marginBottom: 20 }}>
                  <div style={{ height: 4, borderRadius: 4, background: accent, width: `${(((reviewMode ? reviewQ : currentQ) + 1) / activeQuestions.length) * 100}%`, transition: "width 0.3s" }} />
                </div>

                <div style={{ background: th.surface, borderRadius: 12, padding: 24, border: `1px solid ${th.border}`, marginBottom: 14 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: th.text, lineHeight: 1.5, margin: 0 }}>{currentQuestion.question}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {currentQuestion.options.map((opt, idx) => {
                    let bg = th.surface, borderColor = th.border, color = th.textSub;
                    if (answered) {
                      if (idx === currentQuestion.correct) { bg = "#052e16"; borderColor = "#16a34a"; color = "#4ade80"; }
                      else if (idx === selected && idx !== currentQuestion.correct) { bg = "#2d1212"; borderColor = "#dc2626"; color = "#f87171"; }
                    } else if (selected === idx) { bg = th.navActiveBg; borderColor = accent; }
                    return (
                      <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                        style={{ padding: "12px 16px", background: bg, border: `2px solid ${borderColor}`, borderRadius: 9, color, fontSize: 13, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: th.bg, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
                          {answered && idx === currentQuestion.correct ? "✓" : answered && idx === selected && idx !== currentQuestion.correct ? "✗" : String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div style={{ background: selected === currentQuestion.correct ? "#052e16" : "#2d1212", border: `1px solid ${selected === currentQuestion.correct ? "#16a34a" : "#dc2626"}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: selected === currentQuestion.correct ? "#4ade80" : "#f87171", marginBottom: 6 }}>
                      {selected === currentQuestion.correct ? "✅ Correto!" : "❌ Incorreto"}
                    </div>
                    <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>{currentQuestion.explanation}</p>
                  </div>
                )}

                {answered && (
                  <button onClick={nextQuestion} style={{ ...btnPrimary, width: "100%", padding: "12px" }}>
                    {(reviewMode ? reviewQ : currentQ) + 1 < activeQuestions.length ? "Próxima →" : "Ver Resultado"}
                  </button>
                )}
              </div>
            )}

            {quizDone && (
              <div>
                <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{correctCount === results.length ? "🏆" : correctCount >= results.length * 0.7 ? "👍" : "📚"}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: th.text, marginBottom: 4 }}>{correctCount} / {results.length} corretas</h2>
                  <p style={{ color: th.textMuted, fontSize: 13 }}>
                    {correctCount === results.length ? "Perfeito! Domínio total." : correctCount >= results.length * 0.7 ? "Bom resultado! Alguns pontos para revisar." : "Revise os conceitos e tente de novo."}
                  </p>
                </div>

                {wrongResults.length > 0 && (
                  <div style={{ background: th.surface, borderRadius: 12, padding: 20, border: `1px solid ${th.border}`, marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#f87171", marginBottom: 12 }}>❌ Erros para revisar ({wrongResults.length})</div>
                    {wrongResults.map((r, i) => (
                      <div key={i} style={{ padding: "8px 0", borderBottom: i < wrongResults.length - 1 ? `1px solid ${th.border}` : "none" }}>
                        <span style={{ fontSize: 11, color: th.textMuted, display: "block", marginBottom: 2 }}>Tópico: {r.topic}</span>
                        <span style={{ fontSize: 13, color: th.textSub }}>{r.question}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  {wrongResults.length > 0 && (
                    <button onClick={startReview} style={{ flex: 1, padding: "12px", background: "#dc2626", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      🔄 Revisar Erros ({wrongResults.length})
                    </button>
                  )}
                  <button onClick={resetQuiz} style={{ flex: 1, padding: "12px", background: accent, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    🎯 Novo Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
