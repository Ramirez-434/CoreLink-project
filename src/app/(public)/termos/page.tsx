export const metadata = {
  title: "Termos de Uso | CoreLink",
  description: "Termos de uso da plataforma CoreLink.",
};

export default function TermosDeUsoPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12 prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Termos de Uso</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <p>Bem-vindo ao <strong>CoreLink / HJ Infor</strong>. Estes Termos de Uso governam a sua utilização do nosso site e plataforma SaaS.</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>Ao acessar e utilizar os serviços da HJ Infor, você concorda expressamente em cumprir e estar sujeito a estes Termos de Uso. Se você não concorda com alguma parte destes termos, você não deve utilizar a nossa plataforma.</p>

        <h2>2. Uso da Plataforma</h2>
        <p>A plataforma é fornecida "no estado em que se encontra", com a finalidade de gestão comercial e controle de acessos. Você se compromete a:</p>
        <ul>
          <li>Fornecer informações verdadeiras, exatas, atuais e completas durante o registro.</li>
          <li>Manter a confidencialidade da sua senha e dados da sua conta.</li>
          <li>Não utilizar a plataforma para qualquer propósito ilegal ou não autorizado.</li>
        </ul>

        <h2>3. Pagamentos e Assinaturas</h2>
        <p>Certos produtos e serviços estão sujeitos a pagamento (compra única ou assinatura recorrente). As condições específicas de precificação, faturamento e cancelamento serão apresentadas a você antes da conclusão da compra.</p>

        <h2>4. Propriedade Intelectual</h2>
        <p>Todo o código, software, design, textos, imagens e outras propriedades intelectuais encontradas no site são propriedade da HJ Infor. É estritamente proibido copiar, modificar, distribuir, vender ou alugar qualquer parte do nosso serviço ou do software incluído.</p>

        <h2>5. Limitação de Responsabilidade</h2>
        <p>A HJ Infor não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou exemplares, resultantes de lucros cessantes, uso de dados ou outras perdas intangíveis resultantes do uso ou da impossibilidade de uso do serviço.</p>

        <h2>6. Alterações nos Termos</h2>
        <p>Nós nos reservamos o direito de atualizar ou modificar estes Termos de Uso a qualquer momento, sem aviso prévio. O seu uso contínuo da plataforma após tais modificações constituirá a sua aceitação dos novos termos.</p>
        
      </div>
    </div>
  );
}
