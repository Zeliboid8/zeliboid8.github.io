displayedMessages = []
inRoom = false;
var googleID;
var googleName;
var name;
var photoLink;
var googlePhoto;
var displayedCourse;  // The course ID of the assignments displayed in the sidebar;
var courseID;       // The course ID of the user's current chat room;
var assignmentID;
var courses;

function clearElements(ele) {
    while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
    }
}

function scrollToBottom() {
    var messages = document.getElementById("message-holder");
    messages.scrollTop = messages.scrollHeight;
}

function addMessages(data) {
    let messageHolder = document.getElementById("message-holder");
    
    function addMessage(message_data) {
        let row = document.createElement("div");
        row.className = "message-row";
        let newMessage = document.createElement("div");
        let index = displayedMessages.length;
        displayedMessages.push(message_data);
        if (googleID == message_data.googleID) {
            newMessage.className = 'special-speech-bubble';
            if (message_data.name != googleName) {
                newMessage.classList.add("incognito");
            }
        }
        else {
            newMessage.className = 'speech-bubble';
            let profilePhoto = document.createElement("img");
            profilePhoto.src = message_data.photo_link;
            profilePhoto.className = "profile-photo";
            row.appendChild(profilePhoto);
        }
        if (index > 0 && displayedMessages[index - 1].googleID == message_data.googleID 
            && displayedMessages[index - 1].name == message_data.name) {
            let previousMessageRow = messageHolder.lastElementChild;
            previousMessageRow.lastElementChild.classList.add("top");
            newMessage.classList.add("bottom");
            if (googleID != message_data.googleID) {
                if (previousMessageRow.childElementCount == 2) {
                    previousMessageRow.removeChild(previousMessageRow.firstElementChild);
                }
            }
        }
        newMessage.innerHTML = message_data.message;
        row.appendChild(newMessage);
        messageHolder.appendChild(row);
    }

    if (Array.isArray(data)) {
        data.forEach(addMessage);
    } else {
        addMessage(data);
    }
}

function clearMessages() {
    displayedMessages = []
    let messageHolder = document.getElementById("message-holder");
    clearElements(messageHolder);
}

function loadRecentCourses() {
    let req = new XMLHttpRequest();
    let userURL = "https://alloy-backend.herokuapp.com/api/user/" + googleID + "/";
    req.open("GET", userURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            let user = JSON.parse(req.responseText)
            getRecentCourses(user);
        }
    }
    req.send();
}

function getColor(num) {
    if (num == 0) return "gray";
    switch (num % 3) {
        case 0:
            return "pink";
        case 1:
            return "blue";
        case 2:
            return "orange";
    }
}

function getRecentCourses(user) {
    var courses = user.courses;
    var sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
    clearElements(sidebarExtension);
    courses.forEach((course) => {
        var color = getColor(course.num_assignments);
        let courseButton = document.createElement("button");
        courseButton.classList.add(color);
        let courseButtonHTML = `<div class="selected-container"><div class="center-container-left"><span class="dot"></span></div>
                                <div class="center-container-right">
                                    <span class="top">${course.subject} ${course.number}</span>
                                    <span class="middle">${course.name}</span>
                                    <span class="bottom">${course.num_assignments} Assignment${course.num_assignments == 1 ? "" : "s"}</span>
                                </div></div>`
        courseButton.type = "button";
        courseButton.innerHTML = courseButtonHTML;
        courseButton.addEventListener("click", () => {
            displayedCourse = course;
            courseButton.classList.add("selected")
            Array.from(courseButton.parentElement.children).forEach((child) => {
                if (child != courseButton) {
                    child.classList.remove("selected");
                }
            })
            loadCourseAssignments(course.course_id)
        });
        sidebarExtension.appendChild(courseButton);
    });
    var addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "special";
    var innerText = document.createElement("span");
    innerText.innerHTML = "Add a class...";
    addButton.appendChild(innerText);
    addButton.addEventListener("click", () => {
        displayModal("class");
    });
    sidebarExtension.appendChild(addButton);
}

function loadCourseAssignments(courseID) {
    let req = new XMLHttpRequest();
    let assignmentsURL = "https://alloy-backend.herokuapp.com/api/course/" + courseID + "/assignments/";
    req.open("GET", assignmentsURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            var assignments = JSON.parse(req.responseText);
            var sidebarExtension2 = document.getElementsByClassName("sidebar-extension second")[0];
            clearElements(sidebarExtension2);
            assignments.forEach((assignment) => {
                var assignmentButton = document.createElement("button");
                assignmentButton.type = "button";
                assignmentButton.addEventListener("click", () => {
                    setChatName(`${displayedCourse.subject} ${displayedCourse.number}`, displayedCourse.name, assignment.name);
                    openMessages(assignment.course_id, assignment.assignment_id);
                });
                var innerText = document.createElement("span");
                innerText.innerHTML = assignment.name;
                assignmentButton.appendChild(innerText);
                sidebarExtension2.appendChild(assignmentButton);
            });
            var addButton = document.createElement("button");
            addButton.type = "button";
            addButton.className = "special";
            var innerText = document.createElement("span");
            innerText.innerHTML = "Add an assignment...";
            addButton.appendChild(innerText);
            addButton.addEventListener("click", () => {
                displayModal("assignment");
            });
            sidebarExtension2.appendChild(addButton);
        }
    }
    req.send();
    openCourseAssignments();
}

function loadRecentAssignments() {
    let req = new XMLHttpRequest();
    let userURL = "https://alloy-backend.herokuapp.com/api/user/" + googleID + "/";
    req.open("GET", userURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            let user = JSON.parse(req.responseText);
            getRecentAssignments(user);
        }
    }
    req.send();
}

function getRecentAssignments(user) {
    var assignments = user.assignments;
    var sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
    clearElements(sidebarExtension);
    assignments.forEach((assignment) => {
        var assignmentButton = document.createElement("button");
        assignmentButton.type = "button";
        assignmentButton.addEventListener("click", () => {
            let courseURL = "https://alloy-backend.herokuapp.com/api/course/" + assignment.course_id + "/";
            let req = new XMLHttpRequest();
            req.open("GET", courseURL, true);
            req.onreadystatechange = (e) => {
                if (req.readyState == 4 && req.status == 200) {
                    let course = JSON.parse(req.responseText);
                    setChatName(`${course.subject} ${course.number}`, course.name, assignment.name);
                    openMessages(assignment.course_id, assignment.assignment_id);
                }
            }
            req.send();
           
        });
        var innerText = document.createElement("span");
        innerText.innerHTML = assignment.name;
        assignmentButton.appendChild(innerText);
        sidebarExtension.appendChild(assignmentButton);
    });
}

function openMessages(courseID, assignmentID) {
    if (inRoom) {
        leave(window.assignmentID, window.courseID, googleID, name, () => {
                inRoom = false;
                console.log("Left room successfully.")
                join(assignmentID, courseID, googleID, name, () => {
                    window.assignmentID = assignmentID;
                    window.courseID = courseID;
                    inRoom = true;
                    console.log("Joined room successfully.")
                })
        });
    }
    else {
        join(assignmentID, courseID, googleID, name, () => {
            inRoom = true;
            console.log("Joined room successfully.")
        })
    }
    let req = new XMLHttpRequest();
    let messagesURL = "https://alloy-backend.herokuapp.com/api/course/" + courseID + "/assignment/" + assignmentID + "/";
    req.open("GET", messagesURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            messages = JSON.parse(req.responseText);
            clearMessages();
            addMessages(messages);
        }
    }
    req.send();
}

function closeMessages() {
    if (inRoom) {
        leave(assignmentID, courseID, googleID, name, () => {
            inRoom = false;
            console.log("Left room successfully.")
        })
    }
    return null;
}

function sendMessage() {
    var messageField = document.getElementById("message-field");
    var message = messageField.value;
    var time = new Date().toISOString().slice(0, 19)
    if (messageField.value != '') {
        messageField.value = '';
        let sessionToken = getSessionToken();
        messageCourse(assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message, (success) => 
            {
                if (success) {
                    console.log("Message sent successfully.");
                }
                else {
                    console.log("Message failed to send.");
                }
            });
    }
    return false;
}

function closeSidebar() {
    document.getElementsByClassName("sidebar")[0].style.borderRight = "1px solid rgba(0, 0, 0, 0.05)";
    document.getElementsByClassName("sidebar-extension second")[0].style.width = "0";
    document.getElementsByClassName("sidebar-extension")[0].style.width = "0";
    document.getElementsByClassName("sidebar-extension")[0].style.transitionDelay = "0.25s"
    document.getElementsByClassName("sidebar-extension")[0].querySelectorAll("button").forEach(
        (child) => {
            child.style.opacity = "0";
            child.style.transition = "0.2s";
        }
    )
    document.getElementsByClassName("sidebar-extension second")[0].querySelectorAll("button").forEach(
        (child) => {
            child.style.opacity = "0";
            child.style.transition = "0.2s";
        }
    )
    // document.getElementById("main").style.transitionDelay = "0.5s";
    document.getElementById("main").style.left = "10%";
}

function openCourses() {
    closeSidebar();
    loadRecentCourses();
    document.getElementsByClassName("sidebar")[0].style.borderRight = "none";
    document.getElementsByClassName("sidebar-extension")[0].style.width = "20%";
    document.getElementsByClassName("sidebar-extension")[0].style.transitionDelay = "0s"
    document.getElementsByClassName("sidebar-extension")[0].className = "sidebar-extension";
    document.getElementsByClassName("sidebar-extension")[0].querySelectorAll("button").forEach(
        (child) => {
            child.style.opacity = "1";
            child.style.transitionDelay = "0.2s";
        }
    )
    document.getElementById("main").style.left = "30%";
}

function openCourseAssignments() {
    document.getElementsByClassName("sidebar-extension second")[0].style.width = "15%";
    document.getElementsByClassName("sidebar-extension second")[0].querySelectorAll("button").forEach(
        (child) => {
            child.style.opacity = "1";
            child.style.transitionDelay = "0.2s";
        }
    )
    document.getElementById("main").style.left = "45%";
}

function openAssignments() {
    closeSidebar();
    loadRecentAssignments();
    document.getElementsByClassName("sidebar")[0].style.borderRight = "none";
    document.getElementsByClassName("sidebar-extension")[0].style.width = "20%";
    document.getElementsByClassName("sidebar-extension")[0].style.transitionDelay = "0s"
    document.getElementsByClassName("sidebar-extension")[0].className = "sidebar-extension compact";
    document.getElementsByClassName("sidebar-extension")[0].querySelectorAll("button").forEach(
        (child) => {
            child.style.opacity = "1";
            child.style.transitionDelay = "0.2s";
        }
    )
    document.getElementById("main").style.left = "30%";
}

function toggleIncognito(button) {
    if (button.className == "active") {
        button.classList.remove("active");
        name = googleName;
        photoLink = googlePhoto;
    }
    else {
        button.classList.add("active");
        name = "anonymous";
        photoLink = "/incognito-profile-photo.png";
    }
}

function displayModal(styleName) {
    if (styleName == "class") {
        fetchCourses();
        document.getElementById("modal-title").innerHTML = "Search for a class:"
        document.getElementById("search-results").style.display = "block";
        document.getElementById("confirm-modal").className = "search"
    }
    else if (styleName == "assignment") {
        document.getElementById("modal-title").innerHTML = "Enter assignment name:"
        document.getElementById("search-results").style.display = "none";
        document.getElementById("confirm-modal").className = "submit"
    }
    document.getElementById("modal").style.display = "block";
}

function hideModal() {
    document.getElementById("modal").style.display = "none";
}

function fetchCourses() {
    if (!courses) {
        let req = new XMLHttpRequest();
        let classesURL = "https://alloy-backend.herokuapp.com/api/courses/";
        var classes;
        req.open("GET", classesURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                classes = JSON.parse(req.responseText);
                addClassRows(classes);
            }
        }
        req.send();
    }
}

function submitModal() {
    if (document.getElementById("confirm-modal").className == "submit") {
        addAssignment(displayedCourse.course_id, document.getElementById("modal-field").value.trim());
    }
}

function addClassRows(classes) {
    var tableRows = document.getElementById("search-results");
    classes.forEach((course) => {
        let row = document.createElement("row");
        let courseID = course.course_id;
        let courseName = `${course.subject} ${course.number}`;
        row.innerHTML = `<div class="search-result" id=${courseID}><div class="center">${courseName}</div></div>`;
        row.firstElementChild.addEventListener("click", () => {
            addClass(course);
        });
        tableRows.appendChild(row);
    });
}

function filter() {
    var input = document.getElementById("modal-field").value;
    var filter = input.toUpperCase();
    var rows = document.getElementsByTagName("row");
    for (i = 0; i < rows.length; i++) {
        var currRowText = rows[i].firstElementChild.firstElementChild.innerHTML.toUpperCase();
        if (currRowText.indexOf(filter) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function addAssignment(courseID, assignmentName) {
    let req = new XMLHttpRequest();
    let url = `https://alloy-backend.herokuapp.com/api/course/${courseID}/assignment/`;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = (e) => {
        if (req.readyState == 4) {
            if (req.status == 201) {
                console.log("Assignment successfully added.");
                let data = JSON.parse(req.responseText)
                let assignmentID = data.assignment_id;

                var firstSidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
                Array.from(firstSidebarExtension.children).forEach((child) => {
                    if (child.classList.contains("selected")) {
                        let assignmentCount = child.firstElementChild.lastElementChild.lastElementChild.innerHTML;
                        let numAssignments = parseInt(assignmentCount.substring(0, assignmentCount.indexOf(" "))) + 1;
                        let newColor = getColor(numAssignments);
                        child.className = `${newColor} selected`
                        child.firstElementChild.lastElementChild.lastElementChild.innerHTML = `${numAssignments} Assignment${numAssignments == 1 ? "" : "s"}`;
                    }
                });

                var secondSidebarExtension = document.getElementsByClassName("sidebar-extension second")[0];
                var assignmentButton = document.createElement("button");
                assignmentButton.type = "button";
                var innerText = document.createElement("span");
                innerText.innerHTML = assignmentName;
                assignmentButton.appendChild(innerText);
                assignmentButton.addEventListener("click", () => {
                    setChatName(`${displayedCourse.subject} ${displayedCourse.number}`, displayedCourse.name, assignmentName);
                    openMessages(courseID, assignmentID)
                });
                secondSidebarExtension.insertBefore(assignmentButton, secondSidebarExtension.lastElementChild)
                hideModal();

                let assignmentReq = new XMLHttpRequest();
                let url = `https://alloy-backend.herokuapp.com/api/user_assignment/`;
                assignmentReq.open("POST", url, true);
                assignmentReq.setRequestHeader("Content-Type", "application/json");
                assignmentReq.onreadystatechange = (e) => {
                    if (assignmentReq.readyState == 4) {
                        if (assignmentReq.status == 201) {
                            console.log("Assignment successfully linked to user.")
                        }
                        else if (req.status == 200) {
                            console.log("Assignment already linked to user!")
                        }
                    }
                }
                let assignmentParams = JSON.stringify({
                    "action": "add",
                    "google_id": googleID,
                    "assignment_id": assignmentID
                });
                assignmentReq.send(assignmentParams);
            }
        }
    }
    let params = JSON.stringify({
        "google_id": googleID,
        "name": assignmentName
    });
    req.send(params);
}

function addClass(course) {
    let req = new XMLHttpRequest();
    let url = `https://alloy-backend.herokuapp.com/api/user_course/`;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = (e) => {
        if (req.readyState == 4) {
            if (req.status == 201) {
                console.log("Class successfully added.")
                var sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
                let courseButton = document.createElement("button");
                var color = getColor(course.num_assignments);
                courseButton.classList.add(color);
                let courseButtonHTML = `<div class="selected-container"><div class="center-container-left"><span class="dot"></span></div>
                                        <div class="center-container-right">
                                            <span class="top">${course.subject} ${course.number}</span>
                                            <span class="middle">${course.name}</span>
                                            <span class="bottom">${course.num_assignments} Assignments</span>
                                        </div></div>`
                courseButton.type = "button";
                courseButton.innerHTML = courseButtonHTML;
                courseButton.addEventListener("click", () => {
                    displayedCourse = course;
                    courseButton.classList.add("selected");
                    loadCourseAssignments(course.course_id)
                });
                sidebarExtension.insertBefore(courseButton, sidebarExtension.lastElementChild)


                hideModal();
            }
            else if (req.status == 200) {
                console.log("Class already added!")
            }
        }
    }
    let params = JSON.stringify({
        "action": "add",
        "google_id": googleID,
        "course_id": course.course_id
    });
    req.send(params);
}

function setChatName(courseNumber, courseName, assignmentName) {
    document.getElementById("class-name").innerHTML = `<b>${courseNumber}</b>: ${courseName}`;
    document.getElementById("group-name").innerHTML = assignmentName;
}