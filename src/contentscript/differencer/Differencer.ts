export default class Differencer {
    private a1: {
        id: string;
        info: string;
    }[];
    private a2: {
        id: string;
        info: string;
    }[];
    private addedNodes: {
        id: string;
        info: string;
    }[];
    private removedNodes: {
        id: string;
        info: string;
    }[];
    private changedNodes: {
        id: string;
        info: string;
    }[] = [];

    /**
     * Constructs a Differencer.
     *
     * @param
     */
    constructor(
        a1: {
            id: string;
            info: string;
        }[],
        a2: {
            id: string;
            info: string;
        }[],
    ) {
        this.a1 = a1;
        this.a2 = a2;
        this.computeDifference();
    }

    computeDifference(): void {
        //copy of a2 with intersection of a1 removed
        this.addedNodes = this.a2.filter(item => !this.a1.some(v => item.id === v.id));

        //copy of a1 with intersection of a2 removed
        this.removedNodes = this.a1.filter(item => !this.a2.some(v => item.id === v.id));

        //copy of a2 with non-intersection of a1 removed
        const same = this.a2.filter(item => this.a1.some(v => item.id === v.id));
        for (const entry of same) {
            const itemx = this.a1.find(v => v.id == entry.id);
            if (JSON.stringify(entry) != JSON.stringify(itemx)) this.changedNodes.push(entry);
        }
    }

    getAddedNodes(): {
        id: string;
        info: string;
    }[] {
        return this.addedNodes;
    }

    getRemovedNodes(): {
        id: string;
        info: string;
    }[] {
        return this.removedNodes;
    }

    getChangedNodes(): {
        id: string;
        info: string;
    }[] {
        return this.changedNodes;
    }
}
