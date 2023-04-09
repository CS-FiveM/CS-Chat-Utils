const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

const tempConfig = {};

const generateNameString = (id, useCustomName) => {
    var name = GetPlayerName(id);
    var department = "";

    if (useCustomName) {
        if (tempConfig[id]) {
            if (tempConfig[id].department) {
                department = tempConfig[id].department;
            }
            if (tempConfig[id].name) {
                name = tempConfig[id].name
            }
        }
    }

    var output = "";
    if (department) {
        output += `[${department}] `;
    }
    output += name;
    return output;
}

RegisterCommand('department', (source, args) => {
    if (tempConfig[source]) {
        tempConfig[source].department = args.join(" ");
    } else {
        tempConfig[source] = {
            department: args.join(" ")
        }
    }
}, false);
TriggerClientEvent('chat:addSuggestion', -1, "/department", 'Set your department, i.e: "BCSD", or "SAFR".', [
    { name: 'Department' }
]);

RegisterCommand('name', (source, args) => {
    if (tempConfig[source]) {
        tempConfig[source].name = args.join(" ");
    } else {
        tempConfig[source] = {
            name: args.join(" ")
        }
    }
}, false);
TriggerClientEvent('chat:addSuggestion', -1, "/name", 'Set your name, i.e: "J. Pitt", or "P. Drake".', [
    { name: 'Name' }
]);

RegisterCommand('clear', (source, args) => {
    emitNet('chat:clear', source);
});
TriggerClientEvent('chat:removeSuggestion', -1, "/clear");

const configureGOOC = () => {
    const command = config.gooc;
    RegisterCommand(command.command, (source, args) => {
        const message = args.join(" ");
        const name = generateNameString(source, config.gooc.useCustomName);
        emitNet('cs-chat-utils:gooc', -1, name, message);
    }, false);
    TriggerClientEvent('chat:addSuggestion', -1, `/${command.command}`, 'Send a global Out of Character message', [
        { name: 'message' }
    ]);

    if (command.gooca) {
        RegisterCommand(command.command + "a", (source, args) => {
            const message = args.join(" ");
            emitNet('cs-chat-utils:gooc', -1, "Anonymous", message);
        }, false);
        TriggerClientEvent('chat:addSuggestion', -1, `/${command.command}a`, 'Send an anonymous global Out of Character message', [
            { name: 'message' }
        ]);
    }
}

const configureOOC = () => {
    const command = config.ooc;
    RegisterCommand(command.command, (source, args) => {
        const message = args.join(" ");
        const name = generateNameString(source, config.ooc.useCustomName);
        const ped = GetPlayerPed(source);
        const coords = GetEntityCoords(ped);
        emitNet('cs-chat-utils:ooc', -1, coords, name, message);
    }, false);

    TriggerClientEvent('chat:addSuggestion', -1, `/${command.command}`, 'Send a local Out of Character message', [
        { name: 'message' }
    ]);

    if (command.ooca) {
        RegisterCommand(command.command + "a", (source, args) => {
            const message = args.join(" ");
            const ped = GetPlayerPed(source);
            const coords = GetEntityCoords(ped);
            emitNet('cs-chat-utils:ooc', -1, coords, "Anonymous", message);
        }, false);
        TriggerClientEvent('chat:addSuggestion', -1, `/${command.command}a`, 'Send an anonymous Out of Character message', [
            { name: 'message' }
        ]);
    }
}

const configureMe = () => {
    const command = config.me;
    RegisterCommand(command.command, (source, args) => {
        if (args.length !== 0) {
            const message = args.join(" ");
            const name = generateNameString(source, config.ooc.useCustomName);
            emitNet('cs-chat-utils:me', -1, source, name, message);
        } else {
            emitNet('cs-chat-utils:toggleMe', source);
        }
    }, false);

    TriggerClientEvent('chat:addSuggestion', -1, `/${command.command}`, 'Send a local "me".', [
        { name: 'message' }
    ]);
}

const configureDW = () => {
    const command = config.dw;
    RegisterCommand(command.command, (source, args) => {
        emitNet('cs-chat-utils:dw', -1, 'Anonymous', args.join(" "));
    }, false);

    TriggerClientEvent('chat:addSuggestion', -1, `/${command.command}`, 'Send a message to the darkweb.', [
        { name: 'message' }
    ]);
}

if (config.gooc && config.gooc.enabled) {
    configureGOOC();
}

if (config.ooc && config.ooc.enabled) {
    configureOOC();
}

if (config.me && config.me.enabled) {
    configureMe();
}

if (config.dw && config.dw.enabled) {
    configureDW();
}

if (config.plainChat && config.plainChat.disable) {
    AddEventHandler("chatMessage", (source, name, message) => {
        if (message[0] !== "/") {
            console.log('Rejecting Plain Text Chat - ', message);
            CancelEvent();
        }
    });
}