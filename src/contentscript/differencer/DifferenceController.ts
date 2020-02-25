// Update these file locations as necessary
import { ChangeLog } from './ChangeLog';
import { Graph } from 'contentscript/graph/Graph';
import { Panel } from 'contentscript/VisualDifferencerCreator';
import { createPanels } from './VisualDifferenceCreator';
import { createTextDifference } from './TextDifferenceCretaor';
import { difference } from './ContentDifferencer';

export class DifferenceController {
    
    public differencedGraph: Graph;
    public baseGraph: Graph;
    public compareGraph: Graph;
    private textDifference: ChangeLog;
    private visualDifference: Panel;

    constructor( baseGraph: Graph, compareGraph: Graph) {
        this.baseGraph = baseGraph;
        this.compareGraph = compareGraph;
        this.differencedGraph = difference( baseGraph, compareGraph );
    }
    
    parse(parseString: String): Graph {
        return new Graph( parseString );
    }

    createDifference(graph1: Graph, graph2, Graph): Graph {
        this.differencedGraph = difference( graph1, graph2 );
        return this.differencedGraph;
    }

    getTextDifference(): ChangeLog {
        if ( this.textDifference ) {
            return this.textDifference;
        } else {
            this.textDifference = createTextDifference( this.differencedGraph );
            return this.textDifference;
        }
    }

    getVisualDifference(): Panel {
        if ( this.visualDifference ) {
            return this.visualDifference;
        } else {
            this.visualDifference = createPanels( this.differencedGraph );
            return this.visualDifference;
        }
    }
}