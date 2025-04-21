// src/master-data/productos/productos.module.ts
import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
    controllers: [ProductosController],
    providers: [ProductosService],
    exports: [ProductosService],
})
export class ProductosModule { }