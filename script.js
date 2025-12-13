document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-recording');
    const hindiOutput = document.getElementById('hindi-output');
    const englishOutput = document.getElementById('english-output');
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.querySelector('.status-indicator');
    const btnIcon = toggleBtn.querySelector('i');
    const btnText = toggleBtn.querySelector('span');
    const sourceSelect = document.getElementById('source-lang');
    const targetSelect = document.getElementById('target-lang');

    // === Supported Languages ===
    const languages = [
        { code: 'hi-IN', name: 'Hindi', tts: 'hi-IN' },
        { code: 'en-US', name: 'English', tts: 'en-US' },
        { code: 'es-ES', name: 'Spanish', tts: 'es-ES' },
        { code: 'fr-FR', name: 'French', tts: 'fr-FR' },
        { code: 'de-DE', name: 'German', tts: 'de-DE' },
        { code: 'ja-JP', name: 'Japanese', tts: 'ja-JP' },
        { code: 'it-IT', name: 'Italian', tts: 'it-IT' },
        { code: 'zh-CN', name: 'Chinese', tts: 'zh-CN' }
    ];

    // Popuplate Dropdowns
    languages.forEach(lang => {
        const sourceOpt = document.createElement('option');
        sourceOpt.value = lang.code;
        sourceOpt.textContent = lang.name;
        sourceSelect.appendChild(sourceOpt);

        const targetOpt = document.createElement('option');
        targetOpt.value = lang.code;
        targetOpt.textContent = lang.name;
        targetSelect.appendChild(targetOpt);
    });

    // Set Defaults
    sourceSelect.value = 'hi-IN';
    targetSelect.value = 'en-US';

    // === State ===
    let isRecording = false;
    let recognition = null;
    let synthesis = window.speechSynthesis;

    // === Initialization ===
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        // Dynamic Language Setting
        recognition.lang = sourceSelect.value;
        sourceSelect.addEventListener('change', () => {
            recognition.lang = sourceSelect.value;
            // Restart if currently recording to apply change
            if (isRecording) {
                stopRecording();
                setTimeout(startRecording, 500);
            }
        });

        recognition.onstart = () => {
            updateStatus('listening');
        };

        recognition.onresult = async (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                    // Trigger Translation on Final Result
                    handleValidSpeech(finalTranscript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Display Results
            updateHindiDisplay(finalTranscript || interimTranscript, !finalTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                updateStatus('error', 'Microphone access denied');
            } else {
                updateStatus('error', 'Error occurred in recognition: ' + event.error);
            }
            stopRecording();
        };

        recognition.onend = () => {
            if (isRecording) {
                // If supposed to be recording but stopped (e.g. silence), restart
                try {
                    recognition.start();
                } catch (e) {
                    stopRecording();
                }
            } else {
                updateStatus('ready');
            }
        };

    } else {
        alert('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
        toggleBtn.disabled = true;
        btnText.textContent = 'Browser Not Supported';
    }

    // === Functions ===

    function toggleRecording() {
        if (!recognition) return;

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    function startRecording() {
        if (!recognition) return;
        try {
            recognition.start();
            isRecording = true;
            toggleBtn.classList.add('recording');
            btnIcon.className = 'ph-fill ph-stop';
            btnText.textContent = 'Stop Listening';
        } catch (e) {
            console.error(e);
        }
    }

    function stopRecording() {
        if (!recognition) return;
        isRecording = false;
        recognition.stop();
        toggleBtn.classList.remove('recording');
        btnIcon.className = 'ph-fill ph-microphone';
        btnText.textContent = 'Start Listening';
        updateStatus('ready');
    }

    function updateStatus(state, message) {
        statusIndicator.classList.remove('listening', 'processing');

        switch (state) {
            case 'listening':
                statusIndicator.classList.add('listening');
                statusText.textContent = 'Listening...';
                break;
            case 'processing':
                statusIndicator.classList.add('processing');
                statusText.textContent = 'Translating...';
                break;
            case 'speaking':
                statusIndicator.classList.add('processing'); // Use same visual for speaking
                statusText.textContent = 'Speaking...';
                break;
            case 'error':
                statusText.textContent = message || 'Error';
                break;
            default:
                statusText.textContent = 'Ready to start';
        }
    }

    function updateHindiDisplay(text, isInterim) {
        hindiOutput.textContent = text;
        if (text === '') {
            hindiOutput.innerHTML = `<span class="placeholder">Listening...</span>`;
        } else {
            hindiOutput.style.opacity = isInterim ? '0.7' : '1';
        }
    }

    async function handleValidSpeech(text) {
        if (!text.trim()) return;

        updateStatus('processing');

        // Get current language names
        const sourceLang = languages.find(l => l.code === sourceSelect.value).name;
        const targetLang = languages.find(l => l.code === targetSelect.value).name;

        try {
            const translatedText = await translateText(text, sourceLang, targetLang);

            // Display Translation
            englishOutput.textContent = translatedText;
            englishOutput.classList.remove('placeholder-bright');

            // Speak Translation
            speakText(translatedText);

        } catch (error) {
            console.error(error);
            englishOutput.textContent = "Translation failed.";
            updateStatus('error', 'Translation Failed');
        }
    }

    async function translateText(text, sourceLang, targetLang) {
        // Method 1: Server Proxy (Uses Server-Side .env key)
        try {
            // Use local proxy to avoid CORS issues
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile", // Fast and powerful
                    messages: [
                        { role: "system", content: `You are a professional translator. Translate the ${sourceLang} input below to ${targetLang}. Output ONLY the translated text, nothing else.` },
                        { role: "user", content: text }
                    ],
                    temperature: 0.1
                })
            });

            if (!response.ok) throw new Error('API Error: ' + response.statusText);
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (e) {
            console.error("Translation failed, switching to mock", e);
            // Fallback to mock if server fails
            return await mockTranslation(text);
        }
    }

    async function mockTranslation(text) {
        // Simple mock delay to simulate network
        await new Promise(r => setTimeout(r, 600));

        // Very basic mock dictionary for demo purposes
        const commonPhrases = {
            "नमस्ते": "Hello",
            "आपका नाम क्या है": "What is your name?",
            "मेरा नाम": "My name is",
            "कैसे हो": "How are you?",
            "धन्यवाद": "Thank you",
            "शुक्रिया": "Thank you",
            "हाँ": "Yes",
            "नहीं": "No",
            "खाना": "Food",
            "पानी": "Water"
        };

        for (const [hindi, english] of Object.entries(commonPhrases)) {
            if (text.includes(hindi)) {
                return english + " " + text.replace(hindi, "").replace("है", "is").trim(); // Very naive replacement
            }
        }

        // If unknown, return a placeholder indicating we need an API
        const words = text.split(" ");
        if (words.length > 0) {
            return `(Simulated) Translated: ${words.join(' ')}`;
        }
        return "Translation unavailable (Add API Key)";
    }

    function speakText(text) {
        if (!text) return;

        updateStatus('speaking');

        // Cancel any existing speech
        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set dynamic target language
        const targetConfig = languages.find(l => l.code === targetSelect.value);
        utterance.lang = targetConfig.tts;

        utterance.rate = 1;
        utterance.pitch = 1;

        // Find a matching voice for the target language
        const voices = synthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang === targetConfig.tts || voice.lang.startsWith(targetConfig.tts.split('-')[0]));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (isRecording) {
                updateStatus('listening');
            } else {
                updateStatus('ready');
            }
        };

        synthesis.speak(utterance);
    }

    // === Event Listeners ===
    toggleBtn.addEventListener('click', toggleRecording);
});
