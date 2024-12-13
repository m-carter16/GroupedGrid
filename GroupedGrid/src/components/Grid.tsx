import * as React from 'react';
import { useConst, useForceUpdate } from '@fluentui/react-hooks';
import {
    ConstrainMode, DetailsList, DetailsListLayoutMode, Icon, Text, ScrollablePane, ScrollbarVisibility,
    Stack, Selection, ContextualMenu, SelectionMode, Separator, CheckboxVisibility,
} from '@fluentui/react';
import { useGridProvider } from '../providers/GridProvider';
import { gridStyles } from './GridStyles';
import { GridProps } from '../types/GridProps';
import GridPagination from './GridPagination';
import GridGroupHeader from './GridGroupHeader';
import FilterModal from './FilterModal';
import GridGroupPicker from './GridGroupPickers';
import GridLoading from './GridLoading';
import { DataSetRecord } from '../types/AppProps';

const Grid: React.FC<GridProps> = (props) => {
    const { height, width, resources, onNavigate, setSelectedRecords } = props;
    const { gridColumns, sortedItems, groups, currentPage, itemsLoading, groupsLoading, contextualMenuProps,
        componentIsLoading, allowGroupChange, onRenderDetailsHeader, onRenderItemColumn, onRenderCheckbox
    } = useGridProvider();
    const [selectedCount, setSelectedCount] = React.useState(0);
    const forceUpdate = useForceUpdate();

    const onSelectionChanged = React.useCallback(() => {
		const items = selection.getItems() as DataSetRecord[];
		const selected = selection.getSelectedIndices().map((index: number) => {			
			const item: DataSetRecord | undefined = items[index];
			return item && items[index].getRecordId();
		});
		setSelectedRecords(selected);
        const count = selection.getSelectedCount();
        setSelectedCount(count);
		forceUpdate();
	}, [forceUpdate]);

	const selection: Selection = useConst(() => {
		return new Selection({
			selectionMode: SelectionMode.multiple,
			onSelectionChanged: onSelectionChanged,
		});
	});

    const rootContainerStyle: React.CSSProperties = React.useMemo(() => {
        return {
            height: height === -1 ? '100%' : height,
            width: width,
        };
    }, [width, height]);

    if (itemsLoading || componentIsLoading || groupsLoading) {
        return (
            <GridLoading />
        );
    }

    return (
        <Stack verticalFill grow style={rootContainerStyle}>
            {/* {allowGroupChange &&
                <Stack.Item >
                    <GridGroupPicker />
                </Stack.Item>
            } */}
            <Stack.Item grow style={{ position: 'relative', backgroundColor: 'white', zIndex: 0 }}>
                {!itemsLoading && !componentIsLoading && !groupsLoading && sortedItems && sortedItems.length === 0 && (
                    <Stack grow horizontalAlign="center" className={gridStyles.noRecords}>
                        <Icon iconName="PageList"></Icon>
                        <Text variant="large">{resources.getString('Label_NoRecords')}</Text>
                    </Stack>
                )}
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto} style={{ paddingLeft: '20px' }}>
                    <DetailsList
                        columns={gridColumns}
                        // compact={false}
                        items={sortedItems}
                        groups={groups}
                        selection={selection}
                        setKey={`set${currentPage}`}
                        initialFocusedIndex={0}
                        checkButtonAriaLabel="select row"
                        checkboxVisibility={CheckboxVisibility.always}
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        constrainMode={ConstrainMode.unconstrained}
                        onRenderDetailsHeader={onRenderDetailsHeader}
                        onRenderItemColumn={onRenderItemColumn}
                        onRenderCheckbox={onRenderCheckbox}
                        onItemInvoked={onNavigate}
                        groupProps={{
                            showEmptyGroups: true,
                            onRenderHeader: (props) => <GridGroupHeader {...props} />,
                        }}
                    />
                    {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
                    <FilterModal {...props} />
                </ScrollablePane>
            </Stack.Item>
            <Separator />
            <Stack.Item>
                <GridPagination {...props} selection={selection} selectedCount={selectedCount} />
            </Stack.Item>
        </Stack>
    );
}

export default Grid;