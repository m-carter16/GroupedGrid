import { IInputs } from "../../generated/ManifestTypes";

export type PcfContext = ComponentFramework.Context<IInputs>;
export type DataSetRecord = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
export type DataSetColumn = ComponentFramework.PropertyHelper.DataSetApi.Column;

export type AppProps = {
    context: PcfContext;
    entity: string;
    width?: number;
    height?: number;
    columns: DataSetColumn[];
    records: Record<string, DataSetRecord>;
    sortedRecordIds: string[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalResultCount: number;
    currentPage: number;
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    resources: ComponentFramework.Resources;
    itemsLoading: boolean;
    setSelectedRecords: (ids: string[]) => void;
    onNavigate: (item?: DataSetRecord) => void;
    onSort: (name: string, desc: boolean) => void;
    onFilter: (name: string, operator: string, value: string | string[], filter: boolean) => void;
    loadFirstPage: () => void;
    loadNextPage: () => void;
    loadPreviousPage: () => void;
    onFullScreen: () => void;
    isFullScreen: boolean;
    groupingColumn: string | null;
    groupingColumn2: string | null;
    allowGroupChange: boolean;
    collapsed: boolean;
}