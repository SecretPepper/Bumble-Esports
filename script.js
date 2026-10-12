
/* =========================
   MANUAL PLAYER DATA
   ========================= */

const FORTNITE_PLAYERS = [
  {
    id: "fn-pepper",
    name: "Pepper",
    role: "PRO",
    region: "Europe",
    country: "Netherlands",
    rankMeta: "Academy 3",
    skillPoints: 0,
    yearSP: 0,
    earnings: 0,
    eventsCount: 0,
    matchesCount: 0,
    top1: 0,
    top10: 0,
    top100: 0,
    avgPlace: 0,
    events: []
  }
];


/* =========================
   ROCKET LEAGUE PLAYERS
   ========================= */

const ROCKET_PLAYERS = [
  {
    id: "rl-cooper",
    name: "Cooper",
    role: "PRO",
    region: "Europe",
    country: "Netherlands",
    rankMeta: "Academy 3",
    skillPoints: 0,
    yearSP: 0,
    earnings: 0,
    eventsCount: 0,
    matchesCount: 0,
    top1: 0,
    top10: 0,
    top100: 0,
    avgPlace: 0,
    events: [
      {
        event: "Solo Test Cup",
        stage: "Practice",
        date: "Oct 14, 2026",
        place: 0,
        sp: 0,
        earnings: 0,
        roster: ["Cooper"],
        matches: 0,
        wins: 0,
        type: "Test"
      }
    ]
  },
  {
    id: "rl-upmush",
    name: "Upmush",
    role: "",
    region: "Europe",
    country: "Belgium",
    rankMeta: "Competitor",
    skillPoints: 0,
    yearSP: 0,
    earnings: 0,
    eventsCount: 0,
    matchesCount: 0,
    top1: 0,
    top10: 0,
    top100: 0,
    avgPlace: 0,
    events: []
  },
  {
    id: "rl-nexo",
    name: "Nexo",
    role: "PRO",
    region: "Europe",
    country: "Netherlands",
    rankMeta: "Academy 3",
    skillPoints: 0,
    yearSP: 0,
    earnings: 0,
    eventsCount: 0,
    matchesCount: 0,
    top1: 0,
    top10: 0,
    top100: 0,
    avgPlace: 0,
    events: []
  },
  {
    id: "rl-purqle",
    name: "purqle",
    role: "PRO",
    region: "Europe",
    country: "Germany",
    rankMeta: "Academy 3",
    skillPoints: 0,
    yearSP: 0,
    earnings: 0,
    eventsCount: 0,
    matchesCount: 0,
    top1: 0,
    top10: 0,
    top100: 0,
    avgPlace: 0,
    events: []
  }
];


/* =========================
   EVENT IMAGES
   ========================= */

const EVENT_IMAGES = {
  "Solo Test Cup": "images/events/rocketleaguesolotestcup.png"
};


/* =========================
   GLOBAL VARIABLES
   ========================= */

let PLAYERS = FORTNITE_PLAYERS;
let currentGame = "fortnite";

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const fmt = n =>
  Number(n || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2
  });

const money = n => "$" + fmt(n);

let activePlayer = PLAYERS[0];

let page = 1;
const pageSize = 8;

let sortAscending = true;

let chartMode = "sp";
let chartPoints = [];

const pinnedEvents = new Set();


/* =========================
   PLAYER FUNCTIONS
   ========================= */

function getPlayerById(id) {
  return PLAYERS.find(p => p.id === id);
}


function renderPlayer(player) {
  if (!player) return;

  activePlayer = player;

  $("#skillPoints").textContent = fmt(player.skillPoints);
  $("#yearSP").textContent = fmt(player.yearSP);
  $("#earnings").textContent = money(player.earnings);
  $("#eventsCount").textContent = fmt(player.eventsCount);

  $("#eventsPlayed").textContent =
    `${fmt(player.eventsCount)} Events Played`;

  $("#matchesCount").textContent = fmt(player.matchesCount);

  $("#top1").textContent = fmt(player.top1);
  $("#top10").textContent = fmt(player.top10);
  $("#top100").textContent = fmt(player.top100);

  $("#avgPlace").textContent =
    Number(player.avgPlace || 0).toLocaleString("en-US", {
      maximumFractionDigits: 1
    });

  $("#profileName").textContent = player.name;

  $("#profileGame").textContent =
    currentGame === "fortnite"
      ? "FORTNITE PLAYER"
      : "ROCKET LEAGUE PLAYER";

  $("#profileDetails").textContent =
    [player.region, player.role, player.country]
      .filter(Boolean)
      .join(" · ");

  $("#rankMeta").textContent =
    player.rankMeta ||
    `#${player.epicRank || "—"} ${player.region || ""}${
      player.role ? ` (${player.role})` : ""
    }`.trim();

  $("#eventSearch").value = "";
  page = 1;

  $("#chartTooltip").classList.add("hidden");

  drawChart();
  renderEvents();
}


/* =========================
   SECURITY / HTML
   ========================= */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}


/* =========================
   EVENT FILTERING
   ========================= */

function filteredEvents() {
  const query = $("#eventSearch").value.trim().toLowerCase();

  const events = (activePlayer.events || []).filter(ev => {
    const haystack = [
      ev.event,
      ev.stage,
      ev.date,
      ...(ev.roster || [])
    ].join(" ").toLowerCase();

    return !query || haystack.includes(query);
  });

  events.sort((a, b) =>
    sortAscending
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  return events;
}


/* =========================
   EVENT TABLE
   ========================= */

function renderEvents() {
  const events = filteredEvents();

  const totalPages = Math.max(
    1,
    Math.ceil(events.length / pageSize)
  );

  if (page > totalPages) page = totalPages;

  const visible = events.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  $("#resultsBody").innerHTML = visible.map(ev => {
    const pinned = pinnedEvents.has(
      `${activePlayer.id}-${ev.event}-${ev.stage}-${ev.date}`
    );

    const roster = (ev.roster || [])
      .map(escapeHTML)
      .join("<br>");

    const eventImage = EVENT_IMAGES[ev.event];

    const eventIcon =
      ev.type === "FNCS" ? "❄" :
      ev.type === "Ranked Cup" ? "⚔" :
      ev.type === "Cash Cup" ? "🏆" : "◈";

    const eventThumbnail = eventImage
      ? `<img src="${escapeHTML(eventImage)}"
              alt="${escapeHTML(ev.event)}"
              class="event-image">`
      : eventIcon;

    return `
      <tr>
        <td>
          <div class="event-cell">
            <div class="event-thumb">
              ${eventThumbnail}
            </div>

            <div>
              <div class="event-title">
                ${escapeHTML(ev.event)}
              </div>

              <div class="event-date">
                ${escapeHTML(ev.stage)} |
                ${escapeHTML(ev.date)}
              </div>
            </div>
          </div>
        </td>

        <td>
          <span class="place-badge"
            style="${
              ev.place === 1
                ? "background:#d9c15d"
                : ev.place === 3
                  ? "background:#b56a45"
                  : ""
            }">
            ${ev.place ? "#" + fmt(ev.place) : "—"}
          </span>
        </td>

        <td data-col="sp">
          <div class="sp-points">
            <span class="bolt">ϟ</span>
            ${ev.sp ? fmt(ev.sp) : "—"}
          </div>
        </td>

        <td data-col="earnings">
          ${ev.earnings ? money(ev.earnings) : "—"}
        </td>

        <td data-col="roster" class="roster">
          ${roster}
        </td>

        <td class="cell-number">
          ${fmt(ev.matches)}
        </td>

        <td class="cell-number">
          ${fmt(ev.wins)}
        </td>

        <td>
          <button
            class="pin-btn ${pinned ? "pinned" : ""}"
            data-pin="${escapeHTML(
              ev.event + "-" + ev.stage + "-" + ev.date
            )}"
            title="Pin event"
            aria-label="Pin event">
            ♜
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#emptyState").classList.toggle(
    "hidden",
    visible.length !== 0
  );

  $("#resultCount").textContent =
    `Showing ${
      visible.length ? (page - 1) * pageSize + 1 : 0
    }–${Math.min(page * pageSize, events.length)} of ${
      events.length
    } results`;

  $("#pageLabel").textContent = `${page} / ${totalPages}`;

  $("#prevPage").disabled = page <= 1;
  $("#nextPage").disabled = page >= totalPages;

  applyColumnVisibility();
}


/* =========================
   TABLE SETTINGS
   ========================= */

function applyColumnVisibility() {
  $$("[data-col]").forEach(el => {
    const key = el.dataset.col;

    const checkbox = $(
      `.table-settings input[data-col="${key}"]`
    );

    if (checkbox) {
      el.classList.toggle("hidden", !checkbox.checked);
    }
  });
}


/* =========================
   EVENT-BASED GRAPH
   ========================= */

function getChartData() {
  const events = [...(activePlayer.events || [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const stat = chartMode === "earnings"
    ? "earnings"
    : "sp";

  let total = 0;

  return events.map(ev => {
    const gained = Number(ev[stat]) || 0;

    total += gained;

    return {
      date: ev.date,
      event: ev.event,
      stage: ev.stage,
      gained,
      value: total
    };
  });
}


/* =========================
   DRAW GRAPH
   ========================= */

function drawChart(highlight = null) {
  const canvas = $("#historyChart");
  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));

  const ctx = canvas.getContext("2d");

  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;

  const data = getChartData();

  ctx.clearRect(0, 0, w, h);

  if (!data.length) {
    chartPoints = [];

    ctx.fillStyle = "#888";
    ctx.font = "12px Roboto";
    ctx.textAlign = "center";

    ctx.fillText("No event data available", w / 2, h / 2);

    $("#chartLabels").innerHTML =
      "<span>No events recorded</span>";

    return;
  }

  const values = data.map(d => d.value);

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);

  const pad = 9;
  const usableWidth = Math.max(1, w - pad * 2);
  const usableHeight = Math.max(1, h - 22);

  // Give a single event a visible, centered position.
  chartPoints = data.map((d, i) => {
    const x = pad + (
      data.length === 1
        ? 0.5
        : i / (data.length - 1)
    ) * usableWidth;

    const y = h - 10 -
      ((d.value - min) / (max - min || 1)) *
      usableHeight;

    return { ...d, x, y };
  });

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);

  grad.addColorStop(0, "rgba(245,240,91,.22)");
  grad.addColorStop(1, "rgba(245,240,91,0)");

  // Fill beneath the graph
  ctx.beginPath();
  ctx.moveTo(chartPoints[0].x, h);

  chartPoints.forEach(p => ctx.lineTo(p.x, p.y));

  ctx.lineTo(chartPoints.at(-1).x, h);
  ctx.closePath();

  ctx.fillStyle = grad;
  ctx.fill();

  // Draw graph line
  ctx.beginPath();

  chartPoints.forEach((p, i) => {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });

  ctx.strokeStyle = "#f5f05b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw a visible dot for EVERY event, even with one event.
  chartPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);

    ctx.fillStyle = "#f5f05b";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#222529";
    ctx.stroke();
  });

  // Highlight the nearest event when hovered.
  if (highlight) {
    const point = chartPoints.reduce((best, p) =>
      Math.abs(p.x - highlight.x) <
      Math.abs(best.x - highlight.x)
        ? p
        : best
    );

    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);

    ctx.fillStyle = "#f5f05b";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#222529";
    ctx.stroke();
  }

  // First and last event dates
  $("#chartLabels").innerHTML = `
    <span>${escapeHTML(data[0].date)}</span>
    <span>${escapeHTML(data.at(-1).date)}</span>
  `;
}


/* =========================
   GRAPH TOOLTIP
   ========================= */

const chartCanvas = $("#historyChart");


function showChartPoint(clientX) {
  if (!chartPoints.length) return;

  const rect = chartCanvas.getBoundingClientRect();
  const x = clientX - rect.left;

  const point = chartPoints.reduce((best, p) =>
    Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best
  );

  const tip = $("#chartTooltip");

  const value = chartMode === "earnings"
    ? money(point.value)
    : fmt(point.value) + " SP";

  // Show only the date and the selected statistic.
  tip.textContent = `${point.date} · ${value}`;

  tip.style.left =
    `${Math.max(4, Math.min(rect.width - 4, point.x))}px`;

  tip.style.top = `${Math.max(0, point.y - 12)}px`;

  tip.classList.remove("hidden");

  drawChart(point);
}


chartCanvas.addEventListener("pointermove", e => {
  showChartPoint(e.clientX);
});

chartCanvas.addEventListener("pointerdown", e => {
  showChartPoint(e.clientX);
});

chartCanvas.addEventListener("pointerleave", () => {
  $("#chartTooltip").classList.add("hidden");
  drawChart();
});


/* =========================
   EVENT SEARCH / PAGINATION
   ========================= */

$("#eventSearch").addEventListener("input", () => {
  page = 1;
  renderEvents();
});

$("#prevPage").addEventListener("click", () => {
  page = Math.max(1, page - 1);
  renderEvents();
});

$("#nextPage").addEventListener("click", () => {
  page++;
  renderEvents();
});

$("#sortEvent").addEventListener("click", () => {
  sortAscending = !sortAscending;

  $("#sortEvent span").textContent =
    sortAscending ? "▾" : "▴";

  renderEvents();
});

$("#settingsBtn").addEventListener("click", () => {
  $("#tableSettings").classList.toggle("hidden");
});

$("#tableSettings").addEventListener("change", applyColumnVisibility);


/* =========================
   PIN EVENTS
   ========================= */

$("#resultsBody").addEventListener("click", e => {
  const button = e.target.closest("[data-pin]");

  if (!button) return;

  const key = `${activePlayer.id}-${button.dataset.pin}`;

  if (pinnedEvents.has(key)) {
    pinnedEvents.delete(key);
  } else {
    pinnedEvents.add(key);
  }

  renderEvents();
});


/* =========================
   GRAPH TABS
   ========================= */

$$("[data-chart]").forEach(button => {
  button.addEventListener("click", () => {
    chartMode = button.dataset.chart;

    $$("[data-chart]").forEach(b => {
      b.classList.toggle("active", b === button);
    });

    $("#chartTooltip").classList.add("hidden");
    drawChart();
  });
});

window.addEventListener("resize", () => drawChart());


/* =========================
   GLOBAL PLAYER SEARCH
   ========================= */

function renderGlobalSearch(query) {
  const box = $("#globalSearchResults");

  if (!box) return;

  const q = query.trim().toLowerCase();

  if (!q) {
    box.classList.add("hidden");
    box.innerHTML = "";
    return;
  }

  const matches = PLAYERS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.region || "").toLowerCase().includes(q) ||
    (p.country || "").toLowerCase().includes(q) ||
    (p.role || "").toLowerCase().includes(q)
  ).slice(0, 12);

  box.innerHTML = matches.length
    ? matches.map(p => {
        const details = [
          p.region,
          p.role,
          p.country
        ].filter(Boolean).map(escapeHTML).join(" · ");

        return `
          <button
            type="button"
            class="player-result"
            data-global-player="${escapeHTML(p.id)}">

            <span>
              <strong>${escapeHTML(p.name)}</strong>
              <small>${details}</small>
            </span>

            <span class="result-sp">
              ${fmt(p.skillPoints)} SP
            </span>
          </button>
        `;
      }).join("")
    : `<div class="empty-state">No player found.</div>`;

  box.classList.remove("hidden");
}


const globalSearch = $("#globalPlayerSearch");
const globalResults = $("#globalSearchResults");

if (globalSearch) {
  globalSearch.addEventListener("input", () => {
    renderGlobalSearch(globalSearch.value);
  });

  globalSearch.addEventListener("focus", () => {
    if (globalSearch.value.trim()) {
      renderGlobalSearch(globalSearch.value);
    }
  });

  $("#globalSearchForm").addEventListener("submit", e => {
    e.preventDefault();

    const q = globalSearch.value.trim().toLowerCase();

    if (!q) return;

    const player =
      PLAYERS.find(p => p.name.toLowerCase() === q) ||
      PLAYERS.find(p => p.name.toLowerCase().includes(q));

    if (player) {
      renderPlayer(player);

      globalResults.classList.add("hidden");
      globalSearch.blur();
    } else {
      renderGlobalSearch(globalSearch.value);
    }
  });

  globalResults.addEventListener("click", e => {
    const button = e.target.closest("[data-global-player]");

    if (!button) return;

    const player = getPlayerById(button.dataset.globalPlayer);

    if (player) {
      renderPlayer(player);

      globalResults.classList.add("hidden");
      globalSearch.value = player.name;
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".global-search")) {
      globalResults.classList.add("hidden");
    }
  });
}


/* =========================
   GAME SWITCHING
   ========================= */

$$("[data-game]").forEach(button => {
  button.addEventListener("click", () => {
    currentGame = button.dataset.game;

    PLAYERS = currentGame === "fortnite"
      ? FORTNITE_PLAYERS
      : ROCKET_PLAYERS;

    $$(".game-tab").forEach(b => {
      b.classList.toggle("active", b === button);
    });

    $("#eventHeading").textContent =
      (
        currentGame === "fortnite"
          ? "FORTNITE"
          : "ROCKET LEAGUE"
      ) + " EVENT RESULTS";

    $("#globalPlayerSearch").value = "";
    $("#globalSearchResults").classList.add("hidden");

    chartMode = "sp";

    $$(".chart-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.chart === "sp");
    });

    renderPlayer(PLAYERS[0]);

    requestAnimationFrame(() => drawChart());
  });
});


/* =========================
   INITIAL RENDER
   ========================= */

renderPlayer(activePlayer);
