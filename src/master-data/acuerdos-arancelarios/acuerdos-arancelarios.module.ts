// src/master-data/acuerdos-arancelarios/acuerdos-arancelarios.module.ts
import { Module } from '@nestjs/common';
import { AcuerdosArancelariosController } from './acuerdos-arancelarios.controller';
import { AcuerdosArancelariosService } from './acuerdos-arancelarios.service';

@Module({
    controllers: [AcuerdosArancelariosController],
    providers: [AcuerdosArancelariosService],
    exports: [AcuerdosArancelariosService],
})
export class AcuerdosArancelariosModule { }

