/* eslint-disable max-classes-per-file */
import fs from 'fs';
import path from 'path';
import Document, {
  Head as NextHead,
  Html,
  Main,
  NextScript,
} from 'next/document';

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
        <Head>
          <meta
            name="description"
            content="Hey, I'm Josselin, a full-stack JavaScript developer :)"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'http://schema.org/',
                '@type': 'Person',
                jobTitle: 'Software Engineer',
                name: 'Josselin BUILS',
                nationality: 'French',
              }),
            }}
          />
          <script
            defer
            src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver%2CResizeObserver"
          />
        </Head>
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
