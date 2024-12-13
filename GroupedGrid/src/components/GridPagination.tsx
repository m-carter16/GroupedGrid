import * as React from 'react';
import { IconButton, Link, Stack } from '@fluentui/react';
import { useGridProvider } from '../providers/GridProvider';
import { GridPaginationProps } from '../types/GridPaginationProps';
import { gridStyles } from './GridStyles';

const GridPagination: React.FC<GridPaginationProps> = (props) => {
    const {
        totalResultCount, resources, isFullScreen, hasPreviousPage,
        hasNextPage, itemsLoading, currentPage, selection, selectedCount,
        loadFirstPage, loadNextPage, loadPreviousPage, onFullScreen,
    } = props;
    const { componentIsLoading, setIsLoading } = useGridProvider();

    const onNextPage = React.useCallback(() => {
        setIsLoading(true);
        loadNextPage();
    }, [loadNextPage, setIsLoading]);

    const onPreviousPage = React.useCallback(() => {
        setIsLoading(true);
        loadPreviousPage();
    }, [loadPreviousPage, setIsLoading]);

    const onFirstPage = React.useCallback(() => {
        setIsLoading(true);
        loadFirstPage();
    }, [loadFirstPage, setIsLoading]);

    const stringFormat = (template: string, ...args: string[]): string => {
        for (const k in args) {
            template = template.replace('{' + k + '}', args[k]);
        }
        return template;
    };

    return (
        <Stack horizontal className={gridStyles.gridFooter}>
            <Stack.Item align="center">
                <div className={gridStyles.statusContainer}>
                    <span>Rows: {totalResultCount === -1 ? "5000+" : totalResultCount}</span>
                    <span>Selected: {selectedCount}</span>
                </div>
                {/* {stringFormat(
                    resources.getString('Label_Grid_Footer_RecordCount'),
                    totalResultCount === -1 ? '5000+' : totalResultCount.toString(),
                    selectedCount.toString(),
                )} */}
            </Stack.Item>
            <Stack.Item grow align="center" style={{ textAlign: 'center' }}>
                {!isFullScreen && (
                    <Link onClick={onFullScreen}>{resources.getString('Label_ShowFullScreen')}</Link>
                )}
            </Stack.Item>
            {/* <IconButton
                alt="First Page"
                iconProps={{ iconName: 'Rewind' }}
                disabled={!hasPreviousPage || componentIsLoading || itemsLoading}
                onClick={onFirstPage}
            />
            <IconButton
                alt="Previous Page"
                iconProps={{ iconName: 'Previous' }}
                disabled={!hasPreviousPage || componentIsLoading || itemsLoading}
                onClick={onPreviousPage}
            />
            <Stack.Item align="center">
                {stringFormat(
                    resources.getString('Label_Grid_Footer'),
                    currentPage.toString(),
                    selection.getSelectedCount().toString(),
                )}
            </Stack.Item>
            <IconButton
                alt="Next Page"
                iconProps={{ iconName: 'Next' }}
                disabled={!hasNextPage || componentIsLoading || itemsLoading}
                onClick={onNextPage}
            /> */}
        </Stack>
    );
}

export default GridPagination;