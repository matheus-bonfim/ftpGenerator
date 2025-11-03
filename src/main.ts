import { QMainWindow, QWidget, QLabel, QPushButton, QIcon, QBoxLayout, Direction, QLineEdit } from '@nodegui/nodegui';
import * as path from "node:path";
import sourceMapSupport from 'source-map-support';
import { genPassages, stopRun } from '../functions/genPassages.js';

sourceMapSupport.install();


function main(): void {
  const win = new QMainWindow();
  win.setWindowTitle("Simulador Tráfego passagens LPR");

  const centralWidget = new QWidget();
  const rootLayout = new QBoxLayout(Direction.TopToBottom);
  centralWidget.setObjectName("myroot");
  centralWidget.setLayout(rootLayout);

  // --- Linha 1: IP de Destino ---
  const ipContainer = new QWidget();
  const ipLayout = new QBoxLayout(Direction.LeftToRight);
  ipContainer.setLayout(ipLayout);
  
  const ipLabel = new QLabel();
  ipLabel.setText("IP de destino:");
  ipLabel.setObjectName("input-label");

  const ipInput = new QLineEdit();
  ipInput.setObjectName("myinput");
  ipInput.setPlaceholderText("Ex: 192.168.0.1");

  const portLabel = new QLabel();
  portLabel.setText("Porta:");
  portLabel.setObjectName("inputport-label");

  const portInput = new QLineEdit();
  portInput.setObjectName("inputPort");
  portInput.setPlaceholderText("Ex: 2121");
  
  ipLayout.addWidget(ipLabel);
  ipLayout.addWidget(ipInput);
  ipLayout.addWidget(portLabel);
  ipLayout.addWidget(portInput);

  
  // --- Linha 2: Passagens por Segundo ---
  const passagensContainer = new QWidget();
  const passagensLayout = new QBoxLayout(Direction.LeftToRight);
  passagensContainer.setLayout(passagensLayout);
  
  const passagensLabel = new QLabel();
  passagensLabel.setText("Passagens por segundo:");
  passagensLabel.setObjectName("input-label");
  
  const passagensInput = new QLineEdit();
  passagensInput.setObjectName("myinput");
  passagensInput.setPlaceholderText("Ex: 2");
  
  passagensLayout.addWidget(passagensLabel);
  passagensLayout.addWidget(passagensInput);

  // --- Linha 3: Duração ---
  const duracaoContainer = new QWidget();
  const duracaoLayout = new QBoxLayout(Direction.LeftToRight);
  duracaoContainer.setLayout(duracaoLayout);
  
  const duracaoLabel = new QLabel();
  duracaoLabel.setText("Duração (segundos):");
  duracaoLabel.setObjectName("input-label");
  
  const duracaoInput = new QLineEdit();
  duracaoInput.setObjectName("myinput");
  duracaoInput.setPlaceholderText("Ex: 60");
  
  duracaoLayout.addWidget(duracaoLabel);
  duracaoLayout.addWidget(duracaoInput);

  // --- Console de Saída ---
  const consoleContainer = new QWidget();
  const consoleLayout = new QBoxLayout(Direction.LeftToRight);
  consoleContainer.setLayout(consoleLayout);
  
  const consoleMessage = new QLabel();
  consoleMessage.setText("Aguardando envio...");
  consoleMessage.setObjectName("console");

  consoleLayout.addWidget(consoleMessage); 

  // --- Botões de Controle ---
  const startButton = new QPushButton();
  startButton.setText("Iniciar Envio");
  startButton.setObjectName("startButton"); 

  const stopButton = new QPushButton();
  stopButton.setText("Parar Envio");
  stopButton.setObjectName("stopButton"); 
  stopButton.setEnabled(false); 

  // --- Callbacks ---

  // Callback para reabilitar botões quando o genPassages terminar
  const onProcessFinish = () => {
    // Verifica se a parada foi manual ou por tempo
    const currentText = consoleMessage.text();
    if (currentText.startsWith("Solicitando parada")) {
        consoleMessage.setText("Envio interrompido pelo usuário.");
    } else {
        consoleMessage.setText("Processo concluído (tempo esgotado).");
    }
    
    startButton.setEnabled(true);
    stopButton.setEnabled(false);
  };

  // NOVO: Callback para atualizar o console da GUI em tempo real
  const onStatusUpdate = (message: string) => {
    consoleMessage.setText(message);
  };
  
  // Evento para INICIAR
  startButton.addEventListener('clicked', () => {
    const ipDestino = ipInput.text();
    const port = portInput.text();
    const passagensStr = passagensInput.text();
    const duracaoStr = duracaoInput.text();


    if (!ipDestino || !passagensStr || !duracaoStr) {
      consoleMessage.setText("Erro: Preencha todos os campos.");
      return;
    }

    const pps = parseInt(passagensStr, 10);
    const duracao = parseInt(duracaoStr, 10);

    if (isNaN(pps) || isNaN(duracao) || pps <= 0 || duracao <= 0) {
      consoleMessage.setText("Erro: Passagens e duração devem ser números válidos.");
      return;
    }
    
    consoleMessage.setText(`Iniciando envio para: ${ipDestino} (${pps}/s por ${duracao}s)`);
    startButton.setEnabled(false);
    stopButton.setEnabled(true);

    // ALTERADO: Passa o novo callback 'onStatusUpdate'
    genPassages(ipDestino, port, pps, duracao, onProcessFinish, onStatusUpdate);
  });
  
  // Evento para PARAR
  stopButton.addEventListener('clicked', () => {
    // ALTERADO: Mensagem mais clara
    consoleMessage.setText("Solicitando parada... Aguarde o envio atual.");
    stopButton.setEnabled(false); 
    
    stopRun(); 
  });
  
  // Adicionar tudo ao layout principal
  rootLayout.addWidget(ipContainer);
  rootLayout.addWidget(passagensContainer);
  rootLayout.addWidget(duracaoContainer); 
  rootLayout.addWidget(startButton);
  rootLayout.addWidget(stopButton);
  rootLayout.addWidget(consoleContainer); 

  win.setCentralWidget(centralWidget);
  win.setStyleSheet(
  `
    #myroot {
      background-color: #ECECEC;
      padding: 10px;
      align-items: 'center';
    }
    #input-label {
      font-size: 16px;
      padding-right: 10px;
    }
    QLineEdit#myinput {
      font-size: 16px;
      padding: 5px;
      border-radius: 5px;
      min-width: 200px;
    }
    QPushButton {
      font-size: 16px;
      padding: 8px;
      color: white;
      border-radius: 5px;
      margin-top: 10px;
    }
    QPushButton#startButton {
      background-color: #009688; /* Verde */
    }
    QPushButton#startButton:hover {
      background-color: #00796B;
    }
    QPushButton#startButton:disabled {
      background-color: #BDBDBD;
    }
    QPushButton#stopButton {
      background-color: #D32F2F; /* Vermelho */
    }
    QPushButton#stopButton:hover {
      background-color: #C62828;
    }
    QPushButton#stopButton:disabled {
      background-color: #BDBDBD;
    }
    #console {
      font-size: 14px;
      color: #333;
      background-color: #FFF;
      padding: 8px;
      border-radius: 5px;
      min-height: 30px;
      margin-top: 10px;
    }
  `
  );
  
  win.resize(500, 340); 
  win.show();

  (global as any).win = win;
}
main();