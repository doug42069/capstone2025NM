const redirect_uri = "https://doug42069.github.io/capstone2025NM/";

const client_id = "bd53535497384e2192f495522d3f3274";

const AUTHORIZE = "https://accounts.spotify.com/authorize";

function requestAuthorization() {
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-library-modify user-library-read playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public ugc-image-upload user-read-playback-state user-modify-playback-state user-read-currently-playing";
    window.location.href = url;
}
