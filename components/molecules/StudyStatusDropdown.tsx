"use client";

import { useState, useRef, useEffect, memo } from "react";
import { StudyStatus } from "@/lib/types";

type StudyStatusDropdownProps = {
  status: StudyStatus;
  onChangeStatus: (newStatus: StudyStatus) => void;
  disabled?: boolean;
};

type StatusOption = {
  id: StudyStatus;
  label: string;
  description: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    id: "sedang-dipelajari",
    label: "In Progress",
    description: "Currently actively studying this material",
    dotColor: "bg-sky-400",
    badgeBg: "bg-sky-400/15",
    badgeBorder: "border-sky-400/30",
    textColor: "text-sky-600 dark:text-sky-400 font-medium",
  },
  {
    id: "perlu-diulang",
    label: "Needs Review",
    description: "Challenging concepts requiring spaced repetition",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    textColor: "text-amber-800 dark:text-amber-300 font-semibold",
  },
  {
    id: "dikuasai",
    label: "Mastered",
    description: "Concept fully understood and tested with high retention",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/30",
    textColor: "text-emerald-600 dark:text-emerald-400 font-medium",
  },
  {
    id: "belum-direview",
    label: "Not Reviewed",
    description: "Fresh draft or note not yet reviewed",
    dotColor: "bg-rose-400",
    badgeBg: "bg-rose-400/15",
    badgeBorder: "border-rose-400/30",
    textColor: "text-rose-600 dark:text-rose-400 font-medium",
  },
];

export const StudyStatusDropdown = memo(function StudyStatusDropdown({
  status,
  onChangeStatus,
  disabled = false,
}: StudyStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    STATUS_OPTIONS.find((opt) => opt.id === status) || STATUS_OPTIONS[3];

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: Math.min(Math.max(8, rect.left), window.innerWidth - 270),
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left flex-shrink-0">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all flex-shrink-0 whitespace-nowrap ${
          currentOption.badgeBg
        } ${currentOption.badgeBorder} ${currentOption.textColor} hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Study Status: ${currentOption.label} (Click to change)`}
      >
        <span className={`w-2 h-2 rounded-full ${currentOption.dotColor} flex-shrink-0 animate-pulse`} />
        <span>{currentOption.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Styled Popover Dropdown Menu (Fixed in Viewport to bypass overflow-x/overflow-y clipping) */}
      {isOpen && dropdownPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
            }}
            className="fixed z-50 w-64 max-w-[calc(100vw-24px)] rounded-xl border border-ink-700 bg-app-surface/98 backdrop-blur-md p-1.5 shadow-2xl animate-fade-in space-y-1"
          >
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400 border-b border-ink-800">
              Select Study Status
            </div>

          {STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.id === status;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChangeStatus(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? "bg-ink-800/90 border border-ink-600/60"
                    : "hover:bg-ink-800/50 border border-transparent"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${opt.dotColor} mt-1 flex-shrink-0 ring-2 ring-white/10`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-ink-50" : opt.textColor
                      }`}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[10px] text-ink-400 mt-0.5 leading-tight">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
});
