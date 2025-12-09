// ============================================
// Funciones para cargar y gestionar campos
// ============================================

// Cargar campos dinámicos desde el servidor
async function cargarCampos() {
    try {
        const response = await fetch('/config/campos');
        const data = await response.json();
        mostrarCampos(data.campos);
    } catch (error) {
        console.error('Error cargando campos:', error);
        mostrarMensaje('Error al cargar los campos', 'error');
    }
}

// Mostrar campos en la lista
function mostrarCampos(campos) {
    const camposList = document.getElementById('camposList');
    
    if (campos.length === 0) {
        camposList.innerHTML = `
            <div class="empty-state">
                <p>No hay campos dinámicos configurados</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    campos.forEach(campo => {
        html += `
            <div class="campo-item">
                <span>📋 ${campo}</span>
                <button class="btn btn-delete" onclick="eliminarCampo('${campo}')">Eliminar</button>
            </div>
        `;
    });
    
    camposList.innerHTML = html;
}

// Agregar nuevo campo
async function agregarCampo() {
    const input = document.getElementById('nuevoCampo');
    const campo = input.value.trim();
    
    if (!campo) {
        mostrarMensaje('Escribe el nombre del campo', 'error');
        return;
    }
    
    try {
        const response = await fetch('/config/campos/agregar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campo })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensaje(`✅ Campo "${campo}" agregado exitosamente`, 'exito');
            input.value = '';
            mostrarCampos(data.campos);
        } else {
            mostrarMensaje('Error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error agregando campo:', error);
        mostrarMensaje('Error al agregar el campo', 'error');
    }
}

// Eliminar campo
async function eliminarCampo(campo) {
    if (!confirm(`¿Eliminar el campo "${campo}"?`)) return;
    
    try {
        const response = await fetch('/config/campos/eliminar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campo })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensaje(`✅ Campo "${campo}" eliminado`, 'exito');
            mostrarCampos(data.campos);
        } else {
            mostrarMensaje('Error: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error eliminando campo:', error);
        mostrarMensaje('Error al eliminar el campo', 'error');
    }
}

// Mostrar mensajes de feedback
function mostrarMensaje(texto, tipo) {
    const mensajeEl = document.getElementById('mensaje');
    mensajeEl.textContent = texto;
    mensajeEl.className = `mensaje ${tipo}`;
    
    setTimeout(() => {
        mensajeEl.className = 'mensaje';
    }, 4000);
}

// Navegar al formulario
function irAlFormulario() {
    window.location.href = 'index.html';
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarCampos);

// Permitir Enter para agregar campo
document.getElementById('nuevoCampo').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        agregarCampo();
    }
});
