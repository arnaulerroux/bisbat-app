import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [history, setHistory] = useState([]);

  // Carrega historial del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (item) => {
    const updated = [item, ...history];
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un fitxer primer!");

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

      // Guarda historial
      saveHistory({
        id: Date.now(),
        name: file.name,
        data: res.data,
      });
    } catch (err) {
      alert("Error pujant el fitxer!");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className={dark ? "app-container dark" : "app-container"}>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>Historial</h2>

        {history.length === 0 && <p className="empty-history">Buit...</p>}

        <ul className="history-list">
          {history.map((item) => (
            <li key={item.id} onClick={() => setResult(item.data)}>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>

        <button className="clear-btn" onClick={clearHistory}>
          Esborra historial
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">

        <header className="header">
          <h1>Classificador de Documents</h1>
          <p>Carrega documents i deixa que el sistema els processi.</p>

          <button className="theme-switch" onClick={() => setDark(!dark)}>
            {dark ? "Mode Clar" : "Mode Fosc"}
          </button>
        </header>

        <div className="card" onDragEnter={handleDrag}>
          <h2>Puja un document</h2>

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

        {result && (
          <div className="result-card fade-in">
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
      </main>
    </div>
  );
}
