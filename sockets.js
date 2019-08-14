// Setting up sockets with socket.io
const socket = io.connect('https://alloy-backend.herokuapp.com');
function registerHandler() {
    socket.on('message', (data) => {
        addMessages(data)
        scrollToBottom();
    });
    socketet.on('new_assignment', (data) => {
        addAssignmentToSidebar(data);
    })
}
function unregisterHandler() {
    socket.off('message')
}
socket.on('error', function (err) {
    console.log('received socket error:')
    console.log(err)
})

function joinCourse(courseID, name, callback) {
    socket.emit('join_course', {courseID, name}, callback);
}

function leaveCourse(courseID, name, callback) {
    socket.emit('leave_course', {courseID, name}, callback);
}

function joinAssignment(assignmentID, courseID, googleID, name, callback) {
    window.assignmentID = assignmentID;
    window.courseID = courseID;
    socket.emit('join_assignment', {assignmentID, courseID, googleID, name}, callback)
    registerHandler();
}
function leaveAssignment(assignmentID, courseID, googleID, name, callback) {
    socket.emit('leave_assignment', {assignmentID, courseID, googleID, name}, callback)
    unregisterHandler();
}
function messageCourse(assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message, callback) {
    socket.emit('message', {assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message}, callback)
}
function addAssignment(courseID, assignmentName, googleID, callback) {
    socket.emit('new_assignment', {courseID, assignmentName, googleID}, callback)
}