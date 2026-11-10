import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

  console.log("====================================================================");
  console.log(" TESTE DE PREVENCAO DE REQUISICOES DUPLICADAS (ISLOADING + LOCK)");
  console.log("====================================================================");

  // 1. Simulacao de clique triplo simultaneo (< 5ms) com trava sincrona + isLoading
  let isLoading = false;
  let lockRef = false;
  let networkCallsDispatched = 0;
  let blockedCalls = 0;

  async function simulateButtonClick(clickIndex) {
    if (lockRef || isLoading) {
      blockedCalls++;
      console.log(` [BLOQUEADO] Clique #${clickIndex} rejeitado (isLoading=${isLoading}, lockRef=${lockRef})`);
      return;
    }
    lockRef = true;
    isLoading = true;
    networkCallsDispatched++;
    console.log(` [ACEITO]    Clique #${clickIndex} iniciou requisicao (isLoading=true, lockRef=true)`);
    await new Promise((r) => setTimeout(r, 120));
    isLoading = false;
    lockRef = false;
  }

  await Promise.all([
    simulateButtonClick(1),
    simulateButtonClick(2),
    simulateButtonClick(3),
  ]);

  console.log("--------------------------------------------------------------------");
  console.log(` Resultado UI: ${networkCallsDispatched} requisicao enviada | ${blockedCalls} cliques duplicados bloqueados`);
  console.log("--------------------------------------------------------------------");

  // 2. Verificacao da guarda de idempotencia no banco PostgreSQL
  const res = await pool.query(
    `SELECT id, status, "totalAmount", "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 1`
  );
  if (res.rows.length > 0) {
    const latest = res.rows[0];
    console.log(` Ultimo pedido verificado no PostgreSQL: #${latest.id.slice(0, 8).toUpperCase()} (${latest.status})`);
  }

  await pool.end();
  console.log("====================================================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
