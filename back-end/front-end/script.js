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


// ==============================
// Global Variables
// ==============================

let clients = [];
let editingClientId = null;

let currentPage = 1;
let currentSearch = "";
const PAGE_SIZE = 50;

// ==============================
// Display Clients
// ==============================


function displayClients(clientList) {

    const table = document.getElementById("clientsTable");

    if (clientList.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;">
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
            <td>${client.reservation_date ?? "-"}</td>
            <td>${client.travail}</td>
            <td>${client.assigne_a}</td>
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
    if (client.reservation === "oui") {
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

const notifBell = document.getElementById("notifBell");
const notifBadge = document.getElementById("notifBadge");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");

let lastReminderIds = new Set();

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

        notifList.innerHTML = reminders.map(client => `
            <div class="notif-item">
                <strong>${client.nom} ${client.prenom}</strong>
                <span>${client.reservation_de_quoi ?? "Réservation"} — ${client.reservation_date}</span>
                <span class="notif-contact">
                    ${client.telephone ? `📞 ${client.telephone}` : ""}
                    ${client.whatsapp ? `💬 ${client.whatsapp}` : ""}
                </span>
            </div>
        `).join("");

        // Trigger a real OS notification for NEW reminders only (not ones already seen)
        const currentIds = new Set(reminders.map(c => c.id));

        reminders.forEach(client => {
            if (!lastReminderIds.has(client.id)) {
                triggerBrowserNotification(client);
            }
        });

        lastReminderIds = currentIds;

    } catch (error) {
        console.error("Erreur lors du chargement des rappels:", error);
    }

}

function triggerBrowserNotification(client) {

    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {

        new Notification("Rappel de réservation", {
            body: `${client.nom} ${client.prenom} — ${client.reservation_de_quoi ?? "réservation"} demain (${client.reservation_date})`
        });

    }

}

// Ask for notification permission once, on page load
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

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

// Check immediately on load, then every 5 minutes
checkReminders();
setInterval(checkReminders, 5 * 60 * 1000);
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

// ==============================
// Initial Page State
// ==============================

resetForm();