from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import io
from PIL import Image
import os
import pytesseract
import re
import json

# CONFIGURACIÓ TESSERACT
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

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
    return {"message": "Servidor funcionant!", "ocr_ready": True}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        filename = file.filename
        nom_base = obtenir_nom_base(filename)

        # NOMÉS IMATGES (JPG, PNG, etc.) — PDF després
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
            return {"error": "Només imatges JPG/PNG per ara. PDF després."}

        image = Image.open(io.BytesIO(image_bytes))
        text_nou = pytesseract.image_to_string(image, lang="cat+spa")

        llibre = next((d for d in db if d["nom_base"] == nom_base), None)

        if llibre:
            llibre["text"] += "\n\n--- PÀGINA NOU ---\n\n" + text_nou
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
        return {"error": str(e)}

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