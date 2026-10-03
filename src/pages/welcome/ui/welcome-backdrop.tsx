export function WelcomeBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl select-none"
      aria-hidden="true"
    >
      <div className="absolute top-1/2 left-1/2  aspect-square w-4/5 max-w-160 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -inset-8 rounded-full bg-[radial-gradient(ellipse_at_center,var(--color-primary),transparent_70%)] opacity-15 motion-safe:animate-welcome-glow" />
        <div className="absolute inset-8 rounded-full bg-[radial-gradient(ellipse_at_center,var(--color-welcome-accent),transparent_70%)] opacity-20 motion-safe:animate-welcome-glow motion-safe:[animation-delay:-6s]" />
        <div className="absolute inset-0 rounded-full border border-[var(--color-primary)] opacity-15 motion-safe:animate-welcome-orbit">
          <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-welcome-accent" />
        </div>
        <div className="absolute inset-6 rounded-full border border-welcome-accent opacity-20 motion-safe:animate-welcome-orbit motion-safe:[animation-direction:reverse] motion-safe:[animation-duration:40s]" />
        <div className="absolute top-1/2 left-1/2 size-4/5 -translate-x-1/2 -translate-y-1/2 perspective-distant">
          <img
            className="size-full object-contain opacity-10 motion-safe:animate-welcome-emblem-turn"
            src="/logo/logo-iiv.png"
            alt=""
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
