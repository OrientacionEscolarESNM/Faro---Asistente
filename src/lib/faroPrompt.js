/**
 * Servicio de integración del asistente Faro con Google Apps Script
 * v2.0 — Historial de conversación, sin RAG por palabras clave.
 */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxmjmGS0cuclRIQpFGFVRfVtSd0mPwdxU3sHKE65RpVAH1N3XHC3-Vl9VsU_gidVjFv/exec";

// Palabras clave de crisis para detección local inmediata (activa forceEmergency=true)
const CRISIS_KEYWORDS = [
  // Ideación suicida directa
  'suicidio', 'suicidar', 'suicidarme', 'matarme', 'cortarme', 'ahorcarme',
  'envenenarme', 'tirarme', 'lanzarme',
  // Frases del manual Faro
  'no quiero vivir', 'quiero desaparecer', 'no quiero seguir', 'quiero morir',
  'todos estarían mejor sin mí', 'todos estarian mejor sin mi',
  'ya no aguanto más', 'ya no aguanto mas', 'hacerme daño', 'hacerme daño',
  // Variantes coloquiales
  'cansado de vivir', 'cansada de vivir', 'para qué seguir', 'para que seguir',
  'no tiene sentido vivir', 'quisiera no despertar', 'quitarme la vida',
  // Violencia y abuso graves
  'abuso sexual', 'me violaron', 'me están pegando', 'me estan pegando', 'violación'
];

/**
 * Detecta crisis local: evita falsos positivos verificando contexto mínimo.
 * "matar" solo cuenta si viene acompañado de "me" o "quiero".
 */
const detectLocalCrisis = (message) => {
  const lower = message.toLowerCase();
  // Verificar keywords compuestas primero (frases)
  if (CRISIS_KEYWORDS.some(kw => lower.includes(kw))) return true;
  // "matar" solo si es reflexivo o dirigido
  if (/\bmatarme\b|\bme quiero matar\b|\bme voy a matar\b/.test(lower)) return true;
  return false;
};

/**
 * Función principal para obtener la respuesta de Faro.
 * @param {string} userMessage - Mensaje actual del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} userAge - Edad del usuario
 * @param {any} location - Coordenadas GPS o string de estado
 * @param {string} sessionId - ID de sesión único
 * @param {string} userGender - Género del usuario
 * @param {Array} conversationHistory - Últimos mensajes de la sesión [{id, text, sender}]
 */
export const getFaroResponse = async (
  userMessage,
  userName = "",
  userAge = "",
  location = null,
  sessionId = "",
  userGender = "",
  conversationHistory = []
) => {
  try {
    const isExtremeCrisis = detectLocalCrisis(userMessage);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        message: userMessage,
        context: "",           // Ya no se usa RAG; el manual está en el backend
        userName,
        userAge,
        location,
        forceEmergency: isExtremeCrisis,
        sessionId,
        userGender,
        conversationHistory    // NUEVO: historial completo de la sesión
      })
    });

    if (!response.ok) throw new Error(`Red: ${response.status}`);

    const data = await response.json();
    if (data.success) {
      return { isEmergency: data.isEmergency === true, text: data.response };
    } else {
      console.error("Error del backend:", data.error);
      throw new Error(data.error);
    }

  } catch (error) {
    console.error("Error en getFaroResponse:", error);
    return {
      isEmergency: false,
      text: "Disculpa, estoy teniendo dificultades de conexión con mi servidor. " +
            "Si necesitas orientación o estás en una crisis emocional, puedes llamar a la " +
            "**Línea Amiga (322 784 2874)** o contactar a Orientación Escolar al **321 463 7057**. " +
            "Por favor, intenta de nuevo en unos momentos."
    };
  }
};
