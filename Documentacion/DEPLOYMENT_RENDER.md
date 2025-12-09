# 🚀 GUÍA DE DEPLOYMENT EN RENDER

## RESUMEN
Tu proyecto está listo para subir a Render. Aquí están los pasos exactos que debes seguir.

---

## PASO 1: CONFIGURAR GIT (Si aún no lo has hecho)

### 1.1 Abre PowerShell en tu carpeta del proyecto
```powershell
cd C:\Users\USER\Desktop\plataforma_monitoreo_predictivo_v2
```

### 1.2 Inicializa Git (si no está inicializado)
```powershell
git init
git add .
git commit -m "Sistema de evaluación dinámico - listo para deployment"
```

**Si ya tenías Git inicializado:**
```powershell
git status
git add .
git commit -m "Actualización - agregadas configuraciones para Render"
```

---

## PASO 2: SUBIR A GITHUB

### 2.1 Crea un repositorio nuevo en GitHub
1. Ve a: https://github.com/new
2. **Repository name:** `plataforma-monitoreo` (o el que prefieras)
3. **Description:** "Sistema de evaluación dinámica con IA"
4. **Public** (para Render pueda acceder)
5. **Presiona:** Create Repository

### 2.2 Conecta tu repositorio local con GitHub
En PowerShell, copia las líneas que GitHub te muestra (similar a esto):

```powershell
git remote add origin https://github.com/TU_USUARIO/plataforma-monitoreo.git
git branch -M main
git push -u origin main
```

**Si ya tenías un remoto:**
```powershell
git remote set-url origin https://github.com/TU_USUARIO/plataforma-monitoreo.git
git push -u origin main
```

**Resultado esperado:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
...
To https://github.com/TU_USUARIO/plataforma-monitoreo.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## PASO 3: CONECTAR RENDER (El Paso Más Importante)

### 3.1 Ve a Render.com
1. Abre: https://render.com
2. Presiona **Sign up** (o Sign in si ya tienes cuenta)
3. Elige **Sign up with GitHub** (es lo más fácil)

### 3.2 Autoriza Render a acceder a GitHub
- Render te pedirá permisos para leer tu GitHub
- Presiona **Authorize**

### 3.3 Crea un nuevo Web Service
1. En el dashboard de Render, presiona **New +**
2. Selecciona **Web Service**
3. En "Connect a repository", busca `plataforma-monitoreo`
4. Presiona **Connect**

### 3.4 Configura el servicio
Verás un formulario con estos campos:

```
Name:                    plataforma-monitoreo
Environment:             Python 3
Region:                  Ohio (más barato, la mayoría está aquí)
Branch:                  main
Build Command:           pip install -r requirements.txt && python init_db.py
Start Command:           gunicorn app:app
Plan:                    Free
```

**IMPORTANTE:**
- ✅ Deja todo lo demás por defecto
- ✅ NO cambies el puerto (Gunicorn se adapta automáticamente)
- ✅ Presiona **Create Web Service**

### 3.5 Espera a que termine el deployment
Verás un log que dice algo como:
```
=== Cloning repository
=== Building
...
Running: pip install -r requirements.txt && python init_db.py
...
Running: gunicorn app:app
...
✓ Deployed successfully
```

Esto puede tardar **5-10 minutos**.

---

## PASO 4: ¡LISTO! ACCEDE A TU APP

### 4.1 Tu URL pública
Render te asigna una URL como:
```
https://plataforma-monitoreo.onrender.com
```

(El nombre exacto depende de lo que escribiste en "Name")

### 4.2 Prueba las tres páginas
```
✅ Formulario:  https://plataforma-monitoreo.onrender.com/
✅ Admin:       https://plataforma-monitoreo.onrender.com/admin.html
✅ Dashboard:   https://plataforma-monitoreo.onrender.com/dashboard.html
```

---

## PASO 5: CÓMO ACTUALIZAR TU APP (Después de cambios)

Cada vez que hagas cambios y quieras actualizar en Render:

### 5.1 Sube los cambios a GitHub
```powershell
git add .
git commit -m "Descripción del cambio"
git push
```

### 5.2 Render hace auto-deploy automáticamente
- Entra a tu dashboard en Render
- Ve a tu servicio "plataforma-monitoreo"
- Verás que comienza un nuevo deploy
- En 2-5 minutos estará actualizado
- **NO necesitas hacer nada más**

---

## ⚠️ COSAS IMPORTANTES A SABER

### 1. Base de Datos en Render (Plan Free)
- La BD SQLite está en `/tmp/` (temporalmente)
- Si el servicio se detiene (después de 15 minutos sin uso), se reinicia
- Cuando se reinicia, **se ejecuta `init_db.py` automáticamente** y la BD se recrea
- **ESTO SIGNIFICA:** Los datos que guardes se pierden cuando el servicio se detiene

**Si necesitas datos persistentes:**
- Opción 1: Cambiar a **Plan Paid** en Render (~$7/mes)
- Opción 2: Usar **PostgreSQL** gratuito de Render (más complejo)
- Opción 3: Aceptar que es una aplicación de demostración

### 2. Primer acceso en Render
- El primer request tardará un poco (cold start)
- Después será rápido
- Si no accedes 15 minutos, se detiene para ahorrar recursos

### 3. Límites del Plan Free
```
Bandwidth:        500 horas/mes CPU
Almacenamiento:   Efímero (se pierden datos)
Base de datos:    Temporal (/tmp)
Conexiones:       Limitadas
```

### 4. Monitorear tu aplicación
En el dashboard de Render:
- **Logs:** Ver lo que pasa (errores, requests)
- **Metrics:** CPU, memoria, etc.
- **Events:** Historial de deploys

---

## 🛑 SI ALGO SALE MAL

### Error: "Application crashed"
1. Ve a tu servicio en Render
2. Presiona **Logs**
3. Mira el último error (rojo)
4. Problemas comunes:
   - Falta `Procfile` ← Comprueba que existe
   - Falta `requirements.txt` ← Comprueba que existe
   - Error en `app.py` ← Revisa sintaxis

**Solución:**
```powershell
# Asegúrate de que estos archivos existan:
dir Procfile
dir requirements.txt
dir render.yaml

# Si falta algo:
# Crea los archivos (están en la carpeta del proyecto)
# Luego: git add . && git commit -m "Fix" && git push
```

### Error: "BuildPlanRequired"
Significa que necesitas un plan Paid para ciertos recursos. Ignora si tienes plan Free.

### Error: 404 en rutas
1. Verifica que `app.py` existe y tiene las rutas
2. Comprueba que `Procfile` dice: `web: gunicorn app:app`
3. Reinicia el deploy en Render

### La app está lenta
Es normal en plan Free. El servidor se detiene después de 15 minutos sin uso.

---

## ✅ CHECKLIST ANTES DE HACER GIT PUSH

Asegúrate de que:
```
✅ Procfile existe
✅ render.yaml existe
✅ .gitignore existe
✅ requirements.txt tiene Flask, Flask-CORS, Gunicorn
✅ app.py existe y tiene la ruta principal "/"
✅ index.html, admin.html, dashboard.html existen
✅ *.js files existen (form.js, admin.js, dashboard.js)
✅ init_db.py existe
✅ .git/config apunta a tu repositorio GitHub
```

Verifica con:
```powershell
dir Procfile
dir requirements.txt
dir app.py
git remote -v
```

---

## EJEMPLO COMPLETO PASO A PASO

### Mi usuario es "juan" y quiero crear "evaluaciones-app"

```powershell
# 1. Carpeta del proyecto
cd C:\Users\USER\Desktop\plataforma_monitoreo_predictivo_v2

# 2. Git initialization
git init
git add .
git commit -m "Sistema dinámico - ready for Render"

# 3. GitHub
# Voy a https://github.com/new
# Creo "juan/evaluaciones-app"
# Copiar: git remote add origin https://github.com/juan/evaluaciones-app.git

git remote add origin https://github.com/juan/evaluaciones-app.git
git branch -M main
git push -u origin main

# 4. Render
# Voy a https://render.com
# New → Web Service
# Conectar juan/evaluaciones-app
# Llenar formulario:
#   Name: evaluaciones-app
#   Build: pip install -r requirements.txt && python init_db.py
#   Start: gunicorn app:app
# Create Web Service

# 5. Esperar 5-10 minutos
# URL: https://evaluaciones-app.onrender.com

# 6. Cambios posteriores
git add .
git commit -m "Nuevo cambio"
git push  # ← Render hace deploy automáticamente
```

---

## 🎉 ¡FELICIDADES!

Tu app está en la nube. Puedes compartir el link con otros:
```
https://plataforma-monitoreo.onrender.com
```

### Siguientes pasos (opcional):
1. **Agregar más campos:** Usa el admin.html
2. **Cambiar BD a PostgreSQL:** Para datos persistentes
3. **Proteger el admin:** Agregar autenticación
4. **Dominio custom:** `midominio.com` en Render (PRO)

---

**¿Preguntas?** Revisa los logs de Render o ejecuta localmente primero:
```powershell
python app.py
```
