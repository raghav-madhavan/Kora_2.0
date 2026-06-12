"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Flame,
  Pencil,
  Plus,
  X,
  Link2,
} from "lucide-react";
import {
  ACCESSORY_OPTIONS,
  BACKGROUND_OPTIONS,
  EXPRESSION_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_OPTIONS,
  HAT_UNLOCKS,
  SKIN_TONE_OPTIONS,
  SKIN_TONES,
  HAIR_COLOR_VALUES,
  BACKGROUND_COLORS,
  isHatUnlocked,
} from "@/lib/avatar";
import { student } from "@/lib/mock-data";
import { useProfileStore } from "@/lib/mock-profile-store";
import { useMockStore } from "@/lib/mock-store";
import { useHours } from "@/components/student/hours-provider";
import { useToast } from "@/components/student/toast-provider";
import { getSkillEmoji, getSkillLabel, SKILL_SUGGESTIONS } from "@/lib/skills";
import { useStudentAvatar } from "@/lib/use-student-avatar";
import { HatIcon, StudentAvatar } from "@/components/student/student-avatar";
import { rankShiftsForStudent } from "@/lib/matching";

function parseGradeAndSchool(gradeLine: string) {
  const parts = gradeLine.split(" · ");
  return {
    grade: parts[0] ?? gradeLine,
    school: parts[1] ?? "Lincoln High",
  };
}

function EmojiOptionButton({
  emoji,
  label,
  selected,
  onClick,
  swatch,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-[13px] font-semibold transition ${
        selected
          ? "bg-primary text-white"
          : "bg-accent-lavender text-ink hover:bg-primary/10"
      }`}
    >
      {swatch ? (
        <span
          className="h-5 w-5 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: swatch }}
        />
      ) : (
        <span className="text-[16px] leading-none">{emoji}</span>
      )}
      <span>{label}</span>
    </button>
  );
}

export function ProfilePageClient() {
  const {
    avatar: savedAvatar,
    skills,
    updateAvatar,
    addSkill,
    removeSkill,
    toggleSkill,
  } = useProfileStore();
  const avatar = useStudentAvatar();
  const { progress, categoryGaps } = useHours();
  const store = useMockStore();
  const toast = useToast();
  const verifiedHours = progress.verifiedHours;
  const [editing, setEditing] = useState(false);
  const [skillDraft, setSkillDraft] = useState("");
  const { grade, school } = parseGradeAndSchool(student.grade);

  const matchCount = useMemo(() => {
    const allShifts = store.getShifts();
    return rankShiftsForStudent(skills, allShifts, { categoryGaps }).filter(
      (s) => s.matchScore > 0,
    ).length;
  }, [skills, store, categoryGaps]);

  const handleAddSkill = () => {
    const added = addSkill(skillDraft);
    if (added) {
      setSkillDraft("");
      toast.success("Recommendations updated");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    removeSkill(skill);
    toast.success("Recommendations updated");
  };

  const handleToggleSkill = (skill: string) => {
    toggleSkill(skill);
    toast.success("Recommendations updated");
  };

  const handleHatSelect = (hat: (typeof HAT_UNLOCKS)[number]["hat"]) => {
    if (isHatUnlocked(hat, verifiedHours)) {
      updateAvatar({ hat });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-card bg-surface p-8 shadow-card">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="rounded-full bg-accent-lavender p-3 shadow-card">
              <StudentAvatar config={avatar} size={140} />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-[28px] font-bold">{student.name}</h1>
              <p className="mt-1 text-[15px] text-muted">{grade}</p>
              <p className="text-[14px] text-muted">{school}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-sky px-3.5 py-1.5 text-[13px] font-semibold text-icon-sky">
                  <Clock size={14} />
                  {verifiedHours} verified hrs
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-pink px-3.5 py-1.5 text-[13px] font-semibold text-icon-pink">
                  <Flame size={14} />
                  {student.streakWeeks}-week streak
                </span>
                {matchCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/15 px-3.5 py-1.5 text-[13px] font-semibold text-success">
                    ✦ {matchCount} event{matchCount === 1 ? "" : "s"} match your skills
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-pill px-5 py-2.5 text-[14px] font-semibold transition ${
              editing
                ? "bg-primary text-white hover:bg-primary-deep"
                : "bg-accent-lavender text-primary hover:bg-primary hover:text-white"
            }`}
          >
            <Pencil size={15} />
            {editing ? "Done editing" : "Edit profile"}
          </button>
        </div>
      </section>

      {editing ? (
        <section className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="mb-1 text-[20px] font-bold">Customize avatar</h2>
          <p className="mb-6 text-[14px] text-muted">
            Pick your look with emojis. Hats unlock as you earn verified hours.
          </p>

          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-accent-lavender p-4">
              <StudentAvatar config={savedAvatar} size={120} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                💇 Hair style
              </p>
              <div className="flex flex-wrap gap-2">
                {HAIR_OPTIONS.map((option) => (
                  <EmojiOptionButton
                    key={option.value}
                    emoji={option.emoji}
                    label={option.label}
                    selected={savedAvatar.hair === option.value}
                    onClick={() => updateAvatar({ hair: option.value })}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                🎨 Hair color
              </p>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLOR_OPTIONS.map((option) => (
                  <EmojiOptionButton
                    key={option.value}
                    emoji={option.emoji}
                    label={option.label}
                    selected={savedAvatar.hairColor === option.value}
                    onClick={() => updateAvatar({ hairColor: option.value })}
                    swatch={HAIR_COLOR_VALUES[option.value]}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                🖐️ Skin tone
              </p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONE_OPTIONS.map((option) => (
                  <EmojiOptionButton
                    key={option.value}
                    emoji={option.emoji}
                    label={option.label}
                    selected={savedAvatar.skinTone === option.value}
                    onClick={() => updateAvatar({ skinTone: option.value })}
                    swatch={SKIN_TONES[option.value]}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                😀 Expression
              </p>
              <div className="flex flex-wrap gap-2">
                {EXPRESSION_OPTIONS.map((option) => (
                  <EmojiOptionButton
                    key={option.value}
                    emoji={option.emoji}
                    label={option.label}
                    selected={savedAvatar.expression === option.value}
                    onClick={() => updateAvatar({ expression: option.value })}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                🖼️ Background
              </p>
              <div className="flex flex-wrap gap-2">
                {BACKGROUND_OPTIONS.map((option) => (
                  <EmojiOptionButton
                    key={option.value}
                    emoji={option.emoji}
                    label={option.label}
                    selected={savedAvatar.background === option.value}
                    onClick={() => updateAvatar({ background: option.value })}
                    swatch={BACKGROUND_COLORS[option.value]}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                👓 Accessories
              </p>
              <div className="flex flex-wrap gap-2">
                {ACCESSORY_OPTIONS.map((option) => (
                  <EmojiOptionButton
                    key={option.value}
                    emoji={option.emoji}
                    label={option.label}
                    selected={savedAvatar.accessory === option.value}
                    onClick={() => updateAvatar({ accessory: option.value })}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                🎩 Hats
              </p>
              <div className="flex flex-wrap gap-3">
                {HAT_UNLOCKS.map((unlock) => {
                  const locked = !isHatUnlocked(unlock.hat, verifiedHours);
                  return (
                    <HatIcon
                      key={unlock.hat}
                      hat={unlock.hat}
                      locked={locked}
                      selected={savedAvatar.hat === unlock.hat}
                      onClick={() => handleHatSelect(unlock.hat)}
                      unlock={unlock}
                      verifiedHours={verifiedHours}
                    />
                  );
                })}
              </div>
              <p className="mt-3 text-[12px] text-muted">
                🎉 Party hat unlocks at 75 hrs (Bright Futures Silver). 👑 Gold
                crown unlocks at 100 hrs (Bright Futures Gold).
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-card bg-surface p-6 shadow-card">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold">Skills</h2>
            <p className="mt-1 text-[14px] text-muted">
              Skills help match you with volunteer opportunities.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-accent-lavender px-3.5 py-2 text-[13px] font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              <Pencil size={13} />
              Edit
            </button>
          ) : null}
        </div>

        {editing ? (
          <>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
              ✨ Tap to add or remove
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.map((suggestion) => {
                const active = skills.includes(suggestion.value);
                return (
                  <button
                    key={suggestion.value}
                    type="button"
                    onClick={() => handleToggleSkill(suggestion.value)}
                    className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[13px] font-semibold transition ${
                      active
                        ? "bg-primary text-white"
                        : "bg-accent-lavender text-ink hover:bg-primary/10"
                    }`}
                  >
                    <span>{suggestion.emoji}</span>
                    {suggestion.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-[14px] text-muted">
                  No skills selected yet — tap suggestions above or add your own.
                </p>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-accent-lavender px-3.5 py-1.5 text-[13px] font-semibold text-primary"
                  >
                    <span>{getSkillEmoji(skill)}</span>
                    {getSkillLabel(skill)}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full p-0.5 transition hover:bg-primary/20"
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a custom skill…"
                className="h-11 flex-1 rounded-pill border-0 bg-canvas px-4 text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!skillDraft.trim()}
                className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <p className="text-[14px] text-muted">No skills added yet.</p>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-accent-lavender px-3.5 py-1.5 text-[13px] font-semibold text-primary"
                >
                  <span>{getSkillEmoji(skill)}</span>
                  {getSkillLabel(skill)}
                </span>
              ))
            )}
          </div>
        )}
      </section>

      <section className="rounded-card bg-accent-lavender/50 p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-surface text-primary shadow-card">
            <Link2 size={18} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold">Connect School Account</h2>
            <p className="text-[14px] text-muted">
              Link your county student ID to sync graduation requirements
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="County student ID"
            disabled
            className="h-12 flex-1 rounded-pill border-0 bg-surface px-5 text-[14px] placeholder:text-muted shadow-card focus:outline-none disabled:opacity-70"
          />
          <div className="group relative shrink-0">
            <button
              type="button"
              disabled
              className="h-12 w-full rounded-pill bg-ink px-6 text-[14px] font-semibold text-white opacity-60 sm:w-auto"
            >
              Connect
            </button>
            <span className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-chip bg-ink px-3 py-1.5 text-[12px] font-semibold text-white opacity-0 shadow-raised transition group-hover:opacity-100 sm:block">
              Coming Soon
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
