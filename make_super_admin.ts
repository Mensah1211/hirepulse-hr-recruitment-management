import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function makeSuperAdmin() {
  const email = "mensahsamuel3803@gmail.com";
  console.log(`Looking for user with email: ${email}`);

  const hashedPassword = await bcrypt.hash("123456", 10);

  // Check if user exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error fetching user:", fetchError.message);
    return;
  }

  if (user) {
    console.log("User found. Updating to Super HR and setting password...");
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin', permission_level: 'super_admin', department: 'Human Resources', password: hashedPassword })
      .eq('email', email);

    if (updateError) {
      console.error("Failed to update user:", updateError.message);
    } else {
      console.log("Success! User is now Super HR with new password.");
    }
  } else {
    console.log("User not found. Creating a new Super HR account...");
    const genId = () => `usr_admin_${Math.random().toString(36).substring(2, 9)}`;
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: genId(),
        name: "Samuel Mensah",
        email: email,
        password: hashedPassword,
        role: "admin",
        status: "active",
        permission_level: "super_admin",
        department: "Human Resources",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
      });

    if (insertError) {
      console.error("Failed to create user:", insertError.message);
    } else {
      console.log("Success! Super HR user created with password.");
    }
  }
}

makeSuperAdmin();
