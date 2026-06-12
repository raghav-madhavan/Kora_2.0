"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  getBrightFuturesTiers,
  getCategoryGoals,
  getGraduationRequirement,
} from "@/lib/compliance";
import { student } from "@/lib/mock-data";
import type { CategoryKey } from "@/lib/types/student";

const categoryLabels: Record<CategoryKey, string> = {
  community: "Community",
  environment: "Environment",
  education: "Education",
};

export function GoalsFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const state = student.schoolState;
  const graduation = getGraduationRequirement(state);
  const brightFutures = getBrightFuturesTiers(state);
  const categories = getCategoryGoals(state);

  const categorySummary = (Object.keys(categories) as CategoryKey[])
    .map((key) => `${categoryLabels[key]}: ${categories[key]} hrs`)
    .join(" · ");

  const items = [
    {
      question: "What counts toward my graduation requirement?",
      answer: `Only verified hours count. Your school requires ${graduation} total verified service hours for graduation.`,
    },
    {
      question: "What is the difference between pending and verified?",
      answer:
        "Pending hours have been logged but not yet approved by an organization moderator. They do not count toward goals until verified.",
    },
    {
      question: "How do category requirements work?",
      answer: `Verified hours must be spread across service categories: ${categorySummary}.`,
    },
    ...(brightFutures
      ? [
          {
            question: "How does Bright Futures work in Florida?",
            answer: `Bright Futures Silver requires ${brightFutures.silver} verified hours; Gold requires ${brightFutures.gold}. Only verified hours count.`,
          },
        ]
      : []),
    {
      question: "Why were my hours flagged?",
      answer:
        "Flagged entries are reviewed when patterns suggest duplicate or unverified submissions. Contact your school counselor from the hour detail page.",
    },
  ];

  return (
    <div className="rounded-card bg-surface p-6 shadow-card">
      <h2 className="mb-1 text-[18px] font-bold">What counts?</h2>
      <p className="mb-4 text-[14px] text-muted">
        School-specific rules from your compliance profile ({state})
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-xl border border-black/5"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-[14px] font-semibold">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open ? (
                <p className="border-t border-black/5 px-4 py-3 text-[14px] leading-relaxed text-muted">
                  {item.answer}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
