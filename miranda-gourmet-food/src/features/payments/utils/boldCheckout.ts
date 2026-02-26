import type { BoldEmbeddedCheckoutResult } from "../types/payments.types";

const BOLD_SCRIPT_SRC = "https://checkout.bold.co/library/boldPaymentButton.js";

type BoldCheckoutConfig = {
  orderId: string;
  currency: "COP" | "USD";
  amount: string;
  apiKey: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
  renderMode?: "embedded";
};

type BoldCheckoutInstance = {
  open(): void;
};

type BoldCheckoutConstructor = new (config: BoldCheckoutConfig) => BoldCheckoutInstance;

declare global {
  interface Window {
    BoldCheckout?: BoldCheckoutConstructor;
  }
}

function loadBoldScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${BOLD_SCRIPT_SRC}"]`,
    );

    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();

      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed to load: ${BOLD_SCRIPT_SRC}`)),
      );

      return;
    }

    const script = document.createElement("script");
    script.src = BOLD_SCRIPT_SRC;
    script.async = true;
    script.dataset.loaded = "false";

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    script.onerror = () => reject(new Error(`Failed to load: ${BOLD_SCRIPT_SRC}`));

    document.head.appendChild(script);
  });
}

export async function openBoldEmbeddedCheckout(
  session: BoldEmbeddedCheckoutResult,
): Promise<void> {
  await loadBoldScript();

  const BoldCtor = window.BoldCheckout;

  if (!BoldCtor) {
    throw new Error("BoldCheckout no está disponible en la ventana.");
  }

  const amountStr = String(session.amount);

  const checkout = new BoldCtor({
    orderId: session.orderId,
    currency: session.currency,
    amount: amountStr,
    apiKey: session.apiKey,
    integritySignature: session.integritySignature,
    description: session.description,
    redirectionUrl: session.redirectionUrl,
    renderMode: "embedded",
  });

  checkout.open();
}

export {};

