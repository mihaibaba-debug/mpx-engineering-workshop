import test from "node:test";
import assert from "node:assert/strict";
import { getDuplicateListings } from "../src/lib/incident.js";
import { listJobs } from "../server/catalog.js";

test("incident evidence reports the catalog duplicate fix as resolved", () => {
  const groups = getDuplicateListings(listJobs());
  assert.deepEqual(groups, []);
});

test("incident evidence resolves when the catalog contains unique roles", () => {
  const unique = [...new Map(listJobs().map((job) => [job.canonicalId, job])).values()];
  assert.deepEqual(getDuplicateListings(unique), []);
});
