import { describe, it, expect } from "vitest";
import { simular, ErroValidacao } from "./simulacao";

describe("simulação de compras", () => {
  it("nenhum produto", () => {
    const r = simular({ itens: [{ produtoId: "headset-pulse", quantidade: 0 }] });
    expect(r.nenhumSelecionado).toBe(true);
    expect(r.totalCentavos).toBe(0);
  });
  it("dois headsets sem desconto", () => {
    const r = simular({ itens: [{ produtoId: "headset-pulse", quantidade: 2 }] });
    expect([r.subtotalCentavos, r.descontoCentavos, r.totalCentavos]).toEqual([39980, 0, 39980]);
  });
  it("um headset e três teclados com 10%", () => {
    const r = simular({ itens: [{ produtoId: "headset-pulse", quantidade: 1 }, { produtoId: "teclado-phantom", quantidade: 3 }] });
    expect([r.subtotalCentavos, r.descontoCentavos, r.totalCentavos]).toEqual([94960, 9496, 85464]);
  });
  it("um mouse", () => {
    const r = simular({ itens: [{ produtoId: "mouse-velocity", quantidade: 1 }] });
    expect(r.totalCentavos).toBe(12990);
  });
  it("rejeita quantidade inválida", () => {
    for (const q of [-1, 1.5, "2", null]) {
      expect(() => simular({ itens: [{ produtoId: "mouse-velocity", quantidade: q }] })).toThrow(ErroValidacao);
    }
  });
  it("rejeita produto inexistente", () => {
    expect(() => simular({ itens: [{ produtoId: "xyz", quantidade: 1 }] })).toThrow(ErroValidacao);
  });
  it("ignora preço adulterado", () => {
    const r = simular({ itens: [{ produtoId: "mouse-velocity", quantidade: 1, preco: 1 }] });
    expect(r.totalCentavos).toBe(12990);
  });
});
