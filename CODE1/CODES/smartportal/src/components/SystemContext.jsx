import { IconList } from "./Icons";

export default function SystemContext({ data }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);

  // We want to determine max length of array to build columns
  let maxCols = 0;
  keys.forEach(k => {
    if (sourceData[k].length > maxCols) maxCols = sourceData[k].length;
  });

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">SYSTEM CONTEXT</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PROPERTY</th>
              {Array.from({ length: maxCols }).map((_, i) => (
                <th key={i}>{`Node ${i + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.length > 0 ? (
              keys.map((key) => {
                const rowData = sourceData[key] || [];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {rowData.map((val, i) => (
                      <td key={i}>
                        <span className={`pill ${val.includes('OK') || val === 'READY' || val === 'RUNNING' ? 'pill-none' : val.includes('DAY') ? 'pill-yellow' : 'pill-zero'}`}>
                          {val}
                        </span>
                      </td>
                    ))}
                    {/* Fill empty cells if row is shorter than maxCols */}
                    {Array.from({ length: maxCols - rowData.length }).map((_, i) => (
                      <td key={`empty-${i}`}>-</td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={maxCols + 1} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
