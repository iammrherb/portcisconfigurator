function generateBaseConfig(config) {
    let output = `! Dot1Xer Supreme Configuration\n`;
    output += `! Generated: ${new Date().toLocaleString()}\n\n`;
    output += `hostname ${config.hostname}\n`;
    output += `domain name ${config.domainName}\n`;
    return output;
}
