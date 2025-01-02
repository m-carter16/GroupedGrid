import * as React from 'react';
import { IColumn, Label, Link, Stack } from '@fluentui/react';
import { useApiProvider } from '../providers/ApiProvider';
import { gridStyles } from './GridStyles';
import { DataSetRecord } from '../types/AppProps';
import { lookupTypes } from '../types/FilterProps';

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
    const isLookup = column && column.data ? lookupTypes.includes(column.data.dataType) : false;

    // handle primary column
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

        // handle lookup column
        if (isLookup) {
            const entityRef = item.getValue(column.fieldName) as ComponentFramework.EntityReference;
            const entityName = entityRef?.etn;
            const entityId = entityRef?.id.guid
            return (
                <Stack className={gridStyles.itemContainer}>
                    <Link className={gridStyles.link} onClick={() => gridService.navigateToItem(entityName, entityId)}>
                        {item.getFormattedValue(column.fieldName)}
                    </Link>
                </Stack>
            );
        }

        // handle user column (createdby, modifiedby)
        if (column.fieldName === 'createdby' || column.fieldName === 'modifiedby') {
            const entityRef = item.getValue(column.fieldName) as ComponentFramework.EntityReference;
            const entityName = entityRef?.etn;
            const entityId = entityRef?.id.guid
            return (
                <Stack className={gridStyles.itemContainer}>
                    <Link className={gridStyles.link} onClick={() => gridService.navigateToItem(entityName, entityId)}>
                        {item.getFormattedValue(column.fieldName)}
                    </Link>
                </Stack>
            );
        }

        // handle all other columns
        return (
            <Stack className={gridStyles.itemContainer}>
                <Label className={gridStyles.itemLabel} style={{ backgroundColor: fill, padding: padding }}>
                    {item.getFormattedValue(column.fieldName)}
                </Label>
            </Stack>
        );
    }

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

    return (
        <></>
    );
}

export default GridColumnItem;
