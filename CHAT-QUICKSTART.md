# 🚀 Guia Rápido - Sistema de Chat

## Como Usar o Chat em 3 Passos

### 1️⃣ Abrir o Chat
```
Clique no botão "Chat" em qualquer card de ocorrência
↓
Modal lateral desliza da direita (500px)
Overlay escuro cobre o resto da tela
```

### 2️⃣ Enviar Mensagem
```
Digite no campo de texto
↓
Pressione "Enter" para enviar (Shift+Enter para quebra de linha)
↓
Central responde automaticamente em 2-5 segundos
```

### 3️⃣ Anexar Arquivos (opcional)
```
Clique no ícone 📎
↓
Selecione imagens ou documentos (até 10MB cada)
↓
Veja o preview antes de enviar
```

---

## 🔔 Notificações

### Badge Vermelho
- Aparece quando há mensagens não lidas da central
- Mostra o número de mensagens pendentes
- Desaparece ao abrir o chat

### Exemplo Visual
```
┌─────────────────────┐
│  Chat [2]           │  ← 2 mensagens não lidas
└─────────────────────┘
```

---

## 💡 Dicas e Atalhos

✅ **Enter** → Enviar mensagem  
✅ **Shift+Enter** → Quebra de linha sem enviar  
✅ **ESC** → Fechar chat  
✅ **📎** → Anexar arquivos (imagens/PDFs)  
✅ **Auto-scroll** → Sempre mostra a mensagem mais recente  
✅ **Agrupamento por data** → "Hoje", "Ontem", "DD/MM/YYYY"  

---

## 🎯 Ocorrências com Chat Ativo

No sistema atual, existem mensagens mock nas seguintes ocorrências:

- **Ocorrência #1 (ABC-1234)**: 4 mensagens (2 não lidas) ⚠️
  - Inclui anexo de imagem enviado pela central
- **Ocorrência #2 (ABC-1234)**: 1 mensagem ✅

**Teste clicando no botão "Chat" em qualquer card!**

---

## 🎨 Identificação de Mensagens

| Tipo | Ícone | Cor | Alinhamento |
|------|-------|-----|-------------|
| **Você (Analista)** | 👤 | Verde | Direita |
| **Central de Apoio** | 🎧 | Azul | Esquerda |

---

## 📎 Sistema de Anexos

### Tipos Suportados
- **Imagens**: JPG, PNG, GIF
- **Documentos**: PDF, DOC, DOCX

### Limites
- Tamanho máximo: **10 MB por arquivo**
- Upload múltiplo: **Sim**

### Preview Automático
- **Imagens**: Thumbnail clicável
- **Documentos**: Ícone + nome + tamanho

---

## ⚡ Ações Rápidas

| Ação | Como Fazer |
|------|-----------|
| Abrir chat | Clique no botão "Chat" |
| Fechar chat | Clique no "×", ESC ou no overlay |
| Enviar mensagem | Digite e pressione Enter |
| Quebra de linha | Shift + Enter |
| Anexar arquivo | Clique no ícone 📎 |
| Remover anexo | Clique no × no preview |
| Download anexo | Clique no ícone de download na mensagem |

---

## 📱 Interface do Modal

```
┌────────────────────────────────────┐
│ Header                             │
│ [X] Placa: ABC-1234 #OC-1          │
│ Status: Em Atendimento             │
│ 🟢 Central Online                  │
├────────────────────────────────────┤
│                                    │
│ ── Hoje ──                         │
│                                    │
│ 👤 Você - 14:30                    │
│ Preciso de confirmação sobre       │
│ o bloqueio do veículo.             │
│                                    │
│ 🎧 Central - 14:32                 │
│ Confirmado. Bloqueio ativo         │
│ desde 08:00h.                      │
│ [📷 foto-local.jpg (2.3 MB)]       │
│                                    │
├────────────────────────────────────┤
│ Footer - Input                     │
│ [📎] [Textarea...] [Enviar]        │
└────────────────────────────────────┘
```

---

## 🎯 Status da Central

### Indicadores Visuais
- 🟢 **Verde** = Online (pulsante)
- 🔴 **Vermelho** = Offline
- 🟡 **Amarelo** = Ausente (futuro)

---

## 🔥 Recursos Avançados

### Agrupamento por Data
Mensagens são automaticamente agrupadas:
- **Hoje** (mensagens de hoje)
- **Ontem** (mensagens de ontem)
- **28/01/2026** (datas anteriores)

### Auto-resize do Textarea
O campo de texto cresce automaticamente conforme você digita (até 150px de altura).

### Validação de Upload
- ✅ Verifica tamanho do arquivo (máx 10MB)
- ✅ Mostra mensagem de erro se exceder
- ✅ Preview em tempo real
- ✅ Possibilidade de remover antes de enviar

---

## 📊 Exemplo de Fluxo Completo

```
1. Usuário abre drawer "Ocorrências"
2. Vê badge [2] no botão Chat da ocorrência #1
3. Clica em "Chat"
4. Modal desliza da direita com overlay escuro
5. Vê 4 mensagens agrupadas por "Hoje"
6. Badge desaparece (mensagens marcadas como lidas)
7. Usuário digita: "Qual o status da equipe?"
8. Pressiona Enter
9. Mensagem aparece alinhada à direita (verde)
10. Após 3 segundos, central responde automaticamente
11. Mensagem da central aparece à esquerda (azul)
12. Usuário clica em 📎 para anexar foto
13. Seleciona arquivo, vê preview
14. Clica em Enviar
15. Mensagem com anexo é enviada
16. Usuário pressiona ESC para fechar
```

---

**Pronto! Agora você pode se comunicar eficientemente com a central de apoio! 🎉**

---

## 🆘 Solução de Problemas

**P: Badge não desaparece após abrir chat**  
R: Aguarde alguns instantes. O sistema marca mensagens como lidas automaticamente.

**P: Não consigo enviar arquivo grande**  
R: Limite máximo é 10MB. Reduza o tamanho do arquivo.

**P: Como fechar o chat rapidamente?**  
R: Pressione a tecla ESC.

**P: As mensagens não aparecem em ordem**  
R: O sistema agrupa por data automaticamente. Dentro de cada data, ordem é cronológica.

**P: Posso enviar múltiplos arquivos?**  
R: Sim! Selecione vários arquivos de uma vez ou adicione um por vez.

---

### 🎓 Dicas Profissionais

💡 Use Shift+Enter para formatar mensagens longas em múltiplas linhas  
💡 Anexe fotos do local para contexto visual  
💡 O histórico completo fica salvo por ocorrência  
💡 Cada ocorrência tem seu próprio thread independente  
💡 Modal fecha automaticamente se clicar no fundo escuro  
