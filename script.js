let recognition;
let statementStartTime, statementEndTime;
let drawingEnabled = false;

// Load audio files
const audios = {
    greeting: new Audio('coo-greeting.mp3'),
    motherly: new Audio('motherly-nuturing.mp3'),
    aggressive: new Audio('aggressive-territorial.mp3'),
    defensive: new Audio('defensive.mp3'),
    flirtatious: new Audio('flirtatious.mp3'),
    danger: new Audio('potential-danger.mp3'),
    terrified: new Audio('terrified-petrified-grunts.mp3'),
    territorial: new Audio('territorial-soft.mp3')
};

// Initialize speech recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Please use Google Chrome for this feature.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log("Listening...");
        document.getElementById('status').textContent = "Listening...";
        statementStartTime = new Date().getTime();
    };

    recognition.onresult = (event) => {
        statementEndTime = new Date().getTime();
        const transcript = event.results[0][0].transcript.toLowerCase();
        const confidence = event.results[0][0].confidence;

        console.log("Transcript:", transcript);

        if (confidence > 0.5) {
            const duration = (statementEndTime - statementStartTime) / 1000;
            categorizeAndRespond(transcript, duration);
        } else {
            console.log("Low confidence, defaulting to greeting.");
            playAudioForDuration(audios.greeting, 2);
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        restartRecognition();
    };

    recognition.onend = () => {
        console.log("Recognition ended.");
        enableDrawing();
    };

    recognition.start();
}

// Restart recognition after a delay
function restartRecognition() {
    setTimeout(() => {
        try {
            recognition.start();
        } catch (error) {
            console.error("Error restarting recognition:", error);
        }
    }, 500);
}

// Categorize speech and respond
function categorizeAndRespond(text, duration) {
    let audio;

    if (/hi|hello|hey/.test(text)) audio = audios.greeting;
    else if (/care|support|nice/.test(text)) audio = audios.motherly;
    else if (/angry|furious/.test(text)) audio = audios.aggressive;
    else if (/defensive|insecure/.test(text)) audio = audios.defensive;
    else if (/flirt|sexy/.test(text)) audio = audios.flirtatious;
    else if (/danger|threat/.test(text)) audio = audios.danger;
    else if (/scared|terrified/.test(text)) audio = audios.terrified;
    else if (/territory|mine/.test(text)) audio = audios.territorial;
    else audio = audios.greeting;

    playAudioForDuration(audio, duration);
}

// Play audio for specified duration
function playAudioForDuration(audio, duration) {
    audio.currentTime = 0;
    audio.play()
        .then(() => {
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                enableDrawing();
            }, duration * 1000);
        })
        .catch(error => console.error("Error playing audio:", error));
}

// Enable drawing mode
function enableDrawing() {
    console.log("Drawing mode enabled.");
    document.getElementById('status').textContent = "Drawing mode enabled!";
    drawingEnabled = true;
}

// Drawing functionality
const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
let isDrawing = false;

canvas.addEventListener('mousedown', () => isDrawing = drawingEnabled);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousemove', draw);

function draw(event) {
    if (!isDrawing) return;
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = '#00FFCC';

    context.lineTo(event.clientX, event.clientY);
    context.stroke();
    context.beginPath();
    context.moveTo(event.clientX, event.clientY);
}

// Initialize on page load
window.onload = initSpeechRecognition;
