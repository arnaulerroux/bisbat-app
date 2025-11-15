from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import io
import re
import json
import os

# API KEY GRATUÏTA (canvia per la teva)
OCR_API_KEY = "K89906914888957"  # <-- CANVIA AQUESTA PEL TEU

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# BASE DE DADES
def carregar_db():
    if os.path.exists("documents.json"):
        with open("documents.json", "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def guardar_db(db):
    with open("documents.json", "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

db = carregar_db()

# NOM BASE
def obtenir_nom_base(filename):
    name = os.path.splitext(filename)[0]
    match = re.match(r"(.+)_p\d+$", name)
    return match.group(1) if match else name

# CLASSIFICADOR
def classificar_text(text):
    c = {}
    any_match = re.search(r"(18|19|20)\d{2}", text)
    c["any"] = any_match.group(0) if any_match else "Desconegut"
    
    tipus = "Altres"
    if re.search(r"bautismo|bateig|baptism", text, re.I): tipus = "Partida de baptisme"
    elif re.search(r"matrimoni|casament", text, re.I): tipus = "Matrimoni"
    elif re.search(r"defunció|defuncion|muerte", text, re.I): tipus = "Defunció"
    elif re.search(r"factura|pago|proveedor|importe", text, re.I): tipus = "Factura"
    elif re.search(r"carta|epístola", text, re.I): tipus = "Carta"
    c["tipus"] = tipus

    c["estat_legal"] = "Històric" if c["any"] != "Desconegut" and int(c["any"]) < 2020 else "Vigent"
    
    parroquia = re.search(r"Parr[oó]quia\s+de\s+([A-Z][a-zA-Z]+)", text)
    c["parroquia"] = parroquia.group(1) if parroquia else "No especificada"
    
    return c

@app.get("/")
def home():
    return {"message": "Servidor funcionant amb OCR.Space!", "ocr_ready": True}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        # Llegeix el fitxer
        file_bytes = await file.read()
        filename = file.filename
        nom_base = obtenir_nom_base(filename)

        # OCR.SPACE API
        url = "https://api.ocr.space/parse/image"
        files = {'file': (filename, file_bytes)}
        data = {
            'apikey': OCR_API_KEY,
            'language': 'spa',  # o 'cat' per català
            'isOverlayRequired': False,
            'filetype': filename.split('.')[-1].upper()
        }
        
        response = requests.post(url, files=files, data=data, timeout=30)
        result = response.json()

        # DEBUG: Guarda la resposta per veure-la
        print("OCR.Space response:", result)

        # Extreu el text
        if result.get("IsErroredOnProcessing"):
            error_msg = result.get("ErrorMessage", ["Error desconegut"])[0]
            return {"error": f"OCR.Space error: {error_msg}"}
        
        parsed_results = result.get("ParsedResults", [])
        if not parsed_results:
            return {"error": "No s'ha trobat text. Prova amb una imatge més clara."}
        
        text_nou = parsed_results[0].get("ParsedText", "").strip()
        if not text_nou:
            return {"error": "Text buit. Prova amb una imatge amb text clar."}

        # Processa com abans
        llibre = next((d for d in db if d["nom_base"] == nom_base), None)

        if llibre:
            llibre["text"] += "\n\n--- PÀGINA NOVA ---\n\n" + text_nou
            llibre["pagines"] += 1
            llibre["fitxers"].append(filename)
            llibre["classificacio"] = classificar_text(llibre["text"])
        else:
            c = classificar_text(text_nou)
            llibre = {
                "nom_llibre": nom_base.replace("_", " "),
                "nom_base": nom_base,
                "classificacio": c,
                "text": text_nou,
                "pagines": 1,
                "fitxers": [filename]
            }
            db.append(llibre)

        guardar_db(db)
        return {
            "llibre": llibre["nom_llibre"],
            "pagines": llibre["pagines"],
            "classificacio": llibre["classificacio"],
            "text": llibre["text"][:2000] + ("..." if len(llibre["text"]) > 2000 else ""),
            "success": True
        }
    except Exception as e:
        print("Error:", str(e))
        return {"error": f"Error intern: {str(e)}"}

@app.get("/documents")
def obtenir_documents():
    return {"documents": db}

@app.delete("/clear")
def clear_history():
    global db
    db = []
    if os.path.exists("documents.json"):
        os.remove("documents.json")
    return {"message": "Historial netejat!"}