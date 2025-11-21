import React, { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quan es selecciona un arxiu des del botó
  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  // DRAG & DROP EVENTS
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // PUJAR I CLASSIFICAR
  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un fitxer primer!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://bisbat-backend.onrender.com/ocr",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data);
    } catch (err) {
      alert("Error pujant el fitxer!");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="app-container">

      <header className="header">
        <h1>Classificador de Documents</h1>
        <p>Carrega documents i deixa que el sistema els organitzi.</p>
      </header>

      <div
        className="card"
        onDragEnter={handleDrag}
      >
        <h2>Puja un document</h2>

        {/* DRAG & DROP ZONE */}
        <div
          className={`upload-zone ${dragActive ? "drag-active" : ""}`}
          onDrop={handleDrop}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
        >
          <span>Arrossega aquí un fitxer o</span>

          <label className="upload-button">
            Selecciona un arxiu
            <input type="file" onChange={handleFileSelect} />
          </label>

          {file && <p className="file-name">Seleccionat: {file.name}</p>}
        </div>

        <button
          className="action-button"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Processant..." : "Classificar document"}
        </button>
      </div>

      {/* RESULTAT */}
      {result && (
        <div className="result-card">
          <h2>Resultat</h2>
          <p><strong>Any:</strong> {result.classificacio?.any}</p>
          <p><strong>Tipus:</strong> {result.classificacio?.tipus}</p>
          <p><strong>Estat legal:</strong> {result.classificacio?.estat_legal}</p>
          <p><strong>Parròquia:</strong> {result.classificacio?.parroquia}</p>

          <h3>Text:</h3>
          <pre>{result.text}</pre>
        </div>
      )}

      <footer className="footer">
        © 2025 Bisbat — Classificador de Documents
      </footer>
    </div>
  );
}
