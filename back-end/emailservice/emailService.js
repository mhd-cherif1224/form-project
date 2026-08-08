const Mailjet = require("node-mailjet");

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY
});

async function sendEmailToDev(subject, message) {
    await mailjet
        .post("send", { version: "v3.1" })
        .request({
            Messages: [
                {
                    From: {
                        Email: process.env.MAIL_FROM_EMAIL,
                        Name: process.env.MAIL_FROM_NAME
                    },
                    To: [
                        {
                            Email: process.env.DEV_EMAIL,
                            Name: process.env.DEV_NAME
                        }
                    ],
                    Subject: subject,
                    TextPart: message
                }
            ]
        });
}

module.exports = { sendEmailToDev };