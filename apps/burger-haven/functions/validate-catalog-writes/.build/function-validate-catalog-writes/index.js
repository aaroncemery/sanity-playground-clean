import { documentEventHandler } from "@sanity/functions";
const handler = documentEventHandler(async ({ event }) => {
  const document = event.data?.data || event.data;
  const operation = event.type;
  if (!["document.create", "document.update"].includes(operation)) {
    return;
  }
  if (!document || !document._type) {
    return;
  }
  console.log(`[VALIDATION] ${operation.toUpperCase()} ${document._type} ${document._id}`);
  if (document._type === "product") {
    await validateProduct(document);
  }
  if (document._type === "productPricing") {
    await validatePricing(document);
  }
});
async function validateProduct(product) {
  const errors = [];
  const warnings = [];
  if (!product.allergens || product.allergens.length === 0) {
    errors.push(
      "⚠️ COMPLIANCE VIOLATION: Allergen information is REQUIRED for all food products. This is a legal requirement and cannot be bypassed."
    );
  }
  if (!product.nutritionFacts) {
    errors.push(
      "⚠️ COMPLIANCE VIOLATION: Nutrition facts are REQUIRED. Missing this data violates FDA regulations."
    );
  } else {
    const { calories, protein, carbs, fat, sodium } = product.nutritionFacts;
    if (calories && calories > 3e3) {
      warnings.push(
        "⚠️ WARNING: Calories exceed 3000, which is unusually high. Please verify this data with PIM source."
      );
    }
    if (calories && protein && carbs && fat) {
      const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;
      const difference = Math.abs(calories - calculatedCalories);
      if (difference > 100) {
        warnings.push(
          `⚠️ WARNING: Calorie calculation (${calculatedCalories}) differs significantly from stated calories (${calories}). Please verify macronutrients.`
        );
      }
    }
    if (sodium && sodium > 2300) {
      warnings.push(
        "⚠️ WARNING: Sodium exceeds recommended daily value (2300mg). Consider flagging for customers."
      );
    }
  }
  if (!product.sku) {
    errors.push("❌ REQUIRED: SKU is required for all products");
  } else if (!/^[A-Z]{2}\d{4}$/.test(product.sku)) {
    errors.push(
      `❌ FORMAT ERROR: SKU "${product.sku}" is invalid. Must be format XX0000 (e.g., BH1001, CH2001)`
    );
  }
  if (product.basePrice !== void 0 && product.basePrice !== null) {
    if (product.basePrice <= 0) {
      errors.push("❌ INVALID: Base price must be greater than $0");
    }
    if (product.basePrice > 100) {
      warnings.push(
        "⚠️ WARNING: Base price over $100 is unusual for QSR menu items. Please verify with PIM."
      );
    }
  } else {
    errors.push("❌ REQUIRED: Base price is required");
  }
  if (!product.category) {
    errors.push("❌ REQUIRED: Product must have a category assigned");
  }
  if (!product.name || product.name.trim().length === 0) {
    errors.push("❌ REQUIRED: Product name is required");
  }
  if (!product.pimProductId) {
    warnings.push(
      "⚠️ WARNING: No PIM Product ID. This product may not be properly synced with external PIM system."
    );
  }
  if (!product.pimMetadata?.syncSource) {
    warnings.push(
      "⚠️ WARNING: No sync source identified. Unable to track which PIM system this came from."
    );
  }
  if (warnings.length > 0) {
    console.warn("[VALIDATION WARNINGS]", {
      documentId: product._id,
      sku: product.sku,
      name: product.name,
      warnings,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (errors.length > 0) {
    console.error("[VALIDATION FAILURE] Product write REJECTED", {
      documentId: product._id,
      sku: product.sku,
      name: product.name,
      errors,
      warnings,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: product.pimMetadata?.syncSource || "unknown"
    });
    const errorMessage = [
      "🚫 PRODUCT VALIDATION FAILED",
      "",
      ...errors,
      "",
      ...warnings.length > 0 ? ["Warnings (non-blocking):", ...warnings] : [],
      "",
      "---",
      "This write has been rejected to maintain data quality and compliance.",
      "Please correct the errors in your PIM system and retry the sync."
    ].join("\n");
    throw new Error(errorMessage);
  }
  console.log("✅ Product validation PASSED", {
    sku: product.sku,
    name: product.name,
    category: product.category,
    warnings: warnings.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
async function validatePricing(pricing) {
  const errors = [];
  if (pricing.price === void 0 || pricing.price === null) {
    errors.push("❌ REQUIRED: Price is required");
  } else if (pricing.price < 0) {
    errors.push("❌ INVALID: Price cannot be negative");
  } else if (pricing.price > 100) {
    errors.push("❌ INVALID: Price over $100 is not allowed for QSR menu items");
  }
  if (!pricing.product) {
    errors.push("❌ REQUIRED: Pricing must reference a product");
  }
  if (!pricing.storeLocation) {
    errors.push("❌ REQUIRED: Pricing must reference a store location");
  }
  if (pricing.pricingTier && !["standard", "premium", "value", "airport"].includes(pricing.pricingTier)) {
    errors.push(`❌ INVALID: Pricing tier "${pricing.pricingTier}" is not recognized`);
  }
  if (errors.length > 0) {
    console.error("[VALIDATION FAILURE] Pricing write REJECTED", {
      documentId: pricing._id,
      errors,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    throw new Error(`Pricing validation failed:
${errors.join("\n")}`);
  }
  console.log("✅ Pricing validation PASSED for", pricing.product?._ref || "product");
}
export {
  handler
};
//# sourceMappingURL=index.js.map
