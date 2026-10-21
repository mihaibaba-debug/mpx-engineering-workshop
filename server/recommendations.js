import { rankJobs } from "./matching.js";

export function createRecommendationCache() {
  const cachedResults = new Map();

  return function getRecommendations(jobs, candidate) {
    let cachedResult = cachedResults.get(candidate.id);
    if (!cachedResult) {
      cachedResult = {
        scoredForCandidateId: candidate.id,
        jobs: rankJobs(jobs, candidate),
      };
      cachedResults.set(candidate.id, cachedResult);
    }
    return cachedResult;
  };
}
