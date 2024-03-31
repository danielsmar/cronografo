import prisma from '@/lib/prisma';

export interface Measurement {
  id?: number;
  joules: number;
  speed: number;
  caliber: number;
  fps: number;
}


export class MeasurementsController {
  static async create(params: Measurement) {
    const measurement = await prisma.measurement.create({ data: params });

    return { measurement };
  }  

  static async find(id: number) {
    const measurement = await prisma.measurement.findUnique({ where: { id } });

    return { measurement };
  }

  static async findAll() {
    const measurements = await prisma.measurement.findMany();

    return { measurements };
  }

  // static async update(id: string, params: UpdateMeasurement) {
  //   const measurement = await prisma.measurement.update({ where: { id }, data: params });

  //   return { measurement };
  // }

  static async delete(id: number) {
    await prisma.measurement.delete({ where: { id } });
  }
}
