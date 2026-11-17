// Mockup integration with MercadoPago (Server-only module; not exposed as public RPC)
export async function createPaymentIntent(orderId: string, amount: number) {
  console.log(`Payment intent created for Order ${orderId} with amount R$ ${amount}`);
  return { success: true, paymentUrl: "https://mercadopago.com.br/mock-payment" };
}

export async function handleWebhook(_paymentId: string, _status: string) {
  return { received: true };
}
