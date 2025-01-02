import * as React from 'react';
import { useApiProvider } from '../providers/ApiProvider';
import { DataSetColumn, DataSetRecord } from '../types/AppProps';

export const useSortedItems = (
    records: Record<string, DataSetRecord>,
    sortedRecordIds: string[],
    primaryGroupByName: string,
    secondaryGroupByName: string,
    firstColumn: DataSetColumn,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const { gridService } = useApiProvider();
    const [items, setItems] = React.useState<DataSetRecord[]>([]);
    const [sortedItems, setSortedItems] = React.useState<DataSetRecord[]>([]);

    const sortItems = (items: DataSetRecord[], column: DataSetColumn) => {
        const columnName = column.name;
        return gridService.sortByProperty(items, columnName);
    };

    const sortNestedItems = (items: DataSetRecord[], primaryGroupByColumn: DataSetColumn, secondaryGroupByColumn: DataSetColumn) => {
        const primaryColumnName = primaryGroupByColumn.name;
        const secondaryColumnName = secondaryGroupByColumn ? secondaryGroupByColumn.name : "";
        const sortedItems = items.sort((a, b) => {
            const primaryValueA = a.getValue(primaryColumnName) as string;
            const primaryValueB = b.getValue(primaryColumnName) as string;

            // Sort primarily by the primary group column
            if (primaryValueA !== primaryValueB) {
                return primaryValueA.localeCompare(primaryValueB);
            }

            // If primary values are the same, sort by the secondary group column if it exists
            if (secondaryGroupByColumn) {
                const secondaryValueA = a.getValue(secondaryColumnName) as string;
                const secondaryValueB = b.getValue(secondaryColumnName) as string;
                return secondaryValueA.localeCompare(secondaryValueB);
            }

            return 0;
        });
        return sortedItems;
    };

    const getSortedItems = (items: DataSetRecord[]) => {
        const primaryGroupByColumn = primaryGroupByName ? gridService.getGroupByColumn(primaryGroupByName) : undefined;
        const secondaryGroupByColumn = secondaryGroupByName ? gridService.getGroupByColumn(secondaryGroupByName) : undefined;
        let _sortedItems: DataSetRecord[] = [];
        if (primaryGroupByColumn) {
            if (secondaryGroupByColumn) {
                _sortedItems = sortNestedItems(items, primaryGroupByColumn, secondaryGroupByColumn);

            } else {
                _sortedItems = sortItems(items, primaryGroupByColumn);
            }
        } else {
            _sortedItems = sortItems(items, firstColumn!);
        }

        return _sortedItems;
    };

    React.useEffect(() => {
        setIsLoading(false);
        const _items = sortedRecordIds.map((id) => {
            const record = records[id];
            return record;
        });
        setItems(_items);

        const _sortedItems = getSortedItems(_items);
        setSortedItems(_sortedItems);
    }, [records, sortedRecordIds]);

    return { items, sortedItems };
};
