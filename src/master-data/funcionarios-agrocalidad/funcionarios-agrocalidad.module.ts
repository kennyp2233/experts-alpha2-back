// src/master-data/funcionarios-agrocalidad/funcionarios-agrocalidad.module.ts
import { Module } from '@nestjs/common';
import { FuncionariosAgrocalidadController } from './funcionarios-agrocalidad.controller';
import { FuncionariosAgrocalidadService } from './funcionarios-agrocalidad.service';

@Module({
    controllers: [FuncionariosAgrocalidadController],
    providers: [FuncionariosAgrocalidadService],
    exports: [FuncionariosAgrocalidadService],
})
export class FuncionariosAgrocalidadModule { }