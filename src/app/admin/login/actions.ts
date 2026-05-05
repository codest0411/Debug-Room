'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  // 1. Sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Check Admin Status
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData?.is_admin) {
      await supabase.auth.signOut();
      return { error: 'Access denied. Admin privileges required.' };
    }
  }

  return { success: true };
}
