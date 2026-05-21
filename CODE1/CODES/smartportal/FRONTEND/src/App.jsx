import React, { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Legend from "./pages/legend";
import CBSFlow from "./pages/CBSFlow";
import BranchTellerInterval from "./pages/BranchTellerInterval";
import MilestoneDetails from "./pages/MilestoneDetails";
import BranchLoggedIn from "./pages/BranchLoggedIn";
import TellerLoggedIn from "./pages/TellerLoggedIn";
import TxnDesc from "./pages/TxnDesc";
import AllFiles from "./pages/AllFiles";
import UpiMr from "./pages/UpiMr";
import NeftInvalid from "./pages/NeftInvalid";
import RepostingStatus from "./pages/RepostingStatus";
import RepostFail from "./pages/RepostFail";
import RtgsIncomingGateway from "./pages/RtgsIncomingGateway";
import RtgsIncomingAck from "./pages/RtgsIncomingAck";
import TopNavBar from "./components/TopNavBar";

const SOURCES = [
  "jobs",
  "queue",
  "context",
  "trickle",
  "space",
  "branchlogin",
  "tellerlogin",
  "repostng"
];
const UNIFIED_URL = "http://localhost:8000/events-unified";

function App() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState("disconnected");
  const reconnectTimer = useRef(null);

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

  const connectToUnifiedStream = (retry = 0) => {
    setStatus("connecting");

    const es = new EventSource(UNIFIED_URL);

    es.onopen = () => {
      setStatus("connected");
    };

    es.onerror = () => {
      es.close();
      setStatus("disconnected");

      const timeout = Math.min(5000, 1000 * (retry + 1));
      reconnectTimer.current = setTimeout(() => {
        connectToUnifiedStream(retry + 1);
      }, timeout);
    };

    SOURCES.forEach((source) => {
      es.addEventListener(source, (e) => {
        try {
          const { type, payload } = JSON.parse(e.data);
          if (type === "snapshot") {
            setData((prev) => ({
              ...prev,
              [source]: payload,
            }));
          } else if (type === "delta") {
            applyDelta(source, payload);
          }
        } catch (err) {
          console.error(`Error parsing message for ${source}:`, err);
        }
      });
    });

    return es;
  };

  useEffect(() => {
    const es = connectToUnifiedStream();

    return () => {
      es.close();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);

  // console.log("App Unified SSE Data State:", data);
  const branchCount = data.branchlogin?.["branch login no"] || "0";
  const tellerCount = data.tellerlogin?.["teller login no"] || "0";
  const repostingCount = data.repostng?.["reposting no"] || "0";

  return (
    <>
      <TopNavBar branchCount={branchCount} tellerCount={tellerCount} repostingCount={repostingCount} />
      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/legend" element={<Legend />} />
        <Route path="/cbs-flow" element={<CBSFlow />} />
        <Route path="/branch-teller-interval" element={<BranchTellerInterval />} />
        <Route path="/milestone-details" element={<MilestoneDetails />} />
        <Route path="/branch-logged-in" element={<BranchLoggedIn />} />
        <Route path="/teller-logged-in" element={<TellerLoggedIn />} />
        <Route path="/txn-desc" element={<TxnDesc />} />
        <Route path="/all-files" element={<AllFiles />} />
        <Route path="/upi-mr" element={<UpiMr />} />
        <Route path="/neft-invalid" element={<NeftInvalid />} />
        <Route path="/reposting-status" element={<RepostingStatus />} />
        <Route path="/repost-fail" element={<RepostFail />} />
        <Route path="/rtgs-incoming-gateway" element={<RtgsIncomingGateway />} />
        <Route path="/rtgs-incoming-ack" element={<RtgsIncomingAck />} />
      </Routes>
    </>
  );
}

export default App;
