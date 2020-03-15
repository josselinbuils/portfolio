import React, { FC } from 'react';
import { BASE_URL } from '~/platform/constants';
import { DatasetDescriptor } from '../../interfaces';
import styles from './SelectDataset.module.scss';

export const SelectDataset: FC<Props> = ({ datasets, onDatasetSelected }) => (
  <div className={styles.chooseDataset}>
    <h1>Choose the dataset</h1>
    <div className={styles.container}>
      {datasets.map(dataset => (
        <div
          className={styles.dataset}
          key={dataset.name}
          onClick={() => onDatasetSelected(dataset)}
        >
          {dataset.preview ? (
            <img
              alt={dataset.name}
              src={`${BASE_URL}/assets/dicom/previews/${dataset.preview}`}
            />
          ) : (
            <span>{dataset.name}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

interface Props {
  datasets: DatasetDescriptor[];
  onDatasetSelected(dataset: DatasetDescriptor): void;
}
