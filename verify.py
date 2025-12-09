#!/usr/bin/env python3
"""
Script de verificación para confirmar que todo está instalado y configurado
"""

import os
import sys

print("=" * 70)
print("🔍 VERIFICACIÓN DE CONFIGURACIÓN DEL SISTEMA DE EVALUACIÓN DINÁMICO")
print("=" * 70)

checks = {
    "✅ Archivos requeridos": [
        "app.py",
        "init_db.py",
        "index.html",
        "admin.html",
        "dashboard.html",
        "form.js",
        "admin.js",
        "dashboard.js",
        "requirements.txt",
        "README.md",
        "CONFIGURACION_DINAMICA.md"
    ],
    "📁 Carpetas necesarias": [
        "styles"
    ]
}

all_ok = True

print("\n📋 VERIFICANDO ARCHIVOS:\n")
for archivo in checks["✅ Archivos requeridos"]:
    if os.path.exists(archivo):
        print(f"  ✅ {archivo}")
    else:
        print(f"  ❌ FALTA: {archivo}")
        all_ok = False

print("\n📁 VERIFICANDO CARPETAS:\n")
for carpeta in checks["📁 Carpetas necesarias"]:
    if os.path.isdir(carpeta):
        print(f"  ✅ {carpeta}/")
    else:
        print(f"  ❌ FALTA: {carpeta}/")
        all_ok = False

print("\n" + "=" * 70)

if all_ok:
    print("✅ ¡TODO ESTÁ LISTO!")
    print("=" * 70)
    print("\n🚀 PRÓXIMOS PASOS:\n")
    print("  1. Abre PowerShell en esta carpeta")
    print("  2. Ejecuta: python init_db.py")
    print("  3. Luego ejecuta: python app.py")
    print("  4. Abre tu navegador en: http://localhost:5000\n")
else:
    print("❌ FALTAN ARCHIVOS O CARPETAS")
    print("=" * 70)
    print("\n⚠️  Verifica los archivos que faltan arriba.\n")
    sys.exit(1)

print("=" * 70)
print("📚 Documentación:")
print("  - README.md → Guía de inicio rápido")
print("  - CONFIGURACION_DINAMICA.md → Documentación técnica completa")
print("=" * 70)
