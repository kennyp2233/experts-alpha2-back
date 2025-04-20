-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pass" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "id" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoDocumentoFinca" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "es_obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoDocumentoFinca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoFinca" (
    "id" TEXT NOT NULL,
    "id_finca" INTEGER NOT NULL,
    "id_tipo_documento" INTEGER NOT NULL,
    "ruta_archivo" TEXT,
    "nombre_archivo" TEXT,
    "tamano_archivo" INTEGER,
    "tipo_mime" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "comentario" TEXT,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revision" TIMESTAMP(3),
    "id_revisor" TEXT,

    CONSTRAINT "DocumentoFinca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoDocumento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_entidad" TEXT NOT NULL,
    "es_estado_inicial" BOOLEAN NOT NULL DEFAULT false,
    "es_estado_final" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstadoDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransicionPermitida" (
    "id" SERIAL NOT NULL,
    "tipo_entidad" TEXT NOT NULL,
    "id_estado_origen" INTEGER NOT NULL,
    "id_estado_destino" INTEGER NOT NULL,
    "roles_permitidos" TEXT NOT NULL,
    "requiere_comentario" BOOLEAN NOT NULL DEFAULT false,
    "nombre_accion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransicionPermitida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuiaMadreEstado" (
    "id" TEXT NOT NULL,
    "id_guia_madre" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "comentario" TEXT,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuiaMadreEstado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoCoordinacionEstado" (
    "id" TEXT NOT NULL,
    "id_doc_coordinacion" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "comentario" TEXT,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoCoordinacionEstado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuiaHijaEstado" (
    "id" TEXT NOT NULL,
    "id_guia_hija" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "comentario" TEXT,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuiaHijaEstado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuntosFidelizacion" (
    "id" TEXT NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "puntos_actuales" INTEGER NOT NULL DEFAULT 0,
    "puntos_totales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuntosFidelizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaccionPuntos" (
    "id" TEXT NOT NULL,
    "id_puntos" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "id_documento_ref" INTEGER,
    "tipo_documento_ref" TEXT,
    "id_usuario_creador" TEXT NOT NULL,
    "fecha_transaccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3),

    CONSTRAINT "TransaccionPuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aerolinea" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "ci_ruc" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "contacto" TEXT,
    "id_modo" INTEGER,
    "maestra_guias_hijas" BOOLEAN DEFAULT false,
    "codigo" TEXT,
    "prefijo_awb" TEXT,
    "codigo_cae" TEXT,
    "estado_activo" BOOLEAN DEFAULT true,
    "from1" INTEGER,
    "to1" INTEGER,
    "by1" INTEGER,
    "to2" INTEGER,
    "by2" INTEGER,
    "to3" INTEGER,
    "by3" INTEGER,
    "afiliado_cass" BOOLEAN DEFAULT false,
    "guias_virtuales" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modo" TEXT NOT NULL DEFAULT 'AEROLINEA',

    CONSTRAINT "Aerolinea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "cliente_codigo_pais" TEXT,
    "fitos_valor" DOUBLE PRECISION,
    "form_a" INTEGER,
    "transport" INTEGER,
    "termo" INTEGER,
    "mica" INTEGER,
    "handling" DOUBLE PRECISION,
    "cuenta_contable" TEXT,
    "nombre_factura" TEXT,
    "ruc_factura" TEXT,
    "direccion_factura" TEXT,
    "telefono_factura" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finca" (
    "id" SERIAL NOT NULL,
    "nombre_finca" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "ruc_finca" TEXT,
    "tipo_documento" TEXT NOT NULL,
    "genera_guias_certificadas" BOOLEAN,
    "i_general_telefono" TEXT,
    "i_general_email" TEXT,
    "i_general_ciudad" TEXT,
    "i_general_provincia" TEXT,
    "i_general_pais" TEXT,
    "i_general_cod_sesa" TEXT,
    "i_general_cod_pais" TEXT,
    "a_nombre" TEXT,
    "a_codigo" TEXT,
    "a_direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Finca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoBase" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3),
    "id_aerolinea" INTEGER,
    "id_referencia" INTEGER,
    "id_stock" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuiaMadre" (
    "id" SERIAL NOT NULL,
    "prefijo" INTEGER NOT NULL,
    "secuencial" INTEGER NOT NULL,
    "id_documento_base" INTEGER NOT NULL,
    "id_estado_actual" INTEGER NOT NULL,
    "prestamo" BOOLEAN DEFAULT false,
    "observaciones" TEXT,
    "fecha_prestamo" TIMESTAMP(3),
    "devolucion" BOOLEAN DEFAULT false,
    "fecha_devolucion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuiaMadre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoCoordinacion" (
    "id" SERIAL NOT NULL,
    "id_guia_madre" INTEGER NOT NULL,
    "id_consignatario" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_agencia_iata" INTEGER NOT NULL,
    "id_destino_awb" INTEGER NOT NULL,
    "id_destino_final_docs" INTEGER NOT NULL,
    "id_estado_actual" INTEGER NOT NULL,
    "pago" TEXT NOT NULL DEFAULT 'PREPAID',
    "fecha_vuelo" TIMESTAMP(3) NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "from1" INTEGER,
    "to1" INTEGER,
    "by1" INTEGER,
    "to2" INTEGER,
    "by2" INTEGER,
    "to3" INTEGER,
    "by3" INTEGER,
    "costo_guia_valor" DOUBLE PRECISION,
    "combustible_valor" DOUBLE PRECISION,
    "seguridad_valor" DOUBLE PRECISION,
    "aux_calculo_valor" DOUBLE PRECISION,
    "otros_valor" DOUBLE PRECISION,
    "aux1_valor" DOUBLE PRECISION,
    "aux2_valor" DOUBLE PRECISION,
    "tarifa_rate" DOUBLE PRECISION,
    "char_weight" DOUBLE PRECISION,
    "form_a" INTEGER,
    "transport" INTEGER,
    "pca" DOUBLE PRECISION,
    "fitos" INTEGER,
    "termografo" INTEGER,
    "mca" INTEGER,
    "tax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoCoordinacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuiaHija" (
    "id" SERIAL NOT NULL,
    "id_documento_coordinacion" INTEGER NOT NULL,
    "id_guia_madre" INTEGER NOT NULL,
    "id_finca" INTEGER NOT NULL,
    "id_producto" INTEGER,
    "id_estado_actual" INTEGER NOT NULL,
    "numero_guia_hija" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "secuencial" INTEGER NOT NULL,
    "fulls" INTEGER DEFAULT 0,
    "pcs" INTEGER DEFAULT 0,
    "kgs" DOUBLE PRECISION DEFAULT 0,
    "stems" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuiaHija_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AerolineasPlantilla" (
    "id_aerolinea" INTEGER NOT NULL,
    "costo_guia_abrv" TEXT,
    "combustible_abrv" TEXT,
    "seguridad_abrv" TEXT,
    "aux_calculo_abrv" TEXT,
    "iva_abrv" TEXT,
    "otros_abrv" TEXT,
    "aux1_abrv" TEXT,
    "aux2_abrv" TEXT,
    "costo_guia_valor" DOUBLE PRECISION DEFAULT 0,
    "combustible_valor" DOUBLE PRECISION DEFAULT 0,
    "seguridad_valor" DOUBLE PRECISION DEFAULT 0,
    "aux_calculo_valor" DOUBLE PRECISION DEFAULT 0,
    "otros_valor" DOUBLE PRECISION DEFAULT 0,
    "aux1_valor" DOUBLE PRECISION DEFAULT 0,
    "aux2_valor" DOUBLE PRECISION DEFAULT 0,
    "plantilla_guia_madre" TEXT,
    "plantilla_formato_aerolinea" TEXT,
    "plantilla_reservas" TEXT,
    "tarifa_rate" DOUBLE PRECISION DEFAULT 0,
    "pca" DOUBLE PRECISION DEFAULT 0,
    "combustible_mult" TEXT,
    "seguridad_mult" TEXT,
    "aux_calc_mult" TEXT,
    "iva_valor" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "AerolineasPlantilla_pkey" PRIMARY KEY ("id_aerolinea")
);

-- CreateTable
CREATE TABLE "Pais" (
    "id_pais" SERIAL NOT NULL,
    "siglas_pais" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "pais_id" INTEGER,
    "id_acuerdo" INTEGER,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id_pais")
);

-- CreateTable
CREATE TABLE "AcuerdoArancelario" (
    "id_acuerdo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "AcuerdoArancelario_pkey" PRIMARY KEY ("id_acuerdo")
);

-- CreateTable
CREATE TABLE "Origen" (
    "id" SERIAL NOT NULL,
    "tag" TEXT,
    "nombre" TEXT,
    "aeropuerto" TEXT,
    "id_pais" INTEGER,
    "id_cae_aduana" INTEGER,

    CONSTRAINT "Origen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaeAduana" (
    "id_cae_aduana" SERIAL NOT NULL,
    "codigo_aduana" INTEGER,
    "nombre" TEXT,

    CONSTRAINT "CaeAduana_pkey" PRIMARY KEY ("id_cae_aduana")
);

-- CreateTable
CREATE TABLE "Destino" (
    "id" SERIAL NOT NULL,
    "tag" TEXT,
    "nombre" TEXT,
    "aeropuerto" TEXT,
    "id_pais" INTEGER,
    "sesa_id" TEXT,
    "leyenda_fito" TEXT,
    "cobro_fitos" BOOLEAN DEFAULT false,

    CONSTRAINT "Destino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embarcador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "pais" TEXT,
    "embarcador_codigo_pais" TEXT,
    "handling" DOUBLE PRECISION,
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "Embarcador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consignatario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "direccion" TEXT,
    "id_embarcador" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,

    CONSTRAINT "Consignatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsignatarioCaeSice" (
    "id_consignatario" INTEGER NOT NULL,
    "consignee_nombre" TEXT,
    "consignee_direccion" TEXT,
    "consignee_documento" TEXT,
    "consignee_siglas_pais" TEXT,
    "notify_nombre" TEXT,
    "notify_direccion" TEXT,
    "notify_documento" TEXT,
    "notify_siglas_pais" TEXT,
    "hawb_nombre" TEXT,
    "hawb_direccion" TEXT,
    "hawb_documento" TEXT,
    "hawb_siglas_pais" TEXT,
    "consignee_tipo_documento" TEXT,
    "notify_tipo_documento" TEXT,
    "hawb_tipo_documento" TEXT,

    CONSTRAINT "ConsignatarioCaeSice_pkey" PRIMARY KEY ("id_consignatario")
);

-- CreateTable
CREATE TABLE "ConsignatarioFacturacion" (
    "id_consignatario" INTEGER NOT NULL,
    "factura_nombre" TEXT,
    "factura_ruc" TEXT,
    "factura_direccion" TEXT,
    "factura_telefono" TEXT,

    CONSTRAINT "ConsignatarioFacturacion_pkey" PRIMARY KEY ("id_consignatario")
);

-- CreateTable
CREATE TABLE "ConsignatarioFito" (
    "id_consignatario" INTEGER NOT NULL,
    "fito_declared_name" TEXT,
    "fito_forma_a" TEXT,
    "fito_nombre" TEXT,
    "fito_direccion" TEXT,
    "fito_pais" TEXT,

    CONSTRAINT "ConsignatarioFito_pkey" PRIMARY KEY ("id_consignatario")
);

-- CreateTable
CREATE TABLE "ConsignatarioGuiaH" (
    "id_consignatario" INTEGER NOT NULL,
    "guia_h_consignee" TEXT,
    "guia_h_name_adress" TEXT,
    "guia_h_notify" TEXT,

    CONSTRAINT "ConsignatarioGuiaH_pkey" PRIMARY KEY ("id_consignatario")
);

-- CreateTable
CREATE TABLE "ConsignatarioGuiaM" (
    "id_consignatario" INTEGER NOT NULL,
    "id_destino" INTEGER,
    "guia_m_consignee" TEXT,
    "guia_m_name_address" TEXT,
    "guia_m_notify" TEXT,

    CONSTRAINT "ConsignatarioGuiaM_pkey" PRIMARY KEY ("id_consignatario")
);

-- CreateTable
CREATE TABLE "ConsignatarioTransmision" (
    "id_consignatario" INTEGER NOT NULL,
    "consignee_nombre_trans" TEXT,
    "consignee_direccion_trans" TEXT,
    "consignee_ciudad_trans" TEXT,
    "consignee_provincia_trans" TEXT,
    "consignee_pais_trans" TEXT,
    "consignee_eueori_trans" TEXT,
    "notify_nombre_trans" TEXT,
    "notify_direccion_trans" TEXT,
    "notify_ciudad_trans" TEXT,
    "notify_provincia_trans" TEXT,
    "notify_pais_trans" TEXT,
    "notify_eueori_trans" TEXT,
    "hawb_nombre_trans" TEXT,
    "hawb_direccion_trans" TEXT,
    "hawb_ciudad_trans" TEXT,
    "hawb_provincia_trans" TEXT,
    "hawb_pais_trans" TEXT,
    "hawb_eueori_trans" TEXT,

    CONSTRAINT "ConsignatarioTransmision_pkey" PRIMARY KEY ("id_consignatario")
);

-- CreateTable
CREATE TABLE "FincaChofer" (
    "id_fincas_choferes" SERIAL NOT NULL,
    "id_finca" INTEGER NOT NULL,
    "id_chofer" INTEGER NOT NULL,

    CONSTRAINT "FincaChofer_pkey" PRIMARY KEY ("id_fincas_choferes")
);

-- CreateTable
CREATE TABLE "FincaProducto" (
    "id_fincas_productos" SERIAL NOT NULL,
    "id_finca" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,

    CONSTRAINT "FincaProducto_pkey" PRIMARY KEY ("id_fincas_productos")
);

-- CreateTable
CREATE TABLE "Chofer" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "placas_camion" TEXT,
    "telefono" TEXT,
    "camion" TEXT,
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "Chofer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "tag" TEXT,
    "nombre" TEXT,
    "descripcion" TEXT,
    "nombre_botanico" TEXT,
    "especie" TEXT,
    "id_medida" INTEGER,
    "precio_unitario" DOUBLE PRECISION,
    "estado" BOOLEAN,
    "id_opcion" INTEGER,
    "stems_por_full" INTEGER,
    "id_sesa" INTEGER,
    "medida" TEXT NOT NULL,
    "opcion" TEXT NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductosAranceles" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "aranceles_destino" TEXT,
    "aranceles_codigo" TEXT,

    CONSTRAINT "ProductosAranceles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductosCompuesto" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "destino" TEXT,
    "declaracion" TEXT,

    CONSTRAINT "ProductosCompuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductosMiPro" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "acuerdo" TEXT,
    "djocode" TEXT,
    "tariffcode" TEXT,

    CONSTRAINT "ProductosMiPro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEmbarque" (
    "id" SERIAL NOT NULL,
    "tag" TEXT,
    "nombre" TEXT,
    "id_tipo_carga" INTEGER,
    "id_tipo_embalaje" INTEGER,
    "regimen" TEXT,
    "mercancia" TEXT,
    "harmonised_comidity" TEXT,

    CONSTRAINT "TipoEmbarque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoCarga" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoCarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEmbalaje" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoEmbalaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgenciaIata" (
    "id" SERIAL NOT NULL,
    "alias_shipper" TEXT NOT NULL,
    "nombre_shipper" TEXT,
    "ruc_shipper" TEXT,
    "direccion_shipper" TEXT,
    "telefono_shipper" TEXT,
    "ciudad_shipper" TEXT,
    "pais_shipper" TEXT,
    "nombre_carrier" TEXT,
    "ruc_carrier" TEXT,
    "direccion_carrier" TEXT,
    "telefono_carrier" TEXT,
    "ciudad_carrier" TEXT,
    "pais_carrier" TEXT,
    "iata_code_carrier" TEXT,
    "registro_exportador" TEXT,
    "codigo_operador" TEXT,
    "codigo_consolidador" TEXT,
    "comision" DOUBLE PRECISION,
    "estado_agencia_iata" BOOLEAN DEFAULT true,

    CONSTRAINT "AgenciaIata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubAgencia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci_ruc" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "ciudad" TEXT,
    "pais" TEXT,
    "provincia" TEXT,
    "representante" TEXT,
    "comision" DOUBLE PRECISION,
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "SubAgencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuncionarioAgrocalidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "FuncionarioAgrocalidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bodeguero" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "clave_bodega" TEXT NOT NULL,
    "estado" BOOLEAN DEFAULT true,

    CONSTRAINT "Bodeguero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValoresAgencia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "valor" DOUBLE PRECISION,

    CONSTRAINT "ValoresAgencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordinacionClientes" (
    "id_coordinacion" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'CLIENTE',
    "id_entidad" INTEGER NOT NULL,
    "clienteId_clientes" INTEGER,

    CONSTRAINT "CoordinacionClientes_pkey" PRIMARY KEY ("id_coordinacion","tipo","id_entidad")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_id_usuario_id_rol_key" ON "UsuarioRol"("id_usuario", "id_rol");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoDocumento_nombre_key" ON "EstadoDocumento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PuntosFidelizacion_id_cliente_key" ON "PuntosFidelizacion"("id_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoCoordinacion_id_guia_madre_key" ON "DocumentoCoordinacion"("id_guia_madre");

-- CreateIndex
CREATE UNIQUE INDEX "Pais_siglas_pais_key" ON "Pais"("siglas_pais");

-- CreateIndex
CREATE UNIQUE INDEX "AgenciaIata_alias_shipper_key" ON "AgenciaIata"("alias_shipper");

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoFinca" ADD CONSTRAINT "DocumentoFinca_id_finca_fkey" FOREIGN KEY ("id_finca") REFERENCES "Finca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoFinca" ADD CONSTRAINT "DocumentoFinca_id_tipo_documento_fkey" FOREIGN KEY ("id_tipo_documento") REFERENCES "TipoDocumentoFinca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoFinca" ADD CONSTRAINT "DocumentoFinca_id_revisor_fkey" FOREIGN KEY ("id_revisor") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransicionPermitida" ADD CONSTRAINT "TransicionPermitida_id_estado_origen_fkey" FOREIGN KEY ("id_estado_origen") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransicionPermitida" ADD CONSTRAINT "TransicionPermitida_id_estado_destino_fkey" FOREIGN KEY ("id_estado_destino") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaMadreEstado" ADD CONSTRAINT "GuiaMadreEstado_id_guia_madre_fkey" FOREIGN KEY ("id_guia_madre") REFERENCES "GuiaMadre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaMadreEstado" ADD CONSTRAINT "GuiaMadreEstado_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaMadreEstado" ADD CONSTRAINT "GuiaMadreEstado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacionEstado" ADD CONSTRAINT "DocumentoCoordinacionEstado_id_doc_coordinacion_fkey" FOREIGN KEY ("id_doc_coordinacion") REFERENCES "DocumentoCoordinacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacionEstado" ADD CONSTRAINT "DocumentoCoordinacionEstado_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacionEstado" ADD CONSTRAINT "DocumentoCoordinacionEstado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHijaEstado" ADD CONSTRAINT "GuiaHijaEstado_id_guia_hija_fkey" FOREIGN KEY ("id_guia_hija") REFERENCES "GuiaHija"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHijaEstado" ADD CONSTRAINT "GuiaHijaEstado_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHijaEstado" ADD CONSTRAINT "GuiaHijaEstado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntosFidelizacion" ADD CONSTRAINT "PuntosFidelizacion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaccionPuntos" ADD CONSTRAINT "TransaccionPuntos_id_puntos_fkey" FOREIGN KEY ("id_puntos") REFERENCES "PuntosFidelizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaccionPuntos" ADD CONSTRAINT "TransaccionPuntos_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_from1_fkey" FOREIGN KEY ("from1") REFERENCES "Origen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_to1_fkey" FOREIGN KEY ("to1") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_by1_fkey" FOREIGN KEY ("by1") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_to2_fkey" FOREIGN KEY ("to2") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_by2_fkey" FOREIGN KEY ("by2") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_to3_fkey" FOREIGN KEY ("to3") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aerolinea" ADD CONSTRAINT "Aerolinea_by3_fkey" FOREIGN KEY ("by3") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoBase" ADD CONSTRAINT "DocumentoBase_id_aerolinea_fkey" FOREIGN KEY ("id_aerolinea") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoBase" ADD CONSTRAINT "DocumentoBase_id_referencia_fkey" FOREIGN KEY ("id_referencia") REFERENCES "AgenciaIata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaMadre" ADD CONSTRAINT "GuiaMadre_id_documento_base_fkey" FOREIGN KEY ("id_documento_base") REFERENCES "DocumentoBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaMadre" ADD CONSTRAINT "GuiaMadre_id_estado_actual_fkey" FOREIGN KEY ("id_estado_actual") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_guia_madre_fkey" FOREIGN KEY ("id_guia_madre") REFERENCES "GuiaMadre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_agencia_iata_fkey" FOREIGN KEY ("id_agencia_iata") REFERENCES "AgenciaIata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_destino_awb_fkey" FOREIGN KEY ("id_destino_awb") REFERENCES "Destino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_destino_final_docs_fkey" FOREIGN KEY ("id_destino_final_docs") REFERENCES "Destino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_id_estado_actual_fkey" FOREIGN KEY ("id_estado_actual") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_from1_fkey" FOREIGN KEY ("from1") REFERENCES "Origen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_to1_fkey" FOREIGN KEY ("to1") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_by1_fkey" FOREIGN KEY ("by1") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_to2_fkey" FOREIGN KEY ("to2") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_by2_fkey" FOREIGN KEY ("by2") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_to3_fkey" FOREIGN KEY ("to3") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCoordinacion" ADD CONSTRAINT "DocumentoCoordinacion_by3_fkey" FOREIGN KEY ("by3") REFERENCES "Aerolinea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHija" ADD CONSTRAINT "GuiaHija_id_documento_coordinacion_fkey" FOREIGN KEY ("id_documento_coordinacion") REFERENCES "DocumentoCoordinacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHija" ADD CONSTRAINT "GuiaHija_id_guia_madre_fkey" FOREIGN KEY ("id_guia_madre") REFERENCES "GuiaMadre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHija" ADD CONSTRAINT "GuiaHija_id_finca_fkey" FOREIGN KEY ("id_finca") REFERENCES "Finca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHija" ADD CONSTRAINT "GuiaHija_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaHija" ADD CONSTRAINT "GuiaHija_id_estado_actual_fkey" FOREIGN KEY ("id_estado_actual") REFERENCES "EstadoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AerolineasPlantilla" ADD CONSTRAINT "AerolineasPlantilla_id_aerolinea_fkey" FOREIGN KEY ("id_aerolinea") REFERENCES "Aerolinea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pais" ADD CONSTRAINT "Pais_id_acuerdo_fkey" FOREIGN KEY ("id_acuerdo") REFERENCES "AcuerdoArancelario"("id_acuerdo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Origen" ADD CONSTRAINT "Origen_id_pais_fkey" FOREIGN KEY ("id_pais") REFERENCES "Pais"("id_pais") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Origen" ADD CONSTRAINT "Origen_id_cae_aduana_fkey" FOREIGN KEY ("id_cae_aduana") REFERENCES "CaeAduana"("id_cae_aduana") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destino" ADD CONSTRAINT "Destino_id_pais_fkey" FOREIGN KEY ("id_pais") REFERENCES "Pais"("id_pais") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consignatario" ADD CONSTRAINT "Consignatario_id_embarcador_fkey" FOREIGN KEY ("id_embarcador") REFERENCES "Embarcador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consignatario" ADD CONSTRAINT "Consignatario_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioCaeSice" ADD CONSTRAINT "ConsignatarioCaeSice_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioFacturacion" ADD CONSTRAINT "ConsignatarioFacturacion_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioFito" ADD CONSTRAINT "ConsignatarioFito_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioGuiaH" ADD CONSTRAINT "ConsignatarioGuiaH_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioGuiaM" ADD CONSTRAINT "ConsignatarioGuiaM_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioGuiaM" ADD CONSTRAINT "ConsignatarioGuiaM_id_destino_fkey" FOREIGN KEY ("id_destino") REFERENCES "Destino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignatarioTransmision" ADD CONSTRAINT "ConsignatarioTransmision_id_consignatario_fkey" FOREIGN KEY ("id_consignatario") REFERENCES "Consignatario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FincaChofer" ADD CONSTRAINT "FincaChofer_id_finca_fkey" FOREIGN KEY ("id_finca") REFERENCES "Finca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FincaChofer" ADD CONSTRAINT "FincaChofer_id_chofer_fkey" FOREIGN KEY ("id_chofer") REFERENCES "Chofer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FincaProducto" ADD CONSTRAINT "FincaProducto_id_finca_fkey" FOREIGN KEY ("id_finca") REFERENCES "Finca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FincaProducto" ADD CONSTRAINT "FincaProducto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductosAranceles" ADD CONSTRAINT "ProductosAranceles_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductosCompuesto" ADD CONSTRAINT "ProductosCompuesto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductosMiPro" ADD CONSTRAINT "ProductosMiPro_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoEmbarque" ADD CONSTRAINT "TipoEmbarque_id_tipo_carga_fkey" FOREIGN KEY ("id_tipo_carga") REFERENCES "TipoCarga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoEmbarque" ADD CONSTRAINT "TipoEmbarque_id_tipo_embalaje_fkey" FOREIGN KEY ("id_tipo_embalaje") REFERENCES "TipoEmbalaje"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinacionClientes" ADD CONSTRAINT "CoordinacionClientes_id_coordinacion_fkey" FOREIGN KEY ("id_coordinacion") REFERENCES "DocumentoCoordinacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinacionClientes" ADD CONSTRAINT "CoordinacionClientes_clienteId_clientes_fkey" FOREIGN KEY ("clienteId_clientes") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
