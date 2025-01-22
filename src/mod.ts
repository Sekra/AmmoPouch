import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { CustomItemService } from "@spt/services/mod/CustomItemService";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";

import * as config from "../config/config.json";

const secureContainers = 
		{
            "kappa": "5c093ca986f7740a1867ab12",
            "gamma": "5857a8bc2459772bad15db29",
            "gamma_tue":"665ee77ccf2d642e98220bca",
            "epsilon": "59db794186f77448bc595262",
            "beta": "5857a8b324597729ab0a0e7d",
            "alpha": "544a11ac4bdc2d470e8b456a",
            "waistPouch": "5732ee6a24597719ae0c0281"
        };

class Mod implements IPostSptLoadMod, IPostDBLoadMod 
{
    //SPT 3.10.5
    public postDBLoad(container: DependencyContainer): void
    {
        const customItem = container.resolve<CustomItemService>("CustomItemService");
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables = databaseServer.getTables();
    
        const itemId = "6790de898f9f499b32c33a54";

        const ammoPouch: NewItemFromCloneDetails = {
            itemTplToClone: "5d235bb686f77443f4331278",
            overrideProperties: {
                Name: "Ammo Pouch",
                ShortName: "AmmoPouch",
                Description: "A small pouch for ammunition.",
                PreFab: {
                    "path": "AmmoPouch/item_food_mayo.bundle",
                    "rcid": ""
                },
                Grids: [
                    {
                        "_name": "main",
                        "_id": "5d235bb686f77443f433127a",
                        "_parent": itemId,
                        "_props": {
                            "filters": [
                                {
                                    "Filter": [
                                        "5485a8684bdc2da71d8b4567",
                                        "543be5cb4bdc2deb348b4568"
                                    ],
                                    "ExcludedFilter": []
                                }
                            ],
                            "cellsH": config.InternalSize.cellH,
                            "cellsV": config.InternalSize.cellV,
                            "minCount": 0,
                            "maxCount": 0,
                            "maxWeight": 0,
                            "isSortingTable": false
                        },
                        "_proto": "55d329c24bdc2d892f8b4567"
                    }
                ],
                Height: config.ExternalSize.cellH,
                Width: config.ExternalSize.cellV
            },
            parentId: "5795f317245977243854e041",
            newId: itemId,
            fleaPriceRoubles: config.price,
            handbookPriceRoubles: config.price,
            handbookParentId: "5b5f6fa186f77409407a7eb7",
            locales: {
                en: {
                    name: "Ammo Pouch",
                    shortName: "AmmoPouch",
                    description: "A small pouch for ammunition."
                }
            }

        };

        customItem.createItemFromClone(ammoPouch);

        const traders = tables.traders["5ac3b934156ae10c4430e83c"];  //add to Ragman

        traders.assort.items.push({
            "_id": itemId,
            "_tpl": itemId,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd":
            {
                "UnlimitedCount": true,
                "StackObjectsCount": 99999
            }
        });
        traders.assort.barter_scheme[itemId] = [
            [
                {
                    "count": config.price,
                    "_tpl": "5449016a4bdc2d6f028b456f" // toubles
                }
            ]
        ];
        traders.assort.loyal_level_items[itemId] = config.trader_loyalty_level;

        this.allowAPIntoContainers(itemId, tables.templates.items, secureContainers);
        this.allowAPIntoContainers(itemId, tables.templates.items, config.containers);
    }
    allowAPIntoContainers(itemId, items, containers): void 
    {
        let currentCase = null;

        try 
        {
            for (const secureCase in containers) 
            {                
                currentCase = secureCase;
                items[containers[secureCase]]
                    ._props
                    .Grids[0]
                    ._props
                    .filters[0]
                    .Filter
                    .push(itemId)
            }
        }
        catch (error) 
        {
            // In case a mod that changes the containers does remove the 'Filter' from filters array
            items[containers[currentCase]]
                ._props
                .Grids[0]
                ._props
                .filters
                .push(
                    {"Filter": [itemId]}
                );
                
        }
    }

    public postSptLoad(container: DependencyContainer): void 
    {
        const db = container.resolve<DatabaseServer>("DatabaseServer");
        const item = db.getTables().templates.items;

        if (item["6790de898f9f499b32c33a54"]._props !== null) 
        {
            console.log("Ammo Pouch has loaded.")
        }
        else 
        {
            console.log("Ammo Pouch hasn't loaded.")
        }
    }
}

export const mod = new Mod();

    /*
    //SPT 3.9.8
    container: DependencyContainer;

    public postSptLoad(container: DependencyContainer): void 
	{
        this.container = container;
    }

    public postDBLoad(container: DependencyContainer): void 
	{
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables = databaseServer.getTables();
        const handbook = tables.templates.handbook;
        const locales = Object.values(tables.locales.global) as Record<string, string>[];

        const SMALL_SICC_ID = "5d235bb686f77443f4331278";

        const itemId = "Ammo_Pouch",
            itemCategory = "5795f317245977243854e041",
            itemFleaPrice = config.price,
            itemPrefabPath = "AmmoPouch/item_food_mayo.bundle",
            itemName = "Ammo Pouch",
            itemShortName = "AmmoPouch",
            itemDescription = "A pouch for ammunition",
            itemTraderPrice = config.price;

        const item = jsonUtil.clone(tables.templates.items[SMALL_SICC_ID]);

        item._id = itemId;
        item._props.Prefab.path = itemPrefabPath;
        item._props.Grids = this.createGrid(container, itemId, config.InternalSize);

        //Set external size of the container:
        item._props.Width = config.ExternalSize.cellH;
        item._props.Height = config.ExternalSize.cellV;

        tables.templates.items[itemId] = item;
        
        // Add locales
        for (const locale of locales) {
            locale[`${itemId} Name`] = itemName;
            locale[`${itemId} ShortName`] = itemShortName;
            locale[`${itemId} Description`] = itemDescription;
        }

        handbook.Items.push(
            {
                "Id": itemId,
                "ParentId": itemCategory,
                "Price": itemFleaPrice
            }
        );

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
            "upd":
            {
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

        this.allowAmmoPouchIntoContainers(itemId, tables.templates.items, secureContainers);
        this.allowAmmoPouchIntoContainers(itemId, tables.templates.items, config.containers);
    }

    allowAmmoPouchIntoContainers(itemId, items, containers): void 
    {
        let currentCase = null;

        try 
        {
            for (const secureCase in containers) 
            {                
                currentCase = secureCase;
                items[containers[secureCase]]
                    ._props
                    .Grids[0]
                    ._props
                    .filters[0]
                    .Filter
                    .push(itemId)
            }
        }
        catch (error) 
        {
            // In case a mod that changes the containers does remove the 'Filter' from filters array
            items[containers[currentCase]]
                ._props
                .Grids[0]
                ._props
                .filters
                .push(
                    {"Filter": [itemId]}
                );
                
        }
    }

    createGrid(container, itemId, columns) 
	{
        const grids = [];

        for (const [key, val] of Object.entries(columns)) 
		{
            grids.push(this.generateColumn(container, itemId, `column_${key}`, val.cellH, val.cellV));
        }

        return grids;
    }

    generateColumn(container: DependencyContainer, itemId, name, cellH, cellV) {
        const hashUtil = container.resolve<HashUtil>("HashUtil");
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
    */
