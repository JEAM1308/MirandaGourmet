const required = <T extends string>(v: T | undefined, name: string): T => {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

export const env = {
  paymentProvider: (import.meta.env.VITE_PAYMENT_PROVIDER as "stripe" | "wompi") ?? "stripe",

  // Stripe
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined,

  // Wompi (solo pública va en frontend; privadas en serverless)
  wompiPublicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined,

  siteUrl: required(import.meta.env.VITE_PUBLIC_SITE_URL, "VITE_PUBLIC_SITE_URL"),
};
