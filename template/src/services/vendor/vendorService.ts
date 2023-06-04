import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

export class VendorService
  extends ServiceBase {

  readonly serviceName = ServiceName.Vendor;
}