import { documentEventHandler } from '@sanity/functions';
import { createClient } from '@sanity/client';

export const handler = documentEventHandler(async ({ context, event }) => {
  console.log('Raw event object:', JSON.stringify(event, null, 2));
  console.log('Raw context object:', JSON.stringify(context, null, 2));
  const client = createClient({
    ...context.clientOptions,
    apiVersion: '2025-05-08',
  });
  const document = event.data?.data || event.data;

  console.log('Document type received:', document?._type);
  console.log('Document ID:', document?._id);

  if (!document || !document._type) {
    console.log('No document data received');
    return;
  }

  console.log(`Processing auto-increment for document: ${document._id}`);

  try {
    const counterId = `counter.${document._type}`;

    // First, ensure counter exists
    await client.createIfNotExists({
      _id: counterId,
      _type: 'counter',
      name: `${document._type}-counter`,
      value: 0,
    });

    const currentCounter = await client.fetch(`*[_id == $counterId][0].value`, {
      counterId,
    });

    const nextValue = (currentCounter || 0) + 1;

    await client.patch(counterId).set({ value: nextValue }).commit();

    console.log(`Counter value: ${nextValue}`);

    // Only try to patch the document if it exists (or if not in local testing)
    if (context.local) {
      console.log(
        `⚠️ Local testing - skipping document patch for ${document._id}`
      );
      console.log(
        `✅ Would set autoId ${nextValue} for document ${document._id}`
      );
    } else {
      // In production, patch the real document
      await client.patch(document._id).set({ autoId: nextValue }).commit();
      console.log(`✅ Set autoId ${nextValue} for document ${document._id}`);
    }

    console.log(`✅ Set autoId ${nextValue} for document ${document._id}`);
  } catch (error) {
    console.error('Error in auto-increment function:', error);
    throw error;
  }
});
