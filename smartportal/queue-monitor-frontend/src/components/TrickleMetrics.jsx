import { IconList } from "./Icons";

function getPillClass(val) {
  if (val === 0) return "pill pill-zero";
  if (val > 0 && val <= 50) return "pill pill-yellow";
  if (val > 50 && val <= 200) return "pill pill-orange";
  if (val > 200) return "pill pill-red";
  return "pill pill-none";
}

export default function TrickleMetrics({ data }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">TRICKLE METRICS</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>IDENTIFIER</th>
              {keys.length > 0 && sourceData[keys[0]]
                ? sourceData[keys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                : <th>M</th>}
            </tr>
          </thead>
          <tbody>
            {keys.length > 0 ? (
              keys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                          <td key={i}>
                            <span className={getPillClass(val)}>{val}</span>
                          </td>
                        ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={15} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
