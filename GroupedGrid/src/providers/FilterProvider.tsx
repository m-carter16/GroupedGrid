import * as React from 'react';
import { IColumn, Target, IDropdownOption, IComboBoxOption, IComboBox } from '@fluentui/react';
import { dateTypes, FilterConditionOperator, lookupTypes, numberTypes, optionTypes, textTypes } from '../types/FilterProps';
import { useApiProvider } from './ApiProvider';

type FilterModel = {
    isFilterCalloutVisible: boolean;
    filterColumn: IColumn | undefined;
    filterTarget: Target | undefined;
    filterValue: string | string[];
    conditionOptions: IDropdownOption[];
    selectedOperator: IDropdownOption;
    filterOptions: IComboBoxOption[];
    columnDataType: string | undefined;
    selectedKeys: string[];
    setSelectedOperator: React.Dispatch<React.SetStateAction<IDropdownOption>>;
    setFilterColumn: React.Dispatch<React.SetStateAction<IColumn | undefined>>;
    setFilterTarget: React.Dispatch<React.SetStateAction<Target | undefined>>;
    setFilterValue: React.Dispatch<React.SetStateAction<string | string[]>>;
    applyFilter: () => void;
    clearFilter: () => void;
    onFilter: (name: string, operator: string, value: string | string[], filter: boolean) => void;
    setFilterCalloutVisible: React.Dispatch<React.SetStateAction<boolean>>;
    handleOptionChange: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => void;
};

type FilterProviderProps = {
    onFilter: (name: string, operator: string, value: string | string[], filter: boolean) => void;
};

const Context = React.createContext({} as FilterModel);
const FilterProvider: React.FC<FilterProviderProps> = (props) => {
    const { onFilter, children } = props;
    const { gridService } = useApiProvider();
    const [isFilterCalloutVisible, setFilterCalloutVisible] = React.useState(false);
    const [filterColumn, setFilterColumn] = React.useState<IColumn | undefined>(undefined);
    const [filterTarget, setFilterTarget] = React.useState<Target | undefined>(undefined);
    const [filterValue, setFilterValue] = React.useState<string | string[]>("");
    const defaultOperator = { key: FilterConditionOperator.Equal, text: "Equals" };
    const [selectedOperator, setSelectedOperator] = React.useState<IDropdownOption>(defaultOperator);
    const [filterOptions, setFilterOptions] = React.useState<IComboBoxOption[]>([]);
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

    const columnDataType = React.useMemo((): "Text" | "Number" | "Lookup" | "Date" | "OptionSet" | undefined => {
        const dataType = filterColumn?.data.dataType;
        if (textTypes.includes(dataType)) return "Text";
        if (numberTypes.includes(dataType)) return "Number";
        if (lookupTypes.includes(dataType)) return "Lookup";
        if (dateTypes.includes(dataType)) return "Date";
        if (optionTypes.includes(dataType)) return "OptionSet";
        return undefined;
    }, [filterColumn]);

    const applyFilter = () => {
        if (filterColumn && selectedOperator) {
            let newFilterValue = filterValue;
            
            if ((selectedOperator.key === FilterConditionOperator.Like
                || selectedOperator.key === FilterConditionOperator.NotLike)
                && columnDataType === "Text") {
                newFilterValue = "%" + filterValue;
            }

            onFilter("", "", "", false);
            filterColumn.isFiltered = true;
            // console.log("🚀 ~ file: FilterProvider.tsx:66 ~ applyFilter ~ newFilterValue:", newFilterValue);
            // console.log("🚀 ~ file: FilterProvider.tsx:66 ~ applyFilter ~ selectedOperator.key:", selectedOperator.key);
            // console.log("🚀 ~ file: FilterProvider.tsx:66 ~ applyFilter ~ filterColumn.key:", filterColumn.key);
            onFilter(filterColumn.key, selectedOperator.key as string, newFilterValue, true);
            setFilterCalloutVisible(false);
        }
    };

    const clearFilter = () => {
        if (filterColumn) {
            filterColumn.isFiltered = false;
            onFilter("", "", "", false);
            setFilterCalloutVisible(false);
        }
    };

    const conditionOptions = React.useMemo(() => {
        if (columnDataType === "Date") {
            return [
                { key: FilterConditionOperator.On, text: "On" },
                { key: FilterConditionOperator.OnOrAfter, text: "On or after" },
                { key: FilterConditionOperator.OnOrBefore, text: "On or before" },
                { key: FilterConditionOperator.Today, text: "Today" },
                { key: FilterConditionOperator.Yesterday, text: "Yesterday" },
                { key: FilterConditionOperator.Tomorrow, text: "Tomorrow" },
                { key: FilterConditionOperator.ThisWeek, text: "This week" },
                { key: FilterConditionOperator.ThisMonth, text: "This month" },
                { key: FilterConditionOperator.ThisYear, text: "This year" },
            ];
        }

        if (columnDataType === "Number") {
            return [
                { key: FilterConditionOperator.Equal, text: "Equals" },
                { key: FilterConditionOperator.NotEqual, text: "Does not equal" },
                { key: FilterConditionOperator.NotNull, text: "Contains data" },
                { key: FilterConditionOperator.Null, text: "Does not contain data" },
                { key: FilterConditionOperator.GreaterThan, text: "Greater than" },
                { key: FilterConditionOperator.GreaterEqual, text: "Greater than or equal to" },
                { key: FilterConditionOperator.LessThan, text: "Less than" },
                { key: FilterConditionOperator.LessEqual, text: "Less than or equal to" },
            ];
        }

        if (columnDataType === "OptionSet") {
            return [
                { key: FilterConditionOperator.In, text: "Equals" },
                { key: FilterConditionOperator.NotIn, text: "Does not equal" },
                { key: FilterConditionOperator.NotNull, text: "Contains data" },
                { key: FilterConditionOperator.Null, text: "Does not contain data" },
            ];
        }

        if (columnDataType === "Lookup") {
            return [
                { key: FilterConditionOperator.Equal, text: "Equals" },
                { key: FilterConditionOperator.NotEqual, text: "Does not equal" },
                { key: FilterConditionOperator.NotNull, text: "Contains data" },
                { key: FilterConditionOperator.Null, text: "Does not contain data" },
            ];
        }

        if (columnDataType === "Text") {
            return [
                { key: FilterConditionOperator.Equal, text: "Equals" },
                { key: FilterConditionOperator.NotEqual, text: "Does not equal" },
                { key: FilterConditionOperator.Like, text: "Contains" },
                { key: FilterConditionOperator.NotLike, text: "Does not contain" },
                { key: FilterConditionOperator.BeginsWith, text: "Begins with" },
                { key: FilterConditionOperator.DoesNotBeginWith, text: "Does not begin with" },
                { key: FilterConditionOperator.EndsWith, text: "Ends with" },
                { key: FilterConditionOperator.DoesNotEndWith, text: "Does not end with" },
                { key: FilterConditionOperator.NotNull, text: "Contains data" },
                { key: FilterConditionOperator.Null, text: "Does not contain data" },
            ];
        }
        return [];
    }, [columnDataType]);

    const handleOptionChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
        const selected = option?.selected;
        if (option) {
            setSelectedKeys(prevSelectedKeys =>
                selected ? [...prevSelectedKeys, option!.key as string] : prevSelectedKeys.filter(k => k !== option!.key),
            );
        }
    };

    React.useEffect(() => {
        const getOptionSetOptions = async () => {
            if (filterColumn && columnDataType === "OptionSet") {
                const _options = await gridService.getOptionSet(filterColumn.key);
                // console.log("🚀 ~ file: FilterProvider.tsx:121 ~ getOptionSetOptions ~ _options:", _options);
                const _optionSetOptions = _options.map((o) => ({ key: o.Value, text: o.Label }));
                // console.log("🚀 ~ file: FilterProvider.tsx:71 ~ getOptionSetOptions ~ _optionSetOptions:", _optionSetOptions);
                setFilterOptions(_optionSetOptions);
            }
        };

        getOptionSetOptions();
    }, [filterColumn, gridService]);

    React.useEffect(() => {
        setFilterValue(selectedKeys);
    }, [selectedKeys]);

    React.useEffect(() => {
        switch (columnDataType) {
            case "Date":
                setSelectedOperator({ key: FilterConditionOperator.On, text: "On" });
                break;
            case "OptionSet":
                setSelectedOperator({ key: FilterConditionOperator.In, text: "Equals" });
                break;
            default:
                setSelectedOperator({ key: FilterConditionOperator.Equal, text: "Equals" });
                break;
        }
    }, [columnDataType]);

    return (
        <Context.Provider
            value={{
                isFilterCalloutVisible,
                filterColumn,
                filterTarget,
                filterValue,
                selectedOperator,
                conditionOptions,
                filterOptions,
                columnDataType,
                selectedKeys,
                applyFilter,
                clearFilter,
                setFilterValue,
                setFilterColumn,
                setFilterTarget,
                setSelectedOperator,
                onFilter,
                setFilterCalloutVisible,
                handleOptionChange,
            }}
        >
            {children}
        </Context.Provider>
    );
};

const useFilterProvider = (): FilterModel => React.useContext(Context);
export { FilterProvider, useFilterProvider };
