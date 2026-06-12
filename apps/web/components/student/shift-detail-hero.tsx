import Image from "next/image";
import { MapPin } from "lucide-react";
import { tints } from "@/lib/mock-data";
import type { Shift } from "@/lib/types/student";

interface ShiftDetailHeroProps {
  shift: Shift;
}

export function ShiftDetailHero({ shift }: ShiftDetailHeroProps) {
  const tint = tints[shift.categoryTint];

  return (
    <div className="relative h-[220px] overflow-hidden rounded-card sm:h-[280px]">
      <Image
        src={shift.img}
        alt={shift.title}
        fill
        className="object-cover"
        sizes="(max-width: 1280px) 100vw, 60vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span
          className={`mb-3 inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tint.bg} ${tint.fg}`}
        >
          {shift.category}
        </span>
        <h1 className="text-[24px] font-bold leading-tight text-white sm:text-[28px]">
          {shift.title}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-[14px] text-white/85">
          <MapPin size={15} />
          {shift.location}
        </p>
      </div>
    </div>
  );
}
