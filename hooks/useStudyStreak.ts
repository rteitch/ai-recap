"use client";

import { useState, useEffect, useCallback } from "react";

export function useStudyStreak() {
  const [studyStreak, setStudyStreak] = useState<number>(0);

  useEffect(() => {
    try {
      const streakData = localStorage.getItem("ai_recap_study_streak");
      if (streakData) {
        const { currentStreak, lastStudyDate } = JSON.parse(streakData);
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (lastStudyDate === today || lastStudyDate === yesterday) {
          setStudyStreak(typeof currentStreak === "number" ? currentStreak : 0);
        } else {
          setStudyStreak(0);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const recordStudyActivity = useCallback(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const streakData = localStorage.getItem("ai_recap_study_streak");
      let nextStreak = 1;
      if (streakData) {
        const { currentStreak, lastStudyDate } = JSON.parse(streakData);
        if (lastStudyDate === today) {
          return;
        } else if (lastStudyDate === yesterday) {
          nextStreak = (typeof currentStreak === "number" ? currentStreak : 0) + 1;
        }
      }
      localStorage.setItem(
        "ai_recap_study_streak",
        JSON.stringify({ currentStreak: nextStreak, lastStudyDate: today })
      );
      setStudyStreak(nextStreak);
    } catch {
      // Ignore
    }
  }, []);

  return { studyStreak, recordStudyActivity };
}
