import * as React from 'react';

import { IColumn, Target } from '@fluentui/react';

type WidthModel = {
    columnWidth: string;
    widthTarget: Target | null;
    isWidthCalloutVisible: boolean;
    setClickedColumn: React.Dispatch<React.SetStateAction<IColumn | undefined>>;
    handleWidthChange: (value: string) => void;
    setWidthTarget: React.Dispatch<React.SetStateAction<Target | null>>;
    setWidthCalloutVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const Context = React.createContext({} as WidthModel);

const WidthProvider: React.FC = (props) => {
    const { children } = props;
    const [clickedColumn, setClickedColumn] = React.useState<IColumn | undefined>();
    const [columnWidth, setColumnWidth] = React.useState<string>("0");
    const [widthTarget, setWidthTarget] = React.useState<Target | null>(null);
    const [isWidthCalloutVisible, setWidthCalloutVisible] = React.useState(false);

    const handleWidthChange = (newValue: string) => {
        setColumnWidth(newValue);
        if (clickedColumn) {
            clickedColumn.maxWidth = Number(newValue);
        }
    };

    React.useEffect(() => {
        console.log("columnWidth", columnWidth);
    }, [columnWidth]);

    React.useEffect(() => {
        console.log("clickedColumn", clickedColumn);
        setColumnWidth(clickedColumn?.maxWidth?.toString() ?? "0");
    }, [clickedColumn]);

    return (
        <Context.Provider
            value={{
                columnWidth,
                widthTarget,
                isWidthCalloutVisible,
                setClickedColumn,
                handleWidthChange,
                setWidthTarget,
                setWidthCalloutVisible,
            }}
        >
            {children}
        </Context.Provider>
    );
};

const useWidthProvider = (): WidthModel => React.useContext(Context);
export { WidthProvider, useWidthProvider };
