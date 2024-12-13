import { IGroup } from "@fluentui/react";
import { DataSetColumn, DataSetRecord, PcfContext } from "./AppProps";

export type IGroupWithColor = IGroup & { color: string; }

export type GridProviderProps = {
    context: PcfContext;
    entity: string;
    columns: DataSetColumn[];
    records: Record<string, DataSetRecord>;
    sortedRecordIds: string[];
    hasNextPage: boolean;
    currentPage: number;
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    itemsLoading: boolean;
    groupingColumn: string | null;
    groupingColumn2: string | null;
    resources: ComponentFramework.Resources;
    allowGroupChange: boolean;
    collapsed: boolean;
    onSort: (name: string, desc: boolean) => void;
    onNavigate: (item?: DataSetRecord) => void;
    onFilter: (name: string, operator: string, value: string | string[], filter: boolean) => void;
    children: React.ReactNode;
};