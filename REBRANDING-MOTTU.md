# 🎨 Nexus - Rebranding Completo Mottu

**Data:** 28 de Janeiro de 2026  
**Versão:** 2.0 - Paleta Oficial Mottu  
**Status:** ✅ Implementado

---

## 📋 Sumário Executivo

O projeto Nexus foi completamente rebrandizado para alinhar-se à identidade visual oficial da Mottu. O verde vibrante `#00D95F` agora é o DNA visual de todas as ações primárias do sistema.

---

## 🎯 Mudanças Principais

### 1. **Nova Paleta de Cores**

#### Verde Mottu - Cor Principal
- **Verde Primário:** `#00D95F`
- **Verde Light (Hover):** `#00FF6E`
- **Verde Dark (Pressed):** `#00B84F`
- **Verde Glow:** `rgba(0, 217, 95, 0.3)`

#### Backgrounds
- **Primary:** `#0D0D0D` (quase preto)
- **Secondary:** `#1A1A1A` (cards, modais)
- **Tertiary:** `#242424` (hover states)
- **Sidebar:** `#000000` (preto total)
- **Input:** `#181818`
- **Elevated:** `#2A2A2A` (modais)

#### Textos
- **Primary:** `#FFFFFF`
- **Secondary:** `#A0A0A0`
- **Tertiary:** `#6B6B6B` (placeholders)
- **On Green:** `#000000` (texto sobre verde Mottu)

#### Prioridades
- **Alta:** `#FF4D4D` (vermelho vibrante)
- **Média:** `#FFB020` (laranja)
- **Baixa:** `#5B9FFF` (azul)

#### Estados
- **Success:** `#00D95F`
- **Error:** `#FF4D4D`
- **Warning:** `#FFB020`
- **Info:** `#5B9FFF`

---

### 2. **Sistema de Botões Redesenhado**

#### Botão Primário (Verde Mottu)
```css
.btn-primary {
  background: var(--mottu-green);
  color: var(--text-on-green);
  box-shadow: 
    var(--shadow-sm),
    var(--shadow-green);
}
```
**Características:**
- Verde `#00D95F` como cor base
- Glow verde ao hover
- Transform translateY(-2px) ao hover
- Uppercase text
- Letter-spacing de 0.3px

#### Botão Secundário / Outline
```css
.btn-secondary {
  background: transparent;
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  border-color: var(--mottu-green);
  color: var(--mottu-green);
  background: rgba(0, 217, 95, 0.08);
}
```

#### Botão Ícone (Compacto)
```css
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
```

#### Botão Destrutivo
```css
.btn-danger {
  background: var(--state-error);
  color: var(--text-primary);
}
```

---

### 3. **Cards de Ocorrência**

#### Design Atualizado
- **Border:** 2px solid com transição para verde Mottu ao hover
- **Background:** Gradient de `#121212` para `#161616`
- **Shadow:** Verde glow ao selecionar
- **Transform:** translateX(4px) ao hover

#### Badges de Prioridade
- **Alta:** Background vermelho com glow vermelho
- **Média:** Background laranja com glow laranja
- **Baixa:** Background azul com glow azul

#### Badges de Status
- **Em Andamento:** Gradient verde Mottu com glow
- **Analisada:** Background azul info com border
- **Encerrada:** Background verde Mottu translúcido

---

### 4. **Drawers (Painéis Laterais)**

#### Características
- **Width:** 360px
- **Border:** Verde Mottu no header (2px solid)
- **Shadow:** `var(--shadow-xl)` com glow verde
- **Animation:** Cubic-bezier(0.4, 0, 0.2, 1) 400ms
- **Handle:** Drag affordance no topo

#### Header
- Background preto total
- Borda verde Mottu na parte inferior
- Box-shadow com profundidade

#### Scrollbar Customizada
- **Track:** Background sidebar
- **Thumb:** Background tertiary
- **Thumb Hover:** Verde Mottu com glow

---

### 5. **Sistema de Tabs**

#### Tab Ativa
```css
.tab.active {
  background: var(--mottu-green);
  color: var(--text-on-green);
  box-shadow: var(--shadow-green);
}

.tab.active::after {
  content: "";
  height: 3px;
  background: var(--mottu-green);
  box-shadow: var(--shadow-green);
}
```

#### Tab Inativa Hover
```css
.tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
```

---

### 6. **Modal de Chat Centralizado** ✅

#### Especificações
- **Dimensões:** 600px × 700px (max-height: 85vh)
- **Posição:** Centralizado com overlay blur
- **Layout:** Flexbox vertical com header, body e footer fixos

#### Estrutura
1. **Header**
   - Título "Conversa com Apoio"
   - Status online com dot pulsante
   - Botão close com hover rotate

2. **Body (Chat Log)**
   - Scroll infinito
   - Mensagens com avatares
   - Separadores de data
   - Timestamps

3. **Footer (Input)**
   - Botão anexar (esquerda)
   - Textarea expansível (centro)
   - Botão enviar verde (direita)

#### Mensagens
```html
<div class="chat-message analista">
  <div class="message-avatar analista">MV</div>
  <div class="message-bubble">
    <div class="message-header">
      <span class="message-sender">Marcos Vinicio</span>
      <span class="message-time">14:32</span>
    </div>
    <div class="message-content">Mensagem aqui...</div>
  </div>
</div>
```

**Mensagem Analista (Direita):**
- Background: Gradient verde Mottu translúcido
- Border direita: 3px solid verde
- Glow verde

**Mensagem Central (Esquerda):**
- Background: Secondary
- Border esquerda: 3px solid azul info

#### Features
- ✅ Auto-resize do textarea (44px → 120px)
- ✅ Enter para enviar, Shift+Enter para nova linha
- ✅ Botão anexar com ícone
- ✅ Scroll automático ao enviar
- ✅ Simulação de resposta da central
- ✅ Animação slideIn nas mensagens

---

### 7. **Inputs e Forms**

#### Input Focus State
```css
.form-input:focus {
  border-color: var(--mottu-green);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 4px rgba(0, 217, 95, 0.15);
  background: rgba(0, 217, 95, 0.03);
}
```

#### Características
- Border: 2px solid ao invés de 1px
- Transition suave (0.3s ease)
- Glow verde ao focar
- Background levemente verde ao focar

---

### 8. **Header / Navbar**

#### Design
- **Background:** Preto total (`#000000`)
- **Height:** 64px fixo no topo
- **Border-bottom:** 1px solid com shadow
- **Z-index:** 2000

#### Elementos
- **Logo:** 40px width
- **Search Input:** 320px com focus verde
- **Recovery Manager Button:** Border verde, hover com glow

---

### 9. **Marcadores do Mapa**

#### Marcador Numerado
```css
.marker-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--mottu-green);
  border: 3px solid rgba(0, 0, 0, 0.6);
  box-shadow: var(--shadow-green);
}
```

#### Marcadores por Prioridade
- **Alta:** Background vermelho com glow vermelho
- **Média:** Background laranja com glow laranja
- **Baixa:** Background azul com glow azul

---

### 10. **Responsividade**

#### Tablet (≤ 900px)
- Drawers: 92% width
- Modal: 96vw
- Occurrences grid: 1 coluna

#### Mobile (≤ 560px)
- Header: 56px height
- Search input: 200px
- Telemetry: Coluna única
- Drawers: 100% width, border-radius 0

#### Mobile Pequeno (≤ 480px)
- Chat modal: 100vw × 100vh (fullscreen)
- Float buttons: Menor padding
- Drawers: Fullscreen

---

## 🚀 Implementação

### Arquivos Modificados

1. **`style.css`** (completamente reescrito)
   - Novas variáveis CSS
   - Sistema de botões redesenhado
   - Cards, drawers, tabs atualizados
   - Modal de chat com avatares
   - Inputs com focus verde
   - Responsividade completa

2. **`index.html`**
   - Modal de chat atualizado
   - Estrutura com avatares e timestamps
   - Botões anexar e enviar
   - Status online indicator

3. **`script.js`**
   - Função de envio de mensagem com avatares
   - Auto-resize do textarea
   - Enter para enviar
   - Simulação de resposta da central

### Arquivos Criados

1. **`style.old.css`** - Backup da versão anterior
2. **`style.backup.css`** - Backup secundário
3. **`REBRANDING-MOTTU.md`** - Esta documentação

---

## ✅ Checklist de Implementação

- [x] Substituir `#00FF00` por `#00D95F`
- [x] Atualizar todos os backgrounds
- [x] Ajustar prioridades (vermelho, laranja, azul)
- [x] Atualizar sombras com glow verde
- [x] Botões primários: verde `#00D95F`
- [x] Cards: nova paleta de backgrounds
- [x] Drawers: header com borda verde
- [x] Modal de chat: centralizado com avatares
- [x] Inputs: border verde ao focar
- [x] Badges: cores atualizadas
- [x] Chat inline: removido (confirmado sem código inline)
- [x] Modal fullscreen em mobile
- [x] Botões ajustados
- [x] Typography responsiva
- [x] Marcadores do mapa com cores de prioridade

---

## 📊 Comparação Antes vs Depois

### Antes (Versão Antiga)
- Verde: `#00FF00` (verde neon básico)
- Botões: Estilo genérico sem glow
- Cards: Borders simples
- Tabs: Background sólido
- Modal: Layout básico sem avatares
- Inputs: Focus simples

### Depois (Versão Mottu)
- Verde: `#00D95F` (verde Mottu oficial)
- Botões: Glow verde, transforms, uppercase
- Cards: Gradients, glow ao selecionar, translateX
- Tabs: Verde sólido com shadow e after element
- Modal: 600×700px, avatares, timestamps, auto-resize
- Inputs: Glow verde, background levemente verde

---

## 🎨 Affordances e Microinterações

### Hover States
- **Botões:** translateY(-2px) + glow verde
- **Cards:** translateX(4px) + border verde
- **Tabs:** background rgba(255,255,255,0.05)
- **Inputs:** glow verde + background translúcido

### Active States
- **Botões:** translateY(0) + verde escuro
- **Cards:** Selecionado com border verde
- **Tabs:** Verde sólido com after element

### Focus States
- **Todos os elementos interativos:** Ring verde com 4px
- **Inputs:** Double shadow (inset + glow)

---

## 🔧 Manutenção e Boas Práticas

### Variáveis CSS
Todas as cores estão centralizadas em variáveis CSS no `:root`. Para alterar a paleta, edite apenas as variáveis:

```css
:root {
  --mottu-green: #00D95F;
  --mottu-green-light: #00FF6E;
  --mottu-green-dark: #00B84F;
  /* ... */
}
```

### Botões
Use as classes semânticas:
- `.btn-primary` - Ações principais (verde Mottu)
- `.btn-secondary` / `.btn-outline` - Ações secundárias
- `.btn-danger` - Ações destrutivas
- `.btn-icon` - Ícones compactos
- `.btn-small` - Botões pequenos

### Modal de Chat
Para adicionar mensagens programaticamente:

```javascript
const log = document.getElementById('chat-log');
const item = document.createElement('div');
item.className = 'chat-message analista'; // ou 'central'
item.innerHTML = `
  <div class="message-avatar analista">MV</div>
  <div class="message-bubble">
    <div class="message-header">
      <span class="message-sender">Nome</span>
      <span class="message-time">14:32</span>
    </div>
    <div class="message-content">Mensagem...</div>
  </div>
`;
log.appendChild(item);
log.scrollTop = log.scrollHeight;
```

---

## 🚦 Status do Sistema de Chat

### ❌ Chat Inline (REMOVIDO)
A implementação anterior tinha chat inline expansível dentro dos cards. Esta abordagem foi **descontinuada** devido a:

**Problemas Técnicos:**
- Complexidade de estado (múltiplos chats abertos)
- Performance degradada
- Layout quebrado em mobile
- Sincronização complexa

**Problemas de UX:**
- Cards expandidos ocupavam muito espaço
- Usuário perdia contexto
- Badge de notificação não funcionava
- Textarea inline muito pequeno

### ✅ Chat Modal Centralizado (IMPLEMENTADO)
**Sistema atual:**
- Modal centralizado (600×700px)
- Um chat por vez (foco total)
- Mais espaço para mensagens
- Performance otimizada
- Layout consistente
- Mobile-friendly (fullscreen em telas pequenas)

**Fluxo:**
1. Usuário clica "Conversa" no card
2. Modal centralizado abre
3. Histórico completo da conversa
4. Campo de mensagem robusto
5. Fecha modal → retorna ao drawer

---

## 📱 Testes Recomendados

### Desktop
- [x] Hover em todos os botões
- [x] Focus em inputs
- [x] Transições suaves
- [x] Modal de chat centralizado
- [x] Drawers abrindo/fechando
- [x] Tabs ativas com borda verde

### Tablet (≤ 900px)
- [x] Drawers responsivos
- [x] Modal ajustado
- [x] Grid de ocorrências em coluna única

### Mobile (≤ 560px)
- [x] Header compacto
- [x] Chat fullscreen
- [x] Float buttons ajustados
- [x] Telemetry em coluna

---

## 🎯 Resultado Final

Sistema Nexus rebrandizado com:
- ✅ Paleta oficial Mottu (`#00D95F`)
- ✅ Chat modal centralizado (versão estável)
- ✅ Affordances claras e consistentes
- ✅ Performance otimizada
- ✅ UX simplificada e funcional
- ✅ Responsividade completa

**Verde Mottu (`#00D95F`) agora é o DNA visual de todas as ações primárias.** 🎯✨

---

## 📝 Notas de Versão

**v2.0 - Rebranding Mottu Oficial**
- Paleta de cores atualizada para padrão Mottu
- Sistema de botões redesenhado
- Modal de chat centralizado com avatares
- Inputs com glow verde ao focar
- Cards com microinterações
- Drawers com borda verde
- Tabs com background verde sólido
- Responsividade completa
- Remoção do chat inline

---

**Autor:** GitHub Copilot  
**Data:** 28 de Janeiro de 2026  
**Versão:** 2.0
