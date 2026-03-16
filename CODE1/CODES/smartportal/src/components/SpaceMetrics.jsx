import { IconList } from "./Icons";

function getPillClass(val) {
  if (val === 0) return "text-secondary opacity-50"; // Dim zeros/nulls
  if (val > 0 && val <= 20) return "text-green font-bold";
  if (val > 20 && val <= 50) return "text-yellow font-bold";
  if (val > 50) return "text-red font-bold";
  return "";
}

export default function SpaceMetrics({ data }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">SPACE METRICS</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>RIVER SYSTEM</th>
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
                            <span className={getPillClass(val)}>{val === 0 ? '-' : val}</span>
                          </td>
                        ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
