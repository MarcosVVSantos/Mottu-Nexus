# 🎨 Sistema de Design Mottu - Nexus

## 📋 Resumo da Implementação

A interface do Nexus foi completamente redesenhada seguindo a identidade visual da Mottu, com foco em:
- ✅ Verde Mottu (#00FF00) como cor primária
- ✅ Backgrounds escuros profissionais
- ✅ Affordances visuais claras
- ✅ Consistência em todos os componentes
- ✅ Acessibilidade e usabilidade

---

## 🎨 Paleta de Cores Implementada

### Cores Primárias
```css
--mottu-green-primary: #00FF00   /* Cor principal da marca */
--mottu-green-light: #33FF33     /* Versão mais clara */
--mottu-green-dark: #00CC00      /* Versão mais escura */
--mottu-green-hover: #00DD00     /* Estado hover */
```

### Backgrounds
```css
--bg-primary: #1a1a1a      /* Background principal */
--bg-secondary: #252525    /* Cards e elementos secundários */
--bg-tertiary: #2d2d2d     /* Hover states */
--bg-sidebar: #0f0f0f      /* Sidebar/headers mais escuros */
--bg-input: #1e1e1e        /* Campos de input */
```

### Textos
```css
--text-primary: #ffffff    /* Texto principal */
--text-secondary: #b0b0b0  /* Texto secundário */
--text-tertiary: #808080   /* Texto disabled/placeholder */
```

### Borders
```css
--border-primary: #333333     /* Bordas principais */
--border-secondary: #2a2a2a   /* Bordas sutis */
--border-accent: #00FF00      /* Bordas com destaque */
```

### Estados e Prioridades
```css
--state-success: #00FF00   /* Verde Mottu */
--state-error: #FF4444     /* Vermelho para erros */
--state-warning: #FFB020   /* Amarelo para avisos */
--state-info: #4A90E2      /* Azul para informações */

--priority-high: #FF4444   /* Alta - Vermelho */
--priority-medium: #FFB020 /* Média - Amarelo */
--priority-low: #4A90E2    /* Baixa - Azul */
```

### Sombras
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4)
--shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.5)
--shadow-green: 0 0 20px rgba(0, 255, 0, 0.3)
```

---

## 🔧 Componentes Redesenhados

### 1. Header/Navbar
- **Background**: `var(--bg-sidebar)` (#0f0f0f)
- **Border**: 2px solid verde Mottu
- **Logo**: Verde Mottu
- **Botões**: Verde com hover/shadow
- **Search Input**: Focus state verde com glow

### 2. Botões

#### Primário
- Background: Verde Mottu (#00FF00)
- Texto: Preto (#000000)
- Hover: Scale 1.05 + shadow verde
- Box-shadow: `var(--shadow-green)`

#### Secundário (Outline)
- Background: Transparente
- Border: `var(--border-primary)`
- Hover: Border verde + background rgba(0,255,0,0.05)

#### Ícone
- Background: `var(--bg-secondary)`
- Hover: Verde com glow e transform scale

### 3. Cards de Ocorrência
- Background: `var(--bg-secondary)`
- Border: `var(--border-primary)`
- Hover: Transform translateX(4px) + border verde
- Selected: Border verde + shadow verde

#### Badges de Prioridade
- **Alta**: Vermelho (#FF4444) com fundo rgba(255,68,68,0.2)
- **Média**: Amarelo (#FFB020) com fundo rgba(255,176,32,0.2)
- **Baixa**: Azul (#4A90E2) com fundo rgba(74,144,226,0.2)

### 4. Drawers (Info e Ocorrências)
- Background: `var(--bg-primary)`
- Header: `var(--bg-sidebar)` + border verde 2px
- Handle: Verde Mottu com opacity 0.5
- Cards internos: `var(--bg-secondary)`

### 5. Tabs
- Active: Background verde Mottu + texto preto
- Hover: Background rgba(0,255,0,0.1)
- Border-radius: 6px

### 6. Forms e Inputs
- Background: `var(--bg-input)`
- Border: `var(--border-primary)`
- Focus: Border verde + shadow verde (3px)
- Placeholder: `var(--text-tertiary)`

### 7. Chat Inline
- Container: `var(--bg-sidebar)`
- Border-top: 2px verde Mottu
- Header: Verde com status online pulsante

#### Mensagens
- **Central (esquerda)**: Gradiente cinza + borda azul esquerda
- **Analista (direita)**: Gradiente verde + borda verde direita + glow

#### Input
- Background: `var(--bg-input)`
- Botão enviar: Verde Mottu + ícone send
- Botão anexar: `var(--bg-secondary)` com hover verde

### 8. Modais
- Background: `var(--bg-primary)`
- Header: `var(--bg-sidebar)` + border verde 2px
- Backdrop: rgba(0,0,0,0.8) + blur 4px
- Footer: `var(--bg-secondary)`

### 9. Scrollbars
- Track: `var(--bg-sidebar)`
- Thumb: `var(--bg-tertiary)`
- Hover: Verde Mottu + glow

---

## ✨ Affordances Aplicadas

### 1. Cor Verde = Ação Principal
- Todos os botões primários em verde
- Indica a ação mais importante
- Sempre com shadow verde

### 2. Bordas com Glow = Elemento Ativo
- Box-shadow verde em elementos selecionados
- Borda verde em elementos com foco
- Feedback visual claro de estado

### 3. Gradientes Sutis = Profundidade
- Mensagens do chat com gradiente sutil
- Cria hierarquia visual
- Não polui a interface

### 4. Animações de Hover = Interatividade
- Transform scale em botões (1.05)
- TranslateX em cards (4px)
- Indica que elemento é clicável

### 5. Ícones Lucide = Comunicação Visual
- Sempre com cor consistente
- Tamanho: 18px (padrão)
- Cor muda para verde no hover

### 6. Badges Coloridos = Status/Prioridade
- **Alta**: Vermelho (urgente)
- **Média**: Amarelo (atenção)
- **Baixa**: Azul (informação)
- **Verde**: Sucesso/Online

---

## 📱 Responsividade

### Mobile (max-width: 768px)
- Chat height: 280px (em vez de 400px)
- Mensagens max-width: 85%
- Botão enviar: apenas ícone

### Tablet (max-width: 900px)
- Modal body: 1 coluna
- Drawers: full width

---

## 🎯 Transições e Animações

### Duração Padrão
- `0.2s ease` para a maioria dos elementos
- `0.3s ease-out` para animações de entrada

### Animações Implementadas
- **slideInLeft/Right**: Entrada de mensagens
- **pulse-online**: Status online (2s infinite)
- **slideDown**: Abertura do chat
- **Hover transforms**: scale(1.05), translateY(-1px), etc.

---

## ♿ Acessibilidade

### Focus States
- Outline verde em elementos focados
- Outline-offset: 2-3px
- Box-shadow para feedback adicional

### Contraste
- Texto principal: #ffffff em #1a1a1a (WCAG AAA)
- Verde Mottu: #00FF00 em preto (WCAG AAA)
- Botões sempre com contraste adequado

### ARIA
- Modais: role="dialog", aria-modal="true"
- Botões: aria-label quando necessário
- Estados: aria-hidden para elementos ocultos

---

## 📊 Antes e Depois

### Antes
- ❌ Cores inconsistentes (#00ff41, #00cc34, etc)
- ❌ Múltiplas variações de verde
- ❌ Sombras e borders genéricos
- ❌ Falta de padrão nos estados

### Depois
- ✅ Verde Mottu (#00FF00) consistente
- ✅ Paleta de cores unificada
- ✅ Shadow verde padronizado
- ✅ Estados claros e previsíveis

---

## 🚀 Como Usar

### Aplicar Cor Primária
```css
.btn-primary {
  background: var(--mottu-green-primary);
  color: #000000;
  box-shadow: var(--shadow-green);
}
```

### Aplicar Background
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}
```

### Aplicar Hover State
```css
.btn:hover {
  background: var(--mottu-green-hover);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  transform: scale(1.05);
}
```

### Aplicar Focus State
```css
.input:focus {
  border-color: var(--mottu-green-primary);
  box-shadow: 0 0 0 3px rgba(0, 255, 0, 0.1);
}
```

---

## 📝 Manutenção

### Adicionar Nova Cor
1. Adicionar em `:root`
2. Documentar uso
3. Testar contraste (WCAG)
4. Aplicar consistentemente

### Novo Componente
1. Usar variáveis existentes
2. Seguir padrões de affordance
3. Aplicar transições padrão
4. Testar em dark mode

### Modificar Cor Existente
1. Verificar todos os usos
2. Testar em contextos diferentes
3. Validar contraste
4. Documentar mudança

---

## ✅ Checklist de Qualidade

- [x] Verde Mottu (#00FF00) como cor primária em todos botões principais
- [x] Backgrounds escuros (#1a1a1a) como base
- [x] Affordances claras em elementos interativos
- [x] Hover states com feedback visual
- [x] Focus states acessíveis
- [x] Scrollbars customizados
- [x] Animações suaves
- [x] Contraste adequado
- [x] Responsividade
- [x] Consistência visual

---

## 📚 Referências

- **Paleta Mottu**: Extraída da identidade visual oficial
- **Affordances**: Material Design + Apple HIG
- **Acessibilidade**: WCAG 2.1 Level AA
- **Animações**: Framer Motion patterns

---

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA**

Todos os componentes do Nexus agora seguem o sistema de design Mottu com consistência visual, affordances claras e excelente usabilidade.
