export enum ComponentColor {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Tertiary = 'Tertiary',
  Nuclear = 'Nuclear',
  Error = 'Error',
  Warning = 'Warning',
  Success = 'Success'
}

export enum ComponentSize {
  Tiny = 'Tiny',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Huge = 'Huge'
}

export type ComponentSizeKey =
  'tiny' |
  'small' |
  'medium' |
  'large' |
  'huge';

// TODO: remove enums
export const ComponentSizes = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge'
] as const;

export enum ComponentVariant {
  Text = 'Text',
  Fill = 'Fill',
  Inverse = 'Inverse'
}

export enum ComponentLayout {
  Button = 'Button',
  IconButton = 'IconButton',
  Link = 'Link',
  LinkButton = 'LinkButton'
}

export enum ComponentState {
  Default = 'Default',
  Hover = 'Hover',
  Focus = 'Focus',
  Active = 'Active',
  Disabled = 'Disabled'
}