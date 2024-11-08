/* Copyright (c) Meta Platforms, Inc. and affiliates.
* All rights reserved.
*
* This source code is licensed under the license found in the
* LICENSE file in the root directory of this source tree.
*/

const axios = require('axios');

function sendMessage(data) {
  const config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  return axios(config)
}

function getTextMessageInput(recipient, text) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    "preview_url": false,
    "recipient_type": "individual",
    "to": recipient,
    "type": "text",
    "text": {
      "body": text
    }
  });
}

function getMediaMessageInput(recipient, mediaId) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    "to": recipient,
    "type": "document",
    "document": {
      "id": mediaId
    }
  });
}

async function uploadPDFToWhatsApp(pdfBase64) {
  try {
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/media`,
      {
        type: 'document',
        document: {
          caption: 'Invoice',
          file: pdfBase64
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return uploadResponse.data.id;
  } catch (error) {
    console.error('Error uploading PDF to WhatsApp:', error);
    throw new Error('Failed to upload PDF to WhatsApp.');
  }
}

module.exports = {
  sendMessage: sendMessage,
  getTextMessageInput: getTextMessageInput,
  getMediaMessageInput: getMediaMessageInput,
  uploadPDFToWhatsApp: uploadPDFToWhatsApp
};