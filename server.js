//Criando Servidor
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

httpServer.listen(9000, () => {
  console.log('Servidor rodando em http://localhost:9000!');
  
});

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const parsers = new ReadlineParser({ delimiter: '\r\n' });
const mySerial = new SerialPort({
  path: 'COM6',
  baudRate: 9600,
});

mySerial.pipe(parsers);

mySerial.on('open', function () {
  console.log('Serial Port is opened.');
  parsers.on('data', function (data) {
    const array = data.split(" ");     
    console.log("Joule:", array[0], "Speed:", array[1], "Caliber:", array[2], "FPS:", array[3]);
    io.emit('serial:data', { joules: array[0], speed: array[1], caliber: array[2], fps: array[3]});    
    
  }); 

});
