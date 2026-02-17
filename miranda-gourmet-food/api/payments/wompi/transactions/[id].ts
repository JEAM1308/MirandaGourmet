import type { VercelRequest, VercelResponse } from "@vercel/node";

type WompiTransactionStatus =
  | "APPROVED"
  | "DECLINED"
  | "PENDING"
  | "VOIDED"
  | "ERROR"
  | "UNKNOWN";

type ApiResponse =
  | { id: string; status: WompiTransactionStatus; raw?: unknown }
  | { id: string; status: "UNKNOWN" | "ERROR"; error: string; raw?: unknown };

function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).json({ error: msg });
}

function wompiBaseUrl() {
  // Para pruebas también existe sandbox: https://sandbox.wompi.co/v1/...
  return "https://production.wompi.co/v1";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  const idParam = req.query.id;

  if (!idParam || typeof idParam !== "string") {
    return badRequest(res, "Missing transaction id.");
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;

  if (!privateKey) {
    const out: ApiResponse = {
      id: idParam,
      status: "UNKNOWN",
      error: "Wompi not configured (missing WOMPI_PRIVATE_KEY).",
    };
    return res.status(501).json(out);
  }

  try {
    // En Vercel/Node moderno suele existir fetch global.
    const response = await fetch(`${wompiBaseUrl()}/transactions/${idParam}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${privateKey}`,
      },
    });

    if (!response.ok) {
      const out: ApiResponse = {
        id: idParam,
        status: "ERROR",
        error: `Wompi API error (${response.status})`,
      };
      return res.status(500).json(out);
    }

    const data: unknown = await response.json();

    const wompiStatus = (() => {
      if (!data || typeof data !== "object") return undefined;
      const maybeData = (data as { data?: unknown }).data;
      if (!maybeData || typeof maybeData !== "object") return undefined;
      const status = (maybeData as { status?: unknown }).status;
      return typeof status === "string" ? (status as WompiTransactionStatus) : undefined;
    })();

    const out: ApiResponse = {
      id: idParam,
      status: wompiStatus ?? "UNKNOWN",
      raw: data,
    };

    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    const out: ApiResponse = {
      id: idParam,
      status: "ERROR",
      error: "Unexpected server error calling Wompi.",
    };
    return res.status(500).json(out);
  }
}
