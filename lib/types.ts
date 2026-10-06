import type { IconName } from '@/lib/icons';

export type { IconName };

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  description: string;
  /** Position on the ecosystem map, in percent of the map box. */
  x: number;
  y: number;
};

export type FlowKey = 'cms' | 'bayar' | 'ig' | 'ppdb' | 'payroll' | 'hadir' | 'rapor' | 'ttd' | 'wa';

export type Feature = {
  id: string;
  name: string;
  category: string;
  icon: IconName;
  description: string;
  /** Capabilities verified from the Laravel repository. */
  capabilities: string[];
  /** Primary operator persona, from the audit. */
  users: string;
  /** Key of the interactive flow simulator, when one exists. */
  flow?: FlowKey;
};

export type AdminField = [label: string, value: string, active?: boolean];

export type PublicView =
  | { kind: 'empty'; message: string }
  | { kind: 'page'; label: string; headline: string; body: string };

export type FlowStep = {
  title: string;
  action: string;
  system: string;
  result: string;
  fields: AdminField[];
  badge: [label: string, tone: '' | 'g' | 'y'];
  button: string;
  publicView: PublicView;
};

export type Flow = {
  key: FlowKey;
  title: string;
  leftLabel: string;
  rightLabel: string;
  /** Service, route, and storage evidence backing the flow. */
  evidence: string;
  /** [what changed, where it is visible] */
  results: [string, string];
  steps: FlowStep[];
};

export type Stat = {
  value: string;
  label: string;
};

export type Audience = {
  icon: IconName;
  title: string;
  body: string;
};

export type StackItem = string;