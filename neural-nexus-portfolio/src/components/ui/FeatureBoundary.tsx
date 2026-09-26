import { Component, type ReactNode } from "react";

interface FeatureBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

/** An optional visual feature must not take down the portfolio's HTML navigation. */
export class FeatureBoundary extends Component<FeatureBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
