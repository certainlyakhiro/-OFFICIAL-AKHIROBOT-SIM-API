import express from 'express';
import axios from 'axios';

const app = express();

const jsonBinUrl = 'https://api.jsonbin.io/v3/b/65feaddfc15d220e43999615';
const apiKey = '$2a$10$pQ53lJGfRhNLnvZCndpFd.5HbfM90xYPWdc.8HTDS0f6eqtkQcAx.';

let responses = {};

axios.get(jsonBinUrl + '/latest', { headers: { 'X-Master-Key': apiKey } })
  .then(response => {
    responses = response.data.record.responses || {};
  })
  .catch(error => {
    console.error('Error fetching responses from JSONBin:', error);
  });

app.use(express.json());

app.get('/', (req, res) => {
  res.send("hi from simi api");
});

app.get('/api/chat', (req, res) => {
  const { message } = req.query;
  try {
    if (responses.hasOwnProperty('record')) {
      const response = responses.record.responses[message] || "Sorry, I don't understand that.";
      res.json({ message: response });
    } else {
      res.json({ message: "Responses not found in JSONBin" });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/teach', (req, res) => {
  const { query, response } = req.body;
  try {
    responses.record = responses.record || { responses: {} };
    responses.record.responses[query] = response;
    axios.put(jsonBinUrl, responses, { headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey } })
      .then(() => {
        res.json({ message: 'Response added successfully.' });
      })
      .catch(error => {
        console.error('Error updating JSONBin:', error);
        res.status(500).send('Internal Server Error');
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});