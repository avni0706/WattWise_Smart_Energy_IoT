/* =====================================================
   WATTWISE SMART ENERGY
   Frontend Controller
===================================================== */


/* =====================================================
   HELPERS
===================================================== */

const $ = id => document.getElementById(id);


/* =====================================================
   DEVICE ICONS
===================================================== */

const icons = {

    "Living Room Lights": "☼",

    "Ceiling Fan": "◌",

    "Air Conditioner": "❄",

    "Computer": "▣",

    "Refrigerator": "◇"

};


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    const clock = $("clock");

    if (clock) {

        clock.textContent =
            new Date().toLocaleTimeString([], {
                hour12: false
            });

    }

}

setInterval(updateClock, 1000);

updateClock();


/* =====================================================
   NAVIGATION
===================================================== */

const navLinks =
    document.querySelectorAll(".nav-link");

const pages =
    document.querySelectorAll(".page");


function showPage(pageName) {

    /* Hide all pages */

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    /* Show selected page */

    const selected =
        document.getElementById(
            "page-" + pageName
        );

    if (selected) {

        selected.classList.add(
            "active-page"
        );

    }


    /* Update active sidebar item */

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.dataset.page === pageName
        ) {

            link.classList.add("active");

        }

    });


    /* Load page-specific content */

    if (pageName === "devices") {

        loadDeviceMonitor();

    }


    if (pageName === "trends") {

        loadTrendPage();

    }


    if (pageName === "events") {

        loadFullEvents();

    }

}


/* Attach navigation */

navLinks.forEach(link => {

    link.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            showPage(
                this.dataset.page
            );

        }
    );

});


/* =====================================================
   OVERVIEW POWER CHART
===================================================== */

let powerChart = null;


function createPowerChart() {

    const canvas =
        $("powerChart");

    if (!canvas) return;


    powerChart =
        new Chart(canvas, {

            type: "line",

            data: {

                labels: [],

                datasets: [{

                    data: [],

                    borderColor:
                        "#59e7ff",

                    backgroundColor:
                        "rgba(89,231,255,.07)",

                    fill: true,

                    tension: .42,

                    borderWidth: 2,

                    pointRadius: 2,

                    pointBackgroundColor:
                        "#a8ff78"

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    x: {

                        grid: {
                            color:
                                "rgba(255,255,255,.035)"
                        },

                        ticks: {

                            color: "#5d7188",

                            font: {
                                size: 8
                            }

                        }

                    },

                    y: {

                        beginAtZero: true,

                        grid: {
                            color:
                                "rgba(255,255,255,.035)"
                        },

                        ticks: {

                            color: "#5d7188",

                            font: {
                                size: 8
                            }

                        }

                    }

                }

            }

        });

}


createPowerChart();


/* =====================================================
   TREND CHARTS
===================================================== */

let trendPowerChart = null;

let deviceChart = null;


function createTrendCharts() {

    const powerCanvas =
        $("trendPowerChart");

    const deviceCanvas =
        $("deviceChart");


    /* Power trend chart */

    if (
        powerCanvas &&
        !trendPowerChart
    ) {

        trendPowerChart =
            new Chart(powerCanvas, {

                type: "line",

                data: {

                    labels: [],

                    datasets: [{

                        label:
                            "Power Demand",

                        data: [],

                        borderColor:
                            "#59e7ff",

                        backgroundColor:
                            "rgba(89,231,255,.08)",

                        fill: true,

                        tension: .4,

                        borderWidth: 2,

                        pointRadius: 3

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            });

    }


    /* Device consumption chart */

    if (
        deviceCanvas &&
        !deviceChart
    ) {

        deviceChart =
            new Chart(deviceCanvas, {

                type: "bar",

                data: {

                    labels: [],

                    datasets: [{

                        label:
                            "Power (kW)",

                        data: [],

                        backgroundColor:
                            "rgba(89,231,255,.45)",

                        borderColor:
                            "#59e7ff",

                        borderWidth: 1,

                        borderRadius: 5

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            ticks: {
                                color: "#71869d"
                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color: "#71869d"
                            }

                        }

                    }

                }

            });

    }

}


/* =====================================================
   GLOBAL DATA
===================================================== */

let latestData = null;


/* =====================================================
   REFRESH MAIN STATUS
===================================================== */

async function refresh() {

    try {

        const response =
            await fetch(
                "/api/status"
            );


        const data =
            await response.json();


        latestData = data;


        /* -----------------------------
           Main statistics
        ----------------------------- */

        if ($("totalKw")) {

            $("totalKw").textContent =
                data.total_kw;

        }


        if ($("dailyKwh")) {

            $("dailyKwh").textContent =
                data.daily_kwh;

        }


        if ($("cost")) {

            $("cost").textContent =
                "₹" +
                data.estimated_cost;

        }


        if ($("efficiency")) {

            $("efficiency").textContent =
                data.efficiency +
                "%";

        }


        if ($("saving")) {

            $("saving").textContent =
                data.saving +
                "%";

        }


        /* Energy progress bar */

        if ($("energyBar")) {

            $("energyBar").style.width =
                Math.min(
                    100,
                    data.daily_kwh * 7
                ) +
                "%";

        }


        /* -----------------------------
           Overview chart
        ----------------------------- */

        if (powerChart) {

            powerChart.data.labels.push(
                data.updated
            );


            powerChart.data.datasets[0]
                .data.push(
                    data.total_kw
                );


            if (
                powerChart.data.labels.length
                > 12
            ) {

                powerChart.data.labels.shift();

                powerChart.data.datasets[0]
                    .data.shift();

            }


            powerChart.update(
                "none"
            );

        }


        /* -----------------------------
           Device list
        ----------------------------- */

        renderOverviewDevices(
            data.devices
        );


        /* -----------------------------
           Trend page
        ----------------------------- */

        updateTrendPage(
            data
        );

    }

    catch (error) {

        console.error(
            "Status error:",
            error
        );

    }

}


/* =====================================================
   OVERVIEW DEVICE LIST
===================================================== */

function renderOverviewDevices(
    devices
) {

    const container =
        $("devices");


    if (!container) return;


    container.innerHTML =
        Object.entries(devices)

        .map(
            ([name, data]) => `

                <div class="device">

                    <div>

                        <div class="device-name">

                            ${icons[name] || "•"}

                            &nbsp;

                            ${name}

                        </div>

                        <div class="device-sub">

                            ${
                                data.status === "ON"
                                ? "Active load"
                                : "Low-power idle"
                            }

                        </div>

                    </div>

                    <div class="device-right">

                        <b>
                            ${data.power_kw} kW
                        </b>

                        <small>
                            ${data.status}
                        </small>

                    </div>

                </div>

            `
        )

        .join("");

}


/* =====================================================
   DEVICE MONITOR PAGE
===================================================== */

function loadDeviceMonitor() {

    if (!latestData) return;


    const grid =
        $("deviceGrid");


    if (!grid) return;


    grid.innerHTML =
        Object.entries(
            latestData.devices
        )

        .map(
            ([name, data]) => `

                <div class="big-device-card">

                    <div class="big-device-icon">

                        ${icons[name] || "•"}

                    </div>


                    <div class="big-device-info">

                        <h3>
                            ${name}
                        </h3>

                        <p>
                            Virtual IoT Energy Node
                        </p>

                    </div>


                    <div class="device-power">

                        <strong>
                            ${data.power_kw}
                        </strong>

                        <span>
                            kW
                        </span>

                        <div class="
                            device-status
                            ${
                                data.status === "ON"
                                ? "on"
                                : "off"
                            }
                        ">

                            ● ${data.status}

                        </div>

                    </div>


                    <div class="device-controls">

                        <button
                            class="device-on"
                            onclick="controlDevice(
                                '${name}',
                                'on'
                            )">

                            TURN ON

                        </button>


                        <button
                            class="device-off"
                            onclick="controlDevice(
                                '${name}',
                                'off'
                            )">

                            TURN OFF

                        </button>

                    </div>

                </div>

            `
        )

        .join("");

}


/* =====================================================
   DEVICE CONTROL
===================================================== */

async function controlDevice(
    device,
    action
) {

    try {

        const response =
            await fetch(
                "/api/control",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        device:
                            device,

                        action:
                            action

                    })

                }
            );


        const result =
            await response.json();


        if (result.ok) {

            /*
             * NEW CUSTOM POPUP
             * instead of browser alert()
             */

            showDeviceToast(
                device,
                action
            );


            await loadEvents();

            await refresh();

            loadDeviceMonitor();

        }

    }

    catch (error) {

        console.error(
            "Device control error:",
            error
        );

    }

}


/* =====================================================
   CUSTOM DEVICE POPUP
===================================================== */

function showDeviceToast(
    device,
    action
) {

    /* Remove existing popup */

    const oldToast =
        document.querySelector(
            ".device-toast"
        );


    if (oldToast) {

        oldToast.remove();

    }


    /* Determine state */

    const isOn =
        action.toLowerCase() === "on";


    /* Device icon */

    const icon =
        icons[device] || "◉";


    /* Message */

    const statusText =
        isOn
            ? "Device switched ON successfully."
            : "Device switched OFF successfully.";


    /* Status label */

    const statusLabel =
        isOn
            ? "SYSTEM ONLINE"
            : "SYSTEM STANDBY";


    /* Create popup */

    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "device-toast";


    /* Popup contents */

    toast.innerHTML = `

        <div class="toast-glow"></div>


        <div class="toast-icon">

            ${icon}

        </div>


        <div class="toast-content">

            <div class="toast-label">

                DEVICE UPDATED

            </div>


            <div class="toast-title">

                ${device}

            </div>


            <div class="toast-message">

                ${statusText}

            </div>


            <div class="toast-status">

                <span class="
                    ${isOn
                        ? "online"
                        : "standby"}
                ">

                    ●

                </span>

                ${statusLabel}

            </div>

        </div>


        <button
            class="toast-close"
            onclick="
                this.parentElement.remove()
            ">

            ×

        </button>

    `;


    /* Add to page */

    document.body.appendChild(
        toast
    );


    /* Animate popup in */

    requestAnimationFrame(
        () => {

            toast.classList.add(
                "toast-visible"
            );

        }
    );


    /* Automatically disappear */

    setTimeout(
        () => {

            toast.classList.remove(
                "toast-visible"
            );


            setTimeout(
                () => {

                    if (
                        toast.parentElement
                    ) {

                        toast.remove();

                    }

                },
                400
            );

        },
        3500
    );

}


/* =====================================================
   CONSUMPTION TRENDS
===================================================== */

function loadTrendPage() {

    createTrendCharts();

    updateTrendPage(
        latestData
    );

}


function updateTrendPage(
    data
) {

    if (!data) return;


    /* Statistics */

    if ($("trendLoad")) {

        $("trendLoad").textContent =
            data.total_kw;

    }


    if ($("trendEnergy")) {

        $("trendEnergy").textContent =
            data.daily_kwh;

    }


    if ($("trendCost")) {

        $("trendCost").textContent =
            "₹" +
            data.estimated_cost;

    }


    createTrendCharts();


    /* Power demand chart */

    if (trendPowerChart) {

        const labels =
            trendPowerChart
                .data
                .labels;


        const values =
            trendPowerChart
                .data
                .datasets[0]
                .data;


        labels.push(
            data.updated
        );


        values.push(
            data.total_kw
        );


        if (labels.length > 20) {

            labels.shift();

            values.shift();

        }


        trendPowerChart.update(
            "none"
        );

    }


    /* Device chart */

    if (deviceChart) {

        deviceChart.data.labels =
            Object.keys(
                data.devices
            );


        deviceChart
            .data
            .datasets[0]
            .data =
            Object.values(
                data.devices
            )
            .map(
                x => x.power_kw
            );


        deviceChart.update(
            "none"
        );

    }

}


/* =====================================================
   EVENTS
===================================================== */

async function loadEvents() {

    try {

        const response =
            await fetch(
                "/api/events"
            );


        const rows =
            await response.json();


        const container =
            $("events");


        if (!container) return;


        if (!rows.length) {

            container.innerHTML = `

                <div class="event">

                    <i class="event-dot"></i>

                    <div>

                        <b>
                            READY
                        </b>

                        <p>
                            Waiting for the first
                            intelligence event.
                        </p>

                    </div>

                </div>

            `;

            return;

        }


        container.innerHTML =
            rows
                .map(eventHTML)
                .join("");

    }

    catch (error) {

        console.error(
            "Event error:",
            error
        );

    }

}


/* =====================================================
   EVENT HTML
===================================================== */

function eventHTML(x) {

    return `

        <div class="
            event
            ${x.event_type.toLowerCase()}
        ">

            <i class="event-dot"></i>


            <div>

                <b>
                    ${x.event_type}
                </b>


                <p>
                    ${x.message}
                </p>


                <time>
                    ${x.created_at}
                </time>

            </div>

        </div>

    `;

}


/* =====================================================
   FULL EVENTS PAGE
===================================================== */

async function loadFullEvents() {

    try {

        const response =
            await fetch(
                "/api/events"
            );


        const rows =
            await response.json();


        const container =
            $("fullEventList");


        if (!container) return;


        if (!rows.length) {

            container.innerHTML = `

                <div class="empty-state">

                    No events recorded yet.

                </div>

            `;

            return;

        }


        container.innerHTML =
            rows
                .map(
                    x => `

                        <div class="
                            full-event
                        ">

                            <div
                                class="
                                full-event-type
                                "
                            >

                                <span class="
                                    ${eventTypeClass(
                                        x.event_type
                                    )}
                                ">

                                    ${x.event_type}

                                </span>

                            </div>


                            <div
                                class="
                                full-event-message
                                "
                            >

                                <strong>

                                    ${x.message}

                                </strong>


                                <small>

                                    ${x.created_at}

                                </small>

                            </div>

                        </div>

                    `
                )

                .join("");

    }

    catch (error) {

        console.error(
            "Full event error:",
            error
        );

    }

}


/* =====================================================
   EVENT TYPE COLORS
===================================================== */

function eventTypeClass(
    type
) {

    const map = {

        "ALERT":
            "event-type-alert",

        "WARNING":
            "event-type-warning",

        "CONTROL":
            "event-type-control",

        "SUCCESS":
            "event-type-success",

        "INFO":
            "event-type-info"

    };


    return map[type]
        || "event-type-system";

}


/* =====================================================
   GENERATE SIMULATED EVENT
===================================================== */

async function simulateEvent() {

    try {

        await fetch(
            "/api/simulate",
            {

                method: "POST"

            }
        );


        await loadEvents();

        await loadFullEvents();

    }

    catch (error) {

        console.error(
            "Simulation error:",
            error
        );

    }

}


/* =====================================================
   CLEAR EVENT DISPLAY
===================================================== */

function clearEventDisplay() {

    const container =
        $("fullEventList");


    if (!container) return;


    container.innerHTML = `

        <div class="empty-state">

            Event display cleared.

            <br><br>

            New system events will appear
            automatically.

        </div>

    `;

}


/* =====================================================
   INITIAL LOAD
===================================================== */

refresh();

loadEvents();

loadFullEvents();


/* =====================================================
   AUTO REFRESH
===================================================== */

setInterval(
    refresh,
    3000
);


setInterval(
    loadEvents,
    6000
);


setInterval(
    () => {

        const activePage =
            document.querySelector(
                ".nav-link.active"
            );


        if (
            activePage &&
            activePage.dataset.page ===
            "events"
        ) {

            loadFullEvents();

        }

    },
    6000
);