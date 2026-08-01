const form = document.getElementById("clientForm");

const travail = document.getElementById("travail");
const description = document.getElementById("description");

const phoneCheck = document.getElementById("phoneCheck");
const whatsappCheck = document.getElementById("whatsappCheck");
const facebookCheck = document.getElementById("facebookCheck");
const instagramCheck = document.getElementById("instagramCheck");
const snapCheck = document.getElementById("snapCheck");
const tiktokCheck = document.getElementById("tiktokCheck");
const addTab = document.getElementById("addTab");
const listTab = document.getElementById("listTab");

const addSection = document.getElementById("addClientSection");
const listSection = document.getElementById("listClientSection");

async function loadClients() {

    try {

        const response = await fetch("http://localhost:3000/api/clients");

        if (!response.ok) {
            throw new Error("Impossible de récupérer les clients.");
        }

        const clients = await response.json();

        const table = document.getElementById("clientsTable");

        table.innerHTML = "";

        if (clients.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="11" style="text-align:center;">
                        Aucun client trouvé.
                    </td>
                </tr>
            `;

            return;
        }

        clients.forEach(client => {

            table.innerHTML += `
                <tr>

                    <td>${client.nom}</td>
                    <td>${client.prenom}</td>
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

    } catch (error) {

        console.error(error);
        alert("Erreur lors du chargement des clients.");

    }

}

addTab.addEventListener("click",()=>{

    addTab.classList.add("active");
    listTab.classList.remove("active");

    addSection.classList.remove("hidden");
    listSection.classList.add("hidden");

});

listTab.addEventListener("click",()=>{

    listTab.classList.add("active");
    addTab.classList.remove("active");

    addSection.classList.add("hidden");
    listSection.classList.remove("hidden");

    loadClients();

});
// ==============================
// Show / Hide contact inputs
// ==============================

function toggle(checkId, fieldId) {
    const check = document.getElementById(checkId);
    const field = document.getElementById(fieldId);
    const input = field.querySelector("input");

    field.style.display = "none";

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
// Description Required
// ==============================

travail.addEventListener("change", () => {

    if (travail.value === "fini") {
        description.required = false;
    } else {
        description.required = true;
    }

});

// Default
description.required = travail.value !== "fini";

// ==============================
// Submit Form
// ==============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // At least one contact method required
    if (
        !phoneCheck.checked &&
        !whatsappCheck.checked &&
        !facebookCheck.checked &&
        !instagramCheck.checked &&
        !snapCheck.checked&&
        !tiktokCheck.checked
    ) {
        alert("Veuillez sélectionner au moins un moyen de contact.");
        return;
    }

    const worker = document.querySelector("input[name='worker']:checked");

    const data = {

        nom: document.getElementById("nom").value.trim(),

        prenom: document.getElementById("prenom").value.trim(),

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

    try {

        const response = await fetch("http://localhost:3000/api/clients", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        if (response.ok) {

            alert("Client enregistré avec succès !");

            form.reset();

            document.getElementById("phoneField").style.display = "none";
            document.getElementById("whatsappField").style.display = "none";
            document.getElementById("facebookField").style.display = "none";
            document.getElementById("instagramField").style.display = "none";
            document.getElementById("snapField").style.display = "none";

            description.required = true;

        } else {

            alert(result.message || "Une erreur est survenue.");

        }

    } catch (error) {

        console.error(error);
        alert("Impossible de contacter le serveur.");

    }

});