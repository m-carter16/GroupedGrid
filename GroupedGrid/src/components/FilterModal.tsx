import * as React from "react";
import {
    Dropdown, TextField, PrimaryButton, DefaultButton, Callout, Target,
    IconButton, DirectionalHint, DatePicker, ComboBox
} from "@fluentui/react";
import { FilterConditionOperator } from "../types/FilterProps";
import { gridStyles } from "./GridStyles";
import { useFilterProvider } from "../providers/FilterProvider";
import LookupPicker from "./LookupPicker";

const FilterModal: React.FC = () => {
    const {
        conditionOptions, filterOptions, selectedOperator, filterTarget, filterValue,
        isFilterCalloutVisible, columnDataType, selectedKeys, setFilterCalloutVisible, setFilterValue,
        setSelectedOperator, handleOptionChange, applyFilter, clearFilter
    } = useFilterProvider();
    const defaultValue = filterValue.constructor === Array ? filterValue.join(", ") : filterValue as string;
    const showFilterValueField = selectedOperator?.key !== FilterConditionOperator.NotNull
    && selectedOperator?.key !== FilterConditionOperator.Null;

    const showOptionPicker = selectedOperator?.key !== FilterConditionOperator.NotNull
    && selectedOperator?.key !== FilterConditionOperator.Null;

    const showLookup = selectedOperator?.key !== FilterConditionOperator.NotNull
    && selectedOperator?.key !== FilterConditionOperator.Null;

    const showDatePicker = selectedOperator?.key === FilterConditionOperator.On
    || selectedOperator?.key === FilterConditionOperator.OnOrBefore
    || selectedOperator?.key === FilterConditionOperator.OnOrAfter;

    const disableButton = () => showFilterValueField && filterValue === "";
   
    return (
        <>
        {/* Do not show callout if lookup */}
            {isFilterCalloutVisible && filterTarget && (
                <Callout
                    target={filterTarget as Target}
                    onDismiss={() => setFilterCalloutVisible(false)}
                    isBeakVisible={false}
                    directionalHint={DirectionalHint.bottomLeftEdge}
                    gapSpace={0}
                    setInitialFocus
                >
                    <div style={{ width: "250px", maxWidth: "250px" }}>
                        <div className={gridStyles.calloutTitleContainer}>
                            <h3 className={gridStyles.calloutTitle} >Filter by</h3>
                            <IconButton
                                iconProps={{ iconName: "Cancel", color: "rgb(20 20 20)" }}
                                onClick={() => setFilterCalloutVisible(false)} />
                        </div>
                        <div style={{padding: "8px 16px 16px"}}>
                            <Dropdown
                                options={conditionOptions}
                                style={{ marginBottom: "15px" }}
                                selectedKey={selectedOperator.key}
                                onChange={(e, option) => setSelectedOperator(option ?? selectedOperator)}
                            />
                            {(columnDataType === "Text" || columnDataType === "Number") && showFilterValueField && 
                                <TextField
                                    styles={{ root: { marginBottom: "15px" } }}
                                    defaultValue={defaultValue}
                                    onChange={(e, newValue) => setFilterValue(newValue ?? "")}
                                />
                            }

                            {columnDataType === "OptionSet" && showOptionPicker &&
                                <ComboBox
                                    multiSelect
                                    selectedKey={selectedKeys}
                                    options={filterOptions}
                                    styles={{ root: { marginBottom: "15px" } }}
                                    onChange={handleOptionChange}
                                />
                            }

                            {columnDataType === "Lookup" && showLookup && <LookupPicker />}
                            
                            {columnDataType === "Date" && showDatePicker &&
                                <DatePicker
                                    styles={{ root: { marginBottom: "15px" } }}
                                    onSelectDate={(date) => setFilterValue(date?.toISOString() ?? "")}
                                />
                            }
                            <div style={{ display: "flex", flexDirection: "row",  justifyContent: "flex-end" }}>
                                <PrimaryButton
                                    style={{ marginRight: "10px" }}
                                    text="Apply"
                                    disabled={disableButton()}
                                    onClick={applyFilter} />
                                <DefaultButton
                                    text="Clear"
                                    disabled={disableButton()}
                                    onClick={clearFilter} />
                            </div>
                        </div>
                    </div>
                </Callout>
            )}
        </>
    );
}

export default FilterModal;