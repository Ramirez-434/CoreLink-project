const activeCheckoutLocks = new Map();
const processedIdempotencyKeys = new Map();
let dbTransactionsOpened = 0;

async function simulatedServerCreateOrder(userId, productId, idempotencyKey, reqIndex) {
  const lockKey = `${userId}:${productId}`;

  if (idempotencyKey && processedIdempotencyKeys.has(idempotencyKey)) {
    const cached = processedIdempotencyKeys.get(idempotencyKey);
    console.log(
      ` [SERVER][DEDUP KEY] Req #${reqIndex} interceptada via idempotencyKey -> Pedido #${cached.orderId}`
    );
    return { success: true, orderId: cached.orderId, deduplicated: true };
  }

  if (activeCheckoutLocks.has(lockKey)) {
    console.log(
      ` [SERVER][MUTEX TOCTOU] Req #${reqIndex} chegou em paralelo (0ms) -> Coalescida na transacao ativa!`
    );
    const first = await activeCheckoutLocks.get(lockKey);
    return { ...first, deduplicated: true };
  }

  const promise = (async () => {
    dbTransactionsOpened++;
    console.log(` [SERVER][PRISMA TX] Req #${reqIndex} abriu transacao unica no PostgreSQL...`);
    await new Promise((r) => setTimeout(r, 95));
    const orderId = "CMVE99A1";
    if (idempotencyKey) {
      processedIdempotencyKeys.set(idempotencyKey, { orderId, timestamp: Date.now() });
    }
    return { success: true, orderId, deduplicated: false };
  })();

  activeCheckoutLocks.set(lockKey, promise);
  try {
    return await promise;
  } finally {
    activeCheckoutLocks.delete(lockKey);
  }
}

async function main() {
  console.log("========================================================================");
  console.log(" AUDITORIA DE SEGURANCA - VULNERABILIDADE 2 (CONCORRENCIA DE CHECKOUT)");
  console.log("========================================================================");

  // 1. Ataque de 5 cliques simultaneos na interface (/checkout)
  let isLoading = false;
  let checkoutLockRef = false;
  let uiDispatched = 0;
  let uiBlocked = 0;
  const idempotencyKey = "chk_erp_m2p9x_8f3a1b";

  async function triggerCheckoutButton(clickNum) {
    if (checkoutLockRef || isLoading) {
      uiBlocked++;
      console.log(
        ` [CLIENT][BLOQUEADO] Clique #${clickNum} neutralizado na UI (isLoading=${isLoading}, lockRef=${checkoutLockRef})`
      );
      return;
    }
    checkoutLockRef = true;
    isLoading = true;
    uiDispatched++;
    console.log(` [CLIENT][ENVIADO]   Clique #${clickNum} aceito -> Disparando Server Action...`);
    await simulatedServerCreateOrder("user_01", "prod_erp", idempotencyKey, clickNum);
    isLoading = false;
  }

  await Promise.all([
    triggerCheckoutButton(1),
    triggerCheckoutButton(2),
    triggerCheckoutButton(3),
    triggerCheckoutButton(4),
    triggerCheckoutButton(5),
  ]);

  console.log("------------------------------------------------------------------------");
  console.log(" SIMULACAO DE ATAQUE DIRETO VIA REDE (BYPASS DE UI - 3 POSTS PARALELOS)");
  console.log("------------------------------------------------------------------------");

  dbTransactionsOpened = 0;
  const netResults = await Promise.all([
    simulatedServerCreateOrder("user_02", "prod_bi", "chk_bi_991", 1),
    simulatedServerCreateOrder("user_02", "prod_bi", "chk_bi_991", 2),
    simulatedServerCreateOrder("user_02", "prod_bi", "chk_bi_991", 3),
  ]);

  const deduplicatedCount = netResults.filter((r) => r.deduplicated).length;
  console.log("========================================================================");
  console.log(
    ` RESUMO: Cliques UI Bloqueados: ${uiBlocked}/4 | Transacoes DB em Ataque Paralelo: ${dbTransactionsOpened} (Coalescidas: ${deduplicatedCount})`
  );
  console.log("========================================================================");
}

main();
