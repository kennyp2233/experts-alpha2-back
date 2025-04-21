
// src/master-data/subagencias/subagencias.module.ts
import { Module } from '@nestjs/common';
import { SubagenciasController } from './subagencias.controller';
import { SubagenciasService } from './subagencias.service';

@Module({
    controllers: [SubagenciasController],
    providers: [SubagenciasService],
    exports: [SubagenciasService],
})
export class SubagenciasModule { }