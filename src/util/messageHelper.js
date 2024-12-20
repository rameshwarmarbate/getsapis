const axios = require('axios');
const FormData = require('form-data');
function sendMessage(data) {
  try {
    const config = {
      method: 'post',
      url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        // 'Content-Type': 'application/json'
      },
      data: data
    };

    return axios(config)
  } catch (error) {
    console.error('Error uploading PDF to WhatsApp:', error);
  }
}

function getTextMessageInput(recipient, text) {
  return {
    "messaging_product": "whatsapp",
    "preview_url": false,
    "recipient_type": "individual",
    "to": recipient,
    "type": "text",
    "text": {
      "body": text
    }
  };
}

function getMediaMessageInput({ recipient, mediaId, filename, amount, customer, device }) {
  return {
    "messaging_product": "whatsapp",
    "to": 91 + recipient,
    "type": "template",
    "template": {
      "name": "whatsapp_invoice",
      "language": {
        "code": "en_US"
      },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
              "type": "document",
              "document": {
                "id": mediaId,
                "filename": filename
              }
            }
          ]
        },
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": customer
            },
            {
              "type": "text",
              "text": device
            },
            {
              "type": "text",
              "text": `₹${amount}`
            },
            {
              "type": "text",
              "text": 'GETS - Get Excellent Tech Solutions'
            },
            {
              "type": "text",
              "text": "support@getsbh.com"
            }
          ]
        }
      ]
    }

  };
}

async function uploadPDFToWhatsApp(pdfBuffer) {
  try {
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'document');
    formData.append('file', pdfBuffer, 'Invoice.pdf');
    formData.append('caption', 'Invoice'); // Optional caption

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/media`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
          ...formData.getHeaders() // Include FormData headers
        }
      }
    );
    return uploadResponse.data.id;
  } catch (error) {
    console.error('Error uploading PDF to WhatsApp:', error);
  }
}

module.exports = {
  sendMessage: sendMessage,
  getTextMessageInput: getTextMessageInput,
  getMediaMessageInput: getMediaMessageInput,
  uploadPDFToWhatsApp: uploadPDFToWhatsApp
};