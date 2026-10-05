import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';

// Lê o DATABASE_URL do .env
const envFile = readFileSync('.env', 'utf8');
const dbUrl = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function validar() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, price: true } },
      coupon: { select: { code: true, discountType: true, discountValue: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n==========================================');
  console.log('  VALIDACAO DE PERSISTENCIA - TB_PEDIDO  ');
  console.log('==========================================');
  console.log('  Total de registros gravados:', orders.length);
  console.log('');

  orders.forEach((o, i) => {
    const desconto = o.product.price - o.totalAmount;
    console.log('--- Pedido #' + (i+1) + ' -------');
    console.log('  ID:             ' + o.id);
    console.log('  Cliente:        ' + o.user.name + ' <' + o.user.email + '>');
    console.log('  FK userId:      ' + o.userId);
    console.log('  Produto:        ' + o.product.name);
    console.log('  FK productId:   ' + o.productId);
    console.log('  Preco original: R$ ' + o.product.price.toFixed(2));
    console.log('  Desconto aplic: R$ ' + (desconto > 0 ? desconto.toFixed(2) : '0.00'));
    console.log('  Total gravado:  R$ ' + o.totalAmount.toFixed(2));
    console.log('  Cupom:          ' + (o.coupon ? o.coupon.code + ' (' + o.coupon.discountType + ')' : 'Nenhum'));
    console.log('  Quantidade:     ' + o.quantity);
    console.log('  Status:         ' + o.status);
    console.log('  Criado em:      ' + new Date(o.createdAt).toLocaleString('pt-BR'));
    console.log('');
  });

  const totalReceita = orders.reduce((s, o) => s + o.totalAmount, 0);
  const byStatus = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});

  console.log('==========================================');
  console.log('  RESUMO CONSOLIDADO');
  console.log('==========================================');
  console.log('  Total de pedidos:  ' + orders.length);
  for (const [st, ct] of Object.entries(byStatus)) {
    console.log('  Status ' + st + ':'.padEnd(12) + ct + ' pedido(s)');
  }
  console.log('  Receita total:     R$ ' + totalReceita.toFixed(2));
  console.log('');
  console.log('  INTEGRIDADE REFERENCIAL (Foreign Keys):');
  const semUser    = orders.filter(o => !o.user).length;
  const semProduct = orders.filter(o => !o.product).length;
  console.log('  FK userId valida:    ' + (semUser === 0    ? 'OK - 0 violacoes' : 'FALHA - ' + semUser + ' registros'));
  console.log('  FK productId valida: ' + (semProduct === 0 ? 'OK - 0 violacoes' : 'FALHA - ' + semProduct + ' registros'));
  console.log('==========================================');
  console.log('  Validacao concluida com sucesso!');
  console.log('==========================================\n');

  await prisma.$disconnect();
  await pool.end();
}

validar().catch(e => { console.error(e); process.exit(1); });
