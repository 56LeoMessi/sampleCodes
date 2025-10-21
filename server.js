// --- server.js (Vulnerable + Well-Designed Version) ---

const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'a-very-secret-key-that-is-long',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

// FAKE financial data for visuals
let userAccount = {
    username: 'danish',
    accountNumber: 'PK12 FBANK 0012 3456 7890 1234',
    balance: 150230.75, // Using PKR as a nod to your location
    email: 'user@example.com'
};

// --- Helper Function to build the page ---
function getBankPage(username, account) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fictional Bank Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto max-w-4xl mt-10">
            <header class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-blue-800">FictionalBank</h1>
                <div class="text-right">
                    <span>Welcome, <b>${username}</b>!</span>
                    <a href="/logout" class="ml-4 text-sm text-blue-600 hover:underline">Logout</a>
                </div>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 class="text-xl font-semibold mb-4 border-b pb-2">Account Summary</h2>
                    <div class="space-y-3">
                        <div>
                            <span class="text-gray-500">Account Number:</span>
                            <span class="font-mono ml-2">${account.accountNumber}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Current Balance:</span>
                            <span class="text-2xl font-bold ml-2 text-green-700">PKR ${account.balance.toLocaleString()}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Registered Email:</span>
                            <span class="font-medium ml-2">${account.email}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h2 class="text-xl font-semibold mb-4">Update Profile</h2>
                    <form action="/update-email" method="POST" class="space-y-4">
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">New Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="new.email@example.com"
                            />
                        </div>
                        <button 
                            type="submit" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Update Email
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
        res.send(getBankPage(req.session.user, userAccount));
    } else {
        res.send(`
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1 class="text-3xl font-bold text-blue-800">Welcome to FictionalBank</h1>
                <a href="/login" style="font-size: 1.2rem; color: blue; text-decoration: none; padding: 10px; background-color: #eee; border-radius: 5px;">Login to Your Account</a>
            </body>
        `);
    }
});

// 2. Login (simulated)
app.get('/login', (req, res) => {
    req.session.user = userAccount.username;
    console.log(`[+] User '${req.session.user}' logged in.`);
    res.redirect('/');
});

// 3. Logout
app.get('/logout', (req, res) => {
    // Reset email on logout for demo purposes
    userAccount.email = 'user@example.com';
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
    console.log('Vulnerable (Well-Designed) server running on http://localhost:3000');
});
