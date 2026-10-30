// USPS Informed Delivery image specs (max dimensions, JPEG, RGB, <= 200KB)
export const IMAGE_SPECS = {
  rideAlong: { maxWidth: 300, maxHeight: 200 },
  representative: { maxWidth: 780, maxHeight: 500 },
};

export const MAX_IMAGE_BYTES = 200 * 1024; // 200KB

const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.05;
const SHRINK_STEP = 0.9; // used only if lowering quality alone isn't enough
const MIN_DIMENSION = 100;

// Approximate decoded byte size of a base64 string
const base64Bytes = (b64) => {
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
};

/**
 * Resize an image file to USPS Informed Delivery specs.
 *
 * @param {File} file
 * @param {"rideAlong"|"representative"} type  Which spec to apply
 * @param {number} quality  Starting JPEG quality (0-1)
 * @returns {Promise<{base64, width, height, sizeBytes, quality, reducedToFit}>}
 */
export const resizeImageToBase64 = (file, type = "rideAlong", quality = 0.9) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No image selected."));
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const spec = IMAGE_SPECS[type];
    if (!spec) {
      reject(new Error(`Unknown image type "${type}".`));
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        // Scale down to fit max dimensions, keep aspect ratio, never enlarge
        let scale = Math.min(
          spec.maxWidth / naturalWidth,
          spec.maxHeight / naturalHeight,
          1
        );

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Unable to create canvas.");

        const render = (q) => {
          const width = Math.max(1, Math.round(naturalWidth * scale));
          const height = Math.max(1, Math.round(naturalHeight * scale));

          canvas.width = width;
          canvas.height = height;

          // JPEG has no transparency: white background
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
          context.imageSmoothingQuality = "high";
          context.drawImage(image, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", q).split(",")[1];
          return { base64, width, height, sizeBytes: base64Bytes(base64) };
        };

        let q = quality;
        let result = render(q);

        // Step 1: lower JPEG quality until under 200KB
        while (result.sizeBytes > MAX_IMAGE_BYTES && q - QUALITY_STEP >= MIN_QUALITY) {
          q = Math.round((q - QUALITY_STEP) * 100) / 100;
          result = render(q);
        }

        // Step 2: if still too big, shrink dimensions a bit and retry
        while (
          result.sizeBytes > MAX_IMAGE_BYTES &&
          Math.min(result.width, result.height) * SHRINK_STEP >= MIN_DIMENSION
        ) {
          scale *= SHRINK_STEP;
          result = render(q);
        }

        URL.revokeObjectURL(objectUrl);

        if (result.sizeBytes > MAX_IMAGE_BYTES) {
          reject(
            new Error(
              "Image could not be reduced below 200KB. Please upload a simpler or smaller image."
            )
          );
          return;
        }

        resolve({
          base64: result.base64,
          width: result.width,
          height: result.height,
          sizeBytes: result.sizeBytes,
          quality: q,
          reducedToFit: q < quality || scale < 1,
        });
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image."));
    };

    image.src = objectUrl;
  });
};

// // USPS Informed Delivery image specs (max dimensions, JPEG, RGB, <= 200KB)
// export const IMAGE_SPECS = {
//   rideAlong: { maxWidth: 300, maxHeight: 200 },
//   representative: { maxWidth: 780, maxHeight: 500 },
// };

// export const MAX_IMAGE_BYTES = 200 * 1024; // 200KB

// const MIN_QUALITY = 0.4;
// const QUALITY_STEP = 0.05;
// const SHRINK_STEP = 0.9; // used only if lowering quality alone isn't enough
// const MIN_DIMENSION = 100;

// // Approximate decoded byte size of a base64 string
// const base64Bytes = (b64) => {
//   const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
//   return Math.floor((b64.length * 3) / 4) - padding;
// };

// /**
//  * Resize an image file to USPS Informed Delivery specs.
//  *
//  * @param {File} file
//  * @param {"rideAlong"|"representative"} type  Which spec to apply
//  * @param {number} quality  Starting JPEG quality (0-1)
//  * @returns {Promise<{base64, width, height, sizeBytes, quality, reducedToFit}>}
//  */
// export const resizeImageToBase64 = (file, type = "rideAlong", quality = 0.9) => {
//   return new Promise((resolve, reject) => {
//     if (!file) {
//       reject(new Error("No image selected."));
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       reject(new Error("Selected file is not an image."));
//       return;
//     }

//     const spec = IMAGE_SPECS[type];
//     if (!spec) {
//       reject(new Error(`Unknown image type "${type}".`));
//       return;
//     }

//     const image = new Image();
//     const objectUrl = URL.createObjectURL(file);

//     image.onload = () => {
//       try {
//         const naturalWidth = image.naturalWidth;
//         const naturalHeight = image.naturalHeight;

//         // Scale down to fit max dimensions, keep aspect ratio, never enlarge
//         let scale = Math.min(
//           spec.maxWidth / naturalWidth,
//           spec.maxHeight / naturalHeight,
//           1
//         );

//         const canvas = document.createElement("canvas");
//         const context = canvas.getContext("2d");
//         if (!context) throw new Error("Unable to create canvas.");

//         const render = (q) => {
//           const width = Math.max(1, Math.round(naturalWidth * scale));
//           const height = Math.max(1, Math.round(naturalHeight * scale));

//           canvas.width = width;
//           canvas.height = height;

//           // JPEG has no transparency: white background
//           context.fillStyle = "#ffffff";
//           context.fillRect(0, 0, width, height);
//           context.imageSmoothingQuality = "high";
//           context.drawImage(image, 0, 0, width, height);

//           const base64 = canvas.toDataURL("image/jpeg", q).split(",")[1];
//           return { base64, width, height, sizeBytes: base64Bytes(base64) };
//         };

//         let q = quality;
//         let result = render(q);

//         // Step 1: lower JPEG quality until under 200KB
//         while (result.sizeBytes > MAX_IMAGE_BYTES && q - QUALITY_STEP >= MIN_QUALITY) {
//           q = Math.round((q - QUALITY_STEP) * 100) / 100;
//           result = render(q);
//         }

//         // Step 2: if still too big, shrink dimensions a bit and retry
//         while (
//           result.sizeBytes > MAX_IMAGE_BYTES &&
//           Math.min(result.width, result.height) * SHRINK_STEP >= MIN_DIMENSION
//         ) {
//           scale *= SHRINK_STEP;
//           result = render(q);
//         }

//         URL.revokeObjectURL(objectUrl);

//         if (result.sizeBytes > MAX_IMAGE_BYTES) {
//           reject(
//             new Error(
//               "Image could not be reduced below 200KB. Please upload a simpler or smaller image."
//             )
//           );
//           return;
//         }

//         resolve({
//           base64: result.base64,
//           width: result.width,
//           height: result.height,
//           sizeBytes: result.sizeBytes,
//           quality: q,
//           reducedToFit: q < quality || scale < 1,
//         });
//       } catch (error) {
//         URL.revokeObjectURL(objectUrl);
//         reject(error);
//       }
//     };

//     image.onerror = () => {
//       URL.revokeObjectURL(objectUrl);
//       reject(new Error("Unable to read image."));
//     };

//     image.src = objectUrl;
//   });
// };



// // export const resizeImageToBase64 = (
// //   file,
// //   maxWidth = 300,
// //   maxHeight = 200,
// //   quality = 0.9
// // ) => {
// //   return new Promise((resolve, reject) => {
// //     if (!file) {
// //       reject(new Error("No image selected."));
// //       return;
// //     }

// //     if (!file.type.startsWith("image/")) {
// //       reject(new Error("Selected file is not an image."));
// //       return;
// //     }

// //     const image = new Image();
// //     const objectUrl = URL.createObjectURL(file);

// //     image.onload = () => {
// //       try {
// //         let width = image.naturalWidth;
// //         let height = image.naturalHeight;

// //         /*
// //          * Scale the image down while preserving
// //          * its original aspect ratio.
// //          *
// //          * Never enlarge an image that is already
// //          * smaller than the maximum dimensions.
// //          */
// //         const scale = Math.min(
// //           maxWidth / width,
// //           maxHeight / height,
// //           1
// //         );

// //         width = Math.round(width * scale);
// //         height = Math.round(height * scale);

// //         const canvas = document.createElement("canvas");

// //         canvas.width = width;
// //         canvas.height = height;

// //         const context = canvas.getContext("2d");

// //         if (!context) {
// //           throw new Error("Unable to create canvas.");
// //         }

// //         /*
// //          * JPEG doesn't support transparency.
// //          * Use a white background.
// //          */
// //         context.fillStyle = "#ffffff";
// //         context.fillRect(0, 0, width, height);

// //         context.drawImage(
// //           image,
// //           0,
// //           0,
// //           width,
// //           height
// //         );

// //         const dataUrl = canvas.toDataURL(
// //           "image/jpeg",
// //           quality
// //         );

// //         const base64 = dataUrl.split(",")[1];

// //         URL.revokeObjectURL(objectUrl);

// //         resolve({
// //           base64,
// //           width,
// //           height
// //         });
// //       } catch (error) {
// //         URL.revokeObjectURL(objectUrl);
// //         reject(error);
// //       }
// //     };

// //     image.onerror = () => {
// //       URL.revokeObjectURL(objectUrl);
// //       reject(new Error("Unable to read image."));
// //     };

// //     image.src = objectUrl;
// //   });
// // };