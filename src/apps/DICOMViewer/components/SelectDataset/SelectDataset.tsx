import cn from 'classnames';
import { type FC, useEffect, useLayoutEffect, useState } from 'preact/compat';
import { Spinner } from '@/platform/components/Spinner/Spinner';
import { cancelable } from '@/platform/utils/cancelable';
import { preloadImage } from '@/platform/utils/preloadImage';
import { type DatasetDescriptor } from '../../interfaces/DatasetDescriptor';
import { Dataset } from '../../models/Dataset';
import { ProgressRing } from './ProgressRing/ProgressRing';
import styles from './SelectDataset.module.scss';
import { loadDatasetList } from './utils/loadDatasetList';

const WAIT_FOR_FULL_PROGRESS_RING_DELAY_MS = 500;

export interface SelectDatasetProps {
  onDatasetSelected(dataset: Dataset): void;
  onError(message: string): void;
}

export const SelectDataset: FC<SelectDatasetProps> = ({
  onDatasetSelected,
  onError,
}) => {
  const [datasetDescriptor, setDatasetDescriptor] =
    useState<DatasetDescriptor>();
  const [datasetDescriptors, setDatasetDescriptors] = useState<
    DatasetDescriptor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const [datasetsPromise, cancelDatasetsPromise] = cancelable(
      loadDatasetList(),
    );
    datasetsPromise
      .then(async (descriptors) => {
        await Promise.all(
          descriptors.map(({ previewURL }) =>
            previewURL ? preloadImage(previewURL) : undefined,
          ),
        );
        return descriptors;
      })
      .then(setDatasetDescriptors)
      .catch((error) => {
        onError('Unable to retrieve datasets');
        setLoading(false);
        console.error(error);
      })
      .finally(() => setLoading(false));
    return cancelDatasetsPromise;
  }, [onError]);

  useLayoutEffect(() => {
    if (datasetDescriptor === undefined) {
      return;
    }
    setLoading(true);
    setLoadingProgress(0);

    const [framesPromise, cancelFramesPromise] = cancelable(
      import('./utils/loadFrames').then(async ({ loadFrames }) =>
        loadFrames(datasetDescriptor, setLoadingProgress),
      ),
    );
    framesPromise
      .then((dicomFrames) => {
        // Be sure that 100% will be display on the progress ring
        setTimeout(() => {
          setLoading(false);
          onDatasetSelected(
            Dataset.create(datasetDescriptor.name, dicomFrames),
          );
        }, WAIT_FOR_FULL_PROGRESS_RING_DELAY_MS);
      })
      .catch((error) => {
        setLoading(false);
        onError('Unable to retrieve frames');
        console.error(error);
      });

    return cancelFramesPromise;
  }, [datasetDescriptor, onDatasetSelected, onError]);

  if (loading) {
    return datasetDescriptor ? (
      <ProgressRing
        className={styles.progressRing}
        color="white"
        progress={loadingProgress}
        radius={50}
        thickness={4}
      />
    ) : (
      <Spinner color="white" />
    );
  }

  return (
    <div className={styles.selectDataset}>
      <h1>Select the dataset</h1>
      <div className={styles.container}>
        {datasetDescriptors.map((descriptor) => (
          <button
            className={cn(styles.dataset, { [styles.thd]: descriptor.is3D })}
            key={descriptor.name}
            onClick={() => setDatasetDescriptor(descriptor)}
            type="button"
          >
            {descriptor.previewURL ? (
              <img alt={descriptor.name} src={descriptor.previewURL} />
            ) : (
              <span>{descriptor.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
