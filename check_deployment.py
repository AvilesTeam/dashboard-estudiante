#!/usr/bin/env python3
"""
✅ Script para verificar que todo está listo para Render deployment
Ejecuta: python check_deployment.py
"""

import os
import sys
import json

def check_file(filename):
    """Verifica que un archivo exista"""
    exists = os.path.exists(filename)
    status = "✅" if exists else "❌"
    print(f"{status} {filename}")
    return exists

def check_content(filename, required_strings):
    """Verifica que un archivo contenga cierto contenido"""
    if not os.path.exists(filename):
        print(f"❌ {filename} (no existe)")
        return False
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        all_found = all(req in content for req in required_strings)
        if all_found:
            print(f"✅ {filename} (contiene contenido requerido)")
            return True
        else:
            print(f"⚠️ {filename} (falta contenido)")
            return False
    except Exception as e:
        print(f"❌ {filename} (error: {e})")
        return False

print("\n" + "="*60)
print("🚀 CHECKLIST DE DEPLOYMENT - RENDER")
print("="*60 + "\n")

all_ok = True

print("📁 Archivos Principales:")
print("-" * 60)
files_to_check = [
    ('app.py', True),
    ('init_db.py', True),
    ('index.html', True),
    ('admin.html', True),
    ('dashboard.html', True),
    ('form.js', True),
    ('admin.js', True),
    ('dashboard.js', True),
    ('requirements.txt', True),
    ('Procfile', True),
    ('render.yaml', True),
    ('.gitignore', True),
]

for filename, required in files_to_check:
    if not check_file(filename):
        all_ok = False

print("\n📦 Contenido de Archivos Críticos:")
print("-" * 60)

# Verificar Procfile
if not check_content('Procfile', ['web:', 'gunicorn', 'app:app']):
    all_ok = False

# Verificar requirements.txt
if not check_content('requirements.txt', ['Flask', 'flask-cors', 'gunicorn']):
    all_ok = False

# Verificar app.py
app_checks = ['Flask', '@app.route', '/config/campos', '/evaluar']
if not check_content('app.py', app_checks):
    all_ok = False

# Verificar render.yaml
if not check_content('render.yaml', ['services:', 'name:', 'buildCommand', 'startCommand']):
    all_ok = False

print("\n🔧 Configuración de Base de Datos:")
print("-" * 60)
if check_content('app.py', ["os.environ.get('RENDER')", '/tmp', 'evaluaciones.db']):
    print("✅ app.py detecta entorno Render correctamente")
else:
    print("⚠️ app.py podría no estar configurado para Render")
    all_ok = False

print("\n🐙 Control de Versiones:")
print("-" * 60)
if os.path.exists('.git'):
    print("✅ Git inicializado")
    try:
        with open('.git/config', 'r') as f:
            git_config = f.read()
            if 'github.com' in git_config:
                print("✅ Git remoto configurado en GitHub")
            else:
                print("⚠️ No hay remote GitHub configurado")
                print("   Ejecuta: git remote add origin https://github.com/tu_usuario/tu_repo.git")
                all_ok = False
    except Exception as e:
        print(f"⚠️ Error leyendo configuración Git: {e}")
else:
    print("❌ Git no inicializado")
    print("   Ejecuta: git init")
    all_ok = False

print("\n📊 Base de Datos:")
print("-" * 60)
if os.path.exists('evaluaciones.db'):
    size = os.path.getsize('evaluaciones.db')
    print(f"✅ Base de datos existe ({size} bytes)")
else:
    print("⚠️ Base de datos no existe (se creará en Render)")
    print("   Ejecuta: python init_db.py")

print("\n🌐 Puertos y Entorno:")
print("-" * 60)
if check_content('app.py', ['if __name__', 'run', '5000']):
    print("✅ app.py parece configurado correctamente")
else:
    print("⚠️ Verificar que app.py esté bien configurado")

print("\n" + "="*60)
if all_ok:
    print("✅ TODO LISTO PARA DEPLOYMENT")
    print("="*60)
    print("\nPasos siguientes:")
    print("1. git add .")
    print("2. git commit -m 'Listo para Render'")
    print("3. git push")
    print("4. Ir a https://render.com y crear Web Service")
    sys.exit(0)
else:
    print("⚠️ VERIFICAR LOS ELEMENTOS MARCADOS ANTES DE HACER GIT PUSH")
    print("="*60)
    sys.exit(1)
