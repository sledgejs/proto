export enum ButtonStyle {
  Primary = 'Primary',
  Secondary = 'Secondary'
}

export type ButtonRenderProps = {
  className: string;
  showStartIcon: boolean;
  showEndIcon: boolean;
  children: React.ReactNode;
}