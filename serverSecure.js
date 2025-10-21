// --- server.js (SECURE + Internal CSS Version) ---

const express = require('express');
const session = require('express-session');
const crypto = require('crypto'); // We need this for the token
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'a-very-secret-key-that-is-long',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

// FAKE financial data
let userAccount = {
    username: 'danish',
    accountNumber: 'PK12 FBANK 0012 3456 7890 1234',
    balance: 150230.75,
    email: 'user@example.com'
};

// --- Helper Function to build the SECURE page ---
function getBankPage(username, account, csrfToken) { // Added csrfToken
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fictional Bank Dashboard</title>
        
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 900px;
                margin: 20px auto;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #ddd;
            }
            .header h1 {
                font-size: 2.25rem;
                color: #0d47a1; /* Dark blue */
                margin: 0;
            }
            .header .user-info {
                text-align: right;
            }
            .header .user-info span {
                font-size: 0.9rem;
            }
            .header .user-info a {
                margin-left: 16px;
                font-size: 0.9rem;
                color: #1565c0; /* Lighter blue */
                text-decoration: none;
            }
            .header .user-info a:hover {
                text-decoration: underline;
            }
            .grid-container {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 24px;
            }
            @media (max-width: 768px) {
                .grid-container {
                    grid-template-columns: 1fr;
                }
            }
            .card {
                background-color: #ffffff;
                padding: 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .card h2 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 16px;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            .summary-item {
                margin-bottom: 16px;
            }
            .summary-item .label {
                font-size: 0.9rem;
                color: #555;
                display: block;
                margin-bottom: 4px;
            }
            .summary-item .value {
                font-size: 1.1rem;
                font-weight: 600;
            }
            .summary-item .value.balance {
                font-size: 1.75rem;
                color: #2e7d32; /* Green */
            }
            .summary-item .value.mono {
                font-family: "Courier New", Courier, monospace;
            }
            .form-group {
                margin-bottom: 16px;
            }
            .form-label {
                display: block;
                margin-bottom: 6px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            .form-input {
                width: 100%;
                padding: 10px 12px;
                font-size: 1rem;
                border: 1px solid #ccc;
                border-radius: 6px;
                box-sizing: border-box; /* Important for width */
            }
            .form-input:focus {
                outline: none;
                border-color: #1565c0;
                box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.2);
            }
            .btn {
                width: 100%;
                padding: 12px;
                font-size: 1rem;
                font-weight: 600;
                color: #ffffff;
                background-color: #1976d2; /* Main blue for secure actions */
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .btn:hover {
                background-color: #1565c0; /* Darker blue */
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>FictionalBank</h1>
                <div class="user-info">
                    <span>Welcome, <b>${username}</b>!</span>
                    <a href="/logout">Logout</a>
                </div>
            </header>

            <div class="grid-container">
                <div class="card">
                    <h2>Account Summary</h2>
                    <div class="summary-item">
                        <span class="label">Account Number:</span>
                        <span class="value mono">${account.accountNumber}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Current Balance:</span>
                        <span class="value balance">PKR ${account.balance.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Registered Email:</span>
                        <span class="value">${account.email}</span>
                    </div>
                </div>

                <div class="card">
                    <h2>Make a Transfer</h2>
                    <form action="/transfer" method="POST">
                        <div class="form-group">
                            <label for="toAccount" class="form-label">To Account Number</label>
                            <input 
                                type="text" 
                                name="toAccount" 
                                id="toAccount" 
                                class="form-input"
                                placeholder="PKXX XXXX XXXX XXXX"
                            />
                        </div>
                        <div class="form-group">
                            <label for="amount" class="form-label">Amount (PKR)</label>
                            <input 
                                type="number" 
                                name="amount" 
                                id="amount" 
                                class="form-input"
                                placeholder="5000"
                            />
                        </div>

                        <input type="hidden" name="_csrf" value="${csrfToken}" />

                        <button type="submit" class="btn">
                            Transfer Funds
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

// --- Routes ---

app.get('/', (req, res) => {
    if (req.session.user) {
        // --- TOKEN GENERATION ---
        const csrfToken = crypto.randomBytes(32).toString('hex');
        req.session.csrfToken = csrfToken; // Store token in session
        
        res.send(getBankPage(req.session.user, userAccount, csrfToken));

    } else {
        res.send(`
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1>Welcome to FictionalBank</h1>
                <a href="/login" style="font-size: 1.2rem; color: blue; text-decoration: none; padding: 10px; background-color: #eee; border-radius: 5px;">Login to Your Account</a>
            </body>
        `);
    }
});

app.get('/login', (req, res) => {
    req.session.user = userAccount.username;
    console.log(`[+] User '${req.session.user}' logged in.`);
    // On login, reset balance for the demo
    userAccount.balance = 150230.75;
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 4. THE SECURE ENDPOINT (with token validation)
app.post('/transfer', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Not logged in.');
    }

    // --- TOKEN VALIDATION ---
    const { toAccount, amount, _csrf } = req.body;
    const sessionToken = req.session.csrfToken;

    req.session.csrfToken = null; // Invalidate token after use

    if (!sessionToken || !_csrf || sessionToken !== _csrf) {
        console.log(`[!!!] CSRF ATTACK BLOCKED: Invalid or missing token.`);
        return res.status(403).send(
            '<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">' +
            '<h1 style="color: red;">403 Forbidden</h1>' +
            '<p>Invalid CSRF Token. Action blocked.</p>' +
            '<a href="/">Go Back</a>'
        );
    }
    // --- END VALIDATION ---

    const transferAmount = parseFloat(amount || 0);
    userAccount.balance -= transferAmount;
    
    console.log(`[+] SECURE ACTION: Transferred ${transferAmount} to ${toAccount}`);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('SECURE (Internal CSS) server running on http://localhost:3000');
});
