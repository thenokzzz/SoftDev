const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Accounts = {
  async findAll() {
    const result = await prisma.accounts.findMany();
    return result;
  },

  async findById(id) {
    const result = await prisma.accounts.findUnique({
      where: { id: parseInt(id) },
    });
    return result;
  },

  async create({ name, email, password, number_phone, role = 'user' }) {
    const result = await prisma.accounts.create({
      data: {
        name,
        email,
        password,
        number_phone,
        role,
      },
    });
    return result;
  },

  async delete(id) {
    const result = await prisma.accounts.delete({
      where: { id: parseInt(id) },
    });
    return result;
  }
};

module.exports = Accounts;
