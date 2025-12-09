#!/usr/bin/env python3
"""
Script de inicialización para el sistema de evaluación dinámico
Ejecuta esto una sola vez para limpiar y reiniciar la BD
"""

import sqlite3
import json
import os

DB_PATH = "evaluaciones.db"

def limpiar_y_reiniciar():
    """Elimina la BD anterior y crea una nueva con valores iniciales"""
    
    # Eliminar BD anterior si existe
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"✅ Base de datos anterior eliminada: {DB_PATH}")
    
    # Crear nueva BD
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Tabla de evaluaciones
    cur.execute("""
    CREATE TABLE evaluaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        puntualidad INTEGER,
        responsabilidad INTEGER,
        tecnicas INTEGER,
        comunicacion INTEGER,
        competencias_extra TEXT,
        promedio REAL,
        estado TEXT,
        recomendaciones TEXT,
        fecha TEXT
    )
    """)
    print("✅ Tabla 'evaluaciones' creada")
    
    # Tabla de configuración
    cur.execute("""
    CREATE TABLE configuracion (
        id INTEGER PRIMARY KEY,
        nombres_campos TEXT
    )
    """)
    print("✅ Tabla 'configuracion' creada")
    
    # Insertar configuración inicial (TODOS los campos son dinámicos)
    campos_iniciales = json.dumps([
        "Puntualidad",
        "Responsabilidad",
        "Habilidades Técnicas",
        "Comunicación",
        "Creatividad",
        "Liderazgo"
    ])
    cur.execute(
        "INSERT INTO configuracion (id, nombres_campos) VALUES (1, ?)",
        (campos_iniciales,)
    )
    conn.commit()
    print(f"✅ Configuración inicial establecida: {campos_iniciales}")
    
    # Insertar datos de prueba (opcional)
    cur.execute("""
        INSERT INTO evaluaciones 
        (puntualidad, responsabilidad, tecnicas, comunicacion, competencias_extra, promedio, estado, recomendaciones, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        85,  # puntualidad
        90,  # responsabilidad
        75,  # tecnicas
        88,  # comunicacion
        json.dumps({"Creatividad": 80, "Liderazgo": 92}),  # competencias_extra
        85.25,  # promedio
        "Aprobado",  # estado
        "Excelente trabajo | Mejorar técnicas",  # recomendaciones
        "2024-12-09 10:30:45"  # fecha
    ))
    conn.commit()
    print("✅ Datos de prueba insertados")
    
    conn.close()
    print("\n" + "="*60)
    print("🎉 Base de datos reiniciada correctamente")
    print("="*60)
    print("\n📝 Campos iniciales:")
    print("  - Puntualidad")
    print("  - Responsabilidad")
    print("  - Habilidades Técnicas")
    print("  - Comunicación")
    print("  - Creatividad")
    print("  - Liderazgo")
    print("\n💡 Próximos pasos:")
    print("  1. Ejecuta: python app.py")
    print("  2. Abre: http://localhost:5000")
    print("  3. Prueba el formulario con campos dinámicos")
    print("  4. Ve a /admin.html para agregar/eliminar campos")

if __name__ == "__main__":
    limpiar_y_reiniciar()
