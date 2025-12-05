// -----------------------------------------------
// IMPORTACIÓN CORRECTA DEL SDK DE GEMINI
// -----------------------------------------------
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Variable global para almacenar la instancia del gráfico
let radarChartInstance = null;

// Cargar datos desde localStorage o usar valores por defecto
const data = JSON.parse(localStorage.getItem("evaluacion")) || {
    puntualidad: 5,
    responsabilidad: 7,
    tecnicas: 8,
    comunicacion: 6,
    observaciones: "Evaluación inicial pendiente.",
    clasificacion: "Sin datos"
};

// Mostrar clasificación cuando cargue el DOM
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("clasificacion").innerText = data.clasificacion || "Sin datos";
});

// --------------------------------------------------
// FUNCIÓN PARA RENDERIZAR EL GRÁFICO RADAR
// --------------------------------------------------
function renderRadarChart() {
    const ctx = document.getElementById("radarChart");

    // Destruir gráfico previo si existe
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    radarChartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Puntualidad", "Responsabilidad", "Técnicas", "Comunicación"],
            datasets: [{
                label: "Desempeño",
                data: [
                    data.puntualidad,
                    data.responsabilidad,
                    data.tecnicas,
                    data.comunicacion
                ],
                borderWidth: 2,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { display: false },
                   min: 0,      // Obliga al gráfico a empezar en 0
                    max: 100,    // Obliga al gráfico a terminar en 100 (Fijo)
                    pointLabels: { font: { size: 14 } }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// --------------------------------------------------
// CONFIGURACIÓN DE GEMINI
// --------------------------------------------------

// ⚠ Tu API Key (visible solo para pruebas)
const apiKey = "AIzaSyAXqqRzU_mmqIL0dodXWX1KaBYnyMJlLwk";

// Inicializar cliente de Gemini
const ai = new GoogleGenerativeAI(apiKey);

// Evento para generar recomendación
document.getElementById("btnRecomendar").addEventListener("click", async () => {
    document.getElementById("recomendacion").innerText = "Procesando...";

    const prompt = `
Evaluar desempeño del estudiante (escala 0-100):
Puntualidad: ${data.puntualidad}
Responsabilidad: ${data.responsabilidad}
Técnicas: ${data.tecnicas}
Comunicación: ${data.comunicacion}
Observaciones: ${data.observaciones}

Genera recomendaciones claras, realistas y accionables para mejorar las áreas con menor puntuación.
`;

    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

        const response = await model.generateContent(prompt);

        const textResult =
            response.response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No se pudo generar la recomendación.";

        document.getElementById("recomendacion").innerText = textResult;

    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        document.getElementById("recomendacion").innerText =
            "Error generando recomendación. Revisa la consola.";
    }
});

// --------------------------------------------------
// HISTORIAL
// --------------------------------------------------
const historial = JSON.parse(localStorage.getItem("historial")) || [];
const lista = document.getElementById("listaHistorial");

historial.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.fecha} - Promedio: ${
        ((item.puntualidad + item.responsabilidad + item.tecnicas + item.comunicacion) / 4).toFixed(1)
    } (${item.clasificacion})`;
    lista.appendChild(li);
});

// --------------------------------------------------
// INICIALIZACIÓN FINAL
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    renderRadarChart();
});
