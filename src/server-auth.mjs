// Server-controlled role and deployment allowlist must both authorize an administrator.
export function isAllowedAdmin(user, allowedEmails) {
 const allow=String(allowedEmails||'').toLowerCase().split(',').map(email=>email.trim()).filter(Boolean);
 return !!user && Array.isArray(user.roles) && user.roles.includes('admin') && allow.includes(String(user.email||'').toLowerCase());
}
