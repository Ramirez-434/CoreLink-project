import { PrismaClient } from "@prisma/client";
import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

/**
 * Configuração otimizada do Pool de Conexões para Neon Serverless PostgreSQL.
 * Mantém conexões aquecidas via TCP Keep-Alive e tolera o tempo de despertar (cold start)
 * do compute node serverless do Neon.
 */
const POOL_CONFIG: PoolConfig = {
  connectionString,
  max: 10, // Limite seguro para pooler serverless / conexões simultâneas
  min: 1, // Mantém ao menos 1 conexão pré-alocada quando ativo
  idleTimeoutMillis: 30_000, // Fecha conexões ociosas antes do drop silencioso de firewall
  connectionTimeoutMillis: 15_000, // Tolera cold start inicial do Neon (até 15s)
  keepAlive: true, // Evita queda de socket TCP em conexões persistentes
  keepAliveInitialDelayMillis: 10_000,
};

const RETRYABLE_ERROR_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1008", // Operations timed out
  "P1017", // Server has closed the connection
  "57P01", // admin_shutdown (Neon scale-to-zero / compute suspend)
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now (compute waking up)
  "08006", // connection_failure
  "08003", // connection_does_not_exist
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
]);

function isTransientDatabaseError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, any>;
  const code = String(err.code || err.errno || "");
  if (RETRYABLE_ERROR_CODES.has(code)) return true;

  const message = String(err.message || "").toLowerCase();
  return (
    message.includes("connection terminated") ||
    message.includes("connection closed") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("socket hang up") ||
    message.includes("server has closed the connection") ||
    message.includes("terminating connection due to administrator command")
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executa uma operação assíncrona no banco de dados com rotina de re-tentativa (retry)
 * e Exponential Backoff + Jitter para neutralizar falhas de Cold Start no Neon PostgreSQL.
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; operationName?: string } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const opName = options.operationName ?? "prisma-query";

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt > maxRetries || !isTransientDatabaseError(error)) {
        throw error;
      }

      // Exponential backoff com jitter (ex: ~250ms, ~500ms, ~1000ms)
      const jitter = Math.floor(Math.random() * 80);
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1) + jitter;

      console.warn(
        `[CoreLink DB Retry] Falha transitória/Cold Start em "${opName}" (tentativa ${attempt}/${maxRetries}). Nova tentativa em ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }

  throw lastError;
}

type GlobalPrismaState = {
  pgPool?: Pool;
  prismaDB?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as GlobalPrismaState;

export const pgPool: Pool =
  globalForPrisma.pgPool ??
  (() => {
    const p = new Pool(POOL_CONFIG);
    // Evita crash do processo Node caso um cliente ocioso seja encerrado pelo Neon ao entrar em repouso
    p.on("error", (err) => {
      console.warn("[CoreLink DB Pool] Aviso de conexão ociosa reciclada pelo Neon:", err.message);
    });
    return p;
  })();

function createOptimizedPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(pgPool);
  const baseClient = new PrismaClient({ adapter });

  // Intercepta todas as queries de todos os modelos aplicando retry automático contra Cold Start
  const extendedClient = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          return withDatabaseRetry(() => query(args), {
            maxRetries: 3,
            baseDelayMs: 250,
            operationName: `${model}.${operation}`,
          });
        },
      },
    },
  });

  return extendedClient as unknown as PrismaClient;
}

export const prisma: PrismaClient = globalForPrisma.prismaDB ?? createOptimizedPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pgPool;
  globalForPrisma.prismaDB = prisma;
}

/**
 * Pré-aquece o pool de conexões com o Neon PostgreSQL e retorna a telemetria de latência.
 */
export async function warmupDatabaseConnection() {
  const start = performance.now();
  await withDatabaseRetry(() => pgPool.query("SELECT 1 AS alive"), {
    maxRetries: 3,
    baseDelayMs: 200,
    operationName: "db.warmup",
  });
  const latencyMs = Number((performance.now() - start).toFixed(2));

  return {
    ok: true,
    latencyMs,
    pool: {
      totalCount: pgPool.totalCount,
      idleCount: pgPool.idleCount,
      waitingCount: pgPool.waitingCount,
      maxConnections: POOL_CONFIG.max,
    },
  };
}
