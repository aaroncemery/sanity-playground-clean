import { createClient, defineLive } from 'next-sanity';

import { apiVersion, dataset, projectId } from './api';
import { token } from './token';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: { studioUrl: '/studio' },
});

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
