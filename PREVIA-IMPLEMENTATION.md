# Sistema de Prévia - Implementação MVP Nexus

## Status: EM IMPLEMENTAÇÃO

O sistema completo de prévias conforme especificação requer:

### Componentes Principais

1. **Estrutura de Dados** ✅ Implementado
   - Campo `apoio` adicionado às ocorrências
   - Subestrutura `previa` com countdown
   - Histórico de prévias

2. **HTML do Card** ⏳ Pendente
   - Seção `.card-eta-section`
   - Estado vazio (botão "Definir Prévia")
   - Display com countdown

3. **Modal de Prévia** ⏳ Pendente
   - Formulário de definição
   - Atalhos rápidos (10, 15, 20, 30 min)
   - Preview da chegada

4. **CSS** ⏳ Pendente
   - Estados visuais (azul/laranja/vermelho)
   - Animações de pulso
   - Responsividade

5. **JavaScript** ⏳ Pendente
   - Countdown em tempo real
   - Reordenação automática
   - Notificações

## Próximos Passos

Devido à extensão da especificação (~15k palavras), a implementação será incremental:

1. Adicionar HTML da seção de prévia nos cards
2. Criar modal de definir/editar prévia
3. Implementar CSS dos estados visuais
4. Adicionar JavaScript de countdown
5. Implementar reordenação automática
6. Adicionar notificações

## Mock Data Atual

A ocorrência ID 1 já possui dados de prévia para demonstração:
- Apoio: OnSystem
- Tempo: 15 minutos (chegando em ~10 min)
- Status: próximo (laranja)

## Arquivos Afetados

- `script.js` - Estrutura de dados atualizada ✅
- `index.html` - Adicionar HTML dos cards ⏳
- `style.css` - Adicionar estilos ⏳
- `script.js` - Adicionar funções ⏳
