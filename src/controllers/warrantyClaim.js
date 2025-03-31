const { Customer, Warranty, Device } = require("../models");
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require("moment");


// Initialize WhatsApp client
const client = new Client();

// Generate QR code for authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

// Initialize the client
client.initialize();

async function registerWarrantyClaim(req, res) {
    try {
        const { first_name, last_name, mobile, address, email, product, invoice_number, purchase_date } = req.body;
        const invoiceFile = req.file ? req.file.filename : null;

        // Basic validation
        if (!first_name || !last_name || !mobile || !address || !email || !product || !invoice_number || !purchase_date || !invoiceFile) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const customer = await Customer.create({
            first_name,
            last_name,
            mobile,
            email,
            address,
        });
        // Store data in MySQL using Sequelize
        const startDate = new Date(purchase_date);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
        const newWarranty = await Warranty.create({
            customer_id: customer.id,
            product_id: product,
            invoice_number,
            date_of_purchase: purchase_date,
            invoice_file: invoiceFile,
            start_date: startDate,
            end_date: endDate,
        });

        // Send WhatsApp message after successful registration
        const customerPhone = `91${mobile.replace(/\D/g, '')}@c.us`;
        const customerName = `${first_name} ${last_name}`;
        const productName = await Device.findByPk(product);
        await sendWhatsAppMessage(customerPhone, customerName, invoice_number, productName.title, startDate, endDate);

        res.status(201).json({ message: "Warranty registered successfully!", data: newWarranty });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}


module.exports = {
    registerWarrantyClaim,
};



async function sendWhatsAppMessage(customerPhone, customerName, invoiceNumber, productName, startDate, endDate) {
    try {

        const formattedStartDate = moment(startDate).format('DD/MM/YYYY');
        const formattedEndDate = moment(endDate).format('DD/MM/YYYY');


        const message = `Hi *${customerName}*, 
Thank you for registering your GETS ${productName} warranty! 🎉
Your 3-month warranty is now active. If you ever need assistance or need to claim your warranty, we're here to help!

✅ Order Details:
Product: ${productName}
Order ID: ${invoiceNumber}
Warranty Validity: ${formattedStartDate} – ${formattedEndDate}

🔹 Need to claim your warranty? Click here: ${process.env.WARRANTY_APP_URL}warranty_claim.html

For any support, feel free to contact us.
Enjoy your purchase, and thank you for choosing GETS!

🔹 GETS Customer Support
Mail - ${process.env.WHATSAPP_MAIL}
Website - ${process.env.WARRANTY_APP_URL}`;

        const message2 = `Hi *${customerName}*,
We hope you’re enjoying your GETS ${productName}! ⭐
We’d love to hear your feedback! Share your experience by leaving a review on Amazon, and as a thank-you, we’ll send you an exclusive cashback reward! 💰
✅ How to Claim Your Cashback:
 1️⃣ Click here to leave a review: ${process.env.AMAZON_REVIEW_LINK}
 2️⃣ Take a screenshot of your review.
 3️⃣ Send the screenshot to us on WhatsApp at ${process.env.WHATSAPP_NUMBER}.
Once verified, we’ll process your cashback! 🚀
Thank you for supporting GETS—we truly appreciate it! 💙
🔹 GETS Customer Support
Mail - ${process.env.WHATSAPP_MAIL}
Website - ${process.env.WARRANTY_APP_URL}`


        await client.sendMessage(customerPhone, message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await client.sendMessage(customerPhone, message2);
        console.log('WhatsApp message sent successfully');
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        // Don't throw the error - we don't want the main registration process to fail if WhatsApp fails
    }
}

