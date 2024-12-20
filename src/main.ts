import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ALQUILA_TU_CANCHA_CLIENT } from './domain/ports/aquila-tu-cancha.client'; // Token del cliente
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Habilitar CORS para Fastify
  app.enableCors({
    origin: 'http://localhost:3002',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Precarga de datos desde múltiples archivos JSON
  try {
    const httpAlquilaTuCanchaClient = app.get(ALQUILA_TU_CANCHA_CLIENT); // Usar el token del cliente

    // Lista de archivos JSON
    const jsonFiles = [
      './mock/data/ChIJoYUAHyvmopUR4xJzVPBE_Lw.json',
      './mock/data/ChIJW9fXNZNTtpURV6VYAumGQOw.json',
    ];

    // Leer y cargar cada archivo JSON
    for (const file of jsonFiles) {
      const jsonData = JSON.parse(fs.readFileSync(file, 'utf8')); // Leer JSON desde el archivo
      await httpAlquilaTuCanchaClient.prefetchDataFromJson(jsonData); // Llamar al método de precarga
      console.log(`Datos precargados exitosamente desde: ${file}`);
    }
  } catch (error) {
    console.error('Error al precargar datos desde JSON:', error);
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
