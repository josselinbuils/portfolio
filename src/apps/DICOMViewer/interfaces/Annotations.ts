import { type ViewType } from './ViewType';

export interface Annotations {
  datasetName?: string;
  fps?: number;
  meanRenderDuration?: number;
  rendererType?: string;
  viewType?: ViewType;
  windowCenter?: number;
  windowWidth?: number;
  zoom?: number;
}
