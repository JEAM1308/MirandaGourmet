export type LayoutOverlay = "none" | "light" | "dark";

export type BackgroundSpec = {
  imageUrl?: string;
  color?: string;
  overlay?: LayoutOverlay;
  position?: string;
  size?: string;
  repeat?: string;
  attachment?: "scroll" | "fixed";
};

export type LayoutSpec = {
  background?: BackgroundSpec;
  container?: "fixed" | "fluid";
  paddingY?: "none" | "sm" | "md" | "lg";
};
