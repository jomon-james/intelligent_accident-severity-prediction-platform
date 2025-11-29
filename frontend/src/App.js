import React, { useState } from "react";
import FormInput from "./components/FormInput";
import ResultCard from "./components/ResultCard";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="App">
      <FormInput onPredict={setResult} />
      {result && <ResultCard result={result} />}
    </div>
  );
}

export default App;
