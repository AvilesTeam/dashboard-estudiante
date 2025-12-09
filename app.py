from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

# --- Configuración de Carpetas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_PATH = BASE_DIR 

# En Render, usa /tmp para BD temporal. En local, usa la carpeta actual
if os.environ.get('RENDER'):
    DB_PATH = os.path.join('/tmp', "evaluaciones.db")
else:
    DB_PATH = os.path.join(BASE_DIR, "evaluaciones.db")

app = Flask(__name__, static_folder=FRONTEND_PATH, static_url_path='')
CORS(app)

# --- Base de Datos ---
def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Tabla de evaluaciones (almacena todos los campos en formato JSON)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS evaluaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campos TEXT,
            observaciones TEXT,
            clasificacion TEXT,
            promedio REAL,
            fecha TEXT
        )
        """)
        
        # Tabla de configuración (almacena los campos dinámicos permitidos)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS configuracion (
            id INTEGER PRIMARY KEY,
            nombres_campos TEXT
        )
        """)
        
        # Inicializar configuración si no existe
        cur.execute("SELECT COUNT(*) FROM configuracion")
        if cur.fetchone()[0] == 0:
            import json
            campos_iniciales = json.dumps(["Creatividad", "Liderazgo"])
            cur.execute("INSERT INTO configuracion (id, nombres_campos) VALUES (1, ?)", (campos_iniciales,))
        
        conn.commit()
        conn.close()
        print(f"--- Base de datos verificada en: {DB_PATH} ---")
    except Exception as e:
        print(f"Error inicializando DB: {e}")

def guardar_evaluacion(campos_json, observaciones, clasificacion, promedio):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    fecha = datetime.now().isoformat(timespec='seconds')
    cur.execute("""
        INSERT INTO evaluaciones (campos, observaciones, clasificacion, promedio, fecha)
        VALUES (?, ?, ?, ?, ?)
    """, (campos_json, observaciones, clasificacion, promedio, fecha))
    conn.commit()
    conn.close()

def obtener_historial():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM evaluaciones ORDER BY id DESC LIMIT 50")
    rows = cur.fetchall()
    conn.close()
    cols = ["id","campos","observaciones","clasificacion","promedio","fecha"]
    return [dict(zip(cols, r)) for r in rows]

def eliminar_todo_el_historial():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM evaluaciones")
    cur.execute("DELETE FROM sqlite_sequence WHERE name='evaluaciones'")
    conn.commit()
    conn.close()

# --- Lógica de Negocio ---
def generar_recomendaciones(campos_dict):
    """Genera recomendaciones basadas en todos los campos dinámicos"""
    reco = []
    
    # Analizar todos los campos
    for campo, valor in campos_dict.items():
        if isinstance(valor, (int, float)) and valor < 50:
            reco.append(f"Mejorar {campo}")
    
    if not reco:
        reco.append("¡Excelente desempeño!")
    
    return reco

def interpretar_promedio(promedio):
    if promedio < 50: return "Riesgo Alto"
    elif promedio < 70: return "Regular"
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
    import json
    data = request.get_json() or {}
    
    # Obtener campos dinámicos
    campos = data.get("campos", {})
    observaciones = data.get("observaciones", "")
    
    # Validar que haya campos
    if not campos:
        return jsonify({"error":"No hay campos para evaluar"}), 400
    
    try:
        # Calcular promedio
        valores = [float(v) for v in campos.values() if isinstance(v, (int, float))]
        promedio = round(sum(valores) / len(valores), 2) if valores else 0
    except:
        return jsonify({"error":"Datos inválidos"}), 400
    
    # Interpretar promedio
    if promedio < 50:
        clasificacion = "Riesgo Alto"
    elif promedio < 70:
        clasificacion = "Regular"
    else:
        clasificacion = "Aprobado"
    
    # Generar recomendaciones
    recs = generar_recomendaciones(campos)
    recs_text = " | ".join(recs)
    
    # Guardar evaluación
    campos_json = json.dumps(campos)
    guardar_evaluacion(campos_json, observaciones, clasificacion, promedio)
    
    return jsonify({
        "mensaje": "Guardado",
        "promedio": promedio,
        "clasificacion": clasificacion,
        "recomendaciones": recs
    })

@app.route('/historial', methods=['GET'])
def historial():
    datos = obtener_historial()
    return jsonify(datos)

@app.route('/borrar', methods=['GET', 'DELETE'])
def borrar():
    eliminar_todo_el_historial()
    return jsonify({"mensaje": "✅ Historial eliminado y reiniciado correctamente."})

# --- RUTAS PARA CONFIGURACIÓN DINÁMICA ---
@app.route('/config/campos', methods=['GET'])
def obtener_campos():
    """Obtiene la lista de campos dinámicos actuales"""
    import json
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT nombres_campos FROM configuracion WHERE id = 1")
    row = cur.fetchone()
    conn.close()
    
    if row:
        try:
            campos = json.loads(row[0])
        except:
            campos = []
    else:
        campos = []
    
    return jsonify({"campos": campos})

@app.route('/config/campos', methods=['POST'])
def actualizar_campos():
    """Actualiza la lista de campos dinámicos"""
    import json
    data = request.get_json() or {}
    campos = data.get("campos", [])
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        campos_json = json.dumps(campos)
        cur.execute("UPDATE configuracion SET nombres_campos = ? WHERE id = 1", (campos_json,))
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Configuración actualizada", "campos": campos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/config/campos/agregar', methods=['POST'])
def agregar_campo():
    """Agrega un nuevo campo dinámico"""
    import json
    data = request.get_json() or {}
    nuevo_campo = data.get("campo", "").strip()
    
    if not nuevo_campo:
        return jsonify({"error": "Campo vacío"}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT nombres_campos FROM configuracion WHERE id = 1")
        row = cur.fetchone()
        
        campos = []
        if row:
            try:
                campos = json.loads(row[0])
            except:
                campos = []
        
        if nuevo_campo not in campos:
            campos.append(nuevo_campo)
        
        campos_json = json.dumps(campos)
        cur.execute("UPDATE configuracion SET nombres_campos = ? WHERE id = 1", (campos_json,))
        conn.commit()
        conn.close()
        
        return jsonify({"mensaje": "Campo agregado", "campos": campos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/config/campos/eliminar', methods=['POST'])
def eliminar_campo():
    """Elimina un campo dinámico"""
    import json
    data = request.get_json() or {}
    campo_a_eliminar = data.get("campo", "").strip()
    
    if not campo_a_eliminar:
        return jsonify({"error": "Campo vacío"}), 400
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT nombres_campos FROM configuracion WHERE id = 1")
        row = cur.fetchone()
        
        campos = []
        if row:
            try:
                campos = json.loads(row[0])
            except:
                campos = []
        
        if campo_a_eliminar in campos:
            campos.remove(campo_a_eliminar)
        
        campos_json = json.dumps(campos)
        cur.execute("UPDATE configuracion SET nombres_campos = ? WHERE id = 1", (campos_json,))
        conn.commit()
        conn.close()
        
        return jsonify({"mensaje": "Campo eliminado", "campos": campos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- INICIALIZACIÓN (CORREGIDO) ---
# Ejecutamos init_db() AQUÍ FUERA para que Render lo ejecute al cargar
init_db()

if __name__ == "__main__":
    # app.run solo se ejecuta si lo lanzas manualmente en tu PC
    app.run(debug=True, port=5000)