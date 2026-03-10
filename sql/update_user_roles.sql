-- Update user roles for Jonas Jooss and Lisa Schnagl from "Benutzer" to "Teamleiter"

UPDATE users
SET 
  role = 'Teamleiter',
  is_admin = false,
  updated_at = NOW()
WHERE display_name IN ('Jonas Jooss', 'Lisa Schnagl')
  AND role = 'Benutzer';

-- Verify the changes
SELECT id, username, display_name, role, is_admin
FROM users
WHERE display_name IN ('Jonas Jooss', 'Lisa Schnagl');
