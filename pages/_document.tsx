/* eslint-disable max-classes-per-file */
import fs from 'node:fs';
import path from 'node:path';
import Document, {
  Head as NextHead,
  Html,
  Main,
  NextScript,
} from 'next/document';

class Head extends NextHead {
  private static readonly cache = new Map<string, string>();

  getCssLinks({ allFiles }: DocumentFiles): JSX.Element[] | null {
    return allFiles
      .filter((file) => file.endsWith('.css'))
      .map((file) => {
        if (!Head.cache.has(file)) {
          Head.cache.set(
            file,
            fs.readFileSync(path.join('.next', file), 'utf-8')
          );
        }
        return (
          <style
            key={file}
            nonce={this.props.nonce}
            dangerouslySetInnerHTML={{ __html: Head.cache.get(file) as string }}
          />
        );
      });
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
