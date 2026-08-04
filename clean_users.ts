import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  console.log("Cleaning up extra users in database...");

  // Delete all users EXCEPT mensahsamuel3803@gmail.com
  const { data, error } = await supabase
    .from('users')
    .delete()
    .neq('email', 'mensahsamuel3803@gmail.com')
    .select();

  if (error) {
    console.error(`Failed to clean users:`, error.message);
  } else {
    console.log(`Successfully deleted ${data.length} extra user(s).`);
    data.forEach(user => console.log(` - Removed: ${user.email}`));
  }

  console.log("Cleanup complete!");
}

cleanDatabase();
