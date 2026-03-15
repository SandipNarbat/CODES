import { useEffect, useState } from "react";
import "./QueueMonitor.css";

export default function QueueMonitor() {
  const [queues, setQueues] = useState({});

  // --------------------------------------------------
  // Apply delta update
  // --------------------------------------------------
  const applyDelta = (delta) => {
    setQueues(prev => {
      const updated = { ...prev };
      const { queue, changes } = delta;

      if (!updated[queue]) return prev;

      changes.forEach(({ index, new: newVal }) => {
        updated[queue][index] = newVal;
      });

      return { ...updated };
    });
  };

  // --------------------------------------------------
  // SSE connection
  // --------------------------------------------------
  useEffect(() => {
    const es = new EventSource("http://localhost:8000/events");

    es.addEventListener("snapshot", (e) => {
      const snapshot = JSON.parse(e.data);
      setQueues(snapshot);
    });

    es.addEventListener("delta", (e) => {
      const delta = JSON.parse(e.data);
      applyDelta(delta);
    });

    es.onerror = () => {
      console.error("SSE connection lost");
    };

    return () => {
      es.close();
    };
  }, []);

  // --------------------------------------------------
  // Cell styling logic
  // --------------------------------------------------
  const renderCell = (value) => {
    if (value === 0) {
      return <span className="cell-value ok">0</span>;
    }
    if (value <= -1) {
      return (
        <span className="cell-value warning material-icons">
          thumb_down
        </span>
      );
    }
    return <span className="cell-value critical">{value}</span>;
  };

  const queueNames = Object.keys(queues);

  return (
    <div>
      <h2>📊 Realtime Queue Buildup Monitor</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Queue</th>
              <th>M</th>
              {[...Array(14)].map((_, i) => (
                <th key={i}>S{i + 1}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {queueNames.map(queue => (
              <tr key={queue}>
                <th>{queue}</th>
                {queues[queue].map((val, i) => (
                  <td key={i}>{renderCell(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
