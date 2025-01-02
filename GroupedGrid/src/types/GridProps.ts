import { PcfContext } from "./AppProps";

export type GridProps = {
    // context: PcfContext
    // entity: string;
    // height: number;
    // width: number;
    resources: ComponentFramework.Resources;
    onNavigate: (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => void;
    setSelectedRecords: (ids: string[]) => void;
    totalResultCount: number;
    currentPage: number;
    isFullScreen: boolean;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    itemsLoading: boolean;
    loadFirstPage: () => void;
    loadNextPage: () => void;
    loadPreviousPage: () => void;
    onFullScreen: () => void;
};