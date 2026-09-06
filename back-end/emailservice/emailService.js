const Mailjet = require("node-mailjet");

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY
});

async function sendEmailToDev(subject, message) {
    try {
        console.log("mailjet: sending email to dev", { to: process.env.DEV_EMAIL, subject });

        const res = await mailjet
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
                        HTMLPart: message
                    }
                ]
            });

        // mailjet responds with an object containing "body" and "status" sometimes
        console.log("mailjet: send result", {
            status: res && res.statusCode ? res.statusCode : res && res.body ? res.body.Status : undefined,
            body: res && res.body ? res.body : res
        });

        return true;
    } catch (err) {
        // Try to surface useful information from the error
        console.error("mailjet: failed to send email", {
            message: err && err.message,
            code: err && err.code,
            responseBody: err && err.response && err.response.body ? err.response.body : undefined,
            stack: err && err.stack
        });

        return false;
    }
}

module.exports = { sendEmailToDev };