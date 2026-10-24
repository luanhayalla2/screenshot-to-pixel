// Catálogo oficial e regras de cálculo (fonte confiável — usado só no servidor).
export type Produto = { id: string; nome: string; descricao: string; precoCentavos: number };

export const PRODUTOS: Produto[] = [
  { id: "headset-pulse", nome: "Headset Gamer Pulse", descricao: "Som imersivo e conforto para suas partidas.", precoCentavos: 19990 },
  { id: "mouse-velocity", nome: "Mouse Gamer Velocity", descricao: "Precisão e agilidade em cada movimento.", precoCentavos: 12990 },
  { id: "teclado-phantom", nome: "Teclado Mecânico Phantom", descricao: "Desempenho e estilo para sua estação gamer.", precoCentavos: 24990 },
];

// Regra fictícia da loja: subtotal >= R$ 500,00 recebe 10% de desconto.
export const DESCONTO_MINIMO_CENTAVOS = 50000;
export const DESCONTO_PERCENTUAL = 10;

export class ErroValidacao extends Error {}

export type ResultadoSimulacao = {
  nenhumSelecionado: boolean;
  mensagem: string | null;
  itens: { produtoId: string; nome: string; quantidade: number; precoUnitarioCentavos: number; subtotalCentavos: number }[];
  subtotalCentavos: number;
  descontoPercentual: number;
  descontoCentavos: number;
  totalCentavos: number;
};

export function simular(body: unknown): ResultadoSimulacao {
  if (!body || typeof body !== "object" || !Array.isArray((body as { itens?: unknown }).itens)) {
    throw new ErroValidacao("Requisição malformada: envie um objeto com a lista 'itens'.");
  }
  const entrada = (body as { itens: unknown[] }).itens;
  const itens: ResultadoSimulacao["itens"] = [];
  for (const raw of entrada) {
    if (!raw || typeof raw !== "object") throw new ErroValidacao("Cada item deve ser um objeto.");
    const { produtoId, quantidade } = raw as { produtoId?: unknown; quantidade?: unknown };
    const produto = PRODUTOS.find((p) => p.id === produtoId);
    if (!produto) throw new ErroValidacao(`Produto inexistente: ${String(produtoId)}.`);
    if (typeof quantidade !== "number" || !Number.isInteger(quantidade) || quantidade < 0 || quantidade > 1000) {
      throw new ErroValidacao(`Quantidade inválida para ${produto.nome}.`);
    }
    if (quantidade === 0) continue;
    // Qualquer preço enviado pelo navegador é ignorado: usa-se o catálogo.
    itens.push({
      produtoId: produto.id,
      nome: produto.nome,
      quantidade,
      precoUnitarioCentavos: produto.precoCentavos,
      subtotalCentavos: produto.precoCentavos * quantidade,
    });
  }
  const subtotalCentavos = itens.reduce((s, i) => s + i.subtotalCentavos, 0);
  const temDesconto = subtotalCentavos >= DESCONTO_MINIMO_CENTAVOS;
  const descontoPercentual = temDesconto ? DESCONTO_PERCENTUAL : 0;
  const descontoCentavos = Math.round((subtotalCentavos * descontoPercentual) / 100);
  return {
    nenhumSelecionado: itens.length === 0,
    mensagem: itens.length === 0 ? "Nenhum produto foi selecionado." : null,
    itens,
    subtotalCentavos,
    descontoPercentual,
    descontoCentavos,
    totalCentavos: subtotalCentavos - descontoCentavos,
  };
}

export const formatarReais = (centavos: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
