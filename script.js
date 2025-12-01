//------------------------------------------------------
// KONFIGURATION DER RÄUME UND AUFGABEN
//------------------------------------------------------
// Debug: log to detect whether the script runs on devices/browsers
console.log("script.js loaded");
const ROOMS = {
    "Flur oben": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ],
    "Badezimmer": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" },
        { name: "WC reinigen" },
        { name: "Waschbecken reinigen" },
        { name: "Dusche reinigen" }
    ],
    "Kleiderraum": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" },
        { name: "Kleider sortieren" }
    ],
    "Schlafzimmer": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" },
        { name: "Bettwäsche wechseln" }
    ],
    "Büro Kevin": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ],
    "Büro Laura": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ],
    "Eingangsbereich": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ],
    "Gäste WC": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ],
    "Abstellraum": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Wäsche machen" },
        { name: "Oberflächen abwischen" }
    ],
    "Wohnzimmer": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ],
    "Küche": [
        { name: "Saugen" },
        { name: "Wischen" },
        { name: "Oberflächen abwischen" }
    ]
};

//------------------------------------------------------
// DATUMSFORMATIERUNG
//------------------------------------------------------
function formatDate(d) {
    return String(d.getDate()).padStart(2, "0") + "/" +
           String(d.getMonth() + 1).padStart(2, "0") + "/" +
           d.getFullYear();
}

function formatTime(d) {
    return String(d.getHours()).padStart(2, "0") + ":" +
           String(d.getMinutes()).padStart(2, "0");
}

//------------------------------------------------------
// LOKALER SPEICHER
//------------------------------------------------------
function getData() {
    return JSON.parse(localStorage.getItem("cleaningData") || "{}");
}

function saveData(data) {
    localStorage.setItem("cleaningData", JSON.stringify(data));
}

//------------------------------------------------------
// INITIALISIERUNG DER DATENSTRUKTUR
//------------------------------------------------------
function ensureRoomStructure(room) {
    const data = getData();
    if (!data[room]) data[room] = {};

    for (const task of ROOMS[room]) {
        if (!data[room][task.name]) {
            data[room][task.name] = {
                done: false,
                timestamp: null,
                lastReset: null,
                intervalDays: 1
            };
        }
    }

    saveData(data);
}

//------------------------------------------------------
// SEITE: RÄUME
//------------------------------------------------------
function loadRooms() {
    const list = document.getElementById("roomList");
    if (!list) return;

    const data = getData();
    list.innerHTML = "";

    for (const room of Object.keys(ROOMS)) {

        ensureRoomStructure(room);

        const tasks = ROOMS[room];
        const roomData = data[room];

        // Avoid optional chaining for broader browser compatibility (older Android WebView)
        const allDone = tasks.every(function(t) {
            return roomData[t.name] && roomData[t.name].done === true;
        });

        const div = document.createElement("div");
        div.classList.add("room");
        if (allDone) div.classList.add("done");

        div.textContent = room;

        div.onclick = () => {
            sessionStorage.setItem("room", room);
            window.location.href = "room.html";
        };

        list.appendChild(div);
    }
}

//------------------------------------------------------
// SEITE: RAUMDETAILS
//------------------------------------------------------
function loadRoom() {
    const title = document.getElementById("roomTitle");
    const container = document.getElementById("taskContainer");
    if (!title || !container) return;

    const room = sessionStorage.getItem("room");
    if (!room) return;

    title.textContent = room;
    ensureRoomStructure(room);

    const data = getData();
    const tasks = ROOMS[room];

    container.innerHTML = "";

    tasks.forEach(taskObj => {
        const entry = data[room][taskObj.name];

        const wrapper = document.createElement("div");
        wrapper.classList.add("task");
        if (entry.done) wrapper.classList.add("done");

        const left = document.createElement("div");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = entry.done;

        const label = document.createElement("span");
        label.textContent = taskObj.name;

        left.appendChild(checkbox);
        left.appendChild(label);

        const right = document.createElement("div");

        if (entry.timestamp) {
            const small = document.createElement("small");
            small.textContent = "Erledigt: " + entry.timestamp;
            right.appendChild(small);
        }

        const select = document.createElement("select");
        [1,2,3,5,7,14,30].forEach(d => {
            const opt = document.createElement("option");
            opt.value = d;
            opt.textContent = `Alle ${d} Tage`;
            if (entry.intervalDays === d) opt.selected = true;
            select.appendChild(opt);
        });

        select.onchange = () => {
            entry.intervalDays = Number(select.value);
            saveData(data);
        };

        right.appendChild(select);

        wrapper.appendChild(left);
        wrapper.appendChild(right);

        checkbox.onchange = () => {
            entry.done = checkbox.checked;

            if (entry.done) {
                const now = new Date();
                entry.timestamp = formatDate(now) + " - " + formatTime(now);
                entry.lastReset = Date.now();
                wrapper.classList.add("done");

            } else {
                entry.timestamp = null;
                wrapper.classList.remove("done");
            }

            data[room][taskObj.name] = entry;
            saveData(data);

            right.innerHTML = "";
            if (entry.timestamp) {
                const small = document.createElement("small");
                small.textContent = "Erledigt: " + entry.timestamp;
                right.appendChild(small);
            }
            right.appendChild(select);
        };

        container.appendChild(wrapper);
    });
}

//------------------------------------------------------
// DATUM OBEN RECHTS
//------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const dateBox = document.getElementById("currentDate");
    if (dateBox) dateBox.textContent = formatDate(new Date());

    // Nur loadRooms() auf Index.html aufrufen
    if (document.getElementById("roomList")) {
        loadRooms();
    }
    
    // Nur loadRoom() auf room.html aufrufen
    if (document.getElementById("taskContainer")) {
        loadRoom();
    }
});
