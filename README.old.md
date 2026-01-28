# 🚀 Nexus - Investigação de Apropriação Indébita

**Versão:** 2.0 - Rebranding Mottu Oficial  
**Status:** ✅ Produção  
**Data:** 28 de Janeiro de 2026

Sistema avançado de gerenciamento de ocorrências de motos com mapa interativo, chat centralizado e identidade visual oficial Mottu.

---

## 🎨 Rebranding Mottu v2.0

### Nova Paleta Oficial
- **Verde Mottu:** `#00D95F` (cor primária)
- **Verde Light:** `#00FF6E` (hover)
- **Verde Dark:** `#00B84F` (pressed)
- **Verde Glow:** `rgba(0, 217, 95, 0.3)` (shadows)

### Componentes Redesenhados
- ✅ **Botões:** Sistema completo com glow verde e microinterações
- ✅ **Cards:** Gradients, borders verdes, transforms ao hover
- ✅ **Drawers:** Header com borda verde, scrollbar customizada
- ✅ **Tabs:** Verde sólido quando ativa com after element
- ✅ **Modal de Chat:** 600×700px centralizado com avatares
- ✅ **Inputs:** Focus com glow verde e background translúcido
- ✅ **Marcadores:** Cores por prioridade com glow effects

**Documentação completa:** [REBRANDING-MOTTU.md](REBRANDING-MOTTU.md)

---

## 🚀 Como usar
1. Abra `index.html` em um servidor estático (ex.: Live Server do VS Code) para evitar restrições de CORS do Leaflet.
2. Utilize a barra de busca e os filtros de status/prioridade para filtrar ocorrências.
3. Use os botões "Ocorrências" ou "Filtros" para abrir os painéis laterais.
4. Clique em "Criar ocorrência" para adicionar uma ocorrência fictícia; ela aparecerá centralizada no mapa.

## ✨ Sistema de Chat por Ocorrência

### Funcionalidades Implementadas

#### 🔔 **Notificações e Badges**
- Badge visual com contador de mensagens não lidas no botão "Chat"
- Animação sutil de "pulse" quando há mensagens pendentes
- Indicador de status da central (🟢 Online / 🔴 Offline)
- Badge desaparece automaticamente ao abrir o chat

#### 💬 **Modal Lateral Completo**
- Drawer desliza da direita com animação suave (500px de largura)
- **Header informativo:**
  - Placa do veículo e ID da ocorrência
  - Badge de status (Em Atendimento, Analisado, Encerrado)
  - Indicador em tempo real do status da central
- **Área de mensagens:**
  - Agrupamento automático por data (Hoje, Ontem, DD/MM/YYYY)
  - Scroll automático para mensagens mais recentes
  - Identificação clara:
    - 👤 **Você** (analista) - fundo verde, alinhado à direita
    - 🎧 **Central de Apoio** - fundo azul, alinhado à esquerda
  - Timestamp relativo (HH:mm)
- **Input de mensagem:**
  - Textarea com auto-resize
  - Enter para enviar, Shift+Enter para quebra de linha
  - Botão de envio com ícone

#### 📎 **Sistema de Anexos**
- **Upload de arquivos:**
  - Imagens: jpg, png, gif (preview inline)
  - Documentos: pdf, doc, docx
  - Validação de tamanho (máx 10MB por arquivo)
  - Upload múltiplo suportado
- **Preview antes de enviar:**
  - Thumbnail para imagens
  - Ícone genérico para documentos
  - Nome e tamanho do arquivo visíveis
  - Botão para remover anexos antes do envio
- **Visualização de anexos recebidos:**
  - Imagens: preview clicável em tamanho real
  - Documentos: card com nome, tamanho e botão de download
  - Integrado nas mensagens do histórico

#### 🤖 **Simulação Inteligente**
- Respostas automáticas da central após 2-5 segundos
- Variedade de respostas contextuais
- Atualização em tempo real do badge e contador
- Mock de anexo de imagem da central (foto do local)

### Como Usar

1. **Iniciar conversa**: Clique no botão "Chat" em qualquer card de ocorrência
2. **Enviar mensagem**: Digite no textarea e pressione Enter ou clique em "Enviar"
3. **Anexar arquivos**: Clique no ícone 📎, selecione arquivos e visualize o preview
4. **Fechar chat**: Clique no X, pressione ESC ou clique no overlay escuro
5. **Mensagens não lidas**: Badge vermelho mostra quantidade de mensagens pendentes

### Atalhos de Teclado

- **Enter**: Enviar mensagem
- **Shift+Enter**: Quebra de linha sem enviar
- **ESC**: Fechar modal de chat
- **Tab**: Navegação entre elementos (acessibilidade)

### Dados Mock Iniciais

O sistema já inclui mensagens de exemplo com anexos:
- **Ocorrência #1 (ABC-1234)**: 4 mensagens (2 não lidas, 1 com anexo de imagem)
- **Ocorrência #2 (ABC-1234)**: 1 mensagem

### Arquitetura Técnica

**Estrutura de Dados:**
```javascript
chatMessages = Map<occurrenceId, Array<{
  id: number,
  sender: 'analista' | 'central',
  senderName: string,
  message: string,
  timestamp: Date,
  read: boolean,
  attachments: Array<{
    type: 'image' | 'file',
    name: string,
    url: string, // data URL ou blob URL
    size: string
  }>
}>>
```

**Funções Principais:**
- `openChatModal(occId, occ)` - Abre modal lateral com overlay
- `setupChatModalListeners(modal, overlay, occId)` - Configura event listeners
- `handleFileUpload(files, modal)` - Processa upload com validação e preview
- `renderChatMessage(msg)` - Renderiza mensagem com anexos
- `groupMessagesByDate(messages)` - Agrupa mensagens por data
- `refreshChatMessages(modal, occId)` - Atualiza lista de mensagens
- `simulateCentralChatResponse(occId, modal)` - Simula resposta automática
- `markMessagesAsRead(occId)` - Marca mensagens como lidas e remove badge

### Características Técnicas

✅ **Overlay escuro** (80% opacidade) bloqueia interação com resto da página  
✅ **Trap focus** dentro do modal para acessibilidade  
✅ **Validação de arquivos** (tipo e tamanho)  
✅ **Preview de imagens** antes do envio  
✅ **Auto-scroll** para última mensagem  
✅ **Agrupamento por data** com separadores visuais  
✅ **Base64 encoding** para armazenamento de anexos  
✅ **Responsivo** - fullscreen em mobile  
✅ **ARIA labels** para acessibilidade  
✅ **Animações suaves** em todas as transições  

### Integração com Sistema Existente

- **Modal de Detalhes**: Fecha automaticamente ao abrir chat (não coexistem)
- **Drawer de Ocorrências**: Permanece aberto ao fundo
- **Badges**: Sincronizados com contador de não lidas
- **Histórico**: Mantido por ocorrência independentemente

## Tecnologias
- HTML, CSS, JavaScript (vanilla)
- Leaflet (CDN) para o mapa e marcadores
- Lucide Icons para ícones

## Notas
- Dados de ocorrências são mockados em memória (arquivo `script.js`).
- Marcadores são re-renderizados a cada filtro e mostram popups com detalhes.
- Sistema de chat é completamente isolado por ocorrência (cada card tem seu próprio thread).
