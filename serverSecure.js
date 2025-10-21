// --- server.js (SECURE Version) ---

const express = require('express');
const session = require('express-session');
const crypto = require('crypto'); // <-- ADD THIS MODULE

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'a-very-secret-key-that-is-long',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

let userAccount = {
    username: 'danish',
    balance: 1000,
    email: 'user@example.com'
};

// --- Routes ---

app.get('/', (req, res) => {
    if (req.session.user) {
        
        // --- ADDED TOKEN GENERATION ---
        const csrfToken = crypto.randomBytes(32).toString('hex');
        req.session.csrfToken = csrfToken; // Store token in session

        res.send(`
            <h1>Welcome, ${userAccount.username}!</h1>
            <p>Your balance is: $${userAccount.balance}</p>
            <p>Your email is: ${userAccount.email}</p>
            
            <form action="/update-email" method="POST">
                <label>New Email:</label>
                <input type="email" name="email" />
                
                <input type="hidden" name="_csrf" value="${csrfToken}" />
                
                <button type="submit">Update Email</button>
            </form>
            <br>
            <a href="/logout">Logout</a>
        `);
    } else {
        res.send('<h1>Welcome to Fictional Bank</h1><a href="/login">Login</a>');
    }
});

app.get('/login', (req, res) => {
    req.session.user = userAccount.username;
    console.log(`[+] User '${req.session.user}' logged in.`);
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- THE NOW-SECURE ENDPOINT ---
app.post('/update-email', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Not logged in.');
    }

    // --- ADDED TOKEN VALIDATION ---
    const { email, _csrf } = req.body;
    const sessionToken = req.session.csrfToken;

    // Invalidate the token after first use (important!)
    req.session.csrfToken = null; 

    if (!sessionToken || !_csrf || sessionToken !== _csrf) {
        console.log(`[!!!] CSRF ATTACK BLOCKED: Invalid or missing token.`);
        return res.status(403).send('Invalid CSRF Token. Action blocked.');
    }
    // --- END VALIDATION ---

    userAccount.email = email;
    console.log(`[+] SECURE ACTION: Email updated to ${email}`);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('SECURE server running on http://localhost:3000');
});
