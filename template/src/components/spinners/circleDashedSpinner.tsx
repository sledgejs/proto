import { CircleDashed } from 'phosphor-react';

export const CircleDashedSpinner = () =>
  <CircleDashed>
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      dur="2s"
      from="0 0 0"
      to="360 0 0"
      repeatCount="indefinite" />
  </CircleDashed>