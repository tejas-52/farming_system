# 🌾 Kisan Sathi – Smart Farming Voice Assistant

### **AI-powered Voice-Based Farming Support System**

Built for **Techfest 2025-26 – Murf Voice Agent Hackathon**
**Built using Murf Falcon – the consistently fastest TTS API.**

---

## 📌 Project Overview

**Kisan Sathi** is a real-time **voice-driven farming assistant** designed to help farmers receive agricultural guidance through natural voice conversations.
Farmers simply **speak their question**, and the system responds instantly with **clear, natural audio** generated using **Murf Falcon TTS** — eliminating the need for typing or reading.

This application aims to make farming knowledge **accessible, simple, and practical**, especially for rural communities with limited digital literacy.

---

## 🎯 Key Features

* 🎤 **Voice-based interaction** (No typing required)
* 🔊 **Real-time spoken responses** using Murf Falcon TTS
* 🌦 **Weather-based suggestions**
* 🌾 **Crop & fertilizer guidance**
* 🐛 **Pest & disease control tips**
* 🏛 **Government scheme information**
* 🗣 **Language support – Hindi / Marathi / English**
* 🧠 **Conversational AI powered by Gemini**
* 🔐 **Secure API keys via environment variables**

---

## 🧠 How It Works (Architecture)

```
User Voice Input
       ↓
ASR (Deepgram / AssemblyAI) → Speech to Text
       ↓
Gemini AI → Understands Query & Generates Response
       ↓
Murf Falcon TTS → Text to Natural Voice Output
       ↓
Real-Time Audio Response to User
```

---

## 🛠 Tech Stack

| Component            | Technology                   |
| -------------------- | ---------------------------- |
| Frontend             | HTML, CSS, JavaScript        |
| Backend              | PHP                          |
| ASR (Speech-to-Text) | Deepgram / AssemblyAI        |
| AI Model             | Gemini                       |
| Text-to-Speech       | **Murf Falcon TTS API**      |
| Key Management       | Environment Variables (.env) |

---

## 🎥 Demo Video

🔗 **Watch the working demo:**
[https://youtu.be/-n4GwpPkfb8](https://youtu.be/-n4GwpPkfb8) *(replace if updated)*

---

## 💻 GitHub Repository Instructions

### 📦 Installation & Setup

#### **Clone Repository**

```bash
git clone https://github.com/tejas-52/farming_system.git
cd farming_system
```

#### **Environment Variables**

Create a `.env` file in project root:

```
MURF_API_KEY=your_murf_falcon_key
ASR_API_KEY=your_asr_key
GEMINI_API_KEY=your_gemini_key
```

#### **Run Backend**

Place files under a local PHP server environment or platform supporting PHP (XAMPP, WAMP, InfinityFree, etc.)

#### **Open Frontend**

Open the main HTML file in browser and allow microphone access.

---

## 🤖 Example Interaction

👨‍🌾 **User:**
“सोयाबीन के लिए कौनसी खाद अच्छी रहती है?”

🤖 **Kisan Sathi (Bot Response):**
“सोयाबीन के लिए NPK 12:32:16 बोआई के समय लगभग 50 किलो प्रति एकड़ उपयोग किया जा सकता है।”

---

## 🧪 Features Demonstrated for Hackathon Requirements

| Requirement                            | Status |
| -------------------------------------- | ------ |
| Voice-based conversational interaction | ✔      |
| ASR integrated                         | ✔      |
| Real-time TTS via Murf Falcon          | ✔      |
| Secure API key handling                | ✔      |
| Working prototype                      | ✔      |
| Demo video                             | ✔      |
| GitHub with README                     | ✔      |
| LinkedIn post tagging Murf AI          | ✔      |

---

## 🔗 LinkedIn Post

[https://www.linkedin.com/posts/tejas-jagdale-030a6b270_kisansathi-agritech-voiceai-activity-7402773659288928257-Zex5](https://www.linkedin.com/posts/tejas-jagdale-030a6b270_kisansathi-agritech-voiceai-activity-7402773659288928257-Zex5)

---

## 📌 Primary Use Case Category

**Voice-Based Agricultural Support Assistant**

---

## 🥇 About Techfest Hackathon

This project is submitted for **Techfest 2025-26 – Murf Voice Agent Hackathon (Round 1 Submission).**
Shortlisted teams will present live at IIT Bombay.

---

## 👥 Team

| Name              | Role                             |
| ----------------- | -------------------------------- |
| **Tejas Jagdale** | Developer & Voice AI Integration |

---

## ✨ Future Scope

* Live crop market price integration
* Offline mode for rural low-network areas
* WhatsApp chatbot integration
* Multi-regional language expansion

---

## 💬 Support & Feedback

For collaboration or feedback, connect on:
📨 **Email:** [tejasjagdale50@gmail.com](mailto:tejasjagdale50@gmail.com)

---

## ⭐ If you like this project

Please **Star** ⭐ the repository and support by sharing!

---

### **Kisan Sathi — Empowering farmers with the power of Voice AI.**

### **Built using Murf Falcon – the consistently fastest TTS API.** 🚀

---

