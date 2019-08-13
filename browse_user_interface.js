function openModal(courseName, courseID) {
    getCourseInfo(courseID, () => {
        document.getElementsByClassName("modal-header")[0].innerHTML = courseName;
        let modal = document.getElementById("modal");
        modal.style.display = "block";
    })
}
function addClassRows(classes) {
    var tableRows = document.getElementById("table-rows");
    classes.forEach((course) => {
        let buttonHTML = '<div class="col-4"><button class="select add" onclick="addClass(this)"></div>'
        if (selectedCourses.some(e => e.course_id === course.course_id)) {
            buttonHTML = '<div class="col-4"><button class="select check" onclick="removeClass(this)"></div>'
        }
        var row = document.createElement('row');
        row.innerHTML = `<li class="table-row" id=${course.course_id}>` +
            '<div class="col-1">' + course.subject + '</div>' +
            '<div class="col-2">' + course.number + '</div>' +
            '<div class="col-3">' + course.name + '</div>' + 
            buttonHTML + '</li>';
        tableRows.appendChild(row);
    });
}

function filter() {
    var input = document.getElementById("search").value;
    var filter = input.toUpperCase();
    var rows = document.getElementsByTagName("row");
    for (i = 0; i < rows.length; i++) {
        var currRow = rows[i].getElementsByClassName("table-row")[0];
        var subject = currRow.getElementsByClassName("col-1")[0].textContent.toUpperCase();
        var number = currRow.getElementsByClassName("col-2")[0].textContent;
        var name = currRow.getElementsByClassName("col-3")[0].textContent.toUpperCase();
        var shortTitle = subject + " " + number;
        var longTitle = subject + " " + number + " - " + name;

        if (shortTitle.indexOf(filter) > -1 || longTitle.indexOf(filter) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function addClass(button) {
    const req = new XMLHttpRequest();
    const url = `https://alloy-backend.herokuapp.com/api/user_course/`;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 201) {
            console.log("Class successfully added.")
            button.className = "select check";
            button.onclick = () => {
                removeClass(button);
            };
        }
    }
    const params = JSON.stringify({
        "action": "add",
        "google_id": googleID,
        "course_id": button.parentElement.parentElement.id
    });
    req.send(params);
    event.stopPropagation();
}

function removeClass(button) {
    const req = new XMLHttpRequest();
    const url = `https://alloy-backend.herokuapp.com/api/user_course/`;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = (e) => {
        if (req.readyState == 4 && req.status == 200) {
            console.log("Class successfully removed.")
            button.className = "select add";
            button.onclick = () => {
                addClass(button);
            };
        }
    }
    const params = JSON.stringify({
        "action": "delete",
        "google_id": googleID,
        "course_id": button.parentElement.parentElement.id
    });
    req.send(params);
    event.stopPropagation();
}