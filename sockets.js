// Setting up sockets with socket.io

sockets = function() {
    let socket;
    let clientScript = document.createElement("script");
    clientScript.src = `${serverURL}/socket.io/socket.io.js`;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(clientScript);

    function init(queryParams, callback) {
        if (queryParams) {
            try {
                socket = io.connect(serverURL, {secure: true, query: queryParams});
                socket.on('error', function (err) {
                    if (err == "Invalid session token") {
                        console.log("Updating session token.");
                        init(`googleID=${googleID}&updateToken=${getUpdateToken()}`, callback);
                    }
                    else if (err.session_token) {
                        setSessionToken(err.session_token);
                        init(`googleID=${googleID}&sessionToken=${getSessionToken()}`, callback);
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
                socket.on('connect', () => {
                    callback();
                })
            }
            catch (err) {
                if (err.name == "ReferenceError") {
                    console.log("Couldn't connect to server.");
                    setTimeout(() => {
                        head.removeChild(clientScript);
                        var newScript = document.createElement('script');
                        newScript.src = `${serverURL}/socket.io/socket.io.js`;
                        head.appendChild(newScript);
                        clientScript = newScript;
                        init(queryParams, callback)
                    }, 3000);
                }
            }
        }
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
    function joinAssignment(assignmentID, courseID, name, callback) {
        window.assignmentID = assignmentID;
        window.courseID = courseID;
        socket.emit('join_assignment', {assignmentID, courseID, name}, callback)
        registerMessageHandler();
    }
    function leaveAssignment(assignmentID, courseID, name, callback) {
        socket.emit('leave_assignment', {assignmentID, courseID, name}, callback)
        unregisterMessageHandler();
    }
    function messageCourse(assignmentID, courseID, name, photoLink, time, message, callback) {
        socket.emit('message', {assignmentID, courseID, name, photoLink, time, message}, callback)
    }
    function addAssignment(courseID, assignmentName, callback) {
        socket.emit('new_assignment', {courseID, assignmentName}, callback)
    }
    function getUserInfo(callback) {
        socket.emit('get_user_info', callback)
    }
    function addUserToCourse(courseID, callback) {
        socket.emit('add_user_to_course', {courseID}, callback)
    }
    function removeUserFromCourse(courseID, callback) {
        socket.emit('remove_user_from_course', {courseID}, callback)
    }

    return {
        init: init,
        joinCourse: joinCourse,
        leaveCourse: leaveCourse,
        joinAssignment: joinAssignment,
        leaveAssignment: leaveAssignment,
        messageCourse: messageCourse,
        addAssignment: addAssignment,
        getUserInfo: getUserInfo,
        addUserToCourse: addUserToCourse,
        removeUserFromCourse: removeUserFromCourse
    }
}();
