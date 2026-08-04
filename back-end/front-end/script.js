// ==============================
// Elements
// ==============================

const form = document.getElementById("clientForm");

const addTab = document.getElementById("addTab");
const listTab = document.getElementById("listTab");

const addSection = document.getElementById("addClientSection");
const listSection = document.getElementById("listClientSection");

const searchInput = document.getElementById("searchInput");

// ==============================
// Form Elements
// ==============================

const travail = document.getElementById("travail");
const description = document.getElementById("description");

const phoneCheck = document.getElementById("phoneCheck");
const whatsappCheck = document.getElementById("whatsappCheck");
const facebookCheck = document.getElementById("facebookCheck");
const instagramCheck = document.getElementById("instagramCheck");
const snapCheck = document.getElementById("snapCheck");
const tiktokCheck = document.getElementById("tiktokCheck");
const reservationCheck = document.getElementById("reservCheck");
const reservationDeQuoi = document.getElementById("reservDeQuoi");
const reservationQuand = document.getElementById("reservQuand");

let reminderDatetime = null;

const floatingReminderBtn = document.getElementById("floatingReminderBtn");
const reminderModal = document.getElementById("reminderModal");
const reminderDateTimeInput = document.getElementById("reminderDateTime");
const cancelReminderBtn = document.getElementById("cancelReminderBtn");
const saveReminderBtn = document.getElementById("saveReminderBtn");


// ==============================
// Global Variables
// ==============================

let clients = [];
let editingClientId = null;

let currentPage = 1;
let currentSearch = "";
const PAGE_SIZE = 50;

//helper funcs 

function parseDateValue(dateString) {

    if (!dateString) return null;

    if (dateString instanceof Date) {
        return dateString;
    }

    if (typeof dateString !== "string") {
        return null;
    }

    const trimmed = dateString.trim();
    const direct = new Date(trimmed.replace(" ", "T"));

    if (!Number.isNaN(direct.getTime())) {
        return direct;
    }

    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

    if (!match) {
        return null;
    }

    const [, year, month, day, hour, minute, second = "00"] = match;

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
    );

}

function formatDate(dateString) {

    if (!dateString) return "-";

    const date = parseDateValue(dateString);

    if (!date) return "-";

    const jj = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${jj}.${mm}.${yyyy} ${hh}:${min}`;

}

function formatReminder(dateTimeString) {

    if (!dateTimeString) return "-";

    const date = parseDateValue(dateTimeString);

    if (!date) return "-";

    const jj = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${jj}.${mm}.${yyyy} ${hh}:${min}`;

}

// ==============================
// Display Clients
// ==============================


function displayClients(clientList) {

    const table = document.getElementById("clientsTable");

    if (clientList.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="15" style="text-align:center;">
                    Aucun client trouvé.
                </td>
            </tr>
        `;
        return;
    }

    const rows = clientList.map(client => `
        <tr class="client-row" data-id="${client.id}">
            <td>${client.nom}</td>
            <td>${client.prenom}</td>
            <td>${client.fonctionne}</td>
            <td>${client.telephone ?? "-"}</td>
            <td>${client.whatsapp ?? "-"}</td>
            <td>${client.facebook ?? "-"}</td>
            <td>${client.instagram ?? "-"}</td>
            <td>${client.snapchat ?? "-"}</td>
            <td>${client.tiktok ?? "-"}</td>
            <td>${client.reservation ?? "Non"}</td>
            <td>${client.reservation_de_quoi ?? "-"}</td>
            <td>${formatDate(client.reservation_date)}</td>
            <td>${client.travail}</td>
            <td>${client.assigne_a}</td>
            <td>${formatReminder(client.reminder_datetime)}</td>
        </tr>
    `).join("");

    table.innerHTML = rows;

    document.querySelectorAll(".client-row").forEach(row => {
        row.addEventListener("dblclick", () => {
            const id = Number(row.dataset.id);
            const client = clients.find(c => c.id === id);
            if (client) openClient(client);
        });
    });

}

// ==============================
// Search
// ==============================

searchInput.style.display = "none";

let searchTimeout;

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        loadClients(1, searchInput.value.trim());
    }, 300); // debounce: wait 300ms after typing stops

});

// ==============================
// Navigation
// ==============================

addTab.addEventListener("click", () => {

    addTab.classList.add("active");
    listTab.classList.remove("active");

    addSection.classList.remove("hidden");
    listSection.classList.add("hidden");

    searchInput.style.display = "none";

});

listTab.addEventListener("click", () => {

    listTab.classList.add("active");
    addTab.classList.remove("active");

    addSection.classList.add("hidden");
    listSection.classList.remove("hidden");

    searchInput.style.display = "block";

    loadClients(1, ""); // reset to page 1, no search filter

});

// ==============================
// Reset Form
// ==============================

function resetForm() {

    editingClientId = null;
    reminderDatetime = null;

    form.reset();

    description.required = travail.value !== "fini";

    [
        "phoneField",
        "whatsappField",
        "facebookField",
        "instagramField",
        "snapField",
        "tiktokField",
        "reservationFields"
    ].forEach(id => {
        const field = document.getElementById(id);
        field.style.display = "none";

        // clear required on every input inside, not just hide it
        field.querySelectorAll("input").forEach(input => {
            input.required = false;
        });
    });

    phoneCheck.checked = false;
    whatsappCheck.checked = false;
    facebookCheck.checked = false;
    instagramCheck.checked = false;
    snapCheck.checked = false;
    tiktokCheck.checked = false;
    reservationCheck.checked = false;

    document.querySelectorAll("input[name='worker']").forEach(worker => {
        worker.checked = false;
    });

    document.querySelector("button[type='submit']").textContent = "Enregistrer";

}

// ==============================
// Load Clients
// ==============================

async function loadClients(page = 1, search = "") {

    try {

        currentPage = page;
        currentSearch = search;

        const url = `/api/clients?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Impossible de récupérer les clients.");
        }

        const data = await response.json();

        clients = data.clients;

        displayClients(clients);
        renderPagination(data.page, data.totalPages);

    } catch (error) {

        console.error(error);
        alert("Erreur lors du chargement des clients.");

    }

}

// ==============================
// Open Client (Edit Mode)
// ==============================

function openClient(client) {

    resetForm();

    editingClientId = client.id;
    reminderDatetime = client.reminder_datetime ?? null;

    addTab.classList.add("active");
    listTab.classList.remove("active");

    addSection.classList.remove("hidden");
    listSection.classList.add("hidden");

    searchInput.style.display = "none";

    document.querySelector("button[type='submit']").textContent = "Modifier";

    // Basic information
    document.getElementById("nom").value = client.nom ?? "";
    document.getElementById("prenom").value = client.prenom ?? "";
    document.getElementById("fonctionne").value =
    client.fonctionne ?? "";

    description.value = client.description ?? "";
    travail.value = client.travail ?? "en cours";

    // Contact fields
    if (client.telephone) {
        phoneCheck.checked = true;
        document.getElementById("phoneField").style.display = "block";
        document.getElementById("phone").value = client.telephone;
    }

    if (client.whatsapp) {
        whatsappCheck.checked = true;
        document.getElementById("whatsappField").style.display = "block";
        document.getElementById("whatsapp").value = client.whatsapp;
    }

    if (client.facebook) {
        facebookCheck.checked = true;
        document.getElementById("facebookField").style.display = "block";
        document.getElementById("facebook").value = client.facebook;
    }

    if (client.instagram) {
        instagramCheck.checked = true;
        document.getElementById("instagramField").style.display = "block";
        document.getElementById("instagram").value = client.instagram;
    }

    if (client.snapchat) {
        snapCheck.checked = true;
        document.getElementById("snapField").style.display = "block";
        document.getElementById("snapchat").value = client.snapchat;
    }

    if (client.tiktok) {
        tiktokCheck.checked = true;
        document.getElementById("tiktokField").style.display = "block";
        document.getElementById("tiktok").value = client.tiktok;
    }
    if (String(client.reservation ?? "").toLowerCase() === "oui") {
        reservationCheck.checked = true;
        document.getElementById("reservationFields").style.display = "block";
        reservationDeQuoi.value = client.reservation_de_quoi ?? "";
        reservationQuand.value = client.reservation_date ?? "";
    }
    if (travail.value === "fini") {
        description.required = false;
    } else {
        description.required = true;
    }

    // Assigned worker
    const worker = document.querySelector(
        `input[name="worker"][value="${client.assigne_a}"]`
    );

    if (worker) {
        worker.checked = true;
    }

}

// ==============================
// Show / Hide Contact Fields
// ==============================

function toggle(checkId, fieldId) {

    const check = document.getElementById(checkId);
    const field = document.getElementById(fieldId);
    const input = field.querySelector("input");

    field.style.display = "none";
    input.required = false;

    check.addEventListener("change", () => {

        if (check.checked) {

            field.style.display = "block";
            input.required = true;

        } else {

            field.style.display = "none";
            input.required = false;
            input.value = "";

        }

    });

}

toggle("phoneCheck", "phoneField");
toggle("whatsappCheck", "whatsappField");
toggle("facebookCheck", "facebookField");
toggle("instagramCheck", "instagramField");
toggle("snapCheck", "snapField");
toggle("tiktokCheck", "tiktokField");


reservationCheck.addEventListener("change", () => {

    const fields = document.getElementById("reservationFields");

    if (reservationCheck.checked) {

        fields.style.display = "block";
        reservationDeQuoi.required = false;
        reservationQuand.required = false;

    } else {

        fields.style.display = "none";
        reservationDeQuoi.required = false;
        reservationQuand.required = false;
        reservationDeQuoi.value = "";
        reservationQuand.value = "";

    }

});
// ==============================
// Description Validation
// ==============================

travail.addEventListener("change", () => {

    if (travail.value === "fini") {

        description.required = false;

    } else {

        description.required = true;

    }

});

description.required = travail.value !== "fini";

// ==============================
// Create Client Object
// ==============================

function getClientData() {

    const worker = document.querySelector("input[name='worker']:checked");

    return {

        nom: document.getElementById("nom").value.trim(),
        prenom: document.getElementById("prenom").value.trim(),
        fonctionne: document.getElementById("fonctionne").value.trim(),

        telephone: phoneCheck.checked
            ? document.getElementById("phone").value.trim()
            : null,

        whatsapp: whatsappCheck.checked
            ? document.getElementById("whatsapp").value.trim()
            : null,

        facebook: facebookCheck.checked
            ? document.getElementById("facebook").value.trim()
            : null,

        instagram: instagramCheck.checked
            ? document.getElementById("instagram").value.trim()
            : null,

        snapchat: snapCheck.checked
            ? document.getElementById("snapchat").value.trim()
            : null,

        tiktok: tiktokCheck.checked
            ? document.getElementById("tiktok").value.trim()
            : null,

        reservation: reservationCheck.checked ? "Oui" : "Non",

        reservation_de_quoi: reservationCheck.checked
            ? reservationDeQuoi.value.trim()
            : "",

        reservation_date: reservationCheck.checked && reservationQuand.value
    ? reservationQuand.value
    : null,
        description: description.value.trim(),

        reminder_datetime: reminderDatetime,

        travail: travail.value,

        assigne_a: worker ? worker.value : null

    };

}

// ==============================
// Validate Form
// ==============================

function validateForm() {

    if (
        !phoneCheck.checked &&
        !whatsappCheck.checked &&
        !facebookCheck.checked &&
        !instagramCheck.checked &&
        !snapCheck.checked &&
        !tiktokCheck.checked
    ) {

        alert("Veuillez sélectionner au moins un moyen de contact.");
        return false;

    }

    return true;

}


// ==============================
// Reminders / Notifications
// ==============================
let dismissedReminderIds = new Set();
const notifBell = document.getElementById("notifBell");
const notifBadge = document.getElementById("notifBadge");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");

let lastReminderIds = new Set();
let remindersEventSource = null;

function initializeReminderEvents() {
    if (!window.EventSource || remindersEventSource) {
        return;
    }

    remindersEventSource = new EventSource("/api/clients/reminders/events");

    remindersEventSource.addEventListener("reminder-generated", () => {
        checkReminders();
    });

    remindersEventSource.onerror = (error) => {
        console.error("Erreur de connexion aux rappels en temps réel:", error);
    };
}

async function checkReminders() {

    try {

        const response = await fetch("/api/clients/reminders");
        const reminders = await response.json();

        notifBadge.textContent = reminders.length;
        notifBadge.classList.toggle("hidden", reminders.length === 0);

        if (reminders.length === 0) {
            notifList.innerHTML = `<p class="notif-empty">Aucun rappel pour l'instant.</p>`;
            return;
        }

        notifList.innerHTML = reminders.map(reminder => `
            <div class="notif-item" data-id="${reminder.id}">
                <strong>${reminder.nom} ${reminder.prenom}</strong>
                <span>${reminder.reservation_de_quoi ?? "Réservation"} — ${formatDate(getReminderTimestampValue(reminder))}</span>
                <span class="notif-contact">
                    ${reminder.telephone ? `<ion-icon name="call-outline"></ion-icon> ${reminder.telephone}<br>` : ""}
                    ${reminder.whatsapp ? `<ion-icon name="logo-whatsapp"></ion-icon> ${reminder.whatsapp}<br>` : ""}
                    ${reminder.facebook ? `<ion-icon name="logo-facebook"></ion-icon> ${reminder.facebook}<br>` : ""}
                    ${reminder.instagram ? `<ion-icon name="logo-instagram"></ion-icon> ${reminder.instagram}<br>` : ""}
                    ${reminder.snapchat ? `<ion-icon name="logo-snapchat"></ion-icon> ${reminder.snapchat}<br>` : ""}
                    ${reminder.tiktok ? `<ion-icon name="logo-tiktok"></ion-icon> ${reminder.tiktok}` : ""}
                </span>
            </div>
        `).join("");

        // Attach double-click dismissal to each item
        document.querySelectorAll(".notif-item").forEach(item => {
            item.addEventListener("dblclick", async () => {

                const id = Number(item.dataset.id);

                try {

                    await fetch(`/api/clients/reminders/${id}`, {
                        method: "DELETE"
                    });

                } catch (error) {
                    console.error("Erreur lors de la suppression du rappel:", error);
                    return; // don't remove visually if the delete failed
                }

                item.classList.add("notif-item-removing");

                setTimeout(() => {
                    item.remove();

                    const remaining = notifList.querySelectorAll(".notif-item").length;
                    notifBadge.textContent = remaining;
                    notifBadge.classList.toggle("hidden", remaining === 0);

                    if (remaining === 0) {
                        notifList.innerHTML = `<p class="notif-empty">Aucun rappel pour l'instant.</p>`;
                    }

                }, 200);

            });
        });

        // Trigger OS notification only for genuinely new reminders
        const currentIds = new Set(reminders.map(r => r.id));

        reminders.forEach(reminder => {
            if (!lastReminderIds.has(reminder.id)) {
                triggerBrowserNotification(reminder);
            }
        });

        lastReminderIds = currentIds;

    } catch (error) {
        console.error("Erreur lors du chargement des rappels:", error);
    }

}

function playNotificationSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.value = 0.15;

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.15);
    } catch (error) {
        console.warn("Impossible de jouer le son de notification", error);
    }
}

let originalDocumentTitle = document.title;
let flashTitleTimer = null;

function flashDocumentTitle(message) {
    if (flashTitleTimer) {
        clearInterval(flashTitleTimer);
    }

    let visible = true;
    flashTitleTimer = setInterval(() => {
        document.title = visible ? message : originalDocumentTitle;
        visible = !visible;
    }, 1000);

    setTimeout(() => {
        clearInterval(flashTitleTimer);
        document.title = originalDocumentTitle;
        flashTitleTimer = null;
    }, 10000);
}

function getReminderTimestampValue(reminder) {
    return reminder.created_at || reminder.reminder_datetime || reminder.reservation_date || null;
}

function getReminderDisplayTime(reminder) {
    const value = getReminderTimestampValue(reminder);

    if (!value) {
        return "09:00";
    }

    const date = parseDateValue(value);

    if (!date) {
        return "09:00";
    }

    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function showInPageAlert(reminder) {
    const alert = document.createElement("div");
    alert.className = "reminder-alert-banner";
    const reminderHour = getReminderDisplayTime(reminder);
    alert.innerHTML = `
        <strong>Rappel :</strong> ${reminder.nom} ${reminder.prenom} — ${reminder.reservation_de_quoi ?? "réservation"}<br>
        ${formatDate(reminder.reservation_date)} à ${reminderHour}
        <button class="reminder-alert-close">OK</button>
    `;

    alert.style.position = "fixed";
    alert.style.left = "16px";
    alert.style.right = "16px";
    alert.style.top = "16px";
    alert.style.zIndex = "9999";
    alert.style.padding = "16px";
    alert.style.background = "#212121";
    alert.style.color = "#fff";
    alert.style.borderRadius = "8px";
    alert.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
    alert.style.fontSize = "0.95rem";
    alert.style.display = "flex";
    alert.style.justifyContent = "space-between";
    alert.style.alignItems = "center";

    const closeButton = alert.querySelector(".reminder-alert-close");
    closeButton.style.marginLeft = "16px";
    closeButton.style.border = "none";
    closeButton.style.padding = "8px 12px";
    closeButton.style.background = "#fff";
    closeButton.style.color = "#000";
    closeButton.style.borderRadius = "4px";
    closeButton.style.cursor = "pointer";

    closeButton.addEventListener("click", () => {
        alert.remove();
    });

    document.body.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 10000);
}

function getReminderMessage(reminder) {
    const reminderHour = getReminderDisplayTime(reminder);
    const reservationDate = reminder.reservation_date ? new Date(`${reminder.reservation_date}T00:00:00`) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate) {
        const diffDays = Math.round((reservationDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `${reminder.nom} ${reminder.prenom} — ${reminder.reservation_de_quoi ?? "réservation"} aujourd'hui (${formatDate(reminder.reservation_date)}) à ${reminderHour}`;
        }

        if (diffDays === 1) {
            return `${reminder.nom} ${reminder.prenom} — ${reminder.reservation_de_quoi ?? "réservation"} demain (${formatDate(reminder.reservation_date)}) à ${reminderHour}`;
        }
    }

    return `${reminder.nom} ${reminder.prenom} — ${reminder.reservation_de_quoi ?? "réservation"} (${formatDate(reminder.reservation_date)}) à ${reminderHour}`;
}

function triggerBrowserNotification(reminder) {
    const message = getReminderMessage(reminder);

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Rappel de réservation", {
            body: message
        });
        playNotificationSound();
        flashDocumentTitle("🔔 Nouveau rappel !");
        return;
    }

    playNotificationSound();
    flashDocumentTitle("🔔 Nouveau rappel !");
    showInPageAlert(reminder);
}

function requestNotificationPermissionOnInteraction() {
    if (!("Notification" in window)) return;

    const requestPermission = () => {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    playNotificationSound();
                }
            });
        }
    };

    document.addEventListener("click", requestPermission, { once: true });
    document.addEventListener("keydown", requestPermission, { once: true });
}

requestNotificationPermissionOnInteraction();

// Toggle dropdown on bell click
notifBell.addEventListener("click", () => {
    notifDropdown.classList.toggle("hidden");
});

// Close dropdown if clicking outside
document.addEventListener("click", (e) => {
    if (!notifBell.contains(e.target) && !notifDropdown.contains(e.target)) {
        notifDropdown.classList.add("hidden");
    }
});

// Check immediately on load and keep the page synced in real time.
checkReminders();
initializeReminderEvents();
// ==============================
// Submit Form
// ==============================
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    const data = getClientData();

    let isEditing = editingClientId !== null;
    let targetId = editingClientId;

    if (!isEditing) {

        try {

            const params = new URLSearchParams();

            if (data.nom) params.append("nom", data.nom);
            if (data.prenom) params.append("prenom", data.prenom);
            if (data.telephone) params.append("telephone", data.telephone);
            if (data.whatsapp) params.append("whatsapp", data.whatsapp);
            if (data.facebook) params.append("facebook", data.facebook);
            if (data.instagram) params.append("instagram", data.instagram);
            if (data.snapchat) params.append("snapchat", data.snapchat);
            if (data.tiktok) params.append("tiktok", data.tiktok);

            const checkResponse = await fetch(`/api/clients/check?${params.toString()}`);

            const checkResult = await checkResponse.json();

            if (checkResult.exists) {

                const fieldsList = checkResult.matchedFields.join(", ");

                const confirmed = confirm(
                    `Ce client existe déjà (correspondance sur : ${fieldsList}). Voulez-vous écraser ses coordonnées avec les nouvelles ?`
                );

                if (!confirmed) {
                    return;
                }

                isEditing = true;
                targetId = checkResult.client.id;

            }

        } catch (error) {

            console.error(error);
            alert("Erreur lors de la vérification du client.");
            return;

        }

    }

    const url = isEditing
            ? `/api/clients/${targetId}`
            : "/api/clients";

    const method = isEditing ? "PUT" : "POST";

    try {

        const response = await fetch(url, {

            method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        if (!response.ok) {

            alert(result.message || "Une erreur est survenue.");
            return;

        }

        alert(
            isEditing
                ? "Client modifié avec succès !"
                : "Client enregistré avec succès !"
        );

        resetForm();

        await loadClients(1, "");

        addTab.classList.remove("active");
        listTab.classList.add("active");

        addSection.classList.add("hidden");
        listSection.classList.remove("hidden");

        searchInput.style.display = "block";

    } catch (error) {

        console.error(error);
        alert("Impossible de contacter le serveur.");

    }

});

function renderPagination(page, totalPages) {

    let container = document.getElementById("paginationControls");

    if (!container) {
        container = document.createElement("div");
        container.id = "paginationControls";
        document.getElementById("listClientSection").appendChild(container);
    }

    container.innerHTML = `
        <button id="prevPageBtn" ${page <= 1 ? "disabled" : ""}>Précédent</button>
        <span> Page ${page} / ${totalPages || 1} </span>
        <button id="nextPageBtn" ${page >= totalPages ? "disabled" : ""}>Suivant</button>
    `;

    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) loadClients(currentPage - 1, currentSearch);
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        if (currentPage < totalPages) loadClients(currentPage + 1, currentSearch);
    });

}


floatingReminderBtn.addEventListener("click", () => {

    const client = editingClientId !== null && editingClientId !== undefined
        ? clients.find(c => c.id === editingClientId)
        : null;

    reminderDateTimeInput.value = reminderDatetime
        ? reminderDatetime.slice(0, 16)
        : client?.reminder_datetime
            ? client.reminder_datetime.slice(0, 16)
            : "";

    reminderModal.classList.remove("hidden");

});

cancelReminderBtn.addEventListener("click", () => {
    reminderModal.classList.add("hidden");
});

saveReminderBtn.addEventListener("click", async () => {

    const reminder_datetime = reminderDateTimeInput.value;

    if (!reminder_datetime) {
        alert("Choisissez une date et une heure.");
        return;
    }

    reminderDatetime = reminder_datetime;

    if (editingClientId !== null && editingClientId !== undefined) {
        try {

            const response = await fetch(`/api/clients/${editingClientId}/reminder`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reminder_datetime })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            const client = clients.find(c => c.id === editingClientId);
            if (client) client.reminder_datetime = reminder_datetime;
            if (!listSection.classList.contains("hidden")) {
                displayClients(clients);
            }

        } catch (err) {
            console.error(err);
            alert(err.message || "Impossible de contacter le serveur.");
            return;
        }
    }

    alert("Rappel programmé.");
    reminderModal.classList.add("hidden");
    reminderDateTimeInput.value = "";

});

// ==============================
// Initial Page State
// ==============================

resetForm();