"use client";

import { useState } from "react";
import { createCoupon, toggleCouponStatus } from "@/actions/coupon";
import { Tag, Plus, CheckCircle2, XCircle } from "lucide-react";

export function CuponsManager({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createCoupon(formData);
    
    if (res.success) {
      window.location.reload(); // Quick refresh to get new data
    } else {
      alert(res.error);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await toggleCouponStatus(id, isActive);
    if (res.success) {
      setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Tag className="text-primary" size={32} />
          Cupons de Desconto
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover-lift flex items-center gap-2"
        >
          <Plus size={18} /> Novo Cupom
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Nenhum cupom ativo no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Código</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Desconto</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Usos</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                      <span className="bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 font-mono tracking-wider">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary dark:text-blue-400">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue} OFF`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "usos"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        coupon.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {coupon.isActive ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                        {coupon.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(coupon.id, coupon.isActive)}
                        className={`text-xs px-4 py-2 rounded-xl font-medium transition-colors ${
                          coupon.isActive ? "bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100" : "bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {coupon.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Cupom</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Código do Cupom *</label>
                  <input required name="code" type="text" placeholder="Ex: BEMVINDO20" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase font-mono" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipo de Desconto</label>
                    <select name="discountType" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="PERCENTAGE">Porcentagem (%)</option>
                      <option value="FIXED">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valor *</label>
                    <input required name="discountValue" type="number" step="0.01" min="0" placeholder="Ex: 10" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Limite de Usos (Opcional)</label>
                  <input name="usageLimit" type="number" min="1" placeholder="Ex: 100" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para uso ilimitado.</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
