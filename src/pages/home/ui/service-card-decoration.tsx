export function ServiceCardDecoration() {
  return (
    <span
      className="service-card-decoration pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      <span className="absolute -top-[35%] -right-[23%] h-[180%] w-[28%] rotate-32 rounded-tl-[45%] bg-kiosk-service-card-accent opacity-[0.02]" />
      <span className="absolute top-[15%] -right-[30%] h-[160%] w-[42%] rotate-32 rounded-tl-[55%] bg-kiosk-service-card-accent opacity-[0.03]" />
      <span className="absolute inset-y-0 left-0 w-[26%] opacity-[var(--service-card-dots-opacity)] bg-[radial-gradient(circle,var(--color-service-card-accent)_var(--service-card-dot-radius),transparent_var(--service-card-dot-fade))] bg-size-[8px_8px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%),radial-gradient(ellipse_at_bottom_left,black,transparent_70%)]" />
    </span>
  );
}
