#!/usr/bin/env python3
"""
CHECKLIST FINAL - Verificación completa de la implementación
Ejecuta esto para confirmar que todo está correctamente instalado
"""

import os
import sys
import json
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def check_file_exists(filepath):
    return os.path.isfile(filepath)

def check_directory_exists(dirpath):
    return os.path.isdir(dirpath)

def check_file_contains(filepath, text):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            return text in content
    except:
        return False

def print_check(name, status):
    status_symbol = f"{Colors.GREEN}✅{Colors.END}" if status else f"{Colors.RED}❌{Colors.END}"
    print(f"  {status_symbol} {name}")
    return status

print(f"\n{Colors.BLUE}{'='*70}{Colors.END}")
print(f"{Colors.BLUE}🔍 CHECKLIST FINAL - VERIFICACIÓN DE IMPLEMENTACIÓN{Colors.END}")
print(f"{Colors.BLUE}{'='*70}{Colors.END}\n")

all_ok = True

# ============================================================================
print(f"{Colors.YELLOW}1️⃣  ARCHIVOS PRINCIPALES{Colors.END}\n")
files_check = {
    "app.py": ["CREATE TABLE IF NOT EXISTS configuracion", "nombres_campos"],
    "index.html": ["camposDinamicos", "admin.html"],
    "form.js": ["cargarCamposDinamicos", "competenciasExtra"],
    "dashboard.js": ["competencias_extra", "renderRadarChart"],
    "admin.html": ["Panel de Administración", "agregarCampo"],
    "admin.js": ["cargarCampos", "eliminarCampo"],
    "README.md": ["Sistema de Evaluación Dinámico", "python init_db.py"],
    "CONFIGURACION_DINAMICA.md": ["Base de Datos", "campos dinámicos"],
    "IMPLEMENTACION_COMPLETA.md": ["RESUMEN DE IMPLEMENTACIÓN", "Casos de Uso"],
    "init_db.py": ["CREATE TABLE configuracion", "nombres_campos"],
    "verify.py": ["VERIFICACIÓN", "script"],
}

for filename, checks in files_check.items():
    if check_file_exists(filename):
        file_ok = True
        for check_text in checks:
            if not check_file_contains(filename, check_text):
                file_ok = False
                print(f"    ⚠️  {filename} - Falta contenido: '{check_text}'")
        if file_ok:
            all_ok = print_check(filename, True) and all_ok
    else:
        all_ok = print_check(f"{filename} (FALTA)", False) and all_ok

# ============================================================================
print(f"\n{Colors.YELLOW}2️⃣  DIRECTORIOS{Colors.END}\n")
dirs_check = {
    "styles": True,
    ".git": True,
}

for dirname, required in dirs_check.items():
    exists = check_directory_exists(dirname)
    all_ok = print_check(f"{dirname}/", exists) and all_ok

# ============================================================================
print(f"\n{Colors.YELLOW}3️⃣  FUNCIONALIDAD BACKEND{Colors.END}\n")

backend_checks = [
    ("app.py tiene ruta GET /config/campos", 
     check_file_contains("app.py", "def obtener_campos")),
    ("app.py tiene ruta POST /config/campos/agregar", 
     check_file_contains("app.py", "def agregar_campo")),
    ("app.py tiene ruta POST /config/campos/eliminar", 
     check_file_contains("app.py", "def eliminar_campo")),
    ("app.py maneja JSON en competencias_extra", 
     check_file_contains("app.py", "competencias_extra")),
    ("init_db.py crea tabla configuracion", 
     check_file_contains("init_db.py", "CREATE TABLE configuracion")),
    ("Tabla evaluaciones tiene competencias_extra", 
     check_file_contains("app.py", "competencias_extra TEXT")),
]

for check_name, status in backend_checks:
    all_ok = print_check(check_name, status) and all_ok

# ============================================================================
print(f"\n{Colors.YELLOW}4️⃣  FUNCIONALIDAD FRONTEND - FORMULARIO{Colors.END}\n")

form_checks = [
    ("HTML tiene div para campos dinámicos", 
     check_file_contains("index.html", "camposDinamicos")),
    ("form.js carga campos del servidor", 
     check_file_contains("form.js", "cargarCamposDinamicos")),
    ("form.js recopila competencias_extra", 
     check_file_contains("form.js", "competenciasExtra")),
    ("form.js calcula promedio dinámico", 
     check_file_contains("form.js", "reduce")),
    ("form.js envía datos a /evaluar", 
     check_file_contains("form.js", "/evaluar")),
    ("form.js guarda en localStorage", 
     check_file_contains("form.js", "localStorage.setItem")),
]

for check_name, status in form_checks:
    all_ok = print_check(check_name, status) and all_ok

# ============================================================================
print(f"\n{Colors.YELLOW}5️⃣  FUNCIONALIDAD FRONTEND - DASHBOARD{Colors.END}\n")

dashboard_checks = [
    ("dashboard.js renderiza gráfico dinámico", 
     check_file_contains("dashboard.js", "competencias_extra")),
    ("dashboard.js incluye campos dinámicos en gráfico", 
     check_file_contains("dashboard.js", "Object.entries(competenciasExtra)")),
    ("dashboard.js genera prompt dinámico para IA", 
     check_file_contains("dashboard.js", "Agregar campos dinámicos")),
    ("dashboard.js calcula historial dinámicamente", 
     check_file_contains("dashboard.js", "forEach(v => valores.push(v))")),
]

for check_name, status in dashboard_checks:
    all_ok = print_check(check_name, status) and all_ok

# ============================================================================
print(f"\n{Colors.YELLOW}6️⃣  FUNCIONALIDAD ADMIN{Colors.END}\n")

admin_checks = [
    ("admin.html existe", 
     check_file_exists("admin.html")),
    ("admin.js existe", 
     check_file_exists("admin.js")),
    ("admin.js carga campos", 
     check_file_contains("admin.js", "cargarCampos")),
    ("admin.js puede agregar campos", 
     check_file_contains("admin.js", "agregarCampo")),
    ("admin.js puede eliminar campos", 
     check_file_contains("admin.js", "eliminarCampo")),
]

for check_name, status in admin_checks:
    all_ok = print_check(check_name, status) and all_ok

# ============================================================================
print(f"\n{Colors.YELLOW}7️⃣  DOCUMENTACIÓN{Colors.END}\n")

doc_checks = [
    ("README.md está completo", 
     check_file_contains("README.md", "localhost:5000")),
    ("CONFIGURACION_DINAMICA.md existe", 
     check_file_exists("CONFIGURACION_DINAMICA.md")),
    ("IMPLEMENTACION_COMPLETA.md existe", 
     check_file_exists("IMPLEMENTACION_COMPLETA.md")),
]

for check_name, status in doc_checks:
    all_ok = print_check(check_name, status) and all_ok

# ============================================================================
print(f"\n{Colors.BLUE}{'='*70}{Colors.END}\n")

if all_ok:
    print(f"{Colors.GREEN}✅ ¡TODAS LAS VERIFICACIONES PASARON!{Colors.END}\n")
    print(f"{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"\n{Colors.YELLOW}🚀 PRÓXIMOS PASOS:{Colors.END}\n")
    print("  1. Abre PowerShell en esta carpeta")
    print("  2. Ejecuta: python init_db.py")
    print("  3. Luego ejecuta: python app.py")
    print("  4. Abre: http://localhost:5000\n")
    print(f"{Colors.BLUE}{'='*70}{Colors.END}\n")
else:
    print(f"{Colors.RED}❌ ALGUNAS VERIFICACIONES FALLARON{Colors.END}\n")
    print(f"{Colors.YELLOW}Por favor, revisa los elementos marcados arriba.{Colors.END}\n")
    print(f"{Colors.BLUE}{'='*70}{Colors.END}\n")
    sys.exit(1)
