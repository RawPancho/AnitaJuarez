

const HizoSc = document.getElementById('pHizo_sc');
const VendioSc = document.getElementById('pVendio_sc');
const txtClienteSc = document.getElementById('txt_Cliente_sc');
const txtSc = document.getElementById('txt_sc');


let PrimerPreview
async function muestraDeActa() {
  let response;
  try {
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEETSID,
      range: 'Acta Principal!A2:D5',
    });
  } catch (err) {
    console.error(err)
  }
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    console.warn("No hay entradas cargadas.")
    return;
  }
  PrimerPreview = [];
  range.values.forEach((fila) =>{
    const filasActa = {
      entrada: fila[0],
      profesional: fila[1],
      fecha: fila[2],
      hora: fila[3],
    };
    PrimerPreview.push(filasActa);
 } );
 console.log(PrimerPreview);
}

async function Reportar() {
  const txtReporte = document.getElementById('txt_reporte').value; // Obtener el valor
  const selectElement = document.getElementById('pReportar');
  const Professional = selectElement.selectedOptions[0].text;

  // Verificar si los campos están vacíos
  if (!txtReporte || !Professional || Professional === "Selecciona") {
    FlashPantalla("Por favor, complete todos los campos antes de reportar.");
    return;
  }

  const actualizar = [
    txtReporte,
    Professional,
    new Date().toISOString(), // Formato ISO para la fecha
    new Date().toLocaleTimeString(), // Hora en formato local
  ];

  try {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEETSID,
      range: 'Acta Principal!A:D', // Ajusta este rango según tu necesidad
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [actualizar], // Asegúrate de que sea un array de arrays
      },
    });
    FlashPantalla("Reporte Enviado con Exito");
    document.getElementById('pReportarID').value = '';
    document.getElementById('txt_reporte').value = '';
    document.getElementById('pReportar').value = '';
  } catch (err) {
    
    FlashPantalla("Error al enviar el reporte");
    console.error("Error al enviar el reporte:", err);
  }
}
