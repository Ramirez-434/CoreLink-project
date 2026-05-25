import { getSystemSetting } from "@/actions/settings";
import { ToggleTour } from "./ToggleTour";

export default async function ConfiguracoesPage() {
  const isTourEnabled = await getSystemSetting("onboarding_tour_enabled", "false");
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações Gerais</h1>
        <p className="text-gray-500 text-sm">Gerencie as preferências e integrações do seu sistema.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        
        {/* Sessão 1: Informações da Loja */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Informações da Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Nome Fantasia</label>
              <input type="text" defaultValue="HJ Infor" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">E-mail de Contato Principal</label>
              <input type="email" defaultValue="contato@hjinfor.com.br" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">CNPJ</label>
              <input type="text" placeholder="00.000.000/0000-00" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
          </div>
          <button className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Salvar Informações
          </button>
        </div>

        {/* Sessão 2: Preferências */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Preferências do Sistema</h2>
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">Modo de Manutenção</h4>
                <p className="text-sm text-gray-500">Bloqueia o acesso público ao site com uma mensagem de manutenção.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">Notificações por E-mail</h4>
                <p className="text-sm text-gray-500">Receber um e-mail a cada nova mensagem no "Fale Conosco" e novo pedido.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <ToggleTour initialValue={isTourEnabled === "true"} />

          </div>
        </div>

        {/* Sessão 3: Zona de Perigo */}
        <div className="p-8 bg-red-50/30">
          <h2 className="text-lg font-bold text-red-600 mb-2">Zona de Perigo</h2>
          <p className="text-sm text-gray-600 mb-6">Ações destrutivas não podem ser desfeitas. Tenha cuidado.</p>
          <button className="border border-red-200 text-red-600 bg-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
            Limpar Cache do Sistema
          </button>
        </div>

      </div>
    </div>
  );
}
