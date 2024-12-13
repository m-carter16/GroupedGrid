import { IColumn, Label, Link, Stack } from '@fluentui/react';
import * as React from 'react';
import { useApiProvider } from '../providers/ApiProvider';
import { gridStyles } from './GridStyles';
import { DataSetRecord } from '../types/AppProps';

type GridColumnItemProps = {
    item: DataSetRecord | undefined;
    column: IColumn | undefined;
    onNavigate: (item: DataSetRecord) => void;
}

const GridColumnItem: React.FC<GridColumnItemProps> = (props) => {
    const { item, column, onNavigate } = props;
    const { gridService } = useApiProvider();
    const [fill, setFill] = React.useState<string>('transparent');
    const [padding, setPadding] = React.useState<string>('4px 0px');

    React.useEffect(() => {
        const getOptionFill = async () => {
            if (column && column.data.dataType === 'OptionSet' && item) {
                if (column.fieldName) {
                    const color = await gridService.getOptionColor(column.data.name, item.getFormattedValue(column.fieldName));
                    setFill(color === "black" ? "transparent" : color);
                }
                setPadding('4px 8px');
            }
        };

        getOptionFill();
    }, [column, item, gridService]);

    if (column && column.fieldName && item) {
        if (column.data.isPrimary) {
            return (
                <Stack className={gridStyles.itemContainer}>
                    <Link className={gridStyles.link} onClick={() => onNavigate(item)}>
                        {item.getFormattedValue(column.fieldName)}
                    </Link>
                </Stack>
            );
        }

        return (
            <Stack className={gridStyles.itemContainer}>
                <Label className={gridStyles.itemLabel} style={{ backgroundColor: fill, padding: padding }}>
                    {item.getFormattedValue(column.fieldName)}
                </Label>
            </Stack>
        );
    }

    return (
        <></>
    );
}

export default GridColumnItem;
