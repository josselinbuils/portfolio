import React, { FC, useEffect, useLayoutEffect, useState } from 'react';
import { Dataset } from '~/apps/DICOMViewer/models';
import { Spinner } from '~/platform/components';
import { BASE_URL } from '~/platform/constants';
import { cancelable } from '~/platform/utils';
import { DatasetDescriptor } from './DatasetDescriptor';
import { ProgressRing } from './ProgressRing';
import { loadDatasetList, loadFrames } from './utils';

import styles from './SelectDataset.module.scss';

const WAIT_FOR_FULL_PROGRESS_RING_DELAY_MS = 500;

export const SelectDataset: FC<Props> = ({ onDatasetSelected, onError }) => {
  const [datasetDescriptor, setDatasetDescriptor] = useState<
    DatasetDescriptor
  >();
  const [datasetDescriptors, setDatasetDescriptors] = useState<
    DatasetDescriptor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const [datasetsPromise, cancelDatasetsPromise] = cancelable(
      loadDatasetList()
    );
    datasetsPromise
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
      loadFrames(datasetDescriptor, setLoadingProgress)
    );
    framesPromise
      .then((dicomFrames) => {
        // Be sure that 100% will be display on the progress ring
        setTimeout(() => {
          setLoading(false);
          onDatasetSelected(
            Dataset.create(datasetDescriptor.name, dicomFrames)
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
          <div
            className={styles.dataset}
            key={descriptor.name}
            onClick={() => setDatasetDescriptor(descriptor)}
          >
            {descriptor.preview ? (
              <img
                alt={descriptor.name}
                src={`${BASE_URL}/assets/dicom/previews/${descriptor.preview}`}
              />
            ) : (
              <span>{descriptor.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface Props {
  onDatasetSelected(dataset: Dataset): void;
  onError(message: string): void;
}
