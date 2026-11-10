import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAnalytics() {
  const users = await prisma.user.findMany({ take: 3 });
  const products = await prisma.product.findMany();

  console.log('Produtos encontrados:', products.map(p => `${p.name} (R$ ${p.price})`));

  const nexus = products.find(p => p.name.includes('Nexus')) || products[0];
  const melisma = products.find(p => p.name.toLowerCase().includes('melisma')) || products[0];

  // Garante um terceiro software corporativo caso só existam 2 ativos com receita
  let erpCloud = products.find(p => p.name.includes('CoreLink ERP'));
  if (!erpCloud) {
    erpCloud = await prisma.product.create({
      data: {
        name: 'CoreLink ERP Cloud Enterprise',
        description: 'Sistema ERP corporativo completo com controle fiscal, faturamento NF-e e gestão financeira multi-CNPJ.',
        price: 1490.00,
        imageUrl: '/images/tech-product.jpg',
        isAvailable: true,
        stock: 50,
        features: [
          'Emissão ilimitada de NF-e e NFS-e',
          'Gestão financeira e fluxo de caixa B2B',
          'Controle de estoque multi-filial'
        ]
      }
    });
    console.log('Produto criado:', erpCloud.name);
  }

  const targetUser = users[0];
  if (!targetUser) {
    console.log('Nenhum usuário encontrado.');
    return;
  }

  // Verifica se já inserimos os pedidos de demonstração de Analytics UC04
  const existingNexusOrders = await prisma.order.count({
    where: { productId: nexus.id, status: 'COMPLETED' }
  });

  if (existingNexusOrders === 0) {
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    await prisma.order.createMany({
      data: [
        {
          userId: targetUser.id,
          productId: erpCloud.id,
          quantity: 2,
          totalAmount: erpCloud.price * 2,
          status: 'COMPLETED',
          createdAt: daysAgo(12),
        },
        {
          userId: targetUser.id,
          productId: melisma.id,
          quantity: 1,
          totalAmount: melisma.price,
          status: 'COMPLETED',
          createdAt: daysAgo(5),
        },
        {
          userId: targetUser.id,
          productId: nexus.id,
          quantity: 1,
          totalAmount: nexus.price,
          status: 'COMPLETED',
          createdAt: daysAgo(2),
        },
        {
          userId: targetUser.id,
          productId: erpCloud.id,
          quantity: 1,
          totalAmount: erpCloud.price,
          status: 'COMPLETED',
          createdAt: daysAgo(0),
        }
      ]
    });
    console.log('Pedidos de Analytics (UC04) inseridos com sucesso para enriquecer as curvas de faturamento!');
  } else {
    console.log('Pedidos de Analytics (UC04) já estão presentes no banco.');
  }

  // Exibe resumo consolidado para documentação de evidência
  const allOrders = await prisma.order.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: 'asc' }
  });

  let acc = 0;
  console.log('\n=== EVOLUCAO DO FATURAMENTO ACUMULADO (COMPLETED) ===');
  for (const o of allOrders) {
    if (o.status === 'COMPLETED') {
      const val = o.totalAmount ?? o.product?.price ?? 0;
      acc += val;
      console.log(`${o.createdAt.toLocaleDateString('pt-BR')} | + R$ ${val.toFixed(2)} | Acumulado: R$ ${acc.toFixed(2)} | Software: ${o.product?.name}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

seedAnalytics().catch(e => { console.error(e); process.exit(1); });
