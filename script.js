const state = {
  modules: {
    workspace: {done:0,total:6},
    web: {done:0,total:5},
    telegram: {done:0,total:5},
    slack: {done:0,total:4},
    discipline: {done:0,total:4},
  },
  casesOpened: 0
};

const storageKey = "support-onboarding-demo-v1";

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}
function load() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state.modules, parsed.modules || {});
    state.casesOpened = parsed.casesOpened || 0;
  } catch {}
}

function allItems() {
  return [...document.querySelectorAll(".check-row[data-item], .discipline-item[data-item]")];
}
function moduleForElement(el) {
  const card = el.closest("[data-module-card]");
  if (card) return card.dataset.moduleCard;
  const section = el.closest(".module-section");
  if (!section) return null;
  const progress = section.querySelector("[data-module]");
  return progress?.dataset.module || null;
}
function updateEvolution(pct) {
  const stages = [...document.querySelectorAll(".evo-stage")];
  if (!stages.length) return;
  const activeStage = Math.min(3, Math.floor(pct / 25));
  stages.forEach((stage, index) => {
    stage.classList.remove("is-complete", "is-current", "is-locked");
    if (index < activeStage) stage.classList.add("is-complete");
    else if (index === activeStage) stage.classList.add("is-current");
    else stage.classList.add("is-locked");
  });
}

function refresh() {
  let done = 0, total = 0, completeModules = 0;
  for (const [key, val] of Object.entries(state.modules)) {
    const progress = document.querySelector(`[data-module="${key}"]`);
    if (progress) progress.textContent = `${val.done} / ${val.total}`;
    done += val.done; total += val.total;
    if (val.done === val.total) completeModules++;
  }
  const pct = Math.round((done / total) * 100);
  updateEvolution(pct);
  document.querySelector("#progressPercent").textContent = pct + "%";
  document.querySelector("#heroProgress").textContent = pct + "%";
  document.querySelector("#finalPercent").textContent = pct + "%";
  document.querySelector("#finalModules").textContent = `${completeModules} / 5`;
  document.querySelector("#finalBar").style.width = pct + "%";
  document.querySelector("#railFill").style.height = pct + "%";
  document.querySelector("#rail-dot")?.style.setProperty("bottom", `calc(${pct}% - 3px)`);

  const character = document.querySelector("#character");
  const badge = document.querySelector("#levelBadge");
  const status = document.querySelector("#statusLabel");
  const next = document.querySelector("#nextUnlock");
  const final = pct >= 100;

  if (pct < 25) {
    badge.textContent = "УРОВЕНЬ 01 · НОВИЧОК";
    status.textContent = "Новичок";
    next.textContent = "Основы рабочего места";
    character.style.transform = "translateY(4px) scale(.96)";
  } else if (pct < 50) {
    badge.textContent = "УРОВЕНЬ 02 · СТАЖЁР";
    status.textContent = "Осваивается";
    next.textContent = "Основы веб-платформы";
    character.style.transform = "translateY(0) scale(1)";
  } else if (pct < 75) {
    badge.textContent = "УРОВЕНЬ 03 · ОПЕРАТОР";
    status.textContent = "Обрабатывает запросы";
    next.textContent = "Эскалации между отделами";
    character.style.transform = "translateY(-2px) scale(1.03)";
  } else if (pct < 100) {
    badge.textContent = "УРОВЕНЬ 04 · ОПЫТНЫЙ";
    status.textContent = "Опытный оператор";
    next.textContent = "Финальная проверка";
    character.style.transform = "translateY(-4px) scale(1.06)";
  } else {
    badge.textContent = "УРОВЕНЬ 05 · ГОТОВ";
    status.textContent = "Готов к работе";
    next.textContent = "Поддерживай стандарт";
    character.style.transform = "translateY(-6px) scale(1.08)";
    document.querySelector("#finalTitle").innerHTML = "Ты<br /><span>готов к работе.</span>";
    document.querySelector("#finalText").textContent = "Основной путь онбординга завершён. Держи базу знаний под рукой во время смены.";
  }

  save();
}

function hydrateChecks() {
  for (const row of allItems()) {
    row.classList.remove("done");
  }
  for (const [key, val] of Object.entries(state.modules)) {
    const section = document.querySelector(`[data-module-card="${key}"]`);
    if (!section) continue;
    const rows = [...section.querySelectorAll("[data-item]")];
    rows.slice(0, val.done).forEach(r => r.classList.add("done"));
  }
}

function initChecks() {
  document.querySelectorAll(".check-circle").forEach(btn => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-item]");
      const key = moduleForElement(row);
      if (!key || !state.modules[key]) return;
      const rows = [...row.closest("[data-module-card]")?.querySelectorAll("[data-item]") || []];
      const wasDone = row.classList.contains("done");
      if (wasDone) {
        row.classList.remove("done");
        state.modules[key].done = Math.max(0, state.modules[key].done - 1);
      } else {
        row.classList.add("done");
        state.modules[key].done = Math.min(state.modules[key].total, state.modules[key].done + 1);
      }
      refresh();
      pulse(btn);
    });
  });
}
function pulse(el) {
  el.animate([{transform:"scale(1)"},{transform:"scale(1.35)"},{transform:"scale(1)"}],{duration:280});
}

const playbooks = {
  payout: {
    tag:"ВЫПЛАТЫ",
    title:"Запрос на выплату",
    body:`<p><strong>Ситуация:</strong> трейдер просит поддержку направить выплату.</p>
    <ol><li>Отметь запрос как принятый.</li><li>Открой веб-платформу и выбери валюту трейдера.</li><li>Используй фильтр <strong>NEW</strong>, чтобы не взять уже обрабатываемую выплату.</li><li>Направь нужную выплату, если это разрешено процедурой.</li><li>Ответь стандартной короткой формулировкой.</li></ol>
    <p><strong>Типичный ответ:</strong> «Направили по возможности.»</p>`
  },
  deal: {
    tag:"СДЕЛКИ",
    title:"Проверка сделки по ID",
    body:`<p><strong>Ситуация:</strong> трейдер отправляет ID сделки и просит проверить проблему.</p>
    <ol><li>Прими запрос в Telegram.</li><li>Введи ID в веб-платформу.</li><li>Проверь статус, таймер и текущую операцию.</li><li>Выполни разрешённое действие или объясни, что можно сделать.</li><li>Передай вопрос дальше, если он относится к другому отделу.</li></ol>`
  },
  access: {
    tag:"ДОСТУП",
    title:"Проблема со входом",
    body:`<p><strong>Ситуация:</strong> трейдер не может войти на платформу.</p>
    <ol><li>Проверь контекст запроса.</li><li>Открой утверждённый сценарий восстановления доступа.</li><li>Сбрось или восстанови доступ по действующему процессу.</li><li>Сообщи трейдеру следующий шаг.</li></ol>`
  },
  traffic: {
    tag:"ТРАФИК",
    title:"Жалоба на низкий трафик",
    body:`<p><strong>Ситуация:</strong> трейдер спрашивает, почему мало трафика.</p>
    <ol><li>Подтверди, что запрос понятен.</li><li>Используй утверждённый ответ о том, что поддержка работает над увеличением трафика.</li><li>Не обещай точные сроки восстановления.</li><li>Передавай запрос дальше, когда требуется дополнительная проверка.</li></ol>`
  },
  escalation: {
    tag:"ЭСКАЛАЦИЯ",
    title:"Жалоба на курс",
    body:`<p><strong>Ситуация:</strong> трейдер сообщает, что текущий курс его не устраивает.</p>
    <ol><li>Определи, что корректировка курса не входит в прямые действия поддержки.</li><li>Передай сообщение и контекст ответственному отделу или менеджеру.</li><li>Сохрани понятный контекст исходного диалога и вернись с ответом, когда он появится.</li></ol>`
  },
  history: {
    tag:"СДЕЛКИ",
    title:"Проверка истории транзакций",
    body:`<p><strong>Ситуация:</strong> трейдер присылает историю транзакций перед подтверждением вывода.</p>
    <ol><li>Собери нужные транзакции.</li><li>Посчитай обработанный объём.</li><li>Сверь историю с ожидаемым выводом.</li><li>Убедись, что нет отменённых или несоответствующих транзакций.</li><li>Только после этого подтверждай вывод по действующим правилам.</li></ol>`
  }
};

function openCase(key) {
  const p = playbooks[key];
  if (!p) return;
  document.querySelector("#modalTag").textContent = p.tag;
  document.querySelector("#modalTitle").textContent = p.title;
  document.querySelector("#modalBody").innerHTML = p.body;
  document.querySelector("#caseModal").classList.add("open");
  document.querySelector("#caseModal").setAttribute("aria-hidden","false");
}
function closeCase() {
  document.querySelector("#caseModal").classList.remove("open");
  document.querySelector("#caseModal").setAttribute("aria-hidden","true");
}

function initSearch() {
  const input = document.querySelector("#searchInput");
  const cards = [...document.querySelectorAll(".case-card")];
  const empty = document.querySelector("#emptyState");
  let filter = "all";

  function apply() {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const okFilter = filter === "all" || card.dataset.cat === filter;
      const okSearch = !q || card.dataset.search.includes(q);
      card.style.display = okFilter && okSearch ? "" : "none";
      if (okFilter && okSearch) visible++;
    });
    empty.style.display = visible ? "none" : "block";
  }
  input.addEventListener("input", apply);
  document.querySelectorAll(".category").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      filter = btn.dataset.filter;
      apply();
    });
  });
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault(); input.focus();
    }
    if (e.key === "Escape") closeCase();
  });
}

document.querySelectorAll(".case-link").forEach(btn => btn.addEventListener("click", () => openCase(btn.dataset.case)));
document.querySelector("#modalClose").addEventListener("click", closeCase);
document.querySelector(".modal-backdrop").addEventListener("click", closeCase);

document.querySelector("#resetBtn").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  location.reload();
});

document.querySelector("#completeBtn").addEventListener("click", () => {
  const pct = Math.round((Object.values(state.modules).reduce((a,b)=>a+b.done,0) /
    Object.values(state.modules).reduce((a,b)=>a+b.total,0))*100);
  if (pct >= 100) {
    document.querySelector("#finalTitle").innerHTML = "Миссия<br /><span>выполнена.</span>";
    document.querySelector("#finalText").textContent = "Все основные модули пройдены. Персонаж полностью экипирован.";
    pulse(document.querySelector("#completeBtn"));
  } else {
    document.querySelector("#finalText").textContent = `You're at ${pct}%. Продолжай — оставшиеся пункты показывают, что ещё нужно закрепить.`;
  }
});

document.querySelector("#mentorBtn").addEventListener("click", () => {
  document.querySelector("#finalText").textContent = "Режим ментора: используй чек-листы как общий стандарт обучения и передачи смены. Демонстрационная версия хранит прогресс в браузере.";
  document.querySelector("#final").scrollIntoView({behavior:"smooth"});
});

load();
hydrateChecks();
initChecks();
initSearch();
refresh();
