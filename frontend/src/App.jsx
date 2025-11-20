import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      {/* Header */}
      <header className="w-full max-w-3xl mb-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Classificador de Documents
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Carrega documents i deixa que el sistema els organitzi.
        </p>
      </header>

      {/* Card */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 transition hover:shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Puja un document
        </h2>

        <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 hover:bg-gray-50 transition">
          <span className="text-gray-500">Arrossega aquí un fitxer o</span>
          <span className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Selecciona un arxiu
          </span>
          <input type="file" className="hidden" />
        </label>

        <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition">
          Classificar document
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-gray-500 text-sm">
        © 2025 Bisbat — Classificador de Documents
      </footer>
    </div>
  );
}
