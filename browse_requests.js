var googleID;
var selectedCourses;

gapi.load('auth2', function() {
    gapi.auth2.init({
        client_id: '346925839515-g5rho0muuob69h91ivpeh6nrvho870ii.apps.googleusercontent.com'
    }).then(function () {
        auth2 = gapi.auth2.getAuthInstance();
        googleID = auth2.currentUser.get().getBasicProfile().getId();
        if (!auth2.isSignedIn.get() || getSessionToken() == null || getUpdateToken() == null) {
            document.location.href = `/login.html`;
        }
        else {
            getUserInfo();
        }
    });
});

function fetchCourses() {
    const req = new XMLHttpRequest();
    const classesURL = "https://alloy-backend.herokuapp.com/api/courses/";
    var classes;
    req.open("GET", classesURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            classes = JSON.parse(req.responseText);
            addClassRows(classes);
            let rows = document.getElementsByClassName("table-row");
            for (let row of rows) {
                let courseName = `${row.children[0].innerHTML} ${row.children[1].innerHTML}`;
                let courseID = row.id;
                row.addEventListener("click", () => {
                    openModal(courseName, courseID)
                })
            }
        }
    }
    req.send();
}

function getUserInfo() {
    const req = new XMLHttpRequest();
    const userURL = "https://alloy-backend.herokuapp.com/api/user/" + googleID + "/";
    req.open("GET", userURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            const user = JSON.parse(req.responseText)
            selectedCourses = user.courses;
            fetchCourses();
        }
    }
    req.send();
}

function getCourseInfo(courseID, callback) {
    const req = new XMLHttpRequest();
    const courseURL = `https://alloy-backend.herokuapp.com/api/course/${courseID}/`;
    req.open("GET", courseURL, true);
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            courseInfo = JSON.parse(req.responseText);
            callback(courseInfo)
        }
    }
    req.send();
}