// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════
async function doLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    if (!u || !p) {
        document.getElementById('login-error').textContent = 'Please enter both fields';
        return;
    }
    const res = await api('/api/login', { method:'POST', body: JSON.stringify({username:u, password:p}) });
    if (res && res.success) {
        currentUser = res.user;

        // topbar (legacy ids kept for JS compat)
        document.getElementById('user-info').textContent = res.user.username;
        const rb = document.getElementById('role-badge');
        rb.textContent = res.user.role;
        rb.className = `role-badge role-${res.user.role}`;

        // sidebar
        document.getElementById('sidebar-avatar').textContent = res.user.username.slice(0, 2).toUpperCase();

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex'; // flex for sidebar layout

        if (res.user.role === 'owner') {
            document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'flex');
        }
        initApp();
    } else {
        document.getElementById('login-error').textContent = res?.message || 'Login failed';
    }
}

function doLogout() {
    currentUser = null;
    cart = [];
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
}

document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
});