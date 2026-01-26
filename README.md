# MVP - Painel de Acionamentos de Motos

Pequeno MVP em HTML, CSS e JavaScript puro para gerenciar ocorrências de motos com mapa central e modais laterais.

## Como usar
1. Abra `index.html` em um servidor estático (ex.: Live Server do VS Code) para evitar restrições de CORS do Leaflet.
2. Utilize a barra de busca e os filtros de status/prioridade para filtrar ocorrências.
3. Use os botões "Ocorrências" ou "Filtros" para abrir os painéis laterais.
4. Clique em "Criar ocorrência" para adicionar uma ocorrência fictícia; ela aparecerá centralizada no mapa.

## Tecnologias
- HTML, CSS, JavaScript (vanilla)
- Leaflet (CDN) para o mapa e marcadores

## Notas
- Dados de ocorrências são mockados em memória (arquivo `script.js`).
- Marcadores são re-renderizados a cada filtro e mostram popups com detalhes.
