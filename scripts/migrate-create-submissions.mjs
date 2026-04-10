import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createApplicationSubmissionsTable() {
  try {
    console.log('📋 Creating application_submissions table...');

    // Create the table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.application_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          video_link TEXT NOT NULL,
          documents JSONB DEFAULT '[]'::jsonb,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) DEFAULT 'submitted',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_application_submissions_email ON public.application_submissions(email);
        CREATE INDEX IF NOT EXISTS idx_application_submissions_status ON public.application_submissions(status);
        CREATE INDEX IF NOT EXISTS idx_application_submissions_submitted_at ON public.application_submissions(submitted_at DESC);

        ALTER TABLE public.application_submissions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Enable read access for authenticated users" ON public.application_submissions
          FOR SELECT
          USING (auth.role() = 'authenticated');

        CREATE POLICY "Enable insert for all" ON public.application_submissions
          FOR INSERT
          WITH CHECK (true);
      `
    }).catch(() => null); // This RPC might not exist, we'll try direct query instead

    // If RPC doesn't exist, try direct creation with SQL
    if (error) {
      console.log('⚙️ Using direct SQL execution...');
      
      const { error: tableError } = await supabase.rpc('query', {
        sql: `CREATE TABLE IF NOT EXISTS public.application_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          video_link TEXT NOT NULL,
          documents JSONB DEFAULT '[]'::jsonb,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) DEFAULT 'submitted',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
      }).catch(() => ({ error: 'direct_sql_not_available' }));

      if (tableError) {
        console.log('⚠️ Could not execute SQL directly. Please create the table manually in Supabase dashboard:');
        console.log(`
        CREATE TABLE IF NOT EXISTS public.application_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          video_link TEXT NOT NULL,
          documents JSONB DEFAULT '[]'::jsonb,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) DEFAULT 'submitted',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        `);
        return false;
      }
    }

    // Verify table was created
    const { data: tables, error: verifyError } = await supabase
      .from('application_submissions')
      .select('id')
      .limit(0);

    if (!verifyError) {
      console.log('✅ Table created successfully!');
      return true;
    } else {
      console.log('⚠️ Table verification failed:', verifyError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

createApplicationSubmissionsTable().then(success => {
  if (success) {
    console.log('\n✨ Migration complete!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Migration incomplete. Please create the table manually.');
    process.exit(1);
  }
});
