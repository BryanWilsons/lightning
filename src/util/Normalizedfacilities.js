  
    import {Facilities} from './Facilities'
  
  export const normalizedFacilities = (Facilities || []).map(f => ({
  dropkey: f.dropkey || f['FDB ID'] || '',
  dropname: f.dropname || f['DROP NAME'] || '',
  dropdelcty: f.dropdelcty || f['FACILITY CITY'] || '',
  dropdelst: f.dropdelst || f['FACILITY STATE'] || '',
  dropdelzpp: String(f.dropdelzpp || f['ZIP'] || ''),
   dropphyadd: String(f.dropphyadd || f['Address'] || ''),

  facilitySubtype: f.facilitySubtype || f['FACILITY SUBTYPE'] || ''
}))