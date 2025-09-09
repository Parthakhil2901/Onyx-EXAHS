// Secure LinkedIn Configuration
// This file should be kept server-side and never exposed to client

const linkedinConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID || "8641j4uacfz29p",
  clientSecret:
    process.env.LINKEDIN_CLIENT_SECRET || "WPL_AP1.qVYuOqxwK54SrbS5.pIvLhg",
};

module.exports = linkedinConfig;
