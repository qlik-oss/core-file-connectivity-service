const request = require('request');

class Thingspeak {
  constructor(channelId, apiKey, nrOfDataPoints) {
    this.channelId = channelId;
    this.apiKey = apiKey;
    this.nrOfDataPoints = nrOfDataPoints;
  }

  getData() {
    return Thingspeak.getData(this.channelId, this.apiKey, this.nrOfDataPoints);
  }
}

function getData(channelId, apiKey, nrOfDataPoints) {
  const url = `http://api.thingspeak.com/channels/${channelId}/feeds.csv?results=${nrOfDataPoints}`;

  return request({
    url,
    headers: {
      'X-THINGSPEAKAPIKEY': apiKey
    }
  });
}

Thingspeak.getData = getData;

module.exports = Thingspeak;
