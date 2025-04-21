
// src/master-data/choferes/choferes.module.ts
import { Module } from '@nestjs/common';
import { ChoferesController } from './choferes.controller';
import { ChoferesService } from './choferes.service';

@Module({
    controllers: [ChoferesController],
    providers: [ChoferesService],
    exports: [ChoferesService],
})
export class ChoferesModule { }