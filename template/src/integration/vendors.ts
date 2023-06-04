import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

import { DevRuntime } from '../dev/devRuntime';
import { trace } from '../dev';

export function initVendors() {
  
  trace(DevRuntime, `Initializing vendors`);

  trace(DevRuntime, `Configure DayJS to use LocalizedFormat`);

  // configure dayjs
  dayjs.extend(LocalizedFormat);
}