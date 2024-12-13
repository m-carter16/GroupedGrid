import * as React from 'react';
import { Checkbox, GroupHeader, IDetailsGroupDividerProps, IDetailsListCheckboxProps, IGroup, Stack } from '@fluentui/react';
import { IGroupWithColor } from '../types/GridProviderProps';
import { useGridProvider } from '../providers/GridProvider';
import { gridStyles } from './GridStyles';

const GridGroupHeader = (props: IDetailsGroupDividerProps) => {
    const groupWithColor = props.group as IGroupWithColor;
    const { setCollapsedState } = useGridProvider()

    const groupHeaderStyles = {
        groupHeaderContainer: {
            fontSize: '14px',
            // backgroundColor: "#fafafa",
            borderBottom: "1px solid #e1e1e1",
            color: groupWithColor.color,
        },
        check: {
            visibility: "visible !important",
            opacity: 1,
            pointerEvents: "auto",
        }
    };

    const onRenderCheckbox = (props: IDetailsListCheckboxProps | undefined) => {
        return (
            <Stack className={gridStyles.checkboxContainer} style={{ pointerEvents: 'none' }}>
                <Checkbox styles={{ checkbox: { height: "16px", width: "16px" }, checkmark: { fontSize: "14px" } }} checked={props?.checked} />
            </Stack>
        );
    };

    const onToggleCollapse = (group: IGroup) => {
        props.onToggleCollapse?.(group);
        setCollapsedState((prevState) => {
            return {
                ...prevState,
                [group.key]: !prevState[group.key]
            };
        });
    };

    const onToggleSelectGroup = (group: IGroup) => {
        if (group.children) {
            props.onToggleCollapse?.(group);
            setCollapsedState((prevState) => {
                return {
                    ...prevState,
                    [group.key]: !prevState[group.key]
                };
            });
        } else {
            props.onToggleSelectGroup?.(group);

        }
    };

    return (
        <GroupHeader
            key={props.group?.key}
            styles={{
                groupHeaderContainer: groupHeaderStyles.groupHeaderContainer,
                check: props.group?.children ? { visibility: 'hidden' } : groupHeaderStyles.check
            }}
            {...props}
            onRenderGroupHeaderCheckbox={onRenderCheckbox}
            onToggleCollapse={onToggleCollapse}
            onToggleSelectGroup={onToggleSelectGroup}

        />
    );
};

export default GridGroupHeader;
