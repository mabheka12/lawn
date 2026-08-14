/**
 * Deterministic seed from category+city so the same page always
 * gets the same template, but different pages vary.
 */
function seedFromString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length]
}

interface IntroParams {
  categoryName: string
  cityName: string
  businessCount: number
  categorySlug: string
  citySlug: string
  averageRating?: number | null
}

export function generateCategoryCityIntro({
  categoryName,
  cityName,
  businessCount,
  categorySlug,
  citySlug,
  averageRating,
}: IntroParams) {
  const seed = seedFromString(`${categorySlug}-${citySlug}`)
  const categoryLower = categoryName.toLowerCase()

  const openers = [
    `Looking for reliable ${categoryLower} in ${cityName}? We've gathered ${businessCount} local businesses so you can compare options without digging through endless search results.`,
    `${cityName} is home to ${businessCount} ${categoryLower} providers listed in our directory, each vetted for real customer reviews and up-to-date contact details.`,
    `Finding the right ${categoryLower} provider in ${cityName} shouldn't take all day. Below you'll find ${businessCount} local businesses, ranked by customer rating, so you can start comparing right away.`,
    `Whether you need a one-off job or ongoing service, ${cityName} has ${businessCount} ${categoryLower} businesses ready to help. Browse ratings, reviews, and contact details below.`,
  ]

  const closers = [
    `Check each listing for service areas, reviews, and contact info before reaching out — it'll save you a round of phone tag.`,
    `We recommend comparing at least two or three providers to find the best fit for your budget and timeline.`,
    `Ratings and review counts are pulled from verified customer feedback, so you can shortlist with confidence.`,
    `Most businesses below respond to inquiries within a day or two — worth reaching out to a few before deciding.`,
  ]

  const opener = pick(openers, seed)
  const closer = pick(closers, seed + 1)

  const ratingLine =
    averageRating && averageRating > 0
      ? ` The average rating across these businesses is ${averageRating.toFixed(1)} stars.`
      : ''

  return { opener: opener + ratingLine, closer }
}