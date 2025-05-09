// src/master-data/fincas/interfaces/verification-result.interface.ts
export interface VerificationResult {
    finca_id: number;
    documentos_completos: boolean;
    tipos_pendientes: any[];
    documentos_aprobados: any[];
}

export interface RegistrationCompletionResult {
    registroCompleto: boolean;
    camposFaltantes?: string[];
    documentosFaltantes?: string[];
    mensaje: string;
}