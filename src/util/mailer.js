const nodemailer = require("nodemailer");
const { template } = require("./constants");
const { MAIL_HOST, MAIL_USER, MAIL_PASSWORD, APP_URL } = process.env;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
});

const sendOtp = (otp, email) => {
  const mailOptions = {
    from: `"GETS" <${MAIL_USER}>`,
    to: email,
    subject: "Your One-Time Password for Secure Access",
    html: template(otp),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
  });
};

const sendResetEmail = async (email, token) => {
  const resetLink = `${APP_URL}reset-password?token=${token}`;

  const mailOptions = {
    from: `"GETS" <${MAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <p><a href="${resetLink}">Reset Password</a></p>
           <p>If you did not request this, please ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    // throw new Error("Email could not be sent");
  }
};

module.exports = {
  sendOtp,
  sendResetEmail,
};
