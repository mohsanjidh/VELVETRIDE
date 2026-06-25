import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://slbziwdlgcmxuplirfxw.supabase.co';
const supabaseKey = 'sb_publishable_KvSc7s2b69bQsaW3kBx7Lg_8USXjEV5';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
