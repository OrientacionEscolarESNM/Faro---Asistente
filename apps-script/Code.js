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
    var context = data.context || ""; // Fragmentos relevantes del PDF
    var userName = data.userName || "";
    var userAge = data.userAge || "";
    var location = data.location || null;
    var forceEmergency = data.forceEmergency || false;
    
    if (!message) {
      throw new Error("El mensaje del usuario está vacío.");
    }
    
    // Obtener la respuesta de la cadena de IAs
    var aiResponse = getAIChatResponse(message, context, userName, userAge, forceEmergency);
    
    var wasEmergencyDetectedByAI = false;
    // Si la IA detecta riesgo por su cuenta o el frontend lo forzó
    if (forceEmergency || aiResponse.indexOf("[ALERTA_RIESGO]") !== -1) {
      wasEmergencyDetectedByAI = true;
      // Enviar la alerta silenciosamente a Telegram
      sendTelegramAlert(message, userName, userAge, location);
      // Limpiar el tag para que no se muestre al usuario
      aiResponse = aiResponse.replace(/\[ALERTA_RIESGO\]/g, "").trim();
    }
    
    output.setContent(JSON.stringify({
      success: true,
      response: aiResponse,
      isEmergency: wasEmergencyDetectedByAI
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
function getAIChatResponse(userMessage, context, userName, userAge, forceEmergency) {
  var props = PropertiesService.getScriptProperties().getProperties();
  
  var geminiKey = props.GEMINI_API_KEY;
  var openrouterKey = props.OPENROUTER_API_KEY;
  var groqKey = props.GROQ_API_KEY;
  var mistralKey = props.MISTRAL_API_KEY;
  
  // 1. Prompt de sistema con contexto, tono adaptado por edad y reglas estrictas de rapidez
  var systemInstruction = "Eres 'Faro', un asistente escolar de orientación y emergencias psicológicas de la Normal Superior de Monterrey Casanare. " +
    "Tu tono debe ser extremadamente empático, comprensivo, seguro y calmado. " +
    "Estás hablando con: " + (userName || "Estudiante") + " (" + (userAge ? userAge + " años" : "edad no especificada") + ").\n\n" +
    "ADAPTACIÓN DE LENGUAJE SEGÚN LA EDAD:\n";
    
  if (userAge) {
    var age = parseInt(userAge, 10);
    if (!isNaN(age)) {
      if (age < 12) {
        systemInstruction += "- El usuario es un niño/a menor de 12 años. Exprésate con un lenguaje sumamente dulce, protector, infantil, claro, dinámico y muy simple. Usa metáforas comprensibles y evita palabras técnicas o adultas.\n\n";
      } else if (age >= 12 && age <= 18) {
        systemInstruction += "- El usuario es un adolescente (12-18 años). Exprésate con un tono cercano, respetuoso, empático, de escucha activa, libre de sermones de adulto. Háblale a su nivel con calidez y cercanía.\n\n";
      } else {
        systemInstruction += "- El usuario es un adulto (padre, docente o cuidador). Exprésate de manera formal, profesional, orientadora y colaborativa.\n\n";
      }
    }
  }

  systemInstruction += "IMPORTANTE: Utiliza la siguiente información oficial del 'Manual Integral Faro' para responder con precisión y seguridad. Toda tu respuesta debe estar basada de forma estricta en estos datos oficiales:\n\n" +
    context + "\n\n" +
    "REGLAS DE CONDUCTA Y EMERGENCIAS:\n" +
    "- Responde SIEMPRE en el mismo idioma en el que te hable el usuario. Tu redacción debe ser 100% natural, empática y perfecta.\n" +
    "- Tus respuestas DEBEN ser sumamente cortas, empáticas y concisas.\n" +
    "- Si el usuario muestra intenciones suicidas, de autolesión o manifiesta explícita o implícitamente que no quiere vivir, tu respuesta debe ser EXTREMADAMENTE persuasiva, cálida, humana y de contención emocional profunda para disuadirlo de hacerse daño. Hazle sentir que su vida es inmensamente valiosa y que no está solo en este dolor. Tras brindarle esa fuerte contención emocional inicial, guíalo suavemente y con cariño a buscar ayuda humana proporcionando los números de la Línea Amiga (322 784 2874) o la Orientación Escolar ESNM (321 463 7057). NUNCA uses frases robóticas ni alarmantes como 'Protocolo de emergencia activado'. Sé un apoyo cercano, de tú a tú.\n" +
    "- ADEMÁS, es ESTRICTAMENTE OBLIGATORIO que incluyas el texto oculto [ALERTA_RIESGO] al principio de tu respuesta para activar las alarmas del sistema.\n";

  if (forceEmergency) {
    systemInstruction += "\nATENCIÓN IA: El sistema de seguridad local acaba de detectar que el usuario ingresó palabras de altísimo riesgo. DEBES aplicar el protocolo persuasivo y profundo descrito arriba inmediatamente e incluir [ALERTA_RIESGO].\n";
  }

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
      "maxOutputTokens": 250
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
    "temperature": 0.4,
    "max_tokens": 250
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
    "temperature": 0.4,
    "max_tokens": 250
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
    "temperature": 0.4,
    "max_tokens": 250
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
 * Servicio de Alerta vía Telegram
 */
function sendTelegramAlert(userMessage, userName, userAge, location) {
  var props = PropertiesService.getScriptProperties().getProperties();
  var token = props.TELEGRAM_BOT_TOKEN;
  var chatId = props.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.error("Faltan las credenciales de Telegram (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID).");
    return;
  }
  
  var name = userName || "Estudiante Anónimo";
  var age = userAge ? userAge + " años" : "Edad desconocida";
  var locText = "Ubicación no proporcionada o denegada por el usuario.";
  
  var hasCoordinates = false;
  var lat = null;
  var lng = null;

  if (location && typeof location === 'object' && location.lat && location.lng) {
    hasCoordinates = true;
    lat = location.lat;
    lng = location.lng;
    locText = "📍 Ubicación obtenida (Ver mapa nativo abajo)\nEnlace Web: https://maps.google.com/?q=" + lat + "," + lng;
  } else if (typeof location === 'string') {
    locText = "📍 Estado de ubicación: " + location;
  }
  
  var textAlert = "🔴 <b>ALERTA DE RIESGO INMINENTE</b> 🔴\n\n" +
                  "<b>Usuario:</b> " + name + " (" + age + ")\n" +
                  "<b>Mensaje del estudiante:</b>\n<i>\"" + userMessage + "\"</i>\n\n" +
                  locText + "\n\n" +
                  "<i>Notificación automática del sistema Faro.</i>";
                  
  // 1. Enviar Mensaje de Texto (Contiene detalles y link de Maps)
  var urlMessage = "https://api.telegram.org/bot" + token + "/sendMessage";
  var payloadMessage = {
    "chat_id": chatId,
    "text": textAlert,
    "parse_mode": "HTML"
  };
  
  try {
    UrlFetchApp.fetch(urlMessage, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payloadMessage),
      "muteHttpExceptions": true
    });
  } catch(e) {
    console.error("Error enviando mensaje a Telegram: " + e.toString());
  }
  
  // 2. Enviar Mapa Nativo Interactivo de Telegram (Solo si hay coordenadas)
  if (hasCoordinates) {
    var urlLocation = "https://api.telegram.org/bot" + token + "/sendLocation";
    var payloadLocation = {
      "chat_id": chatId,
      "latitude": lat,
      "longitude": lng
    };
    
    try {
      UrlFetchApp.fetch(urlLocation, {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payloadLocation),
        "muteHttpExceptions": true
      });
    } catch(e) {
      console.error("Error enviando ubicación a Telegram: " + e.toString());
    }
  }
}
