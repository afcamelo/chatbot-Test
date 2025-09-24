// Função para obter e exibir informações do sistema
function getSystemInfo() {
    const userAgent = navigator.userAgent;

    // Detectar navegador
    let browserInfo = 'Desconhecido';
    if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) {
        const chromeVersion = userAgent.match(/Chrome\/(\d+)/);
        browserInfo = `Chrome ${chromeVersion ? chromeVersion[1] : ''}`;
    } else if (userAgent.indexOf('Firefox') !== -1) {
        const firefoxVersion = userAgent.match(/Firefox\/(\d+)/);
        browserInfo = `Firefox ${firefoxVersion ? firefoxVersion[1] : ''}`;
    } else if (userAgent.indexOf('Safari') !== -1) {
        const safariVersion = userAgent.match(/Version\/(\d+)/);
        browserInfo = `Safari ${safariVersion ? safariVersion[1] : ''}`;
    }
    document.getElementById('browser').textContent = browserInfo;

    // Detectar sistema operacional
    let os = 'Desconhecido';
    if (userAgent.indexOf('Win') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    else if (userAgent.indexOf('iOS') !== -1) os = 'iOS';
    document.getElementById('os').textContent = os;

    // Obter idioma
    document.getElementById('language').textContent = navigator.language || navigator.userLanguage;

    // Obter resolução
    document.getElementById('resolution').textContent = `${window.screen.width}x${window.screen.height}`;

    // Obter data e hora
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleString('pt-BR');
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('btnClick');
    
    // Executar imediatamente
    getSystemInfo();
    
    // Atualizar quando o botão for clicado
    button.addEventListener('click', getSystemInfo);
});

    // Detectar se é mobile ou desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
        deviceType = 'mobile';
        
        // Detectar sistema operacional mobile
        if (/iPhone|iPad|iPod/i.test(userAgent)) {
            operatingSystem = 'iOS';
        } else if (/Android/i.test(userAgent)) {
            operatingSystem = 'Android';
        } else {
            operatingSystem = 'Other Mobile';
        }
    } else {
        deviceType = 'desktop';
        
        // Detectar sistema operacional desktop
        if (userAgent.indexOf('Win') !== -1) {
            operatingSystem = 'Windows';
        } else if (userAgent.indexOf('Mac') !== -1) {
            operatingSystem = 'macOS';
        } else if (userAgent.indexOf('Linux') !== -1) {
            operatingSystem = 'Linux';
        } else {
            operatingSystem = 'Other';
        }
    }

    // Detectar navegador
    if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) {
        browser = 'Chrome';
        const chromeVersion = userAgent.match(/Chrome\/(\d+)/);
        browserVersion = chromeVersion ? chromeVersion[1] : 'Unknown';
    } else if (userAgent.indexOf('Firefox') !== -1) {
        browser = 'Firefox';
        const firefoxVersion = userAgent.match(/Firefox\/(\d+)/);
        browserVersion = firefoxVersion ? firefoxVersion[1] : 'Unknown';
    } else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
        browser = 'Safari';
        const safariVersion = userAgent.match(/Version\/(\d+)/);
        browserVersion = safariVersion ? safariVersion[1] : 'Unknown';
    } else if (userAgent.indexOf('Edg') !== -1) {
        browser = 'Edge';
        const edgeVersion = userAgent.match(/Edg\/(\d+)/);
        browserVersion = edgeVersion ? edgeVersion[1] : 'Unknown';
    } else {
        browser = 'Other';
        browserVersion = 'Unknown';
    }

    // Criar descrição completa
    deviceDescription = `${deviceType} - ${operatingSystem} - ${browser} ${browserVersion}`;


// Função para inicializar o Watson Assistant
function initializeWatsonAssistant() {
    // Detectar informações do dispositivo
    detectDeviceInfo();
    
    window.watsonAssistantChatOptions = {
        integrationID: "3d72eb26-aae0-4968-a7f1-d6ed8a771253",
        region: "au-syd",
        serviceInstanceID: "06cae0f0-b964-4f1f-9c8b-78a25030e1c4",
        onLoad: async (instance) => {
            // Configurar as variáveis de contexto com as informações do dispositivo
            await instance.on({
                type: 'pre:send',
                handler: function(event) {
                    const context = event.data.context.skills['main skill'].user_defined;
                    
                    // Definir as variáveis de contexto separadamente
                    context.channel = 'webchat';
                    context.device_type = deviceType;
                    context.operating_system = operatingSystem;
                    context.browser = browser;
                    context.browser_version = browserVersion;
                    context.device_description = deviceDescription;
                }
            });

            // Enviar informações do dispositivo logo após o carregamento
            await instance.on({
                type: 'receive',
                handler: function(event) {
                    // Se for a primeira mensagem, enviar as informações do dispositivo
                    if (event.data.output && event.data.output.generic) {
                        const hasWelcome = event.data.output.generic.some(item => 
                            item.response_type === 'text' && 
                            item.text && 
                            item.text.toLowerCase().includes('olá')
                        );
                        
                        if (hasWelcome) {
                            // Enviar informações do dispositivo automaticamente
                            setTimeout(() => {
                                instance.send({
                                    input: {
                                        message_type: 'text',
                                        text: 'DEVICE_INFO_READY'
                                    }
                                });
                            }, 1000);
                        }
                    }
                }
            });

            await instance.render();
        }
    };

    // Log das informações detectadas para debug
    console.log('Informações do dispositivo detectadas:');
    console.log('Tipo de dispositivo:', deviceType);
    console.log('Sistema operacional:', operatingSystem);
    console.log('Navegador:', browser);
    console.log('Versão do navegador:', browserVersion);
    console.log('Descrição completa:', deviceDescription);
}

// Função para mostrar o chatbot quando os testes falharem
function showChatbotForFailedTests(failedTests = []) {
    // Verificar se o Watson Assistant já foi inicializado
    if (!window.watsonAssistantChatOptions) {
        initializeWatsonAssistant();
    }

    // Aguardar um pouco para garantir que o Watson foi carregado
    setTimeout(() => {
        // Abrir o chatbot
        if (window.watsonAssistantChat) {
            window.watsonAssistantChat.open();
            
            // Enviar informações sobre os testes que falharam
            if (failedTests.length > 0) {
                setTimeout(() => {
                    const failedTestsText = failedTests.join(', ');
                    window.watsonAssistantChat.send({
                        input: {
                            message_type: 'text',
                            text: `Testes falharam: ${failedTestsText}`
                        }
                    });
                }, 2000);
            }
        }
    }, 1000);
}

// Exemplo de uso - chamada quando os testes falham
function onTestFailure(testResults) {
    const failedTests = [];
    
    if (!testResults.microphone) failedTests.push('microfone');
    if (!testResults.camera) failedTests.push('câmera');
    if (!testResults.internet) failedTests.push('internet');
    
    if (failedTests.length > 0) {
        showChatbotForFailedTests(failedTests);
    }
}

// Inicializar o Watson Assistant quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeWatsonAssistant();
    
    // Carregar o script do Watson Assistant
    const script = document.createElement('script');
    script.src = 'https://web-chat.global.assistant.watson.appdomain.cloud/versions/latest/WatsonAssistantChatEntry.js';
    document.head.appendChild(script);
});

// Exemplo de simulação de teste que você pode adaptar
function simulateTestResults() {
    // Esta é apenas uma simulação - substitua pela sua lógica real de testes
    const testResults = {
        microphone: Math.random() > 0.5, // 50% chance de falhar
        camera: Math.random() > 0.3,     // 30% chance de falhar
        internet: Math.random() > 0.1    // 10% chance de falhar
    };
    
    onTestFailure(testResults);
}

// Expor funções globalmente para uso
window.showChatbotForFailedTests = showChatbotForFailedTests;
window.onTestFailure = onTestFailure;