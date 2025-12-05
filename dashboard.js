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
// ==========================================
// LÓGICA PARA DESCARGAR PDF (Híbrido: Imagen + Texto)
// ==========================================
const btnPDF = document.getElementById("btnDescargarPDF");

if (btnPDF) {
    btnPDF.addEventListener("click", async function () {
        
        // 1. Feedback visual
        const textoOriginal = btnPDF.innerText;
        btnPDF.innerText = "⏳ Generando Reporte Híbrido...";
        btnPDF.disabled = true;

        // ELEMENTOS
        const listaHistorial = document.getElementById("listaHistorial");
        const contenedorPrincipal = document.querySelector(".grid-container"); 
        const boxReco = document.querySelector(".box-reco"); // La tarjeta completa de la IA
        const textoIAElement = document.getElementById("recomendacion");

        // VARIABLES PARA RESTAURAR
        let origStyles = {
            hist: { height: "", overflow: "" },
            grid: { display: "", gap: "", gridTemplateColumns: "", height: "" },
            recoDisplay: "" 
        };

        // Capturamos el texto de la IA antes de ocultar nada
        const textoIA = textoIAElement ? textoIAElement.innerText : "No hay recomendaciones disponibles.";

        try {
            if (!window.jspdf || !window.html2canvas) {
                throw new Error("Librerías no cargadas.");
            }

            // --- PASO 1: PREPARAR EL DOM PARA LA FOTO ---
            
            // A) Ocultar la caja de recomendación (para que no salga en la foto cortada)
            if (boxReco) {
                origStyles.recoDisplay = boxReco.style.display;
                boxReco.style.display = "none"; 
            }

            // B) Linearizar el diseño (Una columna vertical)
            if (contenedorPrincipal) {
                origStyles.grid.display = contenedorPrincipal.style.display;
                origStyles.grid.gridTemplateColumns = contenedorPrincipal.style.gridTemplateColumns;
                origStyles.grid.gap = contenedorPrincipal.style.gap;
                origStyles.grid.height = contenedorPrincipal.style.height;

                contenedorPrincipal.style.display = "flex";
                contenedorPrincipal.style.flexDirection = "column";
                contenedorPrincipal.style.gap = "20px";
                contenedorPrincipal.style.height = "auto";
            }

            // C) Expandir Historial (para que salga completo en la foto)
            if (listaHistorial) {
                origStyles.hist.height = listaHistorial.style.maxHeight;
                origStyles.hist.overflow = listaHistorial.style.overflow;
                listaHistorial.style.maxHeight = "none";
                listaHistorial.style.overflow = "visible";
            }

            // Esperar renderizado
            await new Promise(resolve => setTimeout(resolve, 300));

            // --- PASO 2: TOMAR LA FOTO (Gráficos + Historial) ---
            const elemento = document.body; 
            const canvas = await window.html2canvas(elemento, {
                scale: 2, 
                useCORS: true,
                logging: false,
                windowWidth: elemento.scrollWidth,
                windowHeight: elemento.scrollHeight 
            });

            // --- PASO 3: GENERAR PDF ---
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf; 
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = 210; 
            const pdfHeight = 297; 
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Agregar la imagen (Página 1 y siguientes si es larga)
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // --- PASO 4: AGREGAR RECOMENDACIÓN COMO TEXTO PLANO ---
            // Creamos una nueva página exclusiva para el texto de la IA
            pdf.addPage();
            
            // Configurar fuente
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.setTextColor(40, 40, 40);
            pdf.text("Recomendación detallado por IA GEMINI", 15, 20);

            // Configurar cuerpo del texto
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);

            // Ajuste de línea automático (Word Wrap)
            const margen = 15;
            const anchoMaximo = 180; // Ancho A4 (210) - Márgenes
            const lineasTexto = pdf.splitTextToSize(textoIA, anchoMaximo);
            
            // Escribir texto
            pdf.text(lineasTexto, margen, 35);

            // Guardar
            pdf.save('Reporte_Estudiante_Completo.pdf');

        } catch (error) {
            console.error("Error PDF:", error);
            alert("Error: " + error.message);
        } finally {
            // --- PASO 5: RESTAURAR TODO ---
            btnPDF.innerText = textoOriginal;
            btnPDF.disabled = false;

            // Restaurar Recomendación
            if (boxReco) boxReco.style.display = origStyles.recoDisplay;

            // Restaurar Grid
            if (contenedorPrincipal) {
                contenedorPrincipal.style.display = origStyles.grid.display;
                contenedorPrincipal.style.gridTemplateColumns = origStyles.grid.gridTemplateColumns;
                contenedorPrincipal.style.gap = origStyles.grid.gap;
                contenedorPrincipal.style.height = origStyles.grid.height;
            }

            // Restaurar Historial
            if (listaHistorial) {
                listaHistorial.style.maxHeight = origStyles.hist.height;
                listaHistorial.style.overflow = origStyles.hist.overflow;
            }
        }
    });
}