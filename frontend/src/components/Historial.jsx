import React, { useState, useMemo } from "react";
import "./historial.css";

export default function Historial({ documents, onDelete }) {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    any: "",
    tipus: "",
    estat: "",
    parroquia: "",
  });
  const [sortField, setSortField] = useState("any");
  const [sortDir, setSortDir] = useState("asc");

  // 🔍 Filtrat i ordenació
  const filtered = useMemo(() => {
    let data = [...documents];

    // Buscador global
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(d =>
        d.fitxer.toLowerCase().includes(s) ||
        d.text?.toLowerCase().includes(s) ||
        d.classificacio.any.toString().includes(s) ||
        d.classificacio.tipus.toLowerCase().includes(s) ||
        d.classificacio.estat_legal.toLowerCase().includes(s) ||
        d.classificacio.parroquia.toLowerCase().includes(s)
      );
    }

    // Filtres
    if (filter.any) data = data.filter(d => d.classificacio.any === filter.any);
    if (filter.tipus) data = data.filter(d => d.classificacio.tipus === filter.tipus);
    if (filter.estat) data = data.filter(d => d.classificacio.estat_legal === filter.estat);
    if (filter.parroquia) data = data.filter(d => d.classificacio.parroquia === filter.parroquia);

    // Ordenació
    data.sort((a, b) => {
      let A = a.classificacio[sortField] || "";
      let B = b.classificacio[sortField] || "";
      if (typeof A === "string") A = A.toLowerCase();
      if (typeof B === "string") B = B.toLowerCase();
      return sortDir === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });

    return data;
  }, [documents, search, filter, sortField, sortDir]);

  // 🔢 Estadístiques útils
  const total = documents.length;
  const perTipus = useMemo(() => {
    const map = {};
    documents.forEach(d => {
      const t = d.classificacio.tipus || "Altres";
      map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [documents]);

  return (
    <div className="historial-container">

      <h2>📚 Historial de Documents</h2>

      {/* --- BUSCADOR GLOBAL --- */}
      <input
        className="search-bar"
        type="text"
        placeholder="🔍 Cerca qualsevol cosa…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* --- CONTROLS DE FILTRAT I ORDENACIÓ --- */}
      <div className="filters">
        <select onChange={e => setFilter({ ...filter, tipus: e.target.value })}>
          <option value="">Tipus</option>
          <option>Factura</option>
          <option>Carta</option>
          <option>Matrimoni</option>
          <option>Defunció</option>
          <option>Partida de baptisme</option>
          <option>Altres</option>
        </select>

        <select onChange={e => setFilter({ ...filter, estat: e.target.value })}>
          <option value="">Estat</option>
          <option>Vigent</option>
          <option>Històric</option>
        </select>

        <select onChange={e => setFilter({ ...filter, any: e.target.value })}>
          <option value="">Any</option>
          {Array.from(new Set(documents.map(d => d.classificacio.any)))
            .sort()
            .map(any => (
              <option key={any}>{any}</option>
            ))}
        </select>

        <select onChange={e => setFilter({ ...filter, parroquia: e.target.value })}>
          <option value="">Parròquia</option>
          {Array.from(new Set(documents.map(d => d.classificacio.parroquia)))
            .sort()
            .map(p => (
              <option key={p}>{p}</option>
            ))}
        </select>

        {/* ORDENACIÓ */}
        <select onChange={e => setSortField(e.target.value)}>
          <option value="any">Ordenar per Any</option>
          <option value="tipus">Tipus</option>
          <option value="estat_legal">Estat Legal</option>
          <option value="parroquia">Parròquia</option>
        </select>

        <select onChange={e => setSortDir(e.target.value)}>
          <option value="asc">Ascendent</option>
          <option value="desc">Descendent</option>
        </select>
      </div>

      {/* --- ESTADÍSTIQUES --- */}
      <div className="stats">
        <p>📄 Total documents: <strong>{total}</strong></p>
        <div className="stats-grid">
          {Object.keys(perTipus).map(tipus => (
            <div key={tipus} className="stat-card">
              <p>{tipus}</p>
              <strong>{perTipus[tipus]}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* --- LLISTAT DE DOCUMENTS --- */}
      <div className="list">
        {filtered.length === 0 ? (
          <p>No hi ha resultats.</p>
        ) : (
          filtered.map((doc, i) => (
            <div key={i} className="doc-card">
              <div>
                <h4>{doc.fitxer}</h4>
                <p><strong>Any:</strong> {doc.classificacio.any}</p>
                <p><strong>Tipus:</strong> {doc.classificacio.tipus}</p>
                <p><strong>Estat:</strong> {doc.classificacio.estat_legal}</p>
                <p><strong>Parròquia:</strong> {doc.classificacio.parroquia}</p>
              </div>

              <button
                className="delete-btn"
                onClick={() => onDelete(doc.fitxer)}
              >
                🗑 Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
