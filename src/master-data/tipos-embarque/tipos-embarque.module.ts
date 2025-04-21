
// src/master-data/tipos-embarque/tipos-embarque.module.ts
import { Module } from '@nestjs/common';
import { TiposEmbarqueController } from './tipos-embarque.controller';
import { TiposEmbarqueService } from './tipos-embarque.service';
import { TiposCargaModule } from './tipos-carga/tipos-carga.module';
import { TiposEmbalajeModule } from './tipos-embalaje/tipo-embalaje.module';

@Module({
    imports: [TiposCargaModule, TiposEmbalajeModule],
    controllers: [TiposEmbarqueController],
    providers: [TiposEmbarqueService],
    exports: [TiposEmbarqueService],
})
export class TiposEmbarqueModule { }