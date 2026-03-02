/**
 * Typed interfaces for Recharts tooltip callback props.
 * Replace `any` in chart tooltip components with these types.
 */

export interface ChartTooltipEntry {
  name: string;
  value: number;
  color: string;
  stroke?: string;
  fill?: string;
  dataKey: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
}
