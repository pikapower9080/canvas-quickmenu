// ==UserScript==
// @name         Canvas Quick Menu Testing
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Version for testing
// @author       pikapower9080
// @match        https://*.instructure.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=canvas.instructure.com
// @grant        none
// @noframes
// ==/UserScript==

let qm = {}

qm.css = `
/*#quick-menu-overlay {
    position: fixed;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
}*/
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
#add-shortcut-container label {
    display: inline-block;
    width: 110px;
}
#add-shortcut-container button {
    margin-left: 5px;
}
#add-shortcut-container button[type="submit"] {
    margin-left: 0px;
}
#add-shortcut-container ul {
    list-style: none;
    margin-left: 0;
    margin-top: 10px;
}
#add-shortcut-container ul li {
    border: 1px gray solid;
    padding-inline: 3px;
}
`

qm.html = `
    <div id="quick-menu-overlay" class="ui-widget-overlay" style="z-index: 1000; position: fixed;"></div>
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

if (window.location.href.endsWith("/qm/manage-shortcuts")) {
    let customShortcuts = JSON.parse(localStorage.getItem("qm-custom")) || []
    window.removeCustomShortcut = function(shortcutName) {
        console.log(customShortcuts, shortcutName)
        delete customShortcuts.splice(customShortcuts.indexOf(customShortcuts.find((x) => {return x.name === shortcutName})), 1)
        localStorage.setItem("qm-custom", JSON.stringify(customShortcuts))
        window.location.reload()
    }
    let shortcutHTML = ``
    customShortcuts.forEach((shortcut) => {
        shortcutHTML += `<li><i class="icon-${shortcut.icon}"></i> ${shortcut.name} <a type="button" style="cursor: pointer; line-decoration: underline; color: gray;" onclick="window.removeCustomShortcut('${shortcut.name}')">[Remove]</a></li>`
    })
    document.title = "Manage Shortcuts"
    document.body.innerHTML = `<section style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);" id="add-shortcut-container">
    <h1 style="text-align: center;">Manage Shortcuts</h1>
    <form id="qm-create-shortcut-form">
    <label style="margin-right: 10px;">Shortcut Name:</label><input id="name-input" type="text" required><br>
    <label style="margin-right: 10px;">Shortcut Icon:</label><input id="icon-input" type="text" required><br>
    <label style="margin-right: 10px;">Shortcut URL:</label><input id="url-input" type="url" required><br>
    <button type="submit">Add</button><button onclick="window.history.back()" type="button">Cancel</button><a href="https://instructure.design/#iconography" target="_blank"><button type="button">Icon List</button></a><br>
    <ul id="custom-shortcut-list">
        ${shortcutHTML}
    </ul>
    </form></section>
    `
    const form = document.querySelector("#qm-create-shortcut-form")
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        customShortcuts.push({name: form.querySelector("#name-input").value, url: form.querySelector("#url-input").value, icon: form.querySelector("#icon-input").value})
        localStorage.setItem("qm-custom", JSON.stringify(customShortcuts))
        sessionStorage.removeItem("qm-itemCache")
        window.location.reload()
    })
}

qm.container = document.createElement("div")
qm.container.id = "quick-menu-container"
document.body.appendChild(qm.container)
qm.container.innerHTML = qm.html
qm.styles = document.createElement("style")
qm.styles.id = "qm-styles"
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
            if (item.item["setStorage"]) {
                realClone.dataset.setStorage = JSON.stringify(item.item.setStorage)
            }
            realClone.addEventListener("click", () => {
                window.location.href = realClone.dataset.href
            })
            qm.results.appendChild(clone)
        })
    })
    qm.input.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && qm.container.style.display == "unset") {
            e.preventDefault()
            const result = qm.results.querySelector(".result")
            let setStorage = JSON.parse(result.dataset.setStorage || "{}")
            if (setStorage) {
                for (let k in setStorage) {
                    sessionStorage.setItem(k, setStorage[k])
                }
            }
            if (!e.ctrlKey) {
                window.location.href = result.dataset.href
            } else {
                window.open(result.dataset.href, "_blank")
            }
        }
    })
    console.log("%cCanvas quick menu is now ready!", "font-size: 16px;")
}


qm.items = []
qm.actions = [
    {name: "Inbox", url: "/conversations", icon:"inbox"},
    {name: "Dashboard", url: "/", icon:"home", aka: "Home"},
    {name: "Calendar", url: "/calendar", icon:"calendar-month"},
    {name: "Grades", url: "/grades", icon:"star-light"},
    {name: "Settings", url: "/profile/settings", icon:"settings", aka: "Account"},
    {name: "Files", url: "/files", icon:"folder"},
    {name: "All Courses", url: "/courses", icon:"courses", aka: "Subjects"},
    {name: "Schedule", url: "/#schedule", icon:"calendar-month"},
    {name: "Global Announcements", url: "/account_notifications", icon:"alerts"},
    {name: "ePortfolios", url: "/dashboard/eportfolios", icon:"bank"},
    {name: "Studio", url: "/accounts/1/external_tools/55733?launch_type=global_navigation", icon:"studio"},
    {name: "New Message", url: "/conversations", icon:'inbox', setStorage: {"inboxNewMessage": true}, aka: "New Inbox"},
    {name: "New Calendar Event", url: "/calendar", icon:"calendar-add", setStorage: {"calendarNewEvent": true}, aka: "New Event"},
    {name: "New To-Do Item", url: "/calendar", icon:"calendar-add", setStorage: {"calendarNewEvent": true, "newTodo": true}},
    {name: "Custom Shortcuts", url: "/qm/manage-shortcuts", icon: "add", aka: ["Create Shortcut"]}
]
qm.actions.forEach((action) => {
    qm.items.push(action)
})
const customItems = JSON.parse(localStorage.getItem("qm-custom"))
if (customItems) {
    customItems.forEach((item) => {
        qm.items.push(item)
    })
}

qm.fuseScript.addEventListener("load", () => {
    if (sessionStorage.getItem("qm-itemCache")) {
        qm.items = JSON.parse(sessionStorage.getItem("qm-itemCache"))
        console.log("Loaded quick search item cache from session storage")
        setupKeybind()
    } else {
        fetch("/api/v1/users/self/favorites/courses?include[]=banner_image", {}).then((res) => {
            res.json().then((json) => {
                json.forEach((course) => {
                    let newCourse = course
                    newCourse.icon = "courses"
                    newCourse.name = course.name.trim()
                    newCourse.aka = course.course_code.trim()
                    qm.items.push(newCourse)
                })
                fetch("/api/v1/users/self/todo?per_page=100", {}).then((res) => {
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
                                if (!sessionStorage.getItem("qm-itemCache")) {
                                    sessionStorage.setItem("qm-itemCache", JSON.stringify(qm.items))
                                }
                                setupKeybind()
                            })
                        })
                    })
                })
            })
     })
    }
})

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector))
                observer.disconnect()
            }
        })
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}
if (sessionStorage.getItem("inboxNewMessage")) {
    waitForElm("#conversation-actions > .btn").then((element) => {
        setTimeout(() => {
            sessionStorage.removeItem("inboxNewMessage")
            element.click()
        }, 3000)
    })
}
if (sessionStorage.getItem("calendarNewEvent")) {
   waitForElm(".header-right-flex.header-bar-right > .btn").then((element) => {
       setTimeout(() => {
           sessionStorage.removeItem("calendarNewEvent")
           element.click()
           if (sessionStorage.getItem("newTodo")) {
               sessionStorage.removeItem("newTodo")
               document.querySelector(".ui-tabs-anchor.edit_planner_note_option").click()
           }
       }, 3500)
   })
}
