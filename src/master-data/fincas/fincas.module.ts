// src/master-data/fincas/fincas.module.ts
import { Module } from '@nestjs/common';
import { FincasController } from './fincas.controller';
import { FincasService } from './fincas.service';

@Module({
    controllers: [FincasController],
    providers: [FincasService],
    exports: [FincasService],
})
export class FincasModule { }