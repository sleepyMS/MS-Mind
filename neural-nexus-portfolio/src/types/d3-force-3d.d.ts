// Type declarations for d3-force-3d
declare module "d3-force-3d" {
  export function forceSimulation<NodeDatum>(
    nodes?: NodeDatum[],
    numDimensions?: number
  ): {
    force(name: string, force: unknown): unknown;
    tick(): void;
    stop(): void;
  };

  export function forceManyBody(): {
    strength(value: number): unknown;
  };

  export function forceLink<NodeDatum, LinkDatum>(
    links?: LinkDatum[]
  ): {
    id(accessor: (d: NodeDatum) => string): unknown;
    distance(value: number | ((link: LinkDatum) => number)): unknown;
    strength(value: number): unknown;
  };

  export function forceCenter(x?: number, y?: number, z?: number): unknown;

  export function forceCollide(): {
    radius(value: number): unknown;
    strength(value: number): unknown;
  };
}
