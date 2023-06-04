export enum ButtonStyle {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Tertiary = 'Tertiary',
  Nuclear = 'Nuclear' 
}

export type ButtonRenderProps = {
  className: string;
  showStartIcon: boolean;
  showEndIcon: boolean;
  children: React.ReactNode;
}