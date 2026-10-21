import test from "node:test";
import assert from "node:assert/strict";
import { createRecommendationCache } from "../server/recommendations.js";
import { listJobs } from "../server/catalog.js";
import { candidates } from "../server/seed-data.js";

test("INC-002 rankings stay isolated in either candidate request order", () => {
  for (const order of [candidates.slice(0, 2), candidates.slice(0, 2).reverse()]) {
    const getRecommendations = createRecommendationCache();
    const jobs = listJobs();
    const results = order.map((candidate) => getRecommendations(jobs, candidate));

    assert.deepEqual(
      results.map((result) => result.scoredForCandidateId),
      order.map((candidate) => candidate.id),
    );
    assert.notDeepEqual(results[0].jobs, results[1].jobs);
  }
});
