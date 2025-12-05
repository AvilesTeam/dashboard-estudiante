


document.getElementById("evalForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // --- 1. OBTENER VALORES DIRECTOS (0-100) ---
    // Eliminamos la función "normalizar" y tomamos el valor tal cual.
    // Usamos Number() para asegurar que sea un número y no texto.
    const puntualidad = Number(document.getElementById("puntualidad").value);
    const responsabilidad = Number(document.getElementById("responsabilidad").value);
    const tecnicas = Number(document.getElementById("tecnicas").value);
    const comunicacion = Number(document.getElementById("comunicacion").value);

    // --- 2. CALCULAR PROMEDIO (ESCALA 100) ---
    const promedio = (puntualidad + responsabilidad + tecnicas + comunicacion) / 4;

    // --- 3. CLASIFICACIÓN (AJUSTADA A ESCALA 100) ---
    let clasificacion = "Desconocido";

    // Antes era >= 8, ahora es >= 80
    if (promedio >= 80) {
        clasificacion = "Alto Desempeño";
    } 
    // Antes era >= 5, ahora es >= 50
    else if (promedio >= 50) {
        clasificacion = "Desempeño Medio";
    } 
    else {
        clasificacion = "Riesgo / Necesita Mejora";
    }

    // --- 4. DATOS FINALES A GUARDAR ---
    // Guardamos los valores grandes (ej. 90, 80)
    const data = {
        puntualidad: puntualidad,
        responsabilidad: responsabilidad,
        tecnicas: tecnicas,
        comunicacion: comunicacion,
        observaciones: document.getElementById("observaciones").value,
        clasificacion: clasificacion
    };

    // --- GUARDAR HISTORIAL ---
    let historial = JSON.parse(localStorage.getItem("historial")) || [];

    historial.push({
        fecha: new Date().toLocaleString(),
        ...data
    });

    localStorage.setItem("historial", JSON.stringify(historial));

    // --- GUARDAR ÚLTIMA EVALUACIÓN ---
    localStorage.setItem("evaluacion", JSON.stringify(data));

    // --- REDIRECCIÓN ---
    window.location.href = "dashboard.html";
});