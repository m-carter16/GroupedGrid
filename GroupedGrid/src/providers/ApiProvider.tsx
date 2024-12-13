import * as React from 'react';
import { GridService } from "../api/GridService";
import { DataSetColumn, PcfContext } from "../types/AppProps";

type ApiModel = {
  gridService: GridService;
};

type ApiProviderProps = {
  context: PcfContext;
  entity: string;
  columns: DataSetColumn[];
};

const Context = React.createContext({} as ApiModel);
const ApiProvider: React.FC<ApiProviderProps> = (props) => {
  const { context, entity, columns, children } = props;
  const [gridService] = React.useState<GridService>(new GridService(context, entity, columns));

  return (
    <Context.Provider
      value={{
        gridService,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useApiProvider = (): ApiModel => React.useContext(Context);
export { ApiProvider, useApiProvider };
