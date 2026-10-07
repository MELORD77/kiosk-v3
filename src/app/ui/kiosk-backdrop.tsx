export function KioskBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-1 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute top-1/2 left-1/2 aspect-square w-[min(80%,72dvh,640px)] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-kiosk-primary opacity-10 motion-safe:animate-welcome-orbit motion-safe:[animation-duration:60s]">
          <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-welcome-accent" />
        </div>
        <div className="absolute inset-6 rounded-full border border-welcome-accent opacity-10 motion-safe:animate-welcome-orbit motion-safe:[animation-direction:reverse] motion-safe:[animation-duration:80s]" />
        <div className="absolute top-1/2 left-1/2 size-4/5 -translate-x-1/2 -translate-y-1/2 perspective-distant">
          <img
            className="size-full object-contain opacity-[0.07] motion-safe:animate-welcome-emblem-turn motion-safe:[animation-duration:64s]"
            src={`${import.meta.env.BASE_URL}logo/logo-iiv.png`}
            alt=""
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
