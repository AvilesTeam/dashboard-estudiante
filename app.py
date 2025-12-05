from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

# --- Configuración de Carpetas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_PATH = BASE_DIR 
DB_PATH = os.path.join(BASE_DIR, "evaluaciones.db")

app = Flask(__name__, static_folder=FRONTEND_PATH, static_url_path='')
CORS(app)

# --- Base de Datos ---
def init_db():
    try:
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
        print(f"--- Base de datos verificada en: {DB_PATH} ---")
    except Exception as e:
        print(f"Error inicializando DB: {e}")

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

def obtener_historial():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM evaluaciones ORDER BY id DESC LIMIT 50")
    rows = cur.fetchall()
    conn.close()
    cols = ["id","puntualidad","responsabilidad","tecnicas","comunicacion","promedio","estado","recomendaciones","fecha"]
    return [dict(zip(cols, r)) for r in rows]

def eliminar_todo_el_historial():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM evaluaciones")
    cur.execute("DELETE FROM sqlite_sequence WHERE name='evaluaciones'")
    conn.commit()
    conn.close()

# --- Lógica de Negocio ---
def generar_recomendaciones(p, r, t, c):
    reco = []
    if p < 5: reco.append("Mejorar puntualidad")
    if r < 5: reco.append("Mejorar responsabilidad")
    if t < 5: reco.append("Repasar técnicas")
    if c < 5: reco.append("Mejorar comunicación")
    if not reco: reco.append("¡Excelente desempeño!")
    return reco

def interpretar_promedio(promedio):
    if promedio < 5: return "Riesgo Alto"
    elif promedio < 7: return "Regular"
    else: return "Aprobado"

# --- RUTAS ---
@app.route('/')
def index():
    return send_from_directory(FRONTEND_PATH, "index.html")

@app.route('/dashboard.html')
def dashboard():
    return send_from_directory(FRONTEND_PATH, "dashboard.html")

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_PATH, path)

@app.route('/evaluar', methods=['POST'])
def evaluar():
    data = request.get_json() or {}
    try:
        p = int(data.get("puntualidad", 0))
        r = int(data.get("responsabilidad", 0))
        t = int(data.get("tecnicas", 0))
        c = int(data.get("comunicacion", 0))
    except:
        return jsonify({"error":"Datos inválidos"}), 400

    promedio = round((p + r + t + c) / 4, 2)
    estado = interpretar_promedio(promedio)
    recs = generar_recomendaciones(p, r, t, c)
    recs_text = " | ".join(recs)
    guardar_evaluacion(p, r, t, c, promedio, estado, recs_text)
    return jsonify({"mensaje": "Guardado", "promedio": promedio, "estado": estado})

@app.route('/historial', methods=['GET'])
def historial():
    datos = obtener_historial()
    return jsonify(datos)

@app.route('/borrar', methods=['GET', 'DELETE'])
def borrar():
    eliminar_todo_el_historial()
    return jsonify({"mensaje": "✅ Historial eliminado y reiniciado correctamente."})

# --- INICIALIZACIÓN (CORREGIDO) ---
# Ejecutamos init_db() AQUÍ FUERA para que Render lo ejecute al cargar
init_db()

if __name__ == "__main__":
    # app.run solo se ejecuta si lo lanzas manualmente en tu PC
    app.run(debug=True, port=5000)