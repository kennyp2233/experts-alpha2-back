// src/master-data/fincas/interfaces/finca.interface.ts
export interface Finca {
    id: number;
    nombre_finca: string;
    tag?: string;
    ruc_finca?: string;
    tipo_documento: string;
    genera_guias_certificadas?: boolean;
    i_general_telefono?: string;
    i_general_email?: string;
    i_general_ciudad?: string;
    i_general_provincia?: string;
    i_general_pais?: string;
    i_general_cod_sesa?: string;
    i_general_cod_pais?: string;
    a_nombre?: string;
    a_codigo?: string;
    a_direccion?: string;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
