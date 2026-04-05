import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function check() {
  console.log('--- DAFTAR INSTANSI DI DATABASE ---');
  const { data, error } = await supabase
    .from('institutions')
    .select('id, name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (data?.length === 0) {
    console.log('TIDAK ADA DATA (KOSONG).');
  } else {
    data?.forEach(inst => {
      console.log(`[ID: ${inst.id}] - ${inst.name} (Dibuat: ${inst.created_at})`);
    });
  }
}

check();
