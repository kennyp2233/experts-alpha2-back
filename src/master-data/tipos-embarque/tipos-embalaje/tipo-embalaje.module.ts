// src/master-data/tipos-embarque/tipos-embalaje/tipos-embalaje.module.ts
import { Module } from '@nestjs/common';
import { TiposEmbalajeController } from './tipos-embalaje.controller';
import { TiposEmbalajeService } from './tipos-embalaje.service';

@Module({
    controllers: [TiposEmbalajeController],
    providers: [TiposEmbalajeService],
    exports: [TiposEmbalajeService],
})
export class TiposEmbalajeModule { }