// Main Vue application
const { createApp, ref, computed, reactive } = Vue;

const app = createApp({
    data() {
        return {
            currentStep: 'platform',
            config: reactive({
                platform: '',
                hostname: '',
                domainName: '',
                aaa: {
                    model: '1',
                    authMethod: '2',
                    authorMethod: '2',
                    accountMethod: '2',
                    sessionId: '1',
                    pwdEncrypt: '1'
                },
                radius: {
                    type: '1',
                    primaryIp: '',
                    primaryAuthPort: '1812',
                    primaryAcctPort: '1813',
                    primarySecret: '',
                    secondary: false,
                    secondaryIp: '',
                    secondaryAuthPort: '1812',
                    secondaryAcctPort: '1813',
                    secondarySecret: '',
                    groupName: 'RADIUS-SERVERS',
                    monitoring: '1',
                    testUser: '',
                    idleTime: '5',
                    deadtime: '15'
                },
                tacacs: {
                    enable: false,
                    primaryIp: '',
                    primaryPort: '49',
                    primarySecret: '',
                    secondary: false,
                    secondaryIp: '',
                    secondaryPort: '49',
                    secondarySecret: '',
                    groupName: 'TACACS-SERVERS',
                    singleConn: '1',
                    cmdAuth: '1',
                    maxPriv: '15'
                },
                dot1x: {
                    enable: '1',
                    criticalEapol: '1',
                    recoveryDelay: '2000',
                    authOrder: '1',
                    hostMode: '3',
                    vlanAssign: '1',
                    guestVlan: '',
                    authFailVlan: '',
                    criticalVlan: '',
                    txPeriod: '10',
                    maxReauth: '2'
                },
                coa: {
                    enable: '1',
                    clientIp: '',
                    serverKey: '',
                    port: '1700'
                },
                radsec: {
                    certOption: '1',
                    trustpoint: 'PORTNOX-CA'
                },
                deviceTracking: {
                    enable: '1',
                    mode: '1',
                    accessPolicy: '1',
                    accessName: 'IP-TRACKING',
                    addrLimit: '4',
                    lifetime: '30',
                    trunkPolicy: '1',
                    trunkName: 'DISABLE-IP-TRACKING',
                    ipSourceGuard: '1',
                    dhcpSnoopAll: '1',
                    dhcpSnoopVlans: '1-4094'
                },
                ibns: {
                    mode: '1',
                    policyMapName: 'DOT1X_MAB_POLICY',
                    templates: '1',
                    openTemplate: '1',
                    openTemplateName: 'WIRED_DOT1X_OPEN',
                    closedTemplate: '1',
                    closedTemplateName: 'WIRED_DOT1X_CLOSED'
                },
                portnox: {
                    enable: '1',
                    region: '3',
                    secret: '',
                    sameSecret: '1',
                    secondarySecret: '',
                    radsec: '1'
                }
            }),
            generatedConfig: '',
            steps: [
                'platform', 'basicInfo', 'aaa', 'radius', 'tacacs', 
                'dot1x', 'coa', 'radsec', 'deviceTracking', 'ibns', 'portnox'
            ]
        };
    },
    computed: {
        progress() {
            const currentIndex = this.steps.indexOf(this.currentStep);
            return Math.round((currentIndex + 1) / this.steps.length * 100);
        }
    },
    methods: {
        updateConfig(newConfig) {
            Object.assign(this.config, newConfig);
        },
        nextStep() {
            const currentIndex = this.steps.indexOf(this.currentStep);
            if (currentIndex < this.steps.length - 1) {
                // Skip IBNS step for NX-OS
                if (this.config.platform === 'NX-OS' && this.steps[currentIndex + 1] === 'ibns') {
                    this.currentStep = this.steps[currentIndex + 2];
                } else if (this.config.radius.type !== '2' && this.steps[currentIndex + 1] === 'radsec') {
                    // Skip RADSEC if not using RADIUS over TLS
                    this.currentStep = this.steps[currentIndex + 2];
                } else {
                    this.currentStep = this.steps[currentIndex + 1];
                }
            }
        },
        generateConfig() {
            if (this.config.platform === 'IOS-XE') {
                this.generatedConfig = generateIosXeConfig(this.config);
            } else if (this.config.platform === 'NX-OS') {
                this.generatedConfig = generateNxOsConfig(this.config);
            }
        },
        copyToClipboard() {
            navigator.clipboard.writeText(this.generatedConfig)
                .then(() => {
                    alert('Configuration copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        },
        downloadConfiguration() {
            const element = document.createElement('a');
            const file = new Blob([this.generatedConfig], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = `${this.config.hostname || 'cisco'}-config.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },
        saveConfiguration() {
            const configName = prompt('Enter a name for this configuration:');
            if (configName) {
                const savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '{}');
                savedConfigs[configName] = this.config;
                localStorage.setItem('savedConfigs', JSON.stringify(savedConfigs));
                alert(`Configuration "${configName}" saved successfully!`);
            }
        },
        loadConfiguration() {
            const savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '{}');
            const configNames = Object.keys(savedConfigs);
            
            if (configNames.length === 0) {
                alert('No saved configurations found.');
                return;
            }
            
            const configName = prompt(`Enter the name of the configuration to load (${configNames.join(', ')}):`);
            if (configName && savedConfigs[configName]) {
                Object.assign(this.config, savedConfigs[configName]);
                alert(`Configuration "${configName}" loaded successfully!`);
            } else {
                alert('Configuration not found.');
            }
        }
    }
});

// Register the components
// These are defined in the component JS files

// Mount the app
app.mount('#app');

// Register service worker for offline capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered');
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
