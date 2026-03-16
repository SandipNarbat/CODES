import { useState, useEffect, useRef } from "react";
import { IconList } from "./Icons";

function getPillClass(val) {
  if (val === 0) return "pill pill-zero";
  if (val <= 50) return "pill pill-yellow";
  if (val <= 200) return "pill pill-orange";
  return "pill pill-red";
}

function QueueAnimatedCell({ value }) {
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
      <span className={getPillClass(value)}>{value}</span>
    </td>
  );
}

export default function QueueMetrics({ data }) {
  const sourceData = data || {};
  // const queueKeys = Object.keys(sourceData).filter(k => k !== 'abc1'); // clean out sample
  const queueKeys = Object.keys(sourceData)

  const columns = ["M", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="queuecard">
        <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
          <div className="card-title text-[14px]">
            <IconList />
            <h2 className="text-[14px]">GLOBAL QUEUE METRICS</h2>
          </div>
          <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{display:'flex', alignItems:'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)'}}>
            <div style={{display:'flex', gap: '16px', alignItems: 'center'}}>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: '#484f58', display: 'inline-block'}}></div> ZERO</span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--color-yellow)', display: 'inline-block'}}></div> 1-50</span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--color-orange)', display: 'inline-block'}}></div> 51-200</span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--color-red)', display: 'inline-block'}}></div> 200+</span>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>QUEUE</th>
                {queueKeys.length > 0 && sourceData[queueKeys[0]]
                  ? sourceData[queueKeys[0]].map((_, i) => (
                      <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                    ))
                  : columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {queueKeys.length > 0 ? (
                queueKeys.map((key) => {
                  const rowData = sourceData[key];
                  return (
                    <tr key={key}>
                      <td>{key.toUpperCase()}</td>
                      {Array.isArray(rowData)
                        ? rowData.map((val, i) => (
                            <QueueAnimatedCell key={i} value={val} />
                          ))
                        : null}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
