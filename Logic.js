let selectedWidth = 1024;
let selectedHeight = 576;

document.querySelectorAll('.aspect-ratio-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.aspect-ratio-button').forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
        selectedWidth = this.getAttribute('data-width');
        selectedHeight = this.getAttribute('data-height');
        console.log(`Aspect ratio button clicked: ${selectedWidth}x${selectedHeight}`);

        // Ajustar el tamaño del contenedor de la imagen inmediatamente
        ajustarTamanoImagen();
    });
});

document.getElementById('generate-button').addEventListener('click', function() {
    const prompt = document.getElementById('prompt-input').value;
    const model = document.getElementById('model-select').value;

    if (prompt) {
        document.getElementById('loader').style.display = 'block';
        const imageDisplay = document.getElementById('image-display');
        imageDisplay.style.display = 'none';
        imageDisplay.innerHTML = '';

        // Ajustar el tamaño del contenedor de la imagen
        imageDisplay.style.width = `${selectedWidth}px`;
        imageDisplay.style.height = `${selectedHeight}px`;

        generarImagenFlux(prompt, model, selectedWidth, selectedHeight);
    } else {
        alert('Por favor, introduce un prompt.');
    }
});

function generarImagenFlux(prompt, model, width, height) {
    const payload = {
        prompt: prompt,
        width: width,
        height: height,
    };

    console.log('Payload:', payload);

    fetch(`https://api.bfl.ml/v1/${model}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'x-key': 'eb047ce7-a124-40ee-a7c1-abba96858a8f',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        console.log('Response:', response);
        return response.json();
    })
    .then(data => {
        const requestId = data.id;
        if (requestId) {
            console.log(`Solicitud enviada con éxito. ID de solicitud: ${requestId}`);
            obtenerResultado(requestId);
        } else {
            alert('Error al enviar la solicitud.');
            document.getElementById('loader').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al generar la imagen.');
        document.getElementById('loader').style.display = 'none';
    });
}

function obtenerResultado(requestId) {
    const resultUrl = 'https://api.bfl.ml/v1/get_result';
    const headers = {
        'accept': 'application/json',
        'x-key': 'eb047ce7-a124-40ee-a7c1-abba96858a8f'
    };
    const params = new URLSearchParams({ id: requestId });

    const interval = setInterval(() => {
        fetch(`${resultUrl}?${params}`, { headers })
            .then(response => response.json())
            .then(result => {
                const status = result.status;
                if (status === 'Ready') {
                    clearInterval(interval);
                    const imageUrl = result.result.sample;
                    console.log(`Imagen generada con éxito: ${imageUrl}`);
                    document.getElementById('loader').style.display = 'none';
                    const imageDisplay = document.getElementById('image-display');
                    imageDisplay.innerHTML = `<img id="generated-image" src="${imageUrl}" alt="Imagen generada">`;
                    imageDisplay.style.display = 'block';

                    // Espera a que la imagen se cargue completamente antes de ajustar el tamaño
                    const imgElement = document.getElementById('generated-image');
                    imgElement.onload = function() {
                        ajustarTamanoImagen();
                    };
                } else {
                    console.log(`Estado de la generación: ${status}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                clearInterval(interval);
                document.getElementById('loader').style.display = 'none';
                alert('Hubo un error al obtener el resultado. Por favor, inténtalo de nuevo.');
                document.getElementById('image-display').innerHTML = '<p>Error al generar la imagen. Por favor, intenta nuevamente.</p>';
            });
    }, 500);
}

function ajustarTamanoImagen() {
    const imageDisplay = document.getElementById('image-display');
    imageDisplay.style.width = `${selectedWidth}px`;
    imageDisplay.style.height = `${selectedHeight}px`;
}

window.addEventListener('resize', ajustarTamanoImagen);
ajustarTamanoImagen(); // Llama a la función al cargar la página

// Función para manejar el clic en los botones de aspect ratio
function seleccionarAspectRatio(ratio) {
    // Guardar el ratio seleccionado en una variable global o de estado
    estado.aspectRatioSeleccionado = ratio;
}

// Evento del botón Generate
document.getElementById('generate-button').addEventListener('click', function() {
    // Obtener el aspect ratio seleccionado
    const aspectRatio = estado.aspectRatioSeleccionado;

    // Lógica para generar la imagen con el aspect ratio seleccionado
    generarImagen(aspectRatio);
});

// Función para generar la imagen
function generarImagen(aspectRatio) {
    // Implementar la lógica de generación de imagen usando el aspect ratio
    console.log(`Generando imagen con aspect ratio: ${aspectRatio}`);
    // ... lógica de generación de imagen ...
}