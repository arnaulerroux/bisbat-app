import React from "react";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">

      <header className="header">
        <h1>Classificador de Documents</h1>
        <p>Carrega documents i deixa que el sistema els organitzi.</p>
      </header>

      <div className="card">
        <h2>Puja un document</h2>

        <label className="upload-zone">
          <span>Arrossega aquí un fitxer o</span>
          <span className="upload-button">Selecciona un arxiu</span>
          <input type="file" />
        </label>

        <button className="action-button">Classificar document</button>
      </div>

      <footer className="footer">
        © 2025 Bisbat — Classificador de Documents
      </footer>
    </div>
  );
}

