
const CLIENT_ID = '975138822531-kc3rvpocfo6m56qh0mv50itfeko0udb8.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBoAXvSua9gw0njTpFMuXmq13iJgruRrEE';
const DISCOVERY_DOCS = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SHEETSID = '1JG6vntHGDJo5K5MkAahw1CDoXs656Sal_AyTWd1XyNM';

const espacioDeTrabajo = document.getElementById('espacioDeTrabajo');
const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const btnReportar = document.getElementById('btn_reportar');
const btnSc = document.getElementById('btn_sc');

    let tokenClient;
    let gapiInited = false;
    let gisInited = false;

    document.getElementById('authorize_button').style.display = 'none';
    document.getElementById('signout_button').style.display = 'none';

    function gapiLoaded() {
      gapi.load('client', initializeGapiClient);
    }
    async function initializeGapiClient() {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOCS],
      });
      gapiInited = true;
      maybeEnableButtons();
    }
    function gisLoaded() {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      maybeEnableButtons();
    }
    function maybeEnableButtons() {
      if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'inline';
      }
    }
    function handleAuthClick() {
      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          throw (resp);
        }
        PrecargaDatos();
        estaHabilitado(true);
  FlashPantalla("Feliz Jornada!");
      };

      if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
        tokenClient.requestAccessToken({prompt: ''});
      }
    }
    function handleSignoutClick() {
      const token = gapi.client.getToken();
      if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        estaHabilitado(false);
      }
    }

function estaHabilitado(vinCulado) {
  authorizeButton.style.display = vinCulado ? 'none' : 'inline';
  signoutButton.style.display = vinCulado ? 'inline' : 'none';
  //espacioDeTrabajo.style.display = vinCulado ? 'flex' : 'hidden';
  btnReportar.disabled = vinCulado ? false : true;
  btnSc.disabled = vinCulado ? false : true;
} 

let profesionales = {};
async function PrecargaDatos() {
let responseProfes;
try {
  responseProfes = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEETSID,
    range: 'Lectura!A2:B', // Obtén todas las filas desde A2 hasta el final
  });
} catch (err) {
  FlashPantalla("No pudo realizarse la conexión para leer profesionales. Desvinculate y vuelve a solicitar Autorización");
  console.error(err);
  return;
}
const profs = responseProfes.result;
if (!profs || !profs.values || profs.values.length === 0) {
  FlashPantalla("No hay profesionales cargadas");
  console.warn("No hay profesionales cargadas.");
  return;
}

profesionales = {};  // Reiniciamos por si ya había datos previos
  profs.values.forEach(row => {
      profesionales[row[0]] = row[1];
  });
  
  // Actualizamos los select que tienen la clase "list_profesional"
  const selects = document.querySelectorAll('.list_profesional');
  selects.forEach(select => {
    
select.innerHTML = '<option value="">Selecciona</option>';

for (const [id, nombre] of Object.entries(profesionales)) {
const option = document.createElement('option');
option.value = id;
option.textContent = nombre;
select.appendChild(option);
}
});

//Muestra de Acta
let responseActa;
try {
  responseActa = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEETSID,
    range: 'Acta Principal!A2:D', // Obtén todas las filas desde A2 hasta el final
  });
} catch (err) {
  FlashPantalla("No pudo realizarse la conexión. Desvinculate y vuelve a solicitar Autorización");
  console.error(err);
  return;
}

const range = responseActa.result;
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
  PrecargaDatos();
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
  PrecargaDatos();
} catch (err) {

  FlashPantalla("Error al enviar, Desvincula y Conecta nuevamente, o intente mas tarde");
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

function mostrarPreviewActaEn(tabID) {
console.log("funca")
const destino = document.getElementById(`muestrA${tabID}`);
const preview = document.getElementById("contPreviewActa");

if (!destino || !preview) return;

destino.appendChild(preview);
preview.style.display = "block";
}

document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
tab.addEventListener('shown.bs.tab', function (event) {
  const idTab = event.target.getAttribute('href').replace('#', ''); // ejemplo: 'tab1'
  mostrarPreviewActaEn(tabID);
});
});
//--Personalización--

function checkOrientation() {
  const container = document.querySelector('.container');
  const leftColumn = document.querySelector('.left-column');
  const rightColumn = document.querySelector('.right-column');

  // Verifica si la pantalla está en modo horizontal
  if (window.innerWidth > window.innerHeight) {
      // Muestra la columna derecha en modo horizontal
      container.style.display = 'flex'; // o 'block' dependiendo de cómo quieras mostrarlo
      rightColumn.style.display = 'block'; // Muestra la columna derecha
      leftColumn.style.flex = '1';
  } else {
      // Oculta la columna derecha en modo vertical
      container.style.display = 'block';
      rightColumn.style.display = 'none'; // Oculta la columna derecha
      leftColumn.style.width = '100%';
  }
}
// Llama a la función al cargar la página
window.addEventListener('load', checkOrientation);
window.addEventListener('load', handleAuthClick);

// Llama a la función cada vez que se redimensione la ventana
window.addEventListener('resize', checkOrientation);

//Auto adjust textboxes width
var input = document.querySelector('input'); // get the input element
input.addEventListener('input', resizeInput); // bind the "resizeInput" callback on "input" event
resizeInput.call(input); // immediately call the function
function resizeInput() {
this.style.width = this.value.length + "ch";
}
    function FlashPantalla(message) {
      const flashMessage = document.getElementById('flash-message');
      flashMessage.textContent = message; // Cambiar el texto del mensaje
      flashMessage.classList.remove('flash-hidden'); // Mostrar el mensaje
      flashMessage.classList.add('flash-visible');
  
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
          flashMessage.classList.remove('flash-visible');
          flashMessage.classList.add('flash-hidden');
      }, 3000); // 3000 ms = 3 segundos
  }
  

// Función de autocompletado para los inputs que tienen la clase "input_profesional"
function handleAutocomplete(input) {
  const inputVal = input.value.trim(); // Valor ingresado sin espacios adicionales
  const select = input.previousElementSibling; // Se asume que el select está justo antes del input
  const nombre = profesionales[inputVal]; // Busca el profesional por ID en el objeto global
  if (nombre) {
    select.value = inputVal; // Si hay coincidencia, asigna el ID al select
  } else {
    select.value = ''; // Si no coincide, limpia el select
  }
}
// Capturamos los inputs de autocompletado y agregamos el evento "input"
const inputs = document.querySelectorAll('.input_profesional');
inputs.forEach(input => {
  input.addEventListener('input', function() {
    handleAutocomplete(this);
  });
});
