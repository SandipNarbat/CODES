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
// import QueueMonitor from "./QueueMonitor";

function App() {
  return (
    <>
      <TopNavBar />
      <Routes>
      <Route path="/" element={<Dashboard />} />
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
