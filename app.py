from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta
import random
import sqlite3
from pathlib import Path

BASE = Path(__file__).resolve().parent
DB = BASE / "energy_monitor.db"

app = Flask(__name__)

# --------------------------------------------------
# VIRTUAL IoT DEVICES
# --------------------------------------------------

DEVICES = {
    "Living Room Lights": {
        "base": 0.04,
        "max": 0.20,
        "icon": "☼"
    },
    "Ceiling Fan": {
        "base": 0.05,
        "max": 0.12,
        "icon": "◌"
    },
    "Air Conditioner": {
        "base": 0.35,
        "max": 1.50,
        "icon": "❄"
    },
    "Computer": {
        "base": 0.18,
        "max": 0.35,
        "icon": "▣"
    },
    "Refrigerator": {
        "base": 0.12,
        "max": 0.25,
        "icon": "◇"
    }
}

# Current ON/OFF state of virtual devices
DEVICE_STATE = {
    name: True for name in DEVICES
}

# --------------------------------------------------
# DATABASE
# --------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT,
            event_type TEXT,
            message TEXT
        )
    """)

    conn.commit()
    conn.close()


def log_event(event_type, message):
    conn = get_db()

    conn.execute(
        """
        INSERT INTO events(created_at, event_type, message)
        VALUES (?, ?, ?)
        """,
        (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            event_type,
            message
        )
    )

    conn.commit()
    conn.close()


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# --------------------------------------------------
# DEVICE STATUS
# --------------------------------------------------

@app.get("/api/status")
def status():

    readings = {}
    total = 0.0

    for name, info in DEVICES.items():

        if DEVICE_STATE[name]:

            load = round(
                random.uniform(
                    info["base"] * 0.8,
                    info["max"]
                ),
                2
            )

            state = "ON"

        else:

            load = 0.00
            state = "OFF"

        readings[name] = {
            "power_kw": load,
            "status": state,
            "icon": info["icon"]
        }

        total += load

    total = round(total, 2)

    daily = round(
        total * random.uniform(3.5, 5.2),
        2
    )

    cost = round(daily * 8, 2)

    efficiency = round(
        random.uniform(88, 96),
        1
    )

    saving = round(
        random.uniform(12, 28),
        1
    )

    return jsonify({
        "devices": readings,
        "total_kw": total,
        "daily_kwh": daily,
        "estimated_cost": cost,
        "efficiency": efficiency,
        "saving": saving,
        "updated": datetime.now().strftime("%H:%M:%S")
    })


# --------------------------------------------------
# DEVICE CONTROL
# --------------------------------------------------

@app.post("/api/control")
def control():

    data = request.get_json(silent=True) or {}

    device = data.get("device")
    action = data.get("action")

    if device not in DEVICES:
        return jsonify({
            "ok": False,
            "error": "Invalid device"
        }), 400

    if action not in {"on", "off"}:
        return jsonify({
            "ok": False,
            "error": "Invalid action"
        }), 400

    DEVICE_STATE[device] = action == "on"

    message = (
        f"{device} switched "
        f"{action.upper()} by dashboard control."
    )

    log_event("CONTROL", message)

    return jsonify({
        "ok": True,
        "message": message
    })


# --------------------------------------------------
# SIMULATE EVENT
# --------------------------------------------------

@app.post("/api/simulate")
def simulate():

    event = random.choice([
        (
            "ALERT",
            "Air Conditioner load exceeded its normal operating band."
        ),
        (
            "INFO",
            "Energy-saving mode reduced simulated lighting demand."
        ),
        (
            "SUCCESS",
            "Daily optimisation cycle completed successfully."
        ),
        (
            "INFO",
            "Computer workload decreased. Power demand is falling."
        ),
        (
            "WARNING",
            "Refrigerator compressor is drawing slightly above baseline."
        ),
        (
            "ALERT",
            "Peak power demand detected across virtual nodes."
        ),
        (
            "SUCCESS",
            "All virtual IoT nodes responded successfully."
        )
    ])

    log_event(*event)

    return jsonify({
        "ok": True,
        "message": event[1]
    })


# --------------------------------------------------
# EVENTS
# --------------------------------------------------

@app.get("/api/events")
def events():

    conn = get_db()

    rows = conn.execute(
        """
        SELECT created_at, event_type, message
        FROM events
        ORDER BY id DESC
        LIMIT 50
        """
    ).fetchall()

    conn.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


# --------------------------------------------------
# CLEAR EVENTS
# --------------------------------------------------

@app.post("/api/events/clear")
def clear_events():

    conn = get_db()

    conn.execute("DELETE FROM events")

    conn.commit()
    conn.close()

    log_event(
        "SYSTEM",
        "Event history was cleared from the dashboard."
    )

    return jsonify({
        "ok": True
    })


# --------------------------------------------------
# CONSUMPTION TRENDS
# --------------------------------------------------

@app.get("/api/trends")
def trends():

    today = datetime.now()

    days = []
    energy = []
    costs = []

    base_energy = random.uniform(3.2, 5.8)

    for i in range(6, -1, -1):

        date = today - timedelta(days=i)

        value = round(
            base_energy * random.uniform(0.75, 1.25),
            2
        )

        days.append(date.strftime("%a"))
        energy.append(value)
        costs.append(round(value * 8, 2))

    return jsonify({
        "days": days,
        "energy": energy,
        "costs": costs,
        "average": round(sum(energy) / len(energy), 2),
        "peak": round(max(energy), 2),
        "weekly": round(sum(energy), 2)
    })


# --------------------------------------------------
# START
# --------------------------------------------------

init_db()

if __name__ == "__main__":
    app.run(debug=False)