// src/Home.js
import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import "./Home.css";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <h1 className="home-title">
          Intelligent Accident Severity Prediction Platform
        </h1>

        <p className="home-subtitle">
          Welcome {user?.username ? `, ${user.username}` : ""}!  
          This platform allows you to analyze accident datasets, predict severity,
          and explore insights — powered by Machine Learning.
        </p>

        <div className="home-divider"></div>

        <section className="home-features">
          <div className="feature-card">
            <h3>⚡ Real-time Predictions</h3>
            <p>Use the prediction model to estimate accident severity instantly.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Dashboard Insights</h3>
            <p>View summarized analysis and monitor dataset trends.</p>
          </div>

          <div className="feature-card">
            <h3>📁 Upload Datasets</h3>
            <p>Upload your own datasets for model training and analysis.</p>
          </div>

          {user?.role === "admin" && (
            <div className="feature-card admin-card">
              <h3>🛠 Admin Tools</h3>
              <p>Retrain models, manage datasets, and oversee system operations.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
