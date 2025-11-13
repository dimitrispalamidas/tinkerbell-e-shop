// Helper script to create an admin user
// Run with: npx tsx scripts/setup-admin.ts <email> <password>

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin(email: string, password: string) {
  try {
    // Create the user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating user:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('No user data returned');
      return;
    }

    // Add to admin_users table
    const { error: adminError } = await supabase.from('admin_users').insert({
      user_id: authData.user.id,
      role: 'admin',
      permissions: [],
    });

    if (adminError) {
      console.error('Error adding to admin_users:', adminError.message);
      return;
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error('Usage: npx tsx scripts/setup-admin.ts <email> <password>');
    console.error('Example: npx tsx scripts/setup-admin.ts admin@tinkerbell.gr MySecurePassword123');
  process.exit(1);
}

createAdmin(email, password);

