import { DataSetColumn, DataSetRecord, PcfContext } from "../types/AppProps";

type EntityMetadata = ComponentFramework.PropertyHelper.EntityMetadata;
type ColumnMetadata = ComponentFramework.PropertyHelper.FieldPropertyMetadata.Metadata;

export class GridService {
    private _context: PcfContext;
    private _entity: string;
    private _columns: DataSetColumn[];

    constructor(context: PcfContext, entity: string, columns: DataSetColumn[]) {
        this._context = context;
        this._entity = entity;
        this._columns = columns;
    }

    private getEntityMetadata = async (entity?: string): Promise<EntityMetadata> => {
        // https://learn.microsoft.com/power-apps/developer/model-driven-apps/clientapi/reference/xrm-utility/getentitymetadata
        if (!entity) {
            entity = this._entity;
        }
        return await this._context.utils.getEntityMetadata(entity);
    }

    private getColumnMetadata = async (columnName: string): Promise<ColumnMetadata> => {
        const metadata = await this.getEntityMetadata(this._entity);
        return await metadata.Attributes.get(columnName);
    }

    /**
     * Create a lookup map for OptionSet values to their corresponding labels
     * @param groupByColumn 
     * @returns 
     */
    private getOptionSetMap = async (groupByColumn: DataSetColumn): Promise<any> => {
        const options = await this.getOptionSet(groupByColumn.name);
        return options.reduce((acc: any, option: any, index: number) => {
            acc[index] = option.Label;
            return acc;
        }, {} as { [key: number]: string });
    }

    private getLookupEntityName = async (columnName: string): Promise<string> => {
        const metadata: EntityMetadata = await this._context.utils.getEntityMetadata(this._entity, [columnName]);
        const columnMetadata = await metadata.Attributes.get(columnName);
        const entity = columnMetadata.Targets[0]; 
        return entity;
    }

    public getGroupByColumn = (groupByName: string): DataSetColumn => {
        return this._columns.filter(col => col.name === groupByName)[0];
    }

    public sortByProperty = (items: DataSetRecord[], groupByColumn: string) => {
        return items.sort((a, b) => {
            if (!a || !b) return 0;
            const valueA = a.getValue(groupByColumn);
            const valueB = b.getValue(groupByColumn);

            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });
    }

    public getOptionSet = async (columnName: string, entityName?: string): Promise<any[]> => {
        let _optionSet: any[] = [];
        const entity = entityName || this._entity;
        const metadata = await this._context.utils.getEntityMetadata(entity, [columnName]);
        const columnMetadata = await metadata.Attributes.get(columnName);
        _optionSet = await columnMetadata?.attributeDescriptor.OptionSet;
        return _optionSet;
    }

    public getRelatedOptionSet = async (columnName: string): Promise<any[]> => {
        let _optionSet: any[] = [];
        const metadata = await this._context.utils.getEntityMetadata(this._entity, [columnName]);
        const columnMetadata = await metadata.Attributes.get(columnName);
        _optionSet = await columnMetadata?.attributeDescriptor.OptionSet;
        return _optionSet;
    }

    /**
     * If groupByColumn is an optionset and the option has a color return it's color; else return black
     * @param group 
     * @param groupByColumn 
     * @returns 
     */
    public getOptionColor = async (columnName: string, optionName: string): Promise<string> => {
        const optionSet = await this.getOptionSet(columnName);
        if (optionSet && optionSet.length > 0) {
            const option = optionSet.find(opt => opt.Label === optionName);
            return option ? option.Color : "black";
        }
        return "black";
    }

    /**
     * Sort groups by its optionset order
     * @param groupedItems 
     * @param groupByColumn 
     * @returns 
     */
    public sortGroupsByOptionSetOrder = async (groupedItems: { [key: string]: DataSetRecord[] }, groupByColumn: DataSetColumn) => {
        const optionSetMap = await this.getOptionSetMap(groupByColumn);
        const groupOrder = Object.values(optionSetMap);
        return Object.keys(groupedItems)
            .sort((a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
            .reduce((acc, key) => {
                acc[key] = groupedItems[key];
                return acc;
            }, {} as { [key: string]: DataSetRecord[] });
    }

    /**
     * Sort primary groups by its option set order and if the second group is an optionset sort by its order
     * @param groupedItems 
     * @param primaryGroupByColumn 
     * @param secondaryGroupByColumn 
     * @returns 
     */
    public sortGroupsByOptionSetOrderNested = async (
        groupedItems: { [key: string]: { [key: string]: DataSetRecord[] } },
        primaryGroupByColumn: DataSetColumn | undefined,
        secondaryGroupByColumn: DataSetColumn | undefined
    ) => {
        const primaryOptionSetMap = primaryGroupByColumn ? await this.getOptionSetMap(primaryGroupByColumn) : null;
        const secondaryOptionSetMap = secondaryGroupByColumn ? await this.getOptionSetMap(secondaryGroupByColumn) : null;

        const primaryGroupOrder = primaryOptionSetMap ? Object.values(primaryOptionSetMap) : undefined;
        const secondaryGroupOrder = secondaryOptionSetMap ? Object.values(secondaryOptionSetMap) : undefined;

        // Case 1: primaryGroupOrder is null, sort only secondary groups if defined
        if (!primaryGroupOrder && secondaryGroupOrder) {
            return Object.keys(groupedItems).reduce((primaryAcc, primaryKey) => {
                const secondaryGroups = groupedItems[primaryKey];
                primaryAcc[primaryKey] = Object.keys(secondaryGroups)
                    .sort((a, b) => secondaryGroupOrder.indexOf(a) - secondaryGroupOrder.indexOf(b))
                    .reduce((secondaryAcc, secondaryKey) => {
                        secondaryAcc[secondaryKey] = secondaryGroups[secondaryKey];
                        return secondaryAcc;
                    }, {} as { [secondaryKey: string]: DataSetRecord[] });
                return primaryAcc;
            }, {} as { [primaryKey: string]: { [secondaryKey: string]: DataSetRecord[] } });
        }

        // Case 2: primaryGroupOrder is defined, secondaryGroupOrder is null
        if (primaryGroupOrder && !secondaryGroupOrder) {
            return Object.keys(groupedItems)
                .sort((a, b) => primaryGroupOrder.indexOf(a) - primaryGroupOrder.indexOf(b))
                .reduce((primaryAcc, primaryKey) => {
                    primaryAcc[primaryKey] = groupedItems[primaryKey];
                    return primaryAcc;
                }, {} as { [primaryKey: string]: { [secondaryKey: string]: DataSetRecord[] } });
        }

        // Case 3: both primaryGroupOrder and secondaryGroupOrder are defined
        if (primaryGroupOrder && secondaryGroupOrder) {
            return Object.keys(groupedItems)
                .sort((a, b) => primaryGroupOrder.indexOf(a) - primaryGroupOrder.indexOf(b))
                .reduce((primaryAcc, primaryKey) => {
                    const secondaryGroups = groupedItems[primaryKey];
                    primaryAcc[primaryKey] = Object.keys(secondaryGroups)
                        .sort((a, b) => secondaryGroupOrder.indexOf(a) - secondaryGroupOrder.indexOf(b))
                        .reduce((secondaryAcc, secondaryKey) => {
                            secondaryAcc[secondaryKey] = secondaryGroups[secondaryKey];
                            return secondaryAcc;
                        }, {} as { [secondaryKey: string]: DataSetRecord[] });
                    return primaryAcc;
                }, {} as { [primaryKey: string]: { [secondaryKey: string]: DataSetRecord[] } });
        }

        // Case 4: neither primaryGroupOrder nor secondaryGroupOrder is defined, return as-is
        return groupedItems;
    }

    public searchLookup = async (columnName: string, filterText: string) => {
        const entity = await this.getLookupEntityName(columnName);
        const entityMetadata: EntityMetadata = await this._context.utils.getEntityMetadata(entity);
        const primaryIdAttribute = entityMetadata.PrimaryIdAttribute;
        const primaryNameAttribute = entityMetadata.PrimaryNameAttribute;
        const query = `?$select=${primaryIdAttribute},${primaryNameAttribute}&$filter=contains(fullname,'${filterText}') and not contains(fullname,%27%23%20%27)`
        const result = await this._context.webAPI.retrieveMultipleRecords(entity, query);
        return result.entities.map((entity: any) => ({ id: entity[entityMetadata.PrimaryIdAttribute], name: entity[primaryNameAttribute] }));
    }

    public navigateToItem = (entityName: string | undefined, entityId: string) => {
        if (entityName) {
            const options: ComponentFramework.NavigationApi.EntityFormOptions = {
                entityName,
                entityId,
            };
            this._context.navigation.openForm(options);
        }
    }
}