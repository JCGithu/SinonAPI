const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
require('dotenv').config();

const { yt } = require('./workers/youtube');

const port = process.env.PORT || 500;

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

var corsOptions = {
  origin: '*',
  methods: 'GET',
  allowedHeaders: '*',
};

const fetchSets = {
  referrer: '',
  method: 'GET',
  origin: '*',
  headers: {
    'Content-Type': 'application/json',
  },
  dataType: 'json',
};

app.get('/periscope/:token', cors(corsOptions), async (req, res) => {
  let token = req.params.token;
  let URL = `https://api.periscope.tv/api/v2/getAccessPublic?token=${token}`;
  let HLS = await fetch(URL, fetchSets)
    .then((data) => {
      return data.json();
    })
    .then((json) => {
      console.log(json);
      if (json.hls_url) {
        return { text: 'Live URL', url: json.hls_url };
      } else {
        return { text: 'Replay URL', url: json.replay_url };
      }
    });
  res.json(HLS);
});

app.get('/parliament/:token', cors(corsOptions), async (req, res) => {
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

app.get('/youtube/:token', cors(corsOptions), async (req, res) => {
  let info = await yt(req.params.token);
  res.json(info);
});

app.listen(port, () => {
  console.log(`Listening at http://localpost:${port}`);
});
