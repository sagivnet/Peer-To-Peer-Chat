var net = require('net')
var streamset = require('stream-set')

var streams = streamset();

var server = net.createServer(socket =>{
    console.log('A Client Connected!')

    streams.forEach(otherSocket =>{
        otherSocket.on('data', data=>{
            socket.write(data)
        })
        socket.on('data', data =>{
            // console.log(JSON.parse(data))
            otherSocket.write( data);
        })
    })
    
    streams.add(socket);
})

server.listen(9000)