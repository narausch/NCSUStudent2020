import { Status } from '../graph/Status';
import { GraphNode } from '../graph/GraphNode';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default class NodeDifferencer {
    private node1: GraphNode;
    private node2: GraphNode;
    private nodeMap: Map<any, any>;

    /**
     * Constructs a Differencer.
     *
     * @param
     */
    constructor(node1: GraphNode | null, node2: GraphNode | null) {
        if (!(node1 as GraphNode) || !(node2 as GraphNode)) {
            throw 'Invalid argument. GraphNodes expected.';
        }
        // if (this.isValue(node1) || this.isValue(node2)) {
        //     return {
        //         type: this.compareValues(node1, node2),
        //         data: node1 === undefined ? node2 : node1,
        //     };
        // }

        const diff = {};
        for (const key in node1) {
            // if (this.isFunction(node1[key])) {
            //     continue;
            // }

            let value2 = undefined;
            if (node2[key] !== undefined) {
                value2 = node2[key];
            }

            diff[key] = this.nodeMap.set(node1[key], value2);
        }
        for (const key in node2) {
            if (this.isFunction(node2[key]) || diff[key] !== undefined) {
                continue;
            }

            diff[key] = this.nodeMap.set(undefined, node2[key]);
        }
    }

    compareValues(value1: any, value2: any): Status {
        if (value1 === value2) {
            return Status.Unmodified;
        }
        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
            return Status.Unmodified;
        }
        if (value1 === undefined) {
            return Status.Added;
        }
        if (value2 === undefined) {
            return Status.Removed;
        }
        return Status.Modified;
    }

    isFunction(x: any): boolean {
        return Object.prototype.toString.call(x) === '[object Function]';
    }
    isArray(x: any): boolean {
        return Object.prototype.toString.call(x) === '[object Array]';
    }
    isDate(x: any): boolean {
        return Object.prototype.toString.call(x) === '[object Date]';
    }
    isObject(x: any): boolean {
        return Object.prototype.toString.call(x) === '[object Object]';
    }
    isValue(x: any): boolean {
        return !this.isObject(x) && !this.isArray(x);
    }

    // deepDiffMapper = (function() {
    //     return {
    //         map: function(node1: GraphNode, node2: GraphNode) {

    //             return diff;
    //         },

    //     };
    // })();
}
