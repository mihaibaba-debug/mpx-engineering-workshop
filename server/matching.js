import { broaderSkills } from "./skills.js";

function normalized(value) {
  return value.trim().toLowerCase();
}

const broaderSkillsBySpecific = new Map(
  Object.entries(broaderSkills).map(([specificSkill, broader]) => [normalized(specificSkill), broader])
);

export function scoreJob(job, candidate) {
  const candidateSkills = new Set(candidate.skills.map(normalized));
  const skillBreakdown = job.skills.map((skill) => {
    const exactMatch = candidateSkills.has(normalized(skill));
    const relatedSkill = exactMatch ? null : candidate.skills.find((candidateSkill) =>
      (broaderSkillsBySpecific.get(normalized(candidateSkill)) ?? [])
        .some((broaderSkill) => normalized(broaderSkill) === normalized(skill))
    );
    const matchType = exactMatch ? "exact" : relatedSkill ? "related" : "missing";
    const contribution = exactMatch ? 1 : relatedSkill ? 0.5 : 0;

    return {
      skill,
      matched: exactMatch,
      matchType,
      matchedSkill: relatedSkill,
      contribution,
      reason: exactMatch
        ? "Exact skill"
        : relatedSkill
          ? `Related skill: ${relatedSkill} (50% credit)`
          : "Not found",
    };
  });
  const matchedCount = skillBreakdown.filter((item) => item.matchType === "exact").length;
  const relatedCount = skillBreakdown.filter((item) => item.matchType === "related").length;
  const skillScore = job.skills.length
    ? skillBreakdown.reduce((total, item) => total + item.contribution, 0) / job.skills.length
    : 0;
  const skillPoints = skillScore * 80;
  const locationFits = job.location === candidate.location || job.workMode === "Remote";
  const locationPoints = locationFits ? 20 : 0;
  const score = Math.min(100, Math.max(0, Math.round(skillPoints + locationPoints)));

  return {
    score,
    matchedCount,
    relatedCount,
    requiredCount: job.skills.length,
    skillScore,
    skillPoints,
    locationFits,
    locationPoints,
    skillBreakdown,
  };
}

export function rankJobs(jobs, candidate) {
  return jobs
    .map((job) => ({ ...job, match: scoreJob(job, candidate) }))
    .sort((a, b) => b.match.score - a.match.score || a.title.localeCompare(b.title));
}
