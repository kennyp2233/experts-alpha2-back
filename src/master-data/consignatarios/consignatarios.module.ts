// src/master-data/consignatarios/consignatarios.module.ts
import { Module } from '@nestjs/common';
import { ConsignatariosController } from './consignatarios.controller';
import { ConsignatariosService } from './consignatarios.service';

@Module({
    controllers: [ConsignatariosController],
    providers: [ConsignatariosService],
    exports: [ConsignatariosService],
})
export class ConsignatariosModule { }