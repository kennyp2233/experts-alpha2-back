import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplicar middleware global
  app.use(helmet());
  app.use(compression());

  // Habilitar CORS
  app.enableCors();

  // Habilitar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para todas las rutas de la API
  app.setGlobalPrefix('api');

  // Configuración de Swagger para documentación
  const config = new DocumentBuilder()
    .setTitle('API de Sistema ERP para Agencia de Carga')
    .setDescription('API para gestionar el proceso de transporte de rosas')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro de usuarios')
    .addTag('users', 'Gestión de usuarios')
    .addTag('roles', 'Gestión de roles y permisos')
    .addTag('documents', 'Gestión de documentos de fincas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Puerto de la aplicación
  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();