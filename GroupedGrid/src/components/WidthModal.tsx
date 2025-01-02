import * as React from 'react';

import { Callout, DirectionalHint, IconButton, Target, TextField } from '@fluentui/react';
import { gridStyles } from './GridStyles';
import { useWidthProvider } from '../providers/WidthProvider';

const WidthModal: React.FC = () => {
    const {
        columnWidth, isWidthCalloutVisible, widthTarget, handleWidthChange, setWidthCalloutVisible
    } = useWidthProvider();

    return (
        <>
            {isWidthCalloutVisible && widthTarget && (
                <Callout
                    target={widthTarget as Target}
                    onDismiss={() => setWidthCalloutVisible(false)}
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
                                onClick={() => setWidthCalloutVisible(false)} />
                        </div>
                        <div style={{ padding: "8px 16px 16px" }}>
                            <TextField
                                styles={{ root: { marginBottom: "15px" } }}
                                type="number"
                                defaultValue={columnWidth}
                                onChange={(e, newValue) => handleWidthChange(newValue ?? "0")}

                            />
                        </div>
                    </div>
                </Callout>
            )}
        </>
    );
};

export default WidthModal;
