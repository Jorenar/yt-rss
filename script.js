const rss = document.querySelector("#rss");

const patterns = {
  "validate": /^(?:https?:\/\/)?(?:.*\.)?youtube\.com\/((c|user|channel|playlist|watch).+?)(\/|$)/,
  "playlist": /^.*?youtube\.com\/(?:playlist\?|watch\?v=.+?&)list=(.+?)(?:&index=\d+|$)/,
};

async function getChannelId(url) {
  const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`);
  const text = await response.text();
  let id = text.match(/<meta itemprop="channelId" content="(.+?)">/)[1];
  return { "type": "channel", "id": id };
}

async function getIdOfPlaylistOrChannel(url) {
  try {
    return { "type": "playlist", "id": url.match(patterns.playlist)[1] };
  } catch (e) {
    return getChannelId(url);
  }
}

async function getIdByChannelName(name) {
  const p = (t) => new Promise((resolve) => resolve(
    async function() {
      try {
        return await getChannelId(`https://www.youtube.com/${t}/${name}`);
      } catch(e) {
        return null;
      }
    }()
  ));

  const responses = await Promise.all([ p("c"), p("user"), p("channel") ]);

  for (let r of responses) {
    if (r) { return r; }
  }
}

async function getId(input) {
  try {
    url = `http://www.youtube.com/${input.match(patterns.validate)[1]}`;
    return await getIdOfPlaylistOrChannel(url);
  } catch (e) {
    return await getIdByChannelName(input);
  }
}

async function getRss() {
  rss.textContent = "...";
  let input = document.querySelector("#url").value.trim();
  try {
    const { type, id } = await getId(input);
    rss.textContent = `https://www.youtube.com/feeds/videos.xml?${type}_id=${id}`;
  } catch (e) {
    rss.textContent = "Invalid input";
  }
}
