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
    const textMatch =
      doc.fitxer.toLowerCase().includes(search.toLowerCase()) ||
      doc.text?.toLowerCase().includes(search.toLowerCase());
    const typeMatch = filterType ? doc.classificacio.tipus === filterType : true;
    return textMatch && typeMatch;
  });

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un fitxer primer!");

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
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  // NOU: Esborrar només un document
  const deleteOne = async (nomBase) => {
    if (!window.confirm(`Segur que vols eliminar "${nomBase}"?`)) return;

    try {
      await axios.delete(`https://bisbat-backend.onrender.com/delete/${nomBase}`);
      await fetchDocuments(); // refresca la llista
      alert("Document eliminat!");
    } catch (err) {
      alert("Error al eliminar el document");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Arxiu Sacre del Bisbat</h1>

      <div style={{ margin: "30px 0" }}>
        <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px", padding: "8px 16px" }}>
          {loading ? "Processant..." : "Pujar i classificar"}
        </button>
      </div>

      {/* RESULTAT DE LA DARRERA PUJADA */}
      {result && (
        <div style={{ margin: "40px auto", maxWidth: "800px", textAlign: "left", background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
          <h2>Resultat</h2>
          <p><strong>Any:</strong> {result.classificacio?.any}</p>
          <p><strong>Tipus:</strong> {result.classificacio?.tipus}</p>
          <p><strong>Parròquia:</strong> {result.classificacio?.parroquia}</p>
          <h3>Text extret (primeres línies):</h3>
          <pre style={{ background: "#fff", padding: "10px", borderRadius: "5px", maxHeight: "300px", overflow: "auto" }}>
            {result.text}
          </pre>
        </div>
      )}

      {/* HISTORIAL */}
      <h2>Historial de documents</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Cerca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        <select onChange={(e) => setFilterType(e.target.value)} style={{ padding: "8px" }}>
          <option value="">Tots els tipus</option>
          <option value="Factura">Factura</option>
          <option value="Carta">Carta</option>
          <option value="Matrimoni">Matrimoni</option>
          <option value="Defunció">Defunció</option>
          <option value="Partida de baptisme">Baptisme</option>
          <option value="Altres">Altres</option>
        </select>
      </div>

      {filteredDocuments.length === 0 ? (
        <p>No hi ha documents</p>
      ) : (
        <table style={{ margin: "auto", borderCollapse: "collapse", width: "95%" }}>
          <thead>
            <tr style={{ background: "#333", color: "white" }}>
              <th style={{ padding: "10px" }}>Fitxer</th>
              <th style={{ padding: "10px" }}>Any</th>
              <th style={{ padding: "10px" }}>Tipus</th>
              <th style={{ padding: "10px" }}>Parròquia</th>
              <th style={{ padding: "10px" }}>Acció</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.nom_base} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{doc.fitxer}</td>
                <td style={{ padding: "10px" }}>{doc.classificacio.any}</td>
                <td style={{ padding: "10px" }}>{doc.classificacio.tipus}</td>
                <td style={{ padding: "10px" }}>{doc.classificacio.parroquia}</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => deleteOne(doc.nom_base)}
                    style={{
                      background: "#c0392b",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
