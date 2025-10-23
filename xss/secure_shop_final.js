// secure_shop_final.js (Pro-Style + SECURED)
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const he = require('he'); // <-- We will now use this!
const app = express();

// --- Setup for Session and CSRF ---
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'a-very-strong-secret-key', // Changed to a better secret
    resave: false,
    saveUninitialized: true,
    
    // --- FIX #1 & #2: Secure Cookie Settings ---
    cookie: { 
        httpOnly: true, // PREVENTS JS from reading the cookie
        sameSite: 'Strict' // PREVENTS CSRF by not sending cookie on cross-site requests
    }
    // ------------------------------------------
}));
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
// ------------------------------------

// In-memory "database"
let reviews = [
    { user: "TechGuru", text: "This laptop is powerful, but very expensive." }
];
let userBalance = 50000;

function requireLogin(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        next();
    }
}

// --- Main E-Shop Page ---
app.get('/', requireLogin, (req, res) => {
    let reviewsHtml = '';

    for (const review of reviews) {
        reviewsHtml += `
            <div class="card review-card mb-3">
                <div class="card-body">
                    <h6 class="card-title mb-1 text-primary"><i class="bi bi-person-circle me-1"></i>${he.encode(review.user)} says:</h6>
                    
                    <p class="card-text">${he.encode(review.text)}</p>
                    </div>
            </div>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>E-Shop (SECURE)</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
        
        <style>
          body { 
            background-color: #f5f7fa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .navbar {
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            background-color: #fff !important;
          }
          .navbar-brand {
            font-size: 1.6rem;
            color: #0077ff !important;
            letter-spacing: -0.5px;
          }
          .product-card {
            border: none;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.07);
            background-color: #fff;
          }
          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0;
          }
          .price-display {
            font-weight: 800;
            color: #28a745;
          }
          .btn-primary {
            background: linear-gradient(135deg, #007bff, #0056d2);
            border: none;
          }
          .review-card {
            border: 1px solid #e9ecef;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          }
          .card-body h4, .card-body h6 {
            font-weight: 600;
          }
          .form-control, textarea {
            border-radius: 8px !important;
          }
          footer {
            margin-top: 80px;
            padding: 30px 0;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
          }
        </style>
    </head>
    <body class="pb-5">
        <nav class="navbar navbar-expand-lg navbar-light sticky-top">
          <div class="container">
            <a class="navbar-brand fw-bold" href="#"><i class="bi bi-shop me-2"></i>E-Shop Pro (Secure 🛡️)</a>
            <ul class="navbar-nav ms-auto">
              <li class="nav-item"><span class="navbar-text me-3">Balance: <b>$${userBalance}</b></span></li>
              <li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>
            </ul>
          </div>
        </nav>

        <main class="container" style="max-width: 1000px;">
            <div class="card product-card mt-5">
                <div class="row g-0">
                    <div class="col-md-6 bg-light d-flex align-items-center justify-content-center">
                        <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80" 
                             alt="Premium Laptop" class="product-image">
                    </div>
                    <div class="col-md-6 d-flex flex-column p-4">
                        <div class="card-body">
                            <h1 class="card-title mb-3 fw-bold">Super-Premium Laptop</h1>
                            <p class="card-text text-muted mb-4">The ultimate performance machine. Our checkout is 100% secure with anti-CSRF protection.</p>
                            <h2 class="price-display display-5 mb-4">$10,000</h2>
                            
                            <form action="/buy" method="POST">
                              <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                              <input type="hidden" name="item" value="Laptop">
                              <input type="hidden" name="price" value="10000">
                              <button type="submit" class="btn btn-primary btn-lg w-100 py-3 fw-bold">
                                <i class="bi bi-bag-check-fill me-2"></i>Buy Now
                              </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-5">
                <h3 class="mb-4 fw-bold"><i class="bi bi-chat-left-text-fill me-2 text-primary"></i>Customer Reviews</h3>
                <div class="mb-4" id="review-list">${reviewsHtml}</div>
                
                <form action="/review" method="POST" class="card card-body shadow-sm border-0">
                    <h4 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2"></i>Leave a Review</h4>
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <div class="mb-3">
                        <label for="user" class="form-label fw-semibold">Your Name</label>
                        <input type="text" class="form-control" id="user" name="user" value="Attacker">
                    </div>
                    <div class="mb-3">
                        <label for="text" class="form-label fw-semibold">Review</label>
                        <textarea class="form-control" id="text" name="text" rows="3" placeholder="Share your thoughts..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-dark fw-bold"><i class="bi bi-send-fill me-2"></i>Submit Review</button>
                </form>
            </div>
        </main>
        
        <footer>
          <p>© 2025 E-Shop Pro. All rights reserved.</p>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    `);
});

// --- Auth Routes ---
app.get('/login', (req, res) => {
    res.send(`
    <body class="container mt-5">
      <h1>Login to E-Shop Pro</h1>
      <form action="/login" method="POST">
        <input type="hidden" name="_csrf" value="${req.csrfToken()}">
        <p><i>(Click to login as 'user')</i></p>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
    </body>`);
});

app.post('/login', (req, res) => {
    req.session.loggedIn = true;
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// --- Action Routes ---
app.post('/buy', requireLogin, (req, res) => {
    const price = parseInt(req.body.price, 10);
    if (userBalance >= price) {
        userBalance -= price;
        res.send(`<h1>Success!</h1><p>You bought a ${req.body.item} for $${price}.</p><p>New balance: <b>$${userBalance}</b></p><a href="/">Back to Shop</a>`);
    } else {
        res.send(`<h1>Failed</h1><p>Insufficient funds.</p><a href="/">Back to Shop</a>`);
    }
});

// The "Review" post still needs to be secure on the INGEST side,
// but our primary defense is encoding the OUTPUT.
app.post('/review', requireLogin, (req, res) => {
    const { user, text } = req.body;
    if (user && text) {
        // Storing the text as-is is fine, as long as we encode it on render.
        reviews.push({ user: user, text: text });
    }
    res.redirect('/');
});

// CSRF Error Handler
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('CSRF Token Error. Request blocked.');
    } else {
        next(err);
    }
});

app.listen(3000, () => {
    console.log('[SECURE SHOP] Server running on http://127.0.0.1:3000');
});
