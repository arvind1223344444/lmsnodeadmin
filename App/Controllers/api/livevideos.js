const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors'); 
const multer = require('multer')
const clientId = '2QzXoasoQBimWPtbXIsg';
const clientSecret = '7JP72COlmOyFbFjSOETepQr3eyADgp4G';
const redirectUri = 'https://node-project-rc3o.onrender.com/api/live/callback';
app.use(cors());
// Function to refresh the Zoom access token using the refresh token
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

app.get('/authorize', (req, res) => {
  res.redirect(`https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    console.log(accessToken)
    console.log("refresh"+refreshToken)
    // Save the refresh token securely for future use
   const  token={
         accessToken:accessToken,
         refreshToken:refreshToken
      }
    // Redirect to a success page or handle as needed
    res.status(200).send({response: token });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/golive', multer().none(),async (req, res) => {
  try {
    const { token } = req.body;
    
    // Assuming refreshAccessToken is a valid function that returns a new access token
    const refreshToken = token;
    const accessToken = await refreshAccessToken(refreshToken);

    const meetingParams = {
      host_id: 'me',
      topic: 'dinesh ',
      type: 2,
      start_time: '2023-08-05T12:00:00Z',
      timezone: 'Asia/Kolkata', // Use a valid timezone identifier
    };

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingParams,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Meeting created:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating meeting:', error);

    // Log the error details for debugging
    console.error('Error details:', error.response?.data);

    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
  }
});


module.exports = app;
