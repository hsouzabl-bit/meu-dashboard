# CONTEXTO — Dashboard Evolução Diária

## URLs
- Site: https://react-dashboard-creation.vercel.app
- GitHub: https://github.com/hsouzabl-bit/meu-dashboard
- API Estudos: https://script.google.com/macros/s/AKfycbzBEgswS-Jy8HvgYOQITuS6YgRrT7am5DlR3Mhd6KC4sTpl_Xg5It7XBnIKdr1QWfzi/exec
- API Diário: https://script.google.com/macros/s/AKfycbw8RZBDKmZSLJy14PpP0enu05KR0nbPhavtg_m0ZOTnjvHPgBaFT8hzoByu8nKdiRT5/exec
- Planilha Estudos ID: 1bF4xPU3ObX-FLybPlYJAqrNO7HG5bnmReTAHm3a-RS8
- Planilha Diário ID: 1tUS99Um-CjNX7mBpa4pXGzBsnb9jLPGes1UL7qJSUDI

## Stack
React + Vite. Deploy: Vercel conectado ao GitHub — push = deploy automático. Sem backend próprio, tudo via Google Apps Script.

## Estrutura de arquivos
meu-dashboard/
  react-dashboard-creation/   (Root Directory no Vercel)
    src/
      App.jsx                 (Dashboard principal + sidebar)
      Estatisticas.jsx        (Aba estatísticas do diário de trades)
      Estudos.jsx             (Aba estudos Al Brooks: quiz, resumos, assistente)
    package.json              (inclui recharts)
    vite.config.js
    vercel.json               (buildCommand: npm run build)

## Sidebar (ordem atual)
1. Dashboard / 2. Estatísticas / 3. Registros / 4. Hábitos / 5. Estudos / 6. Replays / 7. Configurações

## O que está funcionando
- Dashboard com dados reais via Google Forms/Sheets
- Calendário de consistência interativo (clique filtra cards do dia)
- Meu Dia Ontem
- Streaks com PR para estudos e rotinas de mercado
- Modo escuro/claro
- Aba Estatísticas: resultado por conta (ION 2 e MIDE 2), taxa de acerto, RxR, Stop Médio, gráfico de patrimônio acumulado, performance por setup, erros por categoria, top 3 técnicos e emocionais, filtro de data
- Aba Estudos: resumos markdown (E-book e Padrões de Abertura), quiz de 20 perguntas com revisão de erros

## O que está pendente / com problema
- Aba Estudos: tela azul e apertada (não usa o tema do dashboard)
- Aba Estudos: assistente IA com erro de CORS (API Anthropic não aceita chamadas diretas do browser)
- Aba Estudos: visualizador de PDFs não implementado
- System prompt do assistente precisa ser atualizado com conteúdo completo dos PDFs

## Decisões técnicas importantes
- Editar código: GitHub web editor, Vercel auto-deploya em 1-2 min
- Root Directory no Vercel: react-dashboard-creation
- Headers do diário estão na linha 4 (índice 3), dados a partir da linha 5 (slice 4)
- Contas válidas no diário: "ion 2" e "mide 2" (minúsculas no filtro)
- RxR = mediaGain dividido por mediaLoss (valor absoluto)
- Stop Médio = média do riscoFinanc em todos os trades
- Risco WIN: (stop * ctts) / 5
- Risco WDO: stop * 10 * ctts

## Tema visual
- Cor principal: #4ecb8d
- Fonte: Plus Jakarta Sans
- Modo claro/escuro com objetos LIGHT e DARK no App.jsx
- Sempre passar th como prop para componentes filhos usarem o tema

## Como editar o código
1. Acessa github.com/hsouzabl-bit/meu-dashboard
2. Navega até react-dashboard-creation/src/
3. Clica no arquivo desejado
4. Clica no lápis
5. Edita com Ctrl+H para buscar e substituir
6. Clica em Commit changes
7. Aguarda 1-2 min e o Vercel atualiza automaticamente
