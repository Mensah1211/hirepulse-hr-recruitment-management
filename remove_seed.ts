import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeSeed() {
  const emailsToRemove = [
    "alice.hr@hirepulse.com",
    "john.doe@example.com",
    "jane.smith@example.com",
    "michael.c@example.com",
    "sarah.w@example.com",
    "david.k@example.com"
  ];

  console.log("Removing seeded users...");

  for (const email of emailsToRemove) {
    const { error } = await supabase.from('users').delete().eq('email', email);
    if (error) {
      console.error(`Failed to delete user ${email}:`, error.message);
    } else {
      console.log(`Successfully removed user: ${email}`);
    }
  }

  console.log("Cleanup complete!");
}

removeSeed();
