import { DicomController } from '~/apps/DICOMViewer/api/DicomController';
import { asyncRoute } from '~/platform/api/asyncRoute';

export default asyncRoute(new DicomController().getList);
