import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrder } from "../_data/order.store";

function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).json({ error: msg });
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  const idParam = req.query.id;

  if (!idParam || typeof idParam !== "string") {
    return badRequest(res, "Missing order id.");
  }

  const order = getOrder(idParam);

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  return res.status(200).json(order);
}
