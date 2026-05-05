import React from 'react';
import useWebflow from '../useWebflow';
import { rawHtml } from '../rawHtml';

export default function Landing() {
  useWebflow();

  return (
    <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
  );
}
