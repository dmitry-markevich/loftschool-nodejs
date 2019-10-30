module.exports = io => {
    let users = {};

    io.on('connection', socket => {
        const newUser = {
            username: socket.handshake.headers.username,
            id: socket.id
        }

        users[socket.id] = newUser;

        socket.emit('all users', users);
        socket.broadcast.emit('new user', newUser);

        socket.on('chat message', (msg, id) => {
            io.to(id).emit('chat message', msg, socket.id);
        });

        socket.on('disconnect', () => {
            delete users[socket.id];
            socket.broadcast.emit('delete user', socket.id);
        });
    });
};
