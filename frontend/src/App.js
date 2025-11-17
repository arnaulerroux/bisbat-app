import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");

  const filtered = documents.filter(d => 
    d.nom_llibre.toLowerCase().includes(search.toLowerCase()) ||
    d.text?.toLowerCase().includes(search.toLowerCase())
  );

  const upload = async () => {
    if (!file) return alert("Selecciona un document");
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post("https://bisbat-backend.onrender.com/ocr", form);
      setResult(res.data);
      fetchDocs();
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || "No s'ha pogut processar"));
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async () => {
    try {
      const res = await axios.get("https://bisbat-backend.onrender.com/documents");
      setDocuments(res.data.documents || []);
    } catch (e) { }
  };

  useEffect(() => { fetchDocs(); }, []);

  return (
    <div style={styles.body}>
      {/* HEADER GÒTIC */}
      <header style={styles.header}>
        <div style={styles.cross}>✝</div>
        <h1 style={styles.title}>Arxiu Sacre</h1>
        <div style={styles.cross}>✝</div>
        <p style={styles.subtitle}>Classificador intel·ligent del Bisbat</p>
      </header>

      {/* UPLOAD */}
      <div style={styles.card}>
        <input type="file" onChange={e => setFile(e.target.files[0])} style={styles.input} />
        {file && <p style={styles.fileName}>{file.name}</p>}
        <button onClick={upload} disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
          {loading ? "🔮 Processant amb IA..." : "⬆ Pujar i classificar"}
        </button>
      </div>

      {/* RESULTAT */}
      {result && !result.error && (
        <div style={styles.resultCard}>
          <h2 style={styles.resultTitle}>Document classificat</h2>
          <div style={styles.grid}>
            <div style={styles.box}><span style={styles.label}>Llibre</span><br/>{result.llibre}</div>
            <div style={styles.box}><span style={styles.label}>Pàgines</span><br/>{result.pagines}</div>
            <div style={styles.box}><span style={styles.label}>Any</span><br/>{result.classificacio?.any || "?"}</div>
            <div style={styles.box}><span style={styles.label}>Tipus</span><br/>{result.classificacio?.tipus || "?"}</div>
            <div style={styles.box}><span style={styles.label}>Parròquia</span><br/>{result.classificacio?.parroquia || "?"}</div>
          </div>
          <div style={styles.textBox}>
            <pre style={styles.pre}>{result.text}</pre>
          </div>
        </div>
      )}

      {/* NETEJAR */}
      <button onClick={() => axios.delete("https://bisbat-backend.onrender.com/clear").then(() => {setResult(null); fetchDocs();})} 
              style={styles.clearBtn}>🗑 Netejar historial</button>

      {/* HISTORIAL */}
      <div style={styles.history}>
        <h2 style={styles.historyTitle}>Arxiu Històric</h2>
        <input placeholder="🔍 Cerca..." value={search} onChange={e => setSearch(e.target.value)} style={styles.search} />
        {filtered.length === 0 ? 
          <p style={styles.empty}>Comença a pujar els teus arxius sagrats...</p> :
          <div style={styles.gridHistory}>
            {filtered.map((d, i) => (
              <div key={i} style={styles.historyCard}>
                <h3 style={styles.historyName}>{d.nom_llibre}</h3>
                <p>📅 {d.classificacio.any}</p>
                <p>📜 {d.classificacio.tipus}</p>
                <p>📍 {d.classificacio.parroquia}</p>
                <p>📄 {d.pagines} pàg.</p>
              </div>
            ))}
          </div>
        }
      </div>

      <footer style={styles.footer}>© 2025 Arxiu Sacre del Bisbat — Arnau Lerroux</footer>
    </div>
  );
}

const styles = {
  body: { 
    fontFamily: "'Georgia', serif", 
    background: "linear-gradient(135deg, #1a0033, #000000)", 
    color: "#e6d6b3", 
    minHeight: "100vh", 
    padding: "20px" 
  },
  header: { 
    textAlign: "center", 
    padding: "40px", 
    background: "rgba(0,0,0,0.7)", 
    border: "3px solid #b8860b", 
    borderRadius: "20px", 
    marginBottom: "30px" 
  },
  cross: { 
    fontSize: "50px", 
    color: "#b8860b", 
    display: "inline-block", 
    margin: "0 20px" 
  },
  title: { 
    fontSize: "60px", 
    background: "linear-gradient(to right, #b8860b, #ffd700)", 
    WebkitBackgroundClip: "text", 
    WebkitTextFillColor: "transparent", 
    margin: "0" 
  },
  subtitle: { 
    fontStyle: "italic", 
    color: "#d8bfd8", 
    fontSize: "22px" 
  },
  card: { 
    background: "rgba(20,0,40,0.8)", 
    padding: "30px", 
    borderRadius: "20px", 
    textAlign: "center", 
    border: "2px solid #b8860b", 
    maxWidth: "600px", 
    margin: "0 auto 40px" 
  },
  input: { 
    width: "100%", 
    padding: "15px", 
    background: "#000", 
    border: "2px dashed #b8860b", 
    color: "#fff", 
    borderRadius: "10px", 
    marginBottom: "15px" 
  },
  fileName: { 
    color: "#ffd700", 
    fontWeight: "bold", 
    margin: "10px 0" 
  },
  btn: { 
    background: "linear-gradient(#b8860b, #ffd700)", 
    color: "#000", 
    padding: "18px 40px", 
    fontSize: "20px", 
    border: "none", 
    borderRadius: "15px", 
    cursor: "pointer", 
    fontWeight: "bold" 
  },
  btnDisabled: { 
    background: "#555", 
    color: "#999", 
    padding: "18px 40px", 
    fontSize: "20px", 
    borderRadius: "15px", 
    cursor: "not-allowed" 
  },
  resultCard: { 
    background: "rgba(20,0,40,0.9)", 
    padding: "30px", 
    borderRadius: "20px", 
    border: "2px solid #b8860b", 
    margin: "30px auto", 
    maxWidth: "1000px" 
  },
  resultTitle: { 
    fontSize: "36px", 
    textAlign: "center", 
    background: "linear-gradient(#b8860b, #ffd700)", 
    WebkitBackgroundClip: "text", 
    WebkitTextFillColor: "transparent" 
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
    gap: "20px", 
    margin: "30px 0" 
  },
  box: { 
    background: "rgba(138,43,226,0.3)", 
    padding: "20px", 
    borderRadius: "15px", 
    textAlign: "center", 
    border: "1px solid #b8860b" 
  },
  label: { 
    color: "#d8bfd8", 
    fontSize: "14px" 
  },
  textBox: { 
    background: "#000", 
    padding: "20px", 
    borderRadius: "15px", 
    border: "1px solid #b8860b", 
    maxHeight: "400px", 
    overflow: "auto" 
  },
  pre: { 
    whiteSpace: "pre-wrap", 
    margin: 0, 
    fontSize: "16px" 
  },
  clearBtn: { 
    background: "#8b0000", 
    color: "white", 
    padding: "15px 30px", 
    border: "none", 
    borderRadius: "15px", 
    fontSize: "18px", 
    cursor: "pointer", 
    display: "block", 
    margin: "30px auto" 
  },
  history: { 
    marginTop: "60px" 
  },
  historyTitle: { 
    fontSize: "48px", 
    textAlign: "center", 
    background: "linear-gradient(#b8860b, #ffd700)", 
    WebkitBackgroundClip: "text", 
    WebkitTextFillColor: "transparent" 
  },
  search: { 
    width: "100%", 
    maxWidth: "500px", 
    padding: "15px", 
    background: "#000", 
    border: "2px solid #b8860b", 
    color: "white", 
    borderRadius: "15px", 
    fontSize: "18px", 
    display: "block", 
    margin: "20px auto" 
  },
  empty: { 
    textAlign: "center", 
    fontSize: "24px", 
    fontStyle: "italic", 
    color: "#d8bfd8" 
  },
  gridHistory: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
    gap: "20px", 
    marginTop: "30px" 
  },
  historyCard: { 
    background: "rgba(138,43,226,0.2)", 
    padding: "25px", 
    borderRadius: "15px", 
    border: "2px solid #b8860b", 
    textAlign: "center" 
  },
  historyName: { 
    fontSize: "24px", 
    color: "#ffd700", 
    marginBottom: "15px" 
  },
  footer: { 
    textAlign: "center", 
    marginTop: "80px", 
    padding: "30px", 
    color: "#d8bfd8", 
    fontSize: "16px" 
  }
};

export default App;