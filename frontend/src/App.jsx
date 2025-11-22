import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Historial from "./components/Historial.jsx";


export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);

// carregar documents del backend
const fetchDocuments = async () => {
  try {
    const res = await axios.get("https://bisbat-backend.onrender.com/documents");
    setDocuments(res.data.documents);
  } catch (err) {
    console.error("Error carregant documents:", err);
  }
};

useEffect(() => {
  const saved = localStorage.getItem("history");
  if (saved) setHistory(JSON.parse(saved));

  fetchDocuments();
}, []);


  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (item) => {
    const updated = [item, ...history];
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const deleteItem = (id) => {
    const updated = history.filter((x) => x.id !== id);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
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
      saveHistory({
        id: Date.now(),
        name: file.name,
        data: res.data,
      });
    } catch (err) {
      alert("Error pujant el fitxer!");
    }

    setLoading(false);
  };

  return (
    <div className={dark ? "app-container dark" : "app-container"}>
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>Historial</h2>

        {history.length === 0 && <p className="empty">Buit...</p>}

        <ul className="history">
          {history.map((item) => (
            <li key={item.id}>
              <span onClick={() => setResult(item.data)}>
                {item.name}
              </span>

              <button className="delete" onClick={() => deleteItem(item.id)}>
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <Historial
          documents={documents}
          onDelete={async (fileName) => {
            await axios.delete("https://bisbat-backend.onrender.com/delete-one", {
              data: { fitxer: fileName }
            });
            fetchDocuments();
          }}
        />


      {/* CONTINGUT PRINCIPAL */}
      <main className="content">
        <header className="header">
          <h1>Classificador de Documents</h1>
          <button className="mode" onClick={() => setDark(!dark)}>
            {dark ? "Mode Clar" : "Mode Fosc"}
          </button>
        </header>

        <p className="subtitle">Carrega un document per classificar-lo.</p>

        <div className="card">
          <h2>Puja un document</h2>

          <div
            className={`upload-zone ${dragActive ? "drag" : ""}`}
            onDrop={handleDrop}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
          >
            <p>Arrossega el fitxer aquí o</p>

            <label className="file-btn">
              Selecciona un arxiu
              <input type="file" onChange={handleFileSelect} />
            </label>

            {file && <p className="filename">{file.name}</p>}
          </div>

          <button className="green-btn" onClick={handleUpload} disabled={loading}>
            {loading ? "Processant..." : "Classificar"}
          </button>
        </div>

        {result && (
          <div className="result-box">
            <h2>Resultat</h2>

            <p><strong>Any:</strong> {result.classificacio?.any}</p>
            <p><strong>Tipus:</strong> {result.classificacio?.tipus}</p>
            <p><strong>Parròquia:</strong> {result.classificacio?.parroquia}</p>
            <p><strong>Estat legal:</strong> {result.classificacio?.estat_legal}</p>

            <h3>Text OCR:</h3>
            <pre>{result.text}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
