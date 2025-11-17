import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, FileText, X, Loader2, Church, Scroll, Calendar, Tag, MapPin, Search, Filter } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.nom_llibre.toLowerCase().includes(search.toLowerCase()) ||
                         doc.text?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType ? doc.classificacio.tipus === filterType : true;
    return matchesSearch && matchesType;
  });

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un document");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("https://bisbat-backend.onrender.com/ocr", formData);
      setResult(res.data);
      await fetchDocuments();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "No s'ha pogut processar"));
    } finally {
      setLoading(false  );
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("https://bisbat-backend.onrender.com/documents");
      setDocuments(res.data.documents || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100">
      {/* Header gótic modern */}
      <header className="relative overflow-hidden border-b border-yellow-600/30 bg-black/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-transparent to-purple-600/10"></div>
        <div className="relative container mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Church className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider">
              <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Arxiu Sacre
              </span>
            </h1>
            <Church className="w-12 h-12 text-yellow-500 scale-x-[-1]" />
          </div>
          <p className="text-purple-300 text-lg italic">Classificador intel·ligent de documents històrics del Bisbat</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Upload card */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-purple-900/50 to-black/50 backdrop-blur-lg border border-yellow-600/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <label className="cursor-pointer group">
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                <div className="bg-black/60 border-2 border-dashed border-yellow-600/50 rounded-xl p-12 hover:border-yellow-500 transition-all group-hover:scale-105">
                  {file ? (
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                      <p className="text-lg font-medium">{file.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                      <p className="text-xl">Arrossega o selecciona un document</p>
                    </div>
                  )}
                </div>
              </label>

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="px-10 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-700 disabled:to-gray-600 text-black font-bold text-lg rounded-xl shadow-xl flex items-center gap-3 transition-all hover:scale-105 disabled:scale-100"
              >
                {loading ? (
                  <> <Loader2 className="animate-spin" /> Processant amb IA...</>
                ) : (
                  <> <Scroll className="w-6 h-6" /> Pujar i classificar</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resultat */}
        {result && !result.error && (
          <div className="mb-12 animate-fadeIn">
            <div className="bg-black/60 backdrop-blur-lg border border-yellow-600/40 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Document classificat
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
                <div className="bg-purple-900/50 rounded-xl p-6 border border-purple-600/50">
                  <Scroll className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm text-purple-300">Llibre</p>
                  <p className="text-xl font-bold">{result.llibre}</p>
                </div>
                <div className="bg-purple-900/50 rounded-xl p-6 border border-purple-600/50">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm text-purple-300">Pàgines</p>
                  <p className="text-xl font-bold">{result.pagines}</p>
                </div>
                <div className="bg-purple-900/50 rounded-xl p-6 border border-purple-600/50">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm text-purple-300">Any</p>
                  <p className="text-xl font-bold">{result.classificacio?.any || "Desconegut"}</p>
                </div>
                <div className="bg-purple-900/50 rounded-xl p-6 border border-purple-600/50">
                  <Tag className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm text-purple-300">Tipus</p>
                  <p className="text-xl font-bold">{result.classificacio?.tipus || "Altres"}</p>
                </div>
                <div className="bg-purple-900/50 rounded-xl p-6 border border-purple-600/50">
                  <MapPin className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                  <p className="text-sm text-purple-300">Parròquia</p>
                  <p className="text-xl font-bold">{result.classificacio?.parroquia || "No especificada"}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <FileText className="text-yellow-500" /> Text extret
                </h3>
                <div className="bg-black/60 rounded-xl p-6 border border-purple-600/30 max-h-96 overflow-y-auto font-serif text-gray-300 leading-relaxed">
                  <pre className="whitespace-pre-wrap">{result.text}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Netejar historial */}
        <div className="text-center mb-12">
          <button
            onClick={async () => {
              if (window.confirm("Segur que vols esborrar TOT l'historial?")) {
                await axios.delete("https://bisbat-backend.onrender.com/clear");
                setResult(null);
                fetchDocuments();
              }
            }}
            className="px-8 py-4 bg-red-900/80 hover:bg-red-800 text-white font-bold rounded-xl border border-red-600/50 shadow-xl transition-all hover:scale-105"
          >
            <X className="inline w-5 h-5 mr-2" /> Netejar historial complet
          </button>
        </div>

        {/* Historial */}
        <div>
          <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Arxiu Històric
          </h2>

          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-600/30 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Cerca per nom o contingut..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-black/60 border border-purple-600/50 rounded-xl text-lg w-full md:w-96 focus:outline-none focus:border-yellow-500 transition"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-6 py-4 bg-black/60 border border-purple-600/50 rounded-xl text-lg focus:outline-none focus:border-yellow-500"
              >
                <option value="">Tots els tipus</option>
                <option value="Partida de baptisme">Baptisme</option>
                <option value="Matrimoni">Matrimoni</option>
                <option value="Defunció">Defunció</option>
                <option value="Factura">Factura</option>
                <option value="Carta">Carta</option>
                <option value="Altres">Altres</option>
              </select>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-20 text-purple-400 text-xl italic">
              No s'ha trobat cap document. Comença a pujar els teus arxius sagrats.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc, i) => (
                <div key={i} className="bg-gradient-to-br from-purple-900/50 to-black/60 backdrop-blur-lg rounded-xl border border-yellow-600/30 p-6 hover:border-yellow-500 transition-all hover:scale-105 shadow-xl">
                  <h3 className="text-2xl font-bold mb-3 text-yellow-500">{doc.nom_llibre}</h3>
                  <div className="space-y-3 text-purple-200">
                    <p><Calendar className="inline w-5 h-5 mr-2" />{doc.classificacio.any}</p>
                    <p><Tag className="inline w-5 h-5 mr-2" />{doc.classificacio.tipus}</p>
                    <p><FileText className="inline w-5 h-5 mr-2" />{doc.pagines} pàgina{doc.pagines !== 1 ? 's' : ''}</p>
                    <p><MapPin className="inline w-5 h-5 mr-2" />{doc.classificacio.parroquia}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-8 text-center text-purple-400 text-sm border-t border-yellow-600/20">
        © 2025 Arxiu Sacre del Bisbat — Desenvolupat per Arnau Lerroux
      </footer>
    </div>
  );
}

export default App;