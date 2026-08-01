async function loadClients(){

    const response = await fetch("http://localhost:3000/api/clients");

    const clients = await response.json();

    const table = document.getElementById("clientsTable");

    table.innerHTML = "";

    clients.forEach(client=>{

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

                <td>

                    <button>Edit</button>
                    <button>Delete</button>

                </td>

            </tr>
        `;

    });

}