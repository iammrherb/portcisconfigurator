function generateIosXeConfig(config) {
    let output = '';
    
    // Basic configuration
    output += `! Generated IOS-XE Configuration for Portnox Integration\n`;
    output += `! Generation Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    output += `! \n`;
    output += `! Hostname and domain configuration\n`;
    output += `hostname ${config.hostname}\n`;
    output += `ip domain name ${config.domainName}\n`;
    output += `!\n`;
    
    // Password encryption settings
    if (config.aaa.pwdEncrypt === '1') {
        output += `! Password Encryption Settings\n`;
        output += `password encryption aes\n`;
        output += `!\n`;
    }
    
    // IBNS 2.0 logging filter
    output += `! Logging Filter for 802.1X/MAB Messages\n`;
    output += `logging discriminator NO-DOT1X facility drops AUTHMGR|MAB|DOT1X|EPM\n`;
    output += `logging buffered discriminator NO-DOT1X informational\n`;
    output += `!\n`;
    
    // AAA Configuration
    output += `! AAA Configuration\n`;
    if (config.aaa.model === '1') {
        output += `aaa new-model\n`;
    }
    
    if (config.aaa.sessionId === '1') {
        output += `aaa session-id common\n`;
    }
    
    // Authentication configuration
    switch (config.aaa.authMethod) {
        case '1':
            output += `aaa authentication login default local\n`;
            break;
        case '2':
            output += `aaa authentication login default group ${config.radius.groupName} local\n`;
            output += `aaa authentication dot1x default group ${config.radius.groupName}\n`;
            break;
        case '3':
            output += `aaa authentication login default group ${config.tacacs.groupName} local\n`;
            output += `aaa authentication dot1x default group ${config.radius.groupName}\n`;
            break;
        case '4':
            output += `aaa authentication login default group ${config.tacacs.groupName} group ${config.radius.groupName} local\n`;
            output += `aaa authentication dot1x default group ${config.radius.groupName}\n`;
            break;
    }
    
    // Authorization configuration
    switch (config.aaa.authorMethod) {
        case '2':
            output += `aaa authorization network default group ${config.radius.groupName}\n`;
            output += `aaa authorization auth-proxy default group ${config.radius.groupName}\n`;
            break;
        case '3':
            output += `aaa authorization commands 15 default group ${config.tacacs.groupName} local\n`;
            output += `aaa authorization network default group ${config.radius.groupName}\n`;
            break;
        case '4':
            output += `aaa authorization commands 15 default group ${config.tacacs.groupName} local\n`;
            output += `aaa authorization network default group ${config.radius.groupName}\n`;
            output += `aaa authorization auth-proxy default group ${config.radius.groupName}\n`;
            break;
    }
    
    // Accounting configuration
    switch (config.aaa.accountMethod) {
        case '2':
            output += `aaa accounting update newinfo periodic 1440\n`;
            output += `aaa accounting identity default start-stop group ${config.radius.groupName}\n`;
            output += `aaa accounting network default start-stop group ${config.radius.groupName}\n`;
            break;
        case '3':
            output += `aaa accounting commands 15 default start-stop group ${config.tacacs.groupName}\n`;
            break;
        case '4':
            output += `aaa accounting update newinfo periodic 1440\n`;
            output += `aaa accounting commands 15 default start-stop group ${config.tacacs.groupName}\n`;
            output += `aaa accounting identity default start-stop group ${config.radius.groupName}\n`;
            output += `aaa accounting network default start-stop group ${config.radius.groupName}\n`;
            break;
    }
    
    output += `!\n`;
    
    // ... More configuration sections would follow here
    // RADIUS server configuration, TACACS+, 802.1X, etc.
    
    return output;
}
