// src/master-data/master-data.module.ts
import { Module } from '@nestjs/common';
import { AcuerdosArancelariosModule } from './acuerdos-arancelarios/acuerdos-arancelarios.module';
import { AerolineasModule } from './aerolineas/aerolinea.module';
import { AgenciasIataModule } from './agencias-iata/agencias-iata.module';
import { BodeguerosModule } from './bodegueros/bodegueros.module';
import { CaeAduanasModule } from './cae-aduanas/cae-aduanas.module';
import { ChoferesModule } from './choferes/choferes.module';
import { ClientesModule } from './clientes/clientes.module';
import { ConsignatariosModule } from './consignatarios/consignatarios.module';
import { DestinosModule } from './destinos/destinos.module';
import { EmbarcadoresModule } from './embarcadores/embarcadores.module';
import { FincasModule } from './fincas/fincas.module';
import { FuncionariosAgrocalidadModule } from './funcionarios-agrocalidad/funcionarios-agrocalidad.module';
import { OrigenesModule } from './origenes/origenes.module';
import { PaisesModule } from './paises/paises.module';
import { ProductosModule } from './productos/productos.module';
import { SubagenciasModule } from './subagencias/subagencias.module';
import { TiposEmbarqueModule } from './tipos-embarque/tipos-embarque.module';

@Module({
    imports: [
        AcuerdosArancelariosModule,
        AerolineasModule,
        AgenciasIataModule,
        BodeguerosModule,
        CaeAduanasModule,
        ChoferesModule,
        ClientesModule,
        ConsignatariosModule,
        DestinosModule,
        EmbarcadoresModule,
        FincasModule,
        FuncionariosAgrocalidadModule,
        OrigenesModule,
        PaisesModule,
        ProductosModule,
        SubagenciasModule,
        TiposEmbarqueModule,
    ],
    exports: [
        AcuerdosArancelariosModule,
        AerolineasModule,
        AgenciasIataModule,
        BodeguerosModule,
        CaeAduanasModule,
        ChoferesModule,
        ClientesModule,
        ConsignatariosModule,
        DestinosModule,
        EmbarcadoresModule,
        FincasModule,
        FuncionariosAgrocalidadModule,
        OrigenesModule,
        PaisesModule,
        ProductosModule,
        SubagenciasModule,
        TiposEmbarqueModule,
    ],
})
export class MasterDataModule { }