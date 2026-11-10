import { prisma } from "../src/lib/prisma";

async function main() {
  const product = await prisma.product.create({
    data: {
      name: "Nexus BI & Analytics Premium",
      price: 2499.90,
      description: "## O Futuro da Gestão Empresarial\n\nO **Nexus BI & Analytics Premium** é uma solução completa para empresas que buscam elevar sua gestão e análise de dados a um novo patamar. Com integração direta de inteligência artificial, este sistema oferece controle financeiro, gestão de estoque e relatórios preditivos em tempo real.\n\n### Funcionalidades Exclusivas\n* **Dashboard Preditivo:** Antecipe tendências de mercado com Machine Learning integrado.\n* **Automação Financeira:** Emissão de notas fiscais e conciliação bancária automáticas.\n* **Integração Omnichannel:** Conecte todos os seus canais de vendas em uma única tela.\n* **Segurança de Nível Bancário:** Criptografia end-to-end (AES-256) e backups diários automáticos na nuvem.\n\n### Como Funciona?\nNossa implementação é feita de forma fluida. Nossa equipe cuidará de toda a migração dos seus dados atuais para a nova plataforma em até 48 horas úteis.",
      imageUrl: "/images/tech-software.jpg", 
      videoUrl: "https://www.youtube.com/embed/Bey4XXJAqS8",
      isAvailable: true,
      stock: 100,
      isSubscription: false,
      features: [
        "Acesso ilimitado a todos os módulos do BI",
        "Suporte prioritário 24/7 com gerente de conta",
        "Treinamento on-line e onboarding para toda a equipe",
        "Atualizações gratuitas de software por 1 ano",
        "Painel de Analytics em Tempo Real",
        "Licença para até 50 usuários simultâneos"
      ],
      faq: [
        { 
          question: "O sistema é compatível com Mac e Windows?", 
          answer: "Sim! O Nexus BI é 100% cloud-based e funciona perfeitamente em qualquer sistema operacional através do navegador, além de contar com um app móvel para iOS e Android." 
        },
        { 
          question: "Vocês oferecem suporte para migração de dados de sistemas antigos?", 
          answer: "Com certeza. Nossa equipe de especialistas cuidará de toda a extração e importação dos seus dados (planilhas, sistemas legados, ERPs antigos) de forma segura e sem custo adicional." 
        },
        { 
          question: "Qual o prazo para liberação após o pagamento?", 
          answer: "A liberação do ambiente e das credenciais de acesso é automática e imediata após a confirmação do pagamento via PIX ou Cartão de Crédito." 
        },
        { 
          question: "É possível integrar com meu e-commerce atual?", 
          answer: "Sim, possuímos API aberta e integrações nativas com Shopify, WooCommerce, Tray, VTEX e Nuvemshop." 
        }
      ]
    }
  });

  console.log("Produto criado com sucesso! ID: " + product.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
