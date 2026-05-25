"use server";

import { Resend } from "resend";

// Usando uma API Key mockada se não houver no .env.
// Para usar em produção, basta colocar RESEND_API_KEY no arquivo .env
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_123");

export async function sendOrderConfirmationEmail(userEmail: string, userName: string, productName: string, orderId: string) {
  try {
    // Se for mock (sem chave real), nós apenas mostramos no console para a demonstração
    if (!process.env.RESEND_API_KEY) {
      console.log(`[MOCK EMAIL] Enviado para ${userEmail}: Pedido ${orderId} de ${productName} confirmado!`);
      return { success: true, mock: true };
    }

    const { data, error } = await resend.emails.send({
      from: "CoreLink <suporte@corelink.com.br>", // Precisa ser um domínio verificado no Resend
      to: [userEmail],
      subject: `Seu pedido #${orderId.slice(0,8).toUpperCase()} foi confirmado! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Pedido Confirmado!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Seu pagamento foi aprovado e seu acesso ao sistema <strong>${productName}</strong> já está liberado!</p>
            <p>Para acessar seu produto, faça login na sua conta CoreLink e vá até a aba "Meus Sistemas".</p>
            <br/>
            <p>Abraços,<br/>Equipe CoreLink</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error(error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[MOCK EMAIL] Boas vindas enviadas para ${userEmail}`);
      return { success: true, mock: true };
    }

    await resend.emails.send({
      from: "CoreLink <suporte@corelink.com.br>",
      to: [userEmail],
      subject: "Bem-vindo(a) à CoreLink! 🚀",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Bem-vindo(a) à CoreLink!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Estamos muito felizes em ter você conosco. Nossa plataforma foi desenhada para transformar a gestão da sua empresa.</p>
            <p>Acesse o catálogo para conferir os sistemas disponíveis!</p>
            <br/>
            <p>Abraços,<br/>Equipe CoreLink</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email", error);
    return { success: false, error };
  }
}
