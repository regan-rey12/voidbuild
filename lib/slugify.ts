// VoidBuild Slugify - For subdomain hosting {business}.voidbuild.com
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .slice(0, 30); // Max 30 chars for subdomain
}

export function generateSubdomain(businessName: string, id: string): string {
  const slug = slugify(businessName);
  // Add short id suffix to make unique, e.g., aishas-beauty-a1b2c3
  const shortId = id.slice(-6).toLowerCase();
  return `${slug}-${shortId}`;
}
