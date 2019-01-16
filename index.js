const mqtt = require("mqtt");

let Service;
let Characteristic;
let Accessory;
let UUIDGen;

module.exports = homebridge => {
    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform(
        "homebridge-homie",
        "HomiePlatform",
        HomiePlatform,
        true
    );
};

class HomiePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.accessories = [];

        if (!config) {
            log.warn(
                "Ignoring Homie Platform setup because it is not properly configured"
            );
            this.disabled = true;
            return;
        }
        this.config = config;
        this.url = `mqtt://${config.host}:${config.post}`;

        const options = {
            clientId: "homebridge-homie"
        };
        this.mqtt = mqtt.connect(
            this.url,
            options
        );

        this.mqtt.on("connect", () => this.onMqttConnect());
        this.mqtt.on("message", (topic, payload) =>
            this.onMqttMessage(topic, payload)
        );

        if (api) {
            this.api = api;
            this.api.on("didFinishLaunching", () => {
                this.log("DidFinishLaunching");
            });
        }
    }

    configureAccessory(accessory) {
        this.log(accessory.displayName, "Configure Accessory");

        this.accessories.push(accessory);
    }

    addAccessory(accessoryName) {
        const uuid = UUIDGen.generate(accessoryName);
        const accessory = new Accessory(accessoryName, uuid);

        this.api.registerPlatformAccessories(
            "homebridge-homie",
            "HomiePlatform",
            [accessory]
        );
    }

    removeAccessory() {}

    onMqttConnect() {
        this.log.debug(`Connected to mqtt broker on ${this.url}`);
    }

    onMqttMessage(topic, payload) {
        this.log.debug("%s, %s", topic.toString(), payload);
    }
}
