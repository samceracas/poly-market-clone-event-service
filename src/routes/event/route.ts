import { Hono } from "hono";
import { prisma } from "../../prisma.ts";
import {
  createSchemaValidator,
  detailValidator,
  paginationValidator,
} from "./schema.ts";
import { getPublishChannel } from "../../messaging/rabbitmq.ts";
import { EVENT_CREATED, EVENT_EXCHANGE } from "../../messaging/constants.ts";

const app = new Hono();

app.get("/list", paginationValidator, async (c) => {
  const { limit, offset } = c.req.valid("query");
  const events = await prisma.event.findMany({
    orderBy: {
      created_at: "desc",
    },
    take: limit,
    skip: offset,
    include: {
      _count: {
        select: { markets: true },
      },
    },
  });
  return c.json(events);
});

app.get("/details", detailValidator, async (c) => {
  const { id } = c.req.valid("query");
  const event = await prisma.event.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      markets: {
        include: {
          assets_options: true,
        },
      },
    },
    take: 1,
  });
  return c.json(event);
});

app.post("create", createSchemaValidator, async (c) => {
  const body = c.req.valid("json");
  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.event.create({
      data: {
        name: body.name,
        markets: {
          // createMany can't do nested relation writes, so each market
          // (and its assets_options) has to be created individually here.
          create: body.markets.map((market) => ({
            name: market.name,
            header: market.header,
            asset_type: market.asset_type,
            liquidity_b: market.liquidity_b,
            assets_options: {
              create: market.assets_options.map((option) => ({
                name: option.name,
              })),
            },
          })),
        },
      },
      include: {
        markets: {
          include: {
            assets_options: true,
          },
        },
      },
    });

    try {
      const channel = getPublishChannel();

      channel.publish(
        EVENT_EXCHANGE,
        EVENT_CREATED,
        Buffer.from(JSON.stringify(entry)),
        {
          persistent: true,
        },
      );
    } catch (err) {
      // Publish is best-effort: trade-service's reconciliation pull (GET /event/sync/full)
      // backfills anything missed here on its next connect/reconnect.
      console.error("Failed to publish event.created, will rely on reconciliation:", err);
    }

    return entry;
  });

  return c.json(result);
});

app.get("/sync/full", async (c) => {
  const events = await prisma.event.findMany({
    where: {
      deleted_at: null,
    },
    include: {
      markets: {
        where: {
          deleted_at: null,
        },
        include: {
          assets_options: {
            where: {
              deleted_at: null,
            },
          },
        },
      },
    },
  });

  return c.json(events);
});

export default app;
