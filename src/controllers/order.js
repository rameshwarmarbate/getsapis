const status = require("http-status");
const fs = require("fs");
const numberToWords = require("number-to-words");
const { toUpper } = require("lodash");
const pdf = require('html-pdf');
const path = require("path");
// const twilio = require("twilio");
const { OrderCounter, Order, Customer, Device } = require("../models");

const PDFDocument = require("pdfkit");
const { formatNumber, base64_encode } = require("../util");
const moment = require("moment");
const generateOrderNo = async () => {
  const currentDate = new Date();
  const dateString = `${String(currentDate.getDate()).padStart(2, "0")}${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}${currentDate.getFullYear().toString().slice(-2)}`; // Format DDMMYY
  let counter = await OrderCounter.findOne();
  if (!counter) {
    counter = await OrderCounter.create({});
  }

  // Increment the counter
  const newOrderNo = counter.last_order_no + 1;

  // Update the counter in the database
  await OrderCounter.update(
    { last_order_no: newOrderNo },
    { where: { id: counter.id } }
  );

  // Format the order number with leading zeros
  const formattedOrderNo = `GETS-${dateString}-${String(newOrderNo).padStart(
    4,
    "0"
  )}`;

  return formattedOrderNo;
};

const accountSid = "ACCOUNT_SID"; // Twilio Account SID
const authToken = "AUTH_TOKEN"; // Twilio Auth Token
const fromWhatsAppNumber = "whatsapp:+14155238886"; // Twilio WhatsApp number

async function addOrder(req, res) {
  try {
    const {
      device_id,
      unit_price,
      quantity,
      first_name,
      last_name,
      mobile,
      email,
      address,
      pincode,
      city,
      district,
      state,
      country,
      gst_no,
      user_id,
      isShare,
    } = req.body;

    const customer = await Customer.create({
      first_name,
      last_name,
      mobile,
      email,
      address,
      pincode,
      city,
      district,
      state,
      country,
      gst_no,
      created_by: user_id,
    });

    const orderNo = await generateOrderNo();

    const order = await Order.create({
      order_no: orderNo,
      device_id,
      customer_id: customer.id,
      unit_price,
      quantity,
      created_by: user_id,
    });

    if (isShare) {
      const invoiceData = {
        orderNo: "GETS-YTX-0254-001",
        customer: {
          name: "XYZ INDIA PRIVATE LIMITED",
          address:
            "123, XYZ TOWERS, 4TH FLOOR, MG ROAD, INDIRANAGAR, BENGALURU, KARNATAKA - 560038, INDIA",
          gstNo: "32AAMCM9277G6Z",
        },
        items: [
          {
            model: "SMART ELECTRIC HOT WATER BAG",
            description: "ELECTRIC HOT WATER BAG",
            qty: 100,
            unitPrice: 200.0,
            total: 20000.0,
          },
          {
            model: "",
            description: "PACKAGING AND COURIER",
            qty: 1,
            unitPrice: 700.0,
            total: 700.0,
          },
        ],
        subtotal: 200700.0,
        gst: 36126.0,
        total: 236826.0,
        totalInWords:
          "TWO HUNDRED THIRTY-SIX THOUSAND EIGHT HUNDRED TWENTY-SIX",
      };
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      doc.pipe(fs.createWriteStream(`invoice_${invoiceData.orderNo}.pdf`));

      const buffers = []; // Array to store chunks of data

      // Collect PDF data in buffers
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        const pdfBase64 = pdfData.toString("base64");

        // Send the base64 PDF string back in the response or via WhatsApp
        res.json({
          order,
          pdfBase64, // This is the base64 version of the PDF
          message: "PDF generated and converted to Base64 successfully!",
        });
      });

      // Fonts and Colors
      const boldFont = "Helvetica-Bold";
      const regularFont = "Helvetica";

      // Border around the document
      doc
        .lineWidth(1)
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .stroke();

      // Header
      doc.font(boldFont).fontSize(20).text("gets", { align: "center" });
      doc
        .font(regularFont)
        .fontSize(10)
        .text("GET EXCELLENT TECH SOLUTIONS", { align: "center" });

      // Seller Information Box
      doc.fillColor("#d3d3d3").rect(40, 80, 200, 20).fill();
      doc.fillColor("black").fontSize(8).font(boldFont).text("SELLER", 50, 85);
      doc.font(regularFont).text("GETS,", 50, 105);
      doc.text(
        "PLOT NO. 2, THAKARE HOUSING SOCIETY, JUNA KAMTHI ROAD, NAGPUR - 440026",
        50,
        115,
        { width: 200 }
      );
      doc.text("GSTIN: 27AFGPA6470F1ZQ", 50, 135);
      doc.text("CONTACT: GETSBH3@GMAIL.COM, +91-8329809278", 50, 150);
      doc.text("WEBSITE: WWW.GETSBH.COM", 50, 165);

      // Invoice Date and No.
      doc
        .font(boldFont)
        .text("TAX INVOICE", 430, 80, { align: "left" })
        .font(regularFont);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, 430, 105);
      doc.text(`INVOICE NO: ${invoiceData.orderNo}`, 430, 120);

      // Customer Information Box
      doc.fillColor("#d3d3d3").rect(40, 200, 200, 20).fill();
      doc.fillColor("black").font(boldFont).text("CUSTOMER", 50, 205);
      doc.font(regularFont).text(invoiceData.customer.name, 50, 225);
      doc.text(invoiceData.customer.address, 50, 240, { width: 200 });
      doc.text(`GSTIN: ${invoiceData.customer.gstNo}`, 50, 265);

      // Table Header
      const tableTop = 300;
      doc
        .fillColor("#d3d3d3")
        .rect(40, tableTop, doc.page.width - 80, 20)
        .fill();
      doc.fillColor("black").font(boldFont).fontSize(8);
      doc.text("SR NO", 50, tableTop + 5);
      doc.text("MODEL", 100, tableTop + 5);
      doc.text("DESCRIPTION", 180, tableTop + 5);
      doc.text("QTY", 350, tableTop + 5);
      doc.text("UNIT PRICE", 400, tableTop + 5);
      doc.text("TOTAL AMOUNT", 500, tableTop + 5);

      // Table Rows
      let rowTop = tableTop + 25;
      invoiceData.items.forEach((item, index) => {
        doc.font(regularFont);
        doc.text(index + 1, 50, rowTop);
        doc.text(item.model, 100, rowTop);
        doc.text(item.description, 180, rowTop);
        doc.text(item.qty, 350, rowTop, { width: 50, align: "right" });
        doc.text(`${item.unitPrice.toFixed(2)}`, 400, rowTop, {
          width: 80,
          align: "right",
        });
        doc.text(`${item.total.toFixed(2)}`, 500, rowTop, {
          width: 80,
          align: "right",
        });
        rowTop += 20;
      });

      // Subtotal and GST
      doc.text("SUBTOTAL", 400, rowTop + 10, { width: 80, align: "right" });
      doc.text(`${invoiceData.subtotal.toFixed(2)}`, 500, rowTop + 10, {
        width: 80,
        align: "right",
      });
      rowTop += 15;
      doc.text("GST @18%", 400, rowTop + 10, { width: 80, align: "right" });
      doc.text(`${invoiceData.gst.toFixed(2)}`, 500, rowTop + 10, {
        width: 80,
        align: "right",
      });
      rowTop += 20;

      // Total
      doc
        .font(boldFont)
        .text("TOTAL", 400, rowTop + 10, { width: 80, align: "right" });
      doc.text(`${invoiceData.total.toFixed(2)}`, 500, rowTop + 10, {
        width: 80,
        align: "right",
      });

      // Terms and Conditions Box
      doc
        .fillColor("#d3d3d3")
        .rect(40, rowTop + 60, doc.page.width - 80, 20)
        .fill();
      doc
        .fillColor("black")
        .fontSize(8)
        .font(boldFont)
        .text("TERMS & CONDITIONS:", 50, rowTop + 65);
      doc
        .font(regularFont)
        .text(
          "7-DAYS WARRANTY AGAINST ANY MANUFACTURING DEFECTS.",
          50,
          rowTop + 85
        );
      doc.text(
        "NO RETURN AND REPLACEMENT ONCE PRODUCT USED.",
        50,
        rowTop + 100
      );

      // Footer
      doc.moveDown(2).fontSize(8);
      doc.text(
        `TOTAL AMOUNT IN WORDS: ${invoiceData.totalInWords}`,
        50,
        rowTop + 130
      );
      doc.text("for GETS - GET EXCELLENT TECH SOLUTIONS", 50, rowTop + 150);
      doc.text("AUTHORISED SIGNATORY", 430, rowTop + 150);

      // Finalize the PDF and end the document
      doc.end();
    } else {
      res.json({ order });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: error.message || "An error occurred while creating the order.",
    });
  }
}

async function getOrders(req, res) {
  try {
    const { page = 0, pageSize = 25 } = req.query;
    const filter = {};
    const limit = +pageSize;
    const offset = page * pageSize;
    const result = await Order.findAndCountAll({
      where: filter,
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: Device,
          as: "device",
        },
      ],
      limit,
      offset,
    });
    res.json({
      totalCount: result.count,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
  }
}

async function downloadInvoice(req, res) {
  try {
    const { order_id } = req.query;

    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: Device,
          as: "device",
        },
      ],
    });

    const { unit_price, quantity, customer, device, order_no } = order || {};
    const {
      first_name,
      last_name,
      mobile,
      email,
      address,
      pincode,
      city,
      district,
      state,
      country,
      gst_no,
    } = customer || {};

    const addressList = [];
    if (address) {
      addressList.push(address);
    }
    if (city) {
      addressList.push(city);
    }
    if (district) {
      addressList.push(district);
    }
    if (state) {
      addressList.push(state);
    }
    const addresses = addressList.join(", ");
    const contrycode = [];
    if (pincode) {
      contrycode.push(pincode);
    }
    if (country) {
      contrycode.push(country);
    }
    const totalWithGST = quantity * unit_price; 
    const subtotal = totalWithGST / 1.18; 
    const gst = totalWithGST - subtotal; 
    const words = numberToWords.toWords(totalWithGST); // Convert total to words
    const date = moment(order.created_at || new Date()).format("DD/MM/YYYY");
    const logo = base64_encode(
      path.join(__dirname, '../../invoice/gets.svg')
    );
    const invoiceData = {
      logo,
      orderNo: order_no,
      date,
      customer: {
        name: toUpper(`${first_name} ${last_name}`),
        address: toUpper(
          `${addresses || ""}${contrycode?.length ? ` - ${contrycode.join(", ")}` : ""
          }`
        ),
        gstNo: gst_no || "-",
      },
      items: {
        model: device.title,
        description: device.title,
        quantity: quantity,
        unitPrice: formatNumber(unit_price),
        total: formatNumber(totalWithGST),
      },
      subtotal: formatNumber(subtotal),
      gst: formatNumber(gst),
      total: formatNumber(totalWithGST),
      totalInWords: toUpper(words),
    };
    const htmlFilePath = path.join(__dirname, '../../invoice/index.html');
    const options = {
      format: 'Letter',
      orientation: 'portrait',
      border: {
        top: '15mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm',
      },
      type: 'pdf'
    };

    res.render(
      htmlFilePath,
      invoiceData,
      (err, HTML) => {
        pdf.create(HTML, options).toBuffer((buffErr, buffer) => {
          if (buffErr) {
            return res.status(200).json({ message: buffErr.message });
          }
          const pdfBase64 = buffer.toString("base64");
          return res.json({ pdfBase64: pdfBase64, order });
        });
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: error.message || "An error occurred while creating the order.",
    });
  }
}
module.exports = {
  addOrder,
  getOrders,
  downloadInvoice,
};
