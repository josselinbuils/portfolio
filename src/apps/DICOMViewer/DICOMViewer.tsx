import React, { ReactElement, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { Size } from '~/platform/interfaces';
import { RendererType } from './constants';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { Dataset } from './models';
import { SelectDataset, SelectRenderer, Viewer } from './views';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [dataset, setDataset] = useState<Dataset>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [rendererType, setRendererType] = useState<RendererType>();
  const [windowSize, setWindowSize] = useState<Size>();

  function back(): void {
    setErrorMessage(undefined);

    if (rendererType) {
      setRendererType(undefined);
    } else if (dataset) {
      dataset.destroy();
      setDataset(undefined);
    }
  }

  function render(): ReactElement | null {
    if (!dataset) {
      return (
        <SelectDataset
          onDatasetSelected={setDataset}
          onError={setErrorMessage}
        />
      );
    }
    if (!rendererType) {
      return <SelectRenderer onRendererTypeSelected={setRendererType} />;
    }
    if (windowSize) {
      return (
        <Viewer
          dataset={dataset}
          rendererType={rendererType}
          windowSize={windowSize}
          onError={setErrorMessage}
        />
      );
    }
    return null;
  }

  return (
    <Window
      {...injectedWindowProps}
      background="black"
      titleColor="#efefef"
      minWidth={880}
      minHeight={554}
      onResize={setWindowSize}
      ref={windowRef}
      title={DICOMViewerDescriptor.appName}
    >
      <div className={styles.dicomViewer}>
        {dataset && (
          <button className={styles.button} onClick={back}>
            Back
          </button>
        )}
        {render()}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>
    </Window>
  );
};

DICOMViewer.appDescriptor = DICOMViewerDescriptor;

export default DICOMViewer;
