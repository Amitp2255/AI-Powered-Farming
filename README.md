# 🌾 Kisan Sathi – AI Powered Smart Farming Advisory System

### *A Bridge Between Farmers and Technology*

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/project-status-active-blue)
![Domain](https://img.shields.io/badge/domain-AgriTech-orange)
![Tech](https://img.shields.io/badge/tech-AI%20%7C%20IoT%20%7C%20Web%20%7C%20Mobile-brightgreen)

**Kisan Sathi** is an AI-powered Smart Crop & Multi-Farming Advisory Platform designed to help farmers make **data-driven agricultural decisions**.

The system supports **small and marginal farmers** by providing intelligent guidance across the entire farming lifecycle — from crop planning to selling produce.

Kisan Sathi combines **Artificial Intelligence, IoT-based field monitoring, environmental intelligence, and smart advisory systems** to create a digital bridge between farmers and modern technology.

---

# 🚜 Problem Statement

Farmers often face several major challenges:

* Guesswork-based farming decisions
* Lack of real-time soil and field intelligence
* Overuse of fertilizers and water
* Crop loss due to pests and unpredictable weather
* Lack of reliable market insights
* Language and literacy barriers
* Fragmented agricultural information sources

These problems result in **lower productivity, higher costs, and unstable income for farmers**.

---

# 💡 Our Solution

Kisan Sathi provides a **Smart Farming Decision Support System** that works in two modes:

### Mode 1 – Software Only

Accessible to any farmer with a smartphone.

### Mode 2 – Software + IoT Precision Farming

Uses field sensors and automation for **data-driven irrigation and crop monitoring**.

The platform supports the entire agricultural lifecycle:

Planning → Growing → Protecting → Harvesting → Selling

---

# 🌱 Core Features

## 👨‍🌾 Farmer Profiling

During onboarding the system captures:

* GPS-based location
* Land size
* Soil type
* Water availability
* Previous farming history
* Preferred language
* Selected farming type

This information becomes the **base intelligence layer for AI recommendations**.

---

## 🌾 Multi-Farming Support

The platform supports multiple agricultural domains:

* Crop Farming
* Horticulture (Fruits & Vegetables)
* Floriculture (Flowers)
* Viticulture (Grapes)
* Aquaculture
* Pisciculture (Fish Farming)
* Apiculture (Beekeeping)
* Sericulture (Silkworm Farming)

Each farming domain has **independent advisory logic, disease models, and market insights**.

---

## 🤖 AI Smart Advisory Engine

The AI advisory engine analyzes:

* Farmer profile
* Farming type
* Environmental conditions
* Historical agricultural knowledge
* IoT sensor data (when available)

It generates **simple, actionable recommendations** including:

* Crop recommendations
* Fertilizer guidance
* Irrigation advice
* Pest and disease alerts
* Profit-oriented farming suggestions

---

## 🗣 Voice-Based Multilingual Assistant

The platform includes a **voice-first AI assistant** designed for farmers with low literacy.

Farmers can:

* Speak in their local language
* Receive responses in voice and text
* Interact with the system easily

Supported languages currently include:

* Hindi
* English

---

## 📷 AI Pest & Disease Detection

Farmers can upload crop or leaf images.

The AI vision system detects:

* Plant diseases
* Pest infestations
* Nutrient deficiencies

The system provides:

* Problem identification
* Cause explanation
* Organic and chemical solutions
* Recommended dosage and timing

---

## 🌦 Environmental Intelligence

The platform analyzes environmental signals such as:

* Temperature
* Humidity
* Rain conditions
* Wind patterns

These signals are converted into practical guidance such as:

* Irrigation timing suggestions
* Spray safety alerts
* Harvest planning recommendations

All insights are presented in **simple farmer-friendly language**.

---

# 🌐 IoT Precision Farming Module

The optional IoT system provides **real-time field intelligence**.

## IoT Controller

An **ESP32 microcontroller** acts as the central system controller.

Functions include:

* Collecting sensor data
* Sending data to the cloud system
* Controlling irrigation automation
* Supporting smart advisory decisions

---

## 🔌 Sensors Used

### Soil Sensors

* Capacitive Soil Moisture Sensor
* Soil pH Sensor
* NPK Sensor

### Climate Sensors

* DHT22 Temperature & Humidity Sensor
* Rain Sensor

### Actuation

* Relay Module
* Water Pump

Supporting components include:

* MAX485 RS485-TTL Converter
* Flyback diode
* Capacitors and resistors
* Status LEDs
* Power supply modules

---

# 🔄 IoT Data Flow

Sensors → ESP32 Controller → Cloud Database → AI Advisory Engine → Farmer Mobile App

---

# ⚙ Automation Example

Example irrigation automation logic:

Soil Moisture Low → Pump ON
Soil Moisture Adequate → Pump OFF
Rain Detected → Irrigation Disabled

This automation helps reduce:

* Water usage
* Electricity consumption
* Manual labor

---

# 🧠 Technology Stack

## Frontend

* React (Web)
* React Native (Mobile)
* TypeScript
* Tailwind CSS / Material UI

## Backend

* Node.js
* Express.js

## Database

* Firebase / Firestore
* PostgreSQL

## AI Modules

* Computer Vision (Disease Detection)
* Smart Advisory Decision Engine
* Environmental Analysis Models

---

# 📊 Expected Impact

Kisan Sathi aims to achieve:

🌾 20–30% increase in crop yield
💰 25–30% reduction in input costs
💧 Reduced water and fertilizer waste
📈 Improved farmer income stability
🌱 Promotion of sustainable agriculture

---

# 🚀 Project Roadmap

Phase 1 – System Design
✔ Architecture Planning
✔ Feature Definition

Phase 2 – Prototype Development
⏳ Mobile App Development
⏳ IoT Sensor Integration

Phase 3 – AI Implementation
⏳ Pest & Disease Detection Model
⏳ Smart Advisory Engine

Phase 4 – Field Testing
⏳ Pilot deployment with farmers

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 🤝 Contributors

Developed as part of an **AgriTech innovation project / hackathon** focused on building scalable technology solutions for farmers.

---

# 🌍 Vision

To create a **digital bridge between farmers and modern agricultural technology**, enabling smarter decisions, higher productivity, and sustainable rural development.
