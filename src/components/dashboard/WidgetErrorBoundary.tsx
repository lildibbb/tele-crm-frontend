"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="flex items-center justify-center p-6 min-h-[120px]">
          <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{this.props.widgetName ?? "Widget"} failed to load</p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
