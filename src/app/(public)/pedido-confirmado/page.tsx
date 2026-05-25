import Link from "next/link";
import { CheckCircle, Phone } from "lucide-react";

export default function PedidoConfirmadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px-200px)] py-12 px-4">
      
      <div className="text-center mb-8">
        <CheckCircle size={80} className="text-gray-900 mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="text-3xl font-extrabold text-gray-900">Pedido Confirmado!</h1>
      </div>

      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg w-full max-w-md flex justify-between items-center mb-8">
        <span className="font-bold text-lg">Sistema de Gestão AdminPro</span>
        <span className="font-bold text-lg">Preço: 1.400,00</span>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <a 
          href="https://wa.me/5511999999999?text=Olá,%20acabei%20de%20fazer%20o%20pedido%20do%20Sistema%20de%20Gestão%20AdminPro."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-hover hover-lift transition-all shadow-md"
        >
          WHATSAPP SUPORTE
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </a>
        
        <Link 
          href="/"
          className="flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-hover hover-lift transition-all shadow-md"
        >
          voltar
        </Link>
      </div>

    </div>
  );
}
