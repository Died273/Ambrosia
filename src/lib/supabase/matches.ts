import { createClient } from '@/lib/supabase/client';
import type { UserProfile, MatchCandidate } from '@/lib/types';
import { rowToProfile, type ProfileRow } from './profiles';

/**
 * Fetch all user profiles that have completed the quiz
 * @returns Array of user profiles with quiz data
 */
export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase client not available - check your environment variables');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .not('quiz_snapshot', 'is', null);

  if (error) {
    console.error('Supabase error in fetchAllProfiles:', error);
    throw new Error(`Failed to fetch profiles: ${error.message}`);
  }

  return (data as ProfileRow[]).map(rowToProfile);
}

/**
 * Save generated matches to the database
 * Deactivates old matches and inserts new ones
 * @param userId - The user ID to save matches for
 * @param matches - Array of match candidates to save
 */
export async function saveMatches(
  userId: string,
  matches: MatchCandidate[]
): Promise<void> {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase client not available - check your environment variables');

  // Delete old matches to avoid unique constraint violation
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.warn('Could not delete old matches:', deleteError.message, deleteError.code);
  }

  if (matches.length === 0) {
    console.log('No matches to save');
    return;
  }

  // Insert new matches using upsert to handle any remaining duplicates
  const matchRows = matches.map(match => ({
    user_id: userId,
    matched_user_id: match.profile.id,
    compatibility_score: match.score,
    compatibility_summary: match.summary,
    is_active: true
  }));

  const { error } = await supabase
    .from('matches')
    .upsert(matchRows, { onConflict: 'user_id,matched_user_id' });

  if (error) {
    console.error('Supabase error in saveMatches:', error.message, error.code, error.details);
    throw new Error(`Failed to save matches: ${error.message}`);
  }
}

/**
 * Retrieve a user's active matches from the database
 * @param userId - The user ID to get matches for
 * @returns Array of match candidates with profile data
 */
export async function getUserMatches(userId: string): Promise<MatchCandidate[]> {
  const supabase = createClient();
  if (!supabase) {
    console.log('Supabase client is null - likely no matches table exists yet');
    return [];
  }

  try {
    // Step 1: Fetch match rows
    const { data: matchRows, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('compatibility_score', { ascending: false })
      .limit(3);

    if (matchError) {
      console.error('Supabase error fetching matches:', matchError.message);
      throw new Error(`Database error: ${matchError.message}`);
    }

    if (!matchRows || matchRows.length === 0) {
      return [];
    }

    // Step 2: Fetch profiles for matched users
    const matchedUserIds = matchRows.map(m => m.matched_user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', matchedUserIds);

    if (profileError) {
      console.error('Supabase error fetching profiles:', profileError.message);
      throw new Error(`Database error: ${profileError.message}`);
    }

    const profileMap = new Map(
      (profiles as ProfileRow[]).map(p => [p.id, rowToProfile(p)])
    );

    // Step 3: Combine matches with profiles
    return matchRows
      .filter(match => profileMap.has(match.matched_user_id))
      .map(match => ({
        profile: profileMap.get(match.matched_user_id)!,
        score: match.compatibility_score,
        summary: match.compatibility_summary
      }));
  } catch (err) {
    console.error('Error in getUserMatches:', err);
    throw err;
  }
}
