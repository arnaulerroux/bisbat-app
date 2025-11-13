import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const textMatch = doc.nom_llibre.toLowerCase().includes(search) ||
                     doc.text?.toLowerCase().includes(search);
    const typeMatch = filterType ? doc.classificacio.tipus === filterType : true;
    return textMatch && typeMatch;
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
      alert("Error al pujar!");
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

  useEffect(() => { fetchDocuments(); }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Classificador de Documents - Bisbat</h1>

      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px", padding: "10px 20px" }}>
        {loading ? "Processant..." : "Pujar i classificar"}
      </button>

      {result && (
        <div style={{ marginTop: "30px", textAlign: "left", maxWidth: "800px", margin: "auto" }}>
          <h2>Resultat</h2>
          <p><strong>Llibre:</strong> {result.llibre}</p>
          <p><strong>Pàgines:</strong> {result.pagines}</p>
          <p><strong>Any:</strong> {result.classificacio?.any}</p>
          <p><strong>Tipus:</strong> {result.classificacio?.tipus}</p>
          <p><strong>Parròquia:</strong> {result.classificacio?.parroquia}</p>

          <h3>Text extret (primers 2000 caràcters):</h3>
          <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px", maxHeight: "300px", overflowY: "auto" }}>
            {result.text}
          </pre>
        </div>
      )}

      <button
        onClick={async () => {
          if (window.confirm("Segur que vols esborrar TOT l'historial?")) {
            await axios.delete("https://bisbat-backend.onrender.com//clear");
            fetchDocuments();
          }
        }}
        style={{ marginTop: "20px", padding: "12px 24px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
      >
        Netejar historial
      </button>

      <hr style={{ margin: "40px 0" }} />

      <h2>Historial de llibres</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Cerca per nom o text..."
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          style={{ padding: "8px", width: "250px", borderRadius: "5px", border: "1px solid #ccc", marginRight: "10px" }}
        />
        <select onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}>
          <option value="">Tots els tipus</option>
          <option value="Partida de baptisme">Baptisme</option>
          <option value="Matrimoni">Matrimoni</option>
          <option value="Defunció">Defunció</option>
          <option value="Factura">Factura</option>
          <option value="Carta">Carta</option>
          <option value="Altres">Altres</option>
        </select>
      </div>

      {filteredDocuments.length === 0 ? (
        <p>No hi ha llibres que coincideixin.</p>
      ) : (
        <table style={{ margin: "auto", borderCollapse: "collapse", width: "95%" }}>
          <thead>
            <tr style={{ background: "#2c3e50", color: "white" }}>
              <th style={{ padding: "12px" }}>Llibre</th>
              <th style={{ padding: "12px" }}>Any</th>
              <th style={{ padding: "12px" }}>Tipus</th>
              <th style={{ padding: "12px" }}>Pàgines</th>
              <th style={{ padding: "12px" }}>Parròquia</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8f9fa" : "white" }}>
                <td style={{ padding: "10px" }}>{doc.nom_llibre}</td>
                <td style={{ padding: "10px" }}>{doc.classificacio.any}</td>
                <td style={{ padding: "10px" }}>{doc.classificacio.tipus}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>{doc.pagines}</td>
                <td style={{ padding: "10px" }}>{doc.classificacio.parroquia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

