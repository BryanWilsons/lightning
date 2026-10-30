import React from 'react';
import './Informeddeliveryphonepreview.css';
import eagle from '../../Assets/eagle.jpg'
// Approximate aspect ratios (width x height) for the mailpiece scan area
const SHAPES = {
  Letter: { w: 300, h: 190 },
  Card: { w: 300, h: 200 },
  Flat: { w: 300, h: 240 },
};

// Grayscale placeholder shown when no Representative Image is uploaded.
const DefaultScan = ({ shape }) => {
  const { w, h } = SHAPES[shape] || SHAPES.Letter;
  return (
    <svg
      className="idp-default-scan"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Default mailpiece image"
    >
      {/* gray backing, like the scan border */}
      <rect width={w} height={h} fill="#9a9a9a" />
      {/* paper */}
      <rect x="8" y="30" width={w - 16} height={h - 38} fill="#f4f4f4" />
      {/* return address */}
      <rect x="18" y="42" width="70" height="4" fill="#c4c4c4" />
      <rect x="18" y="50" width="52" height="4" fill="#d0d0d0" />
      {/* postage box */}
      <rect x={w - 70} y="40" width="52" height="34" fill="none" stroke="#bbb" />
      <text x={w - 44} y="60" textAnchor="middle" fontSize="6" fill="#aaa">U.S. POSTAGE</text>
      {/* body copy placeholder */}
      <rect x="18" y="70" width="120" height="8" fill="#cfcfcf" />
      <rect x="18" y="84" width="150" height="14" fill="#bdbdbd" />
      <rect x="18" y="104" width="100" height="4" fill="#d6d6d6" />
      <rect x="18" y="112" width="130" height="4" fill="#d6d6d6" />
      {/* recipient */}
      <text x={w * 0.55} y={h - 62} fontSize="8" fill="#777">Customer Name</text>
      <text x={w * 0.55} y={h - 51} fontSize="8" fill="#777">123 Street Name</text>
      <text x={w * 0.55} y={h - 40} fontSize="8" fill="#777">City, State, ZIP Code</text>
      {/* IMb-style bars */}
      {Array.from({ length: 46 }).map((_, i) => (
        <rect
          key={i}
          x={w * 0.5 + i * 3}
          y={h - 30}
          width="1.5"
          height={i % 3 === 0 ? 9 : i % 2 === 0 ? 6 : 4}
          fill="#888"
        />
      ))}
    </svg>
  );
};

/* ---------- "Share via" icons ---------- */
const ICON_SIZE = 26;

const ShareIcon = ({ bg, border, children }) => (
  <span
    aria-hidden="true"
    style={{
      width: ICON_SIZE,
      height: ICON_SIZE,
      borderRadius: '50%',
      background: bg,
      border: border || 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </span>
);

const EmailIcon = () => (
  <ShareIcon bg="#333366">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 6l8.5 7 8.5-7" />
    </svg>
  </ShareIcon>
);

const TextIcon = () => (
  <ShareIcon bg="#333366">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
      <circle cx="8.5" cy="11" r="0.6" fill="#fff" />
      <circle cx="12" cy="11" r="0.6" fill="#fff" />
      <circle cx="15.5" cy="11" r="0.6" fill="#fff" />
    </svg>
  </ShareIcon>
);

const FacebookIcon = () => (
  <ShareIcon bg="#2d4a9a">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.7V21h2.8z" />
    </svg>
  </ShareIcon>
);

const XIcon = () => (
  <ShareIcon bg="#111" border="1px solid #111">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
    </svg>
  </ShareIcon>
);

const SHARE_OPTIONS = [
  { label: 'Email', Icon: EmailIcon },
  { label: 'Text', Icon: TextIcon },
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'X', Icon: XIcon },
];

const InformedDeliveryPhonePreview = ({
  brandDisplayName,
  rideAlongPreview,
  repPreview,
  mailpieceShape = 'Letter',
  targetUrl, // kept so existing callers don't break; the banner is the click target in the real email
}) => {
  const shape = SHAPES[mailpieceShape] ? mailpieceShape : 'Letter';
  const { w, h } = SHAPES[shape];
  const sender = brandDisplayName || 'Your Brand';
  const name = sender.slice(0, 30);
  const shapeWord =
    shape === 'Letter' ? 'letter-sized' : shape === 'Card' ? 'postcard-sized' : 'large-envelope-sized';

  return (
    <div className="idp-wrap">
      <div className="idp-caption">Recipient email preview · approximate</div>

      <div className="idp-phone">
        <div className="idp-notch" />
        <div className="idp-screen">
          <div className="idp-status">
            <span>9:41</span>
            <span>●●● ▮</span>
          </div>

          <div className="idp-email">
            {/* Header */}
            <div className="idp-mhead">
              <span className="idp-mhead-logo">USPS.COM</span>
              <span className="idp-mhead-title">Informed Delivery<sup>®</sup></span>
            </div>
            <div className="idp-mhead-rule" />

            {/* Intro */}
            <div className="idp-intro">
              <div style={{display:'flex',justifyContent:'center'}}><img src={eagle} style={{height:'40px'}}/></div>
              <p style={{padding:'10px 0px',fontSize:'.6rem'}}>
                The information below contains images of the {shapeWord} mail that will be
                arriving soon.
              </p>
            </div>
            <div className='idp-link' style={{marginTop:'-8px',paddingLeft:'12px',fontSize:'.6rem'}}>Go to your Informed Delivery™ Mailbox</div>

            <div className="idp-divider" />

            {/* Mailpiece */}
            <div className="idp-piece">
              {/* From (always shown, with or without a Representative Image) */}
              <div style={{paddingLeft:'12px',marginBottom:'3px',fontSize:'.9rem'}}>
                From: {name}
              </div>

              <div className="idp-scan" style={{ aspectRatio: `${w} / ${h}` }}>
                {repPreview ? (
                  <img src={repPreview} alt="Mailpiece" className="idp-scan-img" />
                ) : (
                  <DefaultScan shape={shape} />
                )}
              </div>

              {/* Learn more link */}
              <div
                className="idp-link"
                style={{ padding: '12px 12px 8px', fontSize: '.8rem', fontWeight: 700 }}
              >
                Learn more about your mail ❯
              </div>

              {/* Ride-along banner */}
              <div style={{ padding: '0 12px' }}>
                <div style={{ width: '82%' }}>
                  {rideAlongPreview ? (
                    <>
                     <a
    style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#1a4f9c' }}
    href={targetUrl || 'about:blank'}
    target="_blank"
    rel="noopener noreferrer"
  ><img
                      src={rideAlongPreview}
                      alt="Ride-along"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    /></a></>
                  ) : (
                    <div
                      className="idp-ride-empty"
                      style={{
                        width: '100%',
                        aspectRatio: '3 / 2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#e6e6e6',
                        color: '#888',
                        fontSize: '.65rem',
                      }}
                    >
                      Ride-along image
                    </div>
                  )}
                </div>
              </div>

              {/* Share via */}
              <div style={{ padding: '8px 12px 4px', fontSize: '.7rem', fontWeight: 700 }}>
                Share via:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  rowGap: '10px',
                  columnGap: '8px',
                  padding: '6px 12px 10px',
                }}
              >
                {SHARE_OPTIONS.map(({ label, Icon }) => (
                  <div
                    key={label}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.65rem' }}
                  >
                    <Icon />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="idp-envicon" aria-hidden="true">✉</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformedDeliveryPhonePreview;




// import React from 'react';
// import './Informeddeliveryphonepreview.css';
// import eagle from '../../Assets/eagle.jpg'
// // Approximate aspect ratios (width x height) for the mailpiece scan area
// const SHAPES = {
//   Letter: { w: 300, h: 190 },
//   Card: { w: 300, h: 200 },
//   Flat: { w: 300, h: 240 },
// };

// // Grayscale placeholder shown when no Representative Image is uploaded.
// const DefaultScan = ({ shape }) => {
//   const { w, h } = SHAPES[shape] || SHAPES.Letter;
//   return (
//     <svg
//       className="idp-default-scan"
//       viewBox={`0 0 ${w} ${h}`}
//       preserveAspectRatio="xMidYMid meet"
//       role="img"
//       aria-label="Default mailpiece image"
//     >
//       {/* gray backing, like the scan border */}
//       <rect width={w} height={h} fill="#9a9a9a" />
//       {/* paper */}
//       <rect x="8" y="30" width={w - 16} height={h - 38} fill="#f4f4f4" />
//       {/* return address */}
//       <rect x="18" y="42" width="70" height="4" fill="#c4c4c4" />
//       <rect x="18" y="50" width="52" height="4" fill="#d0d0d0" />
//       {/* postage box */}
//       <rect x={w - 70} y="40" width="52" height="34" fill="none" stroke="#bbb" />
//       <text x={w - 44} y="60" textAnchor="middle" fontSize="6" fill="#aaa">U.S. POSTAGE</text>
//       {/* body copy placeholder */}
//       <rect x="18" y="70" width="120" height="8" fill="#cfcfcf" />
//       <rect x="18" y="84" width="150" height="14" fill="#bdbdbd" />
//       <rect x="18" y="104" width="100" height="4" fill="#d6d6d6" />
//       <rect x="18" y="112" width="130" height="4" fill="#d6d6d6" />
//       {/* recipient */}
//       <text x={w * 0.55} y={h - 62} fontSize="8" fill="#777">Customer Name</text>
//       <text x={w * 0.55} y={h - 51} fontSize="8" fill="#777">123 Street Name</text>
//       <text x={w * 0.55} y={h - 40} fontSize="8" fill="#777">City, State, ZIP Code</text>
//       {/* IMb-style bars */}
//       {Array.from({ length: 46 }).map((_, i) => (
//         <rect
//           key={i}
//           x={w * 0.5 + i * 3}
//           y={h - 30}
//           width="1.5"
//           height={i % 3 === 0 ? 9 : i % 2 === 0 ? 6 : 4}
//           fill="#888"
//         />
//       ))}
//     </svg>
//   );
// };

// const InformedDeliveryPhonePreview = ({
//   brandDisplayName,
//   rideAlongPreview,
//   repPreview,
//   mailpieceShape = 'Letter',
//   targetUrl,
// }) => {
//   const shape = SHAPES[mailpieceShape] ? mailpieceShape : 'Letter';
//   const { w, h } = SHAPES[shape];
//   const sender = brandDisplayName || 'Your Brand';
//   const name = sender.slice(0, 30);
//   const shapeWord =
//     shape === 'Letter' ? 'letter-sized' : shape === 'Card' ? 'postcard-sized' : 'large-envelope-sized';

//   return (
//     <div className="idp-wrap">
//       <div className="idp-caption">Recipient email preview · approximate</div>

//       <div className="idp-phone">
//         <div className="idp-notch" />
//         <div className="idp-screen">
//           <div className="idp-status">
//             <span>9:41</span>
//             <span>●●● ▮</span>
//           </div>

//           <div className="idp-email">
//             {/* Header */}
//             <div className="idp-mhead">
//               <span className="idp-mhead-logo">USPS.COM</span>
//               <span className="idp-mhead-title">Informed Delivery<sup>®</sup></span>
//             </div>
//             <div className="idp-mhead-rule" />

//             {/* Intro */}
//             <div className="idp-intro">
//               <div style={{display:'flex',justifyContent:'center'}}><img src={eagle} style={{height:'40px'}}/></div>
//               {/* <h4>Arriving Soon via USPS<sup>®</sup> Mail</h4> */}
//               <p style={{padding:'10px 0px',fontSize:'.6rem'}}>
//                 The information below contains images of the {shapeWord} mail that will be
//                 arriving soon.
//               </p>
//             </div>
//             <div className='idp-link' style={{marginTop:'-8px',paddingLeft:'12px',fontSize:'.6rem'}}>Go to your Informed Delivery™ Mailbox</div>


//             <div className="idp-divider" />

//             {/* Mailpiece */}
//             <div className="idp-piece">
              
//               {/* From (always shown, with or without a Representative Image) */}
//               <div style={{paddingLeft:'2px',marginBottom:'3px',fontSize:'.9rem'}}>
//                 From: {name}
//               </div>

//               <div className="idp-scan" style={{ aspectRatio: `${w} / ${h}` }}>
//                 {repPreview ? (
//                   <img src={repPreview} alt="Mailpiece" className="idp-scan-img" />
//                 ) : (
//                   <DefaultScan shape={shape} />
//                 )}
//               </div>

// <div style={{fontSize:'.9rem', paddingTop:'10px',paddingBotom:'10px'}}>Learn more about your mail ></div>
//               {/* Ride-along (left) + From / View Website (right) */}
//               <div className="idp-ride-row">
//                 <div className="idp-ride-img">
//                   {rideAlongPreview ? (
//                     <img src={rideAlongPreview} alt="Ride-along" />
//                   ) : (
//                     <div className="idp-ride-empty">Ride-along image</div>
//                   )}
//                 </div>

//                 <div className="idp-ride-meta">
//                   <div className="idp-from">
//                     <span className="idp-from-label">FROM</span>
//                     <span className="idp-from-name">{sender}</span>
//                   </div>
//                   <div className="idp-view">
//                     <span className={`idp-link ${targetUrl ? '' : 'idp-link--off'}`}>
//                       View Website
//                     </span>
//                     <span className="idp-info">i</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="idp-envicon" aria-hidden="true">✉</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InformedDeliveryPhonePreview;

// // import React from 'react';
// // import './Informeddeliveryphonepreview.css';
// // import eagle from '../../Assets/eagle.jpg'
// // // Approximate aspect ratios (width x height) for the mailpiece scan area
// // const SHAPES = {
// //   Letter: { w: 300, h: 190 },
// //   Card: { w: 300, h: 200 },
// //   Flat: { w: 300, h: 240 },
// // };

// // // Grayscale placeholder shown when no Representative Image is uploaded.
// // const DefaultScan = ({ shape, sender }) => {
// //   const { w, h } = SHAPES[shape] || SHAPES.Letter;
// //   const name = (sender || 'Sender').slice(0, 30);
// //   return (
// //     <>
// //         <div style={{position:'absolute',paddingLeft:'12px',marginTop:'3px',fontSize:'.9rem'}}>
// //        From:  {name}
// //       </div> 
// //     <svg
// //     // style={{marginTop:'-20px'}}
// //       className="idp-default-scan"
// //       viewBox={`0 0 ${w} ${h}`}
// //       preserveAspectRatio="xMidYMid meet"
// //       role="img"
// //       aria-label="Default mailpiece image"
// //     >
    
   
// //       {/* gray backing, like the scan border */}
// //       <rect width={w} height={h} fill="#9a9a9a" />
// //       {/* header band with brand name */}
    
// //       {/* paper */}
// //       <rect x="8" y="30" width={w - 16} height={h - 38} fill="#f4f4f4" />
// //       {/* return address */}
// //       <rect x="18" y="42" width="70" height="4" fill="#c4c4c4" />
// //       <rect x="18" y="50" width="52" height="4" fill="#d0d0d0" />
// //       {/* postage box */}
// //       <rect x={w - 70} y="40" width="52" height="34" fill="none" stroke="#bbb" />
// //       <text x={w - 44} y="60" textAnchor="middle" fontSize="6" fill="#aaa">U.S. POSTAGE</text>
// //       {/* body copy placeholder */}
// //       <rect x="18" y="70" width="120" height="8" fill="#cfcfcf" />
// //       <rect x="18" y="84" width="150" height="14" fill="#bdbdbd" />
// //       <rect x="18" y="104" width="100" height="4" fill="#d6d6d6" />
// //       <rect x="18" y="112" width="130" height="4" fill="#d6d6d6" />
// //       {/* recipient */}
// //       <text x={w * 0.55} y={h - 62} fontSize="8" fill="#777">Customer Name</text>
// //       <text x={w * 0.55} y={h - 51} fontSize="8" fill="#777">123 Street Name</text>
// //       <text x={w * 0.55} y={h - 40} fontSize="8" fill="#777">City, State, ZIP Code</text>
// //       {/* IMb-style bars */}
// //       {Array.from({ length: 46 }).map((_, i) => (
// //         <rect
// //           key={i}
// //           x={w * 0.5 + i * 3}
// //           y={h - 30}
// //           width="1.5"
// //           height={i % 3 === 0 ? 9 : i % 2 === 0 ? 6 : 4}
// //           fill="#888"
// //         />
// //       ))}
// //     </svg>
// //     </>
// //   );
// // };

// // const InformedDeliveryPhonePreview = ({
// //   brandDisplayName,
// //   rideAlongPreview,
// //   repPreview,
// //   mailpieceShape = 'Letter',
// //   targetUrl,
// // }) => {
// //   const shape = SHAPES[mailpieceShape] ? mailpieceShape : 'Letter';
// //   const { w, h } = SHAPES[shape];
// //   const sender = brandDisplayName || 'Your Brand';
// //   const shapeWord =
// //     shape === 'Letter' ? 'letter-sized' : shape === 'Card' ? 'postcard-sized' : 'large-envelope-sized';

// //   return (
// //     <div className="idp-wrap">
// //       <div className="idp-caption">Recipient email preview · approximate</div>

// //       <div className="idp-phone">
// //         <div className="idp-notch" />
// //         <div className="idp-screen">
// //           <div className="idp-status">
// //             <span>9:41</span>
// //             <span>●●● ▮</span>
// //           </div>

// //           <div className="idp-email">
// //             {/* Header */}
// //             <div className="idp-mhead">
// //               <span className="idp-mhead-logo">USPS.COM</span>
// //               <span className="idp-mhead-title">Informed Delivery<sup>®</sup></span>
// //             </div>
// //             <div className="idp-mhead-rule" />

// //             {/* Intro */}
// //             <div className="idp-intro">
// //               <div style={{display:'flex',justifyContent:'center'}}><img src={eagle} style={{height:'40px'}}/></div>
// //               {/* <h4>Arriving Soon via USPS<sup>®</sup> Mail</h4> */}
// //               <p style={{padding:'10px 0px',fontSize:'.6rem'}}>
// //                 The information below contains images of the {shapeWord} mail that will be
// //                 arriving soon.
// //               </p>
          
             
// //             </div>
// //   <div className='idp-link' style={{marginTop:'-8px',paddingLeft:'12px',fontSize:'.6rem'}}>Go to your Informed Delivery™ Mailbox</div>
           
// //             <div className="idp-divider" />

// //             {/* Mailpiece */}
// //             <div className="idp-piece">
// //               <div className="idp-scan" style={{ aspectRatio: `${w} / ${h}` }}>
// //                 {repPreview ? (
// //                   <img src={repPreview} alt="Mailpiece" className="idp-scan-img" />
// //                 ) : (
// //                   <DefaultScan shape={shape} sender={sender} />
// //                 )}
// //               </div>

// //               {/* Ride-along (left) + From / View Website (right) */}
// //               <div className="idp-ride-row">
// //                 <div className="idp-ride-img">
// //                   {rideAlongPreview ? (
// //                     <img src={rideAlongPreview} alt="Ride-along" />
// //                   ) : (
// //                     <div className="idp-ride-empty">Ride-along image</div>
// //                   )}
// //                 </div>

// //                 <div className="idp-ride-meta">
// //                   <div className="idp-from">
// //                     <span className="idp-from-label">FROM</span>
// //                     <span className="idp-from-name">{sender}</span>
// //                   </div>
// //                   <div className="idp-view">
// //                     <span className={`idp-link ${targetUrl ? '' : 'idp-link--off'}`}>
// //                       View Website
// //                     </span>
// //                     <span className="idp-info">i</span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="idp-envicon" aria-hidden="true">✉</div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InformedDeliveryPhonePreview;