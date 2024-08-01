// ==UserScript==
// @name         Canvas Quick Menu
// @namespace    http://pikarocks.dev/
// @version      0.1
// @description  Quick Menu for Canvas
// @author       pikapower9080
// @match        https://*.instructure.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=canvas.instructure.com
// @grant        GM_xmlhttpRequest
// @noframes
// ==/UserScript==

const fetchUrl = "https://gist.githubusercontent.com/pikapower9080/4b60adb4a04a11e20134ae0b756d66c4/raw/index.js"
let cache = sessionStorage.getItem("qm-cache")

if (!cache) {
    console.log("No cache found, loading quick menu from url: " + fetchUrl)
    if (GM_xmlhttpRequest) {
        GM_xmlhttpRequest({
            method: "GET",
            url: fetchUrl,
            onload: function(response) {
                const code = response.responseText
                sessionStorage.setItem("qm-cache", code)
                console.log("Canvas quick menu is now cached in session storage")
                new Function(code)()
            }
        });
    } else {
        console.warn("Canvas Quick Menu couldn't use the GM_xmlhttpRequest method, falling back to fetch. Exepct CORS errors.")
        fetch(fetchUrl).then((res) => {
            res.text().then((code) => {
                sessionStorage.setItem("qm-cache", code)
                console.log("Canvas quick menu is now cached in session storage")
                new Function(code)()
            })
        })
    }
} else {
    console.log("Loading quick menu from session cache")
    new Function(cache)()
}
