// src/master-data/embarcadores/embarcadores.module.ts
import { Module } from '@nestjs/common';
import { EmbarcadoresController } from './embarcadores.controller';
import { EmbarcadoresService } from './embarcadores.service';

@Module({
    controllers: [EmbarcadoresController],
    providers: [EmbarcadoresService],
    exports: [EmbarcadoresService],
})
export class EmbarcadoresModule { }
