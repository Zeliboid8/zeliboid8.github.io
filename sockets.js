// Setting up sockets with socket.io
const socket = io.connect('http://alloy-backend.herokuapp.com');
function registerHandler() {
    socket.on('message', (data) => {
        addMessages(data)
        scrollToBottom();
    });
}
function unregisterHandler() {
    socket.off('message')
}
socket.on('error', function (err) {
    console.log('received socket error:')
    console.log(err)
})
function join(assignmentID, courseID, googleID, name, callback) {
    window.assignmentID = assignmentID;
    window.courseID = courseID;
    socket.emit('join', {assignmentID, courseID, googleID, name}, callback)
    registerHandler();
}
function leave(assignmentID, courseID, googleID, name, callback) {
    socket.emit('leave', {assignmentID, courseID, googleID, name}, callback)
    unregisterHandler();
}
function messageCourse(assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message, callback) {
    console.log(arguments)
    socket.emit('message', {assignmentID, courseID, googleID, name, photoLink, sessionToken, time, message}, callback)
}