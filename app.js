(() => {
  const STORAGE_KEY = 'mendbook.records.v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const categoryNames = { home: 'ДОМ', electronics: 'ЭЛЕКТРОНИКА', transport: 'ТРАНСПОРТ', tools: 'ИНСТРУМЕНТЫ', other: 'ДРУГОЕ' };
  const categoryIcons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3zM9 20v-6h6v6"/></svg>',
    electronics: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M10 18.5h4"/></svg>',
    transport: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="m6 17 4.5-8h3l4.5 8h-6l-3-5h-2m6-4 2-2h3"/></svg>',
    tools: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5a5 5 0 0 0-6.6 6.6l-5.2 5.2a2.1 2.1 0 0 0 3 3l5.2-5.2a5 5 0 0 0 6.6-6.6l-3.1 3.1-3-3z"/></svg>',
    other: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>'
  };
  const icons = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7zM17 11h.01"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>'
  };
  const ruDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const ruShortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
  const isoToday = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const shiftDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const dateValue = (value) => value ? new Date(`${value}T12:00:00`) : null;
  const dateText = (value, formatter = ruDate) => { const d = dateValue(value); return d && !Number.isNaN(d.getTime()) ? formatter.format(d) : 'Дата не указана'; };
  const safeText = (value, max = 500) => String(value ?? '').trim().slice(0, max);
  const uid = () => globalThis.crypto?.randomUUID?.() || `mb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  function addMonths(isoDate, months) {
    const base = dateValue(isoDate);
    if (!base || !Number.isFinite(Number(months))) return null;
    const day = base.getDate();
    base.setDate(1);
    base.setMonth(base.getMonth() + Number(months));
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    base.setDate(Math.min(day, lastDay));
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
  }

  const seed = () => ([
    { id: uid(), name: 'Городской велосипед', category: 'transport', purchased: shiftDate(-590), price: 38900, warrantyMonths: 24, serial: 'STELS / рама 54 · сер. 8K2-41', note: 'Чек — в облачной папке «Гарантии». Ключ на 15 мм висит в кладовой.', events: [
      { id: uid(), title: 'Заменил цепь и настроил переключатель', date: shiftDate(-34), cost: 2450, details: 'Цепь KMC X8. Смазать после следующей длинной поездки.', reminderDate: shiftDate(28) },
      { id: uid(), title: 'Первое ТО', date: shiftDate(-290), cost: 900, details: 'Подтянуты спицы, проверены тормоза.', reminderDate: null }
    ] },
    { id: uid(), name: 'Настольная лампа', category: 'home', purchased: shiftDate(-860), price: 7290, warrantyMonths: 12, serial: 'IKEA / FORSÅ · чёрная', note: 'В коробке есть запасная пружина. Лампочка E14, тёплый свет.', events: [
      { id: uid(), title: 'Поменял патрон', date: shiftDate(-122), cost: 380, details: 'Старый контакт грелся. Подходит керамический патрон E14.', reminderDate: null }
    ] },
    { id: uid(), name: 'Телефон', category: 'electronics', purchased: shiftDate(-191), price: 54990, warrantyMonths: 12, serial: 'Pixel 8a · IMEI хранится на коробке', note: 'Чек — в почте, письмо от магазина от даты покупки.', events: [] }
  ]);

  function loadData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && parsed.version === 1 && Array.isArray(parsed.items)) return parsed.items;
    } catch (error) { console.warn('Mendbook: не удалось прочитать локальную картотеку.', error); }
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items: initial }));
    return initial;
  }

  const state = { items: loadData(), selectedId: null, filter: 'all', search: '', deleteId: null, editId: null, toastTimer: 0 };
  state.selectedId = state.items[0]?.id || null;
  const itemList = $('#itemList');
  const record = $('#record');
  const itemDialog = $('#itemDialog');
  const serviceDialog = $('#serviceDialog');
  const toast = $('#toast');

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items: state.items }));
  }

  function warranty(item) {
    const months = Number(item.warrantyMonths || 0);
    const end = months > 0 && item.purchased ? addMonths(item.purchased, months) : null;
    const remaining = end ? Math.ceil((dateValue(end) - dateValue(isoToday())) / 86400000) : null;
    return { end, remaining, active: remaining !== null && remaining >= 0 };
  }

  function reminder(item) {
    return (item.events || []).map((event) => event.reminderDate).filter(Boolean).sort()[0] || null;
  }

  function isDue(item) {
    const next = reminder(item);
    return Boolean(next && next <= shiftDate(30));
  }

  function formatMoney(value) { return Number(value) > 0 ? money.format(Number(value)) : '—'; }
  function totalServiceCost(item) { return (item.events || []).reduce((sum, event) => sum + (Number(event.cost) || 0), 0); }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function visibleItems() {
    const search = state.search.toLocaleLowerCase('ru');
    return state.items.filter((item) => {
      const matchesSearch = `${item.name} ${item.serial || ''} ${item.note || ''}`.toLocaleLowerCase('ru').includes(search);
      if (!matchesSearch) return false;
      if (state.filter === 'warranty') return warranty(item).active;
      if (state.filter === 'service') return isDue(item);
      return true;
    });
  }

  function renderList() {
    const items = visibleItems();
    $('#itemCount').textContent = String(state.items.length).padStart(2, '0');
    $$('.filter-chip').forEach((button) => button.classList.toggle('is-active', button.dataset.filter === state.filter));
    itemList.innerHTML = items.map((item) => {
      const warr = warranty(item);
      const due = isDue(item);
      const status = due ? 'ПРОВЕРИТЬ · ' + dateText(reminder(item), ruShortDate).toLocaleUpperCase('ru') : warr.active ? `ГАРАНТИЯ · ДО ${dateText(warr.end, ruShortDate).toLocaleUpperCase('ru')}` : categoryNames[item.category] || categoryNames.other;
      const dot = due ? 'is-due' : warr.active ? 'is-warranty' : '';
      return `<button class="item-card ${item.id === state.selectedId ? 'is-selected' : ''}" type="button" data-item-id="${escapeAttr(item.id)}" aria-pressed="${item.id === state.selectedId}">
        <span class="item-card-icon">${categoryIcons[item.category] || categoryIcons.other}</span>
        <span class="item-card-copy"><span class="item-card-name">${escapeHtml(item.name)}</span><span class="item-card-meta">${escapeHtml(status)}</span></span><i class="item-card-dot ${dot}" aria-hidden="true"></i>
      </button>`;
    }).join('');
    if (!items.length) {
      itemList.innerHTML = '<div class="empty-timeline">Ничего не нашлось. Попробуйте другой запрос.</div>';
      state.selectedId = null;
      renderRecord(null);
      return;
    }
    if (items.length && !items.some((item) => item.id === state.selectedId)) {
      state.selectedId = items[0].id;
      renderList();
      return;
    }
  }

  function renderRecord(item) {
    if (!item) {
      record.innerHTML = `<div class="empty-state"><div class="empty-mark">M</div><h2>${state.items.length ? 'Ничего не найдено' : 'Начните с одной вещи'}</h2><p>${state.items.length ? 'Сбросьте фильтр или поменяйте поисковый запрос.' : 'Добавьте то, что хотите сохранить: от велосипеда до кофемолки.'}</p>${state.items.length ? '' : '<button class="primary-button" type="button" id="emptyAddButton">Добавить вещь <span>↗</span></button>'}</div>`;
      return;
    }
    const warr = warranty(item);
    const upcoming = reminder(item);
    const due = isDue(item);
    const events = [...(item.events || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const statusText = warr.active ? `Гарантия действует ещё ${warr.remaining} ${plural(warr.remaining, 'день', 'дня', 'дней')} — до ${dateText(warr.end)}` : warr.end ? `Гарантия закончилась ${dateText(warr.end)}` : 'Гарантия не записана';
    const purchaseAge = item.purchased ? `${Math.floor((Date.now() - dateValue(item.purchased).getTime()) / 86400000 / 30.44)} мес. в пользовании` : 'Дата покупки не указана';
    const statusClass = due || (warr.end && !warr.active) ? 'is-alert' : '';
    const entries = events.length ? events.map((event) => `<article class="timeline-entry">
        <div class="entry-date">${escapeHtml(dateText(event.date))}</div><h4 class="entry-title">${escapeHtml(event.title)}</h4>
        ${event.details ? `<div class="entry-detail">${escapeHtml(event.details)}</div>` : ''}
        ${Number(event.cost) > 0 ? `<span class="entry-cost">РАСХОД ${escapeHtml(formatMoney(event.cost))}</span>` : ''}
        ${event.reminderDate ? `<div class="entry-reminder">Проверить снова · ${escapeHtml(dateText(event.reminderDate))}</div>` : ''}
      </article>`).join('') : '<div class="empty-timeline">Здесь появятся работы, замены деталей и важные наблюдения.</div>';
    record.innerHTML = `
      <div class="record-topline">
        <div class="record-category"><span class="detail-icon">${categoryIcons[item.category] || categoryIcons.other}</span>${escapeHtml(categoryNames[item.category] || categoryNames.other)} <span aria-hidden="true">/</span> КАРТОЧКА ВЕЩИ</div>
        <div class="record-actions"><button class="small-action" type="button" id="editButton" title="Изменить карточку" aria-label="Изменить карточку">${icons.edit}</button><button class="small-action" type="button" id="printButton" title="Распечатать карточку" aria-label="Распечатать карточку">${icons.print}</button><button class="small-action" type="button" id="deleteButton" title="Удалить карточку" aria-label="Удалить карточку">${icons.trash}</button></div>
      </div>
      <h2>${escapeHtml(item.name)}</h2><div class="record-subtitle">${escapeHtml(purchaseAge)} ${item.purchased ? `· куплено ${escapeHtml(dateText(item.purchased))}` : ''}</div>
      <div class="status-strip ${statusClass}">${icons.check}<span><strong>${escapeHtml(statusText)}</strong>${due ? ` · следующая проверка ${escapeHtml(dateText(upcoming))}` : ''}</span></div>
      <div class="stats-grid">
        <div class="stat"><span class="stat-label">ПОКУПКА</span><span class="stat-value">${escapeHtml(formatMoney(item.price))}</span><span class="stat-caption">${item.purchased ? 'сохранено в карточке' : 'стоимость не указана'}</span></div>
        <div class="stat"><span class="stat-label">РЕМОНТЫ</span><span class="stat-value">${events.length}</span><span class="stat-caption">${events.length ? `расходы ${escapeHtml(formatMoney(totalServiceCost(item)))}` : 'пока без записей'}</span></div>
        <div class="stat"><span class="stat-label">ГАРАНТИЯ</span><span class="stat-value">${warr.active ? `${warr.remaining} дн.` : warr.end ? 'истекла' : '—'}</span><span class="stat-caption">${warr.end ? `до ${escapeHtml(dateText(warr.end, ruShortDate))}` : 'срок не указан'}</span></div>
      </div>
      <div class="record-grid">
        <section class="timeline-section" aria-labelledby="timelineTitle"><div class="timeline-head"><div><div class="section-kicker">РЕМОНТ · УХОД · ЗАМЕТКИ</div><h3 id="timelineTitle">История вещи</h3></div><button class="log-button" type="button" id="addServiceButton"><span>+</span> Записать работу</button></div><div class="timeline">${entries}</div></section>
        <aside class="note-card"><div class="section-kicker">НЕ ПОТЕРЯТЬ</div><h3>На полях</h3><p class="${item.note ? '' : 'note-empty'}">${escapeHtml(item.note || 'Добавьте здесь подсказку о чеке, запасных деталях или месте хранения.')}</p><span class="serial">${escapeHtml(item.serial || 'Серийный номер не указан')}</span><button class="decision-button" type="button" id="decisionButton"><span>↗</span> Сравнить ремонт и замену</button></aside>
      </div>`;
    $('#editButton', record).addEventListener('click', () => openItemDialog(item));
    $('#printButton', record).addEventListener('click', () => window.print());
    $('#deleteButton', record).addEventListener('click', () => { state.deleteId = item.id; $('#confirmDialog').showModal(); });
    $('#addServiceButton', record).addEventListener('click', openServiceDialog);
    $('#decisionButton', record).addEventListener('click', openDecisionDialog);
  }

  function render() {
    renderList();
    renderRecord(state.items.find((item) => item.id === state.selectedId) || null);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }
  function plural(number, one, few, many) {
    const n = Math.abs(Number(number)) % 100;
    if (n > 10 && n < 20) return many;
    const digit = n % 10;
    if (digit === 1) return one;
    if (digit >= 2 && digit <= 4) return few;
    return many;
  }

  function openServiceDialog() {
    const form = $('#serviceForm');
    form.reset();
    form.elements.date.value = isoToday();
    form.elements.reminderDate.disabled = true;
    serviceDialog.showModal();
    form.elements.title.focus();
  }

  function openItemDialog(item = null) {
    const form = $('#itemForm');
    form.reset();
    state.editId = item?.id || null;
    $('#itemDialogKicker').textContent = item ? 'ПРАВКА ЗАПИСИ' : 'НОВАЯ ЗАПИСЬ';
    $('#itemDialogTitle').textContent = item ? 'Изменить вещь' : 'Добавить вещь';
    $('#saveItemButton').innerHTML = item ? 'Сохранить изменения <span>↗</span>' : 'Создать карточку <span>↗</span>';
    if (item) {
      for (const field of ['name', 'category', 'purchased', 'price', 'warrantyMonths', 'serial', 'note']) {
        form.elements[field].value = item[field] ?? '';
      }
    }
    itemDialog.showModal();
    form.elements.name.focus();
  }

  function resetItemDialog() {
    state.editId = null;
    $('#itemDialogKicker').textContent = 'НОВАЯ ЗАПИСЬ';
    $('#itemDialogTitle').textContent = 'Добавить вещь';
    $('#saveItemButton').innerHTML = 'Создать карточку <span>↗</span>';
  }

  function openDecisionDialog() {
    const form = $('#decisionForm');
    form.reset();
    $('#decisionResult').hidden = true;
    $('#decisionResult').classList.remove('is-replace');
    $('#decisionDialog').showModal();
    form.elements.repairCost.focus();
  }

  $('#addItemButton').addEventListener('click', () => openItemDialog());
  itemList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-item-id]');
    if (!button) return;
    state.selectedId = button.dataset.itemId;
    render();
  });
  $$('.filter-chip').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter; renderList(); renderRecord(state.items.find((item) => item.id === state.selectedId) || null); }));
  $('#searchInput').addEventListener('input', (event) => { state.search = event.target.value.trim(); renderList(); renderRecord(state.items.find((item) => item.id === state.selectedId) || null); });
  record.addEventListener('click', (event) => { if (event.target.closest('#emptyAddButton')) openItemDialog(); });

  $('#itemForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = { name: safeText(data.get('name'), 70), category: safeText(data.get('category'), 20), purchased: safeText(data.get('purchased'), 10), price: Number(data.get('price')) || 0, warrantyMonths: Number(data.get('warrantyMonths')) || 0, serial: safeText(data.get('serial'), 100), note: safeText(data.get('note'), 240) };
    const existingIndex = state.items.findIndex((item) => item.id === state.editId);
    const item = existingIndex >= 0 ? { ...state.items[existingIndex], ...values } : { id: uid(), ...values, events: [] };
    if (!item.name) return;
    if (existingIndex >= 0) state.items[existingIndex] = item;
    else state.items.unshift(item);
    state.selectedId = item.id;
    state.filter = 'all';
    state.search = '';
    $('#searchInput').value = '';
    const wasEdit = existingIndex >= 0;
    resetItemDialog();
    persist(); render(); itemDialog.close(); showToast(wasEdit ? 'Изменения сохранены.' : 'Карточка добавлена в журнал.');
  });

  $('#serviceForm').elements.reminder.addEventListener('change', (event) => {
    const dateField = $('#serviceForm').elements.reminderDate;
    dateField.disabled = !event.target.checked;
    if (event.target.checked && !dateField.value) dateField.value = shiftDate(90);
    if (event.target.checked) dateField.focus();
  });
  $('#serviceForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = state.items.find((entry) => entry.id === state.selectedId);
    if (!item) return;
    const data = new FormData(event.currentTarget);
    item.events ||= [];
    item.events.push({ id: uid(), title: safeText(data.get('title'), 90), date: safeText(data.get('date'), 10) || isoToday(), cost: Number(data.get('cost')) || 0, details: safeText(data.get('details'), 500), reminderDate: data.get('reminder') === 'on' ? safeText(data.get('reminderDate'), 10) : null });
    persist(); render(); serviceDialog.close(); showToast('Работа добавлена в историю.');
  });

  $('#decisionForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const repairCost = Number(form.elements.repairCost.value);
    const repairMonths = Number(form.elements.repairMonths.value);
    const replacementCost = Number(form.elements.replacementCost.value);
    const replacementMonths = Number(form.elements.replacementMonths.value);
    if (!(repairCost >= 0 && repairMonths > 0 && replacementCost > 0 && replacementMonths > 0)) return;
    const repairMonthly = repairCost / repairMonths;
    const replacementMonthly = replacementCost / replacementMonths;
    const repairRatio = replacementCost ? repairCost / replacementCost : 0;
    const repairWins = repairCost < replacementCost && repairMonthly <= replacementMonthly;
    const cheaperMonthly = Math.min(repairMonthly, replacementMonthly);
    const scale = Math.max(repairMonthly, replacementMonthly, 1);
    const result = $('#decisionResult');
    result.classList.toggle('is-replace', !repairWins);
    result.innerHTML = `<div class="section-kicker">СРАВНЕНИЕ НА ВАШИХ ОЦЕНКАХ</div>
      <h3>${repairWins ? 'Ремонт выглядит разумнее' : 'Замена обойдётся выгоднее'}</h3>
      <p>${repairWins
        ? `Ремонт составляет ${Math.round(repairRatio * 100)}% цены замены и даёт меньшую стоимость месяца пользования.`
        : `По вашим срокам ремонт стоит ${escapeHtml(money.format(repairMonthly))} в месяц, замена — ${escapeHtml(money.format(replacementMonthly))}.`}
        Это ориентир: сравнение не учитывает простои, удобство, гарантию и стоимость утилизации.</p>
      <div class="decision-compare">
        <div class="decision-option"><span>ПОЧИНИТЬ</span><span class="decision-track"><i class="decision-fill" style="width:${Math.max(2, repairMonthly / scale * 100)}%"></i></span><span class="decision-cost">${escapeHtml(money.format(repairMonthly))} / мес.</span></div>
        <div class="decision-option is-replace"><span>ЗАМЕНИТЬ</span><span class="decision-track"><i class="decision-fill" style="width:${Math.max(2, replacementMonthly / scale * 100)}%"></i></span><span class="decision-cost">${escapeHtml(money.format(replacementMonthly))} / мес.</span></div>
      </div>
      <p class="decision-assumption">${repairWins ? `Расчёт ремонта: ${escapeHtml(money.format(repairCost))} ÷ ${repairMonths} мес.` : `Расчёт замены: ${escapeHtml(money.format(replacementCost))} ÷ ${replacementMonths} мес.`}</p>`;
    result.hidden = false;
  });

  $('#confirmForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = state.deleteId;
    state.items = state.items.filter((item) => item.id !== id);
    state.selectedId = state.items[0]?.id || null;
    state.deleteId = null;
    persist(); render(); $('#confirmDialog').close(); showToast('Карточка удалена.');
  });
  $$('[data-close]').forEach((button) => button.addEventListener('click', () => {
    const dialog = $(`#${button.dataset.close}`);
    dialog.close();
    if (dialog === itemDialog) resetItemDialog();
  }));
  itemDialog.addEventListener('close', resetItemDialog);
  $('#exportButton').addEventListener('click', () => {
    const backup = { format: 'mendbook-backup', version: 1, exportedAt: new Date().toISOString(), items: state.items };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `mendbook-backup-${isoToday()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Резервная копия сохранена на устройство.');
  });
  $('#importFile').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.format !== 'mendbook-backup' || data.version !== 1 || !Array.isArray(data.items) || data.items.length > 500) throw new Error('Не подходит формат');
      const imported = data.items.map((item) => ({
        id: safeText(item.id, 100) || uid(), name: safeText(item.name, 70), category: categoryNames[item.category] ? item.category : 'other',
        purchased: /^\d{4}-\d{2}-\d{2}$/.test(item.purchased) ? item.purchased : '', price: Math.max(0, Number(item.price) || 0),
        warrantyMonths: Math.max(0, Math.min(120, Number(item.warrantyMonths) || 0)), serial: safeText(item.serial, 100), note: safeText(item.note, 240),
        events: Array.isArray(item.events) ? item.events.slice(0, 1000).map((entry) => ({ id: safeText(entry.id, 100) || uid(), title: safeText(entry.title, 90), date: /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? entry.date : '', cost: Math.max(0, Number(entry.cost) || 0), details: safeText(entry.details, 500), reminderDate: /^\d{4}-\d{2}-\d{2}$/.test(entry.reminderDate) ? entry.reminderDate : null })).filter((entry) => entry.title) : []
      })).filter((item) => item.name);
      if (!imported.length) throw new Error('В копии нет карточек');
      if (!window.confirm(`Заменить текущую картотеку ${imported.length} карточками из резервной копии? Сначала скачайте копию текущих данных, если хотите сохранить её.`)) return;
      state.items = imported; state.selectedId = imported[0].id; state.filter = 'all'; state.search = ''; $('#searchInput').value = '';
      persist(); render(); showToast('Резервная копия восстановлена.');
    } catch (error) { showToast(error instanceof SyntaxError ? 'Файл не похож на резервную копию Mendbook.' : error.message || 'Не удалось восстановить данные.'); }
    finally { event.target.value = ''; }
  });

  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js?v=2').catch((error) => console.warn('Mendbook: офлайн-кэш не включился.', error));
  }
})();
