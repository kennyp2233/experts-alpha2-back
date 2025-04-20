import { Module } from '@nestjs/common';
import { AerolineasController } from './aerolinea.controller';
import { AerolineasService } from './aerolinea.service';

@Module({
    controllers: [AerolineasController],
    providers: [AerolineasService],
    exports: [AerolineasService],
})
export class AerolineasModule { }