const configFile = LoadResourceFile(GetCurrentResourceName(), 'config.json');
const config = JSON.parse(configFile);

const tempConfig = {
    showMeInChat: false
}

const configureGOOC = () => {
    onNet("cs-chat-utils:gooc", (name, message) => {
        TriggerEvent('chat:addMessage', {
            color: config.gooc.colour,
            multiline: true,
            args: [name, message]
        })
    });
}

const configureOOC = () => {
    onNet("cs-chat-utils:ooc", (coords, name, message) => {
        const ped = GetPlayerPed(-1);
        const playerPos = GetEntityCoords(ped);

        const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], playerPos[0], playerPos[1], playerPos[2]);

        if (distance < config.ooc.distance) {
            TriggerEvent('chat:addMessage', {
                color: config.ooc.colour,
                multiline: true,
                args: [name, message]
            })
        }
    });
}

var currentMessagesInView = [];
const configureMe = () => {
    onNet("cs-chat-utils:me", (source, name, message) => {
        const otherId = GetPlayerFromServerId(source);
        const ped = GetPlayerPed(otherId);
        const self = GetPlayerPed(-1);

        const pedPos = GetEntityCoords(ped);
        const selfPos = GetEntityCoords(self);

        const distance = GetDistanceBetweenCoords(pedPos[0], pedPos[1], pedPos[2], selfPos[0], selfPos[1], selfPos[2]);
        const los = HasEntityClearLosToEntity(ped, self, 17);
        const messageId = Math.random();

        if (distance < config.me.distance && los) {
            if (tempConfig.showMeInChat) {
                TriggerEvent('chat:addMessage', {
                    color: config.me.colour,
                    multiline: true,
                    args: [name, message]
                })
            }

            var startTime = GetGameTimer();

            currentMessagesInView.push(messageId);
            const tick = setTick(() => {
                const coords = GetEntityCoords(ped);
                const camera = GetGameplayCamCoord();
                const dist = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], camera[0], camera[1], camera[2]);
                const scale =  200 / (GetGameplayCamFov() * dist);

                SetTextColour(255, 255, 255, 255);
                SetTextScale(0, scale);
                SetTextFont(0);
                SetTextDropshadow(0, 0, 0, 0, 55);
                SetTextDropShadow();
                SetTextCentre(true);

                BeginTextCommandDisplayText("STRING");
                AddTextComponentSubstringPlayerName(message);
                SetDrawOrigin(coords[0], coords[1], coords[2] + 1 + (currentMessagesInView.indexOf(messageId) * 0.2), 0);
                EndTextCommandDisplayText(0, 0, 0);
                ClearDrawOrigin();
                
                var delay = message.length * config.me.msPerCharacter;
                if (delay < config.me.minMs) delay = config.me.minMs;
                if (GetGameTimer() > (startTime + (delay))) {
                    currentMessagesInView.splice(currentMessagesInView.indexOf(messageId), 1);
                    clearTick(tick);
                }
            })
        }
    });

    onNet("cs-chat-utils:toggleMe", () => {
        tempConfig.showMeInChat = !tempConfig.showMeInChat;

        TriggerEvent('chat:addMessage', {
            color: config.me.colour,
            multiline: false,
            args: ['System', tempConfig.showMeInChat ? '/me Messages will now be shown in chat.' : '/me Messages will not be shown in chat.']
        })
    });
}

const configureDW = () => {
    onNet("cs-chat-utils:dw", (name, message) => {
        TriggerEvent('chat:addMessage', {
            color: config.dw.colour,
            multiline: false,
            args: [name, message]
        })
    });
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