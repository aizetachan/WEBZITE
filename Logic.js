document.getElementById('generate-button').addEventListener('click', function() {
    const prompt = document.getElementById('prompt-input').value;
    const model = document.getElementById('model-select').value;

    if (prompt) {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('image-display').innerHTML = '';

        generarImagenFlux(prompt, model);
    } else {
        alert('Por favor, introduce un prompt.');
    }
});

function generarImagenFlux(prompt, model, width, height) {
    const payload = {
        prompt: prompt,
        width: 1024,
        height: 768,
    };

    fetch(`https://api.bfl.ml/v1/${model}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'x-key': 'eb047ce7-a124-40ee-a7c1-abba96858a8f',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
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
                    document.getElementById('image-display').innerHTML = `<img src="${imageUrl}" alt="Imagen generada">`;
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