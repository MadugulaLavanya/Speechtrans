# VoiceStream | Multilingual Real-Time Translator

VoiceStream is a next-generation real-time voice translation application that removes language barriers instantly. It captures your speech, translates it using the powerful **Llama 3.3** AI model (via Groq), and speaks the result back in your chosen target language.

With a beautiful glassmorphism-inspired UI, it supports 8+ global languages and features a secure, proxy-based architecture.

![VoiceStream UI](https://via.placeholder.com/800x450.png?text=VoiceStream+Multilingual+UI)

## ✨ Features

- **🌍 Multi-Language Support**: seamlessly translate between:
  - 🇮🇳 Hindi
  - 🇺🇸 English
  - 🇪🇸 Spanish
  - 🇫🇷 French
  - 🇩🇪 German
  - 🇯🇵 Japanese
  - 🇮🇹 Italian
  - 🇨🇳 Chinese (Simplified)
- **🎤 Real-Time STT**: Uses the Web Speech API for low-latency speech recognition in all supported languages.
- **⚡ Ultra-Fast Translation**: Powered by **Groq's LPU™** engine running Meta's `llama-3.3-70b-versatile` model.
- **🔊 Smart TTS**: Automatically speaks the translated text using a native accent matching the target language.
- **🔒 Secure Architecture**: API keys are securely stored server-side in a `.env` file, ensuring no client-side exposure.
- **🎨 Premium UI**: A modern interface featuring glassmorphism, smooth animations, and interactive language selectors.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (Web Speech API).
- **Backend**: Python (Custom HTTP Proxy Server for secure API handling).
- **AI Model**: Llama 3.3 70B via Groq API.
- **Tools**: Phosphor Icons, Git.

## 🚀 Getting Started

### Prerequisites

- **Python 3.x** installed.
- A **Groq API Key** (Free beta access at [console.groq.com](https://console.groq.com)).
- **Google Chrome** or **Microsoft Edge** (Required for Web Speech API support).

### 📥 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd speechtrans
    ```

2.  **Configure Environment**:
    *   Create a `.env` file in the root directory (or use the existing one).
    *   Add your Groq API key:
        ```env
        GROQ_API_KEY=gsk_your_actual_key_here
        ```

### ▶️ Running the Application

1.  **Start the Server**:
    This Python server serves the app and securely proxies translation requests to Groq.
    ```bash
    python server.py
    ```
    *The server will start on `http://localhost:8000`.*

2.  **Open in Browser**:
    Launch Chrome or Edge and navigate to:
    👉 **[http://localhost:8000](http://localhost:8000)**

3.  **Start Translating**:
    1.  Select your **Source Language** (e.g., Hindi 🇮🇳).
    2.  Select your **Target Language** (e.g., French 🇫🇷).
    3.  Click **"Start Listening"**.
    4.  Speak, and watch the magic happen!

## 📂 Project Structure

```text
speechtrans/
├── index.html      # Main application structure
├── style.css       # Premium styling & glassmorphism effects
├── script.js       # Core logic (STT, TTS, Lang config, API calls)
├── server.py       # Python backend proxy for secure API access
├── .env            # Environment variables (Excluded from Git)
├── .gitignore      # Git exclusion rules
└── README.md       # Project documentation
```

## ⚠️ Troubleshooting

- **"Translation Failed"**: 
  - Check your console (F12) for errors.
  - Ensure `GROQ_API_KEY` is correct in `.env`.
  - **Restart the server** (`CTRL+C` -> `python server.py`) after changing the `.env` file.
- **Microphone ignored**: 
  - Ensure you are on `http://localhost:8000` (not a file path).
  - Allow microphone permissions when prompted.
- **Wrong/Robot Voice**: 
  - TTS voices depend on your operating system. Install additional language packs in your OS settings for better quality.

---
*Built with ❤️ by Antigravity*
