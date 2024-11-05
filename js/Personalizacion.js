function checkOrientation() {
    const container = document.querySelector('.container');
    const rightColumn = document.querySelector('.right-column');

    // Verifica si la pantalla está en modo horizontal
    if (window.innerWidth > window.innerHeight) {
        // Muestra la columna derecha en modo horizontal
        container.style.display = 'flex'; // o 'block' dependiendo de cómo quieras mostrarlo
        rightColumn.style.display = 'block'; // Muestra la columna derecha
    } else {
        // Oculta la columna derecha en modo vertical
        container.style.display = 'block';
        rightColumn.style.display = 'none'; // Oculta la columna derecha
    }
}
// Llama a la función al cargar la página
window.addEventListener('load', checkOrientation);

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

    const profesionales = {
      '1': 'Anita',
      '2': 'Meli',
      '9': 'Pela',
      '10': 'Eli',
      '22': 'Cande',
      '17': 'Marti, Admin',
      '18': 'Marti, Prod y Servicios',
      'Si': 'Sil',
      '29': 'Mari',
      '30': 'Gabi',
      '31': 'Dennis',
      'Ja': 'Jari',
  };
  function handleAutocomplete(input) {
    const inputVal = input.value.trim(); // Obtiene el valor ingresado, eliminando espacios
    const select = input.previousElementSibling; // Obtiene el select anterior
    const nombre = profesionales[inputVal]; // Obtiene el nombre del profesional basado en el número

    if (nombre) {
        select.value = inputVal; // Actualiza el valor del select si hay coincidencia
    } else {
        select.value = ''; // Limpia el select si no hay coincidencia
    }
}

// Captura todos los inputs y les añade el evento
const inputs = document.querySelectorAll('.input_profesional');
inputs.forEach(input => {
    input.addEventListener('input', function() {
        handleAutocomplete(this);
    });
});