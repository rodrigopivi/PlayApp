///<reference path="../typings/react/react.d.ts" />

declare module 'react-relay' {
    export = ReactRelay
}
declare namespace ReactRelay {
    interface MutationRequest {
        getQueryString(): string;
        getVariables(): { [name: string]: any };
        getFiles(): { [key: string]: File };
        getID(): string;
        getDebugName(): string;
    }
    interface QueryRequest {
        getQueryString(): string;
        getVariables(): { [name: string]: any };
        getID(): string;
        getDebugName(): string;
    }
    export class PropTypes {
        static Container: Container<any>;
        static QueryConfig: Route;
    }
    export class Store {
        static commitUpdate(mutation: Mutation, callbacks?: {
            onFailure?: (transaction: MutationTransaction) => void;
            onSuccess?: (response: Object) => void;
        }): MutationTransaction;
        static applyUpdate(mutation: Mutation, callbacks?: {
            onFailure?: (transaction: MutationTransaction) => void;
            onSuccess?: (response: Object) => void;
        }): MutationTransaction;
    }
    type Transaction = {
        getError(): Error;
    }
    interface MutationTransaction {

    }

    interface QLExpression {

    }
    export function QL(...params: Array<any>): QLExpression;
    interface RouteQueries { [queryName: string]: (component?) => QLExpression }

    export class Route {
        static paramDefinitions: { [param: string]: { required: boolean } };
        static queries: RouteQueries;
        static routeName: string;
        constructor(params?: { [param: string]: any });
    }
    interface QueryFragments {
        [propName: string]: (variables: { [name: string]: any }) => QLExpression
    }

    interface ContainerConfig {
        initialVariables?: Object;
        prepareVariables?: (variables: Object, route: string) => Object;
        fragments: { [key: string]: Function };
    }
    interface MutationFragments {

    }
    interface Variables { }
    interface ConcreteNode { }

    type FragmentBuilder = (variables: Variables) => ConcreteNode;
    type RelayMutationFragments = {
        [index: string]: FragmentBuilder;
    };
    export class Mutation {
        constructor(props?);
        props: any;
        static fragments: MutationFragments;
    }

    class NetworkLayer {
        sendMutation(mutationRequest: MutationRequest): Promise<any>;
        sendQueries(queryRequests: Array<QueryRequest>): Promise<any>;
        supports(...options: Array<string>): boolean;
    }
    export class DefaultNetworkLayer extends NetworkLayer {
        constructor(address: string, config?: {
            fetchTimeout?: number;
            retryDelays?: Array<number>;
            headers?: { [index: string]: string };
            credentials?: string;
        })
        _sendQuery(request: QueryRequest): Promise<any>
    }
    interface RootContainerClass extends __React.ComponentClass<{
        Component: Container<any>;
        route: Route;
        forceFetch?: boolean;
        renderLoading?(): __React.ReactElement<any>;
        renderFetched?(
            data: { [propName: string]: any },
            readyState: { stale: boolean }
        ): __React.ReactElement<any>;
        renderFailure?(error: Error, retry: Function): __React.ReactElement<any>;
        onReadyStateChange?(
            readyState: {
                aborted: boolean;
                done: boolean;
                error: Error;
                ready: boolean;
                stale: boolean;
            }
        ): void;
    }> { }
    export var RootContainer: RootContainerClass;
    interface ContainerComponent extends __React.Component<any, any> {
        fragments: QueryFragments;
        initialVariables: { [name: string]: any };
        prepareVariables: (prevVariables: { [name: string]: any }) => { [name: string]: any };
        route: Route;
        variables: { [name: string]: any };
        setVariables(partialVariables?: Object, onReadyStateChange?: Function): void;
        forceFetch(partialVariables?: Object, onReadyStateChange?: Function): void;
        hasOptimisticUpdate(record: Object): boolean;
        getPendingTransactions(record: Object): Array<MutationTransaction>;

    }
    export interface Container<T> extends __React.ComponentClass<T> {
        new (props?: T): ContainerComponent;
    }

    export function createContainer(Component: __React.ComponentClass<any>, ContainerConfig: ContainerConfig): any;
    export function injectNetworkLayer(networkLayer: NetworkLayer): any;
    export function injectTaskScheduler(scheduler): any;
    export function isContainer(Component): any;
}
