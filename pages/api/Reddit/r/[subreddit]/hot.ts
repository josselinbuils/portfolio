import { getHot } from '~/apps/Reddit/api/getHot';
import { asyncRoute } from '~/platform/api/asyncRoute';

export default asyncRoute(getHot);
