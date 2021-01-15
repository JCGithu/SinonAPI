const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
require('dotenv').config();

const fs = require('fs');
const ytdl = require('ytdl-core');

async function yt(ytURL) {
  let info = await ytdl.getInfo(ytURL);
  let output = {};
  let i = 1;
  for (const format in info.formats) {
    var obj = info.formats[format];
    let addInfo = '';
    let endInfo = '';
    if (!obj.hasAudio) {
      addInfo = ' (Only video)';
    }
    if (!obj.hasVideo) {
      addInfo = ' (Only audio)';
    }
    if (obj.isLive) {
      obj.quality = 'livestream';
    }
    if (obj.qualityLabel == null) {
      obj.qualityLabel = '';
    }
    if (obj.fps == undefined) {
      obj.fps = '';
    } else {
      endInfo = `// ${obj.fps}p`;
    }
    if (obj.quality !== 'tiny') {
      output[i] = {};
      output[i].text = `${obj.quality}:${addInfo} ${obj.qualityLabel} ${obj.container} ${endInfo}`;
      output[i].url = obj.url;
    }
    i++;
    if (i > info.formats.length) {
      return output;
    }
  }
}

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
      return json.hls_url;
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
