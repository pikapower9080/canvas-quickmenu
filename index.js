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

let qm = {}

qm.css = `
#quick-menu-overlay {
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
#quick-menu #results:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}
#quick-menu .result {
    padding: 3px;
    border-bottom: 1px solid black;
    cursor: pointer;
}
`

qm.html = `
    <div id="quick-menu-overlay"></div>
    <div id="quick-menu">
        <input type="text" id="quick-menu-input" placeholder="Search Anything..." autocomplete="off">
        <input type="submit" style="display: none;">
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
    setTimeout(() => {
        qm.container.style.display = "none"
    }, 50)
})
qm.resultTemplate = qm.container.querySelector("#result-template")
qm.results = qm.container.querySelector("#results")

qm.fuseScript = document.createElement("script")
qm.fuseScript.src = "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"
document.head.appendChild(qm.fuseScript)

function setupKeybind() {
    qm.fuse = new Fuse(qm.items, {
        keys: ["title", "name", "aka"],
        threshold: 0.4
    })
    addEventListener("keydown", (e) => {
        if ((e.key == "P" && e.ctrlKey) || (e.key == "Escape" && qm.container.style.display == "none")) {
            e.preventDefault()
            qm.container.style.display = "unset"
            qm.input.focus()
            qm.input.value = ""
        }
        else if (e.key == "Escape" && qm.container.style.display == "unset") {
            qm.input.blur()
        }
    })
    qm.input.addEventListener("input", () => {
        qm.results.querySelectorAll(".result").forEach(r => r.remove())
        qm.fuse.search(qm.input.value).slice(0, 5).forEach((item) => {
            const clone = qm.resultTemplate.content.cloneNode(true)
            const realClone = clone.querySelector("*")
            const mainText = clone.querySelector(".mainText")
            mainText.innerText = item.item.name || item.item.title
            if (item.item["url"]) {
                realClone.dataset.href = item.item.url
            }
            if (item.item["course_code"]) {
                realClone.dataset.href = `/courses/${item.item.id}`
            }
            if (item.item["icon"]) {
                mainText.innerHTML = `<i class="icon-${item.item.icon}" style="margin-right: 5px;"></i>${mainText.innerText}`
            }
            qm.results.appendChild(clone)
        })
    })
    qm.input.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && qm.container.style.display == "unset") {
            e.preventDefault()
            window.location.href = qm.results.querySelector(".result").dataset.href
        }
    })
    console.log("%cCanvas quick menu is now ready!", "font-size: 16px;")
}


qm.items = []
qm.actions = [
    {name: "Inbox", url: "/conversations", icon:"inbox", aka: "New Message"},
    {name: "Dashboard", url: "/", icon:"home", aka: "Home"},
    {name: "Calendar", url: "/calendar", icon:"calendar-month"},
    {name: "Grades", url: "/grades", icon:"star-light"},
    {name: "Settings", url: "/profile/settings", icon:"settings", aka: "Account"},
    {name: "Files", url: "/files", icon:"folder"},
    {name: "All Courses", url: "/courses", icon:"courses", aka: "Subjects"},
    {name: "Schedule", url: "/#schedule", icon:"calendar-month"},
    {name: "API Documentation", url: "/doc/api/", icon:"code", aka:"Hacker"},
    {name: "Global Announcments", url: "/account_notifications", icon:"alerts"}
]
qm.actions.forEach((action) => {
    qm.items.push(action)
})

qm.fuseScript.addEventListener("load", () => {
    fetch("https://hcpss.instructure.com/api/v1/users/self/favorites/courses?include[]=banner_image", {}).then((res) => {
        res.json().then((json) => {
            json.forEach((course) => {
                let newCourse = course
                newCourse.icon = "courses"
                newCourse.name = course.name.trim()
                qm.items.push(newCourse)
            })
            fetch("https://hcpss.instructure.com/api/v1/users/self/todo?per_page=100", {}).then((res) => {
                res.json().then((todo) => {
                    todo.forEach((assignment) => {
                        qm.items.push({name: assignment.assignment.name, url: assignment.assignment.html_url, icon: assignment.assignment.is_quiz_assignment? "quiz" : "assignment"})
                    })
                    let contextCodes = ""
                    json.forEach((course) => {
                        contextCodes += `&context_codes[]=course_${course.id}`
                    })
                    fetch("/api/v1/announcements?per_page=100&latest_only=true" + contextCodes, {}).then((res) => {
                        res.json().then((announcements) => {
                            announcements.forEach((announcement) => {
                                qm.items.push({name: announcement.title, url: announcement.html_url, icon:"announcement"})
                            })
                            setupKeybind()
                        })
                    })
                })
            })
        })
    })
})
