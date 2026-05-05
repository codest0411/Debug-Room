import { createClient } from '@supabase/supabase-js';

async function createAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = 'admin@dr.com';
  const password = 'admin0411';

  console.log('Creating/Updating admin account...');

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('User already exists in Auth. Updating metadata...');
      // If user exists, we might need to find their ID
      const { data: users } = await supabase.from('users').select('id').eq('email', email).single();
      if (users) {
        await supabase.from('users').update({ is_admin: true, is_super_admin: true, admin_role: 'super_admin' }).eq('id', users.id);
        console.log('Success: Admin privileges restored for existing user.');
        return;
      }
    } else {
      console.error('Error creating auth user:', authError.message);
      return;
    }
  }

  const userId = authData.user?.id;
  if (!userId) return;

  // 2. The trigger should handle the public.users insert, but let's make sure admin flags are set
  const { error: userError } = await supabase
    .from('users')
    .update({ 
      is_admin: true, 
      is_super_admin: true, 
      admin_role: 'super_admin' 
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error setting admin flags:', userError.message);
  } else {
    console.log('Success: Admin account created and privileges granted.');
    console.log('Email:', email);
    console.log('Password:', password);
  }
}

createAdmin();
