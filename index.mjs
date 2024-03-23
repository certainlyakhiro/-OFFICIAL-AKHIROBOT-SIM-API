import express from 'express';
import fs from 'fs';

const app = express();

let responses = {};

try {
  const simiJson = fs.readFileSync('simi.json', 'utf8');
  responses = JSON.parse(simiJson);
} catch (error) {
  console.error('Error loading simi.json:', error);
}

app.use(express.json());

app.get('/', (req, res) => {
  res.send("hi from simi api");
});

app.get('/api/chat', (req, res) => {
  const { message } = req.query;
  try {
    if (responses.hasOwnProperty('responses')) {
      const response = responses.responses[(message || '').toLowerCase()] || "Sorry, I don't understand that.";
      res.json({ message: response });
    } else {
      res.json({ message: "Responses not found in simi.json" });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/teach', (req, res) => {
  const { query, response } = req.body;
  try {
    responses.responses = responses.responses || {};
    responses.responses[query] = response;
    fs.writeFileSync('simi.json', JSON.stringify(responses, null, 2));
    res.json({ message: 'Response added successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});