require("dotenv").config({
    path: "../.env"
});

console.log("PROJECT:", process.env.SMSSAK_PROJECT_ID);
console.log("TEMPLATE:", process.env.FLIGHT_TEMPLATE_ID);
console.log("API KEY EXISTS:", !!process.env.SMSSAK_API_KEY);

async function sendFlightReservationSMS(client) {
    try {
        const response = await fetch(
            "https://sendmessagewithtemplate-47lvvvrp4a-uc.a.run.app",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "key": process.env.SMSSAK_API_KEY
                },
                body: JSON.stringify({
                    projectId: process.env.SMSSAK_PROJECT_ID,
                    templateId: process.env.FLIGHT_TEMPLATE_ID,
                    country: "DZ",
                    phone: client.telephone,
                    fields: {
                        clientName: `${client.nom || ""} ${client.prenom || ""}`.trim(),
                        reservationTime: client.reservation_time
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `SMS API error ${response.status}: ${JSON.stringify(data)}`
            );
        }

        console.log("Hotel reservation SMS sent:", data);

        return data;

    } catch (error) {
        console.error("Failed to send hotel reservation SMS:", error);
        throw error;
    }
}

module.exports = {
    sendFlightReservationSMS
};