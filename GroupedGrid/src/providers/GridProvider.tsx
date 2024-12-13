import * as React from 'react';
import {
    Checkbox, ContextualMenuItemType, DirectionalHint, IColumn, IContextualMenuItem,
    IContextualMenuProps, IDetailsHeaderProps, IDetailsListCheckboxProps, IDropdownOption, IRenderFunction, Stack, Sticky, StickyPositionType, Target
} from '@fluentui/react';
import { GridProviderProps, IGroupWithColor } from '../types/GridProviderProps';
import { useFilterProvider } from './FilterProvider';
import { useGetGroups } from '../hooks/useGetGroups';
import { useGetSortedItems } from '../hooks/useGetSortedItems';
import { textTypes, numberTypes, lookupTypes, dateTypes, optionTypes } from '../types/FilterProps';
import GridColumnItem from '../components/GridColumnItem';
import { gridStyles } from '../components/GridStyles';
import { DataSetRecord } from '../types/AppProps';

type GridModel = {
    sortedItems: any[];
    gridColumns: IColumn[];
    groups: IGroupWithColor[] | undefined;
    groupByOptions: IDropdownOption[];
    currentPage: number;
    itemsLoading: boolean;
    groupsLoading: boolean;
    componentIsLoading: boolean;
    primaryGroupBy: string;
    secondaryGroupBy: string;
    contextualMenuProps: IContextualMenuProps | undefined;
    allowGroupChange: boolean;
    setPrimaryGroupBy: React.Dispatch<React.SetStateAction<string>>;
    setSecondaryGroupBy: React.Dispatch<React.SetStateAction<string>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setContextualMenuProps: React.Dispatch<React.SetStateAction<IContextualMenuProps | undefined>>;
    onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps>;
    onRenderCheckbox: (props: IDetailsListCheckboxProps | undefined) => JSX.Element;
    onRenderItemColumn: (item?: DataSetRecord, index?: number, column?: IColumn) => JSX.Element;
    setCollapsedState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
};

const GridContext = React.createContext({} as GridModel);

const GridProvider: React.FC<GridProviderProps> = (props) => {
    const {
        columns, records, sortedRecordIds, currentPage, sorting, filtering, allowGroupChange,
        itemsLoading, groupingColumn, groupingColumn2, resources, collapsed, onSort, onFilter, onNavigate, children
    } = props;
    const { filterColumn, filterValue, setFilterColumn, setFilterTarget, setFilterCalloutVisible } = useFilterProvider();
    const [primaryGroupBy, setPrimaryGroupBy] = React.useState<string>(groupingColumn ? groupingColumn : "all-items");
    const [secondaryGroupBy, setSecondaryGroupBy] = React.useState<string>(groupingColumn2 ? groupingColumn2 : "all-items");
    const [componentIsLoading, setIsLoading] = React.useState<boolean>(true);
    const [contextualMenuProps, setContextualMenuProps] = React.useState<IContextualMenuProps>();

    const items: DataSetRecord[] = React.useMemo(() => {
        setIsLoading(false);
        const sortedRecords: DataSetRecord[] = sortedRecordIds.map((id) => {
            const record = records[id];
            return record;
        });

        return sortedRecords;
    }, [records, sortedRecordIds, setIsLoading]);

    const { groups, groupsLoading, setCollapsedState } = useGetGroups(items, primaryGroupBy, secondaryGroupBy, collapsed);
    const sortedItems = useGetSortedItems(items, primaryGroupBy, secondaryGroupBy, columns[0]);

    const onContextualMenuDismissed = React.useCallback(() => {
        setContextualMenuProps(undefined);
    }, [setContextualMenuProps]);

    const getColumnDataType = (column: IColumn): string => {
        const dataType = filterColumn?.data.dataType;
        if (textTypes.includes(dataType)) return "Text";
        if (numberTypes.includes(dataType)) return "Number";
        if (lookupTypes.includes(dataType)) return "Lookup";
        if (dateTypes.includes(dataType)) return "Date";
        if (optionTypes.includes(dataType)) return "OptionSet";
        return "";
    };

    const getSortText = (column: IColumn, direction: string): string => {
        const dataType = getColumnDataType(column);
        switch (dataType) {
            case "Number":
                return direction === "up" ? resources.getString('Label_SortNumberUp') : resources.getString('Label_SortNumberDown');

            case "Date":
                return direction === "up" ? resources.getString('Label_SortDateUp') : resources.getString('Label_SortDateDown');

            default:
                return direction === "up" ? resources.getString('Label_SortAZ') : resources.getString('Label_SortZA');
        }
    };

    const getContextualMenuProps = React.useCallback(

        (column: IColumn, ev: React.MouseEvent<HTMLElement>): IContextualMenuProps => {
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
                                name: getSortText(column, "up"),
                                iconProps: { iconName: 'SortUp' },
                                canCheck: true,
                                checked: column.isSorted && !column.isSortedDescending,
                                disabled: primaryGroupBy === column.key || secondaryGroupBy === column.key,
                                onClick: () => {
                                    onSort(column.key, false);
                                    setContextualMenuProps(undefined);
                                    if (items && items.length > 0) setIsLoading(true);
                                },
                            },
                            {
                                key: 'zToA',
                                name: getSortText(column, "down"),
                                iconProps: { iconName: 'SortDown' },
                                canCheck: true,
                                checked: column.isSorted && column.isSortedDescending,
                                disabled: primaryGroupBy === column.key || secondaryGroupBy === column.key,
                                onClick: () => {
                                    onSort(column.key, true);
                                    setContextualMenuProps(undefined);
                                    if (items && items.length > 0) setIsLoading(true);
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
                        bottomDivider: true,
                        items: filterItems
                    }
                }
            );

            // menuItems.push(
            //     {
            //         key: 'setWidth',
            //         text: 'Column width',
            //         iconProps: { iconName: 'FitWidth' },
            //         // TODO: Implement column width change dialog
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
        },
        [setIsLoading, onFilter, setContextualMenuProps, items, primaryGroupBy, secondaryGroupBy, filterColumn, filterValue],
    );

    const onColumnContextMenu = React.useCallback(
        (column?: IColumn, ev?: React.MouseEvent<HTMLElement>) => {
            if (column && ev) {
                setContextualMenuProps(getContextualMenuProps(column, ev));
            }
        },
        [getContextualMenuProps, setContextualMenuProps],
    );

    const onColumnClick = React.useCallback(
        (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
            if (column && ev) {
                setContextualMenuProps(getContextualMenuProps(column, ev));
                setFilterTarget(ev as Target);
            }
        },
        [getContextualMenuProps, setContextualMenuProps],
    );

    const onRenderCheckbox = (props: IDetailsListCheckboxProps | undefined) => {
        return (
            <Stack className={gridStyles.checkboxContainer} style={{ pointerEvents: 'none' }}>
                <Checkbox styles={{ checkbox: { height: "16px", width: "16px" }, checkmark: { fontSize: "14px" } }} checked={props?.checked} />
            </Stack>
        );
    };

    const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
        if (!props) {
            return null;
        }

        return (
            <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
                {defaultRender!({
                    ...props
                })}
            </Sticky>
        );
    };

    const onRenderItemColumn = (item?: DataSetRecord, index?: number, column?: IColumn) => {
        return <GridColumnItem item={item} column={column} onNavigate={onNavigate} />;
    };

    const gridColumns = React.useMemo(() => {
        return columns
            .filter((col) => !col.isHidden && col.order >= 0)
            .sort((a, b) => a.order - b.order)
            .map((col) => {
                const sortOn = sorting && sorting.find((s) => s.name === col.name);
                const filtered =
                    filtering && filtering.conditions && filtering.conditions.find((f) => f.attributeName == col.name);

                return {
                    key: col.name,
                    name: col.displayName,
                    fieldName: col.name,
                    isSorted: sortOn != null,
                    isSortedDescending: sortOn?.sortDirection === 1,
                    isResizable: true,
                    isFiltered: filtered != null,
                    isGrouped: primaryGroupBy === col.name || secondaryGroupBy === col.name,
                    data: col,
                    columnActionsMode: 2,
                    minWidth: col.visualSizeFactor > 100 ? col.visualSizeFactor : 100,
                    onColumnContextMenu: onColumnContextMenu,
                    onColumnClick: onColumnClick,
                } as IColumn;
            });
    }, [columns, sorting, filtering, onColumnContextMenu, onColumnClick]);

    const groupByOptions = React.useMemo(() => {
        const options: IDropdownOption[] = [];
        const defaultOption = { key: "all-items", text: "Not selected" };
        options.push(defaultOption);
        columns.map(column => {
            const option: IDropdownOption = {
                key: column.name,
                text: column.displayName.charAt(0).toUpperCase() + column.displayName.slice(1),
                disabled: column.name === primaryGroupBy || column.name === secondaryGroupBy
            }
            options.push(option);
        });

        return options;
    }, [gridColumns, primaryGroupBy, secondaryGroupBy]);

    return (
        <GridContext.Provider value={{
            sortedItems,
            gridColumns,
            groups,
            groupByOptions,
            currentPage,
            itemsLoading,
            groupsLoading,
            componentIsLoading,
            contextualMenuProps,
            primaryGroupBy,
            secondaryGroupBy,
            allowGroupChange,
            setPrimaryGroupBy,
            setSecondaryGroupBy,
            setIsLoading,
            setContextualMenuProps,
            onRenderDetailsHeader,
            onRenderCheckbox,
            onRenderItemColumn,
            setCollapsedState,
        }}>
            {children}
        </GridContext.Provider>
    );
};

const useGridProvider = (): GridModel => React.useContext(GridContext);

export { GridProvider, useGridProvider };
