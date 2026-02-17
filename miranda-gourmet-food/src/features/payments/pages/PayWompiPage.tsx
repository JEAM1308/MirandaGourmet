import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Container, Spinner } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";

type WompiCurrency = "COP";

type WompiPayloadOk = {
  kind: "ok";
  publicKey: string;
  currency: WompiCurrency;
  amountInCents: number;
  reference: string;
  signature: string;
  redirectUrl: string;
};

type WompiPayloadErr = {
  kind: "error";
  error: string;
};

type WompiPayload = WompiPayloadOk | WompiPayloadErr;

type WidgetCheckoutConstructor = new (options: {
  publicKey: string;
  currency: WompiCurrency;
  amountInCents: number;
  reference: string;
  signature: { integrity: string };
}) => {
  open: (openOptions: { redirectUrl: string }) => void;
};

type WompiWindow = Window & {
  WidgetCheckout?: WidgetCheckoutConstructor;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load: ${src}`)));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    script.onerror = () => reject(new Error(`Failed to load: ${src}`));

    document.body.appendChild(script);
  });
}

function getRequiredParam(params: URLSearchParams, key: string): string {
  const v = params.get(key);
  if (!v || v.trim().length === 0) throw new Error(`Missing "${key}" in URL`);
  return v;
}

function parsePositiveInt(value: string, name: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n) || n <= 0) throw new Error(`Invalid "${name}"`);
  return Math.floor(n);
}

export default function PayWompiPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "opened" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo<WompiPayload>(() => {
    try {
      const publicKey = getRequiredParam(searchParams, "publicKey");
      const currency = getRequiredParam(searchParams, "currency") as WompiCurrency;
      const amountInCents = parsePositiveInt(getRequiredParam(searchParams, "amountInCents"), "amountInCents");
      const reference = getRequiredParam(searchParams, "reference");
      const signature = getRequiredParam(searchParams, "signature");
      const redirectUrl = getRequiredParam(searchParams, "redirectUrl");

      if (currency !== "COP") throw new Error(`Unsupported currency: ${currency}`);

      return {
        kind: "ok",
        publicKey,
        currency,
        amountInCents,
        reference,
        signature,
        redirectUrl,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid checkout params";
      return { kind: "error", error: msg };
    }
  }, [searchParams]);

  useEffect(() => {
        if (payload.kind === "error") {
            setStatus("error");
            setError(payload.error);
            return;
        }

        const okPayload = payload;

        let cancelled = false;

        async function run() {
            try {
            setStatus("loading");

            await loadScript("https://checkout.wompi.co/widget.js");

            if (cancelled) return;

            const w = window as WompiWindow;
            if (!w.WidgetCheckout)
                throw new Error("Wompi widget not available (WidgetCheckout missing).");

            const checkout = new w.WidgetCheckout({
                publicKey: okPayload.publicKey,
                currency: okPayload.currency,
                amountInCents: okPayload.amountInCents,
                reference: okPayload.reference,
                signature: { integrity: okPayload.signature },
            });

            checkout.open({ redirectUrl: okPayload.redirectUrl });

            setStatus("opened");
            } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Failed to open Wompi Checkout";
            setStatus("error");
            setError(msg);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
        }, [payload]);


  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h4 mb-2">Redirigiendo a Wompi…</h1>
          <div className="text-muted mb-4">Estamos abriendo el checkout para completar tu pago de forma segura.</div>

          {status === "loading" && (
            <div className="d-flex align-items-center gap-2">
              <Spinner size="sm" />
              <div className="text-muted">Cargando checkout…</div>
            </div>
          )}

          {status === "opened" && (
            <Alert variant="info" className="mb-0">
              Si el checkout no se abre automáticamente, revisa si tu navegador bloqueó ventanas emergentes.
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="danger">
              <div className="fw-semibold mb-1">No se pudo abrir Wompi</div>
              <div className="small">{error ?? "Error desconocido"}</div>
              <div className="mt-3 d-flex gap-2">
                <Link to="/cart" className="btn btn-outline-secondary btn-sm">
                  Volver al carrito
                </Link>
                <Link to="/" className="btn btn-dark btn-sm">
                  Ir al inicio
                </Link>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
