import Fastify from "fastify";
import { WebSocketServer } from "ws";
import { answerFromFaq } from "./assistant/faq.js";
import { runReplyLoop, type LoopState } from "./assistant/reply-loop.js";
import { classifyTicket } from "./triage/classify.js";

const app = Fastify({ logger: true });

app.post<{ Body: { subject: string; body: string } }>("/triage", async (req) =>
  classifyTicket(req.body.subject, req.body.body),
);

app.post<{ Body: { question: string } }>("/faq", async (req) => ({
  answer: await answerFromFaq(req.body.question),
}));

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT ?? 3001) });
wss.on("connection", (socket) => {
  socket.on("message", async (raw) => {
    const state = JSON.parse(String(raw)) as LoopState;
    await runReplyLoop(state, socket);
  });
});

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
