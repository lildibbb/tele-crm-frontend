// SVG logos with cropped viewBox (removes 9000×9000 whitespace)
const LOGO_FULL = "/assets/logo/titan-logo-02.svg";
const LOGO_ICON = "/assets/logo/titan-logo-03.svg";

// Heights in px — increased from original so logo is visible at proper size
const SIZE_HEIGHT: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 88,
};

interface TitanLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

export function TitanLogo({
  variant = "full",
  size = "md",
  className,
  priority = false,
}: TitanLogoProps) {
  const src = variant === "icon" ? LOGO_ICON : LOGO_FULL;
  const height = SIZE_HEIGHT[size];

  // Use <img> for SVG — Next.js Image doesn't add value for unoptimized SVGs
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={variant === "full" ? "Titan Trade Circle" : ""}
      aria-hidden={variant === "icon" ? true : undefined}
      style={{ width: "auto", height: `${height}px`, display: "block" }}
      className={className}
      {...(priority ? { fetchPriority: "high" } : {})}
    />
  );
}
