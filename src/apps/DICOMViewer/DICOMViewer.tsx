import React, { useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { Dataset } from './models';
import { SelectDataset, Viewer } from './views';

import styles from './DICOMViewer.module.scss';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [dataset, setDataset] = useState<Dataset>();
  const [errorMessage, setErrorMessage] = useState<string>();

  function back(): void {
    setErrorMessage(undefined);

    if (dataset) {
      dataset.destroy();
      setDataset(undefined);
    }
  }

  return (
    <Window
      {...injectedWindowProps}
      background="black"
      titleColor="#efefef"
      minWidth={880}
      minHeight={534}
      ref={windowRef}
      title={DICOMViewerDescriptor.appName}
    >
      <div className={styles.dicomViewer}>
        {dataset && (
          <button className={styles.button} onClick={back}>
            Back
          </button>
        )}
        {!dataset ? (
          <SelectDataset
            onDatasetSelected={setDataset}
            onError={setErrorMessage}
          />
        ) : (
          <Viewer dataset={dataset} onError={setErrorMessage} />
        )}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
