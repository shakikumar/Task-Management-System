const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  __internal: {
    configOverride: (config) => {
      config.inlineSchema = ""; 
      return config;
    }
  }
});

module.exports = prisma;