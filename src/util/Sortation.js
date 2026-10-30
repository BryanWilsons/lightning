// const rules = {
//   "mail_class_rules": {
//     "First-Class Mail": [
//       {"field": "mailClass", "allowed_values": ["FCM", "First-Class Mail"]},
//       {"field": "productWeight", "max": 13, "unit": "oz"}
//     ],
//     "USPS Marketing Mail": [
//       {"field": "mailClass", "allowed_values": ["STD", "Marketing Mail"]},
//       {"field": "quantity", "min": 200, "unit": "pieces"}
//     ]
//   },
//   "processing_category_rules": {
//     "Cards": [
//       {"field": "productHeight", "max": 4.25},
//       {"field": "productLength", "max": 6},
//       {"field": "productThickness", "max": 0.016},
//       {"field": "productWeight", "max": 1, "unit": "oz"}
//     ],
//     "Letters": [
//       {"field": "productHeight", "min": 3.5, "max": 6.125},
//       {"field": "productLength", "min": 5, "max": 11.5},
//       {"field": "productThickness", "min": 0.007, "max": 0.25},
//       {"field": "productWeight", "max": 3.5, "unit": "oz"}
//     ],
//     "Flats": [
//       {"field": "productHeight", "min": 6.125, "max": 12},
//       {"field": "productLength", "min": 11.5, "max": 15},
//       {"field": "productThickness", "min": 0.009, "max": 0.75},
//       {"field": "productWeight", "max": 13, "unit": "oz"}
//     ],
//     "Parcels": [
//       {"field": "productHeight", "max": 108},
//       {"field": "productLength", "max": 108},
//       {"field": "productWeight", "max": 70, "unit": "lb"},
//       {"field": "productThickness", "max": 18}
//     ]
//   },
//   "machinability_rules": {
//     "Automation": [
//       {"field": "imBarcode", "value": true},
//       {"field": "isUniformThickness", "value": true},
//       {"field": "isFlexible", "value": true}
//     ],
//     "Machinable": [
//       {"field": "isFlexible", "value": true},
//       {"field": "isUniformThickness", "value": true},
//       {"field": "imBarcode", "value": false}
//     ],
//     "Nonmachinable": [
//       {"field": "isFlexible", "value": false}
//     ],
//     "Presorted": [
//       {"field": "presortOnly", "value": true}
//     ]
//   },
//    "sortation_combinations": [

//     {"match": ["USPS Marketing Mail", "Automation", "Letters"], "sortation": "STD AUTO LETTERS"},

//     {"match": ["USPS Marketing Mail", "Nonmachinable", "Letters"], "sortation": "STD NONMACH LETTERS"},

//     {"match": ["USPS Marketing Mail", "Presorted", "Flats"], "sortation": "STD PRESORTED FLATS"},

 

//     {"match": ["First-Class Mail", "Automation", "Cards"], "sortation": "FCM AUTO CARDS"},

//     {"match": ["First-Class Mail", "Automation", "Letters"], "sortation": "FCM AUTO LETTERS"},

//     {"match": ["First-Class Mail", "Automation", "Flats"], "sortation": "FCM AUTO FLATS"},

 

//     {"match": ["First-Class Mail", "Machinable", "Cards"], "sortation": "FCM MACH CARDS"},

//     {"match": ["First-Class Mail", "Machinable", "Letters"], "sortation": "FCM MACH LETTERS"},

//     {"match": ["First-Class Mail", "Presorted", "Flats"], "sortation": "FCM PRESORTED FLATS"},

 

//     {"match": ["First-Class Mail", "Nonmachinable", "Letters"], "sortation": "FCM NONMACH LETTERS"},

//     {"match": ["First-Class Mail", "Nonmachinable", "Cards"], "sortation": "FCM NONMACH CARDS"},

 

//     {"match": ["Parcels"], "sortation": "PARCEL - NOT PROCESSIBLE BY OUR SERVICE"},

//     {"match": ["Nonmailable"], "sortation": "NONMAILABLE - DOES NOT MEET USPS STANDARDS"}

//   ]
// };

// const getUSPSSortation = (input) => {
//   // Defensive check for rules initialization
//   if (!rules) {
//     console.error('Rules not initialized');
//     return {
//       error: 'Internal error: Rules not initialized',
//       aspectRatio: 'N/A',
//       selectedCategory: null,
//       sortation: 'Nonmailable',
//       note: 'Internal server error'
//     };
//   }

//   console.log('Rules initialized:', !!rules);
//   console.log('Input received:', input);

//   const { productHeight, productLength, productThickness, productWeight, imBarcode, isUniformThickness, isFlexible, presortOnly, mailClass, quantity } = input;

//   // Calculate aspect ratio
//   const aspectRatio = productLength && productHeight ? (productLength / productHeight).toFixed(2) : 'N/A';

//   // Validate mail class
//   let selectedMailClass = null;
//   for (const [mailClassName, mailRules] of Object.entries(rules.mail_class_rules)) {
//     let valid = true;
//     for (const rule of mailRules) {
//       if (rule.field === 'mailClass' && !rule.allowed_values.includes(mailClass)) {
//         valid = false;
//         break;
//       }
//       if (rule.field === 'productWeight' && rule.unit === 'oz' && productWeight > rule.max) {
//         valid = false;
//         break;
//       }
//       if (rule.field === 'quantity' && quantity < rule.min) {
//         valid = false;
//         break;
//       }
//     }
//     if (valid) {
//       selectedMailClass = mailClassName;
//       break;
//     }
//   }

//   if (!selectedMailClass) {
//     return {
//       error: 'Invalid mail class or parameters',
//       aspectRatio,
//       selectedCategory: null,
//       sortation: 'Nonmailable',
//       note: 'Fails minimum USPS mailability thresholds or logic'
//     };
//   }

//   // Determine processing category
//   let selectedCategory = null;
//   for (const [category, categoryRules] of Object.entries(rules.processing_category_rules)) {
//     let valid = true;
//     for (const rule of categoryRules) {
//       const value = {
//         productHeight,
//         productLength,
//         productThickness,
//         productWeight
//       }[rule.field];

//       if (rule.min !== undefined && value < rule.min) {
//         valid = false;
//         break;
//       }
//       if (rule.max !== undefined && value > rule.max) {
//         valid = false;
//         break;
//       }
//       if (rule.unit === 'lb' && input.weightUnit === 'oz' && productWeight / 16 > rule.max) {
//         valid = false;
//         break;
//       }
//       if (rule.unit === 'oz' && input.weightUnit === 'lbs' && productWeight * 16 > rule.max) {
//         valid = false;
//         break;
//       }
//     }
//     if (valid) {
//       selectedCategory = category;
//       break;
//     }
//   }

//   if (!selectedCategory) {
//     return {
//       error: 'Invalid dimensions or weight for any processing category',
//       aspectRatio,
//       selectedCategory: null,
//       sortation: 'Nonmailable',
//       note: 'Fails minimum USPS mailability thresholds or logic'
//     };
//   }

//   // Determine machinability
//   let machinability = null;
//   for (const [machinabilityType, machinabilityRules] of Object.entries(rules.machinability_rules)) {
//     let valid = true;
//     for (const rule of machinabilityRules) {
//       const value = {
//         imBarcode,
//         isUniformThickness,
//         isFlexible,
//         presortOnly
//       }[rule.field];
//       if (value !== rule.value) {
//         valid = false;
//         break;
//       }
//     }
//     if (valid) {
//       machinability = machinabilityType;
//       break;
//     }
//   }

//   if (!machinability) {
//     machinability = 'Nonmachinable'; // Default to Nonmachinable if no other match
//   }

//   // Find sortation combination
//   let sortationResult = null;
//   for (const combination of rules.sortation_combinations) {
//     const [mailClassMatch, machinabilityMatch, categoryMatch] = combination.match;
//     if (
//       (mailClassMatch === '*' || mailClassMatch === selectedMailClass) &&
//       (machinabilityMatch === '*' || machinabilityMatch === machinability) &&
//       (categoryMatch === '*' || categoryMatch === selectedCategory)
//     ) {
//       sortationResult = combination;
//       break;
//     }
//   }

//   if (!sortationResult) {
//     sortationResult = rules.sortation_combinations.find(combo => combo.match[0] === '*' && combo.match[1] === '*' && combo.match[2] === '*');
//   }

//   return {
//     selectedCategory,
//     aspectRatio,
//     sortation: sortationResult?.sortation,
//     note: sortationResult?.note || null,
//     error: sortationResult?.sortation === 'Nonmailable' ? sortationResult?.note : null
//   };
// };

// export default getUSPSSortation;


const sortationCombinations = [
  { match: ['USPS Marketing Mail', 'Automation', 'Letters'], sortation: 'STD AUTO LETTERS' },
  { match: ['USPS Marketing Mail', 'Nonmachinable', 'Letters'], sortation: 'STD NONMACH LETTERS' },
  { match: ['USPS Marketing Mail', 'Presorted', 'Flats'], sortation: 'STD PRESORTED FLATS' },

  { match: ['First-Class Mail', 'Automation', 'Cards'], sortation: 'FCM AUTO CARDS' },
  { match: ['First-Class Mail', 'Automation', 'Letters'], sortation: 'FCM AUTO LETTERS' },
  { match: ['First-Class Mail', 'Automation', 'Flats'], sortation: 'FCM AUTO FLATS' },

  { match: ['First-Class Mail', 'Machinable', 'Cards'], sortation: 'FCM MACH CARDS' },
  { match: ['First-Class Mail', 'Machinable', 'Letters'], sortation: 'FCM MACH LETTERS' },
  { match: ['First-Class Mail', 'Presorted', 'Flats'], sortation: 'FCM PRESORTED FLATS' },

  { match: ['First-Class Mail', 'Nonmachinable', 'Letters'], sortation: 'FCM NONMACH LETTERS' },
  { match: ['First-Class Mail', 'Nonmachinable', 'Cards'], sortation: 'FCM NONMACH CARDS' },

  { match: ['*', '*', 'Parcels'], sortation: 'PARCEL - NOT PROCESSIBLE BY OUR SERVICE' },
  { match: ['*', '*', 'Nonmailable'], sortation: 'NONMAILABLE - DOES NOT MEET USPS STANDARDS' }
];

const getUSPSSortation = (input = {}) => {
  const {
    productHeight,
    productLength,
    productThickness,
    productWeight,
    weightUnit = 'oz',
    imBarcode = true,
    isUniformThickness = true,
    isFlexible = true,
    isPolybagged = false,
    hasLooseItems = false,
    presortOnly = false,
    mailClass,
    quantity = 200
  } = input;

  const heightInput = Number(productHeight);
  const lengthInput = Number(productLength);
  const thickness = Number(productThickness);
  const enteredWeight = Number(productWeight);

  const invalidInput = [
    heightInput,
    lengthInput,
    thickness,
    enteredWeight
  ].some(value => !Number.isFinite(value) || value <= 0);

  if (invalidInput) {
    return {
      error: 'Enter valid positive dimensions and weight.',
      selectedCategory: null,
      aspectRatio: 'N/A',
      sortation: 'Nonmailable',
      note: 'All dimensions and weight must be greater than zero.'
    };
  }

  // USPS uses the longest dimension as length.
  const length = Math.max(heightInput, lengthInput);
  const height = Math.min(heightInput, lengthInput);

  // Convert all weights to ounces for consistent comparisons.
  const unit = String(weightUnit).toLowerCase();
  const weightOz = unit === 'lb' || unit === 'lbs'
    ? enteredWeight * 16
    : enteredWeight;

  const weightLb = weightOz / 16;
  const aspectRatio = Number((length / height).toFixed(2));

  const fail = (message, category = null) => ({
    error: message,
    selectedCategory: category,
    aspectRatio,
    sortation: 'NONMAILABLE - DOES NOT MEET USPS STANDARDS',
    note: message
  });

  // ------------------------------------------------
  // Mail class eligibility
  // ------------------------------------------------

  const normalizedMailClass = String(mailClass || '').trim();

  if (!['First-Class Mail', 'USPS Marketing Mail'].includes(normalizedMailClass)) {
    return fail('Select a valid mail class.');
  }

  if (
    normalizedMailClass === 'USPS Marketing Mail' &&
    Number(quantity) < 200
  ) {
    return fail('USPS Marketing Mail requires a minimum mailing quantity of 200 pieces.');
  }

  // ------------------------------------------------
  // Determine physical processing category
  // ------------------------------------------------

  let selectedCategory = null;

  const isCard =
    length >= 5 &&
    length <= 6 &&
    height >= 3.5 &&
    height <= 4.25 &&
    thickness >= 0.007 &&
    thickness <= 0.016;

  if (isCard) {
    selectedCategory = 'Cards';
  } else {
    const isLetter =
      length >= 5 &&
      length <= 11.5 &&
      height >= 3.5 &&
      height <= 6.125 &&
      thickness >= 0.007 &&
      thickness <= 0.25;

    if (isLetter) {
      selectedCategory = 'Letters';
    } else {
      // Automation flats use these minimum dimensions.
      const isFlat =
        length >= 6 &&
        length <= 15 &&
        height >= 5 &&
        height <= 12 &&
        thickness >= 0.009 &&
        thickness <= 0.75;

      if (isFlat) {
        selectedCategory = 'Flats';
      }
    }
  }

  // ------------------------------------------------
  // Check if the piece is a parcel
  // ------------------------------------------------

  if (!selectedCategory) {
    selectedCategory = 'Parcels';

    const girth = 2 * (height + thickness);
    const lengthPlusGirth = length + girth;

    if (weightLb > 70) {
      return fail('Parcel weight exceeds the general USPS maximum of 70 pounds.', 'Parcels');
    }

    if (lengthPlusGirth > 108) {
      return fail(
        'Parcel length plus girth exceeds the general USPS maximum of 108 inches. Some services have different limits.',
        'Parcels'
      );
    }

    return {
      error: null,
      selectedCategory: 'Parcels',
      aspectRatio,
      sortation: 'PARCEL - NOT PROCESSIBLE BY OUR SERVICE',
      note: 'This product falls outside the letter, card, and flat categories.'
    };
  }

  // ------------------------------------------------
  // Mail-class weight limits
  // ------------------------------------------------

  if (selectedCategory === 'Cards' && weightOz > 3.5) {
    return fail('Cards at card prices cannot exceed 3.5 ounces.', selectedCategory);
  }

  if (selectedCategory === 'Letters' && weightOz > 3.5) {
    return fail(
      'Letter-size mail cannot exceed 3.5 ounces. First-Class pieces over this limit may qualify for flat pricing if they meet flat standards.',
      selectedCategory
    );
  }

  if (selectedCategory === 'Flats') {
    const maxFlatWeight =
      normalizedMailClass === 'First-Class Mail' ? 13 : 20;

    if (weightOz > maxFlatWeight) {
      return fail(
        `${normalizedMailClass} flats cannot exceed ${maxFlatWeight} ounces.`,
        selectedCategory
      );
    }
  }

  // ------------------------------------------------
  // Machinability
  // ------------------------------------------------

  let machinability = 'Nonmachinable';

  const isAutomationEligible =
    imBarcode === true &&
    isFlexible === true &&
    isUniformThickness === true &&
    isPolybagged !== true &&
    hasLooseItems !== true;

if (isAutomationEligible) {
  machinability = 'Automation';
} else if (
  isFlexible === true &&
  isUniformThickness === true &&
  isPolybagged !== true &&
  hasLooseItems !== true
) {
  machinability = 'Machinable';
}

  // Presorted is an application-specific designation.
  if (presortOnly === true) {
    machinability = 'Presorted';
  }

  // Flats that are not flexible or uniformly thick
  // must be handled as parcels, not flats.
  if (
    selectedCategory === 'Flats' &&
    (!isFlexible || !isUniformThickness)
  ) {
    return {
      error: null,
      selectedCategory: 'Parcels',
      aspectRatio,
      sortation: 'PARCEL - NOT PROCESSIBLE BY OUR SERVICE',
      note: 'This flat does not meet USPS flexibility or uniform-thickness requirements and must be handled as a parcel.'
    };
  }

  // A letter outside the automation aspect-ratio range
  // can still be letter-size, but is nonmachinable.
  if (
    selectedCategory === 'Letters' &&
    (aspectRatio < 1.3 || aspectRatio > 2.5)
  ) {
    machinability = 'Nonmachinable';
  }

  // A letter over 6 inches long or 4.25 inches high
  // must be at least .009 inch thick for machinable processing.
  if (
    selectedCategory === 'Letters' &&
    (length > 6 || height > 4.25) &&
    thickness < 0.009
  ) {
    machinability = 'Nonmachinable';
  }

  // ------------------------------------------------
  // Find application sortation combination
  // ------------------------------------------------

  const actual = [
    normalizedMailClass,
    machinability,
    selectedCategory
  ];

  const match = sortationCombinations.find(combo =>
    combo.match.every((expected, index) =>
      expected === '*' || expected === actual[index]
    )
  );

  if (!match) {
    return {
      error: null,
      selectedCategory,
      aspectRatio,
      sortation: 'NO AVAILABLE SORTATION COMBINATION',
      note: `USPS category is ${selectedCategory}, but no application sortation rule matches ${normalizedMailClass} / ${machinability}.`
    };
  }

  return {
    error: null,
    selectedCategory,
    aspectRatio,
    machinability,
    sortation: match.sortation,
    note: null
  };
};

export default getUSPSSortation;
