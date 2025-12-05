# app.py
from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from datetime import datetime
import os

# --- Config ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "evaluaciones.db")
FRONTEND_PATH = os.path.join(BASE_DIR, "..", "frontend")  # ajusta si cambias la estructura

app = Flask(__name__, static_folder=FRONTEND_PATH, static_url_path="/")
# Si vas a servir el frontend desde Flask no necesitas CORS; si usas Live Server, mantén CORS.
from flask_cors import CORS
CORS(app)

# --- DB simple ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS evaluaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        puntualidad INTEGER,
        responsabilidad INTEGER,
        tecnicas INTEGER,
        comunicacion INTEGER,
        promedio REAL,
        estado TEXT,
        recomendaciones TEXT,
        fecha TEXT
    )
    """)
    conn.commit()
    conn.close()

def guardar_evaluacion(p, r, t, c, promedio, estado, recomendaciones_text):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    fecha = datetime.now().isoformat(timespec='seconds')
    cur.execute("""
        INSERT INTO evaluaciones (puntualidad, responsabilidad, tecnicas, comunicacion, promedio, estado, recomendaciones, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (p, r, t, c, promedio, estado, recomendaciones_text, fecha))
    conn.commit()
    conn.close()

def obtener_historial(limit=50):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, puntualidad, responsabilidad, tecnicas, comunicacion, promedio, estado, recomendaciones, fecha FROM evaluaciones ORDER BY id DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    cols = ["id","puntualidad","responsabilidad","tecnicas","comunicacion","promedio","estado","recomendaciones","fecha"]
    return [dict(zip(cols, r)) for r in rows]

# --- Lógica simple de recomendaciones ---
def generar_recomendaciones(p, r, t, c):
    reco = []
    if p < 5:
        reco.append("Mejorar puntualidad: alarmas y preparar material la noche anterior.")
    if r < 5:
        reco.append("Fortalecer responsabilidad: usar agenda y dividir tareas.")
    if t < 5:
        reco.append("Practicar técnicas específicas y pedir retroalimentación.")
    if c < 5:
        reco.append("Mejorar comunicación: escucha activa y participar más.")
    if not reco:
        reco.append("Buen desempeño: mantener hábitos actuales.")
    return reco

def interpretar_promedio(promedio):
    if promedio < 3:
        return "Riesgo muy alto"
    elif promedio < 5:
        return "Riesgo alto"
    elif promedio < 7:
        return "Riesgo moderado"
    else:
        return "Riesgo bajo"

# --- Endpoints ---
@app.route('/')
def index():
    # sirve frontend/index.html si quieres usar Flask como servidor de archivos
    return send_from_directory(app.static_folder, "index.html")

@app.route('/evaluar', methods=['POST'])
def evaluar():
    data = request.get_json() or {}
    try:
        p = int(data.get("puntualidad", 0))
        r = int(data.get("responsabilidad", 0))
        t = int(data.get("tecnicas", 0))
        c = int(data.get("comunicacion", 0))
    except (TypeError, ValueError):
        return jsonify({"error":"Entradas inválidas: usar números enteros 0-10."}), 400

    promedio = round((p + r + t + c) / 4, 2)
    estado = interpretar_promedio(promedio)
    recomendaciones = generate_recs = generar_recomendaciones(p, r, t, c)
    recomendaciones_text = " | ".join(recommendaciones)

    # guardar
    guardar_evaluacion(p, r, t, c, promedio, estado, recomendaciones_text)

    return jsonify({
        "promedio": promedio,
        "estado": estado,
        "recomendaciones": recomendaciones
    })

@app.route('/historial', methods=['GET'])
def historial():
    datos = obtener_historial(limit=100)
    return jsonify(datos)

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
