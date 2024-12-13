import { Selection } from "@fluentui/react";

export type GridPaginationProps = {
    totalResultCount: number;
    resources: ComponentFramework.Resources;
    currentPage: number;
    isFullScreen: boolean;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    itemsLoading: boolean;
    selection: Selection;
    selectedCount: number;
    loadFirstPage: () => void;
    loadNextPage: () => void;
    loadPreviousPage: () => void;
    onFullScreen: () => void;
}