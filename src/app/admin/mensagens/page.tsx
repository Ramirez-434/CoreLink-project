import { prisma } from "@/lib/prisma";
import { Trash2 } from "lucide-react";
import { deleteMessage } from "@/actions/message";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function removeMessage(formData: FormData) {
    "use server";
    await deleteMessage(formData);
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Mensagens Recebidas</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            Nenhuma mensagem recebida ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Data</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Nome</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">E-mail</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Assunto</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm">Mensagem</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-sm text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {msg.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{msg.name}</td>
                    <td className="p-4 text-sm text-primary font-medium whitespace-nowrap">
                      <a href={`mailto:${msg.email}`}>{msg.email}</a>
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white font-bold whitespace-nowrap">{msg.subject}</td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300 min-w-[300px]">
                      {msg.message}
                    </td>
                    <td className="p-4 text-right">
                      <form action={removeMessage}>
                        <input type="hidden" name="id" value={msg.id} />
                        <button type="submit" className="text-gray-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50" title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
