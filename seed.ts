import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const genId = (prefix = "usr") => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

async function seedDatabase() {
  console.log("Seeding database with 5 applicants and 1 HR staff...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const newUsers = [
    // HR Staff
    {
      id: genId("usr_hr"),
      name: "Alice Johnson",
      email: "alice.hr@hirepulse.com",
      password: hashedPassword,
      phone: "+1 555-0100",
      role: "admin",
      status: "active",
      permission_level: "hr_staff",
      department: "Human Resources",
      avatar_url: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    // Applicant 1
    {
      id: genId("usr_app"),
      name: "John Doe",
      email: "john.doe@example.com",
      password: hashedPassword,
      phone: "+1 555-0101",
      role: "applicant",
      status: "active",
      permission_level: null,
      department: null,
      avatar_url: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    // Applicant 2
    {
      id: genId("usr_app"),
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: hashedPassword,
      phone: "+1 555-0102",
      role: "applicant",
      status: "active",
      permission_level: null,
      department: null,
      avatar_url: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    // Applicant 3
    {
      id: genId("usr_app"),
      name: "Michael Chen",
      email: "michael.c@example.com",
      password: hashedPassword,
      phone: "+1 555-0103",
      role: "applicant",
      status: "active",
      permission_level: null,
      department: null,
      avatar_url: "https://randomuser.me/api/portraits/men/46.jpg"
    },
    // Applicant 4
    {
      id: genId("usr_app"),
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      password: hashedPassword,
      phone: "+1 555-0104",
      role: "applicant",
      status: "active",
      permission_level: null,
      department: null,
      avatar_url: "https://randomuser.me/api/portraits/women/12.jpg"
    },
    // Applicant 5
    {
      id: genId("usr_app"),
      name: "David Kim",
      email: "david.k@example.com",
      password: hashedPassword,
      phone: "+1 555-0105",
      role: "applicant",
      status: "active",
      permission_level: null,
      department: null,
      avatar_url: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  for (const user of newUsers) {
    const { error } = await supabase.from('users').insert(user);
    if (error) {
      console.error(`Failed to insert user ${user.email}:`, error.message);
    } else {
      console.log(`Successfully inserted user: ${user.email}`);
      
      // If it's an applicant, create an applicant profile
      if (user.role === 'applicant') {
        const { error: profileError } = await supabase.from('applicant_profiles').insert({
          user_id: user.id,
          title: "Software Engineer",
          bio: `I am an experienced professional looking for new opportunities.`,
          skills: ["JavaScript", "React", "Node.js", "SQL"],
          education: [],
          experience: []
        });
        
        if (profileError) {
           console.error(`Failed to insert profile for ${user.email}:`, profileError.message);
        }
      }
    }
  }

  console.log("Seeding complete! All users have the password: '123456'");
}

seedDatabase();
