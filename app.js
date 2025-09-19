///////////////////////////////LOGIN/////////////////////////////////////////////
const client_id = "bd53535497384e2192f495522d3f3274";
const redirect_uri = "https://doug42069.github.io/capstone2025NM/";
const scopes = [
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-private",
  "user-read-email"
].join(" ");

let accessToken = null;

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(buffer) {
  return await crypto.subtle.digest('SHA-256', buffer);
}

async function loginWithPKCE() {
  const codeVerifier = generateRandomString(128);
  localStorage.setItem('code_verifier', codeVerifier);

  const encoder = new TextEncoder();
  const codeChallenge = base64URLEncode(await sha256(encoder.encode(codeVerifier)));

  const url = `https://accounts.spotify.com/authorize?` +
              `client_id=${client_id}` +
              `&response_type=code` +
              `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
              `&scope=${encodeURIComponent(scopes)}` +
              `&code_challenge_method=S256` +
              `&code_challenge=${codeChallenge}`;

  window.location = url;
}

async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return;

  const codeVerifier = localStorage.getItem('code_verifier');
  const body = new URLSearchParams({
    client_id,
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    code_verifier: codeVerifier
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const data = await res.json();
  accessToken = data.access_token;
  console.log('Access token acquired via PKCE.');

  window.history.replaceState({}, document.title, redirect_uri);
}

handleRedirect();
///////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////MOOD/ACTIVITY MAP///////////////////////////////////
const moodMap = {
  chill:   { keywords: "chill acoustic ambient" },
  workout: { keywords: "energetic workout upbeat" },
  party:   { keywords: "party dance pop" },
  focus:   { keywords: "focus instrumental study" }
};
///////////////////////////////////////////////////

/////////////////SLIDER/////////////////////
document.getElementById("songCount").addEventListener("input", e => {
  document.getElementById("songCountValue").textContent = e.target.value;
});
///////////////////////////////////////////

/////////////LOGIN BUTTON//////////////////////
document.getElementById("loginBtn").addEventListener("click", loginWithPKCE);
////////////////////////////////////////////////


/////////////////PLAYLIST GENERATOR//////////////////////////
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
    alert("Error creating playlist. Check console.");
  }
});
///////////////////////////////////////////////////////////////////////////