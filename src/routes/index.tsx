import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import hero from "@/assets/hero.jpg";
import headset from "@/assets/headset.jpg";
import mouse from "@/assets/mouse.jpg";
import teclado from "@/assets/teclado.jpg";
import { formatarReais, type Produto, type ResultadoSimulacao } from "@/lib/simulacao";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elite Game Store — Simulador de Compras" },
      { name: "description", content: "Loja gamer fictícia com simulador de compras: headset, mouse e teclado com cálculo de desconto no servidor." },
      { property: "og:title", content: "Elite Game Store — Simulador de Compras" },
      { property: "og:description", content: "Equipe-se para a vitória. Jogue em outro nível." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const IMAGENS: Record<string, string> = { "headset-pulse": headset, "mouse-velocity": mouse, "teclado-phantom": teclado };

async function buscarProdutos(): Promise<Produto[]> {
  const r = await fetch("/api/produtos");
  if (!r.ok) throw new Error();
  return (await r.json()).produtos;
}

// Simulação acadêmica: prompt() + Number() + alert(), cálculo oficial no servidor via fetch().
async function simularCompra() {
  let produtos: Produto[];
  try {
    produtos = await buscarProdutos();
  } catch {
    alert("Não foi possível concluir a simulação: servidor indisponível.");
    return;
  }
  const itens: { produtoId: string; quantidade: number }[] = [];
  for (const p of produtos) {
    let quantidade = NaN;
    while (true) {
      const resposta = prompt(`Quantas unidades de ${p.nome} (${formatarReais(p.precoCentavos)})?\nDigite 0 para não comprar.`);
      if (resposta === null) {
        alert("Simulação cancelada.");
        return;
      }
      quantidade = Number(resposta);
      if (resposta.trim() !== "" && Number.isInteger(quantidade) && quantidade >= 0) break;
      alert("Entrada inválida. Digite um número inteiro maior ou igual a zero.");
    }
    itens.push({ produtoId: p.id, quantidade });
  }
  try {
    const r = await fetch("/api/compras/simular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens }),
    });
    const dados = await r.json();
    if (!r.ok) {
      alert(`Não foi possível concluir a simulação: ${dados.erro ?? "erro desconhecido"}`);
      return;
    }
    const res = dados as ResultadoSimulacao;
    if (res.nenhumSelecionado) {
      alert("Nenhum produto foi selecionado.");
      return;
    }
    const linhas = res.itens.map(
      (i) => `${i.quantidade}x ${i.nome} — ${formatarReais(i.precoUnitarioCentavos)} cada = ${formatarReais(i.subtotalCentavos)}`,
    );
    alert(
      `RESUMO DA SIMULAÇÃO\n\n${linhas.join("\n")}\n\nSubtotal: ${formatarReais(res.subtotalCentavos)}\nDesconto (${res.descontoPercentual}%): ${formatarReais(res.descontoCentavos)}\nTotal: ${formatarReais(res.totalCentavos)}\n\nSimulação acadêmica — nenhum pagamento real foi realizado.`,
    );
  } catch {
    alert("Não foi possível concluir a simulação: falha de comunicação com o servidor.");
  }
}

function Logo() {
  return (
    <a href="#inicio" className="flex items-center gap-2.5" aria-label="Elite Game Store — início">
      <svg viewBox="0 0 32 36" className="h-9 w-8" aria-hidden="true">
        <path d="M16 1 30 6v11c0 9-6 15-14 18C8 32 2 26 2 17V6z" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="16" cy="17" r="5.5" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <path d="M16 8v5M16 21v5M7 17h5M20 17h5" stroke="var(--primary)" strokeWidth="2" />
      </svg>
      <span className="font-display leading-none">
        <span className="block text-lg font-bold tracking-wider">ELITE GAME</span>
        <span className="block text-[0.65rem] tracking-[0.4em] text-muted-foreground">STORE</span>
      </span>
    </a>
  );
}

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200";
const btnPrimary = `${btn} bg-brand text-primary-foreground shadow-card hover:brightness-110 hover:-translate-y-0.5`;
const btnGhost = `${btn} border border-border text-foreground hover:border-accent hover:text-accent`;

const NAV = [
  ["#inicio", "Início"],
  ["#produtos", "Produtos"],
  ["#como-funciona", "Como funciona"],
  ["#sobre", "Sobre"],
];

function Index() {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [erro, setErro] = useState(false);
  const [menu, setMenu] = useState(false);
  const [falhas, setFalhas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    buscarProdutos().then(setProdutos).catch(() => setErro(true));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Logo />
          <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
            {NAV.map(([h, l]) => (
              <a key={h} href={h} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l}</a>
            ))}
            <a href="#simulacao" className={`${btnPrimary} px-5 py-2`}>Simular compra</a>
          </nav>
          <button
            className="rounded-md border border-border px-3 py-2 text-sm md:hidden"
            aria-expanded={menu}
            aria-controls="menu-movel"
            onClick={() => setMenu(!menu)}
          >
            {menu ? "Fechar" : "Menu"}
          </button>
        </div>
        {menu && (
          <nav id="menu-movel" aria-label="Menu móvel" className="flex flex-col gap-1 border-t border-border px-5 py-3 md:hidden">
            {[...NAV, ["#simulacao", "Simular compra"]].map(([h, l]) => (
              <a key={h} href={h} onClick={() => setMenu(false)} className="rounded-md px-2 py-2 text-sm hover:bg-secondary">{l}</a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section id="inicio" className="relative overflow-hidden">
          <img src={hero} alt="Headset, teclado e mouse gamer iluminados em azul e roxo" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="relative mx-auto max-w-6xl px-5 py-28 md:py-40">
            <p className="mb-4 font-display text-xs tracking-[0.35em] text-accent">JOGUE EM OUTRO NÍVEL</p>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Equipe-se para a <span className="text-brand">vitória.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Descubra acessórios gamer que combinam desempenho, precisão e estilo. Escolha seus produtos favoritos e experimente nossa simulação de compras.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#produtos" className={btnGhost}>Explorar produtos</a>
              <button type="button" onClick={simularCompra} className={btnPrimary}>Simular compra</button>
            </div>
          </div>
        </section>

        <section id="produtos" className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Produtos</h2>
          <p className="mt-2 text-muted-foreground">Preços oficiais carregados do servidor.</p>
          {erro && <p role="alert" className="mt-8 text-destructive">Não foi possível carregar o catálogo. Tente novamente mais tarde.</p>}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(produtos ?? []).map((p) => (
              <article key={p.id} data-produto-id={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-card">
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  {falhas[p.id] ? (
                    <div className="flex h-full items-center justify-center font-display text-muted-foreground">{p.nome}</div>
                  ) : (
                    <img src={IMAGENS[p.id]} alt={p.nome} loading="lazy" width={944} height={704} onError={() => setFalhas((f) => ({ ...f, [p.id]: true }))} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">{p.nome}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.descricao}</p>
                  <p className="mt-5 font-display text-2xl font-bold text-accent">{formatarReais(p.precoCentavos)}</p>
                </div>
              </article>
            ))}
            {!produtos && !erro && [0, 1, 2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-card" />)}
          </div>
        </section>

        <section id="como-funciona" className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Como funciona</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {["Escolha os produtos.", "Informe as quantidades.", "Confira o subtotal, o desconto e o total."].map((t, i) => (
                <li key={t} className="rounded-2xl border border-border bg-background p-6">
                  <span className="font-display text-4xl font-bold text-brand">0{i + 1}</span>
                  <p className="mt-3 font-medium">{t}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-muted-foreground">
              Compras a partir de {formatarReais(50000)} recebem 10% de desconto (regra fictícia da loja).
            </p>
            <p className="mt-2 rounded-lg border border-violet/40 bg-violet/10 px-4 py-3 text-sm">
              Esta é uma simulação acadêmica. Nenhum pagamento real é realizado.
            </p>
          </div>
        </section>

        <section id="simulacao" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-glow" />
          <div className="relative mx-auto max-w-3xl px-5 py-28 text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Pronto para subir de nível?</h2>
            <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-muted-foreground">
              <li>• Clique em "Simular compra".</li>
              <li>• Informe a quantidade desejada para cada produto.</li>
              <li>• Digite zero para não comprar um item.</li>
              <li>• Confira o resultado apresentado pelo navegador.</li>
            </ul>
            <button type="button" onClick={simularCompra} className={`${btnPrimary} mt-10 px-10 py-4 text-base`}>Simular compra</button>
          </div>
        </section>
      </main>

      <footer id="sobre" className="border-t border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">Equipe-se para a vitória. Jogue em outro nível.</p>
          </div>
          <nav aria-label="Rodapé" className="flex flex-col gap-2 text-sm text-muted-foreground">
            {NAV.map(([h, l]) => <a key={h} href={h} className="hover:text-foreground">{l}</a>)}
          </nav>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="text-foreground">Projeto desenvolvido por Luã Hayalla Oliveira Silva</p>
            <p>Técnico em Desenvolvimento de Sistemas — Trilhas</p>
            <p>Trilha: Lógica de Programação com JavaScript</p>
            <p>Desafio 1 — Minha Loja: Simulador de Compras</p>
            <p>2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
