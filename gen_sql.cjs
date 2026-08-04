const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('123456', 10);
const sql = `INSERT INTO public.users (id, name, email, password, role, status, permission_level, department, avatar_url) VALUES ('usr_admin_123', 'Samuel Mensah', 'mensahsamuel3803@gmail.com', '${hash}', 'admin', 'active', 'super_admin', 'Human Resources', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');`;
console.log(sql);
