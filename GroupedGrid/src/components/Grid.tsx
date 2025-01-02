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
import WidthModal from './WidthModal';

const Grid: React.FC<GridProps> = (props) => {
    const { resources, onNavigate, setSelectedRecords } = props;
    const { gridColumns, sortedItems, groups, currentPage, itemsLoading, groupsLoading, componentIsLoading,
        contextualMenuProps, onRenderDetailsHeader, onRenderItemColumn, onRenderCheckbox
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

    if (itemsLoading || componentIsLoading || groupsLoading) {
        return (
            <GridLoading />
        );
    }

    return (
        <Stack verticalFill grow style={{ margin: '0 15px' }}>
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
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                    <DetailsList
                        columns={gridColumns}
                        items={sortedItems}
                        groups={groups}
                        selection={selection}
                        setKey={`set${currentPage}`}
                        initialFocusedIndex={0}
                        checkButtonAriaLabel="select row"
                        checkboxVisibility={CheckboxVisibility.always}
                        layoutMode={DetailsListLayoutMode.justified}
                        constrainMode={ConstrainMode.unconstrained}
                        onRenderDetailsHeader={onRenderDetailsHeader}
                        onRenderItemColumn={onRenderItemColumn}
                        onRenderCheckbox={onRenderCheckbox}
                        onItemInvoked={onNavigate}
                        groupProps={{
                            showEmptyGroups: true,
                            onRenderHeader: (props) => <GridGroupHeader {...props} />,
                        }}
                        // compact={false}
                    />
                    {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
                    <FilterModal {...props} />
                    <WidthModal {...props} />
                </ScrollablePane>
            </Stack.Item>
            <Separator />
            <Stack.Item>
                <GridPagination {...props} selection={selection} selectedCount={selectedCount} />
            </Stack.Item>
        </Stack>
    );
};

export default Grid;
