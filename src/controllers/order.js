const status = require("http-status");
const numberToWords = require("number-to-words");
const { toUpper } = require("lodash");
const pdf = require('html-pdf');
const path = require("path");
const { OrderCounter, Order, Customer, Device } = require("../models");
const { formatNumber, base64_encode } = require("../util");
const moment = require("moment");
const { sendMessage, uploadPDFToWhatsApp, getMediaMessageInput } = require("../util/messageHelper");

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
      const { htmlFilePath, invoiceData, options, order: orderInfo } = await getInvoiceTemplateData(order.id)
      res.render(
        htmlFilePath,
        invoiceData,
        (err, HTML) => {
          pdf.create(HTML, options).toBuffer(async (buffErr, buffer) => {
            if (buffErr) {
              return res.status(200).json({ message: buffErr.message });
            }
            const pdfBase64 = buffer.toString("base64");
            const { customer, order_no, device } = orderInfo
            const {
              mobile,
              first_name,
              last_name
            } = customer || {};
            try {
              // Step 1: Upload PDF to WhatsApp
              const mediaId = await uploadPDFToWhatsApp(buffer);

              // Step 2: Send media message with the uploaded PDF
              const filename = `Invoice-${order_no || ""}.pdf`

              const messageData = getMediaMessageInput({ recipient: mobile, mediaId, filename, amount: invoiceData.total, customer: `${first_name} ${last_name}`, device: device.title });
              await sendMessage(messageData);

              return res.json({ pdfBase64, order });
            } catch (error) {
              console.error('Error sending WhatsApp message:', error);
              return res.status(500).json({ message: 'Failed to send WhatsApp message.' });
            }
          });
        }
      );
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
      order: [['id', 'DESC'],]
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

    const { htmlFilePath, invoiceData, options, order } = await getInvoiceTemplateData(order_id)
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
    console.log(error);
    return ''

  }
}

const getInvoiceTemplateData = async (order_id) => {
  try {
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
    const words = numberToWords.toWords(totalWithGST);
    const date = moment(order.created_at || new Date()).format("DD/MM/YYYY");
    const logo = base64_encode(
      path.join(__dirname, '../../invoice/gets.svg')
    );
    const signature = base64_encode(
      path.join(__dirname, '../../invoice/signature.svg')
    );
    const invoiceData = {
      logo,
      signature,
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

    return { htmlFilePath, invoiceData, options, order }
  } catch (error) {
    console.log(error);
    return ''
  }
}

async function updateOrder(req, res) {
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
      customer_id,
      order_id
    } = req.body;

    await Customer.update({
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
      updated_by: user_id,
    }, { where: { id: customer_id } });


    const order = await Order.update({
      device_id,
      customer_id,
      unit_price,
      quantity,
      updated_by: user_id,
    }, { where: { id: order_id } });


    if (isShare) {
      const { htmlFilePath, invoiceData, options, order: orderInfo } = await getInvoiceTemplateData(order_id)
      res.render(
        htmlFilePath,
        invoiceData,
        (err, HTML) => {
          pdf.create(HTML, options).toBuffer(async (buffErr, buffer) => {
            if (buffErr) {
              return res.status(200).json({ message: buffErr.message });
            }
            const pdfBase64 = buffer.toString("base64");
            const { customer, order_no, device } = orderInfo
            const {
              mobile,
              first_name,
              last_name
            } = customer || {};
            try {
              // Step 1: Upload PDF to WhatsApp
              const mediaId = await uploadPDFToWhatsApp(buffer);

              // Step 2: Send media message with the uploaded PDF
              const filename = `Invoice-${order_no || ""}.pdf`

              const messageData = getMediaMessageInput({ recipient: mobile, mediaId, filename, amount: invoiceData.total, customer: `${first_name} ${last_name}`, device: device.title });
              await sendMessage(messageData);

              return res.json({ pdfBase64, order: { id: order_id, order_no } });
            } catch (error) {
              console.error('Error sending WhatsApp message:', error);
              return res.status(500).json({ message: 'Failed to send WhatsApp message.' });
            }
          });
        }
      );
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
module.exports = {
  addOrder,
  getOrders,
  downloadInvoice,
  updateOrder
};
