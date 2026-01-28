# 💬 Sistema de Chat por Ocorrência - Documentação Completa

## 🎯 Visão Geral

Sistema de comunicação em tempo real entre analistas e central de apoio, integrado aos cards de ocorrências. Cada ocorrência tem seu próprio canal de chat isolado.

---

## ✨ Funcionalidades

### 1. **Mini-Chat Inline** ✅ (Solução Principal)

**Como funciona:**
- Ao clicar no botão "Chat", o card **expande verticalmente**
- Área de chat aparece dentro do próprio card
- Mostra as últimas 3-5 mensagens
- Input compacto para respostas rápidas

**Vantagens:**
- ✅ Mantém contexto visual dos outros cards
- ✅ Respostas rápidas sem perder foco
- ✅ Não cobre outras informações importantes
- ✅ Experiência fluida e não-invasiva

**Quando usar:**
- Mensagens rápidas e objetivas
- Checagens de status
- Confirmações simples

---

### 2. **Modal Lateral Completo** ✅ (Alternativa)

**Como funciona:**
- Drawer desliza da direita da tela
- Mostra header com placa/ID da ocorrência
- Histórico completo de todas as mensagens
- Interface dedicada para conversas longas

**Vantagens:**
- ✅ Mais espaço para ler histórico
- ✅ Ideal para conversas complexas
- ✅ Foco total na comunicação
- ✅ Não modifica layout dos cards

**Quando usar:**
- Conversas longas (>5 mensagens)
- Revisão de histórico completo
- Discussões detalhadas sobre o caso

---

## 🔔 Sistema de Notificações

### Badge de Mensagens Não Lidas
```
┌──────────────┐
│  Chat [3]    │  ← Badge vermelho com contador
└──────────────┘
```

- **Vermelho vibrante** com número de mensagens
- **Animação pulse** para chamar atenção
- **Desaparece automaticamente** ao abrir o chat
- **Posicionamento absoluto** no canto superior direito do botão

### Indicador de Status da Central
```
● Online   (verde pulsante)
● Offline  (cinza)
```

---

## 🎨 Identificação Visual

### Mensagens do Analista (Você)
```
┌────────────────────────────────┐
│ 👤 Você              08:25     │
│                                │
│ Preciso de confirmação sobre  │
│ o bloqueio do veículo.         │
└────────────────────────────────┘
```
- Fundo verde claro (`rgba(0, 255, 65, 0.08)`)
- Alinhada à direita (margem esquerda)
- Ícone de usuário

### Mensagens da Central de Apoio
```
┌────────────────────────────────┐
│ 🎧 Central           08:27     │
│                                │
│ Bloqueio confirmado. Equipe    │
│ a caminho. ETA: 15 minutos.    │
└────────────────────────────────┘
```
- Fundo azul claro (`rgba(59, 130, 246, 0.08)`)
- Alinhada à esquerda (margem direita)
- Ícone de headset

---

## 📊 Estrutura de Dados

### Objeto de Mensagem
```javascript
{
  id: 1,                        // ID único da mensagem
  sender: 'analista',           // 'analista' ou 'central'
  message: 'Texto da mensagem', // Conteúdo
  timestamp: Date,              // Data/hora
  read: false                   // Status de leitura
}
```

### Armazenamento
```javascript
// Map com chave = occurrenceId, valor = Array de mensagens
chatMessages = Map<number, Message[]>

// Exemplo:
chatMessages.set(1, [
  { id: 1, sender: 'central', message: 'Equipe a caminho...', ... },
  { id: 2, sender: 'analista', message: 'Entendido...', ... }
])
```

---

## 🚀 API de Uso

### Abrir Chat Inline
```javascript
toggleInlineChat(occurrenceId)
```

### Enviar Mensagem
```javascript
sendChatMessage(occurrenceId)
// Automaticamente:
// - Adiciona mensagem ao histórico
// - Limpa textarea
// - Atualiza interface
// - Simula resposta da central (2-5s)
```

### Abrir Modal Completo
```javascript
openFullChatModal(occurrenceId)
```

### Marcar Mensagens como Lidas
```javascript
markMessagesAsRead(occurrenceId)
// Automaticamente remove badge
```

---

## 🎯 Casos de Uso

### Cenário 1: Confirmação Rápida
```
Analista: Veículo está bloqueado?
Central:  Sim, bloqueio ativo desde 08:00
Analista: OK, obrigado
```
→ **Usar mini-chat inline**

### Cenário 2: Discussão Complexa
```
Analista: Endereço do GPS diverge do cadastro.
          Qual endereço validar?
Central:  Analisando... GPS mostra Rua A, 100
          Cadastro mostra Rua B, 200
          Histórico indica Rua A como pernoite
Analista: Entendido. Vou priorizar Rua A.
          Pode enviar equipe para lá?
Central:  Confirmado. Equipe indo para Rua A.
          ETA: 20 minutos.
```
→ **Usar modal lateral completo**

---

## 🎨 Experiência Visual

### Animações
- ✅ Slide down suave ao expandir chat inline
- ✅ Fade in das mensagens
- ✅ Pulse no badge de notificações
- ✅ Glow sutil no botão com mensagens não lidas
- ✅ Drawer lateral deslizando da direita

### Responsividade
- Desktop: Drawer lateral com 450px de largura
- Mobile: Drawer ocupa 100% da tela

### Acessibilidade
- ✅ Atalho de teclado: `Ctrl+Enter` para enviar
- ✅ Focus automático no textarea ao abrir
- ✅ Scroll automático para última mensagem
- ✅ ARIA labels apropriados

---

## 🔧 Configurações Técnicas

### Formato de Timestamp
```javascript
// Menos de 1 min:  "agora"
// Menos de 1h:     "15m atrás"
// Menos de 1 dia:  "08:25"
// Mais de 1 dia:   "28/01"
```

### Limite de Mensagens Inline
- Exibe últimas **5 mensagens**
- Link "Ver conversa completa" quando > 5

### Simulação de Resposta
- Delay: **2-5 segundos** (aleatório)
- Respostas variadas e contextuais
- Marcação automática como não lida

---

## 📱 Interface Mobile

### Ajustes Responsivos
```css
@media (max-width: 768px) {
  .chat-drawer {
    width: 100%;        /* Ocupa tela inteira */
    right: -100%;       /* Slide completo */
  }
}
```

---

## 🛠️ Customização Futura

### Possíveis Melhorias
1. **Envio de arquivos/imagens**
   - Anexar fotos do local
   - Documentos relevantes

2. **Histórico persistente**
   - Salvar em localStorage/backend
   - Sincronização entre sessões

3. **Notificações sonoras**
   - Alerta ao receber mensagem
   - Configurável pelo usuário

4. **Status de digitação**
   - "Central está digitando..."
   - Feedback em tempo real

5. **Reações rápidas**
   - 👍 👎 ✅ ❌
   - Sem necessidade de texto

6. **Busca no histórico**
   - Filtrar por palavra-chave
   - Navegação rápida

---

## ✅ Checklist de Implementação

- [x] Estrutura de dados (Map de mensagens)
- [x] Botão de chat nos cards
- [x] Badge de notificações
- [x] Mini-chat inline expansível
- [x] Modal lateral completo
- [x] Envio de mensagens
- [x] Simulação de respostas
- [x] Marcar como lida
- [x] Identificação visual (analista vs central)
- [x] Animações e transições
- [x] Responsividade mobile
- [x] Atalhos de teclado
- [x] Documentação completa

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema de chat, consulte o código em:
- **JavaScript**: `script.js` (linhas com `=== SISTEMA DE CHAT ===`)
- **CSS**: `style.css` (linhas com `===== SISTEMA DE CHAT =====`)

---

**Desenvolvido com ❤️ para otimizar a comunicação entre analistas e central de apoio.**
