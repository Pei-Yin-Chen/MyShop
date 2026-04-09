export function SiteLogo({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const safeText = text?.trim() || "";

  return (
    <span
      className={[
        "inline-flex max-w-full items-center",
        "font-semibold tracking-tight text-foreground",
        "select-none",
        className ?? "",
      ].join(" ")}
      aria-label={safeText}
      title={safeText}
    >
      <span className="truncate">{safeText}</span>
    </span>
  );
}
