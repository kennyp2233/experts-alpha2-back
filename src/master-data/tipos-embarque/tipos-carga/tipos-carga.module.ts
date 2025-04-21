// src/master-data/tipos-embarque/tipos-carga/tipos-carga.module.ts
import { Module } from '@nestjs/common';
import { TiposCargaController } from './tipos-carga.controller';
import { TiposCargaService } from './tipos-carga.service';

@Module({
    controllers: [TiposCargaController],
    providers: [TiposCargaService],
    exports: [TiposCargaService],
})
export class TiposCargaModule { }