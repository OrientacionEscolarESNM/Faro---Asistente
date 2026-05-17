import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.resolve(__dirname, '../Manual Integral Faro Asistente Escolar Emergencias Psicologicas.pdf');
const outputPath = path.resolve(__dirname, '../public/faroKnowledge.json');

async function extractPDF() {
  try {
    console.log(`Leyendo PDF desde: ${pdfPath}`);
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Instanciar el nuevo PDFParse
    const parser = new PDFParse({ data: dataBuffer });
    
    console.log('Extrayendo texto...');
    const result = await parser.getText();
    
    const fullText = result.text;
    console.log(`¡Texto extraído con éxito! Total de caracteres: ${fullText.length}`);
    
    // Dividir el texto en secciones lógicas
    const rawParagraphs = fullText.split(/\n\s*\n+/);
    const chunks = [];
    let currentChunk = "";
    let chunkId = 1;
    
    for (const paragraph of rawParagraphs) {
      const cleanParagraph = paragraph.replace(/\s+/g, ' ').trim();
      if (!cleanParagraph) continue;
      
      if (cleanParagraph.length < 50) {
        currentChunk += (currentChunk ? "\n" : "") + cleanParagraph;
        continue;
      }
      
      currentChunk += (currentChunk ? "\n" : "") + cleanParagraph;
      
      if (currentChunk.length >= 800) {
        chunks.push({
          id: chunkId++,
          text: currentChunk
        });
        const sentences = currentChunk.split(/[.!?]\s+/);
        const overlap = sentences.slice(-2).join('. ') + '.';
        currentChunk = overlap.length < 200 ? overlap : "";
      }
    }
    
    if (currentChunk.trim() && currentChunk.length > 50) {
      chunks.push({
        id: chunkId++,
        text: currentChunk.trim()
      });
    }
    
    // Crear directorio public si no existe
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Guardar el JSON
    fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
    console.log(`¡Base de conocimiento generada con éxito! Guardada en: ${outputPath}`);
    console.log(`Total de fragmentos (chunks) generados: ${chunks.length}`);
    
    // Liberar recursos
    await parser.destroy();
  } catch (err) {
    console.error('Error al procesar el PDF:', err);
    process.exit(1);
  }
}

extractPDF();
