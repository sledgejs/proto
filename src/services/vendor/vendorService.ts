import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Service which manages loading, instancing and managing of
 * 3rd party SDKs and frameworks.
 * 
 * @remark
 * Implementation is highly specific for each application.
 */
export class VendorService
  extends ServiceBase {

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Vendor;
}