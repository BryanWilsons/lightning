export function StatCard({ label, value, delta, dir }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className={'delta ' + dir}>{delta}</div>}
    </div>
  );
}

export function Card({ title, sub, action, children }) {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>{title}</h2>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {action || null}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export function Badge({ status }) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={'badge ' + cls}>{status}</span>;
}

export function Table({ cols, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageHead({ title, sub, action }) {
  return (
    <div
      className="page-head"
      style={action ? { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' } : undefined}
    >
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {action || null}
    </div>
  );
}