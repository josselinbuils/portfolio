import { getSubreddit } from '~/apps/Reddit/api/getSubreddit';
import { asyncRoute } from '~/platform/api/asyncRoute';

export default asyncRoute(getSubreddit);
