import classNames from 'classnames';
import { ComponentColor, ComponentSize, ComponentVariant } from '../componentSchema';
import { getComponentColorFromClassName, getComponentSizeFromClassName, getComponentVariantFromClassName } from '../componentUtils';
import { ButtonProps } from './button';
import { ButtonRenderProps } from './buttonSchema';

export function getButtonRenderProps(props: ButtonProps): ButtonRenderProps {

  let { className, startIcon, endIcon, children } = props;

  let size = getComponentSizeFromClassName(className);
  let variant = getComponentVariantFromClassName(className);
  let color = getComponentColorFromClassName(className);

  let isIcon = className?.split(' ').includes('icon-button');

  const withStyle = size || variant || color || isIcon;

  if (withStyle) {
    if (!size)
      size = ComponentSize.Medium;
    if (!variant)
      variant = ComponentVariant.Fill;
    if (!color)
      color = ComponentColor.Primary;
  }

  className = classNames(className, 'button', {
    'with-start-icon': startIcon,
    'with-end-icon': endIcon
  },
    size?.toLowerCase(),
    variant?.toLowerCase(),
    color?.toLowerCase());

  const showStartIcon = !!startIcon && !isIcon;
  const showEndIcon = !!endIcon && !isIcon;

  children = (
    <>
      {showStartIcon &&
        <div className="start-icon">
          {startIcon}
        </div>}

      <div className="button-content">
        {children}
      </div>

      {showEndIcon &&
        <div className="end-icon">
          {endIcon}
        </div>}
    </>
  );

  return {
    className,
    showStartIcon,
    showEndIcon,
    children
  }
}