import { getTop } from '~/apps/Reddit/api/getTop';
import { asyncRoute } from '~/platform/api/asyncRoute';

export default asyncRoute(getTop);
