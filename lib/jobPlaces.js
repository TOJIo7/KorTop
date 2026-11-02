// Вакансии → места на карте. У одной компании часто много вакансий по одному адресу:
// такие показываем одной точкой, иначе они лягут друг на друга и нажать получится только верхнюю
export function groupJobsByPlace(jobs) {
  const places = new Map();

  for (const job of jobs) {
    if (job.lat === null || job.lng === null) continue;
    const key = `${job.lat},${job.lng}`;
    if (!places.has(key)) places.set(key, { id: key, lat: job.lat, lng: job.lng, address: job.address, jobs: [] });
    places.get(key).jobs.push({
      id: job.id,
      title: job.title,
      employer: job.employer,
      salaryFrom: job.salaryFrom,
      salaryTo: job.salaryTo,
    });
  }

  return [...places.values()];
}
