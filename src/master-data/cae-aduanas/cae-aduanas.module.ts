// src/master-data/cae-aduanas/cae-aduanas.module.ts
import { Module } from '@nestjs/common';
import { CaeAduanasController } from './cae-aduanas.controller';
import { CaeAduanasService } from './cae-aduanas.service';

@Module({
    controllers: [CaeAduanasController],
    providers: [CaeAduanasService],
    exports: [CaeAduanasService],
})
export class CaeAduanasModule { }
