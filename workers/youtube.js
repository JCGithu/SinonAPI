const ytdl = require('ytdl-core');

let addInfo = '';
let endInfo = '';

async function gate(obj) {
  if (obj.isLive) {
    if (obj.container !== 'ts') {
      return false;
    }
    let height = parseInt(obj.qualityLabel.split('p')[0]);
    if (height < 300) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}

async function filter(i, obj, output) {
  if (obj.isLive) {
    obj.quality = 'livestream';
  }
  if (!obj.hasAudio) {
    addInfo = ' (Only video)';
    output[i].onlyVideo = true;
  }
  if (!obj.hasVideo) {
    addInfo = ' (Only audio)';
    output[i].onlyAudio = true;
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
    output[i].text = `${addInfo} ${obj.qualityLabel} ${obj.container} ${endInfo}`;
    output[i].url = obj.url;
  }
  return output;
}

async function yt(ytURL) {
  let info = await ytdl.getInfo(ytURL);
  let output = {};
  let i = 1;
  for (const format in info.formats) {
    var obj = info.formats[format];
    let objGate = await gate(obj);
    if (objGate) {
      let objFiltered = await filter(i, obj, output);
      output = objFiltered;
    }
    i++;
    if (i > info.formats.length) {
      return output;
    }
  }
}

module.exports = { yt };
