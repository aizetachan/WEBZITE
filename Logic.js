const API_KEY = "sk-iYptsvcNujWNMKsx9rlXee0XWcRZQto2tIZCuk346VLDWMrt";
const API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3.5-large";

document.getElementById('generate-button').addEventListener('click', function() {
    const prompt = document.getElementById('prompt-input').value;
    const model = document.getElementById('model-select').value;
    const width = document.getElementById('width-input').value;
    const height = document.getElementById('height-input').value;

    if (prompt) {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('image-display').innerHTML = '';

        if (model.startsWith('stable-diffusion')) {
            generarImagenStableDiffusion(prompt, model);
        } else {
            generarImagenFlux(prompt, model, width, height);
        }
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

async function generarImagenStableDiffusion(prompt, model) {
    const API_URL = `https://api.stability.ai/v2beta/stable-image/generate/${model}`;

    const payload = {
        prompt: prompt,
        output_format: "jpeg"
    };

    try {
        const response = await axios.postForm(
            API_URL,
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    Accept: "image/*"
                },
            }
        );

        if (response.status === 200) {
            const blob = new Blob([response.data], { type: "image/jpeg" });
            const imageUrl = URL.createObjectURL(blob);
            mostrarImagen(imageUrl);
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    } catch (error) {
        console.error("Error al generar la imagen:", error);
        document.getElementById('loader').style.display = 'none';
    }
}

function mostrarImagen(imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Imagen generada por Stable Diffusion";
    img.style.width = "512px";
    img.style.height = "512px";
    document.getElementById('image-display').appendChild(img);
    document.getElementById('loader').style.display = 'none';
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
