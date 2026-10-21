import { primaryJobs, partnerJobs } from "./seed-data.js";

export function listJobs({ query = "", category = "All", location = "All" } = {}) {
  const jobs = [...primaryJobs, ...partnerJobs];
  const normalizedQuery = query.trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = !normalizedQuery || [
      job.title,
      job.company,
      job.description,
      ...job.skills,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesCategory = category === "All" || job.category === category;
    const matchesLocation = location === "All" || job.location === location || job.workMode === "Remote";
    return matchesQuery && matchesCategory && matchesLocation;
  });

  const uniqueJobs = new Map();
  for (const job of filteredJobs) {
    const existingJob = uniqueJobs.get(job.canonicalId);
    if (!existingJob || (existingJob.source !== "Direct" && job.source === "Direct")) {
      uniqueJobs.set(job.canonicalId, job);
    }
  }

  return [...uniqueJobs.values()];
}

export function getJobById(id) {
  return listJobs().find((job) => job.id === id) ?? null;
}

export function getCatalogSummary() {
  const jobs = listJobs();
  return {
    visibleListings: jobs.length,
    uniqueRoles: new Set(jobs.map((job) => job.canonicalId)).size,
    partnerListings: jobs.filter((job) => job.source === "Partner feed").length,
  };
}
