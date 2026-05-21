import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

console.log("Checking Email:", process.env.EMAIL_USER); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Existing Order Confirmation Email
export const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
    try {
        let timeString = "Will be assigned soon";
        if (orderDetails.expectedDeliveryDate) {
            timeString = new Date(orderDetails.expectedDeliveryDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: 'numeric', minute: 'numeric' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Order Confirmation - Fruzo (#${orderDetails._id})`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                    <h2 style="color: #4CAF50;">Thank you for your order!</h2>
                    <p>Hi ${orderDetails.address?.firstName || 'Customer'},</p>
                    <p>We have successfully received your order <b>#${orderDetails._id}</b>.</p>
                    
                    <div style="background-color: #f1f8e9; padding: 10px; border-radius: 5px; margin: 15px 0;">
                        <p style="margin: 0; color: #33691e; font-size: 16px;"><b>⏱️ Expected Delivery:</b> Today by ${timeString}</p>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #555;">Delivery Mode: ${orderDetails.deliveryPreference}</p>
                    </div>

                    <p><b>Total Amount:</b> ₹${orderDetails.amount}</p>
                    <p><b>Payment Method:</b> ${orderDetails.paymentMethod || 'Online'}</p>
                    ${orderDetails.deliveryFee > 0 ? `<p style="color: #d32f2f;"><b>Express Delivery Fee:</b> ₹${orderDetails.deliveryFee}</p>` : ''}
                    <br/>
                    <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">Order Items:</h3>
                    <ul style="list-style-type: none; padding-left: 0;">
                        ${orderDetails.items.map(item => `
                            <li style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                                <b>${item.name}</b> <br/>
                                Quantity: ${item.quantity}
                            </li>
                        `).join('')}
                    </ul>
                    <br/>
                    <p>We will notify you once your order is shipped!</p>
                    <p>Thanks,<br/><b>Fruzo Team</b></p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log("✅ Order Confirmation Email Sent!");
    } catch (error) {
        console.log("❌ Email Error:", error);
    }
};

// ==========================================
// 🚀 NEW: OTP VERIFICATION EMAIL 
// ==========================================
export const sendOTPEmail = async (userEmail, userName, otp) => {
    try {
        const mailOptions = {
            from: `"Fruzo Fresh" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Verify your Email - Fruzo`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 500px; margin: auto; text-align: center;">
                    <h2 style="color: #16a34a; margin-bottom: 10px;">Welcome to Fruzo!</h2>
                    <p style="font-size: 16px; color: #4b5563;">Hi <b>${userName}</b>,</p>
                    <p style="font-size: 15px; color: #6b7280; line-height: 1.5;">To complete your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
                    
                    <div style="margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: 900; color: #16a34a; letter-spacing: 8px; background: #f0fdf4; padding: 15px 30px; border-radius: 8px; border: 2px dashed #bbf7d0; display: inline-block;">
                            ${otp}
                        </span>
                    </div>
                    
                    <p style="font-size: 13px; color: #9ca3af;">This OTP is valid for 10 minutes. If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email successfully sent to ${userEmail}`);
    } catch (error) {
        console.log("❌ Failed to send OTP Email:", error);
        throw new Error("Could not send OTP to email. Please check if email is correct.");
    }
};