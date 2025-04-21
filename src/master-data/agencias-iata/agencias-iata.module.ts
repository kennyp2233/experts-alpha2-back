
// src/master-data/agencias-iata/agencias-iata.module.ts
import { Module } from '@nestjs/common';
import { AgenciasIataController } from './agencias-iata.controller';
import { AgenciasIataService } from './agencias-iata.service';

@Module({
    controllers: [AgenciasIataController],
    providers: [AgenciasIataService],
    exports: [AgenciasIataService],
})
export class AgenciasIataModule { }