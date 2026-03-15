import { useEffect, useRef, useState } from "react";
import GridOverview from "./components/GridOverview";
import QueueMetrics from "./components/QueueMetrics";
import SystemContext from "./components/SystemContext";
import TrickleMetrics from "./components/TrickleMetrics";
import SpaceMetrics from "./components/SpaceMetrics";
import TopNavBar from "./components/TopNavBar";
import Header from "./components/Header";
import "./Dashboard.css";

const SOURCES = ["jobs", "queue", "context", "trickle", "space"];
const BASE_URL = "http://localhost:8000/events";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState({});
  const reconnectTimers = useRef({});

  const applyDelta = (source, delta) => {
    setData((prev) => {
      const updated = { ...prev };
      const sourceData = { ...(updated[source] || {}) };

      if (delta.type === "new") {
        sourceData[delta.key] = delta.metrics;
      }

      if (delta.type === "update") {
        if (Array.isArray(sourceData[delta.key])) {
          const arr = [...sourceData[delta.key]];
          delta.changes.forEach((change) => {
            arr[change.index] = change.new;
          });
          sourceData[delta.key] = arr;
        } else {
          sourceData[delta.key] = delta.changes[0].new;
        }
      }

      updated[source] = sourceData;
      return updated;
    });
  };

  const connectToSource = (source, retry = 0) => {
    setStatus((prev) => ({ ...prev, [source]: "connecting" }));

    const es = new EventSource(`${BASE_URL}/${source}`);

    es.onopen = () => {
      setStatus((prev) => ({ ...prev, [source]: "connected" }));
    };

    es.onerror = () => {
      es.close();
      setStatus((prev) => ({ ...prev, [source]: "disconnected" }));

      const timeout = Math.min(5000, 1000 * (retry + 1));
      reconnectTimers.current[source] = setTimeout(() => {
        connectToSource(source, retry + 1);
      }, timeout);
    };

    es.addEventListener("snapshot", (e) => {
      setData((prev) => ({
        ...prev,
        [source]: JSON.parse(e.data),
      }));
    });

    es.addEventListener("delta", (e) => {
      const delta = JSON.parse(e.data);
      applyDelta(source, delta);
    });

    return es;
  };

  useEffect(() => {
    const connections = {};

    SOURCES.forEach((source) => {
      connections[source] = connectToSource(source);
    });

    return () => {
      Object.values(connections).forEach((es) => es.close());
      Object.values(reconnectTimers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="app-root">
      <TopNavBar />
      <div className="dashboard-content-wrapper">
        <div className="dashboard">
          <GridOverview data={data.jobs} />
          <QueueMetrics data={data.queue} />
        </div>
        
        {/* New Data Modules Side-by-Side (3 columns) */}
        <div className="dashboard-secondary">
          <SystemContext data={data.context} />
          <TrickleMetrics data={data.trickle} />
          <SpaceMetrics data={data.space} />
        </div>
      </div>
    </div>
  );
}