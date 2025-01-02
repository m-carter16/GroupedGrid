import * as React from 'react';
import { IGroupWithColor } from '../types/GridProviderProps';
import { DataSetColumn, DataSetRecord } from '../types/AppProps';
import { useApiProvider } from '../providers/ApiProvider';

export const useGridGroups = (
    records: Record<string, DataSetRecord>,
    sortedRecordIds: string[],
    primaryGroupBy: string | null,
    secondaryGroupBy: string | null,
    defaultCollapse: boolean
) => {
    const { gridService } = useApiProvider();
    const [groups, setGroups] = React.useState<IGroupWithColor[] | undefined>();
    const [collapsedState, setCollapsedState] = React.useState<Record<string, boolean>>({});
    const [groupsLoading, setGroupsLoading] = React.useState<boolean>(true);

    const groupItemsNested = async (
        items: DataSetRecord[],
        primaryGroupByColumn: DataSetColumn,
        secondaryGroupByColumn: DataSetColumn
    ): Promise<{ [key: string]: { [key: string]: DataSetRecord[] } }> => {
        const primaryColumnName = primaryGroupByColumn ? primaryGroupByColumn.name : "";
        const primaryGroupByType = primaryGroupByColumn ? primaryGroupByColumn.dataType : "SingleLine.Text";

        const secondaryColumnName = secondaryGroupByColumn ? secondaryGroupByColumn.name : "";
        const secondaryGroupByType = secondaryGroupByColumn ? secondaryGroupByColumn.dataType : "SingleLine.Text";

        const sortedItems = gridService.sortByProperty(items, primaryColumnName);
        const groupedItems = sortedItems.reduce((acc: any, item: any) => {

            const primaryGroupingValue = primaryGroupByType === "OptionSet"
                ? item?.getFormattedValue(primaryColumnName) as string
                : item?.getValue(primaryColumnName) as string;

            const secondaryGroupingValue = secondaryGroupByType === "OptionSet"
                ? item?.getFormattedValue(secondaryColumnName) as string
                : item?.getValue(secondaryColumnName) as string;

            if (!acc[primaryGroupingValue]) {
                acc[primaryGroupingValue] = {};
            }

            if (!acc[primaryGroupingValue][secondaryGroupingValue]) {
                acc[primaryGroupingValue][secondaryGroupingValue] = [];
            }
            acc[primaryGroupingValue][secondaryGroupingValue].push(item);

            return acc;
        }, {} as { [key: string]: { [key: string]: DataSetRecord[] } });


        if (primaryGroupByType === "OptionSet" && secondaryGroupByType === "OptionSet") {
            return await gridService.sortGroupsByOptionSetOrderNested(groupedItems, primaryGroupByColumn, secondaryGroupByColumn);
        }
        if (primaryGroupByType === "OptionSet" && secondaryGroupByType !== "OptionSet") {
            return await gridService.sortGroupsByOptionSetOrderNested(groupedItems, primaryGroupByColumn, undefined);
        }
        if (primaryGroupByType !== "OptionSet" && secondaryGroupByType === "OptionSet") {
            return await gridService.sortGroupsByOptionSetOrderNested(groupedItems, undefined, secondaryGroupByColumn);
        }
        return groupedItems;
    }

    const formatGroupsNested = async (
        groupItems: { [key: string]: { [key: string]: DataSetRecord[] } },
        primaryGroupByColumn: DataSetColumn,
        secondaryGroupByColumn: DataSetColumn
    ): Promise<IGroupWithColor[]> => {
        let currentIndex = 0;
        const primaryCapitalized = primaryGroupByColumn.displayName.charAt(0).toUpperCase() + primaryGroupByColumn.displayName.slice(1);
        const secondaryCapitalized = secondaryGroupByColumn.displayName.charAt(0).toUpperCase() + secondaryGroupByColumn.displayName.slice(1);
        const secondaryGroupByType = secondaryGroupByColumn ? secondaryGroupByColumn.dataType : "SingleLine.Text";
        const groups = await Promise.all(Object.keys(groupItems).map(async (primaryKey) => {
            const primaryItems = groupItems[primaryKey];
            const itemCount = Object.values(primaryItems as { [key: string]: DataSetRecord[] }).reduce((sum, items) => sum + items.length, 0);
            const primaryGroupColor = await gridService.getOptionColor(primaryGroupByColumn.name, primaryKey);
            const primaryStartIndex = currentIndex;

            const sortedKeys = secondaryGroupByType !== "OptionSet"
                ? Object.keys(primaryItems).sort((a, b) => a.localeCompare(b))
                : Object.keys(primaryItems);

            // Prepare subgroups if secondary grouping is enabled
            const children = await Promise.all(sortedKeys
                .map(async (secondaryKey) => {
                    const secondaryGroupColor = await gridService.getOptionColor(secondaryGroupByColumn.name, secondaryKey);
                    const subGroupItems = primaryItems[secondaryKey];
                    const subGroupCount = subGroupItems.length;
                    const subGroup: IGroupWithColor = {
                        key: secondaryKey,
                        name: `${secondaryCapitalized}: ${secondaryKey}`,
                        startIndex: currentIndex,
                        count: subGroupCount,
                        level: 1,
                        isCollapsed: collapsedState[secondaryKey] ?? defaultCollapse,
                        color: secondaryGroupColor
                    };

                    // Update the global index after each subgroup
                    currentIndex += subGroupCount;
                    return subGroup;
                }));

            // Define the primary group
            const primaryGroup: IGroupWithColor = {
                key: primaryKey,
                name: `${primaryCapitalized}: ${primaryKey}`,
                startIndex: primaryStartIndex,
                count: itemCount,
                level: 0,
                isCollapsed: collapsedState[primaryKey] ?? defaultCollapse,
                color: primaryGroupColor,
                children
            };
            return primaryGroup;
        })
        );
        return groups;
    }

    const groupItems = async (items: DataSetRecord[], primaryGroupByColumn: DataSetColumn): Promise<{ [key: string]: DataSetRecord[] }> => {
        const primaryColumnName = primaryGroupByColumn ? primaryGroupByColumn.name : "";
        const primaryGroupByType = primaryGroupByColumn ? primaryGroupByColumn.dataType : "SingleLine.Text";
        const sortedItems = gridService.sortByProperty(items, primaryColumnName);
        const groupedItems = sortedItems.reduce((acc: any, item: any) => {

            const groupingValue = primaryGroupByType === "OptionSet"
                ? item?.getFormattedValue(primaryColumnName) as string
                : item?.getValue(primaryColumnName) as string;

            if (!acc[groupingValue]) {
                acc[groupingValue] = [];
            }
            acc[groupingValue].push(item);
            return acc;
        }, {} as { [key: string]: DataSetRecord[] });

        if (primaryGroupByType === "OptionSet") {
            return gridService.sortGroupsByOptionSetOrder(groupedItems, primaryGroupByColumn);
        } else {
            return groupedItems;
        }
    };

    const formatGroups = async (groupItems: { [key: string]: DataSetRecord[] }, groupByColumn: DataSetColumn): Promise<IGroupWithColor[]> => {
        const capitalized = groupByColumn.displayName.charAt(0).toUpperCase() + groupByColumn.displayName.slice(1);
        const groups = await Promise.all(Object.keys(groupItems).map(async (key, index) => {
            const primaryItems = groupItems[key];
            const itemCount = primaryItems.length;

            const startIndex = Object.values(groupItems)
                .slice(0, index)
                .reduce((acc, curr) => acc + (curr.length), 0);

            // Get the color for this group
            const groupColor = await gridService.getOptionColor(groupByColumn.name, key);

            return {
                key: key,
                name: `${capitalized}: ${key}`,
                startIndex,
                count: itemCount,
                level: 0,
                isCollapsed: collapsedState[key] ?? defaultCollapse,
                color: groupColor,
            } as IGroupWithColor;
        }));
        return groups;
    };

    const getGroups = async (items: DataSetRecord[]): Promise<IGroupWithColor[] | undefined> => {
        const primaryGroupByColumn = primaryGroupBy ? gridService.getGroupByColumn(primaryGroupBy) : undefined;
        const secondaryGroupByColumn = secondaryGroupBy ? gridService.getGroupByColumn(secondaryGroupBy) : undefined;
        let formattedGroups: IGroupWithColor[] = [];

        if (!primaryGroupBy || primaryGroupBy === "all-items") {
            return undefined;
        }

        if (primaryGroupByColumn) {
            if (secondaryGroupByColumn) {
                const groupedItems = await groupItemsNested(items, primaryGroupByColumn, secondaryGroupByColumn);
                formattedGroups = await formatGroupsNested(groupedItems, primaryGroupByColumn, secondaryGroupByColumn);

            } else {
                const groupedItems = await groupItems(items, primaryGroupByColumn);
                formattedGroups = await formatGroups(groupedItems, primaryGroupByColumn);
            }
        }
        return formattedGroups
    };

    React.useEffect(() => {
        const _items = sortedRecordIds.map((id) => {
            const record = records[id];
            return record;
        });

        const fetchGroups = async () => {
            try {
                const _groups = await getGroups(_items);
                setGroupsLoading(false);
                setGroups(_groups);
            } catch (error) {
                console.error('Error fetching groups: ', error);
            }
        };
        fetchGroups();
    }, [records, sortedRecordIds, primaryGroupBy, secondaryGroupBy, defaultCollapse]);

    React.useEffect(() => {
        const newState: Record<string, boolean> = {};
        groups?.forEach((group: IGroupWithColor) => {
            newState[group.key] = group.isCollapsed ?? defaultCollapse;
            if (group.children) {
                group.children.forEach((subGroup) => {
                    newState[subGroup.key] = subGroup.isCollapsed ?? defaultCollapse;
                });
            }
        });
        setCollapsedState(newState);
    }, [groups]);

    return { groups, groupsLoading, setCollapsedState };
}
