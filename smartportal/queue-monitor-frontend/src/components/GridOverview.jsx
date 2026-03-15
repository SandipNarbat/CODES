import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "./Icons";

function renderJobCell(jobName, val) {
  if (jobName === "CHECK RC") {
    return val === "NO CHECK RC" ? <span className="pill pill-none">NONE</span> : <span className="pill pill-yellow">CHECK</span>;
  }
  
  if (jobName === "CONNECTIVITY") {
    // Usually Y is green, N is red
    return <span className={val === "Y" ? "text-green font-bold" : "text-red font-bold"}>{val}</span>;
  }

  if (jobName === "SYSTEM IDLE" || jobName === "MISC" || jobName === "MISC JOB") {
    return <span className="font-bold">{val}</span>;
  }

  // Gateway status icons
  if (val === "RUNNING" || val === "ON") {
    return <IconCheck />;
  } else if (val === "NOT RUNNING" || val === "OFF") {
    return <IconWarning />;
  } else if (val === "ERROR" || val === "DOWN") {
    return <IconError />;
  } else if (val === "--" || val === "N/A") {
    return <span className="text-secondary">—</span>;
  }

  return <span>{val}</span>;
}

function GridAnimatedCell({ jobName, value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <td className={highlight ? "highlight-row" : ""}>
      {renderJobCell(jobName, value)}
    </td>
  );
}

export default function GridOverview({ data }) {
  const sourceData = data || {};
  const jobKeys = Object.keys(sourceData);

  // Fallback headers if data empty
  const columns = Array.from({ length: 12 }, (_, i) => i === 0 ? "M" : `S${i}`);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <IconGrid />
          <h2>Grid Overview</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>JOB NAME</th>
              {jobKeys.length > 0 && sourceData[jobKeys[0]]
                ? sourceData[jobKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                : columns.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {jobKeys.length > 0 ? (
              jobKeys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                          <GridAnimatedCell key={i} jobName={key} value={val} />
                        ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid-footer" style={{ gridTemplateColumns: '1fr', marginTop: '0' }}>
        <div className="card legend-card" style={{ padding: '12px 20px' }}>
          <div className="legend-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 0 }}>
            <div className="legend-item"><IconCheck /> <span>System OK</span></div>
            <div className="legend-item"><IconWarning /> <span>No Data / Warn</span></div>
            <div className="legend-item"><IconError /> <span>App Down</span></div>
            <div className="legend-item text-secondary font-bold"> — <span className="font-normal text-primary ml-1">N/A</span></div>
            <div className="legend-item"><IconLock /> <span>No Encrypt</span></div>
            <div className="legend-item"><IconSlash /> <span>No Transact</span></div>
            <div className="legend-item"><IconSnow /> <span>Time Frozen</span></div>
            <div className="legend-item"><IconZap /> <span>Max TCP</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
