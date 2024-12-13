import { IDropdownStyles, mergeStyleSets } from "@fluentui/react";

export const gridStyles = mergeStyleSets({
    controlWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    item: {
        selectors: {
            '&:hover': {
                cursor: 'pointer'
            }
        },
    },
    label: {
        fontSize: '14px',
        paddingTop: '15px',
        paddingLeft: '30px'
    },
    link: {
        fontSize: '14px',
    },
    secondaryLabel: {
        fontSize: '14px',
        paddingTop: '15px'
    },
    loading: {
        position: "absolute",
        width: "100%",
        top: "175px",
        fontSize: "300%"
    },
    noRecords: {
        position: "absolute",
        width: "100%",
        top: "175px",
        fontSize: "300%"
    },
    gridFooter: {
        width: '100%',
        paddingLeft: 8,
        paddingRight: 8
    },
    statusContainer: {
        alignItems: "center",
        color: "#424242",
        display: "flex",
        flex: "0 1 auto",
        fontSize: "14px",
        fontWeight: "normal",
        gap: "20px",
        height: "100%",
        lineHeight: "20px"
    },
    calloutTitleContainer: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottomColor: 'rgb(245, 245, 245)',
        padding: "16px 16px 8px",
    },
    calloutTitle: {
        color: "rgb(20, 20, 20)",
        fontSize: "16px",
        fontWeight: "600",
        flex: "1 1 0%",
    },
    checkboxContainer: {
        display: "flex",
        flexFlow: "row",
        width: "auto",
        height: "100%",
        boxSizing: "border-box",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    itemContainer: {
        display: 'flex',
        flexFlow: 'row',
        width: 'auto',
        height: '100%',
        boxSizing: 'border-box',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: '14px',
        fontWeight: 'normal',
        color: 'rgb(36, 36, 36)',
        boxSizing: 'border-box',
        boxShadow: 'none',
        margin: '0px',
        display: 'block',
        overflowWrap: 'break-word',
        borderRadius: '2px',
        lineHeight: '20px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
});

export const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 200 },
    root: { padding: '10px', textAlign: 'left' }
};