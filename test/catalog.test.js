import assert from "node:assert/strict";
import test from "node:test";
import { getCatalogSummary, getJobById, listJobs } from "../server/catalog.js";

test("catalog returns one direct listing for each canonical role", () => {
  const jobs = listJobs();
  const copies = jobs.filter((job) => job.canonicalId === "role-101");
  assert.equal(copies.length, 1);
  assert.equal(copies[0].id, "job-101");
  assert.equal(copies[0].source, "Direct");
  assert.equal(jobs.length, 7);
  assert.equal(new Set(jobs.map((job) => job.canonicalId)).size, jobs.length);
  assert.equal(getCatalogSummary().visibleListings, 7);
  assert.equal(getCatalogSummary().uniqueRoles, 7);
  assert.equal(getCatalogSummary().partnerListings, 1);
});

test("catalog can filter by query, category, and location", () => {
  assert.equal(listJobs({ query: "Security" }).length, 1);
  assert.equal(listJobs({ category: "Data" }).length, 1);
  assert.equal(listJobs({ location: "Lausanne" }).some((job) => job.id === "job-103"), true);
  assert.equal(listJobs({ location: "Bern" }).some((job) => job.id === "job-106"), true);
  assert.equal(listJobs({ query: "Senior Product Engineer" }).some((job) => job.id === "partner-778"), false);
  for (const jobs of [
    listJobs({ query: "Engineer" }),
    listJobs({ category: "Engineering" }),
    listJobs({ location: "Zurich" }),
  ]) {
    assert.equal(new Set(jobs.map((job) => job.canonicalId)).size, jobs.length);
  }
  assert.equal(getJobById("job-102")?.title, "Data Platform Engineer");
});
