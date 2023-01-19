"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHtml = exports.sendmail = exports.transporter = exports.onRequestOTP = exports.GenerateOTP = void 0;
const config_1 = require("../config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const GenerateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 90000);
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));
    return { otp, expiry };
};
exports.GenerateOTP = GenerateOTP;
const onRequestOTP = async (otp, toPhoneNumber) => {
    const client = require('twilio')(config_1.accountSid, config_1.authToken);
    const response = client.messages
        .create({
        body: `Your OTP is ${otp}`,
        to: toPhoneNumber,
        from: config_1.fromAdminPhone
    });
    return response;
};
exports.onRequestOTP = onRequestOTP;
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.GMAIL_USER,
        pass: config_1.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
const sendmail = async (from, to, subject, html) => {
    try {
        const response = await exports.transporter.sendMail({
            from: config_1.fromAdminMail,
            to,
            subject: config_1.userSubject,
            html
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendmail = sendmail;
const emailHtml = (otp) => {
    const temp = `
    <div style="background-color: #f5f5f5; padding: 20px; font-family: sans-serif;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to Food App</h2>
            <p>Congratulations! You're almost set to start using Food App. Just enter this one time code to verify your account.</p>
            <div style="padding: 10px; background-color: #e0e0e0; text-align: center;">
                <h1 style="color: teal; margin: 0; padding: 0;">${otp}</h1>
            </div>
            <p>Thanks,<br>
            Food App Team</p>
        </div>
    </div>
    `;
    return temp;
};
exports.emailHtml = emailHtml;
