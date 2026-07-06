import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import eventRoutes from "./routes/event/route.ts";
import * as RabbitMQ from "./messaging/rabbitmq.ts";

const app = new Hono();

app.use(cors());
app.route("/event", eventRoutes);

RabbitMQ.connect();

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
