const redirect_uri = "https://doug42069.github.io/capstone2025NM/";
const client_id = "bd53535497384e2192f495522d3f3274";
let accessToken = null;

///////LOGIN FUNCTION////////
function requestAuthorization() {
  const scopes = [
    "playlist-modify-private",
    "playlist-modify-public",
    "user-read-email",
    "user-read-private"
  ].join(" ");

  const url = `https://accounts.spotify.com/authorize?` +
              `client_id=${client_id}` +
              `&response_type=token` +
              `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
              `&scope=${encodeURIComponent(scopes)}` +
              `&show_dialog=true`;

  window.location = url;
}
//////////////////////////////////////////////////

//////////////////TOKEN AQUISITION//////////////////
window.addEventListener("load", () => {
  const hash = window.location.hash.substring(1).split("&").reduce((acc, part) => {
    const [key, val] = part.split("=");
    acc[key] = val;
    return acc;
  }, {});

  if (hash.access_token) {
    accessToken = hash.access_token;
    console.log("Access token acquired.");
    window.history.replaceState({}, document.title, redirect_uri);
  }
});
///////////////////////////////////////////////////////////

/////////////////MOOD/ACTIVITY MAP/////////////////////////
const moodMap = {
  chill:   { keywords: "chill acoustic ambient" },
  workout: { keywords: "energetic workout upbeat" },
  party:   { keywords: "party dance pop" },
  focus:   { keywords: "focus instrumental study" }
};
//////////////////////////////////////////////////


//////////////PLAYLIST GENERATION/////////////////////////////////
document.getElementById("playlistForm").addEventListener("submit", async e => {
  e.preventDefault();

  if (!accessToken) {
    alert("Please login first!");
    return;
  }

  const mood = document.getElementById("mood").value;
  const playlistName = document.getElementById("playlistName").value;
  const songCount = document.getElementById("songCount").value;

  try {
    const user = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(r => r.json());

    const keywords = moodMap[mood]?.keywords || "pop";
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keywords)}&type=track&limit=${songCount}`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(r => r.json());
    const trackUris = searchRes.tracks.items.map(t => t.uri);

    const newPlaylist = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: playlistName,
        description: `Auto-generated ${mood} playlist`,
        public: false
      })
    }).then(r => r.json());

    if (trackUris.length) {
      await fetch(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: trackUris })
      });
    }

    document.getElementById("playlistLink").innerHTML =
      `Playlist "<strong>${playlistName}</strong>" created! ` +
      `<a href="${newPlaylist.external_urls.spotify}" target="_blank">Open in Spotify</a>`;

  } catch (err) {
    console.error(err);
    alert("Error creating playlist. Check console for details.");
  }
});
/////////////////////////////////////////////////////////////////////

//////////////////////SLIDER////////////////////
document.getElementById("songCount").addEventListener("input", e => {
  document.getElementById("songCountValue").textContent = e.target.value;
});
////////////////////////////////////////////////////////////