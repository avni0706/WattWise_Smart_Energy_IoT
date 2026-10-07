# WattWise - IoT-Based Smart Energy Consumption Monitoring System

Software-only IoT mini project for VS Code using Python + Flask.

## Hardware
NONE. Sensor/device readings are simulated in Python.

## Run
Open this folder in VS Code, then:

    python -m pip install -r requirements.txt
    python app.py

Open:

    http://127.0.0.1:5000

Keep the terminal running while using the dashboard.

## Features
- Live simulated energy readings
- Five virtual IoT devices
- Current power demand
- Daily energy consumption
- Estimated electricity cost
- Efficiency and estimated saving
- Live graph
- Device monitor
- Event/alert stream
- SQLite event logging
- Responsive dashboard
- IoT architecture visualization

## Viva
"This is a software-based IoT prototype for smart energy monitoring. In a hardware deployment, smart meters or sensors would collect electricity data. In this prototype, Python simulates those IoT readings. Flask exposes the readings through API endpoints, and the dashboard visualizes demand, consumption, cost, efficiency and alerts."

The displayed values are simulated and are not measurements from real electrical devices.
