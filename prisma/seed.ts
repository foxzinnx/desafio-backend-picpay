import { PrismaClient } from '../src/generated/prisma/client'; // Ajuste o path se necessário
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Limpa o banco antes
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // 1. Cria Usuário Comum (Payer)
  const commonUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'João Pagador',
      document: '111.111.111-11',
      email: 'joao@teste.com',
      password: 'senha-segura-hash',
      type: 'COMMON',
      wallet: {
        create: {
          balance: 1000 
        }
      }
    },
    include: { wallet: true }
  });

  const merchantUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Loja do Mário',
      document: '22.222.222/0001-22',
      email: 'loja@teste.com',
      password: 'senha-segura-hash',
      type: 'MERCHANT',
      wallet: {
        create: {
          balance: 0
        }
      }
    },
    include: { wallet: true }
  });

  console.log('Seed realizado com sucesso.');
  console.log(`Payer (Comum): ${commonUser.wallet?.id} (Saldo: 1000)`);
  console.log(`Payee (Lojista): ${merchantUser.wallet?.id} (Saldo: 0)`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());