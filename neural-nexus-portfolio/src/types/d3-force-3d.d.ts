// Type declarations for d3-force-3d
declare module "d3-force-3d" {
  interface Simulation {
    force(name: string, force: unknown): this;
    tick(iterations?: number): this;
    stop(): this;
  }
  interface ManyBodyForce {
    strength(value: number): this;
  }
  interface LinkForce<NodeDatum, LinkDatum> {
    id(accessor: (node: NodeDatum) => string): this;
    distance(value: number | ((link: LinkDatum) => number)): this;
    strength(value: number): this;
  }
  interface CollisionForce {
    radius(value: number): this;
    strength(value: number): this;
  }
  export function forceSimulation<NodeDatum>(
    nodes?: NodeDatum[],
    numDimensions?: number
  ): Simulation;

  export function forceManyBody(): ManyBodyForce;

  export function forceLink<NodeDatum, LinkDatum>(
    links?: LinkDatum[]
  ): LinkForce<NodeDatum, LinkDatum>;

  export function forceCenter(x?: number, y?: number, z?: number): unknown;

  export function forceCollide(): CollisionForce;
}
