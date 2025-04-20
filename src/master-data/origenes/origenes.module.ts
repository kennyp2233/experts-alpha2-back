import { Module } from '@nestjs/common';
import { OrigenesController } from './origenes.controller';
import { OrigenesService } from './origenes.service';

@Module({
    controllers: [OrigenesController],
    providers: [OrigenesService],
    exports: [OrigenesService],
})
export class OrigenesModule { }