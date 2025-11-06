import { fileURLToPath } from 'node:url';
import path from 'path';


export const connDBConfig =  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: 3406,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '17012023',
    database: process.env.DB_NAME || 'monitoramentoLPR'
  };

  ////////          NO VPN É 10.8.0.1     OKKKKKKKKKKKKKKKK

export const clientFTPConfig = {
            host: "192.168.10.237",
            port: 2120,
            user: "admin",
            password: "wni",
            secure: false // true se usar FTPS
        }

export const clientFTP_logEnable = {enable: false};

export const urlFTP = "ftp://0.0.0.0:2121";
export const pasvFTP = '10.8.0.1';
export const pasv_min = 44000;
export const pasv_max = 49000;

export const HTTP_PORT = 5000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//const disco = path.join(__dirname, '..', '..', '..', '..', '..', '/media/wni/Disco3\ 6TB');
//const disco = '/mnt/mnthd1';
export const imgFTP_path = path.join(__dirname, '..', 'assets');


/*console.log(fileName)

fs.writeFile(fileName, 'Hello World', (err) => {
    if (err) {
        console.error('Erro ao criar o arquivo:', err);
        return;
    }
    console.log(`Arquivo "${fileName}" criado com sucesso!`);
});
*/
