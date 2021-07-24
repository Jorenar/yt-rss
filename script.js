const rss = document.querySelector("#rss");

const patterns = {
  "validate": /^(?:https?:\/\/)?(?:.*\.)?youtube\.com\/((c|user|channel|playlist|watch).+?)(\/|$)/,
  "playlist": /^.*?youtube\.com\/(?:playlist\?|watch\?v=.+?&)list=(.+?)(?:&index=\d+|$)/,
};

async function bar(url) {
  const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`);
  const text = await response.text();
  let id = text.match(/<meta itemprop="channelId" content="(.+?)">/)[1];
  return { "type": "channel", "id": id };
}

async function foo(url) {
  try {
    return { "type": "playlist", "id": url.match(patterns.playlist)[1] };
  } catch (e) {
    return bar(url);
  }
}

async function baz(name) {
  const x = async (t) => {
    try {
      return await bar(`https://www.youtube.com/${t}/${name}`);
    } catch(e) {
      return null;
    }
  };

  const xy = (t) => new Promise((resolve) => resolve(x(t)));

  const responses = await Promise.all([xy("c"), xy("user"), xy("channel")]);

  for (let r of responses) {
    if (r) { return r; }
  }
}

async function bax(url) {
  try {
    url = `http://www.youtube.com/${url.match(patterns.validate)[1]}`;
    return await foo(url);
  } catch (e) {
    return await baz(url);
  }
}

async function generate() {
  rss.textContent = "...";
  let url = document.querySelector("#url").value.trim();
  try {
    const { type, id } = await bax(url);
    rss.textContent = `https://www.youtube.com/feeds/videos.xml?${type}_id=${id}`;
  } catch (e) {
    rss.textContent = "Invalid input";
  }
}
