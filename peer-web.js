// var topology = require('fully-connected-topology')
var jsonStream = require('duplex-json-stream')
var streamset = require('stream-set')
var register = require('register-multicast-dns')
var streams = streamset();
var toPort = require('hash-to-port')
var webrtcSwarm = require('webrtc-swarm')

var me = process.argv[2]
var peers = process.argv.slice(3)
var id = Math.random()
var seq = 0
var logs = {}

register(me)

const toAddress = name =>{
    return name +":" +toPort(name)
}

// var swarm = topology(toAddress(me), peers.map(toAddress))
var swarm = webrtcSwarm()
swarm.on('connection', socket =>{
    socket = jsonStream(socket)
    streams.add(socket)
    socket.on('data', data =>{
        if(logs[data.log] <= data.seq) return
        logs[data.log] = data.seq
        console.log(data.username + '> '+data.message)
        streams.forEach(socket =>{
            socket.write(data);
        })
    })
    console.log(`someone is online!`)
})

process.stdin.on('data', data=>{
    streams.forEach(socket =>{
        socket.write({log: id, seq:seq++, username: me, message:data.toString().trim()})
    })
})

