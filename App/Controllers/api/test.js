const express = require('express');
const app = express();
const axios = require('axios');

const jwt = require('jsonwebtoken');
const apiKey = 'Zsc0Ij7KR9CsBxvTIIbNjg'
const apiSecret = 'M6LeBTL3zlc2LDOK85A0Klq7oomuOhWU'
const generateZoomSignature = (apiKey, apiSecret, meetingNumber, role) => {
  // Generate a JWT token
  const payload = {
    iss: apiKey,
    exp: Date.now() + 60 * 1000, // 1 minute expiration
    meetingNumber,
    role,
  };

  const token = jwt.sign(payload, apiSecret);

  return token;
};


app.post('/generate-zoom-signature', (req, res) => {
  const meetingNumber = '86859981639'
  const apiKey = 'Zsc0Ij7KR9CsBxvTIIbNjg'
  const apiSecret = 'M6LeBTL3zlc2LDOK85A0Klq7oomuOhWU'

  const role = 1; 

  const signature = generateZoomSignature(apiKey, apiSecret, meetingNumber, role);

  res.json({ signature });
});


app.get('/zoom/users', async (req, res) => {
  try {
    const token = generateZoomJWT(apiKey, apiSecret);
    console.log('Generated JWT token:', token);

    const response = await axios.get('https://api.zoom.us/v2/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    
    console.error('Error making Zoom API request:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});

function generateZoomJWT(apiKey, apiSecret) {
  const payload = {
    iss: apiKey,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration time
  };
  console.log('Token expiration:', new Date(payload.exp * 1000).toISOString());

  return jwt.sign(payload, apiSecret);
}


module.exports=app;
