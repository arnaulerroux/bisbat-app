import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const textMatch = doc.fitxer.toLowerCase().includes(search.toLowerCase()) ||
                     doc.text?.toLowerCase().includes(search.toLowerCase());
    return textMatch;
  });

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un fitxer!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("https://bisbat-backend.onrender.com/ocr", formData);
      setResult(res.data);
      await fetchDocuments();
    } catch (err) {
      alert("Error al pujar el fitxer!");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("https://bisbat-backend.onrender.com/documents");
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>📄 Classificador de Documents - Bisbat</h1>

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
        {loading ? "Processant..." : "Pujar i classificar"}
      </button>

      {result && (
        <div style={{ marginTop: "30px", textAlign: "left", maxWidth: "800px", margin: "auto" }}>
          <h2>🧠 Resultat</h2>
          <p><strong>Any:</strong> {result.classificacio?.any}</p>
          <p><strong>Tipus:</strong> {result.classificacio?.tipus}</p>
          <p><strong>Estat legal:</strong> {result.classificacio?.estat_legal}</p>
          <p><strong>Parròquia:</strong> {result.classificacio?.parroquia}</p>

          <h3>📜 Text extret:</h3>
          <pre style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "5px",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
            {result.text}
          </pre>
        </div>
      )}

      <button
        onClick={async () => {
          if (window.confirm("Segur que vols esborrar tot l'historial?")) {
            await axios.delete("https://bisbat-backend.onrender.com/clear");
            fetchDocuments();
          }
        }}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Netejar historial
      </button>

      <hr style={{ margin: "40px 0" }} />

      <h2>📚 Historial de documents</h2>
      <input
        type="text"
        placeholder="🔍 Cerca per nom o text..."
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          width: "250px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginBottom: "20px"
        }}
      />

      {filteredDocuments.length === 0 ? (
        <p>No hi ha documents guardats encara.</p>
      ) : (
        <table style={{ margin: "auto", borderCollapse: "collapse", width: "90%" }}>
          <thead>
            <tr style={{ background: "#ddd" }}>
              <th>Fitxer</th>
              <th>Any</th>
              <th>Tipus</th>
              <th>Estat</th>
              <th>Parròquia</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{doc.fitxer}</td>
                <td>{doc.classificacio.any}</td>
                <td>{doc.classificacio.tipus}</td>
                <td>{doc.classificacio.estat_legal}</td>
                <td>{doc.classificacio.parroquia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;