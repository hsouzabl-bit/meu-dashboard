import { useState, useEffect } from "react";

// ─── GAS ──────────────────────────────────────────────────────────────────────
const GAS_ESTUDOS_URL = "https://script.google.com/macros/s/AKfycbzBEgswS-Jy8HvgYOQITuS6YgRrT7am5DlR3Mhd6KC4sTpl_Xg5It7XBnIKdr1QWfzi/exec";

const CHAVE_CACHE_RESUMOS = "cache_resumos";

// O GAS costuma falhar na primeira chamada e responder na segunda.
// Sem retry, o catch engolia a falha e os resumos salvos nunca apareciam.
function fetchComRetry(url, tentativas = 3, delayMs = 1200) {
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err => {
      if (tentativas <= 1) throw err;
      return new Promise(res => setTimeout(res, delayMs))
        .then(() => fetchComRetry(url, tentativas - 1, delayMs));
    });
}

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

## PARTE 7 — Uso do TradeSystem na Metodologia (pág. 69–97)

### Dias Laterais — Localização é o Ponto-Chave (pág. 69)

Em dias laterais, tempos maiores terão sinais mais tardios. Dentro de um range, a localização é o fator mais determinante:

- **Alto na lateralidade** → topo duplo sem rompimento e continuidade = ponto de venda
- **Baixo na lateralidade** → fundo duplo sem rompimento = ponto de compra
- B8 como exemplo: se não fosse uma barra tão ampla, seria excelente barra de venda
- Gatilho de venda na B24: baixo no dia, quase no fundo duplo — seria antecipar um rompimento que nunca aconteceu
- Gatilho na B35: também baixo na lateralidade, mas a favor da perna 2 do forte micro canal da B20 à B26

> Em dias dentro de range: não operar no meio da lateralidade. Alto vende, baixo compra.

---

### M2 em Dias Laterais (pág. 70)

O M2 trouxe possibilidades de compra e venda mais cedo que o M5 ou M15, mas o contexto era melhor explicado no M15. Lições do exemplo:

- Gatilhos de micro canal e falha de H1 pós micro canal são válidos no M2
- **Não comprar no M2 na cara da MM20 alinhada para baixo** — probabilidade baixa
- O gatilho de compra válido estava a favor da perna 2 de alta do M5 (havia direção)
- A primeira venda sinalizada no M2 era o preço em setup de M2S no M15 — o gatilho veio apenas ao fechamento da grande barra
- Apesar do forte movimento de alta no M15, no M60 era apenas um retorno à MM20 — o contexto macro explica a movimentação do tempo menor

---

### Confluência de Gatilhos Entre Tempos (pág. 71)

- Barras de gatilho do M15 podem coincidir com barras de gatilho no M5, mas nem sempre acontece
- Quando a barra do M15 fecha com pavio amplo, ela pode representar uma barra contrária no fechamento da barra do M5 — nesses momentos é necessário esperar mais barras até o preço voltar à direção do macro
- Gatilhos da manhã do M15 tendem a andar melhor, com exceção de lateralidades e barras dentro do range das barras iniciais do dia ou do final do dia anterior
- No M2: algumas barras com gatilho no mesmo momento do M5, outras pouco depois

---

### Tempos Maiores — Menos Gatilhos, Maior Probabilidade (pág. 72)

| Tempo | Quantidade de Gatilhos | Probabilidade de Continuidade | Stop |
|-------|----------------------|-------------------------------|------|
| M15   | Poucos               | Alta                          | Alto |
| M5    | Médio                | Média-alta                    | Médio |
| M2    | Muitos               | Média                         | Baixo |

- É possível associar os gatilhos do tempo macro com a leitura do micro, usando stop adequado no micro, devido à alta probabilidade de continuidade
- No primeiro gatilho de venda B3 (M15): já era a quarta barra desde o fechamento do dia anterior renovando mínima — indicação de força dos vendidos
- No gatilho da B25: já era um canal estreito de alta — o ciclo havia mudado
- No M5: há bem mais gatilhos posteriores, mas quanto mais o preço se distancia do gatilho inicial, mais pode estar se aproximando de alvos, suportes e resistências

---

### Espaço para Entrar — Importância da Localização (pág. 73)

- **Sempre é melhor ter espaço ao entrar.** Vender próximo às médias quando o preço retornou a elas deixa fundo anterior e algum espaço para teste
- Na fase forte da tendência o preço irá romper o fundo prévio várias vezes, mas mais tarde passará a falhar até mesmo em retomar o extremo — por isso é sempre melhor vender ou comprar quando ainda há algum espaço
- Em micro canais ou canais estreitos, basta a barra ir na direção do fechamento da barra anterior para que haja gatilho, **antes mesmo da superação da extremidade da barra anterior**
- Na exceção de ciclo forte, é necessária a superação da mínima

> A compra que fica na cara da MM50 do M15 frequentemente gera lateralidade no teste inicial. Sempre exija algum espaço.

---

### Triplo Screen — A Base da Metodologia (pág. 74)

A metodologia original usa pelo menos o triplo screen com gatilhos sequenciais:

- **M15** → leitura macro: direção, tendência, setup, magneto, suporte e resistência
- **M5** → esperar gatilhos a favor da leitura do M15
- **M1 / M2** → tempo de entrada (gatilho final)

Regras práticas:
- A compra na B16 não foi marcada pois até então havia estrutura de baixa no dia e poderia falhar na MM20
- A venda inicial saindo da MM9, a segunda venda pouco abaixo com confirmação no M15
- O tempo micro **nunca deve ser usado sozinho** — sempre a favor de contexto ou gatilhos de tempos maiores
- O M1 também pode ser usado para buscar reversão em lateralidades, mas pode gerar ansiedade em alguns traders por apresentar muitos gatilhos

---

### Wedge + Contexto de Venda (pág. 75)

Exemplo de leitura do M15 com wedge na abertura:

- B1 abrindo em wedge e demonstrando força dos vendidos, fecha como forte barra de tendência de baixa
- **Setup da primeira barra**: venda na perda da mínima com alvo em 100% do corpo da B1 projetado para baixo
- B7: além de retornar à MM20, foi um fundo duplo mais alto que o anterior — mantendo estrutura de alta que levou a nova máxima
- **Wedge + DT é ainda uma estrutura vendedora** — só ganha alvos acima se o preço romper com barra de continuidade
- A venda da B17 tinha ainda estrutura de alta e poderia falhar; a venda da B25 já tinha estrutura de baixa e retomada a partir do teste da MM20

No M5: como não foi uma descida em MC, demorou a ter gatilho de venda até que formasse um canal estreito de baixa. A venda da B75 levou a um micro canal de baixa no M5, deixando premissa de continuidade de pelo menos mais uma perna de baixa após correção.

---

### O Micro Não Reverte o Macro (pág. 76–77)

- As correções no M15 e M5 vistas no M2 parecem grandes reversões, mas **o micro não reverte o macro** — a força dos setups reverte facilmente o micro
- O foco é sempre usar o macro como leitura principal, pois ele sempre terá melhor probabilidade
- Comprar no M2, mas a barra do M15 fechou como forte barra de baixa → trade tem baixa probabilidade de grande evolução
- O fechamento de barras com amplo pavio pode sinalizar uma barra de baixa no M5 ou M2 ao fechar a barra do M15 → necessário esperar entrada a favor nesses tempos
- M15 acima das médias: retornos às médias são cenários de compra — buscar ver reação do preço na região da MM20

**Qualidade da barra e fechamento importam:**
- Barra que fecha próximo de sua máxima (compra) ou mínima (venda) indica continuidade
- Preço e médias alinhados → melhor probabilidade

---

### Retornos à MM9 e MM20 como Setups de Continuidade (pág. 84–86)

Em tendências, após micro canal, o preço tende a iniciar algum tipo de canal. Na fase forte:

- Primeiras correções: na MM9
- Em seguida: na MM20
- Depois: gap de média
- Então: teste da MM50

Todos são setups e localizações de venda (em tendência de baixa) ou compra (em tendência de alta).

Exemplos:
- Retorno à MM9 do M15 → no M5 era um retorno à MM20 (M2B de compra), gatilho de compra barras depois
- Segundo retorno à MM9 do M15 → gap de média no M5, barra com gatilho na B45
- Terceiro retorno à MM9 do M15 → prolongou-se quase chegando à MM20 do macro, novo gap de média no M5 com gatilho e continuidade

> **80% das tentativas de reversão de tendência tendem a falhar inicialmente.** As reversões falham enquanto houver bons setups de continuidade.

---

### Lateralidades — O Cenário Mais Complexo (pág. 88)

- Em lateralidades é comum vermos barras sobrepostas, preços atuando contra a direção das médias
- Médias se tornam planas → têm valor de magneto (o preço volta ao meio da lateralidade)
- Regiões de POC funcionam como magneto e pontos de reversão
- Uma lateralidade no M15: os movimentos no M2 parecem tendências fortes — o tempo maior precisa de atenção constante

**Regras para lateralidades:**
- Não há setups, apenas localização
- POC como suporte e resistência
- MM200 ao meio → alta probabilidade de lateralidade
- Gatilhos podem vir tarde e não ter muita continuidade
- **"Se não estiver disposto a comprar baixo e vender alto, espere um BO e continuidade"**

---

### Confluência de Fechamentos entre M15 e M60 (pág. 89)

- Barras que fecham como tendência de alta no M60 tendem a gerar barras de alta no M15 no mesmo momento
- **Antes de comprar, olhe o M15 e M60** — se houver barra de tendência de baixa fechada, a chance de stop na compra é alta
- Se a compra está com barra anterior de alta, há melhor probabilidade
- Durante a formação de uma barra do M60 com fechamento próximo de sua mínima, haverá barras de alta no M5 ou M15 — mas todas são correções enquanto as barras do macro forem de baixa
- **A reversão precisa ser iniciada no macro** para haver probabilidade no micro

---

### Macro Primeiro — Nunca Antecipe o Micro (pág. 90–91)

> "O macro é mais importante que o micro." — Al Brooks

- Reversões devem primeiro acontecer no macro para podermos pensar em continuidade
- Nunca antecipe o micro em busca de reversão sem força anterior no macro
- Um micro canal no M2 alto na lateralidade não tem valor para compra — no M15 é apenas alto na lateralidade
- Antecipar reversões é uma estratégia perdedora — mesmo que em um dia específico tenha levado a grande movimentação de alta, no longo prazo essa abordagem perde dinheiro

**Regra:** só comprar se tiver um ciclo extremo como forte micro canal de alta para que haja possibilidade de sobrepor a venda do gap de média.

---

### Leitura de Ciclos e Estrutura pelo TradeSystem (pág. 92)

- Observando os gatilhos e a regra de coloração, é possível identificar facilmente a estrutura de mercado: ciclos como micro canais, canais estreitos, bons rompimentos e sua continuidade
- O mercado não reverte sem sinais — ou reverte com uma única grande barra de tendência revertendo 20 ou mais fechamentos (mas essa barra também terá gatilho)
- Ciclos fortes são resultado de mercado unilateral e com frequência terão continuidade, visto que vários fundos estão operando em uma única direção

**Correção em 2 pernas:** extremamente comum em tendências. Cuidado ao usar stop de barra de entrada — um topo duplo tende a ser uma bandeira de baixa em forma de DT.

---

### Fundo Majoritário vs. Fundo Minoritário (pág. 95)

- **Fundo majoritário**: obrigatoriamente possui uma barra de rompimento com forte fechamento acima de máxima anterior — demora mais a acontecer
- **Fundo minoritário**: todas as estruturas contidas dentro de um fundo majoritário — têm menor relevância
- Fundos majoritários são frequentemente usados como ponto de stop a favor de estruturas majoritárias e como forma de condução de stop móvel
- A cada novo rompimento de pivô, é possível mover o stop para condução do trade

---

### Múltiplas Reversões e Lateralidade (pág. 96)

- Múltiplas reversões na abertura são indício de lateralidade
- Se acontecerem na abertura, cuidado com rompimentos iniciais — o cenário pode se prolongar por horas
- O melhor cenário são rompimentos fortes que levam a canais
- Micro canal de baixa após lateralidade = mudança forte na frequência das barras → novas compras devem ser evitadas nas entradas de H1 e H2 subsequentes
- A compra de melhor probabilidade após um forte micro canal vendedor é o próprio gap de média
- **Pressão é cumulativa** — uma demonstração de forte pressão vendedora deve gerar alerta de que vendidos podem vender fortemente novamente

> Quando temos reversões múltiplas na abertura em tempo maior, com frequência será possível ver um doji no diário ou ao menos um bom tempo de atividade lateral.

---

### Síntese Final — Princípios Operacionais (pág. 97)

**Sobre cores e coloração do TradeSystem:**
- Barras em azul: alerta para evitar vendas — se for operar contra estrutura, será por contexto e localização
- Barras em vermelho: indicam estrutura de baixa — comprar contra uma estrutura de baixa normalmente é estratégia perdedora sem critério muito forte de justificativa
- A maioria leva cerca de 4 anos para conseguir operar consistentemente contra tendência com base apenas em contexto e localização

**Sobre gatilhos:**
- Os gatilhos são reflexo de price action — se fizer um estudo de pelo menos 100 dias, observará que os gatilhos iniciais a favor de um mínimo de contexto têm continuidade com muito mais frequência do que falham
- Ao notar um gatilho de venda, pergunte: o ciclo das barras mudou? Formou micro canal? Canal estreito? A estrutura de alta falhou? Tenho razão técnica para entrar? Estou sendo o primeiro a buscar uma reversão de tendência?

**Sobre tendências:**
- Em tendência de alta, sem forte clímax, wedge longe das médias ou alvos sendo pagos: **não seja o primeiro a vender**
- Espere pressão anterior, gap de média, ciclo forte que se sobreponha ao gap de média
- **O mercado premia quem opera a favor de tendências**
- Rompimentos são os cenários mais lucrativos, mais rápidos e com melhor probabilidade — difíceis de entrar, mas a regra é tentar participar

**Sobre stop:**
- Não há como ter um stop curto e alta probabilidade (Brooks repete isso em todos os livros)
- O stop amplo serve para analisar o preço — se a premissa estiver errada e houver rompimento contra a posição, o lado que conseguiu o rompimento buscará aquele alvo
- Se o alvo está antes do stop, encerre o trade antes de ele chegar

**Sobre gestão e psicologia:**
- Tenha um diário minucioso de suas operações — seja honesto e duro consigo mesmo
- Questione cada entrada: entrei por FOMO? Entrei por ter perdido outras entradas? Entrei atrasado? Antecipei estrutura?
- Um limite de perda diária precisa ser estabelecido — sugestão para fase de aprendizagem: não perder mais do que 500 pts em um dia
- **"Sem regras, sem chance de sobreviver no mercado"**
- O mercado retira capital dos impacientes para conceder lucro aos mais pacientes

**Sobre POC e VWAP:**
- Regiões de VWAP do dia anterior: por vezes serão mais uma justificativa para uma reversão — foi o local de preço justo no dia anterior e pode ser novamente
- Regiões de POC em lateralidades e correções: potenciais pontos de suporte e resistência — caso tenha boas barras de sinal, podem gerar trades com boa probabilidade

> Passar muito tempo usando as mesmas médias trará clareza de distância, correção, lateralidade, tendência e suporte/resistência.

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

# Padrões de Abertura — Triplo Screen (Tradesystem + Al Brooks)

## Introdução

Este resumo aborda gaps na abertura aplicados ao contexto de day trade com análise em Triplo Screen (M2, M5 e M15), baseado na metodologia de Price Action de Al Brooks e Análise Técnica Clássica.

**Objetivo:** desenvolver leitura de contexto, localização correta e decisão operacional, evitando entradas impulsivas e focando em probabilidades reais.

---

## Conceito de Gap

Gap é um deslocamento ou aceleração de preço que ocorre:
- Entre o fechamento do dia anterior e a primeira barra do dia
- Por meio de um micro canal inicial sem sobreposição entre as barras

Gaps indicam desequilíbrio temporário entre compradores e vendedores.

---

## As 3 Possibilidades de Gap

### 1. Rompimento e Continuidade (BO + Continuidade)

**Características:**
- B1 forte, com fechamento acima de 60% do corpo
- B2 com continuidade: mínima acima da máxima da barra anterior e fechamento acima da máxima da B1
- Pouco ou nenhum pavio contrário
- Pouca ou nenhuma sobreposição com a barra anterior à B1

**Leitura:** mercado aceita os preços do gap → alta probabilidade de continuação direcional

> **Alerta:** Em fortes tendências, as primeiras correções tendem a ter apenas 1 a 2 barras (H1). Correções acima de 20 barras configuram Endless Pullback.

---

### 2. Rompimento e Correção (BO + Correção)

**Características:**
- Gap inicial seguido de movimento lento contra o gap
- Barras sobrepostas
- Retorno às médias (MM20 / MM200)

**Leitura:** realização parcial de lucros — correção saudável antes de possível retomada

> **Alerta:** Correções em micro canal estreito aumentam a chance de uma segunda perna contra o gap, podendo se tornar um Endless Pullback.

---

### 3. Rompimento e Falha de Rompimento (BO + FBO)

**Características:**
- Gap grande, frequentemente climático
- Forte rejeição do preço
- Barra de reversão ou barra de tendência contrária
- Inside bar ou outside bar contra a direção do gap

**Leitura:** mercado não aceita os preços do gap → alta probabilidade de lateralidade ou reversão

> **Alerta:** BO sem continuidade é apenas tentativa, não confirmação. Este cenário, quando ocorre na abertura, frequentemente leva a muita lateralidade durante o restante do dia.

---

## Importância da Primeira Barra (B1)

A B1 oferece informações cruciais sobre o caráter do dia:

| B1 | Leitura Provável |
|----|-----------------|
| Forte + continuidade na B2 | Direção inicial confirmada |
| Doji ou barra sem continuidade | Lateralidade provável |
| Forte barra de reversão | Possível FBO / reversão climática |
| Inside bar | Modo rompimento — esperar definição |

**Regra fundamental:** A primeira barra diz muito sobre o dia, mas a continuidade (barras seguintes) confirma tudo. Esta leitura se aplica ao M2, M5, M15, M60 e diário.

> Uma B1 fraca raramente sustenta rompimentos.

---

## Papel da MM200

A MM200 é a referência mais importante de contexto macro:

- **MM200 acima e abaixo em tempos diferentes** → tempos duelando → lateralidade mais provável
- **MM200 ao meio do range** → alta probabilidade de lateralidade → evitar BO sem validação
- **MM200 alinhada nos tempos** → melhores movimentos direcionais
- **MM200 ascendente abaixo do preço** → favorece compradores — correções devem ser vistas como bandeiras de alta
- **Primeiros rompimentos da MM200** tendem a não ir muito longe ou a falhar — se confirmado com continuidade, busque os alvos

---

## Triplo Screen — Diretriz Operacional

| Tempo | Função |
|-------|--------|
| M15   | Contexto e direção macro |
| M5    | Estrutura e pressão |
| M2    | Gatilhos de entrada |

> **Princípio fundamental: O macro define a direção, o micro oferece o gatilho.**

O tempo micro nunca deve ser operado sozinho. Sempre a favor de contexto ou gatilhos de tempos maiores. Barras em tempo menor que conflitem com o fechamento do macro têm baixa probabilidade de evolução.

---

## Padrões de Alta Probabilidade na Abertura

### FAB4
- MM20 e MM200 em estado comprimido (próximas)
- B1 com forte direção, B2 como continuidade
- Quanto menor o gap, mais espaço para o mercado ter um tempo direcional
- Um gap muito grande que já pagou todos os alvos pode apenas lateralizar ou retornar às médias — não é interessante comprar acima de máximas nesses casos
- No M2: MM200 ao meio do gap serve como suporte na eventual correção — é um dos melhores cenários de FAB4

### Wedge
- Padrão de 3 puxadas com ponto de inflexão
- Em 75% das vezes gera pelo menos uma correção TBTL
- Wedge + DB é ainda um padrão de compra; Wedge + DT é ainda um padrão de venda
- Em lateralidades, wedges têm maior probabilidade de reverter a direção
- Falha de wedge (25%) → premissa mínima de 2 pernas na direção contrária

### DB / DT (Fundo Duplo / Topo Duplo)
- Em lateralidades: DB e DT funcionam como pontos de compra e venda, respectivamente
- DB mais alto que o anterior → estrutura de alta mantida → compra
- DT mais baixo que o anterior → melhor probabilidade de nova mínima

### Gap de Média
- Setup de continuidade da tendência
- Compra (ou venda) quando o preço retorna às médias após se afastar
- Em tendência de alta: cada retorno à MM9 → MM20 → MM50 são pontos de compra
- Gap de média de compra pós tendência de alta é lido como último setup antes de lateralidade ou reversão

---

## Padrões de Alerta

Situações que exigem cautela redobrada:

- **Rompimento sem continuidade** — BO sem confirmação é apenas tentativa
- **Compras contra MM200 / vendas contra MM200** — primeiros testes tendem a falhar
- **Vendas sem pressão prévia**, sem tendência de baixa ou MC anterior — não seja o primeiro
- **Compras sem pressão prévia**, sem tendência de alta ou MC anterior
- **B1 como doji** → indica dúvida na abertura → tende a manter lateralidade por mais barras; aguardar sinal de força antes de operar BO
- **Barras sobrepostas, médias planas e emboladas** → indício de lateralidade → rompimentos iniciais tendem a falhar
- **Preço abrindo dentro do range sem tendência no dia anterior** → precisa de mais barras para leitura

---

## Insights dos Exemplos Gráficos

### Gap de baixa + MM200 acima do preço (contexto vendedor)
Quando M15 está em tendência de baixa e M5 tem MM200 acima do preço: movimentos de alta são mais difíceis e tendem a encerrar nas médias ou pouco acima delas. Três puxadas de alta neste contexto = setup para novas vendas. Sem gap de média, a tendência de baixa continua forte.

### Gap de alta climático (3 puxadas muito rápidas)
Após 3 puxadas rápidas: parar de comprar por pelo menos uma correção TBTL (10 barras, 2 pernas). Se a B1 não tem forte fechamento de alta e a B2 nega continuidade, buscar setups de venda de retorno às médias. Um gap muito grande deixará todas as médias ascendentes e o preço irá descer lateralmente para encontrar compradores.

### B1 como doji + TTR acima das médias
B1 doji indica lateralidade em uma barra. Contexto: TTR acima das médias → comprar baixo, próximo à MM20. Exceto com BO de baixa confirmado. Estruturas como DB, DT e wedge podem definir o rompimento neste cenário.

### BO e FBO → lateralidade
Gap de alta seguido de falha de rompimento não reverte o mercado — corrige e lateraliza. O mercado passa a ter barras sobrepostas, médias resistindo ao preço. Evitar compras próximas às médias, pouco acima das médias, em setups de venda ou POC.

### Endless Pullback
O que parece uma correção se torna uma grande tendência de baixa quando há rompimento confirmado com continuidade após 20+ barras de descida em canal estreito.

### Vwap do dia anterior
O preço justo do dia anterior. A primeira tentativa de romper a vwap tende a falhar — considere pegar a segunda entrada (fechamento acima da vwap) se vier poucas barras depois (até 5 barras).

### Pressão cumulativa dentro da lateralidade
Micro canais dentro de lateralidades são acúmulos de pressão. Dois micro canais de alta consecutivos dentro da lateralidade, além de estrutura de alta (máximas e mínimas mais altas), favorecem o rompimento de alta.

---

## Checklist Operacional de Gaps

### Antes da Abertura
- Onde está a MM200 no M15, M5 e M2?
- Dia anterior foi direcional ou lateral?
- Existe lateralidade longa no fechamento (modo rompimento)?
- Qual o contexto de médias: abertas, direcionais, planas ou emboladas?

### Na Abertura
- A B1 é barra forte ou doji?
- Houve continuidade na B2?
- O gap é pequeno, médio ou grande?
- O preço está acima ou abaixo da MM200?

### Durante o Trade
- Há continuidade ou sobreposição de barras?
- A correção é saudável (1-2 barras) ou micro canal, canal estreito?
- O trade está a favor do tempo maior?
- Barras do M15 e M60 fecharam a favor da entrada?

### Evitar
- Operar BO sem devida continuidade
- Comprar alto longe das médias ou vender baixo longe das médias (exceto em setups de micro canal forte: falha de H1, L1, fechamento em modo rompimento)
- Operar contra tendência sem pressão prévia — não ser o primeiro
- Comprar no meio da lateralidade (zona neutra)
- Entrar quando a MM200 está ao meio do range sem BO confirmado

---

## Regras Essenciais de Contexto

- **80% das tentativas de reversão de tendência falham inicialmente** — em tendências, ver correções como bandeiras a favor
- **Sem gap de média, a tendência continua forte** — gap de média é o primeiro sinal de possível lateralidade ou reversão
- **Tendências se prolongam mais do que se imagina** — não opere contra tendência sem pressão anterior, quebra de LTA e algum tipo de teste da máxima (DT mais baixo de preferência)
- **Quando o preço tenta 2 vezes retomar a máxima prévia e falha**, ele tende a testar a mínima anterior
- **Canais estreitos no M5 normalmente são micro canais no M15** — o mesmo padrão, em escalas diferentes
- Quando um canal de baixa tiver 20 ou mais barras: aguardar o BO, a correção, então entrar na retomada

---

## Glossário

| Sigla | Significado |
|-------|-------------|
| BO    | Breakout (rompimento) |
| FBO   | Failed Breakout (falha de rompimento) |
| B1/B2 | Primeira e segunda barras do dia |
| MC    | Micro canal |
| TR    | Trading Range (lateralidade) |
| TTR   | Lateralidade Estreita |
| TBTL  | Ten Bars, Two Legs (10 barras, 2 pernas) |
| DT/DB | Double Top / Double Bottom |
| HH/LL | Máxima mais alta / Mínima mais baixa |
| HL/LH | Mínima mais alta / Máxima mais baixa |
| MTR   | Major Trend Reversal (reversão majoritária da tendência) |
| POC   | Point of Control |
| FAB4  | Padrão de gap com MM20 e MM200 comprimidas |
| OCO/OCOI | Variação de padrão de 3 puxadas (tipo wedge) |
| M2B/M2S | Moving Average 2 Bar Buy/Sell (setup de retorno à MM) |

---

> *Gaps oferecem oportunidades, mas exigem leitura de contexto e velocidade na ação. A repetição, o estudo e o backtest são fundamentais para internalizar padrões.*
>
> **Clareza gera confiança. Contexto gera probabilidade. Probabilidade gera consistência.**

`
  },
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

  // Resumos
  const [resumos, setResumos] = useState(RESUMOS_BUILTIN);
  const [carregando, setCarregando] = useState(true);
  const [resumoSel, setResumoSel] = useState(null);
  const [showAddResumo, setShowAddResumo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoConteudo, setNovoConteudo] = useState("");
  const [novoLink, setNovoLink] = useState("");
  const [tipoNovo, setTipoNovo] = useState("texto");

  // PDFs
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

  // Cache imediato + fetch com retry em background.
  useEffect(() => {
    try {
      const c = localStorage.getItem(CHAVE_CACHE_RESUMOS);
      if (c) {
        const salvos = JSON.parse(c);
        if (Array.isArray(salvos)) {
          setResumos([...RESUMOS_BUILTIN, ...salvos]);
          setCarregando(false);
        }
      }
    } catch (e) {}

    fetchComRetry(`${GAS_ESTUDOS_URL}?action=lerResumos`)
      .then(data => {
        const lista = data.resumos || [];
        try { localStorage.setItem(CHAVE_CACHE_RESUMOS, JSON.stringify(lista)); } catch (e) {}
        setResumos([...RESUMOS_BUILTIN, ...lista]);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

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
    const atualizados = [...resumos, novo];
    setResumos(atualizados);
    try {
      localStorage.setItem(CHAVE_CACHE_RESUMOS, JSON.stringify(atualizados.filter(r => r.tipo !== "builtin")));
    } catch (e) {}
    fetch(GAS_ESTUDOS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "salvarResumo", resumo: novo })
    }).catch(() => {});
    setNovoTitulo(""); setNovoConteudo(""); setNovoLink(""); setShowAddResumo(false);
  };

  const deletarResumo = (id) => {
    const atualizados = resumos.filter(x => x.id !== id);
    setResumos(atualizados);
    try {
      localStorage.setItem(CHAVE_CACHE_RESUMOS, JSON.stringify(atualizados.filter(r => r.tipo !== "builtin")));
    } catch (e) {}
    fetch(GAS_ESTUDOS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "deletarResumo", id })
    }).catch(() => {});
  };

  const tabs = [
    { id: "resumos", label: "📄 Resumos" },
    { id: "pdfs",    label: "📚 PDFs" },
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: th.bg, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", width: "100%" }}>

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

      <div style={{ flex: 1, padding: activeTab === "pdfs" && pdfSel ? "28px 32px 56px" : "28px 52px 56px", overflowY: "auto", boxSizing: "border-box", maxWidth: activeTab === "pdfs" && pdfSel ? "none" : 1200,
                   width: activeTab === "pdfs" && pdfSel ? "calc(100vw - 240px)" : "100%" }}>

        {/* ── RESUMOS ── */}
        {activeTab === "resumos" && (
          <div>
            {!resumoSel ? (
              <>
                <p style={{ fontSize: 13, color: th.textMuted, marginBottom: 20, marginTop: 0 }}>
                  Aqui ficam os resumos dos materiais já estudados. Clique em um para ler.
                  {carregando && <span style={{ marginLeft: 8, opacity: 0.7 }}>carregando…</span>}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {resumos.map(r => (
                    <div key={r.id}
                      style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = th.border}>
                      <div onClick={() => r.tipo === "link" ? window.open(r.link, "_blank") : setResumoSel(r)}
                        style={{ flex: 1, cursor: "pointer" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: th.text, marginBottom: 3 }}>{r.titulo}</div>
                        <div style={{ fontSize: 12, color: th.textMuted }}>{r.descricao}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {r.tipo !== "builtin" && (
                          <button onClick={e => { e.stopPropagation(); deletarResumo(r.id); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: 16, padding: "4px 8px" }}>
                            ✕
                          </button>
                        )}
                        <span style={{ fontSize: 18, color: th.textMuted }}>{r.tipo === "link" ? "🔗" : "›"}</span>
                      </div>
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
                <div style={{ background: th.surface, borderRadius: 12, overflow: "hidden", border: `1px solid ${th.border}`, width: "100%", flex: 1 }}>
                  <iframe
                    src={pdfSel.url}
                    title={pdfSel.titulo}
                    style={{ border: "none", display: "block", width: "100%", height: "calc(100vh - 160px)", minHeight: 600 }}
                    allow="autoplay"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
