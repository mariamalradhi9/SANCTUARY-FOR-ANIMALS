// Pure helpers backing PetFacts / BehavioralProfile, ported from js/pet-profile.js.

import type { Assessment } from "./types";

export function yesNoLabel(value: string | undefined, fallback: string): string {
  if (value === "Y") return "Yes";
  if (value === "N") return "No";
  return fallback;
}

export const DISPOSITION_LEVEL_CLASS: Record<string, string> = {
  "Level 1 (Green)": "level-green",
  "Level 2 (Blue)": "level-blue",
  "Level 3 (Yellow)": "level-yellow",
  "Level 4 (Orange)": "level-orange",
  "Level 5 (Red)": "level-red",
};

export const PROFILE_METRIC_LABELS: [keyof Assessment["profileScores"], string][] = [
  ["humanSociability", "Human Sociability"],
  ["arousalThreshold", "Arousal Threshold"],
  ["recoveryLatency", "Recovery Latency"],
  ["environmentalConfidence", "Environmental Confidence"],
  ["frustrationTolerance", "Frustration Tolerance"],
  ["tactileSensitivity", "Tactile Sensitivity"],
];

export function hasBehavioralDetails(latest: Assessment | null): boolean {
  if (!latest) return false;
  const scoreRows = PROFILE_METRIC_LABELS.filter(([key]) => latest.profileScores?.[key]);
  const hasDrives = latest.preyDrive || latest.foodDrive || latest.socialDrive;
  const hasDogToDog = latest.socialOrientation || (latest.posturing || []).length || (latest.spaceClaiming || []).length || latest.socialYield;
  const hasSafety = (latest.redFlags || []).length > 0 || !!latest.incidentHistory;
  return scoreRows.length > 0 || !!hasDrives || !!hasDogToDog || !!hasSafety;
}
