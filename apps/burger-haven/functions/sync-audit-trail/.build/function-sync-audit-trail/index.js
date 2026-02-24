import { documentEventHandler } from "@sanity/functions";
const handler = documentEventHandler(async ({ event }) => {
  const document = event.data?.data || event.data;
  const operation = event.type;
  if (!document || !document._type) {
    return;
  }
  const syncableTypes = ["product", "productPricing", "storeLocation"];
  if (!syncableTypes.includes(document._type)) {
    return;
  }
  if (!["document.create", "document.update"].includes(operation)) {
    return;
  }
  const doc = document;
  const logEntry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    operation,
    documentType: doc._type,
    documentId: doc._id,
    sku: doc.sku,
    syncSource: doc.pimMetadata?.syncSource || "unknown",
    syncStatus: doc.pimMetadata?.syncStatus || "unknown"
  };
  console.log("[SYNC AUDIT]", JSON.stringify(logEntry, null, 2));
});
export {
  handler
};
//# sourceMappingURL=index.js.map
