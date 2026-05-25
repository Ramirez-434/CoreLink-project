export default function SobrePage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <div className="container relative z-10 mx-auto px-4 py-16 max-w-4xl animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 text-transparent bg-clip-text animate-gradient-x">
            Sobre a HJ Infor
          </span>
        </h1>
      
      <div className="space-y-8 text-gray-800 dark:text-gray-300 leading-relaxed">
        <p>
          A <strong>HJ Infor</strong> é uma empresa de tecnologia dedicada a transformar a maneira como pequenas e médias empresas gerenciam seus negócios. Desde nossa fundação, temos o compromisso de entregar sistemas inovadores, fáceis de usar e altamente eficientes.
        </p>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Nossa Missão</h2>
        <p>
          Nossa missão é democratizar o acesso à tecnologia de gestão de ponta. Acreditamos que todo negócio, independente de seu tamanho, merece ferramentas poderosas para controlar estoque, finanças e vendas com precisão.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Por que nos escolher?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Inovação Constante:</strong> Nossos sistemas são atualizados regularmente para atender às novas demandas do mercado.</li>
          <li><strong>Suporte Dedicado:</strong> Nossa equipe está sempre pronta para ajudar você a tirar o máximo proveito das nossas soluções.</li>
          <li><strong>Simplicidade:</strong> Interfaces limpas e intuitivas, para que você não perca tempo aprendendo a usar o software.</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
