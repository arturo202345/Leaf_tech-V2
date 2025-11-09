let mediaRecorder;
let audioChunks = [];
let monitoreoActualId = null;

function abrirModalNotas(monitoreoId, notasActuales) {
    monitoreoActualId = monitoreoId;
    document.getElementById('modalNotas').style.display = 'block';
}

function cerrarModalNotas() {
    document.getElementById('modalNotas').style.display = 'none';
    grabacionEstado.textContent = '';
}

// ✅ Función de eliminación corregida - sin confirmación
function confirmarEliminar() {
    const btn = document.querySelector('.btn-delete');
    const url = btn.dataset.url;
    window.location.href = url;
}

const btnGrabar = document.getElementById('btnGrabar');
const btnDetener = document.getElementById('btnDetener');
const grabacionEstado = document.getElementById('grabacionEstado');

btnGrabar.addEventListener('click', async () => {
    if (!navigator.mediaDevices) {
        alert("Tu navegador no soporta grabación de audio");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

        mediaRecorder.onstop = async () => {
            grabacionEstado.textContent = "Procesando audio...";
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            // ✅ Corregido: fetch() en lugar de fetch``
            const response = await fetch(`/monitoreo/${monitoreoActualId}/transcribir_audio/`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                grabacionEstado.textContent = "✅ Nota guardada: " + data.texto;
            } else {
                grabacionEstado.textContent = "❌ Error: " + (data.error || 'Transcripción fallida');
            }
        };

        mediaRecorder.start();
        grabacionEstado.textContent = "🎙️ Grabando...";
        btnGrabar.disabled = true;
        btnDetener.disabled = false;

    } catch (error) {
        console.error(error);
        alert("Error al iniciar grabación: " + error.message);
    }
});

btnDetener.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        grabacionEstado.textContent = "⏹️ Grabación detenida. Subiendo...";
        btnGrabar.disabled = false;
        btnDetener.disabled = true;
    }
});