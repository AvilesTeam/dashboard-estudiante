# 🎯 Sistema de Evaluación Dinámico - INICIO RÁPIDO

## 🚀 Comienza Aquí

### Opción A: Ejecutar Localmente

#### Paso 1: Preparar la Base de Datos
```bash
# En PowerShell, en la carpeta del proyecto
python init_db.py
```

Este comando:
- ✅ Crea las tablas `evaluaciones` y `configuracion`
- ✅ Establece campos iniciales: Puntualidad, Responsabilidad, Habilidades Técnicas, Comunicación, Creatividad, Liderazgo
- ✅ Inserta datos de prueba

#### Paso 2: Iniciar el Servidor
```bash
# En PowerShell
python app.py
```

Deberías ver:
```
--- Base de datos verificada en: C:\...\evaluaciones.db ---
 * Running on http://localhost:5000
```

#### Paso 3: Abre tu Navegador
```
http://localhost:5000
```

---

### Opción B: Subir a Render (Cloud)

#### ✅ Paso 1: Preparar el Repositorio Git

1. **Abre PowerShell en tu carpeta del proyecto**
   ```bash
   cd c:\Users\USER\Desktop\plataforma_monitoreo_predictivo_v2
   ```

2. **Verifica que Git esté inicializado**
   ```bash
   git status
   ```
   Si dice "not a git repository", ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Sistema de evaluación dinámico - versión inicial"
   ```

3. **Sube a GitHub**
   - Ve a https://github.com/new
   - Crea un nuevo repositorio (ej: "plataforma-monitoreo")
   - En PowerShell, ejecuta:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/plataforma-monitoreo.git
   git branch -M main
   git push -u origin main
   ```

#### ✅ Paso 2: Conectar Render

1. **Ve a https://render.com**
2. **Inicia sesión o crea cuenta** (puedes usar GitHub)
3. **New → Web Service**
4. **Conecta tu repositorio GitHub**
   - Autoriza Render a acceder a GitHub
   - Selecciona tu repositorio `plataforma-monitoreo`

5. **Configura el servicio:**
   - **Name:** `plataforma-monitoreo`
   - **Environment:** Python 3
   - **Region:** Ohio (Free tier)
   - **Plan:** Free
   - **Build Command:** `pip install -r requirements.txt && python init_db.py`
   - **Start Command:** `gunicorn app:app`

6. **Deploy!**
   - Presiona "Create Web Service"
   - Espera a que termine el deploy (5-10 minutos)
   - Render te dará una URL como: `https://plataforma-monitoreo.onrender.com`

#### ✅ Paso 3: Usar en Render

Una vez deployed:
```
https://plataforma-monitoreo.onrender.com/
https://plataforma-monitoreo.onrender.com/admin.html
https://plataforma-monitoreo.onrender.com/dashboard.html
```

**Nota:** En Render (plan free), la BD se reinicia cuando el servicio se detiene. Es normal. Para BD persistente, necesitarías:
- Plan Paid en Render
- O usar PostgreSQL en lugar de SQLite

---

## 📱 Flujo de Uso

### 1️⃣ **Página Principal - Formulario**
```
http://localhost:5000/
```
**Qué ves:**
- TODOS los campos son dinámicos
- Campos iniciales: Puntualidad, Responsabilidad, Habilidades Técnicas, Comunicación, Creatividad, Liderazgo
- Observaciones
- Botón: "Guardar y ver Dashboard"
- Link: "⚙️ Configurar Campos" → Panel Admin

**Si no hay campos:**
```
⚠️ Es necesario agregar campos para realizar evaluaciones
Dirígete al panel de "⚙️ Configurar Campos" para comenzar
```

**Qué hace:**
1. Rellenas los campos (solo se muestran los activos)
2. Presionas "Guardar"
3. Se guarda en BD + localStorage
4. Te redirige al Dashboard

---

### 2️⃣ **Panel de Administración**
```
http://localhost:5000/admin.html
```
**Qué ves:**
- Input para agregar nuevo campo
- Lista de TODOS los campos (incluyendo los "fijos")
- Botón rojo para eliminar cada campo

**Qué puedes hacer:**
- ➕ Escribe "Pensamiento Crítico" → Agregar
- ➖ Presiona "Eliminar" junto a cualquier campo (incluso Puntualidad)
- Los cambios se guardan inmediatamente en BD
- El formulario se actualiza automáticamente

**Ejemplo:**
```
Campos disponibles:
  📋 Puntualidad [Eliminar]
  📋 Responsabilidad [Eliminar]
  📋 Habilidades Técnicas [Eliminar]
  📋 Comunicación [Eliminar]
  📋 Creatividad [Eliminar]
  📋 Liderazgo [Eliminar]

Agregar nuevo: [Inteligencia Emocional] [Agregar]
```

---

### 3️⃣ **Dashboard**
```
http://localhost:5000/dashboard.html
```
**Qué ves:**
- Clasificación de la última evaluación
- Gráfico Radar con los campos activos
- Botón "Generar Recomendación" (usa IA Gemini)
- Historial de evaluaciones
- Botón "Descargar PDF"

**Datos Dinámicos:**
- Promedio se calcula con los campos activos
- Gráfico se adapta automáticamente
- Recomendaciones incluyen feedback sobre todos los campos

---

## 🔧 Cambios Clave Implementados

### Base de Datos

#### Tabla `evaluaciones` (Simplificada)
```sql
CREATE TABLE evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campos TEXT,              ← JSON con todos los campos y valores
    observaciones TEXT,
    clasificacion TEXT,
    promedio REAL,
    fecha TEXT
)
```

**Ejemplo de datos:**
```json
{
  "campos": {
    "Puntualidad": 85,
    "Responsabilidad": 90,
    "Habilidades Técnicas": 75,
    "Comunicación": 88,
    "Creatividad": 80,
    "Liderazgo": 92
  },
  "observaciones": "Muy buen trabajo",
  "clasificacion": "Aprobado",
  "promedio": 85.0
}
```

#### Tabla `configuracion`
```sql
CREATE TABLE configuracion (
    id INTEGER PRIMARY KEY,
    nombres_campos TEXT    ← JSON ["Puntualidad", "Responsabilidad", ...]
)
```

### Backend (app.py)

**Rutas disponibles:**
```
GET    /config/campos                  → Obtener campos activos
POST   /config/campos/agregar          → Agregar nuevo campo
POST   /config/campos/eliminar         → Eliminar campo
POST   /evaluar                        → Guardar evaluación
GET    /historial                      → Obtener historial
GET    /borrar                         → Limpiar historial
```

### Frontend

**Archivos principales:**
- `index.html` → Formulario 100% dinámico
- `admin.html` → Panel de administración
- `dashboard.html` → Dashboard con gráficos
- `form.js` → Lógica de formulario
- `admin.js` → Gestión de campos
- `dashboard.js` → Gráficos y IA

---

## 📊 Ejemplo Completo

### Escenario: Cambiar Campos

1. **Abre admin.html**
   ```
   http://localhost:5000/admin.html
   ```

2. **Elimina "Puntualidad"**
   - Presiona [Eliminar] junto a Puntualidad
   - ✅ Se elimina de la BD

3. **Agrega "Inteligencia Emocional"**
   - Escribe: `Inteligencia Emocional`
   - Presiona: [Agregar]
   - ✅ Se agrega a la BD

4. **Abre el formulario**
   - Ya NO aparece Puntualidad
   - SÍ aparece Inteligencia Emocional
   - Observaciones sigue igual

5. **Rellena y guarda**
   ```
   Responsabilidad: 90
   Habilidades Técnicas: 75
   Comunicación: 88
   Creatividad: 80
   Liderazgo: 92
   Inteligencia Emocional: 88
   ```

6. **Dashboard**
   - Gráfico tiene 6 ejes (sin Puntualidad)
   - Promedio: (90+75+88+80+92+88) / 6 = 85.5
   - IA analiza los 6 campos

---

## ❓ Preguntas Frecuentes

### P: ¿Qué pasa si elimino todos los campos?
**R:** El formulario mostrará un mensaje de alerta y el botón se deshabilitará. Necesitarás agregar al menos un campo en el admin.

### P: ¿Puedo elimincar "Puntualidad"?
**R:** ¡Sí! Todos los campos son iguales ahora. Incluso los que eran "fijos" se pueden eliminar.

### P: ¿Cuántos campos dinámicos puedo agregar?
**R:** Sin límite técnico. Recomendación: máximo 10-15 para una buena UX.

### P: ¿Dónde se guardan los datos en Render?
**R:** En BD SQLite temporal (/tmp/evaluaciones.db). Se reinicia cuando el servicio se detiene. Para datos persistentes, considera:
   - Cambiar a PostgreSQL (más caro)
   - O usar plan Paid en Render

### P: ¿Cómo actualizar en Render después de hacer cambios?
**R:** Solo sube los cambios a GitHub. Render hace auto-deploy automáticamente:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push
   ```

### P: ¿Render toma dinero?
**R:** El plan Free es gratuito, pero:
   - Se detiene después de 15 minutos sin uso
   - La BD se reinicia
   - Ancho de banda limitado
   - Para producción, necesitarías plan Paid

---

## 🛑 Troubleshooting

### Error: "No se conecta a localhost:5000"
```bash
python app.py
```
Verifica que el servidor esté corriendo.

### Error: "404 Not Found en /config/campos"
```bash
# Reinicia el servidor
Ctrl+C
python app.py
```

### Los campos dinámicos no aparecen
1. Abre F12 → Consola
2. Ejecuta:
   ```javascript
   fetch('/config/campos').then(r => r.json()).then(d => console.log(d))
   ```
3. Si no ves campos, corre `python init_db.py`

### En Render: "Application crashed"
1. Ve a tu dashboard en Render
2. Abre "Logs" para ver el error
3. Problemas comunes:
   - Falta `Procfile`
   - Falta `requirements.txt`
   - Puerto incorrecto (Render usa puerto 10000+)

### En Render: BD vacía después de tiempo
Es normal. Render reinicia las aplicaciones gratuitamente. La BD se recrea automáticamente con `init_db.py`.

---

## 📚 Documentación Detallada

- `CONFIGURACION_DINAMICA.md` → Arquitectura técnica
- `IMPLEMENTACION_COMPLETA.md` → Cambios específicos
- `START_HERE.md` → Punto de entrada

---

## 🎓 Estructura de Carpetas

```
plataforma_monitoreo_predictivo_v2/
├── app.py                          ← Backend Flask
├── init_db.py                      ← Inicializar BD
├── Procfile                        ← Configuración para Render
├── render.yaml                     ← Deploy automático en Render
├── requirements.txt                ← Dependencias Python
├── .gitignore                      ← Archivos a ignorar
│
├── index.html                      ← Formulario dinámico
├── admin.html                      ← Panel de administración
├── dashboard.html                  ← Dashboard
│
├── form.js                         ← Lógica formulario
├── admin.js                        ← Lógica admin
├── dashboard.js                    ← Lógica dashboard
│
├── styles/
│   ├── index.css
│   └── dashboard.css
│
├── evaluaciones.db                 ← BD SQLite (local)
├── README.md                       ← Este archivo
└── .git/                           ← Control de versiones
```

---

## 🎉 Listo para Usar

### Local:
```bash
python init_db.py
python app.py
```

### Cloud (Render):
1. `git push` a GitHub
2. Render hace deploy automático
3. Espera 5-10 minutos
4. ¡Listo!

**¡Disfruta tu sistema de evaluación dinámico!** 🚀
