// -----------------------------------------------
// IMPORTACIÓN CORRECTA DEL SDK DE GEMINI
// -----------------------------------------------
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Variable global para almacenar la instancia del gráfico
let radarChartInstance = null;

// Cargar datos desde localStorage o usar valores por defecto
const data = JSON.parse(localStorage.getItem("evaluacion")) || {
    campos: {},
    observaciones: "Evaluación inicial pendiente.",
    clasificacion: "Sin datos"
};

// Mostrar clasificación cuando cargue el DOM
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("clasificacion").innerText = data.clasificacion || "Sin datos";
    renderRadarChart();
});

// --------------------------------------------------
// FUNCIÓN PARA RENDERIZAR EL GRÁFICO RADAR (DINÁMICO)
// --------------------------------------------------
async function renderRadarChart() {
    const ctx = document.getElementById("radarChart");

    // DestruAIzaSyDWwZRTL2NcC4M85HgFH_ojVVrEyf63xY0ir gráfico previo si existe
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    // Preparar etiquetas y valores desde campos dinámicos
    const campos = data.campos || {};
    const labels = Object.keys(campos);
    const valores = Object.values(campos);

    // Si no hay datos, mostrar gráfico vacío
    if (labels.length === 0) {
        radarChartInstance = new Chart(ctx, {
            type: "radar",
            data: {
                labels: ["Sin datos"],
                datasets: [{
                    label: "Desempeño",
                    data: [0],
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
                        min: 0,
                        max: 100,
                        pointLabels: { font: { size: 14 } }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return;
    }

    radarChartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels: labels,
            datasets: [{
                label: "Desempeño",
                data: valores,
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

// ⚠ Tu API Key
const apiKey = "AIzaSyD9urAatto4jyM7YcUEGUjh0q5oOxB4mrg";

// Inicializar cliente de Gemini
const ai = new GoogleGenerativeAI(apiKey);

// Evento para generar recomendación
document.getElementById("btnRecomendar").addEventListener("click", async () => {
    document.getElementById("recomendacion").innerText = "Procesando...";

    // Construir prompt dinámico con TODOS los campos
    let promptText = "Evaluar desempeño del estudiante (escala 0-100):\n";
    
    // Agregar campos dinámicos
    const campos = data.campos || {};
    Object.entries(campos).forEach(([campo, valor]) => {
        promptText += `${campo}: ${valor}\n`;
    });

    promptText += `Observaciones: ${data.observaciones}\n\n`;
promptText += `
Actúa como un Coordinador Académico experto y Mentor. Tu tarea es generar un **Informe de Desempeño y Retroalimentación** para un practicante, dirigido al docente supervisor.

El objetivo es que este informe sea lo suficientemente detallado para entender el contexto del alumno, pero sin ser un texto genérico o relleno. El tono debe ser formal, constructivo y analítico.

Por favor, estructura la respuesta estrictamente en las siguientes secciones (usa negritas para los títulos):

**1. Análisis General del Desempeño:**
Redacta un párrafo (3-4 líneas) que integre el promedio obtenido con las observaciones. No solo repitas la nota, interpreta si el alumno es equilibrado o si tiene brechas grandes entre sus habilidades blandas y técnicas.

**2. Fortalezas Clave:**
Identifica la competencia con mayor puntaje. Explica brevemente por qué esta habilidad es valiosa para su futuro profesional.

**3. Áreas Críticas de Mejora:**
Menciona las competencias con menor puntaje (con su nota entre paréntesis). Explica el impacto negativo que estas deficiencias tienen en su trabajo diario si no se corrigen.

**4. Plan de Acción Recomendado:**
Proporciona 3 estrategias específicas y accionables (tipo "bullet points") para mejorar las áreas débiles. Evita consejos obvios como "debe mejorar"; en su lugar, sugiere "cómo" hacerlo (ej: usar herramientas de gestión, solicitar feedback semanal, etc.).

**5. Conclusión y Orientación:**
Una frase final de cierre que motive al cambio o refuerce el buen desempeño, manteniendo la seriedad académica.

IMPORTANTE: No uses listas para todo, redacta párrafos coherentes en las secciones 1, 2 y 3. Usa viñetas solo en la sección 4.
`;

    try {
        // Modelo correcto
        const model = ai.getGenerativeModel({ model:"gemini-2.5-flash" });

        // Generación correcta
        const response = await model.generateContent(promptText);

        // Extraer texto correctamente con .text()
        const textResult = response.response.text() || "No se pudo generar la recomendación.";

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
    // Calcular promedio dinámicamente
    const campos = item.campos || {};
    const valores = Object.values(campos).filter(v => !isNaN(v));
    
    const promedio = valores.length > 0 
        ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1)
        : 0;
    
    const li = document.createElement("li");
    li.textContent = `${item.fecha} - Promedio: ${promedio} (${item.clasificacion || 'Sin clasificar'})`;
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
                throw new Error("Las librerías no cargaron.");
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
            // MEJORA: Usamos el ID específico si existe, es más seguro que document.body en producción
            const elemento = document.getElementById("contenidoParaPDF") || document.body; 
            
            const canvas = await window.html2canvas(elemento, {
                scale: 2, 
                useCORS: true,      // CRUCIAL: Permite cargar fuentes/imágenes externas
                allowTaint: false,  // CRUCIAL: Evita errores de seguridad en el navegador
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
            pdf.text("Análisis Detallado de Inteligencia Artificial", 15, 20);

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
            // MEJORA: Mensaje detallado para saber qué pasa en Render
            alert("Error al generar PDF: " + error.message + "\n\n(Revisa la consola con F12 para ver el error de seguridad exacto)");
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