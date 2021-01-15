const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
require('dotenv').config();

const port = 500;

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

const fetchSets = {
  referrer: '',
  method: 'GET',
  origin: '*',
  headers: {
    'Content-Type': 'application/json',
  },
  dataType: 'json',
};

app.get('/periscope/:token', async (req, res) => {
  let token = req.params.token;
  let URL = `https://api.periscope.tv/api/v2/getAccessPublic?token=${token}`;
  let HLS = await fetch(URL, fetchSets)
    .then((data) => {
      return data.json();
    })
    .then((json) => {
      console.log(json);
      return json.hls_url;
    });
  res.json(HLS);
});

app.get('/parliament/:token', async (req, res) => {
  let token = req.params.token;
  let URL = `http://videoplayback.parliamentlive.tv/Player/Live/${token}`;
  let HLS = await fetch(URL, fetchSets)
    .then((data) => {
      return data.text();
    })
    .then((text) => {
      var regex = /[0-9A-Za-z\/\.\-\:]+.m3u8/g;
      var livestreamURL = text.match(regex)[0];
      return livestreamURL;
    });
  res.json(HLS);
});

app.listen(port, () => {
  console.log(`Listening at http://localpost:${port}`);
});
