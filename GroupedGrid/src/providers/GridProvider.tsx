import * as React from 'react';
import {
    Checkbox, IColumn, IContextualMenuProps, IDetailsHeaderProps, IDetailsListCheckboxProps,
    IDropdownOption, IRenderFunction, Stack, Sticky, StickyPositionType,
} from '@fluentui/react';
import GridColumnItem from '../components/GridColumnItem';
import { GridProviderProps, IGroupWithColor } from '../types/GridProviderProps';
import { useGridGroups } from '../hooks/useGridGroups';
import { useSortedItems } from '../hooks/useSortedItems';
import { gridStyles } from '../components/GridStyles';
import { DataSetRecord } from '../types/AppProps';
import { useGridColumns } from '../hooks/useGridColumns';

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
    onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps>;
    onRenderCheckbox: (props: IDetailsListCheckboxProps | undefined) => JSX.Element;
    onRenderItemColumn: (item?: DataSetRecord, index?: number, column?: IColumn) => JSX.Element;
    setCollapsedState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
};

const GridContext = React.createContext({} as GridModel);

const GridProvider: React.FC<GridProviderProps> = (props) => {
    const {
        columns, records, sortedRecordIds, currentPage, sorting, filtering, allowGroupChange, width,
        itemsLoading, groupingColumn, groupingColumn2, resources, collapsed, onSort, onFilter, onNavigate, children
    } = props;
    const [primaryGroupBy, setPrimaryGroupBy] = React.useState<string>(groupingColumn ? groupingColumn : "all-items");
    const [secondaryGroupBy, setSecondaryGroupBy] = React.useState<string>(groupingColumn2 ? groupingColumn2 : "all-items");
    const [componentIsLoading, setIsLoading] = React.useState<boolean>(true);
    const { gridColumns, contextualMenuProps } = useGridColumns(
        columns, sorting, filtering, width, allowGroupChange, resources, primaryGroupBy, secondaryGroupBy, setPrimaryGroupBy, setSecondaryGroupBy, onFilter, onSort
    );
    const { groups, groupsLoading, setCollapsedState } = useGridGroups(
        records, sortedRecordIds, primaryGroupBy, secondaryGroupBy, collapsed
    );
    const { items, sortedItems } = useSortedItems(records, sortedRecordIds, primaryGroupBy, secondaryGroupBy, columns[0], setIsLoading);

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
            <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced >
                {defaultRender!({
                    ...props
                })}
            </Sticky>
        );
    };

    const onRenderItemColumn = (item?: DataSetRecord, index?: number, column?: IColumn) => {
        return <GridColumnItem item={item} column={column} onNavigate={onNavigate} />;
    };

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
