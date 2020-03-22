import React, { ReactElement, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { RendererType, View } from './constants';
import styles from './DICOMViewer.module.scss';
import { DICOMViewerDescriptor } from './DICOMViewerDescriptor';
import { Dataset } from './models';
import { LUTEditor, SelectDataset, SelectRenderer, Viewer } from './views';

const DICOMViewer: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [dataset, setDataset] = useState<Dataset>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [rendererType, setRendererType] = useState<RendererType>();
  const [view, setView] = useState<View>(View.Viewer);

  function back(): void {
    setErrorMessage(undefined);

    if (view === View.LUTEditor) {
      setView(View.Viewer);
    } else if (rendererType) {
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

    switch (view) {
      case View.LUTEditor:
        return (
          <LUTEditor
            dataset={dataset}
            rendererType={rendererType}
            onError={setErrorMessage}
          />
        );

      case View.Viewer:
        return (
          <Viewer
            dataset={dataset}
            rendererType={rendererType}
            onError={setErrorMessage}
            onViewChange={setView}
          />
        );

      default:
        return null;
    }
  }

  return (
    <Window
      {...injectedWindowProps}
      background="black"
      titleColor="#efefef"
      minWidth={880}
      minHeight={554}
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
