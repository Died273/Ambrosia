import { computeCompatibilityScore, getCompatibilitySummary } from '@/lib/compatibility';
import type { UserProfile, MatchCandidate } from '@/lib/types';

export interface MatchOptions {
  maxMatches?: number;
  requireSameLocation?: boolean;
  minScore?: number;
}

/**
 * Generate matches for a user based on compatibility scores
 * @param currentUser - The user to find matches for
 * @param allProfiles - All available user profiles to match against
 * @param options - Optional matching parameters
 * @returns Array of top matches sorted by compatibility score
 */
export function generateMatches(
  currentUser: UserProfile,
  allProfiles: UserProfile[],
  options: MatchOptions = {}
): MatchCandidate[] {
  const {
    maxMatches = 3,
    requireSameLocation = false,
    minScore = 60
  } = options;

  // Check if current user has quiz data
  if (!currentUser.quizSnapshot || currentUser.quizSnapshot.length === 0) {
    console.warn('Current user has no quiz data');
    return [];
  }

  console.log('🔍 Current User:', {
    name: currentUser.name,
    gender: currentUser.gender,
    datingPreference: currentUser.datingPreference
  });
  console.log(`📊 Checking ${allProfiles.length} profiles...`);

  // Filter eligible candidates
  const eligible = allProfiles.filter(candidate => {
    // Don't match with self
    if (candidate.id === currentUser.id) {
      console.log(`❌ Filtered out ${candidate.name}: same user`);
      return false;
    }

    // Both must have quiz answers
    if (!candidate.quizSnapshot || !currentUser.quizSnapshot) {
      console.log(`❌ Filtered out ${candidate.name}: missing quiz data`);
      return false;
    }

      // Bidirectional gender preference matching
    // Helper to normalize gender (Man/Men -> man, Woman/Women -> woman)
    const normalizeGender = (g: string) => {
      const lower = g.toLowerCase();
      if (lower === 'men') return 'man';
      if (lower === 'women') return 'woman';
      return lower;
    };

    // Check if current user is interested in candidate's gender
    if (currentUser.datingPreference &&
        currentUser.datingPreference.toLowerCase() !== 'everyone') {
      const userPref = normalizeGender(currentUser.datingPreference);
      const candidateGender = normalizeGender(candidate.gender);
      if (candidateGender !== userPref) {
        console.log(`❌ Filtered out ${candidate.name}: current user (${currentUser.datingPreference}) not interested in ${candidate.gender}`);
        return false;
      }
    }

    // Check if candidate is interested in current user's gender
    if (candidate.datingPreference &&
        candidate.datingPreference.toLowerCase() !== 'everyone') {
      const candidatePref = normalizeGender(candidate.datingPreference);
      const userGender = normalizeGender(currentUser.gender);
      if (userGender !== candidatePref) {
        console.log(`❌ Filtered out ${candidate.name}: they (want ${candidate.datingPreference}) not interested in ${currentUser.gender}`);
        return false;
      }
    }

    // Location filter (optional)
    if (requireSameLocation && candidate.location !== currentUser.location) {
      console.log(`❌ Filtered out ${candidate.name}: location mismatch`);
      return false;
    }

    console.log(`✅ ${candidate.name} is eligible`);
    return true;
  });

  // Score all eligible candidates
  const scored = eligible.map(candidate => {
    const score = computeCompatibilityScore(
      currentUser.quizSnapshot!,
      candidate.quizSnapshot!
    );
    console.log(`💯 ${candidate.name}: scored ${score}%`);
    return {
      profile: candidate,
      score,
      summary: getCompatibilitySummary(score)
    };
  });

  console.log(`Found ${allProfiles.length} total profiles, ${eligible.length} eligible candidates`);

  // Filter by minimum score and return top N matches
  console.log(`⚡ Filtering by minimum score: ${minScore}%`);

  const aboveMinScore = scored.filter(match => match.score >= minScore);
  console.log(`✨ ${aboveMinScore.length} matches scored above ${minScore}%`);

  const matches = aboveMinScore
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMatches);

  console.log(`🎯 Final result: ${matches.length} matches for user ${currentUser.name}`);

  if (matches.length > 0) {
    matches.forEach(m => console.log(`   → ${m.profile.name}: ${m.score}%`));
  }

  return matches;
}
