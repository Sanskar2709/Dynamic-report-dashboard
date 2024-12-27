import React from "react";
import Header from "./components/layout/Header";
import Dashboard from "./components/dashboard/Dashboard";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Dashboard />
    </div>
  );
};

export default App;
