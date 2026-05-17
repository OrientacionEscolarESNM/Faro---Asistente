/**
 * Agrega el menú de Faro en Google Sheets al abrir el documento.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚨 Faro')
    .addItem('📊 Generar / Actualizar Dashboard', 'createDashboard')
    .addToUi();
}

/**
 * Registra y actualiza todos los gráficos y métricas en una pestaña dedicada de Dashboard.
 */
function createDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheets()[0]; // Primera pestaña (donde entran los datos de Faro)
  
  // 1. Validar que tengamos datos para trabajar
  var dataRange = dataSheet.getDataRange();
  var data = dataRange.getValues();
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert("❌ No hay suficientes datos para generar estadísticas aún. Realiza algunas conversaciones de prueba primero.");
    return;
  }
  
  // 2. Crear o limpiar la pestaña de "Dashboard"
  var dashSheet = ss.getSheetByName("Dashboard");
  if (dashSheet) {
    dashSheet.clear();
    // Eliminar gráficos existentes para reconstruirlos limpios
    var charts = dashSheet.getCharts();
    for (var i = 0; i < charts.length; i++) {
      dashSheet.removeChart(charts[i]);
    }
  } else {
    dashSheet = ss.insertSheet("Dashboard");
  }
  
  // Mostrar líneas de cuadrícula para una mejor referencia de celdas
  dashSheet.setGridlinesVisible(true);
  
  // --- AGREGAR DATOS EN JAVASCRIPT A ALTA VELOCIDAD ---
  var totalSessions = data.length - 1;
  var totalMessages = 0;
  var emergencyCount = 0;
  
  var categories = {};
  var hours = {};
  var genders = {};
  var ages = {};
  
  // Inicializar horas del día (00 a 23) para que salgan todas en orden en el gráfico
  for (var h = 0; h < 24; h++) {
    hours[h] = 0;
  }
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var hourVal = parseInt(row[3], 10);
    var ageVal = parseInt(row[4], 10);
    var genderVal = row[5] || "Otro";
    var catVal = row[6] || "Otros";
    var emergencyVal = row[7];
    var msgCountVal = parseInt(row[8], 10) || 0;
    
    totalMessages += msgCountVal;
    if (emergencyVal === "SÍ") {
      emergencyCount++;
    }
    
    // Categorías de problemáticas
    categories[catVal] = (categories[catVal] || 0) + 1;
    
    // Horas de inicio
    if (!isNaN(hourVal)) {
      hours[hourVal] = (hours[hourVal] || 0) + 1;
    }
    
    // Géneros
    genders[genderVal] = (genders[genderVal] || 0) + 1;
    
    // Edades
    if (!isNaN(ageVal)) {
      ages[ageVal] = (ages[ageVal] || 0) + 1;
    }
  }
  
  // --- DIBUJAR INTERFAZ DE DASHBOARD ---
  // Estilo de Título Principal
  dashSheet.getRange("A1:I1").merge().setValue("📊 CUADRO DE MANDO E INDICADORES - ASISTENTE FARO")
    .setFontSize(14).setFontWeight("bold").setFontColor("#FFFFFF").setBackgroundColor("#1A365D")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  dashSheet.setRowHeight(1, 45);
  
  // --- TARJETAS KPI (Fila 3 y 4) ---
  // KPI 1: Sesiones
  dashSheet.getRange("A3:B3").merge().setValue("Total Conversaciones")
    .setFontWeight("bold").setFontColor("#718096").setHorizontalAlignment("center");
  dashSheet.getRange("A4:B4").merge().setValue(totalSessions)
    .setFontSize(20).setFontWeight("bold").setFontColor("#2B6CB0").setHorizontalAlignment("center");
    
  // KPI 2: Mensajes
  dashSheet.getRange("D3:E3").merge().setValue("Mensajes Interactuados")
    .setFontWeight("bold").setFontColor("#718096").setHorizontalAlignment("center");
  dashSheet.getRange("D4:E4").merge().setValue(totalMessages)
    .setFontSize(20).setFontWeight("bold").setFontColor("#2B6CB0").setHorizontalAlignment("center");
    
  // KPI 3: Alertas de Crisis
  dashSheet.getRange("G3:H3").merge().setValue("Alertas de Emergencia 🚨")
    .setFontWeight("bold").setFontColor("#718096").setHorizontalAlignment("center");
  dashSheet.getRange("G4:H4").merge().setValue(emergencyCount)
    .setFontSize(20).setFontWeight("bold").setFontColor(emergencyCount > 0 ? "#C53030" : "#2F855A")
    .setHorizontalAlignment("center");
    
  // Darle borde y fondo a las tarjetas KPI
  dashSheet.getRange("A3:B4").setBorder(true, true, true, true, null, null, "#CBD5E0", SpreadsheetApp.BorderStyle.SOLID).setBackground("#EBF8FF");
  dashSheet.getRange("D3:E4").setBorder(true, true, true, true, null, null, "#CBD5E0", SpreadsheetApp.BorderStyle.SOLID).setBackground("#EBF8FF");
  dashSheet.getRange("G3:H4").setBorder(true, true, true, true, null, null, "#CBD5E0", SpreadsheetApp.BorderStyle.SOLID).setBackground(emergencyCount > 0 ? "#FFF5F5" : "#F0FFF4");
  
  // --- ESCRIBIR TABLAS DE SOPORTE (Ocultas visualmente en columnas K a U) ---
  
  // 1. Tabla de Categorías (Columnas K y L)
  dashSheet.getRange("K1").setValue("Categoría");
  dashSheet.getRange("L1").setValue("Cantidad");
  var catRows = Object.keys(categories);
  for (var r = 0; r < catRows.length; r++) {
    dashSheet.getRange(r + 2, 11).setValue(catRows[r]);
    dashSheet.getRange(r + 2, 12).setValue(categories[catRows[r]]);
  }
  var catEndRow = catRows.length + 1;
  
  // 2. Tabla de Horas (Columnas N y O)
  dashSheet.getRange("N1").setValue("Hora");
  dashSheet.getRange("O1").setValue("Cantidad");
  var hourRows = Object.keys(hours);
  for (var r = 0; r < hourRows.length; r++) {
    dashSheet.getRange(r + 2, 14).setValue(hourRows[r] + ":00");
    dashSheet.getRange(r + 2, 15).setValue(hours[hourRows[r]]);
  }
  var hourEndRow = hourRows.length + 1;
  
  // 3. Tabla de Géneros (Columnas Q y R)
  dashSheet.getRange("Q1").setValue("Género");
  dashSheet.getRange("R1").setValue("Cantidad");
  var genRows = Object.keys(genders);
  for (var r = 0; r < genRows.length; r++) {
    dashSheet.getRange(r + 2, 17).setValue(genRows[r]);
    dashSheet.getRange(r + 2, 18).setValue(genders[genRows[r]]);
  }
  var genEndRow = genRows.length + 1;
  
  // 4. Tabla de Edades (Columnas T y U)
  dashSheet.getRange("T1").setValue("Edad");
  dashSheet.getRange("U1").setValue("Cantidad");
  var ageRows = Object.keys(ages).sort(function(a, b){ return a - b; });
  for (var r = 0; r < ageRows.length; r++) {
    dashSheet.getRange(r + 2, 20).setValue(ageRows[r] + " años");
    dashSheet.getRange(r + 2, 21).setValue(ages[ageRows[r]]);
  }
  var ageEndRow = ageRows.length + 1;
  
  // --- CONSTRUIR E INYECTAR LOS GRÁFICOS ---
  
  // Gráfico 1: Torta de Problemáticas (Fila 6, Columna A)
  var chart1 = dashSheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dashSheet.getRange("K1:L" + catEndRow))
    .setPosition(6, 1, 10, 10)
    .setOption('title', 'Distribución de Problemáticas (IA)')
    .setOption('width', 440)
    .setOption('height', 270)
    .setOption('colors', ['#3182CE', '#DD6B20', '#E53E3E', '#319795', '#805AD5', '#38A169', '#718096'])
    .build();
  dashSheet.insertChart(chart1);
  
  // Gráfico 2: Torta de Géneros (Fila 6, Columna F)
  var chart2 = dashSheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dashSheet.getRange("Q1:R" + genEndRow))
    .setPosition(6, 5, 20, 10)
    .setOption('title', 'Uso de Faro por Género')
    .setOption('width', 440)
    .setOption('height', 270)
    .setOption('colors', ['#ED64A6', '#4299E1', '#A0AEC0'])
    .build();
  dashSheet.insertChart(chart2);
  
  // Gráfico 3: Horas Pico (Fila 20, Columna A)
  var chart3 = dashSheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dashSheet.getRange("N1:O" + hourEndRow))
    .setPosition(20, 1, 10, 10)
    .setOption('title', 'Picos de Uso por Horas del Día')
    .setOption('width', 440)
    .setOption('height', 270)
    .setOption('legend', {position: 'none'})
    .setOption('colors', ['#319795'])
    .build();
  dashSheet.insertChart(chart3);
  
  // Gráfico 4: Edades (Fila 20, Columna F)
  var chart4 = dashSheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dashSheet.getRange("T1:U" + ageEndRow))
    .setPosition(20, 5, 20, 10)
    .setOption('title', 'Distribución de Uso por Edades')
    .setOption('width', 440)
    .setOption('height', 270)
    .setOption('legend', {position: 'none'})
    .setOption('colors', ['#805AD5'])
    .build();
  dashSheet.insertChart(chart4);
  
  // 3. Ocultar las columnas de soporte (K a V) para que el Dashboard quede súper limpio y elegante
  dashSheet.hideColumns(11, 2); // Ocultar K y L
  dashSheet.hideColumns(14, 2); // Ocultar N y O
  dashSheet.hideColumns(17, 2); // Ocultar Q y R
  dashSheet.hideColumns(20, 2); // Ocultar T y U
  
  // Traer la pestaña "Dashboard" al frente para el usuario
  dashSheet.activate();
  
  // Mostrar mensaje de éxito
  SpreadsheetApp.getUi().alert("📊 ¡Cuadro de Mando Faro Actualizado!\n\nSe han recalculado todos los indicadores y gráficos basados en las conversaciones reales.");
}
