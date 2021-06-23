var net = require('net');
var jsonStream = require('duplex-json-stream')
var username = process.argv[2]
var socket = jsonStream(net.connect(9000,'localhost'))

socket.on('data', data=>{
    process.stdout.write(data.username+ '> '+ data.message);
})

process.stdin.on('data', data =>{
    // socket.write(data)
    socket.write({username: username, message: data.toString()})
})