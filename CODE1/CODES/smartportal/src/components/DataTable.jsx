import AnimatedCell from "./AnimatedCell";

export default function DataTable({ source, data, status }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  const currentStatus = status || "connecting";

  if (!keys.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>{source.toUpperCase()}</h2>
          <span className={`status ${currentStatus}`}>
            {currentStatus}
          </span>
        </div>
        <p className="empty">No Data</p>
      </div>
    );
  }

  const firstRow = sourceData[keys[0]];
  const headers = Array.isArray(firstRow)
    ? firstRow.map((_, i) => `Col ${i + 1}`)
    : Object.keys(firstRow);

  return (
    <div className="card">
      <div className="card-header">
        <h2>{source.toUpperCase()}</h2>
        <span className={`status ${currentStatus}`}>
          {currentStatus}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => (
              <tr key={key}>
                <td>{key}</td>
                {Array.isArray(sourceData[key])
                  ? sourceData[key].map((val, i) => (
                      <AnimatedCell key={i} value={val} />
                    ))
                  : Object.values(sourceData[key]).map((val, i) => (
                      <AnimatedCell key={i} value={val} />
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
