// insecure_shop.js
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

    // --- THE VULNERABILITY ---
    // We are injecting the review text directly into the page.
    for (const review of reviews) {
        reviewsHtml += `
            <div class="list-group-item">
                <strong>${review.user} says:</strong>
                <p class="mb-1">${review.text}</p>
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
    </head>
    <body class="container mt-5" style="max-width: 800px;">
        <h1 class="mb-3">Insecure E-Commerce Store 😈</h1>
        
        <div class="card">
            <div class="card-header"><h3 class="mb-0">Super-Premium Laptop</h3></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <img src="https://i.imgur.com/gAANB9s.png" class="img-fluid rounded">
                        
                    </div>
                    <div class="col-md-6">
                        <p>The latest and greatest laptop. It has more cores than you can count and a screen that's brighter than the sun.</p>
                        
                        <h2 class="text-success fw-bold display-4" id="product-price">
                            $10,000
                        </h2>
                        <button class="btn btn-primary btn-lg w-100">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>

        <hr classs="my-5">

        <div class="mt-5">
            <h3>Customer Reviews</h3>
            <div class="list-group mb-4">${reviewsHtml}</div>
            
            <form action="/review" method="POST" class="card card-body">
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
