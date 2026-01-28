const occurrences = [
  { 
    id: 1, 
    plate: 'ABC-1234', 
    status: 'em_andamento', 
    priority: 'alta', 
    description: 'Tentativa 1: motorista ausente', 
    time: '08:12', 
    coords: [-23.5489, -46.6388], 
    agentNote: 'Porta trancada.',
    apoio: {
      tipo: 'onsystem',
      acionadoEm: new Date(Date.now() - 600000).toISOString(),
      acionadoPor: 'Marcos Vinicio',
      previa: {
        tempoMinutos: 15,
        definidaEm: new Date(Date.now() - 300000).toISOString(),
        chegadaEstimada: new Date(Date.now() + 600000).toISOString(),
        ultimaAtualizacao: new Date(Date.now() - 300000).toISOString()
      },
      statusChegada: 'proximo',
      historicoPrevia: [
        {
          tempoMinutos: 20,
          definidaEm: new Date(Date.now() - 600000).toISOString(),
          motivo: 'Prévia inicial'
        },
        {
          tempoMinutos: 15,
          definidaEm: new Date(Date.now() - 300000).toISOString(),
          motivo: 'Atualização - trânsito melhorou'
        }
      ]
    }
  },
  { id: 2, plate: 'ABC-1234', status: 'em_andamento', priority: 'media', description: 'Tentativa 2: local não encontrado', time: '09:05', coords: [-23.5520, -46.6402], agentNote: 'Endereço incorreto.' },
  { id: 3, plate: 'XYZ-9090', status: 'analisada', priority: 'media', description: 'Equipe verificou, sem prova de apropriação', time: '07:40', coords: [-23.5614, -46.6559], agentNote: 'Sem evidências.' },
  { id: 4, plate: 'KLM-7765', status: 'encerrada', priority: 'baixa', description: 'Caso encerrado - veículo recuperado', time: '06:30', coords: [-23.5702, -46.6511], agentNote: 'Recuperada.' }
];

// Sistema de Chat - Contadores e Mensagens
const chatUnreadCounts = new Map(); // Map<occurrenceId, number>
const chatMessages = new Map(); // Map<occurrenceId, messages[]>
let activeChatOccId = null; // ID da ocorrência ativa no chat

// Sistema de Prévia - Variáveis Globais
let previaUpdateInterval = null; // Intervalo para atualizar countdowns

// Inicializar mock data de mensagens
function initializeChatData() {
  // Simular mensagens não lidas para demonstração
  chatUnreadCounts.set(1, 3);
  chatUnreadCounts.set(2, 0);
  chatUnreadCounts.set(3, 0);
  chatUnreadCounts.set(4, 0);
  
  // Mock de mensagens para ocorrência 1
  chatMessages.set(1, [
    {
      id: 1,
      remetente: 'central',
      nomeRemetente: 'Central de Apoio',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      texto: 'Veículo localizado. Aguardando instruções.',
      anexos: [],
      lida: false
    },
    {
      id: 2,
      remetente: 'analista',
      nomeRemetente: 'Marcos Vinicio',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      texto: 'Entendido. Há bloqueio ativo no veículo?',
      anexos: [],
      lida: true
    },
    {
      id: 3,
      remetente: 'central',
      nomeRemetente: 'Central de Apoio',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      texto: 'Sim, bloqueio confirmado. Motorista não responde chamadas.',
      anexos: [],
      lida: false
    }
  ]);
}

let map;
const markers = new Map();
let currentPlate = null;
let detailOpenOcc = null;

function getCurrentUser() {
  // try to read profile name from UI, fallback to generic label
  const el = document.querySelector('.profile-name');
  if (el && el.textContent.trim()) return el.textContent.trim();
  return 'Operador';
}

function setCurrentPlate(plate) {
  currentPlate = plate || null;
  // update visual selection in drawer
  document.querySelectorAll('.occ-card').forEach(c => {
    const p = c.querySelector('.plate')?.textContent?.trim();
    if (p && currentPlate && p === currentPlate) c.classList.add('selected'); else c.classList.remove('selected');
  });
  // if the occurrences drawer is open and historico tab is active, re-render lists
  const histTab = document.querySelector('.tab[data-tab="historico"]');
  if (histTab && histTab.classList.contains('active')) renderRightPanel();
}

function initMap() {
  const el = document.getElementById('map');
  if (!el) return console.error('#map não encontrado');

  map = L.map('map', { zoomControl: true }).setView([-23.5558, -46.6396], 13);

  // Tile layer - Light theme for maximum legibility
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
  }).addTo(map);

  L.control.scale({ position: 'bottomleft' }).addTo(map);

  renderMarkers(occurrences);

  // Close drawers when clicking on map background
  map.on('click', () => {
    const di = document.getElementById('drawer-info'); if (di) di.classList.remove('open');
    const dc = document.getElementById('drawer-occ'); if (dc) dc.classList.remove('open');
  });

  // ensure Leaflet recalculates size after layout changes
  setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 300);
}

function makeNumberIcon(n) {
  return L.divIcon({
    className: 'marker-number',
    html: `<div class="num">${n}</div>`,
    iconSize: [36,36],
    iconAnchor: [18,36]
  });
}

function renderMarkers(list) {
  // limpar
  markers.forEach(m => { try { map.removeLayer(m); } catch(e){} });
  markers.clear();

  // ordem cronológica: nos exemplos já está em ordem de tentativas
  list.forEach((item, idx) => {
    const number = idx + 1;
    const icon = makeNumberIcon(number);
    const marker = L.marker(item.coords, { icon }).addTo(map);

    const popupHtml = `
      <div class="visit-card">
        <div class="meta"><strong>${item.plate}</strong><small>${item.time}</small></div>
        <div style="margin-top:8px"><strong>Motivo:</strong> <span class="reason-popup">${item.agentNote || 'Indefinido'}</span></div>
        <div style="margin-top:8px" class="note-popup">${item.description || ''}</div>
        <a style="display:block;margin-top:8px;" href="https://via.placeholder.com/1200x800.png?text=Foto+Local" target="_blank"><img src="https://via.placeholder.com/260x140.png?text=Thumb" alt="foto" style="width:100%;border-radius:6px;"/></a>
      </div>
    `;

    marker.bindPopup(popupHtml, { closeButton: true });
    marker.on('click', () => {
      setCurrentPlate(item.plate);
    });
    markers.set(item.id, marker);
  });
}

function renderRightPanel() {
  const emContainer = document.getElementById('emAndamentoList');
  const histContainer = document.getElementById('historyList');
  emContainer.innerHTML = '';
  histContainer.innerHTML = '';

  let em = occurrences.filter(o => o.status === 'em_andamento');
  
  // Ordenar por prévia: menor tempo primeiro, depois por prioridade
  em.sort((a, b) => {
    const aTemPrevia = a.apoio?.previa?.chegadaEstimada;
    const bTemPrevia = b.apoio?.previa?.chegadaEstimada;
    
    // Ambos sem prévia: ordenar por prioridade
    if (!aTemPrevia && !bTemPrevia) {
      const prioridadeMap = { alta: 1, media: 2, baixa: 3 };
      return prioridadeMap[a.priority] - prioridadeMap[b.priority];
    }
    
    // Cards sem prévia vão para o final
    if (!aTemPrevia) return 1;
    if (!bTemPrevia) return -1;
    
    // Ambos com prévia: menor tempo primeiro (mais urgente)
    return new Date(aTemPrevia) - new Date(bTemPrevia);
  });
  // Determine the plate under analysis: prefer `currentPlate`, fallback to the plate shown in the info drawer
  function getAnalysisPlate() {
    if (currentPlate) return currentPlate;
    const badge = document.querySelector('#drawer-info .vehicle-plate .badge-plate');
    if (badge && badge.textContent) return badge.textContent.trim();
    return null;
  }

  const analysisPlate = getAnalysisPlate();
  // Histórico: show only 'encerrada' occurrences for the plate currently under analysis
  let hist = [];
  if (analysisPlate) {
    hist = occurrences.filter(o => o.status === 'encerrada' && o.plate === analysisPlate);
  }

  em.forEach(o => {
    const div = document.createElement('div'); div.className = 'occ-card';
    const lastSup = (o.supportHistory && o.supportHistory.length) ? o.supportHistory[o.supportHistory.length-1] : null;
    const priorityClass = o.priority === 'alta' ? 'priority-alta' : (o.priority === 'media' ? 'priority-media' : 'priority-baixa');
    div.innerHTML = `
      <div class="card-top">
        <div class="plate-main"><button class="plate-btn" data-plate="${o.plate}" title="Selecionar placa">${o.plate}</button></div>
        <div class="card-flags">
          <span class="priority-badge ${priorityClass}">${o.priority}</span>
          <span class="sla muted">${o.time}</span>
        </div>
        <button class="icon-btn btn-centralize" data-center="${o.id}" title="Centralizar" aria-label="Centralizar no mapa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M3 12h2M19 12h2M12 3v2M12 19v2"/></svg>
        </button>
      </div>
      
      <!-- Seção de Prévia de Tempo -->
      ${o.apoio ? `
      <div class="card-eta-section" data-has-previa="${o.apoio?.previa ? 'true' : 'false'}" data-occurrence-id="${o.id}">
        ${o.apoio?.previa ? `
          <div class="eta-display" data-status="${o.apoio.statusChegada || 'aguardando'}">
            <div class="eta-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
            <div class="eta-info">
              <div class="eta-label">Apoio chegando em</div>
              <div class="eta-countdown" data-target-time="${o.apoio.previa.chegadaEstimada}">
                <span class="eta-time">--:--:--</span>
                <span class="eta-updated">calculando...</span>
              </div>
              <div class="eta-details">
                <span class="eta-company">${o.apoio?.tipo ? (o.apoio.tipo === 'onsystem' ? 'OnSystem' : o.apoio.tipo === 'selva' ? 'Selva' : o.apoio.tipo === 'ativa' ? 'Ativa' : o.apoio.tipo === 'i2' ? 'I2' : o.apoio.tipo === 'carro_interno' ? 'Carro Interno' : o.apoio.tipo) : 'Apoio'}</span>
                <span class="eta-separator">·</span>
                <span class="eta-original">Prévia: ${o.apoio.previa.tempoMinutos} min</span>
              </div>
            </div>
            <button class="btn-editar-previa" data-occurrence-id="${o.id}" title="Editar prévia" aria-label="Editar prévia">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
            </button>
          </div>
        ` : `
          <div class="eta-empty">
            <button class="btn-definir-previa" data-occurrence-id="${o.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Definir Prévia</span>
            </button>
          </div>
        `}
      </div>
      ` : ''}
      
      <div class="card-body compact">
        <div class="telemetry-row">
          <div class="tele-item"><i data-lucide="battery"></i><span class="tele-label">Bateria</span><div class="tele-val">78%</div></div>
          <div class="tele-item"><i data-lucide="map-pin"></i><span class="tele-label">GPS</span><div class="tele-val">${o.coords[0].toFixed(4)}, ${o.coords[1].toFixed(4)}</div></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-small btn-outline" data-details="${o.id}" title="Detalhes">Detalhes</button>
        <button class="btn-small btn-support" data-support="${o.id}" title="Solicitar apoio"><i data-lucide="user-plus"></i> Apoio</button>
        <button class="btn-small btn-chat ${(chatUnreadCounts.get(o.id) || 0) > 0 ? 'has-unread' : ''}" data-chat="${o.id}" title="Conversar com apoio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
          </svg>
          Chat
          <span class="chat-unread-badge" data-count="${chatUnreadCounts.get(o.id) || 0}">${chatUnreadCounts.get(o.id) || 0}</span>
        </button>
      </div>
    `;
    emContainer.appendChild(div);
  });

  if (hist.length === 0) {
    histContainer.innerHTML = `<div class="card"><div class="muted">Selecione uma placa em análise para ver ocorrências encerradas.</div></div>`;
  } else {
    hist.forEach(o => {
    const div = document.createElement('div'); div.className = 'occ-card historic';
    const lastSup = (o.supportHistory && o.supportHistory.length) ? o.supportHistory[o.supportHistory.length-1] : null;
    div.innerHTML = `
      <div class="card-top">
        <div class="plate-main"><button class="plate-btn" data-plate="${o.plate}" title="Selecionar placa">${o.plate}</button></div>
        <div class="card-flags">
          <span class="muted">${o.time}</span>
        </div>
        <button class="icon-btn btn-centralize" data-center="${o.id}" title="Centralizar" aria-label="Centralizar no mapa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M3 12h2M19 12h2M12 3v2M12 19v2"/></svg>
        </button>
      </div>
      <div class="card-body compact">
        <div class="item"><strong>Resumo</strong><div>${o.description}</div></div>
        <div class="item"><strong>Desfecho</strong><div>${o.status === 'encerrada' ? 'Veículo Recuperado' : 'Apropriação não confirmada'}</div></div>
      </div>
      <div class="card-actions">
        <button class="btn-small btn-outline" data-details="${o.id}">Detalhes</button>
        <button class="btn-small btn-support" data-support="${o.id}" title="Solicitar apoio"><i data-lucide="user-plus"></i> Apoio</button>
        <button class="btn-small btn-chat ${(chatUnreadCounts.get(o.id) || 0) > 0 ? 'has-unread' : ''}" data-chat="${o.id}" title="Conversar com apoio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
          </svg>
          Chat
          <span class="chat-unread-badge" data-count="${chatUnreadCounts.get(o.id) || 0}">${chatUnreadCounts.get(o.id) || 0}</span>
        </button>
      </div>
    `;
    histContainer.appendChild(div);
    });
  }

  // wire popup helpers
  document.querySelectorAll('[data-popup]').forEach(btn => btn.addEventListener('click', () => {
    const id = Number(btn.dataset.popup); const m = markers.get(id); if (m) m.openPopup();
  }));
  document.querySelectorAll('[data-details]').forEach(btn => btn.addEventListener('click', (ev) => {
    const id = Number(btn.dataset.details); const occ = occurrences.find(x => x.id === id); openDetailsModal(occ);
  }));

  // wire support buttons on cards
  document.querySelectorAll('[data-support]').forEach(btn => btn.addEventListener('click', (ev) => {
    const id = Number(btn.dataset.support);
    const occ = occurrences.find(x => x.id === id);
    if (occ) {
      detailOpenOcc = occ;
      openSupportModal();
    }
  }));

  // wire chat buttons on cards
  document.querySelectorAll('[data-chat]').forEach(btn => btn.addEventListener('click', (ev) => {
    const id = Number(btn.dataset.chat);
    const occ = occurrences.find(x => x.id === id);
    if (occ) {
      openChatModalForOccurrence(occ);
    }
  }));

  // centralize handlers: center map on occurrence marker and open popup
  document.querySelectorAll('[data-center]').forEach(b => b.addEventListener('click', (ev) => {
    const id = Number(b.dataset.center);
    const m = markers.get(id);
    if (m && map) {
      try { map.setView(m.getLatLng(), Math.max(map.getZoom(), 15), { animate: true }); m.openPopup(); } catch(e) { console.error('center failed', e); }
    }
  }));

  // wire plate selection buttons
  document.querySelectorAll('.plate-btn').forEach(b => b.addEventListener('click', (ev) => {
    const plate = b.dataset.plate; setCurrentPlate(plate);
    // focus drawer
    const drawer = document.getElementById('drawer-occ'); if (drawer) drawer.classList.add('open');
  }));

  // apply selection highlight without triggering render to avoid recursion
  if (currentPlate) {
    document.querySelectorAll('.occ-card').forEach(c => {
      const p = c.querySelector('.plate')?.textContent?.trim() || c.querySelector('.plate-main')?.textContent?.trim();
      if (p === currentPlate) c.classList.add('selected'); else c.classList.remove('selected');
    });
  }
  
  // Substituir ícones Lucide após renderização
  initLucideIcons();
}

function openDetailsModal(occ) {
  if (!occ) return;
  detailOpenOcc = occ;
  const md = document.getElementById('modal-details');
  md.setAttribute('aria-hidden','false');
  md.classList.add('open');
  document.getElementById('modal-details-title').textContent = `${occ.plate} • ${occ.time}`;
  // update support display
  const supDisp = document.getElementById('detail-support-display');
  if (supDisp) supDisp.textContent = 'Apoio: ' + (occ.support || 'sem envio de apoio');
  // support history display removed per request
  // telemetry
  const tel = document.getElementById('detail-telemetry'); tel.innerHTML = `
    <div class="item"><strong><i data-lucide="battery"></i> Bateria</strong><div>Principal: 78% • Backup: 66%</div></div>
    <div class="item"><strong><i data-lucide="wifi"></i> Último Ping</strong><div>${occ.time}</div></div>
    <div class="item"><strong><i data-lucide="map-pin"></i> GPS</strong><div>${occ.coords.join(', ')}</div></div>
    <div class="item"><strong><i data-lucide="shield"></i> Violação</strong><div>Indefinido</div></div>
  `;
  initLucideIcons();
  // comments
  // editable comments / info adicionais
  document.getElementById('detail-comments').innerHTML = `
    <div class="item"><label class="field"><span><i data-lucide="message-square"></i> Comentários</span><textarea id="detail-comments-input" rows="4" placeholder="Notas do agente">${occ.agentNote || ''}</textarea></label></div>
  `;
  initLucideIcons();
  // questions (placeholder)
  document.getElementById('detail-questions').innerHTML = `
    <div class="item"><strong><i data-lucide="phone-forwarded"></i> 190 foi feito?</strong><div>—</div></div>
    <div class="item"><strong><i data-lucide="hash"></i> Protocolo</strong><div>—</div></div>
    <div class="item"><strong><i data-lucide="git-branch"></i> KM Final</strong><div>—</div></div>
  `;
  initLucideIcons();
  // focus modal
  const save = document.getElementById('detail-save'); if (save) save.focus();
  // wire save to persist editable fields — overwrite any previous handler
  if (save) {
    save.onclick = () => {
      const commentsVal = document.getElementById('detail-comments-input')?.value || '';
      occ.agentNote = commentsVal.trim();
      // re-render lists and info drawer
      renderRightPanel();
      try { renderInfoDrawer(); } catch(e){}
      // close modal
      const md2 = document.getElementById('modal-details'); if (md2) { md2.classList.remove('open'); md2.setAttribute('aria-hidden','true'); }
    };
  }
}

// support modal controls
function openSupportModal() {
  const m = document.getElementById('modal-support'); if (!m) return;
  m.classList.add('open'); m.setAttribute('aria-hidden','false');
  // preselect current support value if available
  const sel = document.getElementById('support-select'); if (sel && detailOpenOcc) {
    sel.value = detailOpenOcc.support || 'sem envio de apoio';
    sel.focus();
  }
}

function closeSupportModal() {
  const m = document.getElementById('modal-support'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
}

// wire support modal events
document.addEventListener('click', (e) => {
  if (e.target.matches('#btn-acionar-apoio')) {
    openSupportModal();
  }
  if (e.target.matches('#btn-conversa-apoio')) {
    if (detailOpenOcc) {
      openChatModalForOccurrence(detailOpenOcc);
    }
  }
  if (e.target.matches('[data-mini-modal-close]')) {
    const mm = e.target.closest('.mini-modal');
    if (mm) {
      if (mm.id === 'modal-support') closeSupportModal();
      if (mm.id === 'modal-chat') closeChatModal();
    }
  }
});

// Chat modal controls
let chatInputListenersAttached = false; // Flag para evitar listeners duplicados

function openChatModal() {
  const m = document.getElementById('modal-chat'); if (!m) return;
  m.classList.add('open'); m.setAttribute('aria-hidden','false');
  const chatInput = document.getElementById('chat-input');
  if (chatInput && !chatInputListenersAttached) {
    chatInputListenersAttached = true;
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
      this.style.height = '44px';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Enter para enviar (Shift+Enter para nova linha)
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('chat-send')?.click();
      }
    });
  }
  
  // Focar e resetar altura
  if (chatInput) {
    chatInput.style.height = '44px';
    setTimeout(() => chatInput.focus(), 100);
  }
}

// Abrir chat para ocorrência específica
function openChatModalForOccurrence(occ) {
  if (!occ) return;
  
  activeChatOccId = occ.id;
  
  // Atualizar título do modal
  const modalTitle = document.getElementById('modal-chat-title');
  if (modalTitle) {
    modalTitle.textContent = `Chat - ${occ.plate} (#${occ.id})`;
  }
  
  // Carregar mensagens
  renderChatMessagesForOccurrence(occ.id);
  
  // Marcar como lidas
  markMessagesAsRead(occ.id);
  
  // Abrir modal
  openChatModal();
}

// Renderizar mensagens do chat
function renderChatMessagesForOccurrence(occId) {
  const chatLog = document.getElementById('chat-log');
  if (!chatLog) return;
  
  chatLog.innerHTML = '';
  
  const messages = chatMessages.get(occId) || [];
  
  if (messages.length === 0) {
    chatLog.innerHTML = `
      <div class="chat-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
        </svg>
        <p>Nenhuma mensagem ainda</p>
        <span>Inicie uma conversa com a equipe de apoio</span>
      </div>
    `;
    return;
  }
  
  messages.forEach(msg => {
    const item = document.createElement('div');
    item.className = `chat-message ${msg.remetente}`;
    
    const initials = msg.remetente === 'central' ? 'CT' : 
      msg.nomeRemetente.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    item.innerHTML = `
      <div class="message-avatar ${msg.remetente}">${escapeHtml(initials)}</div>
      <div class="message-bubble">
        <div class="message-header">
          <span class="message-sender">${escapeHtml(msg.nomeRemetente)}</span>
          <span class="message-time">${escapeHtml(time)}</span>
        </div>
        <div class="message-content">${escapeHtml(msg.texto)}</div>
      </div>
    `;
    
    chatLog.appendChild(item);
  });
  
  setTimeout(() => {
    chatLog.scrollTop = chatLog.scrollHeight;
  }, 100);
}

// Marcar mensagens como lidas
function markMessagesAsRead(occId) {
  const messages = chatMessages.get(occId) || [];
  messages.forEach(msg => {
    if (msg.remetente === 'central') {
      msg.lida = true;
    }
  });
  
  chatUnreadCounts.set(occId, 0);
  updateChatBadge(occId);
}

// Atualizar badge de não lidas
function updateChatBadge(occId) {
  const unreadCount = chatUnreadCounts.get(occId) || 0;
  
  document.querySelectorAll(`[data-chat="${occId}"]`).forEach(btn => {
    const badge = btn.querySelector('.chat-unread-badge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.dataset.count = unreadCount;
    }
    
    if (unreadCount > 0) {
      btn.classList.add('has-unread');
    } else {
      btn.classList.remove('has-unread');
    }
  });
}

function closeChatModal() {
  const m = document.getElementById('modal-chat'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

document.getElementById && document.getElementById('support-confirm')?.addEventListener('click', () => {
  const sel = document.getElementById('support-select'); if (!sel) return;
  const val = sel.value;
  if (detailOpenOcc) {
    detailOpenOcc.support = val;
    
    // Criar estrutura de apoio se não existir
    if (val !== 'sem envio de apoio') {
      const user = getCurrentUser();
      detailOpenOcc.apoio = {
        tipo: val,
        acionadoEm: new Date().toISOString(),
        acionadoPor: user,
        statusChegada: 'aguardando'
      };
    }
    
    // append history record with timestamp and user
    if (!detailOpenOcc.supportHistory) detailOpenOcc.supportHistory = [];
    const user = getCurrentUser();
    const time = new Date().toLocaleString('pt-BR');
    detailOpenOcc.supportHistory.push({ type: val, user, time });
    // reflect in details modal
    const supDisp = document.getElementById('detail-support-display'); if (supDisp) supDisp.textContent = 'Apoio: ' + (val || 'sem envio de apoio');
    // update persistence UI
    renderRightPanel();
    try { renderInfoDrawer(); } catch(e){}
  }
  closeSupportModal();
});

document.getElementById && document.getElementById('chat-send')?.addEventListener('click', () => {
  const input = document.getElementById('chat-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  const log = document.getElementById('chat-log'); if (!log) return;
  const user = getCurrentUser(); 
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // Remover estado vazio se existir
  const emptyState = log.querySelector('.chat-empty-state');
  if (emptyState) {
    log.innerHTML = '';
  }
  
  // Adicionar mensagem ao histórico
  if (activeChatOccId) {
    if (!chatMessages.has(activeChatOccId)) {
      chatMessages.set(activeChatOccId, []);
    }
    
    const newMessage = {
      id: Date.now(),
      remetente: 'analista',
      nomeRemetente: user,
      timestamp: new Date().toISOString(),
      texto: text,
      anexos: [],
      lida: true
    };
    
    chatMessages.get(activeChatOccId).push(newMessage);
  }
  
  // Criar estrutura de mensagem com avatar
  const item = document.createElement('div');
  item.className = 'chat-message analista';
  
  // Obter iniciais do usuário
  const initials = user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  item.innerHTML = `
    <div class="message-avatar analista">${escapeHtml(initials)}</div>
    <div class="message-bubble">
      <div class="message-header">
        <span class="message-sender">${escapeHtml(user)}</span>
        <span class="message-time">${escapeHtml(time)}</span>
      </div>
      <div class="message-content">${escapeHtml(text)}</div>
    </div>
  `;
  
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
  input.value = '';
  input.style.height = '44px'; // Reset height após enviar
  input.focus(); // Manter foco no campo
  
  // Simular resposta da central após 1.5-3s
  if (activeChatOccId) {
    simulateIncomingMessage(activeChatOccId);
  }
});

// Simular resposta da central
function simulateIncomingMessage(occId) {
  setTimeout(() => {
    const responseMessage = {
      id: Date.now(),
      remetente: 'central',
      nomeRemetente: 'Central de Apoio',
      timestamp: new Date().toISOString(),
      texto: 'Recebido. Equipe a caminho do local.',
      anexos: [],
      lida: false
    };
    
    if (!chatMessages.has(occId)) {
      chatMessages.set(occId, []);
    }
    chatMessages.get(occId).push(responseMessage);
    
    // Se modal está aberto para essa ocorrência
    if (activeChatOccId === occId) {
      const log = document.getElementById('chat-log');
      if (log) {
        const responseItem = document.createElement('div');
        responseItem.className = 'chat-message central';
        const responseTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        responseItem.innerHTML = `
          <div class="message-avatar central">CT</div>
          <div class="message-bubble">
            <div class="message-header">
              <span class="message-sender">Central de Apoio</span>
              <span class="message-time">${responseTime}</span>
            </div>
            <div class="message-content">${escapeHtml(responseMessage.texto)}</div>
          </div>
        `;
        log.appendChild(responseItem);
        log.scrollTop = log.scrollHeight;
      }
      markMessagesAsRead(occId);
    } else {
      // Incrementar contador
      const currentCount = chatUnreadCounts.get(occId) || 0;
      chatUnreadCounts.set(occId, currentCount + 1);
      updateChatBadge(occId);
      showToastNotification(`Nova mensagem na ocorrência #${occId}`);
    }
  }, Math.random() * 1500 + 1500);
}

// Toast notification
function showToastNotification(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">Nova mensagem</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutDown 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// modal close handlers
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
    document.querySelectorAll('.occ-modal.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); });
  }
});

function wireUI() {
  // tabs
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const tab = t.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    // ensure lists are refreshed when switching tabs (historico auto-filters by selected plate)
    renderRightPanel();
  }));

  // new occurrence
  const btnNew = document.getElementById('btnNewOccurrence');
  if (btnNew) btnNew.addEventListener('click', () => document.getElementById('modal-create').classList.add('open'));

  // drawer new occurrence button (inside drawer)
  const btnNewDrawer = document.getElementById('btnNewOccurrenceDrawer');
  if (btnNewDrawer) btnNewDrawer.addEventListener('click', () => document.getElementById('modal-create').classList.add('open'));

  document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => { const m = b.closest('.side-modal'); if (m) m.classList.remove('open'); }));

  // Floating buttons -> drawers
  const floatInfo = document.getElementById('floatInfo');
  const floatOcc = document.getElementById('floatOcc');
  const drawerInfo = document.getElementById('drawer-info');
  const drawerOcc = document.getElementById('drawer-occ');
  let lastTrigger = null;

  function openDrawer(drawer, trigger) {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    lastTrigger = trigger || null;
    const focusable = drawer.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  function closeDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    lastTrigger = null;
  }

  if (floatInfo && drawerInfo) floatInfo.addEventListener('click', (ev) => {
    const opening = !drawerInfo.classList.contains('open');
    if (opening) {
      if (drawerOcc) drawerOcc.classList.remove('open');
      renderInfoDrawer();
      openDrawer(drawerInfo, ev.currentTarget);
    } else {
      closeDrawer(drawerInfo);
    }
  });

  if (floatOcc && drawerOcc) floatOcc.addEventListener('click', (ev) => {
    const opening = !drawerOcc.classList.contains('open');
    if (opening) {
      if (drawerInfo) closeDrawer(drawerInfo);
      openDrawer(drawerOcc, ev.currentTarget);
    } else {
      closeDrawer(drawerOcc);
    }
  });

  document.querySelectorAll('[data-drawer-close]').forEach(b => b.addEventListener('click', (ev) => {
    const p = b.closest('.drawer'); if (p) closeDrawer(p);
  }));

  // Close open drawers with Escape and restore focus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer.open').forEach(d => closeDrawer(d));
      // also close modal-create if open
      const modal = document.getElementById('modal-create'); if (modal && modal.classList.contains('open')) modal.classList.remove('open');
    }
  });

  // create occurrence
  document.getElementById('btnCreateOccurrence').addEventListener('click', () => {
    const plate = document.getElementById('newPlate').value.trim().toUpperCase();
    const desc = document.getElementById('newDescription').value.trim();
    const priority = document.getElementById('newPriority').value;
    if (!plate || !desc) return alert('Preencha placa e descrição.');
    const newItem = { id: Date.now(), plate, status: 'em_andamento', priority, description: desc, time: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), coords: map.getCenter(), agentNote: desc };
    occurrences.unshift(newItem);
    document.getElementById('modal-create').classList.remove('open');
    document.getElementById('newPlate').value = '';
    document.getElementById('newDescription').value = '';
    renderMarkers(occurrences);
    renderRightPanel();
  });

  // search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applySearch(); });
  const btnSearchHeader = document.getElementById('btnSearchHeader');
  if (btnSearchHeader) btnSearchHeader.addEventListener('click', applySearch);
}

function applySearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = q ? occurrences.filter(o => (`${o.plate} ${o.description} ${o.agentNote || ''}`).toLowerCase().includes(q)) : occurrences;
  renderMarkers(filtered);
  renderRightPanel();
}

function init() {
  initializeChatData();
  initMap();
  wireUI();
  renderRightPanel();
  
  // Aguardar carregamento do Lucide e depois substituir ícones
  const initLucide = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons();
        console.info('[affordance-debug] lucide icons initialized successfully');
      } catch(e) {
        console.error('[affordance-debug] lucide.createIcons() failed', e);
      }
    } else if (window.lucide && typeof window.lucide.replace === 'function') {
      try {
        window.lucide.replace();
        console.info('[affordance-debug] lucide icons replaced successfully');
      } catch(e) {
        console.error('[affordance-debug] lucide.replace() failed', e);
      }
    }
    checkAffordances();
  };
  
  // Tentar inicializar imediatamente e também após um delay
  setTimeout(initLucide, 100);
}

document.addEventListener('DOMContentLoaded', init);

// --- Info drawer renderer & interactions ---
function renderInfoDrawer() {
  const totalEl = document.getElementById('totalVisits');
  const timelineEl = document.getElementById('visitTimeline');
  const failReasonsEl = document.getElementById('failReasons');

  if (!timelineEl || !totalEl) return;

  // For demo, pick first plate to show its occurrences
  const plate = occurrences.length ? occurrences[0].plate : null;
  const related = plate ? occurrences.filter(o => o.plate === plate) : [];

  totalEl.textContent = related.length;

  // unique fail reasons
  const reasons = Array.from(new Set(related.map(r => r.agentNote || 'Indefinido')));
  if (failReasonsEl) {
    failReasonsEl.innerHTML = '';
    reasons.forEach(r => {
      const s = document.createElement('span'); s.className = 'tag'; s.textContent = r; failReasonsEl.appendChild(s);
    });
  }

  timelineEl.innerHTML = '';
  related.forEach((r, idx) => {
    const item = document.createElement('div'); item.className = 'timeline-item';
    item.innerHTML = `<div class="title">Tentativa ${idx+1} - ${new Date().toLocaleDateString('pt-BR')} ${r.time}</div>
      <div class="reason">Motivo: ${r.agentNote || 'Indefinido'}</div>
      <div class="note">${r.description || ''}</div>`;
    timelineEl.appendChild(item);
  });

  // wire copy/open map buttons
  document.querySelectorAll('.btn-copy').forEach(b => {
    b.removeEventListener('click', handleCopy);
    b.addEventListener('click', handleCopy);
  });
  document.querySelectorAll('.btn-openmap').forEach(b => {
    b.removeEventListener('click', handleOpenMap);
    b.addEventListener('click', handleOpenMap);
  });
  document.querySelectorAll('.btn-whatsapp').forEach(b => {
    b.removeEventListener('click', handleWhats);
    b.addEventListener('click', handleWhats);
  });

  // replace lucide placeholders with SVGs
  initLucideIcons();
  checkAffordances();
}

// Diagnostic helper: logs status of lucide replacement and elements
function checkAffordances() {
  try {
    const totalPlaceholders = document.querySelectorAll('i[data-lucide]').length;
    
    // Se não há placeholders, não há nada a fazer
    if (totalPlaceholders === 0) { 
      console.info('[affordance-debug] no lucide placeholders found — nothing to do'); 
      return; 
    }
    
    const svgs = document.querySelectorAll('.icon-affordance svg, .icon-btn svg, i[data-lucide] svg');
    const svgsVisible = Array.from(svgs).filter(s => {
      const r = s.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).length;
    
    console.info('[affordance-debug] placeholders:', totalPlaceholders, 'svgs found:', svgs.length, 'visible svgs:', svgsVisible);

    // Verificar se Lucide já está disponível e funcionando
    if (window.lucide && (typeof window.lucide.createIcons === 'function' || typeof window.lucide.replace === 'function')) {
      const hasLucideIcons = document.querySelectorAll('.lucide').length > 0;
      if (hasLucideIcons) {
        console.info('[affordance-debug] lucide icons already rendered');
      } else {
        console.info('[affordance-debug] lucide is loaded, icons will be rendered');
      }
    } else if (totalPlaceholders > 0) {
      // Lucide não carregou - usar fallback inline SVG
      console.warn('[affordance-debug] lucide not loaded, using inline SVG fallback');
      document.querySelectorAll('i[data-lucide]').forEach(i => {
        const name = i.dataset.lucide;
        if (name === 'copy') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        if (name === 'map') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 7 3 13 6 23 3 23 18 13 21 7 18 1 21 1 6"></polygon><line x1="7" y1="3" x2="7" y2="18"></line></svg>';
        if (name === 'x') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        if (name === 'user-plus') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>';
        if (name === 'battery') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>';
        if (name === 'wifi') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>';
        if (name === 'map-pin') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
        if (name === 'shield') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
        if (name === 'message-square') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        if (name === 'phone-forwarded') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 2 22 6 18 10"></polyline><line x1="14" y1="6" x2="22" y2="6"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';
        if (name === 'hash') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>';
        if (name === 'git-branch') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>';
      });
    }
  } catch (e) {
    console.error('[affordance-debug] error checking affordances', e);
  }
}

function handleCopy(e) {
  const parent = e.target.closest('.addr-item');
  if (!parent) return;
  const text = parent.querySelector('.addr-text')?.textContent || '';
  navigator.clipboard?.writeText(text).then(() => {
    e.target.textContent = 'Copiado'; setTimeout(()=> e.target.textContent = 'Copiar', 1200);
  });
}

function handleOpenMap(e) {
  const parent = e.target.closest('.addr-item');
  if (!parent) return;
  const lat = parent.querySelector('.addr-text')?.dataset.lat;
  const lng = parent.querySelector('.addr-text')?.dataset.lng;
  let url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(parent.querySelector('.addr-text')?.textContent || '');
  if (lat && lng) url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(url, '_blank');
}

function handleWhats(e) {
  const el = e.target.closest('.contact-row');
  if (!el) return;
  const phone = el.querySelector('a')?.textContent.replace(/\D/g,'');
  if (!phone) return;
  window.open(`https://wa.me/${phone}`, '_blank');
}

// ========================================
// SISTEMA DE PRÉVIA - FUNÇÕES PRINCIPAIS
// ========================================

// Helper para inicializar ícones Lucide
function initLucideIcons() {
  try {
    if (window.lucide) {
      if (typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      } else if (typeof window.lucide.replace === 'function') {
        window.lucide.replace();
      }
    }
  } catch(e) {
    console.error('[lucide] Error initializing icons:', e);
  }
}

function formatApoioName(tipo) {
  const nomes = {
    'onsystem': 'OnSystem',
    'selva': 'Selva',
    'ativa': 'Ativa',
    'i2': 'I2',
    'carro_interno': 'Carro Interno'
  };
  return nomes[tipo] || tipo;
}

function openPreviaModal(occurrenceId, isEdit = false) {
  console.log('[prévia] openPreviaModal chamado com ID:', occurrenceId, 'isEdit:', isEdit);
  
  // Converter para número se vier como string do HTML
  const id = typeof occurrenceId === 'string' ? parseInt(occurrenceId) : occurrenceId;
  console.log('[prévia] ID convertido:', id);
  
  const occurrence = occurrences.find(occ => occ.id === id);
  console.log('[prévia] Ocorrência encontrada:', occurrence);
  
  if (!occurrence) {
    console.error('Ocorrência não encontrada:', occurrenceId);
    return;
  }
  
  // Inicializar apoio se não existir
  if (!occurrence.apoio) {
    console.log('[prévia] Inicializando apoio');
    occurrence.apoio = {
      tipo: 'sem envio de apoio',
      acionadoEm: new Date().toISOString(),
      acionadoPor: getCurrentUser()
    };
  }
  
  const modalOverlay = document.getElementById('modal-previa-overlay');
  console.log('[prévia] Modal overlay:', modalOverlay);
  
  if (!modalOverlay) {
    console.error('[prévia] Modal overlay não encontrado!');
    return;
  }
  
  const modalTitle = document.getElementById('modal-previa-title');
  const modalPlate = document.getElementById('modal-previa-plate');
  const apoioName = document.getElementById('modal-previa-apoio');
  const apoioTime = document.getElementById('modal-previa-apoio-time');
  const inputTempo = document.getElementById('previa-tempo');
  
  if (modalTitle) {
    modalTitle.textContent = isEdit ? 'Atualizar Prévia de Chegada' : 'Definir Prévia de Chegada';
  }
  
  if (modalPlate) {
    modalPlate.textContent = occurrence.plate;
  }
  
  if (apoioName) {
    apoioName.textContent = occurrence.apoio.tipo ? formatApoioName(occurrence.apoio.tipo) : 'Apoio Externo';
  }
  
  if (apoioTime && occurrence.apoio.acionadoEm) {
    const acionadoEm = new Date(occurrence.apoio.acionadoEm);
    const diffMin = Math.floor((new Date() - acionadoEm) / 60000);
    apoioTime.textContent = diffMin > 0 ? `Acionado há ${diffMin} minuto${diffMin !== 1 ? 's' : ''}` : 'Recém acionado';
  } else if (apoioTime) {
    apoioTime.textContent = 'Aguardando acionamento';
  }
  
  if (inputTempo) {
    if (isEdit && occurrence.apoio.previa) {
      inputTempo.value = occurrence.apoio.previa.tempoMinutos;
    } else {
      inputTempo.value = 30;
    }
    updatePreviaPreview();
  }
  
  modalOverlay.dataset.occurrenceId = id;
  modalOverlay.classList.add('open');
  console.log('[prévia] Modal aberto! Classes:', modalOverlay.className);
  
  setTimeout(() => inputTempo?.focus(), 300);
}

function closePreviaModal() {
  const modalOverlay = document.getElementById('modal-previa-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
  }
  
  // Limpar observação
  const obsTextarea = document.getElementById('previa-observacao');
  if (obsTextarea) obsTextarea.value = '';
  
  // Resetar contador
  const obsCounter = document.getElementById('obs-counter');
  if (obsCounter) obsCounter.textContent = '0';
  
  // Remover active dos atalhos
  document.querySelectorAll('.btn-shortcut').forEach(btn => {
    btn.classList.remove('active');
  });
}

function updatePreviaPreview() {
  const inputTempo = document.getElementById('previa-tempo');
  const previewTime = document.getElementById('preview-eta-time');
  const previewDate = document.getElementById('preview-eta-date');
  
  if (!inputTempo || !previewTime || !previewDate) return;
  
  const minutos = parseInt(inputTempo.value) || 0;
  const chegada = new Date(Date.now() + minutos * 60000);
  
  previewTime.textContent = chegada.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const hoje = new Date().toDateString();
  const amanha = new Date(Date.now() + 86400000).toDateString();
  
  if (chegada.toDateString() === hoje) {
    previewDate.textContent = 'Hoje';
  } else if (chegada.toDateString() === amanha) {
    previewDate.textContent = 'Amanhã';
  } else {
    previewDate.textContent = chegada.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  }
}

function salvarPrevia(occurrenceId) {
  // Converter para número se vier como string
  const id = typeof occurrenceId === 'string' ? parseInt(occurrenceId) : occurrenceId;
  const occurrence = occurrences.find(occ => occ.id === id);
  if (!occurrence) return;
  
  const tempoMinutos = parseInt(document.getElementById('previa-tempo').value);
  const observacao = document.getElementById('previa-observacao').value.trim();
  
  if (!tempoMinutos || tempoMinutos < 1 || tempoMinutos > 180) {
    showToastNotification('Tempo inválido. Use entre 1 e 180 minutos.');
    return;
  }
  
  const agora = new Date();
  const chegadaEstimada = new Date(agora.getTime() + tempoMinutos * 60000);
  
  const novaPrevia = {
    tempoMinutos: tempoMinutos,
    definidaEm: agora.toISOString(),
    chegadaEstimada: chegadaEstimada.toISOString(),
    ultimaAtualizacao: agora.toISOString()
  };
  
  if (!occurrence.apoio.previa) {
    occurrence.apoio.previa = novaPrevia;
    occurrence.apoio.historicoPrevia = [
      {
        tempoMinutos: tempoMinutos,
        definidaEm: agora.toISOString(),
        motivo: observacao || 'Prévia inicial'
      }
    ];
  } else {
    if (!occurrence.apoio.historicoPrevia) {
      occurrence.apoio.historicoPrevia = [];
    }
    occurrence.apoio.historicoPrevia.push({
      tempoMinutos: tempoMinutos,
      definidaEm: agora.toISOString(),
      motivo: observacao || 'Atualização de prévia'
    });
    occurrence.apoio.previa = novaPrevia;
  }
  
  occurrence.apoio.statusChegada = 'aguardando';
  
  closePreviaModal();
  renderRightPanel();
  startPreviaCountdowns();
  
  showToastNotification(`Prévia definida: ${tempoMinutos} minutos`);
}

// ========================================
// SISTEMA DE COUNTDOWN EM TEMPO REAL
// ========================================

function formatCountdown(diffMs) {
  if (diffMs <= 0) {
    const atrasoMin = Math.abs(Math.floor(diffMs / 60000));
    return `+${atrasoMin} min`;
  }
  
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function updateCardPreviaDisplay(occurrenceId, diffMs, status) {
  const id = typeof occurrenceId === 'string' ? parseInt(occurrenceId) : occurrenceId;
  const card = document.querySelector(`[data-occurrence-id="${id}"]`)?.closest('.occ-card');
  if (!card) return;
  
  const occurrence = occurrences.find(occ => occ.id === id);
  if (!occurrence) return;
  
  // Se chegada foi confirmada, renderizar estado confirmado
  if (occurrence.apoio.chegada && occurrence.apoio.chegada.confirmada) {
    const etaSection = card.querySelector('.card-eta-section');
    if (etaSection) {
      etaSection.innerHTML = renderEtaConfirmed(occurrence);
      card.dataset.etaStatus = 'confirmado';
    }
    return;
  }
  
  const etaDisplay = card.querySelector('.eta-display');
  const etaTime = card.querySelector('.eta-time');
  
  if (!etaDisplay || !etaTime) return;
  
  etaDisplay.dataset.status = status;
  card.dataset.etaStatus = status;
  
  const timeString = formatCountdown(diffMs);
  etaTime.textContent = timeString;
  
  if (occurrence && occurrence.apoio.previa) {
    const etaUpdated = card.querySelector('.eta-updated');
    if (etaUpdated) {
      const definidaEm = new Date(occurrence.apoio.previa.definidaEm);
      const timeSince = Math.floor((new Date() - definidaEm) / 60000);
      etaUpdated.textContent = `há ${timeSince} min`;
    }
  }
}

function updateAllPreviaCountdowns() {
  const agora = new Date();
  
  occurrences.forEach(occurrence => {
    if (!occurrence.apoio || !occurrence.apoio.previa) return;
    
    // Ignorar se já foi confirmada a chegada
    if (occurrence.apoio.chegada && occurrence.apoio.chegada.confirmada) return;
    
    const chegadaEstimada = new Date(occurrence.apoio.previa.chegadaEstimada);
    const diffMs = chegadaEstimada - agora;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    let novoStatus = 'aguardando';
    
    if (diffMs <= 0) {
      // Countdown zerou - aguardando confirmação
      novoStatus = 'aguardando_confirmacao';
    } else if (diffMinutes <= 5) {
      novoStatus = 'urgente';
    } else if (diffMinutes <= 10) {
      novoStatus = 'proximo';
    }
    
    const statusAnterior = occurrence.apoio.statusAnterior || 'aguardando';
    
    if (occurrence.apoio.statusChegada !== novoStatus) {
      occurrence.apoio.statusChegada = novoStatus;
      
      if (novoStatus === 'proximo' && statusAnterior !== 'proximo') {
        showToastNotification(`Apoio chegando em ${diffMinutes} min - ${occurrence.plate}`);
      } else if (novoStatus === 'urgente' && statusAnterior !== 'urgente') {
        showToastNotification(`⚠️ URGENTE: Apoio chegando em ${diffMinutes} min - ${occurrence.plate}`);
      } else if (novoStatus === 'aguardando_confirmacao' && statusAnterior !== 'aguardando_confirmacao') {
        showToastNotification(`⏱️ Apoio deveria ter chegado - ${occurrence.plate}. Confirme quando chegar.`);
        
        // Mostrar botão de confirmação no card
        const card = document.querySelector(`[data-occurrence-id="${occurrence.id}"]`);
        const etaSection = card?.querySelector('.card-eta-section');
        
        if (etaSection && !etaSection.querySelector('.eta-confirmation-section')) {
          const confirmSection = document.createElement('div');
          confirmSection.className = 'eta-confirmation-section';
          confirmSection.innerHTML = `
            <button 
              class="btn-confirmar-chegada" 
              type="button"
              data-occurrence-id="${occurrence.id}"
              title="Confirmar que o apoio chegou ao local"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <span class="btn-text">Confirmar Chegada do Apoio</span>
            </button>
          `;
          
          etaSection.appendChild(confirmSection);
        }
      }
      
      occurrence.apoio.statusAnterior = novoStatus;
    }
    
    updateCardPreviaDisplay(occurrence.id, diffMs, novoStatus);
  });
  
  reorderCardsByETA();
}

function startPreviaCountdowns() {
  if (previaUpdateInterval) {
    clearInterval(previaUpdateInterval);
  }
  
  previaUpdateInterval = setInterval(() => {
    updateAllPreviaCountdowns();
  }, 1000);
  
  updateAllPreviaCountdowns();
}

// ========================================
// REORDENAÇÃO AUTOMÁTICA
// ========================================

let lastCardOrder = null;

function reorderCardsByETA() {
  const container = document.getElementById('emAndamentoList');
  if (!container) return;
  
  const cards = Array.from(container.querySelectorAll('.occ-card'));
  
  // Obter IDs na ordem atual
  const currentOrder = cards.map(card => {
    const btn = card.querySelector('[data-details], [data-support]');
    return btn?.dataset.details || btn?.dataset.support;
  }).filter(Boolean);
  
  // Ordenar cards
  cards.sort((a, b) => {
    const aBtn = a.querySelector('[data-details], [data-support]');
    const bBtn = b.querySelector('[data-details], [data-support]');
    
    if (!aBtn || !bBtn) return 0;
    
    const aId = aBtn.dataset.details || aBtn.dataset.support;
    const bId = bBtn.dataset.details || bBtn.dataset.support;
    
    const aOcc = occurrences.find(occ => occ.id == aId);
    const bOcc = occurrences.find(occ => occ.id == bId);
    
    if (!aOcc?.apoio?.previa && !bOcc?.apoio?.previa) return 0;
    if (!aOcc?.apoio?.previa) return 1;
    if (!bOcc?.apoio?.previa) return -1;
    
    const aTime = new Date(aOcc.apoio.previa.chegadaEstimada);
    const bTime = new Date(bOcc.apoio.previa.chegadaEstimada);
    
    return aTime - bTime;
  });
  
  // Obter nova ordem após sort
  const newOrder = cards.map(card => {
    const btn = card.querySelector('[data-details], [data-support]');
    return btn?.dataset.details || btn?.dataset.support;
  }).filter(Boolean);
  
  // Verificar se a ordem mudou
  const orderChanged = !lastCardOrder || 
    lastCardOrder.length !== newOrder.length ||
    lastCardOrder.some((id, index) => id !== newOrder[index]);
  
  // Só reorganizar o DOM se a ordem realmente mudou
  if (orderChanged) {
    cards.forEach(card => container.appendChild(card));
    lastCardOrder = newOrder;
  }
}

// ========================================
// EVENT LISTENERS DO SISTEMA DE PRÉVIA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // Botão definir prévia
  document.addEventListener('click', function(e) {
    const btnDefinir = e.target.closest('.btn-definir-previa');
    if (btnDefinir) {
      console.log('[prévia] Botão definir clicado', btnDefinir);
      const occurrenceId = parseInt(btnDefinir.dataset.occurrenceId);
      console.log('[prévia] Occurrence ID:', occurrenceId);
      openPreviaModal(occurrenceId, false);
      return;
    }
    
    const btnEditar = e.target.closest('.btn-editar-previa');
    if (btnEditar) {
      console.log('[prévia] Botão editar clicado', btnEditar);
      const occurrenceId = parseInt(btnEditar.dataset.occurrenceId);
      openPreviaModal(occurrenceId, true);
      return;
    }
  });
  
  // Atalhos rápidos
  document.addEventListener('click', function(e) {
    const btnShortcut = e.target.closest('.btn-shortcut');
    if (btnShortcut) {
      const minutos = parseInt(btnShortcut.dataset.minutes);
      const inputTempo = document.getElementById('previa-tempo');
      if (inputTempo) {
        inputTempo.value = minutos;
      }
      
      document.querySelectorAll('.btn-shortcut').forEach(btn => {
        btn.classList.remove('active');
      });
      btnShortcut.classList.add('active');
      
      updatePreviaPreview();
    }
  });
  
  // Input de tempo change
  const inputTempo = document.getElementById('previa-tempo');
  if (inputTempo) {
    inputTempo.addEventListener('input', updatePreviaPreview);
  }
  
  // Contador de caracteres da observação
  const obsTextarea = document.getElementById('previa-observacao');
  const obsCounter = document.getElementById('obs-counter');
  if (obsTextarea && obsCounter) {
    obsTextarea.addEventListener('input', function() {
      obsCounter.textContent = this.value.length;
    });
  }
  
  // Salvar prévia
  const formPrevia = document.getElementById('form-previa');
  if (formPrevia) {
    formPrevia.addEventListener('submit', function(e) {
      e.preventDefault();
      const modalOverlay = document.getElementById('modal-previa-overlay');
      const occurrenceId = modalOverlay?.dataset.occurrenceId;
      if (occurrenceId) {
        salvarPrevia(parseInt(occurrenceId));
      }
    });
  }
  
  // Botão cancelar
  const btnCancelar = document.getElementById('btn-cancelar-previa');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', closePreviaModal);
  }
  
  // Fechar modal
  const modalClose = document.getElementById('modal-previa-close');
  if (modalClose) {
    modalClose.addEventListener('click', closePreviaModal);
  }
  
  // Fechar ao clicar no overlay
  const modalOverlay = document.getElementById('modal-previa-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closePreviaModal();
      }
    });
  }
  
  // ESC para fechar
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modalOverlay = document.getElementById('modal-previa-overlay');
      if (modalOverlay && modalOverlay.classList.contains('open')) {
        closePreviaModal();
      }
    }
  });
  
  // Iniciar countdowns
  startPreviaCountdowns();
});

// ========================================
// SISTEMA DE CONFIRMAÇÃO DE CHEGADA
// ========================================

// Abrir modal de confirmação de chegada
function openConfirmacaoChegadaModal(occurrenceId) {
  const occurrence = occurrences.find(occ => occ.id === occurrenceId);
  if (!occurrence || !occurrence.apoio || !occurrence.apoio.previa) {
    showToastNotification('Erro ao carregar dados da ocorrência', 'error');
    return;
  }
  
  // Calcular métricas
  const agora = new Date();
  const acionadoEm = new Date(occurrence.apoio.acionadoEm);
  const chegadaEstimada = new Date(occurrence.apoio.previa.chegadaEstimada);
  
  const tempoRealMs = agora - acionadoEm;
  const tempoRealMinutos = Math.floor(tempoRealMs / 60000);
  
  const diferencaMs = agora - chegadaEstimada;
  const diferencaMinutos = Math.floor(diferencaMs / 60000);
  
  // Preencher modal
  document.getElementById('confirmacao-placa').textContent = occurrence.plate;
  document.getElementById('confirmacao-apoio').textContent = formatApoioName(occurrence.apoio.tipo);
  document.getElementById('confirmacao-previa').textContent = `${occurrence.apoio.previa.tempoMinutos} min`;
  document.getElementById('confirmacao-real').textContent = `${tempoRealMinutos} min`;
  
  // Texto da diferença com classe apropriada
  const diferencaEl = document.getElementById('confirmacao-diferenca');
  let diferencaTexto = '';
  let diferencaClass = 'metric-ontime';
  
  if (diferencaMinutos > 2) {
    diferencaTexto = `+${diferencaMinutos} min de atraso`;
    diferencaClass = 'metric-delay';
  } else if (diferencaMinutos < -2) {
    diferencaTexto = `${Math.abs(diferencaMinutos)} min adiantado`;
    diferencaClass = 'metric-early';
  } else {
    diferencaTexto = 'No prazo';
    diferencaClass = 'metric-ontime';
  }
  
  diferencaEl.textContent = diferencaTexto;
  diferencaEl.className = `metric-value ${diferencaClass}`;
  
  // Limpar observação
  document.getElementById('confirmacao-observacao').value = '';
  
  // Armazenar ID da ocorrência no modal
  document.getElementById('modal-confirmacao-chegada').dataset.occurrenceId = occurrenceId;
  
  // Abrir modal
  document.getElementById('modal-confirmacao-chegada-overlay').classList.add('open');
}

// Fechar modal de confirmação
function closeConfirmacaoChegadaModal() {
  const overlay = document.getElementById('modal-confirmacao-chegada-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    // Limpar dados após animação
    setTimeout(() => {
      document.getElementById('modal-confirmacao-chegada').dataset.occurrenceId = '';
      document.getElementById('confirmacao-observacao').value = '';
    }, 300);
  }
}

// Confirmar chegada do apoio
function confirmarChegadaApoio(occurrenceId, observacao) {
  const occurrence = occurrences.find(occ => occ.id === occurrenceId);
  if (!occurrence || !occurrence.apoio || !occurrence.apoio.previa) {
    showToastNotification('Erro: Ocorrência não encontrada', 'error');
    return;
  }
  
  // ========================================
  // REGISTRAR CHEGADA
  // ========================================
  
  const agora = new Date();
  const acionadoEm = new Date(occurrence.apoio.acionadoEm);
  const chegadaEstimada = new Date(occurrence.apoio.previa.chegadaEstimada);
  
  // Calcular tempo real (em minutos)
  const tempoRealMs = agora - acionadoEm;
  const tempoRealMinutos = Math.floor(tempoRealMs / 60000);
  
  // Calcular diferença vs prévia
  const diferencaMs = agora - chegadaEstimada;
  const diferencaMinutos = Math.floor(diferencaMs / 60000);
  
  // Determinar status
  let status = 'no_prazo';
  if (diferencaMinutos > 2) {
    status = 'atrasado';
  } else if (diferencaMinutos < -2) {
    status = 'adiantado';
  }
  
  // ========================================
  // SALVAR DADOS DE CHEGADA
  // ========================================
  
  occurrence.apoio.chegada = {
    confirmada: true,
    confirmadaEm: agora.toISOString(),
    confirmadaPor: getCurrentUser(),
    tempoRealMinutos: tempoRealMinutos,
    diferencaMinutos: diferencaMinutos,
    status: status,
    observacao: observacao || ''
  };
  
  // Atualizar status
  occurrence.apoio.statusChegada = 'confirmado';
  
  // ========================================
  // ATUALIZAR INTERFACE
  // ========================================
  
  // Re-renderizar cards
  renderRightPanel();
  
  // Notificação de sucesso
  let mensagem = '';
  if (status === 'atrasado') {
    mensagem = `✅ Chegada confirmada (+${diferencaMinutos} min de atraso)`;
  } else if (status === 'adiantado') {
    mensagem = `✅ Chegada confirmada (${Math.abs(diferencaMinutos)} min adiantado)`;
  } else {
    mensagem = '✅ Chegada confirmada (no prazo)';
  }
  
  showToastNotification(mensagem);
  
  // ========================================
  // LOG MÉTRICA (para relatórios futuros)
  // ========================================
  
  console.log('📊 Métrica de Apoio Registrada:', {
    occurrenceId: occurrenceId,
    plate: occurrence.plate,
    apoioTipo: occurrence.apoio.tipo,
    previaMinutos: occurrence.apoio.previa.tempoMinutos,
    realMinutos: tempoRealMinutos,
    diferencaMinutos: diferencaMinutos,
    status: status,
    timestamp: agora.toISOString(),
    confirmadoPor: getCurrentUser()
  });
}

// Renderizar estado confirmado (verde) no card
function renderEtaConfirmed(occurrence) {
  if (!occurrence.apoio || !occurrence.apoio.chegada || !occurrence.apoio.previa) {
    return '';
  }
  
  const chegada = occurrence.apoio.chegada;
  const previa = occurrence.apoio.previa;
  
  const chegadaTime = new Date(chegada.confirmadaEm);
  const statusClass = chegada.status === 'atrasado' ? 'metric-delay' 
                    : chegada.status === 'adiantado' ? 'metric-early' 
                    : 'metric-ontime';
  
  const diferencaText = chegada.diferencaMinutos > 0
    ? `+${chegada.diferencaMinutos} min de atraso`
    : chegada.diferencaMinutos < 0
    ? `${Math.abs(chegada.diferencaMinutos)} min adiantado`
    : 'No prazo';
  
  return `
    <div class="eta-display eta-display-confirmed" data-status="confirmado">
      <!-- Ícone de sucesso -->
      <div class="eta-icon eta-icon-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      
      <!-- Informações -->
      <div class="eta-info">
        <div class="eta-label eta-label-success">✅ Apoio Chegou</div>
        <div class="eta-confirmed-info">
          <div class="confirmed-time">
            Chegou às ${chegadaTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
          </div>
          <div class="confirmed-metrics">
            <span class="metric ${statusClass}">${diferencaText}</span>
            <span class="metric-separator">·</span>
            <span class="metric">Prévia: ${previa.tempoMinutos} min / Real: ${chegada.tempoRealMinutos} min</span>
          </div>
        </div>
        <div class="eta-details">
          <span class="eta-company">${formatApoioName(occurrence.apoio.tipo)}</span>
          <span class="eta-separator">·</span>
          <span class="confirmed-by">Confirmado por ${chegada.confirmadaPor}</span>
        </div>
      </div>
      
      <!-- Badge de status -->
      <div class="arrival-status-badge badge-${chegada.status}">
        ${chegada.diferencaMinutos > 0 ? `+${chegada.diferencaMinutos}` : chegada.diferencaMinutos} min
      </div>
    </div>
  `;
}

// Event listeners para modal de confirmação
document.addEventListener('DOMContentLoaded', function() {
  // Botão fechar modal
  const btnCloseConfirmacao = document.getElementById('modal-confirmacao-close');
  if (btnCloseConfirmacao) {
    btnCloseConfirmacao.addEventListener('click', closeConfirmacaoChegadaModal);
  }
  
  // Botão cancelar
  const btnCancelarConfirmacao = document.getElementById('btn-cancelar-confirmacao');
  if (btnCancelarConfirmacao) {
    btnCancelarConfirmacao.addEventListener('click', closeConfirmacaoChegadaModal);
  }
  
  // Botão confirmar definitivo
  const btnConfirmarDefinitivo = document.getElementById('btn-confirmar-definitivo');
  if (btnConfirmarDefinitivo) {
    btnConfirmarDefinitivo.addEventListener('click', function() {
      const occurrenceId = parseInt(document.getElementById('modal-confirmacao-chegada').dataset.occurrenceId);
      const observacao = document.getElementById('confirmacao-observacao').value.trim();
      
      if (!occurrenceId) {
        showToastNotification('Erro: ID da ocorrência não encontrado', 'error');
        return;
      }
      
      // Confirmar chegada
      confirmarChegadaApoio(occurrenceId, observacao);
      
      // Fechar modal
      closeConfirmacaoChegadaModal();
    });
  }
  
  // Fechar modal ao clicar no backdrop
  const confirmacaoOverlay = document.getElementById('modal-confirmacao-chegada-overlay');
  if (confirmacaoOverlay) {
    confirmacaoOverlay.addEventListener('click', function(e) {
      if (e.target === confirmacaoOverlay) {
        closeConfirmacaoChegadaModal();
      }
    });
  }
  
  // Fechar modal com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modalOverlay = document.getElementById('modal-confirmacao-chegada-overlay');
      if (modalOverlay && modalOverlay.classList.contains('open')) {
        closeConfirmacaoChegadaModal();
      }
    }
  });
  
  // Event delegation para botões de confirmar chegada nos cards
  document.addEventListener('click', function(e) {
    const btnConfirmar = e.target.closest('.btn-confirmar-chegada');
    
    if (btnConfirmar) {
      e.preventDefault();
      const occurrenceId = parseInt(btnConfirmar.dataset.occurrenceId);
      
      if (occurrenceId) {
        openConfirmacaoChegadaModal(occurrenceId);
      }
    }
  });
});
