import * as React from 'react';
import { GridProvider } from './providers/GridProvider';
import Grid from './components/Grid';
import { AppProps } from './types/AppProps';
import { ApiProvider } from './providers/ApiProvider';
import { FilterProvider } from './providers/FilterProvider';
import { WidthProvider } from './providers/WidthProvider';
import { registerIcons } from '@fluentui/react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';


initializeIcons();

// this is the Ungroup.svg in assets folder
registerIcons({
    icons: {
        "ungroup-svg": (
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" focusable="false">
                <path
                    d="M1 5.5c0 .28.22.5.5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Zm0-3c0 .28.22.5.5.5h6a.5.5 0 0 0 0-1h-6a.5.5 0 0 0-.5.5ZM10.75 4C9.78 4 9 4.78 9 5.75v7.5c0 .97.78 1.75 1.75 1.75h1.5c.97 0 1.75-.78 1.75-1.75v-7.5C14 4.78 13.22 4 12.25 4h-1.5ZM13 7h-3V5.75c0-.41.34-.75.75-.75h1.5c.41 0 .75.34.75.75V7Zm-3 1h3v3h-3V8Zm0 4h3v1.25c0 .41-.34.75-.75.75h-1.5a.75.75 0 0 1-.75-.75V12ZM3 8.5a.5.5 0 0 0-1 0V10c0 1.1.9 2 2 2h1.3l-.65.65a.5.5 0 0 0 .7.7l1.5-1.5a.5.5 0 0 0 0-.7l-1.5-1.5a.5.5 0 1 0-.7.7l.64.65H4a1 1 0 0 1-1-1V8.5Z">
                </path>
            </svg>
        ),
    }
});

const App: React.FC<AppProps> = (props) => {

    React.useEffect(() => {
        console.log({ props });
    }, [props]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ApiProvider {...props}>
                <FilterProvider {...props}>
                    <WidthProvider {...props}>
                        <GridProvider {...props} >
                            <Grid {...props} />
                        </GridProvider>
                    </WidthProvider>
                </FilterProvider>
            </ApiProvider>
        </div>
    );
};

export default App;
