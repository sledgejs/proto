import { Maybe } from '../core/types';
import { ComponentColor, ComponentSize, ComponentVariant } from './componentSchema';

export function getComponentVariantFromClassName(className: Maybe<string>): ComponentVariant | null {
  className = className?.toLowerCase();
  for (const variant of Object.keys(ComponentVariant)) {
    if (className?.includes(variant.toLowerCase()))
      return variant as ComponentVariant;
  }

  return null;
}

export function getComponentColorFromClassName(className: Maybe<string>): ComponentColor | null {
  className = className?.toLowerCase();
  for (const color of Object.keys(ComponentColor)) {
    if (className?.includes(color.toLowerCase()))
      return color as ComponentColor;
  }

  return null;
}

export function getComponentSizeFromClassName(className: Maybe<string>): ComponentSize | null {
  className = className?.toLowerCase();
  for (const size of Object.keys(ComponentSize)) {
    if (className?.includes(size.toLowerCase()))
      return size as ComponentSize;
  }

  return null;
}