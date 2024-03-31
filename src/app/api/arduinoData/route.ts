import { NextApiRequest, NextApiResponse } from "next";
import {SerialPort, ReadlineParser} from 'serialport';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  
  const serialport = new SerialPort({ path: '/dev/example', baudRate: 9600 })
  const parser = new ReadlineParser({ delimiter: '\r\n' }) 
  

  serialport.pipe(parser);

  serialport.on('open', function () {
    console.log('Serial Port is Open');
  });
  serialport.write('ROBOT PLEASE RESPOND\n')
  parser.on('data', function (data: string) {
    console.log(data);
    const [joules, speed, caliber, fps] = data.split(',').map(Number);
    res.status(200).json({ joules, speed, caliber, fps }); // Envie os dados obtidos do Arduino na resposta da API
  });
}
