import React from "react";

function ResultCard({ result }) {
  return (
    <div className="result-card">
      <h3>Prediction Result</h3>
      <p>
        <strong>Severity Class:</strong> {result.severity_class}
      </p>
      <p>
        <strong>Severity Label:</strong> {result.severity_label}
      </p>
    </div>
  );
}

export default ResultCard;
