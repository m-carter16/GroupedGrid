import * as React from "react";
import * as ReactDOM from 'react-dom';
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import App from "./src/App";
import { AppProps } from "./src/types/AppProps";
import { mapFilterConditionToConditionOperator, XrmConditionExpression, XrmConditionOperator, XrmFilterExpression } from "./src/types/FilterProps";
import GridLoading from "./src/components/GridLoading";

export class GroupedGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    notifyOutputChanged: () => void;
    container: HTMLDivElement;
    context: ComponentFramework.Context<IInputs>;
    sortedRecordIds: string[] = [];
    resources: ComponentFramework.Resources;
    isTestHarness: boolean;
    records: {
        [id: string]: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
    };
    currentPage = 1;
    // filteredRecordCount?: number;
    isFullScreen = false;

    setSelectedRecords = (ids: string[]): void => {
        this.context.parameters.dataset.setSelectedRecordIds(ids);
    };

    onNavigate = (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): void => {
        if (item) {
            this.context.parameters.dataset.openDatasetItem(item.getNamedReference());
        }
    };

    onSort = (name: string, desc: boolean): void => {
        const sorting = this.context.parameters.dataset.sorting ? this.context.parameters.dataset.sorting : [];
        while (sorting.length > 0) {
            sorting.pop();
        }
        sorting.push({
            name: name,
            sortDirection: desc ? 1 : 0,
        });
        this.context.parameters.dataset.refresh();
    };

    onFilter = (name: string, operator: string, value: string | string[], filter: boolean, entityAlias?: string): void => {
        const filtering = this.context.parameters.dataset.filtering;
        const conditionOperator: XrmConditionOperator = mapFilterConditionToConditionOperator(operator);
        const condition: XrmConditionExpression = {
            attributeName: name,
            conditionOperator: conditionOperator,
            value: value,
        };
        
        if (entityAlias) {
            condition.entityAliasName = entityAlias;
        }

        if (filter) {
            filtering.setFilter({
                conditions: [
                    condition
                ],
            } as XrmFilterExpression);
        } else {
            filtering.clearFilter();
        }
        this.context.parameters.dataset.refresh();
    };

    loadFirstPage = (): void => {
        this.currentPage = 1;
        this.context.parameters.dataset.paging.loadExactPage(1);
    };

    loadNextPage = (): void => {
        this.currentPage++;
        this.context.parameters.dataset.paging.loadExactPage(this.currentPage);
    };

    loadPreviousPage = (): void => {
        this.currentPage--;
        this.context.parameters.dataset.paging.loadExactPage(this.currentPage);
    };

    onFullScreen = (): void => {
        this.context.mode.setFullScreen(true);
    };
    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this.container = container;
        this.context = context;
        this.context.mode.trackContainerResize(true);
        this.resources = context.resources;
        this.isTestHarness = document.getElementById("control-dimensions") !== null;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        if (!context.parameters.dataset.loading) {
            if (context.parameters.dataset.paging != null && context.parameters.dataset.paging.hasNextPage == true) {
                context.parameters.dataset.paging.setPageSize(5000);
                context.parameters.dataset.paging.loadNextPage();
            }
            else {
                const dataset = context.parameters.dataset;
                const groupingColumn = dataset.columns.find((column) => column.alias ==="groupingColumn");
                const groupingColumn2 = dataset.columns.find((column) => column.alias ==="groupingColumn2");             
                
                const paging = context.parameters.dataset.paging;
                const entities = context.parameters.dataset.linking.getLinkedEntities()
                // The test harness provides width/height as strings
                // const allocatedWidth = parseInt(context.mode.allocatedWidth as unknown as string);
                // const allocatedHeight = parseInt(context.mode.allocatedHeight as unknown as string);

                const props: AppProps = {
                    context: context,
                    entity: (context.mode as any).contextInfo.entityTypeName,
                    width: context.mode.allocatedWidth,
                    height: context.mode.allocatedHeight,
                    columns: dataset.columns,
                    records: dataset.records,
                    linkedEntities: entities,
                    sortedRecordIds: dataset.sortedRecordIds,
                    hasNextPage: paging.hasNextPage,
                    hasPreviousPage: paging.hasPreviousPage,
                    currentPage: this.currentPage,
                    totalResultCount: paging.totalResultCount,
                    sorting: dataset.sorting,
                    filtering: dataset.filtering && dataset.filtering.getFilter(),
                    resources: this.resources,
                    itemsLoading: dataset.loading,
                    setSelectedRecords: this.setSelectedRecords,
                    onNavigate: this.onNavigate,
                    onSort: this.onSort,
                    onFilter: this.onFilter,
                    loadFirstPage: this.loadFirstPage,
                    loadNextPage: this.loadNextPage,
                    loadPreviousPage: this.loadPreviousPage,
                    isFullScreen: this.isFullScreen,
                    onFullScreen: this.onFullScreen,
                    groupingColumn: groupingColumn ? groupingColumn.name : "", // context.parameters.groupingColumn.raw || "",
                    groupingColumn2: groupingColumn2 ? groupingColumn2.name : "", // context.parameters.groupingColumn2.raw || "",
                    allowGroupChange: context.parameters.allowGroupChange.raw === "1",
                    collapsed: context.parameters.collapsed.raw ? context.parameters.collapsed.raw === "1" : true,
                };
                ReactDOM.render(
                    React.createElement(
                        App, props
                    ), this.container);
            }
        } else {
            ReactDOM.render(
                React.createElement(
                    GridLoading, {}
                ), this.container);
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        ReactDOM.unmountComponentAtNode(this.container);
    }
}
