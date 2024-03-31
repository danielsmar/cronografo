import { MeasurementsController } from "@/controllers/measurements";
import { error } from "console";

interface Data {
  joules: number;
  speed: number;
  caliber: number;
  fps: number;
}

export async function GET() {
  console.log("Buscando medições...");

  try {
    const { measurements } = await MeasurementsController.findAll();

    if (!measurements) {
      return new Response(JSON.stringify({ message: 'No measurements found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });      
    }

    console.log(`Fetched [${measurements.length}] measurements successfully`);
    return new Response(JSON.stringify({ message: `Fetched [${measurements.length}] measurements successfully`, measurements }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error fetching measurements' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request: Request, response: Response) {
  console.log("Enviando medições...");
  const dataArray: Data[] = await request.json();
 
  try {
     if (!Array.isArray(dataArray) || dataArray.length === 0) {
       return new Response('Data array is empty or not provided', { status: 400 });
     }
 
     const createdMeasurements = [];
 
     for (const data of dataArray) {
       const { measurement } = await MeasurementsController.create(data);
       createdMeasurements.push(measurement);
     }
 
     console.log("Measurements created successfully:", createdMeasurements);
     // Retorne uma resposta de sucesso após criar as medições
     return new Response(JSON.stringify(createdMeasurements), { status: 201 });
  }
  catch (error) {
     console.log("Error creating measurement", error);
     return new Response("Error creating measurement", { status: 500 });
  }
 }
 



