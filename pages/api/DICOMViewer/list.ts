import { getList } from '~/apps/DICOMViewer/api/getList';
import { asyncRoute } from '~/platform/api/asyncRoute';

export default asyncRoute(getList);
