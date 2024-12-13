export type XrmConditionExpression = ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;
export type XrmConditionOperator = ComponentFramework.PropertyHelper.DataSetApi.Types.ConditionOperator;
export type XrmFilterExpression = ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;

export const mapFilterConditionToConditionOperator = (filterCondition: string): XrmConditionOperator => {
    return parseInt(filterCondition) as XrmConditionOperator;
};

export type ColumnFilterOption = {
    name: string;
    columnTypes: string[];
    operator: FilterConditionOperator;
    value: string;
};

export const textTypes = ["SingleLine.Text", "SingleLine.Email", "SingleLine.Phone", "SingleLine.Url",
    "MultipleLines.Text", "MultipleLines.Email", "MultipleLines.Phone", "MultipleLines.Url",
    "MultipleLines.TextArea"];
export const numberTypes = ["Whole.None", "Decimal.None", "Double.None", "Integer.None", "Money.None"];
export const dateTypes = ["DateAndTime.DateOnly", "DateAndTime.DateAndTime"];
export const lookupTypes = ["Lookup.Simple", "Lookup.Owner"];
export const optionTypes = ["OptionSet", "TwoOptions"];

export enum FilterConditionOperator {
    Equal = "0",
    NotEqual = "1",
    Like = "6",
    NotLike = "7",
    In = "8",
    NotIn = "9",
    Null = "12",
    NotNull = "13",
    Contains = "49", // only KBArticle table
    DoesNotContain = "50",
    BeginsWith = "54",
    DoesNotBeginWith = "55",
    DoesNotEndWith = "57",
    EndsWith = "56",
    
    // date only
    Yesterday = "14",
    Today = "15",
    Tomorrow = "16",
    Last7Days = "17",
    Next7Days = "18",
    LastWeek = "19",
    ThisWeek = "20",
    LastMonth = "22",
    ThisMonth = "23",
    On = "25",
    OnOrBefore = "26",
    OnOrAfter = "27",
    LastYear = "28",
    ThisYear = "29",
    LastXDays = "33",
    NextXDays = "34",
    LastXMonths = "37",
    NextXMonths = "38",
    InFiscalPeriodAndYear = "70",
    // number
    GreaterThan = "2",
    LessThan = "3",
    GreaterEqual = "4",
    LessEqual = "5",
    Above = "75",
    Under = "76",
    NotUnder = "77",
    AboveOrEqual = "78",
    UnderOrEqual = "79",
}