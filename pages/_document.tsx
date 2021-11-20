/* eslint-disable max-classes-per-file */
import fs from 'fs';
import Document, {
  Head as NextHead,
  Html,
  Main,
  NextScript,
} from 'next/document';
import path from 'path';

class Head extends NextHead {
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
  // eslint-disable-next-line class-methods-use-this
  getPolyfillScripts(): JSX.Element[] {
    return [];
  }
}

export default class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
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
