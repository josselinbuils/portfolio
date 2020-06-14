import path from 'path';
import { ASSETS_DIR, ASSETS_URL, BASE_URL } from '~/platform/api/constants';

const DICOM_PATH = path.join(process.cwd(), ASSETS_DIR, '/dicom');
export const DATASETS_PATH = path.join(DICOM_PATH, '/datasets');
export const DATASETS_URL = `${BASE_URL}/api/DICOMViewer/dataset`;
export const MAX_AGE = 365 * 24 * 60 * 60;
export const PREVIEWS_PATH = path.join(DICOM_PATH, '/previews');
export const PREVIEWS_URL = `${ASSETS_URL}/dicom/previews`;
