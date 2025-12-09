// ============================================
// Cargar campos dinámicos al inicializar
// ============================================
async function cargarCamposDinamicos() {
    try {
        const response = await fetch('/config/campos');
        const data = await response.json();
        mostrarCamposDinamicos(data.campos);
        mostrarValidacionCampos(data.campos);
    } catch (error) {
        console.error('Error cargando configuración:', error);
        mostrarAlertaSinCampos();
    }
}

function mostrarCamposDinamicos(campos) {
    const contenedor = document.getElementById('camposDinamicos');
    contenedor.innerHTML = '';
    
    if (campos.length === 0) {
        mostrarAlertaSinCampos();
        return;
    }
    
    // Crear campos dinámicos
    campos.forEach(campo => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        // Sanitizar el ID para que sea válido en HTML
        const idSeguro = campo.replace(/\s+/g, '_').toLowerCase();
        formGroup.innerHTML = `
            <label for="${idSeguro}">${campo} (0-100)</label>
            <input type="number" id="${idSeguro}" min="0" max="100" placeholder="Ej. 85" data-campo-dinamico="true" data-campo-nombre="${campo}">
        `;
        contenedor.appendChild(formGroup);
    });
}

function mostrarValidacionCampos(campos) {
    const formElement = document.getElementById('evalForm');
    
    if (campos.length === 0) {
        // Desactivar el botón si no hay campos
        const boton = formElement.querySelector('button[type="submit"]');
        if (boton) {
            boton.disabled = true;
            boton.style.opacity = '0.5';
            boton.style.cursor = 'not-allowed';
            boton.title = 'Es necesario agregar campos antes de evaluar';
        }
    } else {
        // Activar el botón si hay campos
        const boton = formElement.querySelector('button[type="submit"]');
        if (boton) {
            boton.disabled = false;
            boton.style.opacity = '1';
            boton.style.cursor = 'pointer';
            boton.title = '';
        }
    }
}

function mostrarAlertaSinCampos() {
    const contenedor = document.getElementById('camposDinamicos');
    contenedor.innerHTML = `
        <div style="
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        ">
            <p style="color: #856404; font-size: 16px; font-weight: 600; margin: 0;">
                ⚠️ Es necesario agregar campos para realizar evaluaciones
            </p>
            <p style="color: #856404; font-size: 14px; margin-top: 10px;">
                Dirígete al panel de <strong><a href="admin.html" style="color: #0066cc; text-decoration: none;">⚙️ Configurar Campos</a></strong> para comenzar
            </p>
        </div>
    `;
}

// ============================================
// Manejar envío del formulario
// ============================================
document.getElementById("evalForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // --- 1. OBTENER VALORES DE TODOS LOS CAMPOS DINÁMICOS ---
    const todosLosCampos = {};
    document.querySelectorAll('input[data-campo-dinamico="true"]').forEach(input => {
        const nombreCampo = input.getAttribute('data-campo-nombre') || input.id;
        const valor = Number(input.value);
        if (!isNaN(valor) && valor >= 0) {
            todosLosCampos[nombreCampo] = valor;
        }
    });

    // Validar que haya al menos un campo
    if (Object.keys(todosLosCampos).length === 0) {
        alert('Por favor, agrega campos en el panel de configuración');
        return;
    }

    // --- 2. CALCULAR PROMEDIO (CON TODOS LOS CAMPOS) ---
    const todosLosValores = Object.values(todosLosCampos);
    const promedio = todosLosValores.length > 0 
        ? (todosLosValores.reduce((a, b) => a + b, 0) / todosLosValores.length)
        : 0;

    // --- 3. CLASIFICACIÓN ---
    let clasificacion = "Desconocido";
    if (promedio >= 80) {
        clasificacion = "Alto Desempeño";
    } else if (promedio >= 50) {
        clasificacion = "Desempeño Medio";
    } else {
        clasificacion = "Riesgo / Necesita Mejora";
    }

    // --- 4. PREPARAR DATOS PARA GUARDAR ---
    const data = {
        campos: todosLosCampos,  // Todos los campos con sus valores
        observaciones: document.getElementById("observaciones").value,
        clasificacion: clasificacion,
        promedio: promedio
    };

    // --- 5. GUARDAR EN EL SERVIDOR (Base de Datos) ---
    try {
        const response = await fetch('/evaluar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            console.error('Error guardando en el servidor');
        }
    } catch (error) {
        console.error('Error conectando al servidor:', error);
    }

    // --- 6. GUARDAR EN localStorage (para el frontend) ---
    let historial = JSON.parse(localStorage.getItem("historial")) || [];
    historial.push({
        fecha: new Date().toLocaleString(),
        ...data
    });

    localStorage.setItem("historial", JSON.stringify(historial));
    localStorage.setItem("evaluacion", JSON.stringify(data));

    // --- 7. REDIRECCIONAR AL DASHBOARD ---
    window.location.href = "dashboard.html";
});

// Inicializar campos dinámicos cuando carga la página
document.addEventListener('DOMContentLoaded', cargarCamposDinamicos);