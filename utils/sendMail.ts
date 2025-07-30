import nodemailer from "nodemailer";

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendMail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: '79ac62002@smtp-brevo.com',
            pass: 'myZrgHpLRKfV4cBU'
        }
    });

  const mailOptions = {
    from: `Phyquie <ayushking6395@gmail.com>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

// Send OTP email
export const sendOTPEmail = async (to: string, otp: string, userName: string) => {
    const subject = "Email Verification OTP";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>Best regards,<br>Your App Team</p>
        </div>
    `;
    
    return sendMail(to, subject, html);
};
