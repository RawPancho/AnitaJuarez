let PrimerPreview;

async function muestraDeActa() {
  let response;
  try {
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEETSID,
      range: 'Acta Principal!A2:D', // Obtén todas las filas desde A2 hasta el final
    });
  } catch (err) {
    FlashPantalla("No pudo realizarse la conexión. Desvinculate y vuelve a solicitar Autorización");
    console.error(err);
    return;
  }

  const range = response.result;
  if (!range || !range.values || range.values.length === 0) {
    FlashPantalla("No hay entradas cargadas");
    console.warn("No hay entradas cargadas.");
    return;
  }
  // Tomar las últimas 5 filas
  const ultimasFilas = range.values.slice(-5);
  const contenedor = document.getElementById('contenedorCeldas');
  contenedor.innerHTML = ""; // Limpia el contenedor antes de agregar nuevos elementos

  // Crear encabezados (solo una vez)
  const encabezados = ['Entrada', 'Profesional', 'Fecha', 'Hora'];
  encabezados.forEach(texto => {
    const encabezadoCelda = document.createElement('div');
    encabezadoCelda.classList.add('celda-acta', 'encabezado');
    encabezadoCelda.textContent = texto;
    contenedor.appendChild(encabezadoCelda);
  });

  // Añadir las filas de datos
  ultimasFilas.forEach((fila) => {
    const entradaCelda = document.createElement('div');
    entradaCelda.classList.add('celda-acta');
    entradaCelda.textContent = fila[0];

    const profesionalCelda = document.createElement('div');
    profesionalCelda.classList.add('celda-acta');
    profesionalCelda.textContent = fila[1];

    const fechaCelda = document.createElement('div');
    fechaCelda.classList.add('celda-acta');
    fechaCelda.textContent = fila[2];

    const horaCelda = document.createElement('div');
    horaCelda.classList.add('celda-acta');
    horaCelda.textContent = fila[3];

    // Añadir las celdas al contenedor
    contenedor.appendChild(entradaCelda);
    contenedor.appendChild(profesionalCelda);
    contenedor.appendChild(fechaCelda);
    contenedor.appendChild(horaCelda);
  });
}

async function Reportar() {
  const txtReporte = document.getElementById('txt_reporte').value; // Obtener el valor
  const selectElement = document.getElementById('pReportar');
  const Professional = selectElement.selectedOptions[0].text;
  const fechaActual = new Date();
  const [fechaCorta, hora] = formatearFecha(fechaActual);

  // Verificar si los campos están vacíos
  if (!txtReporte || !Professional || Professional === "Selecciona") {
    FlashPantalla("Por favor, complete todos los campos antes de reportar.");
    return;
  }
  const actualizar = [
    txtReporte,
    Professional,
    fechaCorta,
    hora,
  ];

  try {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEETSID,
      range: 'Acta Principal!A:D', // Ajusta este rango según tu necesidad
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [actualizar],
      },
    });
    FlashPantalla("Reporte Enviado con Exito");
    document.getElementById('pReportarID').value = '';
    document.getElementById('txt_reporte').value = '';
    document.getElementById('pReportar').value = '';
    muestraDeActa();
  } catch (err) {
    
    FlashPantalla("Error al enviar el reporte, reinicia la pagina o intente más tarde");
    console.error("Error al enviar el reporte:", err);
  }
}

async function servicioCompartido() {
  
  const pVendioSC = document.getElementById('pVendio_sc');
  const VendioSc = pVendioSC.selectedOptions[0].text;
  const pHizoSC = document.getElementById('pHizo_sc');
  const HizoSc = pHizoSC.selectedOptions[0].text;
  const ClienteSc = document.getElementById('txt_Cliente_sc').value;
  const Servicio = document.getElementById('txt_sc').value;
  const fechaActual = new Date();
  const [fechaCorta, hora] = formatearFecha(fechaActual);

  // Verificar si los campos están vacíos
  if (!HizoSc || !VendioSc || !ClienteSc  || !Servicio || !VendioSc === "Selecciona" || HizoSc === "Selecciona") {
    FlashPantalla("Por favor, complete todos los campos antes de reportar.");
    return;
  }
  const actualizar = [
    VendioSc,
    HizoSc,
    Servicio,
    fechaCorta,
    ClienteSc,
  ];

  try {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEETSID,
      range: 'Servicios Compartidos!A:E', // Ajusta este rango según tu necesidad
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [actualizar],
      },
    });
    FlashPantalla("Servicio cargado con Exito");
    document.getElementById('pVendioID').value = '';
    document.getElementById('pVendio_sc').value = '';
    document.getElementById('pHizoID').value = '';
    document.getElementById('pHizo_sc').value = '';
    document.getElementById('txt_sc').value = '';
    document.getElementById('txt_Cliente_sc').value = '';
    muestraDeActa();
  } catch (err) {
    
    FlashPantalla("Error al cargar el Servicio Compartido, reinicia la pagina o intente más tarde");
    console.error("Error al cargar el SC:", err);
  }
}
function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son indexados desde 0
  const año = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');
  
  return [`${dia}/${mes}/${año}`, `${horas}:${minutos}:${segundos}`];
}