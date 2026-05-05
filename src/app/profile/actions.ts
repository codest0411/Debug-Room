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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('users')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

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
