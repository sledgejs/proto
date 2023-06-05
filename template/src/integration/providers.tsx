import React, { PropsWithChildren, Provider, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { IconContext, IconProps } from 'phosphor-react';
import { TooltipProvider, TooltipProviderProps } from '@radix-ui/react-tooltip';
import { ToastProvider, ToastProviderProps } from '@radix-ui/react-toast';
import { HelmetProvider } from 'react-helmet-async';
import { KernelContext } from '../kernel/kernelContext';
import { Kernel } from '../kernel/kernel';

const KernelProvider = KernelContext.Provider;
const IconProvider = IconContext.Provider;

type Props = PropsWithChildren<{
  kernel: Kernel
}>;

export const Providers = ({
  kernel,
  children
}: Props) => {

  let providers: ReactElement;

  const iconConfig: IconProps = {
    size: undefined,
    color: undefined,
    fill: undefined,
    stroke: undefined,
    className: 'svg-icon'
  };

  const tooltipConfig: Omit<TooltipProviderProps, 'children'> = {

  }

  const toastConfig: Omit<ToastProviderProps, 'children'> = {

  }

  // simple trick to avoid a provider pyramid of doom

  providers = (
    <KernelProvider 
      value={kernel} 
      key={kernel.kernelId}>
      
      {children}
    </KernelProvider>
  );

  providers = (
    <IconProvider value={iconConfig}>
      {providers}
    </IconProvider>
  );

  providers = (
    <TooltipProvider {...tooltipConfig}>
      {providers}
    </TooltipProvider>
  );

  providers = (
    <ToastProvider {...toastConfig}>
      {providers}
    </ToastProvider>
  );

  providers = (
    <HelmetProvider>
      {providers}
    </HelmetProvider>
  );

  return providers;
}