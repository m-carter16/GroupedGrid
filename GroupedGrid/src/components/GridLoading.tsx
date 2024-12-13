import * as React from 'react';
import { Stack, Spinner } from '@fluentui/react';
import { gridStyles } from './GridStyles';

const GridLoading = () => {
    return (
        <Stack grow verticalAlign="center" className={gridStyles.loading}>
            <Spinner label="Loading..." ariaLive="assertive" labelPosition="right" />
        </Stack>
    );
}

export default GridLoading;
