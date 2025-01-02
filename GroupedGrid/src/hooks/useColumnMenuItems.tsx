import * as React from 'react';

import { IColumn, IContextualMenuProps, IContextualMenuItem, ContextualMenuItemType, DirectionalHint, Target } from '@fluentui/react';
import { useFilterProvider } from '../providers/FilterProvider';
import { textTypes, numberTypes, lookupTypes, dateTypes, optionTypes } from '../types/FilterProps';
import { useWidthProvider } from '../providers/WidthProvider';

export const useColumnMenuItems = (
    allowGroupChange: boolean,
    resources: ComponentFramework.Resources,
    primaryGroupBy: string,
    secondaryGroupBy: string,
    setPrimaryGroupBy: React.Dispatch<React.SetStateAction<string>>,
    setSecondaryGroupBy: React.Dispatch<React.SetStateAction<string>>,
    onFilter: (name: string, operator: string, value: string | string[], filter: boolean, entityAlias?: string) => void,
    onSort: (name: string, desc: boolean) => void,
) => {
    const { filterColumn, filterValue, setFilterColumn, setFilterTarget, setFilterCalloutVisible } = useFilterProvider();
    const { setWidthCalloutVisible, setClickedColumn, setWidthTarget } = useWidthProvider();
    const [contextualMenuProps, setContextualMenuProps] = React.useState<IContextualMenuProps>();

    const getColumnDataType = (): string => {
        const dataType = filterColumn?.data.dataType;
        if (textTypes.includes(dataType)) return "Text";
        if (numberTypes.includes(dataType)) return "Number";
        if (lookupTypes.includes(dataType)) return "Lookup";
        if (dateTypes.includes(dataType)) return "Date";
        if (optionTypes.includes(dataType)) return "OptionSet";
        return "";
    };

    const getSortText = (direction: string): string => {
        const dataType = getColumnDataType();
        switch (dataType) {
            case "Number":
                return direction === "up" ? resources.getString('Label_SortNumberUp') : resources.getString('Label_SortNumberDown');

            case "Date":
                return direction === "up" ? resources.getString('Label_SortDateUp') : resources.getString('Label_SortDateDown');

            default:
                return direction === "up" ? resources.getString('Label_SortAZ') : resources.getString('Label_SortZA');
        }
    };

    const onContextualMenuDismissed = React.useCallback(() => {
        setContextualMenuProps(undefined);
    }, [setContextualMenuProps]);

    const getContextualMenuProps = (column: IColumn, ev: React.MouseEvent<HTMLElement>): IContextualMenuProps => {
        const menuItems: IContextualMenuItem[] = [];
        const filterItems: IContextualMenuItem[] = [];

        filterItems.push(
            {
                key: 'filter',
                text: resources.getString('Label_ColumnFilter'),
                iconProps: { iconName: 'Filter' },
                disabled: false,
                onClick: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
                    if (ev && ev.currentTarget) {
                        setFilterCalloutVisible(true);
                        setFilterColumn(column);
                    }
                }
            });

        if (column.key === filterColumn?.key && filterValue) {
            filterItems.push({
                key: 'clearFilter',
                text: resources.getString('Label_ClearColumnFilter'),
                iconProps: { iconName: 'ClearFilter' },
                disabled: false,
                onClick: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
                    if (ev && ev.currentTarget) {
                        onFilter("", "", "", false);
                        setFilterCalloutVisible(false);
                        setFilterColumn(undefined);
                    }
                }
            });
        }

        menuItems.push(
            {
                key: 'sortSection',
                itemType: ContextualMenuItemType.Section,
                sectionProps: {
                    topDivider: false,
                    bottomDivider: true,
                    items: [
                        {
                            key: 'aToZ',
                            name: getSortText("up"),
                            iconProps: { iconName: 'SortUp' },
                            canCheck: true,
                            checked: column.isSorted && !column.isSortedDescending,
                            disabled: primaryGroupBy === column.key || secondaryGroupBy === column.key,
                            onClick: () => {
                                onSort(column.key, false);
                                setContextualMenuProps(undefined);
                            },
                        },
                        {
                            key: 'zToA',
                            name: getSortText("down"),
                            iconProps: { iconName: 'SortDown' },
                            canCheck: true,
                            checked: column.isSorted && column.isSortedDescending,
                            disabled: primaryGroupBy === column.key || secondaryGroupBy === column.key,
                            onClick: () => {
                                onSort(column.key, true);
                                setContextualMenuProps(undefined);
                            },
                        }]
                }
            }
        );

        if (allowGroupChange) {
            if (primaryGroupBy === column.key || secondaryGroupBy === column.key) {
                menuItems.push(
                    {
                        key: 'clearGroupBy',
                        text: primaryGroupBy === column.key && secondaryGroupBy !== "all-items"
                            ? resources.getString('Label_ClearGroupBySecondary')
                            : resources.getString('Label_ClearGroupBy'),
                        iconProps: { iconName: 'ungroup-svg' },
                        disabled: primaryGroupBy === column.key && secondaryGroupBy !== "all-items",
                        onClick: () => {
                            if (primaryGroupBy === column.key) {
                                setPrimaryGroupBy("all-items");
                            } else {
                                setSecondaryGroupBy("all-items");
                            }
                        }
                    }
                );
            } else {
                menuItems.push(
                    {
                        key: 'groupBy',
                        text: "Group by",
                        iconProps: { iconName: 'ungroup-svg' },
                        disabled: false,
                        onClick: () => {
                            if (primaryGroupBy === "all-items") {
                                setPrimaryGroupBy(column.key);
                            } else {
                                setSecondaryGroupBy(column.key);
                            }
                        }
                    }
                );
            }
        }

        menuItems.push(
            {
                key: 'filterSection',
                itemType: ContextualMenuItemType.Section,
                sectionProps: {
                    topDivider: false,
                    bottomDivider: false,
                    items: filterItems
                }
            }
        );

        // TODO: Implement column width change
        // menuItems.push(
        //     {
        //         key: 'widthSection',
        //         itemType: ContextualMenuItemType.Section,
        //         sectionProps: {
        //             topDivider: true,
        //             bottomDivider: false,
        //             items: [
        //                 {
        //                     key: 'setWidth',
        //                     text: 'Column width',
        //                     iconProps: { iconName: 'FitWidth' },
        //                     onClick: (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
        //                         if (ev && ev.currentTarget) {
        //                             setWidthCalloutVisible(true);
        //                             setClickedColumn(column);
        //                         }
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        // );

        return {
            items: menuItems,
            target: ev.currentTarget as HTMLElement,
            directionalHint: DirectionalHint.bottomLeftEdge,
            gapSpace: 10,
            isBeakVisible: false,
            onDismiss: onContextualMenuDismissed,
        };
    };

    const onColumnContextMenu = (column?: IColumn, ev?: React.MouseEvent<HTMLElement>) => {
        if (column && ev) {
            setContextualMenuProps(getContextualMenuProps(column, ev));
        }
    };

    const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
        if (column && ev) {
            setContextualMenuProps(getContextualMenuProps(column, ev));
            setWidthTarget(ev as Target);
            setFilterTarget(ev as Target);
        }
    };

    return { contextualMenuProps, getContextualMenuProps, onColumnContextMenu, onColumnClick };
};
