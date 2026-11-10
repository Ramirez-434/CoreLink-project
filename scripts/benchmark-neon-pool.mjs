import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env', 'utf8');
const connectionString = envFile.match(/DATABASE_URL="([^"]+)"/)?.[1];

const POOL_CONFIG = {
  connectionString,
  max: 10,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

const pool = new Pool(POOL_CONFIG);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withDatabaseRetry(operation, { maxRetries = 3, baseDelayMs = 250, opName = 'query' } = {}) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation(attempt);
    } catch (err) {
      if (attempt > maxRetries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`  [RETRY] Falha transitoria detectada em "${opName}" (${err.code || err.message}). Tentativa ${attempt}/${maxRetries} em ${delay}ms...`);
      await sleep(delay);
    }
  }
}

async function runBenchmark() {
  console.log('\n====================================================================');
  console.log('  BENCHMARK DE CONEXAO SERVERLESS - NEON POSTGRESQL + PRISMA POOL');
  console.log('====================================================================');
  console.log(`  Configuracao do Pool: max=${POOL_CONFIG.max}, min=${POOL_CONFIG.min}, keepAlive=${POOL_CONFIG.keepAlive}, timeout=${POOL_CONFIG.connectionTimeoutMillis}ms\n`);

  // 1. Medição de Cold Start / Handshake Inicial
  const t0 = performance.now();
  await withDatabaseRetry(() => pool.query('SELECT 1 AS warmup'), { opName: 'db.warmup' });
  const coldStartMs = (performance.now() - t0).toFixed(2);
  console.log(`  [1] Requisicao Inicial (Handshake + Wakeup): ${coldStartMs} ms`);

  // 2. Medições Subsequentes Reutilizando o Pool Aquecido
  const latencies = [];
  for (let i = 1; i <= 4; i++) {
    const start = performance.now();
    await withDatabaseRetry(() => prisma.order.count(), { opName: 'Order.count' });
    const elapsed = Number((performance.now() - start).toFixed(2));
    latencies.push(elapsed);
    console.log(`  [${i + 1}] Query Prisma no Pool Aquecido #${i}:        ${elapsed.toFixed(2)} ms (totalCount=${pool.totalCount}, idle=${pool.idleCount})`);
  }

  const avgPooled = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const reductionPct = (((Number(coldStartMs) - Number(avgPooled)) / Number(coldStartMs)) * 100).toFixed(1);

  console.log('\n--------------------------------------------------------------------');
  console.log('  SIMULACAO DE RECUPERACAO AUTOMATICA (COLD START / ECONNRESET)');
  console.log('--------------------------------------------------------------------');
  let simulatedAttempts = 0;
  const simResult = await withDatabaseRetry(async (attempt) => {
    simulatedAttempts = attempt;
    if (attempt < 3) {
      const err = new Error('Connection terminated unexpectedly due to Neon scale-to-zero');
      err.code = '57P01';
      throw err;
    }
    return await prisma.product.count();
  }, { maxRetries: 3, baseDelayMs: 250, opName: 'Product.count' });

  console.log(`  [OK] Operacao recuperada com sucesso na tentativa #${simulatedAttempts}! Total de produtos: ${simResult}`);

  console.log('\n====================================================================');
  console.log('  RESUMO DE TELEMETRIA E DESEMPENHO');
  console.log('====================================================================');
  console.log(`  Latencia Inicial (Cold/Handshake): ${coldStartMs} ms`);
  console.log(`  Latencia Media (Pool Aquecido):    ${avgPooled} ms`);
  console.log(`  Reducao de Latencia Pos-Warmup:    -${reductionPct}%`);
  console.log(`  Status da Rotina de Retry:         OPERACIONAL (0 falhas finais)`);
  console.log('====================================================================\n');

  await prisma.$disconnect();
  await pool.end();
}

runBenchmark().catch((e) => {
  console.error(e);
  process.exit(1);
});
