"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = __importStar(require("../config/config.json"));
const logging = config.Logging;
class Mod {
    constructor() {
        this.modName = "Jiblet's Ammo Pouch"; // Set name and version of the mod so we can log it to console later
        this.modVersion = "1.0.1";
    }
    postAkiLoad(container) {
        this.container = container;
    }
    postDBLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        this.logger.log(`[${this.modName} : ${this.modVersion}] : Mod loading`, "green");
        const jsonUtil = container.resolve("JsonUtil");
        const databaseServer = container.resolve("DatabaseServer");
        const tables = databaseServer.getTables();
        const handbook = tables.templates.handbook;
        const locales = Object.values(tables.locales.global);
        const SMALL_SICC_ID = "5d235bb686f77443f4331278";
        const itemId = "Ammo_Pouch", itemCategory = "5795f317245977243854e041", itemFleaPrice = config.price, itemPrefabPath = "AmmoPouch/item_food_mayo.bundle", itemName = "Ammo Pouch", itemShortName = "AmmoPouch", itemDescription = "A pouch for ammunition", itemTraderPrice = config.price;
        const item = jsonUtil.clone(tables.templates.items[SMALL_SICC_ID]);
        item._id = itemId;
        item._props.Prefab.path = itemPrefabPath;
        //Dooo Eeeet
        item._props.Grids = this.createGrid(container, itemId, config.InternalSize);
        //Set external size of the container:
        item._props.Width = config.ExternalSize.cellH;
        item._props.Height = config.ExternalSize.cellV;
        tables.templates.items[itemId] = item;
        tables.templates.clientItems[itemId] = item;
        // Add locales
        for (const locale of locales) {
            locale[`${itemId} Name`] = itemName;
            locale[`${itemId} ShortName`] = itemShortName;
            locale[`${itemId} Description`] = itemDescription;
        }
        handbook.Items.push({
            "Id": itemId,
            "ParentId": itemCategory,
            "Price": itemFleaPrice
        });
        //Check config and make it an armband too - note this causes clipping issues as its a real object attached to the arm.
        if (config.AllowInArmband) {
            tables.templates.items["55d7217a4bdc2d86028b456d"]._props.Slots[14]._props.filters[0].Filter.push(itemId);
        }
        const trader = tables.traders["5ac3b934156ae10c4430e83c"]; //Add to Ragman's inventory
        trader.assort.items.push({
            "_id": itemId,
            "_tpl": itemId,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "UnlimitedCount": true,
                "StackObjectsCount": 999999
            }
        });
        trader.assort.barter_scheme[itemId] = [
            [
                {
                    "count": itemTraderPrice,
                    "_tpl": "5449016a4bdc2d6f028b456f" // roubles
                }
            ]
        ];
        trader.assort.loyal_level_items[itemId] = config.trader_loyalty_level;
        this.allowIntoSecureContainers(itemId, tables.templates.items);
    }
    allowIntoSecureContainers(itemId, items) {
        const secureContainers = {
            "kappa": "5c093ca986f7740a1867ab12",
            "gamma": "5857a8bc2459772bad15db29",
            "epsilon": "59db794186f77448bc595262",
            "beta": "5857a8b324597729ab0a0e7d",
            "alpha": "544a11ac4bdc2d470e8b456a",
            "waistPouch": "5732ee6a24597719ae0c0281"
        };
        for (const secureCase in secureContainers) {
            items[secureContainers[secureCase]]
                ._props
                .Grids[0]
                ._props
                .filters[0]
                .Filter
                .push(itemId);
        }
    }
    createGrid(container, itemId, columns) {
        const grids = [];
        for (const [key, val] of Object.entries(columns)) {
            grids.push(this.generateColumn(container, itemId, `column_${key}`, val.cellH, val.cellV));
        }
        return grids;
    }
    generateColumn(container, itemId, name, cellH, cellV) {
        const hashUtil = container.resolve("HashUtil");
        const BULLET = "5485a8684bdc2da71d8b4567";
        const AMMO_BOX = "543be5cb4bdc2deb348b4568";
        return {
            "_name": name,
            "_id": hashUtil.generate(),
            "_parent": itemId,
            "_props": {
                "filters": [
                    {
                        "Filter": [BULLET, AMMO_BOX],
                        "ExcludedFilter": []
                    }
                ],
                "cellsH": cellH,
                "cellsV": cellV,
                "minCount": 0,
                "maxCount": 0,
                "maxWeight": 0,
                "isSortingTable": false
            },
            "_proto": "55d329c24bdc2d892f8b4567"
        };
    }
}
module.exports = { mod: new Mod() };
