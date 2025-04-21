// src/master-data/paises/paises.module.ts
import { Module } from '@nestjs/common';
import { PaisesController } from './paises.controller';
import { PaisesService } from './paises.service';

@Module({
    controllers: [PaisesController],
    providers: [PaisesService],
    exports: [PaisesService],
})
export class PaisesModule { }