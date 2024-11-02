const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');
const generateOTP = () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const hashPassword = async (password) => {
  const saltRounds = 10; // The number of rounds to use for generating the salt
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};
const verifyPassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
function formatNumber(num = 0, decimal = 2) {
  if (!num || isNaN(parseFloat(num))) {
    return 0;
  }
  return parseFloat(parseFloat(num || 0)?.toFixed(decimal));
}


const base64_encode = (file) => {
  try {
    // Read the SVG file and encode it to Base64
    return `data:image/svg+xml;base64,` + fs.readFileSync(file, { encoding: 'base64' });
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
    return null; // Handle the error according to your needs
  }
};

module.exports = {
  generateOTP,
  hashPassword,
  verifyPassword,
  formatNumber,
  base64_encode
};
