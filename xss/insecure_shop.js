// insecure_shop.js (With CSS Styling)
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

// In-memory "database" for product reviews
const reviews = [
    { user: "TechGuru", text: "This laptop is powerful, but very expensive." },
    { user: "CEOBuyer", text: "Worth every penny for my executive team." }
];

// The main product page
app.get('/', (req, res) => {
    let reviewsHtml = '';

    // --- THE VULNERABILITY (Now in a styled card) ---
    for (const review of reviews) {
        reviewsHtml += `
            <div class="card review-card mb-3">
                <div class="card-body">
                    <h6 class="card-title mb-1">${review.user} says:</h6>
                    <p class="card-text">${review.text}</p>
                </div>
            </div>`;
    }
    // --- END VULNERABILITY ---

    // The full HTML for the page
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Insecure E-Commerce</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        
        <style>
          body { 
            background-color: #f8f9fa; /* Light grey background */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .product-card {
            box-shadow: 0 8px 20px rgba(0,0,0,0.07); /* Softer, deeper shadow */
            border: none;
            border-radius: 12px;
          }
          .review-card {
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
            border: none;
          }
          .navbar {
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          .price-display {
            font-weight: 700; /* Bold price */
          }
        </style>
        </head>
    <body class="pb-5">

        <nav class="navbar navbar-expand-lg navbar-light bg-white mb-5 sticky-top">
          <div class="container">
            <a class="navbar-brand fw-bold" href="#">E-Shop</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li class="nav-item"><a class="nav-link active" href="#">Laptops</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Desktops</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Accessories</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <main class="container" style="max-width: 900px;">
            <div class="card product-card overflow-hidden">
                <div class="row g-0">
                    <div class="col-md-6 bg-light p-4 d-flex align-items-center justify-content-center">
                        
                    </div>
                    <div class="col-md-6 d-flex flex-column p-4">
                        <div class="card-body">
                            <h1 class="card-title mb-3">Super-Premium Laptop</h1>
                            <p class="card-text text-muted mb-4">The latest and greatest laptop. It has more cores than you can count and a screen that's brighter than the sun.</p>
                            
                            <h2 class="text-success price-display display-4 mb-4" id="product-price">
                                $10,000
                            </h2>
                            <button class="btn btn-primary btn-lg w-100 py-3 fw-bold">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-5">
                <h3 class="mb-4">Customer Reviews</h3>
                <div class="mb-4">${reviewsHtml}</div>
                
                <form action="/review" method="POST" class="card card-body shadow-sm">
                    <h4>Leave a Review</h4>
                    <div class="mb-3">
                        <label for="user" class="form-label">Your Name:</label>
                        <input type="text" class="form-control" id="user" name="user" value="Attacker">
                    </div>
                    <div class="mb-3">
                        <label for="text" class="form-label">Review:</label>
                        <textarea class="form-control" id="text" name="text" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-dark">Submit Review</button>
                </form>
            </div>
        </main>
    </body>
    </html>
    `);
});

// Endpoint to receive the new review
app.post('/review', (req, res) => {
    const { user, text } = req.body;
    if (user && text) {
        reviews.push({ user, text });
    }
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('[INSECURE] Shop server running on http://127.0.0.1:3000');
});
