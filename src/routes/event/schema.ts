import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(0),
  offset: z.coerce.number().int().min(0),
});

export const detailSchema = z.object({
  id: z.string(),
});

export const createSchema = z.object({
  name: z.string(),
  markets: z.array(
    z.object({
      name: z.string(),
      header: z.string(),
      asset_type: z.enum(["CHOICE"]),
      liquidity_b: z.number().positive().optional(),
      assets_options: z.array(
        z.object({
          name: z.string(),
        }),
      ),
    }),
  ),
});

export const paginationValidator = zValidator("query", paginationSchema);
export const detailValidator = zValidator("query", detailSchema);
export const createSchemaValidator = zValidator("json", createSchema);
