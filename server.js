const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
require('dotenv').config();

const port = process.env.PORT || 500;

const app = express();
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.get('/periscope/:token', async (req, res) => {
  let token = req.params.token;
  let URL = `https://api.periscope.tv/api/v2/getAccessPublic?token=${token}`;
  let HLS = await fetch(URL, {
    referrer: '',
    method: 'GET',
    origin: '*',
    headers: {
      'Content-Type': 'application/json',
    },
    dataType: 'json',
  })
    .then((data) => {
      return data.json();
    })
    .then((json) => {
      console.log(json);
      return json.hls_url;
    });
  res.json(HLS);
});

app.listen(port, () => {
  console.log(`Listening at http://localpost:${port}`);
});
