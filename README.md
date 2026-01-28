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
3. Use os botões flutuantes "Info" ou "Ocorrências" para abrir os drawers laterais.
4. Clique em "+ Nova Ocorrência" para adicionar uma ocorrência fictícia; ela aparecerá centralizada no mapa.
5. Clique no botão "Conversa" no modal de detalhes para abrir o chat centralizado.

---

## 💬 Sistema de Chat Centralizado (v2.0)

### ✅ Modal Centralizado Implementado

**Especificações:**
- **Dimensões:** 600px × 700px (85vh max-height)
- **Posição:** Centralizado com overlay blur
- **Layout:** Flexbox vertical com header fixo, body scrollável e footer fixo

### Características

#### 🎨 Design
- Background elevado (`#2A2A2A`)
- Border verde Mottu no header (2px solid)
- Glow verde suave no shadow
- Animação de entrada cubic-bezier suave

#### 👤 Mensagens com Avatares

**Mensagem do Analista (Direita):**
- Avatar circular com iniciais do usuário
- Background: Gradient verde Mottu (`#00D95F` → `#00B84F`)
- Border direita: 3px solid verde
- Alinhamento flex-end (direita)

**Mensagem da Central (Esquerda):**
- Avatar circular "CT"
- Background: Gradient azul info (`#5B9FFF` → `#4A7FD9`)
- Border esquerda: 3px solid azul
- Alinhamento flex-start (esquerda)

#### ⚡ Features
- ✅ **Auto-resize do textarea:** 44px → 120px max
- ✅ **Enter para enviar:** Shift+Enter para nova linha
- ✅ **Botão anexar arquivo:** Ícone paperclip (esquerda)
- ✅ **Scroll automático:** Ao enviar mensagem
- ✅ **Timestamps:** Formatados (HH:mm)
- ✅ **Separadores de data:** Hoje, Ontem, DD/MM/YYYY
- ✅ **Status online:** Dot pulsante verde
- ✅ **Simulação de resposta:** Central responde automaticamente (demo)

#### 🔄 Fluxo de Uso
1. Usuário clica botão "Conversa" no modal de detalhes
2. Modal centralizado abre com histórico completo
3. Usuário digita mensagem no textarea
4. Enter ou clique em "Enviar" → mensagem é adicionada com avatar
5. Central responde automaticamente após 1.5s (simulação)
6. ESC ou "X" → fecha modal

### ❌ Chat Inline (Removido)

A versão anterior tinha chat inline expansível dentro dos cards. Esta abordagem foi **descontinuada** devido a:

**Problemas:**
- ❌ Complexidade de estado (múltiplos chats abertos simultaneamente)
- ❌ Performance degradada com muitas ocorrências
- ❌ Layout quebrado em mobile com cards expandidos
- ❌ Badge de notificação não funcionava corretamente
- ❌ Textarea inline muito pequeno para conversas longas

**Solução Atual:**
✅ Modal centralizado com foco total na conversa  
✅ Um chat por vez (melhor experiência)  
✅ Mais espaço para mensagens e anexos  
✅ Performance otimizada  
✅ Layout consistente (não expande cards)  
✅ Mobile-friendly (fullscreen em telas pequenas)

---

## ✨ Funcionalidades Principais

### 🗺️ Mapa Interativo (Leaflet)
- Visualização de todas as ocorrências
- Marcadores numerados por ordem cronológica
- Cores por prioridade (vermelho, laranja, azul)
- Popups com informações detalhadas
- Botão centralizar no mapa

### 📊 Cards de Ocorrência
- **Badges de prioridade:** Alta (vermelho), Média (laranja), Baixa (azul)
- **Telemetria:** Bateria, GPS, último ping
- **Botões de ação:** Detalhes, Apoio
- **Hover effects:** Transform translateX(4px) + glow verde
- **Estado selecionado:** Border verde com shadow

### 🚪 Drawers Laterais

#### Drawer Info (Esquerda)
- Informações do veículo
- Endereços pertinentes (pernoite, cadastro, satélite)
- Contatos com hierarquia
- Timeline de insucessos (indicadores de campo)

#### Drawer Ocorrências (Direita)
- **Tabs:** Em Andamento | Histórico
- Lista de cards de ocorrência
- Filtros por placa
- Botão "+ Nova Ocorrência"

### 🎯 Modal de Detalhes
- **3 colunas:** Status | Informações Adicionais | Questionário
- **Telemetria completa:** Bateria (principal + backup), GPS, violação
- **Comentários editáveis:** Notas do agente
- **Botões:** Acionar apoio | Conversa | Salvar alterações

### 🆘 Modal de Apoio
- Select com tipos de apoio:
  - sem envio de apoio
  - carro interno
  - onsystem
  - selva
  - ativa
  - i2
- Histórico de acionamentos

---

## 🎨 Sistema de Design Mottu

### Botões

#### Primário (Verde Mottu)
```css
background: #00D95F;
color: #000000;
box-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 24px rgba(0,217,95,0.3);
```

#### Secundário / Outline
```css
background: transparent;
border: 2px solid #2A2A2A;
color: #FFFFFF;
```
**Hover:** Border verde, color verde, background rgba(0,217,95,0.08)

#### Ícone
```css
width: 40px;
height: 40px;
border-radius: 8px;
```

### Cores de Prioridade
- **Alta:** `#FF4D4D` (vermelho vibrante)
- **Média:** `#FFB020` (laranja)
- **Baixa:** `#5B9FFF` (azul)

Cada prioridade tem seu background translúcido (15% opacity) e glow effect.

### Affordances e Microinterações
- **Hover:** translateY(-2px) ou translateX(4px) + glow
- **Active:** translateY(0) + verde escuro
- **Focus:** Ring verde com 4px
- **Transições:** 200-250ms cubic-bezier(0.4, 0, 0.2, 1)

---

## 📱 Responsividade

### Tablet (≤ 900px)
- Drawers: 92% width
- Modal de detalhes: 96vw
- Grid de ocorrências: 1 coluna

### Mobile (≤ 560px)
- Header: 56px height
- Search input: 200px width
- Telemetry: Coluna única
- Float buttons: Padding reduzido

### Mobile Pequeno (≤ 480px)
- **Chat modal:** 100vw × 100vh (fullscreen)
- **Drawers:** Fullscreen sem border-radius
- **Float buttons:** 10px margin

---

## 🛠️ Tecnologias

- **HTML5:** Estrutura semântica
- **CSS3:** Variables, Grid, Flexbox, Animations
- **JavaScript (Vanilla):** ES6+, Modules pattern
- **Leaflet.js:** Mapas interativos
- **Lucide Icons:** Ícones SVG

---

## 📂 Estrutura de Arquivos

```
MVP-Nexus/
├── index.html              # Página principal
├── style.css               # CSS rebrandizado (v2.0)
├── style.old.css           # Backup da versão anterior
├── style.backup.css        # Backup secundário
├── script.js               # Lógica da aplicação
├── README.md               # Este arquivo
├── REBRANDING-MOTTU.md     # Documentação completa do rebranding
├── logo.png                # Logo Mottu (placeholder)
└── .github/
    └── copilot-instructions.md
```

---

## 🔧 Desenvolvimento

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (Live Server, Python HTTP Server, etc.)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mvp-nexus.git

# Navegue até o diretório
cd mvp-nexus

# Abra com Live Server (VS Code)
# Ou inicie um servidor Python
python -m http.server 8000
```

### Acessar
```
http://localhost:8000/index.html
```

---

## 📝 Changelog

### v2.0 (28/01/2026) - Rebranding Mottu Oficial
- ✅ Paleta de cores atualizada para padrão Mottu (`#00D95F`)
- ✅ Sistema de botões redesenhado com glow verde
- ✅ Modal de chat centralizado (600×700px) com avatares
- ✅ Inputs com glow verde ao focar
- ✅ Cards com microinterações (translateX + glow)
- ✅ Drawers com borda verde Mottu no header
- ✅ Tabs com background verde sólido ao ativar
- ✅ Responsividade completa (tablet e mobile)
- ✅ Remoção do chat inline (confirmado sem código inline)
- ✅ Scrollbar customizada em todos os containers
- ✅ Auto-resize do textarea de chat
- ✅ Enter para enviar mensagens
- ✅ Simulação de resposta da central

### v1.0 (Data anterior)
- MVP inicial com mapa interativo
- Sistema de drawers laterais
- Modal de detalhes de ocorrência
- Cards de ocorrência com filtros
- Sistema de apoio

---

## 🎯 Próximas Funcionalidades (Roadmap)

- [ ] Sistema de anexos no chat (upload de imagens e documentos)
- [ ] Badge de mensagens não lidas nos cards
- [ ] Integração com API real (backend)
- [ ] Persistência de dados (LocalStorage ou IndexedDB)
- [ ] Notificações push
- [ ] Filtros avançados
- [ ] Exportação de relatórios (PDF)
- [ ] Dark/Light mode toggle
- [ ] Histórico de atividades
- [ ] Perfil do usuário editável

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é um MVP interno para uso da equipe Mottu.

---

## 👥 Autores

- **GitHub Copilot** - Implementação do Rebranding v2.0
- **Equipe Mottu** - Especificações e requisitos

---

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

**Verde Mottu (`#00D95F`) agora é o DNA visual de todas as ações primárias.** 🎯✨
