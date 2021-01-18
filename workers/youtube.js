const ytdl = require('ytdl-core');

let addInfo = '';
let endInfo = '';

async function gate(obj) {
  if (obj.isLive) {
    if (obj.container !== 'ts') {
      return false;
    }
  }
  if (obj.qualityLabel !== null) {
    let height = parseInt(obj.qualityLabel.split('p')[0]);
    if (height < 300) {
      return false;
    }
  }
  if (obj.quality == 'tiny' && !obj.hasAudio) {
    return false;
  }
  return true;
}

async function filter(i, obj, output) {
  output[i] = {};
  if (!obj.hasAudio) {
    addInfo = ' (Only video)';
    output[i].onlyVideo = true;
  }
  if (!obj.hasVideo) {
    addInfo = ' (Only audio)';
    output[i].onlyAudio = true;
  }
  if (obj.hasVideo && obj.hasAudio) {
    output[i].full = true;
  }
  if (obj.qualityLabel == null) {
    obj.qualityLabel = '';
  }
  if (obj.fps == undefined) {
    obj.fps = '';
  } else {
    endInfo = `// ${obj.fps}p`;
  }
  if (obj.isLive) {
    output[i].live = true;
    output[i].text = `Live: ${obj.qualityLabel}`;
  } else {
    output[i].text = `${addInfo} ${obj.qualityLabel} ${obj.container} ${endInfo}`;
  }
  output[i].url = obj.url;
  console.log(output[i]);
  return output;
}

async function yt(ytURL) {
  let info = await ytdl.getInfo(ytURL);
  let output = {},
    fullOutput = {};
  for (const format in info.formats) {
    var obj = info.formats[format];
    let objGate = await gate(obj);
    if (objGate) {
      fullOutput = await filter(format, obj, output);
    }
    if (format == info.formats.length - 1) {
      return fullOutput;
    }
  }
}

module.exports = { yt };
