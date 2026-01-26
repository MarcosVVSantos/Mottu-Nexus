const occurrences = [
  { id: 1, plate: 'ABC-1234', status: 'em_andamento', priority: 'alta', description: 'Tentativa 1: motorista ausente', time: '08:12', coords: [-23.5489, -46.6388], agentNote: 'Porta trancada.' },
  { id: 2, plate: 'ABC-1234', status: 'em_andamento', priority: 'media', description: 'Tentativa 2: local não encontrado', time: '09:05', coords: [-23.5520, -46.6402], agentNote: 'Endereço incorreto.' },
  { id: 3, plate: 'XYZ-9090', status: 'analisada', priority: 'media', description: 'Equipe verificou, sem prova de apropriação', time: '07:40', coords: [-23.5614, -46.6559], agentNote: 'Sem evidências.' },
  { id: 4, plate: 'KLM-7765', status: 'encerrada', priority: 'baixa', description: 'Caso encerrado - veículo recuperado', time: '06:30', coords: [-23.5702, -46.6511], agentNote: 'Recuperada.' }
];

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

  const em = occurrences.filter(o => o.status === 'em_andamento');
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
      <div class="card-body compact">
        <div class="telemetry-row">
          <div class="tele-item"><i data-lucide="battery"></i><span class="tele-label">Bateria</span><div class="tele-val">78%</div></div>
          <div class="tele-item"><i data-lucide="map-pin"></i><span class="tele-label">GPS</span><div class="tele-val">${o.coords[0].toFixed(4)}, ${o.coords[1].toFixed(4)}</div></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-small btn-outline" data-details="${o.id}" title="Detalhes">Detalhes</button>
        <button class="btn-small btn-support" data-support="${o.id}" title="Solicitar apoio"><i data-lucide="user-plus"></i> Apoio</button>
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
  try { if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace(); } catch(e) {}
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
  try { if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace(); } catch(e) {}
  // comments
  // editable comments / info adicionais
  document.getElementById('detail-comments').innerHTML = `
    <div class="item"><label class="field"><span><i data-lucide="message-square"></i> Comentários</span><textarea id="detail-comments-input" rows="4" placeholder="Notas do agente">${occ.agentNote || ''}</textarea></label></div>
  `;
  try { if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace(); } catch(e) {}
  // questions (placeholder)
  document.getElementById('detail-questions').innerHTML = `
    <div class="item"><strong><i data-lucide="phone-forwarded"></i> 190 foi feito?</strong><div>—</div></div>
    <div class="item"><strong><i data-lucide="hash"></i> Protocolo</strong><div>—</div></div>
    <div class="item"><strong><i data-lucide="git-branch"></i> KM Final</strong><div>—</div></div>
  `;
  try { if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace(); } catch(e) {}
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
    openChatModal();
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
function openChatModal() {
  const m = document.getElementById('modal-chat'); if (!m) return;
  m.classList.add('open'); m.setAttribute('aria-hidden','false');
  document.getElementById('chat-input')?.focus();
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
  const user = getCurrentUser(); const time = new Date().toLocaleTimeString('pt-BR');
  const item = document.createElement('div');
  item.className = 'chat-item';
  item.innerHTML = `<div style="margin-bottom:6px"><strong>${escapeHtml(user)}</strong> <small class="muted">${escapeHtml(time)}</small><div>${escapeHtml(text)}</div></div>`;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
  input.value = '';
  // Optionally close the modal or keep open; keep open for conversation
});

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
  initMap();
  wireUI();
  renderRightPanel();
  // Replace any lucide placeholders present on initial load and run diagnostics
  try {
    if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace();
  } catch(e) {}
  checkAffordances();
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
  try { if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace(); } catch(e) {}
  checkAffordances();
}

// Diagnostic helper: logs status of lucide replacement and elements
function checkAffordances() {
  try {
    // helper to dynamically load script
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = () => resolve(s);
        s.onerror = (err) => reject(err);
        document.head.appendChild(s);
      });
    }

    const totalPlaceholders = document.querySelectorAll('i[data-lucide]').length;
    if (totalPlaceholders === 0) { console.info('[affordance-debug] no lucide placeholders found — nothing to do'); return; }
    const svgs = document.querySelectorAll('.icon-affordance svg, .icon-btn svg, i[data-lucide] svg');
    const svgsVisible = Array.from(svgs).filter(s => {
      const r = s.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).length;
    console.info('[affordance-debug] placeholders:', totalPlaceholders, 'svgs found:', svgs.length, 'visible svgs:', svgsVisible);

    if (totalPlaceholders > 0 && !window.lucide) {
      console.warn('[affordance-debug] lucide not found — attempting to load fallback CDN.');
      loadScript('https://cdn.jsdelivr.net/npm/lucide@0.258.0/dist/lucide.min.js').then(() => {
        console.info('[affordance-debug] fallback lucide loaded');
        try { if (window.lucide && typeof window.lucide.replace === 'function') window.lucide.replace(); } catch (err) { console.error('[affordance-debug] lucide.replace() failed after fallback', err); }
      }).catch(err => {
        console.error('[affordance-debug] failed to load fallback lucide', err);
        // soft fallback: convert a few common placeholders to inline SVG so affordances remain visible
        document.querySelectorAll('i[data-lucide]').forEach(i => {
          const name = i.dataset.lucide;
          if (name === 'copy') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          if (name === 'map') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 7 3 13 6 23 3 23 18 13 21 7 18 1 21 1 6"></polygon><line x1="7" y1="3" x2="7" y2="18"></line></svg>';
          if (name === 'x') i.outerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        });
      });
    } else if (totalPlaceholders > 0 && window.lucide && typeof window.lucide.replace === 'function') {
      try { window.lucide.replace(); } catch (err) { console.error('[affordance-debug] lucide.replace() failed', err); }
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
