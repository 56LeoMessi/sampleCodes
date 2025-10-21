// --- server.js (Vulnerable Version) ---

const express = require('express');
const session = require('express-session');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: false }));

// Middleware for sessions
app.use(session({
    secret: 'a-very-secret-key-that-is-long',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true } // httpOnly is good, but not enough!
}));

let userAccount = {
    username: 'danish',
    balance: 1000,
    email: 'user@example.com'
};

// --- Routes ---

// 1. Homepage
app.get('/', (req, res) => {
    if (req.session.user) {
        res.send(`
            <h1>Welcome, ${userAccount.username}!</h1>
            <p>Your balance is: $${userAccount.balance}</p>
            <p>Your email is: ${userAccount.email}</p>
            
            <form action="/update-email" method="POST">
                <label>New Email:</label>
                <input type="email" name="email" />
                <button type="submit">Update Email</button>
            </form>
            <br>
            <a href="/logout">Logout</a>
        `);
    } else {
        res.send('<h1>Welcome to Fictional Bank</h1><a href="/login">Login</a>');
    }
});

// 2. Login (simulated)
app.get('/login', (req, res) => {
    req.session.user = userAccount.username; // Log the user in
    console.log(`[+] User '${req.session.user}' logged in.`);
    res.redirect('/');
});

// 3. Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 4. THE VULNERABLE ENDPOINT
app.post('/update-email', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Not logged in.');
    }

    const newEmail = req.body.email;
    userAccount.email = newEmail;
    console.log(`[!!!] VULNERABLE ACTION: Email updated to ${newEmail}`);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Vulnerable server running on http://localhost:3000');
});
