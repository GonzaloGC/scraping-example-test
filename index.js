const axios = require("axios");
const pdfParse = require("pdf-parse");
const cron = require("node-cron");
const fs = require("fs");

// URL del PDF
const pdfUrl = "https://outlettecnologico.cl/listaPrecios.pdf";

// Función para descargar y extraer texto del PDF
async function fetchAndParsePDF() {
  try {
    // Descargar el PDF
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    // Parsear el PDF
    const data = await pdfParse(pdfBuffer);
    const pdfText = data.text;

    // Procesar el texto extraído para estructurarlo en JSON
    const jsonData = processTextToJson(pdfText);

    // Guardar los datos en un archivo JSON
    fs.writeFileSync("data.json", JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error("Error al descargar o parsear el PDF:", error);
  }
}

// Función para procesar el texto extraído y estructurarlo en JSON
/* function processTextToJson(text) {
  const lines = text.split('\n');
  const jsonData = lines.map(line => {
    const [ sku, marca, nombre, stock, precio] = line.split(',');
    return { 
      sku: sku ? sku.trim() : '', 
      marca: marca ? marca.trim() : '', 
      nombre: nombre ? nombre.trim() : '', 
      stock: stock ? stock.trim() : '', 
      precio: precio ? precio.trim() : '' 
    };
  });

  return jsonData;
} */
function processTextToJson(text) {
  const lines = text.split("\n");
  const jsonData = lines.map((line) => {
    // Dividir la línea por espacios
    const parts = line.split(" ");

    // Identificar el SKU (primer número)
    const sku = parts[0];

    // Identificar el precio (último número)
    const precio = parts[parts.length - 1];

    // El resto de la cadena es el nombre del producto
    const nombre = parts.slice(1, parts.length - 1).join(" ");

    return {
      sku,
      nombre,
      precio,
    };
  });

  return jsonData;
}

// Ejecutar la función inmediatamente
fetchAndParsePDF();

// Programar la tarea para cada 5 minutos
cron.schedule("*/5 * * * *", () => {
  console.log("Ejecutando tarea programada...");
  fetchAndParsePDF();
});
