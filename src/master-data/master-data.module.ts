import { Module } from '@nestjs/common';
import { AerolineasModule } from './aerolineas/aerolinea.module';
import { DestinosModule } from './destinos/destinos.module';
import { OrigenesModule } from './origenes/origenes.module';
import { PaisesModule } from './paises/paises.module';

@Module({
    imports: [
        AerolineasModule,
        DestinosModule,
        OrigenesModule,
        PaisesModule,
    ],
    exports: [
        AerolineasModule,
        DestinosModule,
        OrigenesModule,
        PaisesModule,
    ],
})
export class MasterDataModule { }