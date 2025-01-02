import * as React from 'react';
import { DataSetColumn, FilterExpression, SortStatuses } from '../types/AppProps';
import { IColumn } from '@fluentui/react';
import { useColumnMenuItems } from './useColumnMenuItems';

export const useGridColumns = (
    columns: DataSetColumn[],
    sorting: SortStatuses,
    filtering: FilterExpression,
    containerWidth: number,
    allowGroupChange: boolean,
    resources: ComponentFramework.Resources,
    primaryGroupBy: string,
    secondaryGroupBy: string,
    setPrimaryGroupBy: React.Dispatch<React.SetStateAction<string>>,
    setSecondaryGroupBy: React.Dispatch<React.SetStateAction<string>>,
    onFilter: (name: string, operator: string, value: string | string[], filter: boolean, entityAlias?: string) => void,
    onSort: (name: string, desc: boolean) => void,
) => {
    const [gridColumns, setGridColumns] = React.useState<IColumn[]>([]);
    const { contextualMenuProps, onColumnClick, onColumnContextMenu } = useColumnMenuItems(
        allowGroupChange, resources, primaryGroupBy, secondaryGroupBy, setPrimaryGroupBy, setSecondaryGroupBy, onFilter, onSort
    );

    const calculateAggregates = () => {
        return columns.filter((col) => !col.isHidden && col.order >= 0).reduce(({ aggregatedWidth, count }, column) => {
            return {
                aggregatedWidth: aggregatedWidth + column.visualSizeFactor,
                count: count + 1
            };
        }, { aggregatedWidth: 0, count: 0 });
    };

    const calculateMaxWidth = (minWidth: number, aggregatedWidth: number, count: number) => {
        const buffer = containerWidth > aggregatedWidth ? Math.round((containerWidth - aggregatedWidth) / count) : 0;
        return minWidth + buffer - 20;
    };

    const getGridColumns = (aggregatedWidth: number, columnCount: number) => {
        return columns
            .filter((col) => !col.isHidden && col.order >= 0)
            .sort((a, b) => a.order - b.order)
            .map((col) => {
                const _minWidth = col.visualSizeFactor === -1 ? 100 : col.visualSizeFactor
                const sortOn = sorting && sorting.find((s) => s.name === col.name);
                let filtered = null;

                if (filtering && filtering.conditions) {
                    filtering.conditions.find((f) => {
                        const attribute = f.entityAliasName ? `${f.entityAliasName}.${f.attributeName}` : f.attributeName;
                        filtered = attribute === col.name ? f : null;
                    });
                }

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
                    minWidth: _minWidth,
                    maxWidth: calculateMaxWidth(_minWidth, aggregatedWidth, columnCount),
                    onColumnContextMenu: onColumnContextMenu,
                    onColumnClick: onColumnClick,
                } as IColumn;
            });
    };

    React.useEffect(() => {
        const { aggregatedWidth, count } = calculateAggregates();
        const _gridColumns = getGridColumns(aggregatedWidth, count);
        setGridColumns(_gridColumns);
    }, [columns, sorting, filtering, containerWidth, primaryGroupBy, secondaryGroupBy]);

    return { gridColumns, contextualMenuProps };
};
