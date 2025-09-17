var redirect_uri = "https://doug42069.github.io/capstone2025NM/"

var client_id = "bd53535497384e2192f495522d3f3274";
var client_secret = "bc864d2081654a88bc7e175fef7e0a14";

const AUTHORIZE = "https://accounts.spotify.com/authorize"

function onPageLoad() {

}


function requestAuth() {
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&showdialog=true";
    url += "&scope=user-read-private user-read-email user-library-modify user-library-read playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public ugc-image-upload user-read-plaback-state user-modify-playback-state user-read-currently-playing";
    window.location.href = url;
}