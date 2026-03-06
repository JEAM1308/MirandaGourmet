const required = <T extends string>(v: T | undefined, name: string): T => {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

export const env = {
  paymentProvider:
    (import.meta.env.VITE_PAYMENT_PROVIDER as "bold") ?? "bold",

  // Bold (solo publica va en frontend; privadas en serverless)
  boldApiKey: import.meta.env.VITE_BOLD_API_KEY as string | undefined,

  siteUrl: required(import.meta.env.VITE_PUBLIC_SITE_URL, "VITE_PUBLIC_SITE_URL"),
};
