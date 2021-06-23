var topology = require("fully-connected-topology");
var jsonStream = require("duplex-json-stream");
var streamset = require("stream-set");
var register = require("register-multicast-dns");
var streams = streamset();
var toPort = require("hash-to-port");

var me = process.argv[2];
var peers = process.argv.slice(3);
var id = Math.random();
var seq = 0;
var logs = {};
var speaker = null;

const stdin = process.stdin;
if (!stdin.isTTY) {
  console.log("Error: TTY is not available. (Don't start me with nodemon.)");
  process.exit(1);
}
stdin.setRawMode(true);
stdin.setEncoding("utf8");
stdin.resume();

stdin.on("data", (key) => {
    
    var msg = key;
  if (key === "\u0003") {
    process.exit();
      } else if (key === "\b") {
        // process.stdout.write("\b \b");
        return;
  } else if (key === "\r") {
      msg = "\r\n"
    //   process.stdout.write('\n'+me+'> ');
    speaker = null
    } 
    if(speaker != me){
        process.stdout.write('\n'+me+'> ');
    } 
    if(key !== "\r"){
        process.stdout.write(msg);
    }
    speaker = me;
    streams.forEach((socket) => {
    socket.write({
      log: id,
      seq: ++seq,
      username: me,
      message: msg
    });
  });
});
register(me);

const toAddress = (name) => {
  return name + ":" + toPort(name);
};

var swarm = topology(toAddress(me), peers.map(toAddress));

swarm.on("connection", (socket) => {
  socket = jsonStream(socket);
  streams.add(socket);
  socket.on("data", (data) => {
    if (id === data.log || logs[data.log] >= data.seq) {
      return;
    }
    logs[data.log] = data.seq;
    if(data.message === '\r\n'){
        process.stdout.write("\n"+data.username + "> ");
        // process.stdout.write("\n");
        // speaker= null;
        return


    }
    if(data.username === speaker){
            process.stdout.write(data.message);

        
    } else {
        process.stdout.write("\n"+data.username + "> " + data.message);
        speaker = data.username;
    }
    streams.forEach((friend) => {
      friend.write(data);
    });
  });
  console.log(`someone is online!`);
});

// process.stdin.on('data', data=>{
//     streams.forEach(socket =>{
//         socket.write({log: id, seq: ++seq, username: me, message:data.toString().trim()})
//     })
// })
