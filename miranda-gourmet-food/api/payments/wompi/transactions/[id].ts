import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { saveOrder } from "../../../_data/order.store";
import { getCheckout, deleteCheckout } from "../../../_data/checkout.store";

type WompiTransactionStatus =
  | "APPROVED"
  | "DECLINED"
  | "PENDING"
  | "VOIDED"
  | "ERROR"
  | "UNKNOWN";

type ApiResponse =
  | {
      id: string;
      status: WompiTransactionStatus;
      orderId?: string;
      raw?: unknown;
    }
  | {
      id: string;
      status: "UNKNOWN" | "ERROR";
      error: string;
    };

function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).json({ error: msg });
}

function wompiBaseUrl() {
  return "https://production.wompi.co/v1";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  const idParam = req.query.id;

  if (!idParam || typeof idParam !== "string") {
    return badRequest(res, "Missing transaction id.");
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;

  if (!privateKey) {
    return res.status(501).json({
      id: idParam,
      status: "UNKNOWN",
      error: "Wompi not configured (missing WOMPI_PRIVATE_KEY).",
    } satisfies ApiResponse);
  }

  try {
    const response = await fetch(
      `${wompiBaseUrl()}/transactions/${idParam}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${privateKey}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        id: idParam,
        status: "ERROR",
        error: `Wompi API error (${response.status})`,
      } satisfies ApiResponse);
    }

    const data: unknown = await response.json();

    // Extraer información de forma segura
    let wompiStatus: WompiTransactionStatus = "UNKNOWN";
    let reference: string | undefined;
    let amountInCents: number | undefined;

    if (data && typeof data === "object") {
      const maybeData = (data as { data?: unknown }).data;

      if (maybeData && typeof maybeData === "object") {
        const obj = maybeData as {
          status?: unknown;
          reference?: unknown;
          amount_in_cents?: unknown;
        };

        if (typeof obj.status === "string") {
          wompiStatus = obj.status as WompiTransactionStatus;
        }

        if (typeof obj.reference === "string") {
          reference = obj.reference;
        }

        if (typeof obj.amount_in_cents === "number") {
          amountInCents = obj.amount_in_cents;
        }
      }
    }

    let createdOrderId: string | undefined;

    // 🔥 Crear Order si está aprobado
    if (wompiStatus === "APPROVED" && reference) {
      const snapshot = getCheckout(reference);

      if (snapshot) {
        const orderId = randomUUID();

        saveOrder({
          id: orderId,
          provider: "wompi",
          transactionId: idParam,
          status: "APPROVED",
          currency: "COP",
          totalAmountCents:
            amountInCents ?? snapshot.totalAmountCents,
          items: snapshot.items,
          createdAtISO: new Date().toISOString(),
        });

        deleteCheckout(reference);

        createdOrderId = orderId;
      }
    }

    return res.status(200).json({
      id: idParam,
      status: wompiStatus,
      orderId: createdOrderId,
      raw: data,
    } satisfies ApiResponse);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      id: idParam,
      status: "ERROR",
      error: "Unexpected server error calling Wompi.",
    } satisfies ApiResponse);
  }
}
