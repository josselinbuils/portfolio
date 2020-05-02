import express from 'express';
import SourceMapSupport from 'source-map-support';
import { Logger } from '../Logger';
import { registerRouter } from './registerRouter';

export async function startHTTPServer(port: number): Promise<void> {
  Logger.info(`Starts HTTP server`);
  await new Promise((resolve) => {
    SourceMapSupport.install();
    registerRouter(express()).listen(port, resolve);
  });
  Logger.info(`HTTP server is listening on port ${port}`);
}
