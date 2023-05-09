// ==UserScript==
// @name         Canvas Quick Menu
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quick Menu for Canvas
// @author       pikapower9080
// @match        https://hcpss.instructure.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hcpss.instructure.com
// @grant        none
// @noframes
// ==/UserScript==

const fetchUrl = "https://gist.githubusercontent.com/pikapower9080/4b60adb4a04a11e20134ae0b756d66c4/raw/8a8a41b73c38450e9f70206081644a1c86b574d8/index.js"
let cache = sessionStorage.getItem("qm-cache")

if (!cache) {
    console.log("No cache found, loading quick menu from url: " + fetchUrl)
    fetch(fetchUrl).then((res) => {
        res.text().then((code) => {
            sessionStorage.setItem("qm-cache", code)
            console.log("Canvas quick menu is now cached in session storage")
            new Function(code)()
        })
    })
} else {
    console.log("Loading quick menu from session cache")
    new Function(cache)()
}