import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import InfoPage from "./pages/InfoPage";
// import QueueMonitor from "./QueueMonitor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/info/:type" element={<InfoPage />} />
    </Routes>
  );
}

export default App;
