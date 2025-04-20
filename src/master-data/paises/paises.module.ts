import { Module } from '@nestjs/common';
import { PaisesController } from './paises.service';
import { PaisesService } from './paises.controller';

@Module({
    controllers: [PaisesController],
    providers: [PaisesService],
    exports: [PaisesService],
})
export class PaisesModule { }