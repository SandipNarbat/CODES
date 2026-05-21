import React from "react";
import GridOverview from "./components/GridOverview";
import QueueMetrics from "./components/QueueMetrics";
import SystemContext from "./components/SystemContext";
import TrickleMetrics from "./components/TrickleMetrics";
import SpaceMetrics from "./components/SpaceMetrics";
import "./Dashboard.css";

export default function Dashboard({ data = {} }) {
  return (
    <div className="app-root">
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