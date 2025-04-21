// src/master-data/bodegueros/bodegueros.module.ts
import { Module } from '@nestjs/common';
import { BodeguerosController } from './bodegueros.controller';
import { BodeguerosService } from './bodegueros.service';

@Module({
    controllers: [BodeguerosController],
    providers: [BodeguerosService],
    exports: [BodeguerosService],
})
export class BodeguerosModule { }
