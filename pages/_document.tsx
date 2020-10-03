/* eslint-disable max-classes-per-file */
import fs from 'fs';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import path from 'path';

class InlineStylesHead extends Head {
  getCssLinks({ allFiles }: DocumentFiles): JSX.Element[] | null {
    return allFiles
      .filter((file) => file.endsWith('.css'))
      .map((file) => (
        <style
          key={file}
          nonce={this.props.nonce}
          dangerouslySetInnerHTML={{
            __html: fs.readFileSync(path.join('.next', file), 'utf-8'),
          }}
        />
      ));
  }
}

export default class CustomDocument extends Document {
  render() {
    return (
      <Html>
        <InlineStylesHead />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

interface DocumentFiles {
  sharedFiles: readonly string[];
  pageFiles: readonly string[];
  allFiles: readonly string[];
}
