import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { resizeImageToBase64 } from '../../Helpers/resizeImageToBase64';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useCampaigns } from '../../context/CampaignContext';
import { toast } from 'react-toastify';
import { confirm } from '../../Helpers/Confirm';
import InformedDeliveryPhonePreview from './Informeddeliveryphonepreview';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import api from '../../Helpers/Api';
import ValidationSummary from '../../Helpers/Valiodationsummary';

const FIELD_LABELS = {
  campaignTitle: 'Campaign Title',
  campaignCode: 'Campaign Code',
  mid: 'Mailer ID (MID)',
  startDate: 'Start Date',
  endDate: 'End Date',
  targetUrl: 'Target URL',
  brandDisplayName: 'Brand Name',
  mailOwnerCRID: 'Mail Owner',
  representativeImage: 'Representative Image',
  rideAlongImage: 'Ride-Along Image',
  mailpieceShape: 'Mailpiece Shape',
  campaignType: 'Campaign Type',
  serialStart: 'Serial Start',
  serialEnd: 'Serial End',
};

// fields that map to an input with that name attribute
const FIELD_TARGETS = {
  campaignTitle: 'campaignTitle',
  campaignCode: 'campaignCode',
  mid: 'mid',
  startDate: 'startDate',
  endDate: 'endDate',
  targetUrl: 'targetUrl',
  brandDisplayName: 'brandDisplayName',
  mailpieceShape: 'mailpieceShape',
  campaignType: 'campaignType',
  serialStart: 'serialStart',
  serialEnd: 'serialEnd',
};



const InformedDeliveryCampaignForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { user, heroku } = useAuth();
const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
const location = useLocation();
  const navigate = useNavigate();
const mailOwnerReturn = location.state?.createdMailOwner;
const campaignDraft = location.state?.campaignDraft;
  const [originalCampaignType, setOriginalCampaignType] = useState("");
  const [savedRecordCount, setSavedRecordCount] = useState(0);


const [formData, setFormData] = useState(() => ({
  campaignType: 'A02',
  mailpieceShape: '',
        mailOwnerCRID:'',
        mailOwnerName:'',
        brandDisplayName: user.company?.name || ''}))
  


const [rideAlongPreview, setRideAlongPreview] = useState(
  () => campaignDraft?.rideAlongPreview || null
);

const [repPreview, setRepPreview] = useState(
  () => campaignDraft?.repPreview || null
);

const [csvFileName, setCsvFileName] = useState(
  () => campaignDraft?.csvFileName || null
);

const [rideAlongInfo, setRideAlongInfo] = useState(
  () => campaignDraft?.rideAlongInfo || null
);

const [repInfo, setRepInfo] = useState(
  () => campaignDraft?.repInfo || null
);

const [csvResults, setCsvResults] = useState(
  () => campaignDraft?.csvResults || null
);


const resetCsvList = () => {
  setCsvFileName(null);
  setCsvResults(null);

  if (csvInputRef.current) {
    csvInputRef.current.value = '';
  }

  setFormData((prev) => ({
    ...prev,
    csvFile: null,
    serialStart: '',
    serialEnd: '',
    mid: '',
  }));
};

  const [errors, setErrors] = useState({});
  const [uspsErrors, setUspsErrors] = useState([]);
  const [dragOver, setDragOver] = useState({
    rideAlong: false,
    representative: false,
    csv: false,
  });
 

  const rideAlongInputRef = useRef(null);
  const repInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const { campaignsList, refetchCampaigns } = useCampaigns();


  // Manual IMB entry
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualImbs, setManualImbs] = useState([]);
  const [manualError, setManualError] = useState('');
const [manualValidated, setManualValidated] = useState(false);
  const [mailOwners, setMailOwners] = useState([]);
const [isLoadingMailOwners, setIsLoadingMailOwners] = useState(true);

  const existingCampaign = isEdit
    ? campaignsList?.usps?.campaigns?.find(
        (c) => String(c.campaignID) === String(id) || String(c.id) === String(id)
      )
    : null;

  useEffect(() => {
    if (!isEdit) {
      setIsLoadingCampaign(false);
      return;
    }

    const loadCampaign = async () => {
      setIsLoadingCampaign(true);
      try {
        let y = {id:id}
        console.log(y)
        const res = await api.post(`/campaigns/getCampaignById`,y);
console.log(res.data)

        const c = res.data.campaign;
        if (!c) throw new Error('No campaign data in response');

        const savedCampaignType = c.campaignType || 'A02';
setOriginalCampaignType(savedCampaignType);
setSavedRecordCount(
  Number(
    c.recordCount ??
    c.barcodeCount ??
    c.totalRecords ??
    c.IMBs?.length ??
    0
  )
);
        setFormData({
          brandDisplayName: c.brandDisplayName || user?.company?.name || '',
          campaignTitle: c.campaignTitle || '',
          campaignCode: c.campaignCode || '',
         campaignType: savedCampaignType,
          mid: c.MID || '',
          serialStart: c.startSerial || '',
          serialEnd: c.endSerial || '',
          startDate: c.startDate ? String(c.startDate).slice(0, 10) : '',
          endDate: c.endDate ? String(c.endDate).slice(0, 10) : '',
          mailpieceShape: mapShape(c.mailpieceShape),
          targetUrl: c.targetUrl || '',
          rideAlongImage: c.rideAlong || null,
          representativeImage: c.replacementImage || null,
          csvFile: null,
          status: c.status || '',
          mailOwnerCRID: c.mailOwnerCRID || '',
mailOwnerName: c.mailOwnerName || '',
        });

        if (c.rideAlong) {
          setRideAlongPreview(`data:image/jpeg;base64,${c.rideAlong}`);
        }
        if (c.replacementImage) {
          setRepPreview(`data:image/jpeg;base64,${c.replacementImage}`);
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || 'Failed to load campaign');
        navigate('/informed');
      } finally {
        setIsLoadingCampaign(false);
      }
    };

    loadCampaign();
  }, [isEdit, id]);


const normalizeMailOwner = (raw) => {
  const owner =
    raw?.mailOwner ||
    raw?.owner ||
    raw?.data?.mailOwner ||
    raw?.data?.owner ||
    raw?.data ||
    raw;

  if (!owner || typeof owner !== 'object') return null;

  return {
    ...owner,
    _id: owner._id || owner.id || '',
    crid: String(owner.crid ?? owner.CRID ?? owner.mailOwnerCRID ?? ''),
    companyName:
      owner.companyName ??
      owner.company ??
      owner.businessName ??
      '',
    mailOwnerName:
      owner.mailOwnerName ??
      owner.ownerName ??
      owner.companyName ??
      owner.company ??
      '',
  };
};

// Select the newly created owner as soon as we return to this form.
useEffect(() => {
  if (!mailOwnerReturn) return;

  const owner = normalizeMailOwner(mailOwnerReturn);

  console.log('Returned created Mail Owner:', owner);

  if (!owner?.crid) {
    console.error(
      'The returned Mail Owner does not contain a CRID:',
      mailOwnerReturn
    );
    return;
  }

  setMailOwners((prev) => {
    const exists = prev.some(
      (item) =>
        String(item.crid ?? item.CRID ?? '') === owner.crid ||
        (owner._id &&
          String(item._id ?? item.id ?? '') === String(owner._id))
    );

    return exists
      ? prev.map((item) =>
          String(item.crid ?? item.CRID ?? '') === owner.crid
            ? { ...item, ...owner }
            : item
        )
      : [...prev, owner];
  });

  setFormData((prev) => ({
    ...prev,
    mailOwnerCRID: owner.crid,
    mailOwnerName: owner.mailOwnerName,
    brandDisplayName: user.company?.name ,
  }));

  setErrors((prev) => ({
    ...prev,
    mailOwnerCRID: undefined,
    brandDisplayName: undefined,
  }));
}, [mailOwnerReturn]);

// Load owners after the company ID becomes available.

useEffect(() => {
  const companyId = user?.company?._id;
  if (!companyId) return;

  let cancelled = false;

  const loadMailOwners = async () => {
    setIsLoadingMailOwners(true);

    try {
      const res = await api.post(
        '/permits/getmailowners',
        { id: companyId }
      );

      const data = res.data;

      const rawOwners = Array.isArray(data)
        ? data
        : Array.isArray(data?.mailOwners)
          ? data.mailOwners
          : Array.isArray(data?.owners)
            ? data.owners
            : [];

      // Normalize every API record so the dropdown uses consistent fields.
      const owners = rawOwners
        .map(normalizeMailOwner)
        .filter((owner) => owner?.crid);

      // Normalize the owner returned from the creation form.
      const createdOwner = normalizeMailOwner(mailOwnerReturn);

      // Merge by CRID so the new owner cannot be duplicated.
      const ownerMap = new Map(
        owners.map((owner) => [String(owner.crid), owner])
      );

      if (createdOwner?.crid) {
        ownerMap.set(String(createdOwner.crid), {
          ...ownerMap.get(String(createdOwner.crid)),
          ...createdOwner,
        });
      }

      if (!cancelled) {
        setMailOwners(Array.from(ownerMap.values()));
      }
    } catch (err) {
      console.error(
        'Failed to load mail owners:',
        err.response?.data || err
      );
      toast.error('Unable to load mail owners.');
    } finally {
      if (!cancelled) {
        setIsLoadingMailOwners(false);
      }
    }
  };

  loadMailOwners();

  return () => {
    cancelled = true;
  };
}, [user?.company?._id, mailOwnerReturn]);


  function mapShape(shape) {
    if (!shape) return 'Letter';
    const s = String(shape).toUpperCase();
    if (s === 'LT') return 'Letter';
    if (s === 'CD' || s === 'CARD') return 'Card';
    if (s === 'FL') return 'Flat';
    return 'Letter';
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    toast.dismiss();

    if (name === 'startDate' && value && formData.status !== 'ACTIVE') {
      const tomorrow = getTomorrow();
      if (value < tomorrow) {
        setFormData((prev) => ({ ...prev, startDate: '', endDate: '' }));
        toast.warning('Start date must be tomorrow or later.');
        return;
      }
    }

if (name === 'targetUrl') {
  const bare = (value || '').trim().replace(/^https?:\/\//i, '');

  setFormData((prev) => ({
    ...prev,
    targetUrl: bare ? `https://${bare}` : '',
  }));

  if (errors.targetUrl) {
    setErrors((prev) => ({ ...prev, targetUrl: undefined }));
  }

  return;
}


    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'startDate' && value) {
        updated.endDate = addDays(value, 14);
      }
      return updated;
    });

    if (name === 'campaignType') {
      setTimeout(() => {
        if (formData.csvFile) {
          processCsv(formData.csvFile, value);
        }
      }, 0);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const processImage = async (file, type) => {
    if (!file) return;
    try {
      const { base64, width, height } = await resizeImageToBase64( file,
  type === 'rideAlong' ? 'rideAlong' : 'representative');
      const previewUrl = `data:image/jpeg;base64,${base64}`;
      const sizeBytes = Math.ceil((base64.length * 3) / 4);
      const sizeKB = sizeBytes / 1024;
      const sizeMB = sizeKB / 1024;

      const imageInfo = {
        width,
        height,
        sizeBytes,
        sizeKB,
        sizeMB,
        originalName: file.name,
        originalSize: file.size,
      };

      if (type === 'rideAlong') {
        setRideAlongPreview(previewUrl);
        setRideAlongInfo(imageInfo);
        setFormData((prev) => ({ ...prev, rideAlongImage: base64 }));
      } else {
        setRepPreview(previewUrl);
        setRepInfo(imageInfo);
        setFormData((prev) => ({ ...prev, representativeImage: base64 }));
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const parseIMB = (imb) => {
    const value = String(imb || '').trim().replace(/^"|"$/g, '');
    if (!/^\d{31}$/.test(value)) {
      return { valid: false, error: `Invalid IMb. Expected 31 digits, received "${value}"` };
    }
    return {
      valid: true,
      barcodeId: value.substring(0, 2),
      serviceTypeId: value.substring(2, 5),
      MID: value.substring(5, 14),
      serialNumber: value.substring(14, 20),
      routingCode: value.substring(20, 31),
      originalIMB: value,
    };
  };

  const parseCSVText = (text) => {
    const rows = [];
    let row = [];
    let field = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && insideQuotes && next === '"') {
        field += '"';
        i++;
        continue;
      }
      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }
      if (char === ',' && !insideQuotes) {
        row.push(field);
        field = '';
        continue;
      }
      if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && next === '\n') i++;
        row.push(field);
        field = '';
        if (row.some((v) => v.trim() !== '')) rows.push(row);
        row = [];
        continue;
      }
      field += char;
    }

    if (field !== '' || row.length > 0) {
      row.push(field);
      if (row.some((v) => v.trim() !== '')) rows.push(row);
    }
    return rows;
  };

  const processCsv = async (file, forcedType = null) => {
    if (!file) return;
    toast.dismiss();

    const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      alert('Please upload a CSV file.');
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCSVText(text);

      if (rows.length < 2) {
        alert('The CSV does not contain any mailpieces.');
        return;
      }

      const headers = rows[0].map((h) => String(h).trim().toLowerCase());
      const imbIndex = headers.findIndex(
        (h) =>
          h === 'imb' ||
          h === 'imbbarcode' ||
          h === 'intelligentmailbarcode' ||
          h === 'intelligent_mail_barcode'
      );

      if (imbIndex === -1) {
        toast.error(
          <div>
            Could not find an "imb" column in the CSV.
            <br />
            Please upload one MID per campaign.
          </div>,
          { style: { width: '500px', maxWidth: 'unset' }, autoClose: false, closeButton: true }
        );
        return;
      }

      const mailpieces = [];
      const invalidRows = [];

      rows.slice(1).forEach((row, index) => {
        const csvRowNumber = index + 2;
        const imb = String(row[imbIndex] || '').trim();
        if (!imb) {
          invalidRows.push({ row: csvRowNumber, error: 'IMb is empty' });
          return;
        }
        const parsed = parseIMB(imb);
        if (!parsed.valid) {
          invalidRows.push({ row: csvRowNumber, imb, error: parsed.error });
          return;
        }
        mailpieces.push({ csvRow: csvRowNumber, ...parsed });
      });

      if (mailpieces.length === 0) {
        toast.warning(<div>No valid 31-digit IMbs were found in the uploaded file.</div>);
        return;
      }

      const uniqueMIDs = [...new Set(mailpieces.map((m) => m.MID))];
      if (uniqueMIDs.length > 1) {
        toast.error(
          <div>
            Multiple MIDs were found in this mail list:
            <br />
            {uniqueMIDs.join(', ')}
            <br />
            Please upload one MID per campaign.
          </div>,
          { style: { width: '500px', maxWidth: 'unset' }, autoClose: false, closeButton: true }
        );
        return;
      }

      const MID = uniqueMIDs[0];
      const serialNumbers = mailpieces
        .map((m) => m.serialNumber)
        .sort((a, b) => Number(a) - Number(b));

      const duplicateSerials = serialNumbers.filter(
        (s, i) => serialNumbers.indexOf(s) !== i
      );
      const uniqueDuplicateSerials = [...new Set(duplicateSerials)];

      const campaignType = forcedType || formData.campaignType;
      const isA01 = campaignType === 'A01';
      const isA03 = campaignType === 'A03';

      let startSerial = '';
      let endSerial = '';
      let hasSerialGaps = false;

      if (isA03 || isA01) {
        startSerial = serialNumbers[0];
        endSerial = serialNumbers[serialNumbers.length - 1];
        for (let i = 1; i < serialNumbers.length; i++) {
          if (Number(serialNumbers[i]) !== Number(serialNumbers[i - 1]) + 1) {
            hasSerialGaps = true;
            break;
          }
        }
      }

      // if (isA03 && uniqueDuplicateSerials.length > 0) {
      //   toast.warning(
      //     <div>
      //       This A03 campaign contains duplicate serial numbers:
      //       <br />
      //       {uniqueDuplicateSerials.join(', ')}
      //       <br />
      //       A03 campaigns require a sequential serial range.
      //     </div>,
      //     { style: { width: '500px', maxWidth: 'unset' }, autoClose: false, closeButton: true }
      //   );
      //   return;
      // }

      // if (isA03 && hasSerialGaps) {
      //   toast.warning(
      //     <div>
      //       This A03 campaign contains gaps in the serial numbers.
      //       <br />
      //       Detected range: {startSerial} – {endSerial}
      //       <br />
      //       Serial-range campaigns must use a sequential serial range.
      //     </div>,
      //     { style: { width: '500px', maxWidth: 'unset' }, autoClose: false, closeButton: true }
      //   );
      //   return;
      // }

      // A03 requires unique, continuous serial numbers.
if (isA03 && uniqueDuplicateSerials.length > 0) {
  toast.warning(
    `Sequential campaigns cannot contain duplicate serial numbers: ${
      uniqueDuplicateSerials.join(', ')
    }. The CSV list has been cleared.`,
    { autoClose: false }
  );

  resetCsvList();
  return;
}

if (isA03 && hasSerialGaps) {
  toast.warning(
    `Sequential campaigns require consecutive serial numbers. ` +
    `The detected range is ${startSerial}–${endSerial}, but the list ` +
    `contains gaps. The CSV list has been cleared.`,
    { autoClose: false }
  );

  resetCsvList();
  return;
}


      if (isA01 && uniqueDuplicateSerials.length > 0) {
        toast.warning(
          <div>
            This A01 campaign contains duplicate serial numbers:
            <br />
            {uniqueDuplicateSerials.join(', ')}
            <br />
            Please remove duplicate mailpieces from the CSV.
          </div>,
          { style: { width: '500px', maxWidth: 'unset' }, autoClose: false, closeButton: true }
        );
        return;
      }

      if (isA01 && !hasSerialGaps && serialNumbers.length > 1) {
        const confirmed = await confirm({
          title: 'Sequential barcodes detected',
          message:
            `The serial numbers in this file appear sequential:\n\n` +
            `${startSerial} → ${endSerial} (${serialNumbers.length} pieces)\n\n` +
            `Non-sequential (A01) campaigns are intended for individual barcodes.\n` +
            `Do you still want to use A01 with this list?`,
        });
        if (!confirmed) {
          setCsvFileName(null);
          setCsvResults(null);
          setFormData((prev) => ({
            ...prev,
            csvFile: null,
            mid: '',
            serialStart: '',
            serialEnd: '',
          }));
          if (csvInputRef.current) csvInputRef.current.value = '';
          return;
        }
      }

      setCsvResults({
        fileName: file.name,
        totalRows: rows.length - 1,
        validMailpieces: mailpieces?.length,
        invalidMailpieces: invalidRows?.length,
        MID,
        campaignType,
        startSerial: isA03 ? startSerial : '',
        endSerial: isA03 ? endSerial : '',
        serialCount: serialNumbers.length,
        hasSerialGaps,
        duplicateSerials: uniqueDuplicateSerials,
        mailpieces,
        invalidRows,
      });

      setFormData((prev) => ({
        ...prev,
        mid: MID,
        serialStart: isA03 ? startSerial : '',
        serialEnd: isA03 ? endSerial : '',
        csvFile: file,
        campaignType,
      }));

      setCsvFileName(file.name);
    } catch (err) {
      console.error('CSV processing error:', err);
      alert(err.message || 'Unable to process the CSV file.');
    }
  };

  // ── Manual IMB helpers ──────────────────────────────────────────
  const openManualModal = () => {
    setManualText('');
    setManualImbs([]);
    setManualError('');
    setShowManualModal(true);
  };

  const closeManualModal = () => {
    setShowManualModal(false);
    setManualText('');
    setManualImbs([]);
    setManualError('');
  };

  const processManualText = () => {
    setManualValidated(false);
setManualImbs([]);
setManualError('');
    setManualError('');
    const raw = manualText
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (raw.length === 0) {
      setManualError('Please enter at least one IMB.');
      return;
    }

    const parsed = [];
    const errors = [];
    const seen = new Set();

    raw.forEach((val, idx) => {
      const result = parseIMB(val);
      if (!result.valid) {
        errors.push(`Line ${idx + 1}: ${result.error}`);
        return;
      }
      if (seen.has(result.originalIMB)) {
        errors.push(`Line ${idx + 1}: Duplicate IMB ${result.originalIMB}`);
        return;
      }
      seen.add(result.originalIMB);
      parsed.push(result);
    });

    if (errors.length) {
      setManualError(
        errors.slice(0, 5).join('\n') +
          (errors.length > 5 ? `\n… and ${errors.length - 5} more` : '')
      );
      return;
    }

    const uniqueMIDs = [...new Set(parsed.map((p) => p.MID))];
    if (uniqueMIDs.length > 1) {
      setManualError(
        `Multiple MIDs found: ${uniqueMIDs.join(', ')}\nPlease use only one MID per campaign.`
      );
      return;
    }

    setManualImbs(parsed);
    setManualValidated(true);
  };

  const applyManualImbs = async () => {
    if (manualImbs.length === 0) {
      setManualError('No valid IMBs to apply.');
      return;
    }

    const newMID = manualImbs[0].MID;

    // Check if we already have an A01 list → add to it
    const hasExisting =
      formData.campaignType === 'A01' &&
      csvResults?.mailpieces &&
      csvResults?.mailpieces.length > 0;

    let finalMailpieces = [];
    let finalMID = newMID;
    let addedCount = 0;
    let skippedDuplicates = 0;

    if (hasExisting) {
      // Must be the same MID
      if (csvResults?.MID !== newMID) {
        setManualError(
          `Existing list uses MID ${csvResults?.MID}.\nThe IMBs you entered use MID ${newMID}.\nPlease use the same MID.`
        );
        return;
      }

      const existingSet = new Set(csvResults?.mailpieces.map((m) => m.originalIMB));
      finalMailpieces = [...csvResults?.mailpieces];

      manualImbs.forEach((m) => {
        if (existingSet.has(m.originalIMB)) {
          skippedDuplicates++;
        } else {
          finalMailpieces.push({ csvRow: null, ...m });
          existingSet.add(m.originalIMB);
          addedCount++;
        }
      });

      if (addedCount === 0) {
        setManualError(
          skippedDuplicates > 0
            ? `All ${skippedDuplicates} IMB(s) already exist in the current list.`
            : 'No new IMBs to add.'
        );
        return;
      }
    } else {
      // Brand new list
      finalMailpieces = manualImbs.map((m) => ({ csvRow: null, ...m }));
      addedCount = finalMailpieces.length;
    }

    const serialNumbers = finalMailpieces
      .map((m) => m.serialNumber)
      .sort((a, b) => Number(a) - Number(b));

    let hasSerialGaps = false;
    for (let i = 1; i < serialNumbers.length; i++) {
      if (Number(serialNumbers[i]) !== Number(serialNumbers[i - 1]) + 1) {
        hasSerialGaps = true;
        break;
      }
    }

    // Sequential confirmation only for brand-new lists
    if (!hasExisting && !hasSerialGaps && serialNumbers.length > 1) {
      const confirmed = await confirm({
        title: 'Sequential barcodes detected',
        message:
          `The serial numbers appear sequential:\n\n` +
          `${serialNumbers[0]} → ${serialNumbers[serialNumbers.length - 1]} (${serialNumbers.length} pieces)\n\n` +
          `Non-sequential (A01) campaigns are intended for individual barcodes.\n` +
          `Do you still want to use A01 with this list?`,
      });
      if (!confirmed) return;
    }

    const newFileName = hasExisting
      ? csvResults?.fileName.includes('Manual')
        ? csvResults?.fileName
        : `${csvResults?.fileName} + Manual`
      : 'Manual Entry';

    setCsvResults({
      fileName: newFileName,
      totalRows: finalMailpieces.length,
      validMailpieces: finalMailpieces?.length,
      invalidMailpieces: 0,
      MID: finalMID,
      campaignType: 'A01',
      startSerial: '',
      endSerial: '',
      serialCount: serialNumbers.length,
      hasSerialGaps,
      duplicateSerials: [],
      mailpieces: finalMailpieces,
      invalidRows: [],
    });

    setFormData((prev) => ({
      ...prev,
      mid: finalMID,
      serialStart: '',
      serialEnd: '',
      campaignType: 'A01',
    }));

    setCsvFileName(newFileName);

    if (hasExisting) {
      toast.success(
        `Added ${addedCount} IMB${addedCount !== 1 ? 's' : ''}${
          skippedDuplicates > 0
            ? ` (${skippedDuplicates} duplicate${skippedDuplicates !== 1 ? 's' : ''} skipped)`
            : ''
        }`
      );
    }

    closeManualModal();
  };

  const removeManualImb = (imb) => {
    setManualImbs((prev) => prev.filter((m) => m.originalIMB !== imb));
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImage(file, type);
  };

  const handleCsvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processCsv(file);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: false }));
    const file = e.dataTransfer.files?.[0];
    if (type === 'csv') {
      await processCsv(file);
    } else {
      await processImage(file, type);
    }
  };

  const removeImage = (type) => {
    if (type === 'rideAlong') {
      setRideAlongPreview(null);
      setRideAlongInfo(null);
      setFormData((prev) => ({ ...prev, rideAlongImage: null }));
      if (rideAlongInputRef.current) rideAlongInputRef.current.value = '';
    } else if (type === 'representative') {
      setRepPreview(null);
      setRepInfo(null);
      setFormData((prev) => ({ ...prev, representativeImage: null }));
      if (repInputRef.current) repInputRef.current.value = '';
    } else if (type === 'csv') {
      setCsvFileName(null);
      setCsvResults(null);
      setFormData((prev) => ({
        ...prev,
        csvFile: null,
        mid: '',
        serialStart: '',
        serialEnd: '',
      }));
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

const validate = () => {
  const newErrors = {};

  if (!formData.campaignTitle?.trim()) {
    newErrors.campaignTitle = 'Campaign title is required';
  }

  if (!formData.campaignCode?.trim()) {
    newErrors.campaignCode = 'Campaign code is required';
  }

  if (!formData.mid?.trim()) {
    newErrors.mid = 'Mailer ID (MID) is required';
  }

  if (
    !['A01', 'A02', 'A03'].includes(formData.campaignType)
  ) {
    newErrors.campaignType = 'Please select a valid campaign type';
  }

  if (!['Letter', 'Card', 'Flat'].includes(formData.mailpieceShape)) {
    newErrors.mailpieceShape = 'Please select a mailpiece shape';
  }

  // Active campaigns do not require start-date validation.
  if (formData.status !== 'ACTIVE' && !formData.startDate) {
    newErrors.startDate = 'Start date is required';
  }

  if (!formData.endDate) {
    newErrors.endDate = 'End date is required';
  }

  if (
    formData.status !== 'ACTIVE' &&
    formData.startDate &&
    formData.startDate < getTomorrow()
  ) {
    newErrors.startDate = 'Start date must be tomorrow or later';
  }

  if (!formData.targetUrl?.trim()) {
    newErrors.targetUrl = 'Target URL is required';
  } else if (!/^https:\/\/.+/i.test(formData.targetUrl.trim())) {
    newErrors.targetUrl = 'URL must start with https://';
  }

  if (!formData.brandDisplayName) {
    newErrors.brandDisplayName = 'Please Enter A Brand Name';
  }

  if (
    formData.mailpieceShape === 'Flat' &&
    !formData.representativeImage
  ) {
    newErrors.representativeImage =
      'Representative image is required for flats';
  }

  if (!formData.rideAlongImage) {
    newErrors.rideAlongImage = 'Ride-Along image is required';
  }

  if (
    formData.campaignType === 'A03' &&
    !formData.csvFile &&
    (!formData.serialStart || !formData.serialEnd)
  ) {
    if (!formData.serialStart) {
      newErrors.serialStart = 'Serial start is required for A03 campaigns';
    }

    if (!formData.serialEnd) {
      newErrors.serialEnd = 'Serial end is required for A03 campaigns';
    }
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};



const handleSubmit = async (e) => {
  e.preventDefault();

  setUspsErrors([]);

  const isValid = validate();

  if (!isValid) {
    setShowValidationSummary(true);
    toast.dismiss();

    setTimeout(() => {
      document.getElementById('validation-summary')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);

    return;
  }

  setShowValidationSummary(false);

  const isA01 = formData.campaignType === 'A01';
  const isA03 = formData.campaignType === 'A03';

  // Keep the CSV file separate from the USPS payload.
  const {
    csvFile,
    rideAlongImage,
    representativeImage,
    ...campaignFields
  } = formData;

  // A01 campaigns use IMBs rather than an A03 serial range.
  const barcodes =
    isA01 && csvResults?.mailpieces
      ? csvResults?.mailpieces
          .map((m) => m.originalIMB)
          .filter(Boolean)
      : undefined;

  // ---------------------------------------------
  // 1. Build the USPS payload
  // ---------------------------------------------
  const payload = {
    ...campaignFields,

     ...(isEdit
    ? {
        campaignID: id,
        originalCampaignType,
      }
    : {}),

    MID: formData.mid,

    // Serial ranges apply only to A03.
    startSerial: isA03
      ? formData.serialStart || ''
      : undefined,

    endSerial: isA03
      ? formData.serialEnd || ''
      : undefined,

    IMBs: barcodes,

    submitterName: 'Lightning Presort Services',

    mailOwnerCRID: '',
    mailOwnerName:'',
    brandDisplayName: formData.brandDisplayName || '',
customer:user.company?._id,
    // Keep the image fields USPS needs.
    rideAlong: rideAlongImage || '',
    replacementImage: representativeImage || '',

    mailpieceShape:
      formData.mailpieceShape === 'Letter'
        ? 'LT'
        : ['Card', 'Postcard'].includes(formData.mailpieceShape)
          ? 'CD'
          : formData.mailpieceShape === 'Flat'
            ? 'FL'
            : formData.mailpieceShape,
  };

  // Remove undefined values.
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  setIsSubmitting(true);

  try {
    console.log('Campaign form data:', formData);
    console.log('USPS submission payload:', payload);

         // ---------------------------------------------
          // 2. Submit to USPS first
          // ---------------------------------------------
    const uspsResponse = isEdit
      ? await axios.put(
          `${heroku}/usps/edit-campaign`,
          payload
        )
      : await axios.post(
          `${heroku}/usps/campaign`,
          payload
        );

    console.log(
      'USPS campaign response:',
      uspsResponse.data
    );

    // ---------------------------------------------
    // 3. USPS succeeded. Prepare MongoDB payload.
    // ---------------------------------------------
    let csvContent = '';

    if (csvFile && typeof csvFile.text === 'function') {
      csvContent = await csvFile.text();
    }


    await refetchCampaigns({ silent: true });

      toast.success(
  isEdit
    ? 'Campaign updated successfully!'
    : 'Campaign created successfully!',
  {
    position: 'top-center',
    autoClose: 3000,
  }
);
    navigate('/informed');


    
} catch (error) {
  console.error('Campaign submission failed:', error);

  const responseData = error.response?.data;

  console.error(
    'USPS response:',
    JSON.stringify(responseData, null, 2)
  );

  // USPS errors can be nested in different response structures.
  let apiErrors =
    responseData?.errors ||
    responseData?.details?.error?.errors ||
    responseData?.error?.errors ||
    responseData?.data?.errors ||
    responseData?.details?.errors ||
    responseData?.validationErrors ||
    responseData?.data?.validationErrors ||
    responseData?.data?.data?.errors ||
    [];

  // Handle a response where errors is a single object.
  if (apiErrors && !Array.isArray(apiErrors)) {
    apiErrors = [apiErrors];
  }

  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    setUspsErrors(
      apiErrors.map((item) => ({
        title:
          item?.title ||
          item?.code ||
          item?.error ||
          'USPS Validation Error',

        detail:
          item?.detail ||
          item?.message ||
          item?.description ||
          'The USPS API rejected this field.',
      }))
    );
  } else {
    // Fall back to the backend error if USPS supplied no error array.
    setUspsErrors([
      {
        title:
          responseData?.error ||
          responseData?.message ||
          'Campaign Submission Failed',

        detail:
          responseData?.details?.error?.message ||
          responseData?.details?.message ||
          responseData?.details ||
          responseData?.message ||
          error.message ||
          'An unexpected error occurred while submitting the campaign.',
      },
    ]);
  }

  setShowValidationSummary(true);

  toast.error(
    'Campaign submission failed. Review the errors below.'
  );

  setTimeout(() => {
    document.getElementById('validation-summary')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 100);
}finally {
    setIsSubmitting(false);
  }
};

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addDays = (dateStr, days) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


    if (isLoadingCampaign) {
    return (
      <div className="dashboard">
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-4" />
          <p className="text-lg font-medium">Loading campaign…</p>
        </div>
      </div>
    );
  }


  console.log(formData?.targetUrl)
  return (
    <div className="dashboard">
       {isSubmitting && (
      <div
        className="submission-overlay"
        role="status"
        aria-live="assertive"
      >
        <div className="submission-overlay-card">
          <div className="submission-spinner" />

          <h2>
            {isEdit ? 'Updating Campaign' : 'Submitting Campaign'}
          </h2>

          <p>
            Your campaign is being submitted to USPS.
            Please wait and do not refresh or close this page.
          </p>

          <div className="submission-progress">
            <div />
          </div>

          <p className="submission-status">
            <span className="submission-status-dot" />
            Processing your request…
          </p>
        </div>
      </div>
    )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>{isEdit ? 'Edit Campaign' : 'New Informed Delivery Campaign'}</h1>
          <p>Fill in the required campaign details and upload your images.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/informed')}
        >
          ← Back to Campaigns
        </button>
      </div>

     <form onSubmit={handleSubmit} className="space-y-6">
      
 {showValidationSummary && (
  <ValidationSummary
    errors={errors}
    apiErrors={uspsErrors}
    apiErrorsTitle="USPS Validation Errors"
    apiErrorsSubtitle="USPS could not accept this campaign. Review the messages below."
    title="Please review your campaign"
    message="Your campaign hasn't been submitted yet. Please correct the following items."
    fieldLabels={FIELD_LABELS}
    fieldTargets={FIELD_TARGETS}
    fallbackTargetId="campaign-images"
    onDismiss={() => setShowValidationSummary(false)}
  />
)}


        {/* ── Campaign Description ─────────────────────────── */}
        <section className="card">
          <div className="card-header">
            <h2>Campaign Description</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="form-group col-span-2 " >
<div className="flex flex-wrap items-center justify-between gap-3  ">
  <label className="mb-[-2]font-semibold text-gray-700">
    Display Brand Name
    <span className="required"> *</span>
  </label>

 
</div>

    <input
                style={{ textTransform: 'capitalize' }}
                type="text"
                name="brandDisplayName"
                value={formData.brandDisplayName}
                onChange={handleChange}
                maxLength={40}
                placeholder="Brand Display Name"
              />




  {errors.mailOwnerCRID && (
    <p className="field-error">{errors.mailOwnerCRID}</p>
  )}
</div>
            <div className="form-group">
              <label>
                Campaign Title <span className="required">*</span>
              </label>
              <input
                style={{ textTransform: 'capitalize' }}
                type="text"
                name="campaignTitle"
                value={formData.campaignTitle}
                onChange={handleChange}
                maxLength={40}
                placeholder="Internal title"
              />
              {errors.campaignTitle && (
                <p className="field-error">{errors.campaignTitle}</p>
              )}
            </div>
                  <div className="form-group">
              <label>
                Campaign Code <span className="required">*</span>
              </label>
              <input
                style={{ textTransform: 'capitalize' }}
                type="text"
                name="campaignCode"
                value={formData.campaignCode}
                onChange={handleChange}
                maxLength={40}
                placeholder="e.g. BRAND-20260928-1"
              />
              {errors.campaignCode && (
                <p className="field-error">{errors.campaignCode}</p>
              )}
            </div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
   <div className="form-group">
  <label htmlFor="mailpieceShape">
    Mailpiece Shape <span className="required">*</span>
  </label>

  <select
    name="mailpieceShape"
    id="mailpieceShape"
    value={formData.mailpieceShape || ''}
    onChange={handleChange}
    
  >
    <option value="">Select Mailpiece Shape</option>
    <option value="Letter">Letter</option>
    <option value="Card">Postcard / Card</option>
    <option value="Flat">Flat</option>
  </select>

  {errors.mailpieceShape && (
    <p className="field-error">{errors.mailpieceShape}</p>
  )}
</div>

              <div className="form-group">
              <label>
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={getTomorrow()}
                disabled={formData.status === 'ACTIVE'}
              />
              {errors.startDate && <p className="field-error">{errors.startDate}</p>}
            </div>

            <div className="form-group">
              <label>
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || getTomorrow()}
              />
              {errors.endDate && <p className="field-error">{errors.endDate}</p>}
            </div>
          </div>
        </section>

        {/* ── Campaign Images ──────────────────────────────── */}
      <section id="campaign-images" className="card">
  <div className="card-header">
    <h2>Campaign Images</h2>
  </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
  <div className="grid grid-cols-1 gap-4 content-start">
            {/* Representative */}
            <div >
              <label>Representative Image</label>
              <p className="help-text">Max 780×500 • JPEG • Under 200KB • Optional for letters/cards, required for flats</p>
 <div className="flex gap-3 items-start">
              <div style={{flex:'1'}}
                onClick={() => repInputRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, 'representative')}
                onDragLeave={(e) => handleDragLeave(e, 'representative')}
                onDrop={(e) => handleDrop(e, 'representative')}
                className={`dropzone ${dragOver.representative ? 'dropzone-active' : ''}`}
              >
                <input
                  ref={repInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, 'representative')}
                />
                <svg className="dropzone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="dropzone-text">
                  {dragOver.representative ? 'Drop image here' : 'Drag & drop or click'}
                </p>
              </div>

              {repPreview && (
                <div className="preview-row" style={{flex:'1'}}>
                  <div className="preview-image-wrap">
                    <img src={repPreview} alt="Representative preview" />
                    <button type="button" onClick={() => removeImage('representative')} className="remove-btn">×</button>
                  </div>
                  {repInfo && (
                    <div className="image-info">
                      <div className="image-info-title">Image Info</div>
                      <div>{repInfo.width} × {repInfo.height}px</div>
                      <div>
                        {repInfo.sizeKB < 1024
                          ? `${repInfo.sizeKB.toFixed(1)} KB`
                          : `${repInfo.sizeMB.toFixed(2)} MB`}
                      </div>
                      <div className="truncate">{repInfo.originalName}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
</div>


                       <div>
              <label>
                Ride-Along Image <span className="required">*</span>
              </label>
              <p className="help-text">Required • Max 300×200 • JPEG • Under 200KB.</p>
 <div className="flex gap-3 content-start items-start">
              <div style={{flex:'1'}}
                onClick={() => rideAlongInputRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, 'rideAlong')}
                onDragLeave={(e) => handleDragLeave(e, 'rideAlong')}
                onDrop={(e) => handleDrop(e, 'rideAlong')}
                className={`dropzone ${dragOver.rideAlong ? 'dropzone-active' : ''}`}
              >
                <input
                  ref={rideAlongInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, 'rideAlong')}
                />
                <svg className="dropzone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="dropzone-text">
                  {dragOver.rideAlong ? 'Drop image here' : 'Drag & drop or click'}
                </p>
              </div>

              {rideAlongPreview && (
                <div className="preview-row" style={{flex:'1'}}>
                  <div className="preview-image-wrap">
                    <img src={rideAlongPreview} alt="Ride-Along preview" />
                    <button type="button" onClick={() => removeImage('rideAlong')} className="remove-btn">×</button>
                  </div>
                  {rideAlongInfo && (
                    <div className="image-info">
                      <div className="image-info-title">Image Info</div>
                      <div>{rideAlongInfo.width} × {rideAlongInfo.height}px</div>
                      <div>
                        {rideAlongInfo.sizeKB < 1024
                          ? `${rideAlongInfo.sizeKB.toFixed(1)} KB`
                          : `${rideAlongInfo.sizeMB.toFixed(2)} MB`}
                      </div>
                      <div className="truncate">{rideAlongInfo.originalName}</div>
                    </div>
                  )}
                </div>
              )}
              </div>


              {errors.rideAlongImage && (
                <p className="field-error">{errors.rideAlongImage}</p>
              )}
              {errors.representativeImage && <p className="field-error">{errors.representativeImage}</p>}
            </div>

        <section className="card">
          <div className="form-group">
            <label>
              Target URL <span className="required">*</span>
            </label>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
  <span
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      background: '#f1f5f9',
      border: '1px solid #cbd5e1',
      borderRight: 'none',
      borderRadius: '6px 0 0 6px',
      color: '#64748b',
      fontSize: '.9rem',
      whiteSpace: 'nowrap',
    }}
  >
    https://
  </span>
  <input
    type="text"
    inputMode="url"
    name="targetUrl"
  value={(formData.targetUrl || '').replace(/^https:\/\//i, '')}
    onChange={handleChange}
    placeholder="www.example.com/landing-page"
    style={{ borderRadius: '0 6px 6px 0', flex: 1, minWidth: 0 }}
  />
</div>
            {errors.targetUrl && <p className="field-error">{errors.targetUrl}</p>}
            <p className="help-text mt-1" style={{ fontSize: '.9rem' }}>
  Must lead to a page related to the mailpiece. Test link{' '}
  <a
    style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#1a4f9c' }}
    href={formData?.targetUrl || 'about:blank'}
    target="_blank"
    rel="noopener noreferrer"
  >
    HERE
  </a>{' '}
  or click ridealong image in phone preview.
</p>
            
          </div>
        </section>
          </div>
  <div className="lg:sticky lg:top-4 self-start">
    <InformedDeliveryPhonePreview
      brandDisplayName={formData.brandDisplayName}
      rideAlongPreview={rideAlongPreview}
      repPreview={repPreview}
      mailpieceShape={formData.mailpieceShape}
      targetUrl={formData.targetUrl}
    />
  </div>
          </div>
        </section>

        {/* ── Mailer ID & Serial Range ─────────────────────── */}
    
<section className="card">
  <div className="card-header">
    <h2>Mailer ID & Serial Range</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* LEFT COLUMN: CSV Upload */}
    <div className="upload-card">
      <label>CSV File (MID / Serials)</label>
      <p className="help-text">
        Upload to auto-fill MID and serial information
      </p>

      <div
        onClick={() => csvInputRef.current?.click()}
        onDragOver={(e) => handleDragOver(e, 'csv')}
        onDragLeave={(e) => handleDragLeave(e, 'csv')}
        onDrop={(e) => handleDrop(e, 'csv')}
        className={`dropzone ${dragOver.csv ? 'dropzone-active' : ''}`}
      >
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleCsvChange}
        />

        <svg
          className="dropzone-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <p className="dropzone-text">
          {dragOver.csv ? 'Drop CSV here' : 'Drag & drop or click'}
        </p>
      </div>

     

      {/* Uploaded File Information */}
      {csvFileName && (
        <div className="csv-result mt-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 break-words">
                {csvFileName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formData?.csvFile?.size
                  ? `${(formData.csvFile.size / 1024).toFixed(1)} KB`
                  : csvFileName.includes('Manual')
                  ? 'Manual entry'
                  : 'Loaded barcode list'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeImage('csv')}
              className="flex-shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
              aria-label="Remove CSV list"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>

    {/* RIGHT COLUMN: Editable Campaign Information */}
    <div className="space-y-6">

      {/* ROW 1: Mailer ID and Campaign Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label>
            Mailer ID (MID) <span className="required">*</span>
          </label>
          <input
            type="number"
            name="mid"
            value={formData.mid || ''}
            onChange={handleChange}
            placeholder="6 or 9 digits"
          />
          {errors.mid && (
            <p className="field-error">{errors.mid}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="campaignType">
            Campaign Type <span className="required">*</span>
          </label>
         
<select
  name="campaignType"
  id="campaignType"
  value={formData.campaignType || ''}
  onChange={(e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      campaignType: value,
      ...(value !== 'A03'
        ? { serialStart: '', serialEnd: '' }
        : {}),
    }));

    setErrors((prev) => ({
      ...prev,
      campaignType: undefined,
      serialStart: undefined,
      serialEnd: undefined,
    }));

    if (formData.csvFile) {
      processCsv(formData.csvFile, value);
    }
  }}
>

            <option value="">Select Campaign Type</option>
            <option value="A02">
              MID Level Mail Campaigns – Mail Only
            </option>
            <option value="A03">
              Serial-Range Level – Mail Only
            </option>
            <option value="A01">
              Non-Sequential Barcodes – USPS Unavailable for 2026
            </option>
          </select>

          {errors.campaignType && (
            <p className="field-error">{errors.campaignType}</p>
          )}
        </div>
      </div>

      {/* ROW 2: Serial Start, Serial End, Piece Count */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="form-group">
          <label>Serial Start</label>
          <input
            type="number"
            name="serialStart"
            value={formData.serialStart || ''}
            onChange={handleChange}
            placeholder={
              formData.campaignType !== 'A03'
                ? 'N/A'
                : 'Start serial'
            }
            disabled={formData.campaignType !== 'A03'}
          />
          {errors.serialStart && (
            <p className="field-error">{errors.serialStart}</p>
          )}
        </div>

        <div className="form-group">
          <label>Serial End</label>
          <input
            type="number"
            name="serialEnd"
            value={formData.serialEnd || ''}
            onChange={handleChange}
            placeholder={
              formData.campaignType !== 'A03'
                ? 'N/A'
                : 'End serial'
            }
            disabled={formData.campaignType !== 'A03'}
          />
          {errors.serialEnd && (
            <p className="field-error">{errors.serialEnd}</p>
          )}
        </div>

        <div className="form-group">
           <span className="font-semibold text-slate-600">
              Valid IMb Records:
            </span>{' '}
      <span className="font-bold text-emerald-700">
  {csvResults
    ? (csvResults.validMailpieces ??
       csvResults.mailpieces?.length ??
       0)
    : savedRecordCount}
</span>

          <p className="help-text">
            Calculated from CSV or serial range.
          </p>
        </div>
      </div>

      {/* CSV validation summary */}
      {csvResults && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p>
           
             <span> {formData.campaignType === 'A01' && (
        <button
          type="button"
          onClick={openManualModal}
          className="manual-btn"
        >
          Enter IMBs Manually
        </button>
      )}</span>
          </p>
         
        </div>
      )}
    </div>
  </div>
</section>



        {/* ── Target URL ───────────────────────────────────── */}


        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCampaign}
           className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Update Campaign' : 'Submit Campaign'}
          </button>
        </div>
      </form>

      {/* ── Manual IMB Modal (unchanged logic) ─────────────── */}
      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Enter Intelligent Mail Barcodes</h3>
                <p>
                  {csvResults?.mailpieces?.length > 0
                    ? `Adding to existing list (${csvResults?.validMailpieces} barcodes)`
                    : 'Paste one 31-digit IMB per line (or separate with commas / spaces)'}
                </p>
              </div>
              <button type="button" onClick={closeManualModal} className="modal-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <textarea
                value={manualText}
                onChange={(e) => {
    setManualText(e.target.value);
    setManualValidated(false);
    setManualImbs([]);
    setManualError('');
  }}
                rows={6}
                placeholder={`00000123456789012345678901234\n00000123456789012345678901235\n...`}
                className="manual-textarea"
              />

              <div className="flex gap-3">
                <button type="button" onClick={processManualText} className="btn-primary">
                  Validate & Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualText('');
                    setManualImbs([]);
                    setManualError('');
                  }}
                  className="btn-ghost"
                >
                  Clear
                </button>
              </div>

              {manualError && (
                <div className="manual-error">{manualError}</div>
              )}

              {manualImbs.length > 0 && (
                <div>
                  <div className="manual-count">
                    {manualImbs.length} valid IMB{manualImbs.length !== 1 ? 's' : ''}
                    {manualImbs[0] && (
                      <span className="text-slate-500"> · MID {manualImbs[0].MID}</span>
                    )}
                  </div>
                  <div className="manual-list">
                    {manualImbs.map((m) => (
                      <div key={m.originalIMB} className="manual-list-item">
                        <span>{m.originalIMB}</span>
                        <button
                          type="button"
                          onClick={() => removeManualImb(m.originalIMB)}
                          className="remove-text-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={closeManualModal} className="btn-ghost">
                Cancel
              </button>
            <button
  type="button"
  onClick={applyManualImbs}
  disabled={!manualValidated || manualImbs.length === 0}
  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
    !manualValidated || manualImbs.length === 0
      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
      : 'bg-emerald-600 text-white hover:bg-emerald-700'
  }`}
>
  Add to List
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default InformedDeliveryCampaignForm;









// {showValidationSummary &&
//   (Object.keys(errors).length > 0 || uspsErrors.length > 0) && (
//     <div
//       id="validation-summary"
//       role="alert"
//       aria-live="assertive"
//       className="
//         relative overflow-hidden
//         rounded-xl border border-red-200
//         bg-gradient-to-br from-red-50 via-white to-rose-50
//         shadow-md
//       "
//     >
//       {/* Accent bar */}
//       <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-400" />

//       <div className="p-5 sm:p-6">

//         <div className="flex items-start gap-4">

//           {/* Alert icon */}
//           <div className="
//             flex h-12 w-12 shrink-0 items-center justify-center
//             rounded-xl bg-red-100 text-red-600
//             ring-1 ring-red-200
//           ">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               className="h-6 w-6"
//               aria-hidden="true"
//             >
//               <circle cx="12" cy="12" r="10" />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M12 8v4m0 4h.01"
//               />
//             </svg>
//           </div>

//           {/* Heading */}
//           <div className="min-w-0 flex-1">
//             <div className="flex flex-wrap items-center gap-2">
//               <h3 className="text-lg font-bold text-red-900">
//                 Please review your campaign
//               </h3>

//               <span className="
//                 inline-flex items-center rounded-full
//                 bg-red-100 px-2.5 py-1
//                 text-xs font-bold text-red-700
//               ">
//              {Object.keys(errors).length + uspsErrors.length}{' '}
// {Object.keys(errors).length + uspsErrors.length === 1
//   ? 'issue'
//   : 'issues'}
//               </span>
//             </div>

//             <p className="mt-1 text-sm text-red-800">
//               Your campaign hasn't been submitted yet.
//               Please correct the following items.
//             </p>
//           </div>

//           {/* Dismiss */}
//           <button
//             type="button"
//             onClick={() => setShowValidationSummary(false)}
//             className="
//               rounded-lg p-1.5 text-red-400
//               transition hover:bg-red-100 hover:text-red-700
//             "
//             aria-label="Dismiss validation summary"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               className="h-5 w-5"
//               aria-hidden="true"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M18 6 6 18M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* Error list */}
//         <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
//           {Object.entries(errors).map(([field, message]) => {
//             const labels = {
//               campaignTitle: 'Campaign Title',
//               campaignCode: 'Campaign Code',
//               mid: 'Mailer ID (MID)',
//               startDate: 'Start Date',
//               endDate: 'End Date',
//               targetUrl: 'Target URL',
//               mailOwnerCRID: 'Mail Owner',
//               representativeImage: 'Representative Image',
//               rideAlongImage: 'Ride-Along Image',
//               mailpieceShape: 'Mailpiece Shape',
// campaignType: 'Campaign Type',
// serialStart: 'Serial Start',
// serialEnd: 'Serial End',
//             };

//             const fieldIds = {
//               campaignTitle: 'campaignTitle',
//               campaignCode: 'campaignCode',
//               mid: 'mid',
//               startDate: 'startDate',
//               endDate: 'endDate',
//               targetUrl: 'targetUrl',
//               mailOwnerCRID: 'mailOwnerCRID',
//               mailpieceShape: 'mailpieceShape',
// campaignType: 'campaignType',
// serialStart: 'serialStart',
// serialEnd: 'serialEnd',
//             };

//             return (
//               <button
//                 key={field}
//                 type="button"
//                 onClick={() => {
//                   const targetId = fieldIds[field];

//                   if (targetId) {
//                     const target = document.querySelector(
//                       `[name="${targetId}"]`
//                     );

//                     target?.scrollIntoView({
//                       behavior: 'smooth',
//                       block: 'center',
//                     });

//                     target?.focus({ preventScroll: true });
//                   } else {
//                     document
//                       .getElementById('campaign-images')
//                       ?.scrollIntoView({
//                         behavior: 'smooth',
//                         block: 'center',
//                       });
//                   }
//                 }}
//                 className="
//                   group flex items-center gap-3 rounded-lg
//                   border border-red-100 bg-white/90
//                   px-3.5 py-3 text-left shadow-sm
//                   transition-all duration-200
//                   hover:border-red-300 hover:bg-red-50
//                   hover:shadow
//                 "
//               >
//                 <span className="
//                   flex h-8 w-8 shrink-0 items-center justify-center
//                   rounded-lg bg-red-50 text-red-600
//                   group-hover:bg-red-100
//                 ">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     className="h-4 w-4"
//                     aria-hidden="true"
//                   >
//                     <circle cx="12" cy="12" r="9" />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M12 8v4m0 4h.01"
//                     />
//                   </svg>
//                 </span>

//                 <span className="min-w-0 flex-1">
//                   <span className="block text-sm font-semibold text-slate-800">
//                     {labels[field] || field}
//                   </span>
//                   <span className="mt-0.5 block text-xs text-red-600">
//                     {message}
//                   </span>
//                 </span>

//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   className="
//                     h-4 w-4 shrink-0 text-slate-400
//                     transition group-hover:translate-x-0.5
//                     group-hover:text-red-600
//                   "
//                   aria-hidden="true"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M5 12h14m-7-7 7 7-7 7"
//                   />
//                 </svg>
//               </button>
//             );
//           })}
//         </div>
// {/* USPS API validation errors */}
// {uspsErrors.length > 0 && (
//   <div className="mt-5 border-t border-red-200 pt-5">
//     <div className="mb-3 flex items-center gap-2">
//       <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
//         <AlertCircle size={18} />
//       </span>

//       <div>
//         <h4 className="font-bold text-red-900">
//           USPS Validation Errors
//         </h4>
//         <p className="text-sm text-red-700">
//           USPS could not accept this campaign. Review the messages below.
//         </p>
//       </div>
//     </div>

//     <div className="space-y-3">
//       {uspsErrors.map((item, index) => (
//         <div
//           key={`${item.title}-${index}`}
//           className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-4 shadow-sm"
//         >
//           <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
//             !
//           </span>

//           <div className="min-w-0">
//             <p className="font-semibold text-slate-800">
//               {item.title}
//             </p>

//             <p className="mt-1 text-sm leading-5 text-slate-600">
//               {item.detail}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// )}
//         <div className="
//           mt-4 flex items-center gap-2 border-t
//           border-red-100 pt-4 text-xs text-slate-500
//         ">
//           <span className="h-2 w-2 rounded-full bg-red-500" />
//           Select any issue above to jump to the relevant field.
//         </div>

//       </div>
//     </div>
//   )}