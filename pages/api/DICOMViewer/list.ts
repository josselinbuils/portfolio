import { getList } from '~/apps/DICOMViewer/api/getList';
import { syncRoute } from '~/platform/api/syncRoute';

export default syncRoute(getList);
