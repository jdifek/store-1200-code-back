const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,  // берется из .env
  process.env.SUPABASE_SERVICE_ROLE_KEY   // сервисный ключ
);

module.exports = supabase;
