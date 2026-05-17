/**
 * Servicio de integración del asistente Faro con Google Apps Script y RAG Local
 */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxmjmGS0cuclRIQpFGFVRfVtSd0mPwdxU3sHKE65RpVAH1N3XHC3-Vl9VsU_gidVjFv/exec";

// Cargar la base de conocimiento en memoria
let knowledgeBase = [];

const loadKnowledgeBase = async () => {
  if (knowledgeBase.length > 0) return knowledgeBase;
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}faroKnowledge.json`);
    if (response.ok) {
      knowledgeBase = await response.json();
    }
  } catch (error) {
    console.error("Error al cargar la base de conocimiento:", error);
  }
  return knowledgeBase;
};

// Buscar los fragmentos más relevantes basados en la entrada del usuario
const searchKnowledge = async (query) => {
  const kb = await loadKnowledgeBase();
  if (kb.length === 0) return "";
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (queryWords.length === 0) return "";
  
  // Calcular puntaje de coincidencia
  const scored = kb.map(chunk => {
    let score = 0;
    const textLower = chunk.text.toLowerCase();
    for (const word of queryWords) {
      if (textLower.includes(word)) {
        score += 1;
      }
    }
    return { chunk, score };
  });
  
  // Ordenar y tomar los 2 mejores fragmentos
  const topChunks = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.chunk.text);
    
  return topChunks.join("\n\n");
};

/**
 * Función principal para obtener la respuesta de Faro
 */
export const getFaroResponse = async (userMessage, userName = "", userAge = "", location = null) => {
  try {
    const lowerMsg = userMessage.toLowerCase();
    
    // 1. Detección local inmediata de crisis extrema (Seguridad primero)
    const crisisKeywords = ['suicidio', 'suicidar', 'matarme', 'matar', 'cortarme', 'ahorcarme', 'morirme', 'abuso sexual', 'me pegaron', 'violación', 'hacerme daño', 'no quiero vivir', 'desaparecer'];
    const isExtremeCrisis = crisisKeywords.some(word => lowerMsg.includes(word));
    
    if (isExtremeCrisis) {
      // Disparar la alerta silenciosa al backend en segundo plano
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          isEmergencyAlert: true,
          message: userMessage,
          userName: userName,
          userAge: userAge,
          location: location
        })
      }).catch(err => console.error("Error disparando alerta local:", err));

      return {
        isEmergency: true,
        text: "🚨 **PROTOCOLO DE EMERGENCIA ACTIVADO:** He detectado términos asociados a un riesgo vital inmediato. Como asistente de Inteligencia Artificial, **no puedo reemplazar la ayuda humana**. Por favor:\n\n" +
               "1. Llama inmediatamente a la **Línea Amiga Casanare (322 784 2874)** o a **Bomberos Monterrey (312 550 0806)**.\n" +
               "2. No te quedes solo/a, busca de inmediato a tu orientador escolar (321 463 7057) o a un adulto protector.\n" +
               "3. Dirígete a la sección de **Emergencia** en el menú lateral para ver más números y contactos directos.\n\n" +
               "Tu vida e integridad física son lo más importante. Estamos listos para apoyarte."
      };
    }

    // 2. Buscar fragmentos relevantes en la base de conocimiento local (PDF indexado)
    const searchedContext = await searchKnowledge(userMessage);
    
    // Cargar la introducción y contactos de la Normal Superior para tenerlos como base fija
    const kb = await loadKnowledgeBase();
    const defaultIntro = kb.find(c => c.id === 1)?.text || "";
    const defaultContacts = kb.find(c => c.id === 3)?.text || "";
    
    const context = `${defaultIntro}\n\n${defaultContacts}\n\nContexto de búsqueda específico:\n${searchedContext}`;

    // 3. Consultar al backend de Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        message: userMessage,
        context: context,
        userName: userName,
        userAge: userAge,
        location: location
      })
    });
    
    if (!response.ok) {
      throw new Error(`Respuesta de red inválida: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      return { isEmergency: data.isEmergency === true, text: data.response };
    } else {
      console.error("Error devuelto por la API del Backend:", data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Error en getFaroResponse:", error);
    // Fallback completo si falla la red o el backend
    return {
      isEmergency: false,
      text: "Hola. Disculpa, estoy experimentando dificultades de conexión con mi servidor. " +
             "Recuerda que si necesitas orientación o estás en una crisis emocional, puedes llamar a la **Línea Amiga (322 784 2874)** o contactar a Orientación Escolar al **321 463 7057**. " +
             "Por favor, intenta enviarme tu mensaje nuevamente en unos momentos."
    };
  }
};
