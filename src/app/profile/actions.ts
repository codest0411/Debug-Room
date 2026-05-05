'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: {
  display_name?: string;
  username?: string;
  mobile_number?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return { error: 'Unauthorized' };
  }

  // Get current user data for checks
  const { data: currentUser } = await supabase
    .from('users')
    .select('username, username_last_changed_at, mobile_number')
    .eq('id', authUser.id)
    .single();

  // 1. Check for Username Cooldown (14 Days)
  if (formData.username && formData.username !== currentUser?.username) {
    if (currentUser?.username_last_changed_at) {
      const lastChange = new Date(currentUser.username_last_changed_at).getTime();
      const now = new Date().getTime();
      const daysSince = (now - lastChange) / (1000 * 60 * 60 * 24);
      
      if (daysSince < 14) {
        const remaining = Math.ceil(14 - daysSince);
        return { error: `You can only change your username once every 14 days. ${remaining} days remaining.` };
      }
    }

    // 2. Check if Username is already taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', formData.username)
      .not('id', 'eq', authUser.id)
      .single();
    
    if (existingUser) return { error: 'This username is already taken by another hacker.' };
  }

  // 3. Check if Mobile is already taken
  if (formData.mobile_number && formData.mobile_number !== currentUser?.mobile_number) {
    const { data: existingMobile } = await supabase
      .from('users')
      .select('id')
      .eq('mobile_number', formData.mobile_number)
      .not('id', 'eq', authUser.id)
      .single();
    
    if (existingMobile) return { error: 'This mobile number is already linked to another account.' };
  }

  const updateData: any = {
    ...formData,
    updated_at: new Date().toISOString(),
  };

  // If username changed, update the timestamp
  if (formData.username && formData.username !== currentUser?.username) {
    updateData.username_last_changed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', authUser.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  revalidatePath('/leaderboard');
  return { success: true };
}

export async function updateEmail(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });

  if (error) return { error: error.message };

  return { success: 'Verification email sent to both addresses.' };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  return { success: 'Password updated successfully.' };
}

export async function updateMobile(phone: string) {
  const supabase = await createClient();
  // In a real app, this would trigger SMS verification
  const { error } = await supabase.auth.updateUser({ phone });

  if (error) return { error: error.message };

  return { success: 'Mobile number updated.' };
}
