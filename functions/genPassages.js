import { Client } from 'basic-ftp';
import { clientFTPConfig, imgFTP_path } from './config.js';
import { clientFTP_logEnable } from './config.js';
import path from 'path';

export let run = true;
export const status = {message:''};
let conIndex = 0;

// --- FUNÇÕES DE CONTROLE ---
export function startRun() {
    run = true;
}
export function stopRun() {
    run = false;
    conIndex = 0;
    console.log("Comando de parada manual recebido.");
}

// --- LÓGICA DE ENVIO ---

/**
 * Envia um único arquivo via FTP.
 * @param {string} hostIp - O IP de destino.
 * @param {Function} onStatusUpdate - Callback para enviar mensagens de status para a GUI.
 */
export async function sendfileFTP(hostIp, porta, onStatusUpdate) { // <-- ALTERADO: Recebe o callback
    const client = new Client();
    client.ftp.verbose = clientFTP_logEnable.enable;
    const filePath = path.join(imgFTP_path, '36P2_LPR_2025_03_26_18_58_46_596_AXL7F53.jpg');

    const dynamicFTPConfig = {
        ...clientFTPConfig,
        host: hostIp,
        port: porta
    };

    try {
        let milisec = Math.floor(Math.random() * 1000);
        let sec = Math.floor(Math.random() * 60);
        const file_basename = `T1_LPR_2025_03_26_18_58_${sec}_${milisec}_TESTE00.jpg`;
        const ponto = 'T1_LPR';
        const newPathfile = path.join(ponto, file_basename);
        
        await client.access(dynamicFTPConfig);
        await client.uploadFrom(filePath, newPathfile);
        
        // NOVO: Envia a mensagem de sucesso para a GUI
        
        const c_msg = `[${conIndex}] Arquivo enviado com sucesso para ${hostIp}:${porta}!`;
        conIndex++;
        console.log(c_msg); // Mantém no console
        if (onStatusUpdate) {
            onStatusUpdate(c_msg); // Envia para a GUI
        }
        
        status.message = c_msg;
        global.numberOfPassagens++;
           
    } catch (err) {
        // NOVO: Envia a mensagem de erro para a GUI
        const errorMsg = `Erro ao enviar para ${hostIp}:${porta}: ${err.message}`;
        console.error(errorMsg); // Mantém no console
        if (onStatusUpdate) {
            onStatusUpdate(errorMsg); // Envia para a GUI
        }
        stopRun(); 
    }
    finally{
        client.close();
    }
}

/**
 * Inicia o loop de geração de passagens.
 * @param {string} ipDestino 
 * @param {number} passagesPerSecond 
 * @param {number} seconds 
 * @param {Function} onFinishCallback - Chamado quando o loop termina.
 * @param {Function} onStatusUpdateCallback - Chamado a cada atualização de status.
 */
export async function genPassages(
    ipDestino,
    porta, 
    passagesPerSecond, 
    seconds, 
    onFinishCallback,
    onStatusUpdateCallback // <-- ALTERADO: Recebe o novo callback
) {
    startRun(); 

    const timeInterval = (1 / passagesPerSecond) * 1000;
    const totalDuration = seconds * 1000;
    const startTime = Date.now();

    console.log(`Iniciando loop: ${passagesPerSecond} envios/s por ${seconds}s para ${ipDestino}:${porta}. (Intervalo de ${timeInterval}ms)`);

    async function runLoop() {
        
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= totalDuration || !run) {
            console.log("Tempo total atingido ou parada manual. Finalizando o loop.");
            if (onFinishCallback) {
                onFinishCallback();
            }
            return;
        }

        console.log("Iniciando envio...");
        try {
            // ALTERADO: Passa o callback de status para a função de envio
            await sendfileFTP(ipDestino, porta, onStatusUpdateCallback); 
        } catch (err) {
            console.error("Erro inesperado durante a execução do sendfileFTP:", err);
            
            // NOVO: Envia o erro inesperado para a GUI também
            if (onStatusUpdateCallback) {
                onStatusUpdateCallback(`Erro inesperado: ${err.message}`);
            }
            stopRun(); 
        }

        if (run) {
            setTimeout(runLoop, timeInterval);
        }
    }

    runLoop();
}