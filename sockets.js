// Setting up sockets with socket.io
sockets = function() {
    let socket;

    function init(queryParams) {
        if (queryParams) {
            socket = io.connect('https://alloy-backend.herokuapp.com', {secure: true, query: queryParams});
        }
        
        socket.on('error', function (err) {
            if (err == "Invalid session token") {
                console.log("Updating session token.");
                init(`googleID=${googleID}&updateToken=${getUpdateToken()}`);
            }
            else if (err == "Session token updated; retry") {
                console.log("Updated session token.");
                console.log(err.session_token);
                console.log(err.data);
                setSessionToken(err.session_token);
                init(`googleID=${googleID}&sessionToken=${getSessionToken()}`);
            }
            else if (err == "Invalid update token") {
                console.log("Invalid update token. Redirecting to sign in page.");
                document.location.href = "/login.html"
            }
            else {
                console.log("Socket error: ", err);
            }
        })
        socket.on('new_token', (data) => {
            console.log("New token received: ", data.session_token);
            setSessionToken(data.session_token);
        })
    }

    function registerMessageHandler() {
        socket.on('message', (data) => {
            addMessages(data);
            scrollToBottom();
        });
    }
    function unregisterMessageHandler() {
        socket.off('message');
    }
    function registerAssignmentHandler() {
        socket.on('new_assignment', (data) => {
            addAssignmentToSidebar(data);
        })
    }
    function unregisterAssignmentHandler() {
        socket.off('new_assignment');
    }
    function joinCourse(courseID, name, callback) {
        socket.emit('join_course', {courseID, name}, callback);
        registerAssignmentHandler();
    }
    function leaveCourse(courseID, name, callback) {
        socket.emit('leave_course', {courseID, name}, callback);
        unregisterAssignmentHandler();
    }
    function joinAssignment(assignmentID, courseID, googleID, name, callback) {
        window.assignmentID = assignmentID;
        window.courseID = courseID;
        socket.emit('join_assignment', {assignmentID, courseID, googleID, name}, callback)
        registerMessageHandler();
    }
    function leaveAssignment(assignmentID, courseID, googleID, name, callback) {
        socket.emit('leave_assignment', {assignmentID, courseID, googleID, name}, callback)
        unregisterMessageHandler();
    }
    function messageCourse(assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message, callback) {
        socket.emit('message', {assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message}, callback)
    }
    function addAssignment(courseID, assignmentName, googleID, callback) {
        socket.emit('new_assignment', {courseID, assignmentName, googleID}, callback)
    }

    return {
        init: init,
        joinCourse: joinCourse,
        leaveCourse: leaveCourse,
        joinAssignment: joinAssignment,
        leaveAssignment: leaveAssignment,
        messageCourse: messageCourse,
        addAssignment: addAssignment
    }
}();
