import { getTracks } from '~/apps/MP3Player/api/getTracks';
import { asyncRoute } from '~/platform/api/asyncRoute';

export default asyncRoute(getTracks);
