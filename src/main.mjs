const React = globalThis.React;
const ReactDOM = globalThis.ReactDOM;
const htm = globalThis.htm;

const html = htm.bind(React.createElement);

async function loadContent() {
  const res = await fetch("./data/content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Не удалось загрузить data/content.json");
  return res.json();
}

function byId(list) {
  const map = new Map();
  (list || []).forEach((x) => map.set(x.id, x));
  return map;
}

function statusLabel(status) {
  if (status === "live") return "идёт";
  if (status === "finished") return "завершён";
  return "запланирован";
}

function MatchCard({ match, teams }) {
  const home = teams.get(match.homeTeamId) || { name: match.homeTeamId, logo: "" };
  const away = teams.get(match.awayTeamId) || { name: match.awayTeamId, logo: "" };

  return html`
    <article className="card">
      <div className="cardTop">
        <div className="meta">
          <div className="date">${match.dateLabel || ""}${match.timeLabel ? ` · ${match.timeLabel}` : ""}</div>
          <div className="place">${match.venue || ""}</div>
        </div>
        <div className="status">${statusLabel(match.status)}</div>
      </div>

      <div className="teamsRow">
        <div className="team">
          ${home.logo ? html`<img className="logo" src=${home.logo} alt="" />` : html`<div className="logo"></div>`}
          <div className="teamName" title=${home.name}>${home.name}</div>
        </div>
        <div className="vs">vs</div>
        <div className="team right">
          <div className="teamName" title=${away.name}>${away.name}</div>
          ${away.logo ? html`<img className="logo" src=${away.logo} alt="" />` : html`<div className="logo"></div>`}
        </div>
      </div>
    </article>
  `;
}

function App() {
  const [content, setContent] = React.useState(null);
  const [error, setError] = React.useState("");
  const [activeSportId, setActiveSportId] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    loadContent()
      .then((data) => {
        if (!alive) return;
        setContent(data);
        setActiveSportId(data?.sports?.[0]?.id || "");
      })
      .catch((e) => alive && setError(String(e?.message || e)));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return html`<div className="container"><div className="panel"><div className="empty">Ошибка: ${error}</div></div></div>`;
  }

  if (!content) {
    return html`<div className="container"><div className="panel"><div className="empty">Загрузка…</div></div></div>`;
  }

  const sports = content.sports || [];
  const active = sports.find((s) => s.id === activeSportId) || sports[0] || null;
  const teams = byId((content.teamsBySport || {})[active?.id] || []);
  const matches = (content.scheduleBySport || {})[active?.id] || [];

  return html`
    <div className="container">
      <header className="header">
        <div>
          <h1>${content.appTitle || "Расписание"}</h1>
          <div className="subtitle">${content.appSubtitle || ""}</div>
        </div>
        <div className="status">${active ? `${active.icon || ""} ${active.label || ""}` : ""}</div>
      </header>

      <nav className="tabs">
        ${sports.map(
          (sport) => html`
            <button className=${`tab ${sport.id === activeSportId ? "active" : ""}`} onClick=${() => setActiveSportId(sport.id)}>
              <div className="tabTitle"><span>${sport.icon || ""}</span> ${sport.label}</div>
              <div className="tabHint">${((content.scheduleBySport || {})[sport.id] || []).length} игр</div>
            </button>
          `,
        )}
      </nav>

      <section className="panel">
        <h2>Расписание</h2>
        ${matches.length
          ? html`<div className="list">${matches.map((m) => html`<${MatchCard} match=${m} teams=${teams} key=${m.id} />`)}</div>`
          : html`<div className="empty">Пока нет матчей в расписании.</div>`}
      </section>
    </div>
  `;
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App} />`);

