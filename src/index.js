const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessages,generatedLocationMessage} = require('./utils/messages')
const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users')
const { isGeneratorObject } = require('util/types')
 
const app = express()

const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname,'../public')

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New Web Socket Connection!')

    socket.on('join',({username,room},callback)=>{
        const { error, user } = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        } 

        socket.join(user.room)
        socket.emit('message',generateMessages('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessages('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',({
            room: user.room,
            users: getUsersInRoom(user.room)
        }))
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)

        if(user){
            const filter = new Filter()

            if(filter.isProfane(message)){
                return callback('Profanity is not allowed!')
            }
    
    
            io.to(user.room).emit('message',generateMessages(user.username,message))
            callback()
        }

    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessages('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',({
                room: user.room,
                users: getUsersInRoom(user.room)
            }))    
        }
        
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        if(user){

            io.to(user.room).emit('locationMessage',generatedLocationMessage(user.username,coords))
            callback('Location sahered!')
        }

    })

})

server.listen(port,()=>{
    console.log('The server is up on port',port)
})