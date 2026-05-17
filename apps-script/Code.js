/**
 * Faro Asistente Backend - Google Apps Script
 * Maneja la lógica de chat con búsqueda semántica local de PDF y cadena de IA con fallback.
 */

function doPost(e) {
  // Configurar CORS
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var data = JSON.parse(e.postData.contents);
    var message = data.message;
    var context = data.context || ""; // Fragmentos relevantes del PDF pasados por el cliente
    
    if (!message) {
      throw new Error("El mensaje del usuario está vacío.");
    }
    
    // Obtener la respuesta de la cadena de IAs
    var aiResponse = getAIChatResponse(message, context);
    
    output.setContent(JSON.stringify({
      success: true,
      response: aiResponse
    }));
  } catch (err) {
    output.setContent(JSON.stringify({
      success: false,
      error: err.toString()
    }));
  }
  
  return output;
}

/**
 * Cadena de IAs con Fallback automático.
 */
function getAIChatResponse(userMessage, context) {
  var props = PropertiesService.getScriptProperties().getProperties();
  
  var geminiKey = props.GEMINI_API_KEY;
  var openrouterKey = props.OPENROUTER_API_KEY;
  var groqKey = props.GROQ_API_KEY;
  var mistralKey = props.MISTRAL_API_KEY;
  
  // 1. Prompt de sistema con contexto de la base de conocimiento
  var systemInstruction = "Eres 'Faro', un asistente escolar de orientación y emergencias psicológicas. " +
    "Tu tono debe ser extremadamente empático, comprensivo, seguro y calmado. " +
    "IMPORTANTE: Utiliza la siguiente información oficial del 'Manual Integral Faro' para responder con precisión y seguridad:\n\n" +
    context + "\n\n" +
    "REGLAS DE CONDUCTA:\n" +
    "- Si el usuario muestra tendencias suicidas o de autolesión, debes activar inmediatamente un protocolo de alerta clara, recomendar llamar al 911 o al número de emergencia local y dirigirse al menú de emergencias de la app.\n" +
    "- Mantén tus respuestas concisas, claras y reconfortantes.";

  var prompt = "Mensaje del estudiante: " + userMessage;

  var errors = [];

  // --- MODELO 1: Google Gemini (Primario) ---
  if (geminiKey) {
    try {
      return callGemini(geminiKey, prompt, systemInstruction);
    } catch (e) {
      errors.push("Gemini falló: " + e.message);
    }
  }

  // --- MODELO 2: OpenRouter (Fallback 1) ---
  if (openrouterKey) {
    try {
      return callOpenRouter(openrouterKey, prompt, systemInstruction);
    } catch (e) {
      errors.push("OpenRouter (Minimax) falló: " + e.message);
    }
  }

  // --- MODELO 3: Groq (Fallback 2) ---
  if (groqKey) {
    try {
      return callGroq(groqKey, prompt, systemInstruction);
    } catch (e) {
      errors.push("Groq (Llama) falló: " + e.message);
    }
  }

  // --- MODELO 4: Mistral (Fallback 3) ---
  if (mistralKey) {
    try {
      return callMistral(mistralKey, prompt, systemInstruction);
    } catch (e) {
      errors.push("Mistral falló: " + e.message);
    }
  }

  // Si todos los modelos fallaron
  throw new Error("Todos los proveedores de IA fallaron. Errores: " + errors.join(" | "));
}

/**
 * Llamada a la API de Google Gemini (1.5 Flash)
 */
function callGemini(apiKey, prompt, systemInstruction) {
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  
  var payload = {
    "contents": [
      {
        "parts": [
          { "text": systemInstruction + "\n\n" + prompt }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0.4,
      "maxOutputTokens": 800
    }
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var resCode = response.getResponseCode();
  var resText = response.getContentText();
  
  if (resCode !== 200) {
    throw new Error("HTTP " + resCode + ": " + resText);
  }
  
  var json = JSON.parse(resText);
  return json.candidates[0].content.parts[0].text;
}

/**
 * Llamada a la API de OpenRouter (Minimax 2.5 Free)
 */
function callOpenRouter(apiKey, prompt, systemInstruction) {
  var url = "https://openrouter.ai/api/v1/chat/completions";
  
  var payload = {
    "model": "minimax/minimax-m2.5:free",
    "messages": [
      { "role": "system", "content": systemInstruction },
      { "role": "user", "content": prompt }
    ],
    "temperature": 0.4
  };
  
  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + apiKey,
      "HTTP-Referer": "https://github.com/OrientacionEscolarESNM/Faro---Asistente",
      "X-Title": "Faro Asistente"
    },
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var resCode = response.getResponseCode();
  var resText = response.getContentText();
  
  if (resCode !== 200) {
    throw new Error("HTTP " + resCode + ": " + resText);
  }
  
  var json = JSON.parse(resText);
  return json.choices[0].message.content;
}

/**
 * Llamada a la API de Groq (Llama 3.1 8B Instant)
 */
function callGroq(apiKey, prompt, systemInstruction) {
  var url = "https://api.groq.com/openai/v1/chat/completions";
  
  var payload = {
    "model": "llama-3.1-8b-instant",
    "messages": [
      { "role": "system", "content": systemInstruction },
      { "role": "user", "content": prompt }
    ],
    "temperature": 0.4
  };
  
  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var resCode = response.getResponseCode();
  var resText = response.getContentText();
  
  if (resCode !== 200) {
    throw new Error("HTTP " + resCode + ": " + resText);
  }
  
  var json = JSON.parse(resText);
  return json.choices[0].message.content;
}

/**
 * Llamada a la API de Mistral (Mistral Small / Open Mistral 7B)
 */
function callMistral(apiKey, prompt, systemInstruction) {
  var url = "https://api.mistral.ai/v1/chat/completions";
  
  var payload = {
    "model": "open-mistral-7b",
    "messages": [
      { "role": "system", "content": systemInstruction },
      { "role": "user", "content": prompt }
    ],
    "temperature": 0.4
  };
  
  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var resCode = response.getResponseCode();
  var resText = response.getContentText();
  
  if (resCode !== 200) {
    throw new Error("HTTP " + resCode + ": " + resText);
  }
  
  var json = JSON.parse(resText);
  return json.choices[0].message.content;
}
