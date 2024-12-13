import * as React from 'react';
import { IBasePicker, IBasePickerSuggestionsProps, ITag, TagPicker, ValidationState } from '@fluentui/react';
import { useApiProvider } from '../providers/ApiProvider';
import { useFilterProvider } from '../providers/FilterProvider';

const LookupPicker: React.FC = () => {
    const { filterColumn, setFilterValue } = useFilterProvider();
    const { gridService } = useApiProvider();
    const picker = React.useRef<IBasePicker<ITag>>(null);
    const suggestionProps: IBasePickerSuggestionsProps = {
        noResultsFoundText: 'No results found',
        loadingText: 'Loading'
    };

    const onFilterChanged = async (filterText: string, tagList: ITag[] | undefined): Promise<ITag[]> => {
        if (filterText && filterColumn && filterColumn.fieldName) {
            const lookupOptions = await gridService.searchLookup(filterColumn.fieldName, filterText);
            return lookupOptions.map((option) => ({ key: option.id, name: option.name }));
        }
            return [];
    };

    // const getTextFromItem = (item: ITag) => item.name;

    const onItemSelected = (item: any): Promise<ITag> => {
        const value = "{" + item.key + "}";
        setFilterValue(value);
        const processedItem = { ...item };
        processedItem.text = `${item.text}`;
        return new Promise<ITag>((resolve, reject) =>
          resolve(processedItem));
    };

    const validateInput = (input: string): ValidationState => {
        if (input.indexOf('@') !== -1) {
            return ValidationState.valid;
        } else if (input.length > 1) {
            return ValidationState.warning;
        } else {
            return ValidationState.invalid;
        }
    };

    return (
        <div style={{ marginBottom: "15px" }}>
            <TagPicker
                componentRef={picker}
                onResolveSuggestions={onFilterChanged}
                // getTextFromItem={getTextFromItem}
                pickerSuggestionsProps={suggestionProps}
                className={'ms-PeoplePicker'}
                onValidateInput={validateInput}
                removeButtonAriaLabel={'Remove'}
                onItemSelected={onItemSelected}
                inputProps={{
                    onBlur: (ev: React.FocusEvent<HTMLInputElement>) => { },
                    onFocus: (ev: React.FocusEvent<HTMLInputElement>) => { },
                    'aria-label': 'People Picker',
                }}
                resolveDelay={300}
            />
        </div>
    );
};

export default LookupPicker;
