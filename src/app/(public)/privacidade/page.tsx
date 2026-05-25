export const metadata = {
  title: "Política de Privacidade | CoreLink",
  description: "Nossa política de privacidade e compromisso com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12 prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <p>A <strong>HJ Infor / CoreLink</strong> valoriza a sua privacidade e está empenhada em proteger os seus dados pessoais. Esta política de privacidade informará como cuidamos dos seus dados pessoais quando você visita o nosso site e informará sobre os seus direitos de privacidade e como a lei protege você (Lei Geral de Proteção de Dados - LGPD).</p>

        <h2>1. Dados que coletamos</h2>
        <p>Podemos coletar, usar, armazenar e transferir diferentes tipos de dados pessoais sobre você, agrupados da seguinte forma:</p>
        <ul>
          <li><strong>Dados de Identidade:</strong> inclui nome e sobrenome.</li>
          <li><strong>Dados de Contato:</strong> inclui endereço de e-mail e números de telefone.</li>
          <li><strong>Dados de Transação:</strong> inclui detalhes sobre pagamentos e outros detalhes de produtos e serviços que você adquiriu de nós.</li>
          <li><strong>Dados Técnicos:</strong> inclui endereço IP, seus dados de login, tipo e versão do navegador, configuração de fuso horário e localização.</li>
        </ul>

        <h2>2. Como usamos os seus dados pessoais</h2>
        <p>Apenas utilizaremos os seus dados pessoais quando a lei nos permitir. Mais comumente, usaremos seus dados nas seguintes circunstâncias:</p>
        <ul>
          <li>Quando precisarmos executar o contrato que estamos prestes a celebrar ou já celebramos com você (ex: liberar acesso ao sistema).</li>
          <li>Onde for necessário para nossos interesses legítimos e seus interesses e direitos fundamentais não se sobrepuserem a esses interesses.</li>
          <li>Onde precisarmos cumprir uma obrigação legal ou regulatória.</li>
        </ul>

        <h2>3. Seus Direitos Legais (LGPD)</h2>
        <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:</p>
        <ul>
          <li><strong>Solicitar acesso</strong> aos seus dados pessoais.</li>
          <li><strong>Solicitar a correção</strong> dos dados pessoais que mantemos sobre você.</li>
          <li><strong>Solicitar a exclusão</strong> dos seus dados pessoais.</li>
          <li><strong>Opor-se ao processamento</strong> dos seus dados pessoais.</li>
          <li><strong>Solicitar a portabilidade</strong> dos seus dados pessoais.</li>
        </ul>
        <p>Se você deseja exercer algum desses direitos, por favor, entre em contato conosco enviando um e-mail para a nossa equipe de suporte.</p>

        <h2>4. Contato</h2>
        <p>Para dúvidas sobre esta política de privacidade ou sobre nossas práticas de privacidade, entre em contato conosco em:</p>
        <p><strong>E-mail:</strong> lgpd@corelink.com.br</p>

      </div>
    </div>
  );
}
