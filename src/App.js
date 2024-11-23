import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadScreen from "../src/components/UploadScreen";
import PreviewScreen from "../src/components/PreviewScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/preview" element={<PreviewScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
