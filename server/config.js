const dotenv = require("dotenv");

dotenv.config({ debug: false, override: true });

module.exports = {
  port: process.env.PORT || 5000,
  origin: process.env.ORIGIN || `http://localhost:${exports.port}`,
  dbconfig: {
    HOST: process.env.HOST,
    USER: process.env.DBUSER,
    PASSWORD: process.env.DBPASSWORD,
    PORT: process.env.DBPORT,
    DB: process.env.DB,
  },
  authSecret: process.env.JWT_SECRET,
  emailConfig: {
    user: process.env.ETHEREAL_EMAIL,
    pass: process.env.ETHEREAL_PASS,
  },
};
