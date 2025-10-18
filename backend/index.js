// Minimal Express backend stub
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/contract', (req, res) => {
  // Placeholder: return compiled TEAL or metadata
  res.json({ name: 'sample_contract', description: 'Placeholder contract endpoint' });
});

app.listen(port, () => console.log(`Backend listening on port ${port}`));
