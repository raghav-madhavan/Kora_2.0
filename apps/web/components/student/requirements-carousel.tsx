"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getBrightFuturesTiers } from "@/lib/compliance";
import { student } from "@/lib/mock-data";
import { useHours } from "@/components/student/hours-provider";
import { ProgressRing } from "@/components/student/progress-ring";
import { useCountUp } from "@/lib/use-count-up";

const SPRING_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const TRANSITION_MS = 550;
const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD = 40;
const SWIPE_VELOCITY = 0.35;
const AXIS_LOCK_PX = 10;

/** Muted nature scenes keyed to each slide’s theme. */
const SLIDE_NATURE = {
  graduation: {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=55",
    position: "center 55%",
  },
  silver: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=55",
    position: "center 35%",
  },
  gold: {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=55",
    position: "center center",
  },
} as const;

type SlideKind = keyof typeof SLIDE_NATURE;

interface RequirementSlide {
  id: SlideKind;
  eyebrow: string;
  title: string;
  /** Short display label under the giant stat, e.g. "hours toward graduation". */
  label: string;
  /** Mono ledger tag in the slide footer, e.g. "Req · Graduation". */
  meta: string;
  logged: number;
  required: number;
  background: string;
  barColor: string;
  /** Per-slide accent hex — drives the tier dot and progress glow. */
  accent: string;
  image: string;
  imagePosition: string;
}

function SlideNatureBackdrop({
  image,
  imagePosition,
  overlay,
  isActive,
}: {
  image: string;
  imagePosition: string;
  overlay: string;
  isActive: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        quality={60}
        className="slide-nature-photo object-cover"
        style={{ objectPosition: imagePosition }}
        priority={isActive}
        loading={isActive ? "eager" : "lazy"}
      />
      <div
        className="absolute inset-0 opacity-[0.78]"
        style={{ background: overlay }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />
    </div>
  );
}

function getStatus(logged: number, required: number) {
  if (logged >= required) {
    return {
      label: "Complete",
      className: "border-[#9fe5ae]/50 bg-[#9fe5ae]/10 text-[#9fe5ae]",
    };
  }
  if (logged >= required * 0.6) {
    return {
      label: "On track",
      className: "border-cream/35 bg-cream/5 text-cream/80",
    };
  }
  return {
    label: "Behind",
    className: "border-[#ffb39c]/50 bg-[#ffb39c]/10 text-[#ffb39c]",
  };
}

function SlideProgress({
  pct,
  remaining,
  accent,
  barColor,
}: {
  pct: number;
  remaining: number;
  accent: string;
  barColor: string;
}) {
  const clamped = Math.min(pct, 100);

  return (
    <div className="mt-4 max-w-md">
      <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-cream/45">
        <span>Progress</span>
        <span>{remaining > 0 ? `${remaining} to go` : "Complete"}</span>
      </div>
      <div className="relative h-2 rounded-pill bg-cream/10">
        <div
          className="absolute inset-y-0 left-0 rounded-pill"
          style={{
            width: `${clamped}%`,
            background: barColor,
            boxShadow: `0 0 12px ${accent}55`,
            transition: `width ${TRANSITION_MS}ms ${SPRING_EASING}`,
          }}
        />
        {/* Ruled tick marks — the ledger lines */}
        {[25, 50, 75].map((tick) => (
          <span
            key={tick}
            className="absolute top-0 h-full w-px bg-black/30"
            style={{ left: `${tick}%` }}
          />
        ))}
        {clamped > 0 && clamped < 100 ? (
          <span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow-[0_0_8px_rgba(243,239,226,0.7)]"
            style={{
              left: `${clamped}%`,
              transition: `left ${TRANSITION_MS}ms ${SPRING_EASING}`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function SlideStat({
  logged,
  required,
  animate,
}: {
  logged: number;
  required: number;
  animate: boolean;
}) {
  const counted = Math.round(useCountUp(logged, 1100));
  const shown = animate ? counted : logged;

  return (
    <p className="font-display text-[56px] font-semibold leading-none tracking-tight text-cream lg:text-[68px]">
      {shown}
      <span className="mx-1 font-light text-cream/40">/</span>
      <span className="text-[0.55em] font-medium text-cream/70">{required}</span>
    </p>
  );
}

function RequirementActions() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link
        href="/log-hours"
        data-no-swipe
        className="group flex items-center gap-3 rounded-pill bg-cream py-2.5 pl-5 pr-2.5 text-[14px] font-semibold text-ink transition hover:bg-white active:scale-[0.98]"
      >
        Log Hours
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-cream transition group-hover:translate-x-0.5">
          <Plus size={15} strokeWidth={2.5} />
        </span>
      </Link>
      <Link
        href="/events"
        data-no-swipe
        className="group flex items-center gap-3 rounded-pill bg-cream/10 py-2.5 pl-5 pr-2.5 text-[14px] font-semibold text-cream transition hover:bg-cream/20 active:scale-[0.98]"
      >
        Find Events
        <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/15 transition group-hover:translate-x-0.5">
          <ArrowRight size={14} strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  );
}

export function RequirementsCarousel() {
  const state = student.schoolState;
  const { progress } = useHours();
  const { graduationRequired, verifiedHours } = progress;
  const brightFutures = getBrightFuturesTiers(state);

  const slides = useMemo<RequirementSlide[]>(() => {
    const eyebrow = brightFutures
      ? "FL Bright Futures · Graduation Service Requirement"
      : "Graduation Service Requirement";

    const base: RequirementSlide[] = [
      {
        id: "graduation",
        eyebrow,
        title: `You're ${verifiedHours} of ${graduationRequired} hours toward graduation`,
        label: "verified hours toward graduation",
        meta: "Req · Graduation",
        logged: verifiedHours,
        required: graduationRequired,
        background:
          "radial-gradient(110% 160% at 88% -30%, rgba(11, 143, 136, 0.5), transparent 56%), radial-gradient(90% 120% at -10% 120%, rgba(255, 107, 61, 0.12), transparent 50%), #152420",
        barColor: "linear-gradient(90deg, #0b8f88, #2bd4c4)",
        accent: "#2bd4c4",
        image: SLIDE_NATURE.graduation.src,
        imagePosition: SLIDE_NATURE.graduation.position,
      },
    ];

    if (brightFutures) {
      base.push(
        {
          id: "silver",
          eyebrow,
          title: `You're ${verifiedHours} of ${brightFutures.silver} hours toward Silver`,
          label: "hours toward Bright Futures Silver",
          meta: "Tier · Silver",
          logged: verifiedHours,
          required: brightFutures.silver,
          background:
            "radial-gradient(110% 160% at 88% -30%, rgba(148, 163, 184, 0.36), transparent 56%), radial-gradient(90% 120% at -10% 120%, rgba(62, 149, 196, 0.1), transparent 50%), #1b2230",
          barColor: "linear-gradient(90deg, #8b98ab, #cdd6e2)",
          accent: "#cdd6e2",
          image: SLIDE_NATURE.silver.src,
          imagePosition: SLIDE_NATURE.silver.position,
        },
        {
          id: "gold",
          eyebrow,
          title: `You're ${verifiedHours} of ${brightFutures.gold} hours toward Gold`,
          label: "hours toward Bright Futures Gold",
          meta: "Tier · Gold",
          logged: verifiedHours,
          required: brightFutures.gold,
          background:
            "radial-gradient(110% 160% at 88% -30%, rgba(232, 169, 61, 0.34), transparent 56%), radial-gradient(90% 120% at -10% 120%, rgba(255, 107, 61, 0.1), transparent 50%), #241c12",
          barColor: "linear-gradient(90deg, #c98f2c, #f0c668)",
          accent: "#f0c668",
          image: SLIDE_NATURE.gold.src,
          imagePosition: SLIDE_NATURE.gold.position,
        },
      );
    }

    return base;
  }, [brightFutures, graduationRequired, verifiedHours]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const pointerStartTime = useRef(0);
  const pointerId = useRef<number | null>(null);
  const dragAxis = useRef<"none" | "x" | "y">("none");
  const isDraggingRef = useRef(false);
  const slideCount = slides.length;

  const isInteractiveTarget = useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest("a, button, input, textarea, [data-no-swipe]"));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) {
        return;
      }
      const next = ((index % slideCount) + slideCount) % slideCount;
      setIsAnimating(true);
      setActiveIndex(next);
      setDragOffset(0);
      window.setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    },
    [isAnimating, slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const finishDrag = useCallback(
    (delta: number, elapsedMs: number) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      pointerId.current = null;
      dragAxis.current = "none";

      const velocity = Math.abs(delta) / Math.max(elapsedMs, 1);
      const shouldAdvance =
        Math.abs(delta) > SWIPE_THRESHOLD ||
        (velocity > SWIPE_VELOCITY && Math.abs(delta) > 16);

      if (shouldAdvance) {
        if (delta < 0) {
          goNext();
        } else {
          goPrev();
        }
        return;
      }

      setIsAnimating(true);
      setDragOffset(0);
      window.setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    },
    [goNext, goPrev],
  );

  const beginDrag = useCallback(
    (clientX: number, clientY: number, id: number, target: EventTarget) => {
      if (isAnimating || isDraggingRef.current || isInteractiveTarget(target)) {
        return false;
      }
      isDraggingRef.current = true;
      pointerStartX.current = clientX;
      pointerStartY.current = clientY;
      pointerStartTime.current = performance.now();
      pointerId.current = id;
      dragAxis.current = "none";
      setIsDragging(true);
      setIsPaused(true);
      return true;
    },
    [isAnimating, isInteractiveTarget],
  );

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || pointerId.current === null) {
      return;
    }

    const deltaX = clientX - pointerStartX.current;
    const deltaY = clientY - pointerStartY.current;

    if (dragAxis.current === "none") {
      if (
        Math.abs(deltaX) < AXIS_LOCK_PX &&
        Math.abs(deltaY) < AXIS_LOCK_PX
      ) {
        return;
      }
      dragAxis.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
    }

    if (dragAxis.current === "y") {
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragOffset(0);
      pointerId.current = null;
      dragAxis.current = "none";
      return;
    }

    setDragOffset(deltaX);
  }, []);

  const endDrag = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current || pointerId.current === null) {
        return;
      }
      const delta = clientX - pointerStartX.current;
      const elapsed = performance.now() - pointerStartTime.current;
      finishDrag(dragAxis.current === "x" ? delta : 0, elapsed);
      window.setTimeout(() => setIsPaused(false), 800);
    },
    [finishDrag],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    const started = beginDrag(
      event.clientX,
      event.clientY,
      event.pointerId,
      event.target,
    );
    if (!started) {
      return;
    }
    setIsPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }
    updateDrag(event.clientX, event.clientY);
    if (dragAxis.current === "x") {
      event.preventDefault();
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    endDrag(event.clientX);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    finishDrag(0, 0);
    window.setTimeout(() => setIsPaused(false), 800);
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const onTouchMove = (event: TouchEvent) => {
      if (dragAxis.current !== "x" || pointerId.current === null) {
        return;
      }
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      updateDrag(touch.clientX, touch.clientY);
      event.preventDefault();
    };

    node.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => node.removeEventListener("touchmove", onTouchMove);
  }, [updateDrag]);

  useEffect(() => {
    if (isPaused || isDragging) {
      return;
    }

    const timer = window.setInterval(() => {
      setIsAnimating(true);
      setActiveIndex((current) => (current + 1) % slideCount);
      window.setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, isDragging, slideCount]);

  useEffect(() => {
    if (activeIndex >= slideCount) {
      setActiveIndex(0);
    }
  }, [activeIndex, slideCount]);

  if (!slides[activeIndex]) {
    return null;
  }

  return (
    <section className="relative mb-6">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-card shadow-panel touch-pan-y ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ touchAction: "pan-y" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => window.setTimeout(() => setIsPaused(false), 800)}
      >
        <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2">
          <button
            type="button"
            data-no-swipe
            onClick={goPrev}
            aria-label="Previous requirement"
            className="pointer-events-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-cream/10 text-cream backdrop-blur transition hover:bg-cream/20"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            data-no-swipe
            onClick={goNext}
            aria-label="Next requirement"
            className="pointer-events-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-cream text-ink shadow-card transition hover:bg-white"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div
          className="flex select-none"
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging
              ? "none"
              : `transform ${TRANSITION_MS}ms ${SPRING_EASING}`,
          }}
        >
          {slides.map((slide, index) => {
            const status = getStatus(slide.logged, slide.required);
            const pct = Math.round((slide.logged / slide.required) * 100);
            const isActive = index === activeIndex;
            const remaining = Math.max(0, slide.required - slide.logged);

            return (
              <article
                key={slide.id}
                className="relative flex w-full shrink-0 flex-col overflow-hidden bg-panel px-8 pb-5 pt-8 sm:px-10"
                aria-hidden={!isActive}
                aria-label={slide.title}
              >
                <SlideNatureBackdrop
                  image={slide.image}
                  imagePosition={slide.imagePosition}
                  overlay={slide.background}
                  isActive={isActive}
                />

                {/* Interactive ambience — drifting glow, ledger ruling,
                    cursor spotlight, and grain, all keyed to the accent */}
                <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
                  <div
                    className="slide-aurora absolute -inset-[25%]"
                    style={{
                      background: `radial-gradient(42% 52% at 82% 4%, ${slide.accent}2e, transparent 62%)`,
                    }}
                  />
                  <div
                    className="slide-aurora absolute -inset-[25%]"
                    style={{
                      background: `radial-gradient(46% 56% at 8% 96%, ${slide.accent}1a, transparent 60%)`,
                      animationDelay: "-8s",
                      animationDuration: "20s",
                    }}
                  />
                  <div className="slide-rule absolute inset-0" />
                  <div className="slide-grain absolute inset-0" />
                </div>

                {/* Oversized watermark numeral — printed-ledger texture */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 right-4 z-[1] select-none font-display text-[180px] font-bold italic leading-none text-cream/[0.04]"
                >
                  {slide.required}
                </span>

                <div
                  className={`relative z-10 flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 ${
                    isActive && !isDragging ? "requirement-card-active" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1 sm:pr-4">
                    <span className="mb-4 inline-flex max-w-full items-center gap-2 rounded-pill bg-cream/5 px-3 py-1 ring-1 ring-cream/15">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          background: slide.accent,
                          boxShadow: `0 0 6px ${slide.accent}aa`,
                        }}
                      />
                      <span className="truncate font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-cream/65">
                        {slide.eyebrow}
                      </span>
                    </span>

                    <div className="mb-2 flex flex-wrap items-end gap-3.5">
                      <SlideStat
                        key={`${slide.id}-${isActive ? "on" : "off"}`}
                        logged={slide.logged}
                        required={slide.required}
                        animate={isActive}
                      />
                      <span
                        className={`mb-2 inline-block -rotate-2 rounded-[5px] border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="max-w-md text-[14px] text-cream/60">
                      <span className="font-medium text-cream/85">{slide.label}</span>
                      {brightFutures && slide.id === "graduation"
                        ? ` — Silver at ${brightFutures.silver}, Gold at ${brightFutures.gold}.`
                        : null}
                    </p>

                    <SlideProgress
                      pct={pct}
                      remaining={remaining}
                      accent={slide.accent}
                      barColor={slide.barColor}
                    />

                    <RequirementActions />
                  </div>

                  {/* Nested bezel tile — the ring sits in machined hardware */}
                  <div className="hidden shrink-0 flex-col items-center gap-2.5 self-center sm:flex">
                    <div className="rounded-[1.75rem] bg-cream/[0.06] p-2 ring-1 ring-cream/10">
                      <div className="rounded-[1.25rem] bg-cream/[0.04] p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <ProgressRing
                          size="compact"
                          tone="dark"
                          hoursLogged={slide.logged}
                          hoursRequired={slide.required}
                        />
                      </div>
                    </div>
                    <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-cream/45">
                      {slide.logged}h verified
                    </p>
                  </div>
                </div>

                {/* Ledger footer — hairline rule + meta stamps */}
                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-cream/10 pt-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/40">
                  <span>
                    {slide.meta} · {String(index + 1).padStart(2, "0")} /{" "}
                    {String(slideCount).padStart(2, "0")}
                  </span>
                  <span className="hidden sm:inline">
                    Only verified hours count
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              data-no-swipe
              onClick={() => goTo(slideIndex)}
              aria-label={`Go to ${slide.title}`}
              aria-current={slideIndex === activeIndex ? "true" : undefined}
              className={`pointer-events-auto cursor-pointer rounded-pill transition-all duration-300 ${
                slideIndex === activeIndex
                  ? "h-2 w-6 bg-cream"
                  : "h-2 w-2 bg-cream/25 hover:bg-cream/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
