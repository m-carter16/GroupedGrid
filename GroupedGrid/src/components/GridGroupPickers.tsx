import { Dropdown } from '@fluentui/react';
import * as React from 'react';
import { gridStyles, dropdownStyles } from './GridStyles';
import { useGridProvider } from '../providers/GridProvider';

const GridGroupPicker = () => {
    const { groupByOptions, primaryGroupBy, secondaryGroupBy, setPrimaryGroupBy, setSecondaryGroupBy } = useGridProvider();

    const onRenderOption = (option: any): JSX.Element => {
        return (
            <div>
                {option.key === "all-items" ? (
                    <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{option.text}</span>
                ) :
                    <span>{option.text}</span>
                }
            </div>
        );
    };

    return (
        <div className={gridStyles.controlWrapper} style={{ display: "flex" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <label className={gridStyles.label}>Group By: </label>
                <Dropdown
                    defaultSelectedKey={primaryGroupBy}
                    selectedKey={primaryGroupBy}
                    options={groupByOptions}
                    styles={dropdownStyles}
                    onChange={(e, selectedOption: any) => {
                        setPrimaryGroupBy(selectedOption?.key);
                    }}
                    onRenderOption={onRenderOption}
                />
                {primaryGroupBy !== "all-items" &&
                    <>
                        <label className={gridStyles.secondaryLabel}>then Group By: </label>
                        <Dropdown
                            defaultSelectedKey={secondaryGroupBy}
                            selectedKey={secondaryGroupBy}
                            options={groupByOptions}
                            styles={dropdownStyles}
                            onChange={(e, selectedOption: any) => {
                                setSecondaryGroupBy(selectedOption?.key);
                            }}
                            onRenderOption={onRenderOption}
                        />
                    </>
                }
            </div>
        </div>
    );
}

export default GridGroupPicker;