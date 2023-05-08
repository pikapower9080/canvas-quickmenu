// ==UserScript==
// @name         Canvas Quick Menu
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quick Menu for Canvas
// @author       pikapower9080
// @match        https://hcpss.instructure.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hcpss.instructure.com
// @grant        none
// ==/UserScript==

let qm = {}

qm.css = `#quick-menu-overlay {
            position: fixed;
            z-index: 1000;
            background-color: rgba(0, 0, 0, 0.5);
            width: 100vw;
            height: 100vh;
            top: 0;
            left: 0;
        }
        #quick-menu {
            z-index: 1001;
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            font-family: monospace;
        }
        #quick-menu input {
            width: 100%;
            font-size: 16px;
            font-family: monospace;
            border-radius: 0px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            border: 1px solid black;
            padding: 4px;
            margin: 0;
        }
        #quick-menu input:focus {
            outline: none;
        }
        #quick-menu #results {
            background-color: white;
            border: 1px solid black;
            border-top: none;
            border-bottom: none;
            width: calc(300px + 8px);
        }
        #quick-menu .result {
            padding: 3px;
            border-bottom: 1px solid black;
        }`

qm.html = `
    <div id="quick-menu-overlay"></div>
    <div id="quick-menu">
        <form id="quick-menu-form">
            <input type="text" id="quick-menu-input" placeholder="Search Anything...">
            <input type="submit" style="display: none;">
        </form>
        <div id="results">
            <template class="result" id="result-template">
                <div class="result">
                    <span class="mainText">Example Text Example Text Example Text  Example Text</span>
                </div>
            </template>
        </div>
    </div>
`

qm.container = document.createElement("div")
qm.container.id = "quick-menu-container"
document.body.appendChild(qm.container)
qm.container.innerHTML = qm.html
qm.styles = document.createElement("style")
qm.styles.innerHTML = qm.css
document.head.appendChild(qm.styles)

qm.container.style.display = "none"

qm.input = qm.container.querySelector("input#quick-menu-input")
qm.input.addEventListener("blur", () => {
    qm.container.style.display = "none"
})
qm.resultTemplate = qm.container.querySelector("#result-template")
qm.results = qm.container.querySelector("#results")

qm.fuseScript = document.createElement("script")
qm.fuseScript.src = "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"
document.head.appendChild(qm.fuseScript)

function setupKeybind() {
    addEventListener("keydown", (e) => {
        if ((e.key == "P" && e.ctrlKey) || (e.key == "Escape" && qm.container.style.display == "none")) {
            qm.container.style.display = "unset"
            qm.input.focus()
        }
        else if (e.key == "Escape" && qm.container.style.display == "unset") {
            qm.input.blur()
        }
    })
}

fetch("https://hcpss.instructure.com/api/v1/users/self/favorites/courses", {}).then((res) => {
    res.json().then((json) => {
        json.forEach((course) => {
            const clone = qm.resultTemplate.content.cloneNode(true)
            clone.querySelector(".mainText").innerText = course.name
            qm.results.appendChild(clone);
        })
        setupKeybind();
    })
})
