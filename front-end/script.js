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

// ==============================
// Global Variables
// ==============================

let clients = [];
let editingClientId = null;

// ==============================
// Display Clients
// ==============================

function displayClients(clientList) {

    const table = document.getElementById("clientsTable");

    table.innerHTML = "";

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

    clientList.forEach(client => {

        table.innerHTML += `
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
                <td>${client.travail}</td>
                <td>${client.assigne_a}</td>
            </tr>
        `;

    });

    document.querySelectorAll(".client-row").forEach(row => {

        row.addEventListener("dblclick", () => {

            const id = Number(row.dataset.id);

            const client = clients.find(c => c.id === id);

            if (client) {
                openClient(client);
            }

        });

    });

}

// ==============================
// Search
// ==============================

searchInput.style.display = "none";

searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    const filtered = clients.filter(client =>
        Object.values(client).some(field =>
            String(field ?? "")
                .toLowerCase()
                .includes(value)
        )
    );

    displayClients(filtered);

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

    loadClients();

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
        "tiktokField"
    ].forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    phoneCheck.checked = false;
    whatsappCheck.checked = false;
    facebookCheck.checked = false;
    instagramCheck.checked = false;
    snapCheck.checked = false;
    tiktokCheck.checked = false;

    document.querySelectorAll("input[name='worker']").forEach(worker => {
        worker.checked = false;
    });

    document.querySelector("button[type='submit']").textContent = "Enregistrer";

}

// ==============================
// Load Clients
// ==============================

async function loadClients() {

    try {

        const response = await fetch("/api/clients");

        if (!response.ok) {
            throw new Error("Impossible de récupérer les clients.");
        }

        clients = await response.json();

        displayClients(clients);

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
// Submit Form
// ==============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    const data = getClientData();

    const isEditing = editingClientId !== null;

    const url = isEditing
            ? `/api/clients/${editingClientId}`
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
        const data2 = getClientData();
    console.log(data2);

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

        await loadClients();

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

// ==============================
// Initial Page State
// ==============================

resetForm();