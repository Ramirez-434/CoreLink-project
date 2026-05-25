"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/product";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  videoUrl: string | null;
  isAvailable: boolean;
  stock: number;
  isSubscription: boolean;
  billingCycle: string | null;
  features: string[];
  faq: any;
};

export function ProdutosManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openNewModal = () => {
    setEditingProduct(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, formData);
    } else {
      res = await createProduct(formData);
    }

    setLoading(false);

    if (res.success) {
      closeModal();
      // Since we revalidatePath on server, next.js will automatically refetch data
    } else {
      setError(res.error || "Ocorreu um erro desconhecido.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir permanentemente este produto?")) {
      const res = await deleteProduct(id);
      if (!res.success) {
        alert(res.error || "Erro ao deletar produto.");
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              const csv = [
                ["ID", "Nome", "Preço", "Estoque", "Disponível"],
                ...products.map(p => [p.id, p.name, p.price, p.stock, p.isAvailable ? "Sim" : "Não"])
              ].map(e => e.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "produtos.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            Exportar CSV
          </button>
          <button 
            onClick={openNewModal}
            className="bg-primary text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium hover:bg-primary-hover hover-lift transition-all shadow-md w-full sm:w-auto"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar produto pelo nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Nome do Produto</th>
                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Preço</th>
                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Estoque</th>
                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 font-medium">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center font-bold">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {product.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                      {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {product.stock} un.
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.isAvailable && product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {product.isAvailable && product.stock > 0 ? "Disponível" : "Indisponível"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 p-2 rounded-lg transition-colors shadow-sm"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300 p-2 rounded-lg transition-colors shadow-sm"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-xl text-sm font-medium">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Nome do Produto *</label>
                  <input required type="text" name="name" defaultValue={editingProduct?.name} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400 focus:outline-none transition-all" />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Descrição Completa * (Suporta Markdown)</label>
                  <textarea required name="description" rows={5} defaultValue={editingProduct?.description} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all resize-none"></textarea>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Funcionalidades Principais (separadas por vírgula)</label>
                  <textarea name="featuresString" rows={2} defaultValue={editingProduct?.features?.join(", ")} placeholder="Multi-usuários, Nota Fiscal, Relatórios..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all resize-none"></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Perguntas Frequentes (FAQ - formato JSON)</label>
                  <textarea name="faqJson" rows={3} defaultValue={editingProduct?.faq ? JSON.stringify(editingProduct.faq, null, 2) : "[\n  {\n    \"question\": \"Tem mensalidade?\",\n    \"answer\": \"Não, o pagamento é único.\"\n  }\n]"} className="w-full px-4 py-2.5 font-mono text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all resize-none"></textarea>
                </div>
                
                <div className="col-span-1">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Preço (R$) *</label>
                  <input required type="number" step="0.01" name="price" defaultValue={editingProduct?.price} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all" />
                </div>

                <div className="col-span-1">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Estoque Inicial *</label>
                  <input required type="number" min="0" name="stock" defaultValue={editingProduct?.stock || 0} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">Status *</label>
                  <select name="isAvailable" defaultValue={editingProduct ? String(editingProduct.isAvailable) : "true"} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all bg-white">
                    <option value="true">Disponível</option>
                    <option value="false">Indisponível (Pausado)</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">URL da Imagem</label>
                  <input type="url" name="imageUrl" defaultValue={editingProduct?.imageUrl || ""} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all" />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1">URL do Vídeo</label>
                  <input type="url" name="videoUrl" defaultValue={editingProduct?.videoUrl || ""} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all" />
                </div>
                <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="isSubscription" 
                        value="true"
                        defaultChecked={editingProduct?.isSubscription} 
                        className="peer sr-only"
                        onChange={(e) => {
                          const select = document.getElementById("billingCycleSelect") as HTMLSelectElement;
                          if (select) select.disabled = !e.target.checked;
                        }}
                      />
                      <div className="block w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-primary transition-colors"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Este produto é uma assinatura recorrente (SaaS)</span>
                  </label>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-1">Ciclo de Cobrança</label>
                  <select 
                    id="billingCycleSelect"
                    name="billingCycle" 
                    defaultValue={editingProduct?.billingCycle || "MONTHLY"} 
                    disabled={!editingProduct?.isSubscription}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all disabled:opacity-50"
                  >
                    <option value="MONTHLY">Mensal</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                  {loading ? "Salvando..." : editingProduct ? "Salvar Alterações" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
