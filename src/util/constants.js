const template = (otp) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>One-Time Password</title>
</head>

<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
        <p style="color: #666; font-size: 16px;">Dear User,</p>
        <p style="color: #666; font-size: 16px;">You have requested to login or perform an action that requires
            verification. Please use the following OTP to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 24px; color: #333; text-align: center; margin-bottom: 20px;">
            <strong>${otp}</strong>
        </div>
        <p style="color: #666; font-size: 16px;">This OTP is valid for a single use and should not be shared with
            anyone. If you did not request this OTP, please ignore this message.</p>
        <p style="color: #666; font-size: 16px;">Thank you for using our service.</p>
        <p style="color: #666; font-size: 16px;">Regards,<br>GETS</p>
    </div>
</body>

</html>`;

module.exports = {
  template,
};
