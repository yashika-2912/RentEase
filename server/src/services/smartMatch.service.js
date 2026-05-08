/**
 * Scores a property against tenant preferences (max 100).
 * @param {object} property - Mongoose doc or plain object
 * @param {object} tenantPrefs - User.preferences
 */
function scoreProperty(property, tenantPrefs) {
  if (!tenantPrefs) return 0;

  let score = 0;
  const rent = property.rent ?? 0;
  const minB = tenantPrefs.budget?.min ?? 0;
  const maxB = tenantPrefs.budget?.max ?? Number.MAX_SAFE_INTEGER;

  // 1. Budget fit (30 pts)
  if (rent <= maxB && rent >= minB) {
    score += 30;
  } else if (rent <= maxB * 1.1) {
    score += 15;
  }

  // 2. Location match (25 pts)
  const city = property.address?.city;
  const preferred = tenantPrefs.preferredLocations || [];
  if (city && preferred.map((c) => c.toLowerCase()).includes(String(city).toLowerCase())) {
    score += 25;
  }

  // 3. Bedroom match (15 pts)
  const tb = tenantPrefs.bedrooms;
  const pb = property.bedrooms;
  if (tb != null && pb === tb) score += 15;
  else if (tb != null && Math.abs(pb - tb) === 1) score += 7;

  // 4. Amenities overlap (20 pts)
  const tenantAmenities = tenantPrefs.amenities || [];
  const propAmenities = property.amenities || [];
  if (tenantAmenities.length > 0) {
    const overlap = propAmenities.filter((a) =>
      tenantAmenities.map((x) => String(x).toLowerCase()).includes(String(a).toLowerCase())
    );
    score += Math.round((overlap.length / tenantAmenities.length) * 20);
  }

  // 5. Furnished preference (10 pts)
  if (property.furnished === tenantPrefs.furnished) score += 10;

  return Math.min(score, 100);
}

function sortByMatchScore(properties, tenantPrefs) {
  return properties
    .map((p) => {
      const plain = typeof p.toObject === 'function' ? p.toObject() : { ...p };
      plain.matchScore = scoreProperty(plain, tenantPrefs);
      return plain;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
module.exports = { scoreProperty, sortByMatchScore };

