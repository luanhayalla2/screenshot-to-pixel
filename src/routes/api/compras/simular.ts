import { createFileRoute } from "@tanstack/react-router";
import { simular, ErroValidacao } from "@/lib/simulacao";

export const Route = createFileRoute("/api/compras/simular")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ erro: "JSON inválido." }, { status: 400 });
        }
        try {
          return Response.json(simular(body));
        } catch (e) {
          if (e instanceof ErroValidacao) return Response.json({ erro: e.message }, { status: 400 });
          return Response.json({ erro: "Erro interno ao simular a compra." }, { status: 500 });
        }
      },
    },
  },
});
