const input = document.querySelector("input");
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

async function getId(input) {
  try {
    let url = `http://www.youtube.com/${input.match(patterns.validate)[1]}`;
    return await getIdOfPlaylistOrChannel(url);
  } catch (e) {
    return await getChannelId(`https://www.youtube.com/${input}`);
  }
}

async function getRss() {
  rss.textContent = "...";
  rss.removeAttribute("href");
  rss.classList.remove("error");
  rss.parentNode.removeAttribute("style");

  let val = input.value.trim();
  try {
    const { type, id } = await getId(val);
    const url = `https://www.youtube.com/feeds/videos.xml?${type}_id=${id}`;
    rss.href = rss.textContent = url;
  } catch (e) {
    rss.textContent = "Invalid input";
    rss.className = "error";
  }
}

function copyClip() {
  let text = document.createElement("textarea");
  text.value = rss.href;
  document.body.appendChild(text);
  text.select();
  document.execCommand("copy");
  document.body.removeChild(text);
}

input.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    getRss();
  }
});
