import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate,Outlet, useLocation } from 'react-router-dom';
import {useCampaigns} from '../../context/CampaignContext'
import {statusColors} from '../../Helpers/Colors'
import axios from 'axios';
import {toast} from 'react-toastify';
import {formatDate} from '../../Helpers/FormatDate'
import { useAuth } from '../../context/AuthContext';
// Sample data – replace with real data from your API




const CampaignDashboard = () => {
  const [campaigns,setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
const navigate = useNavigate();
const location = useLocation();
const isFormPage =
    location.pathname.endsWith('/new') ||
    location.pathname.includes('/edit');

const {campaignsList,isLoading,refetchCampaigns } = useCampaigns()

const [confirmCampaign, setConfirmCampaign] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);

  const { user,heroku } = useAuth();


const [actionLoadingId, setActionLoadingId] = useState(null);


const handleCampaignAction = async (campaign) => {
  const isActive = campaign.status === 'ACTIVE';
  const action = isActive ? 'cancel' : 'delete';

  try {
    setIsProcessing(true);
    setActionLoadingId(campaign.id);

   const isActive = campaign.status?.toUpperCase() === "ACTIVE";

await axios.delete(`${heroku}/usps/delete-campaign`, {
  data: {
    campaignID: campaign.campaignID || campaign.id,
    status: isActive ? "CANCELLED" : "DELETED",
  },
});

    await refetchCampaigns({ silent: true });

    toast.success(
      isActive
        ? 'Campaign cancelled successfully'
        : 'Campaign deleted successfully'
    );

    setConfirmCampaign(null);
    navigate('/informed');
  } catch (error) {
    console.error(
      `USPS ${action} failed:`,
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.details?.error?.errors?.[0]?.message ||
      `Failed to ${action} campaign`
    );
  } finally {
    setIsProcessing(false);
    setActionLoadingId(null);
  }
};

// const handleCampaignAction = async (campaign) => {
//   const isActive = campaign.status === 'Active';
//   const action = isActive ? 'cancel' : 'delete';

//   if (!window.confirm(`Are you sure you want to ${action} "${campaign.campaignTitle}"?`)) {
//     return;
//   }

//   try {
//     console.log( campaign.campaignID)
//     setActionLoadingId(campaign.campaignID);
//   let r = {campaignID: campaign.campaignID}
//   console.log(r)
//    await axios.delete(`${heroku}/usps/delete-campaign`, {
//   data: { campaignID: campaign.campaignID },
// });
// await refetchCampaigns({ silent: true });
//     toast.success(
//       isActive ? 'Campaign cancelled successfully' : 'Campaign deleted successfully'
//     );

//     // Refresh the list, then go back to the dashboard
//     // refetchCampaigns?.();   // if your CampaignContext exposes one
//     navigate('/informed');
//   } catch (error) {
//     console.error(
//       `USPS ${action} failed:`,
//       JSON.stringify(error.response?.data || error.message, null, 2)
//     );
//     toast.error(
//       error.response?.data?.details?.error?.errors?.[0]?.message ||
//         `Failed to ${action} campaign`
//     );
//   } finally {
//     setActionLoadingId(null);
//   }
// };

useEffect(() => {
  const rawList =
    campaignsList?.usps?.campaigns ||
    campaignsList?.campaigns ||
    (Array.isArray(campaignsList) ? campaignsList : null);

  if (!Array.isArray(rawList)) {
    setCampaigns([]);
    return;
  }

  const mapped = rawList
    .filter(
      (c) => c.status?.toUpperCase() !== 'DELETED'
    )
    .map((c) => ({
      id: c.campaignID || c.id,
      campaignTitle: c.campaignTitle || c.title || c.name || 'Untitled',
      campaignCode: c.campaignCode || c.code || c.campaignID,
      brandDisplayName:
        c.brandDisplayName || c.brand || c.submitterName || '—',
      startDate: c.startDate || c.start || null,
      endDate: c.endDate || c.end || null,
      mailpieceShape: c.mailpieceShape,
      status: c.status || c.campaignStatus || 'Draft',
      ...c,
    }));

  setCampaigns(mapped);
}, [campaignsList]);


const statusCounts = useMemo(() => {
  const counts = {
    total: campaigns.length,
  };

  campaigns.forEach((campaign) => {
    const status = (campaign.status || 'UNKNOWN').toUpperCase();

    counts[status] = (counts[status] || 0) + 1;
  });

  return counts;
}, [campaigns]);

console.log(campaigns)
// Unique statuses that actually exist in the data
const availableStatuses = [...new Set(campaigns.map((c) => c.status).filter(Boolean))];


const filteredCampaigns = (campaigns || []).filter((c) => {
  // Hide deleted campaigns
  if (c.status?.toUpperCase() === 'DELETED') {
    return false;
  }

  const title = (c.campaignTitle || '').toLowerCase();
  const code = (c.campaignCode || '').toLowerCase();
  const brand = (c.brandDisplayName || '').toLowerCase();
  const searchLower = search.toLowerCase();

  const matchesSearch =
    !search ||
    title.includes(searchLower) ||
    code.includes(searchLower) ||
    brand.includes(searchLower);

  const matchesStatus =
    statusFilter === 'All' || c.status === statusFilter;

  return matchesSearch && matchesStatus;
});
// const filteredCampaigns = (campaigns || []).filter((c) => {
//   const title = (c.campaignTitle || '').toLowerCase();
//   const code  = (c.campaignCode  || '').toLowerCase();
//   const brand = (c.brandDisplayName || '').toLowerCase();
//   const searchLower = search.toLowerCase();

//   const matchesSearch =
//     !search ||
//     title.includes(searchLower) ||
//     code.includes(searchLower) ||
//     brand.includes(searchLower);

//   const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

//   return matchesSearch && matchesStatus;
// });


  console.log(campaignsList)
  if (isFormPage) {
    return <Outlet />;
  }


  
const ActionButton = ({ campaign, className = '' }) => {
  const isActive = campaign.status === 'ACTIVE';

  return (
    <button
      disabled={isProcessing}
      onClick={() => setConfirmCampaign(campaign)}
      className={`font-medium disabled:opacity-50 ${
        isActive
          ? 'text-orange-600 hover:text-orange-800'
          : 'text-red-600 hover:text-red-800'
      } ${className}`}
    >
      {isActive ? 'Cancel' : 'Delete'}
    </button>
  );
};


//   const ActionButton = ({ campaign, className = '' }) => {

//     console.log(campaign)
//   const isActive = campaign.status === 'ACTIVE';
//   return (
//     <button
//       disabled={actionLoadingId === campaign.id}
//       onClick={() => handleCampaignAction(campaign)}
//       className={`font-medium disabled:opacity-50 ${
//         isActive ? 'text-orange-600 hover:text-orange-800' : 'text-red-600 hover:text-red-800'
//       } ${className}`}
//     >
//       {actionLoadingId === campaign.id ? '...' : isActive ? 'Cancel' : 'Delete'}
//     </button>
//   );
// };


if(isLoading) return "Connecting to USPS..."

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campaign Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your USPS Informed Delivery campaigns
          </p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        onClick={() => navigate('/informed/new')}
        >
          + New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title, code, or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

      <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="All">All Statuses</option>
  {availableStatuses.map((status) => (
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</select>
      </div>

      {/* Stats summary */}
      {/* Stats summary */}
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

 

  {/* Active */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Active</p>
    <p className="text-2xl font-bold text-green-600">
      {statusCounts.ACTIVE || 0}
    </p>
  </div>

  {/* Submitted */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Submitted</p>
    <p className="text-2xl font-bold text-blue-600">
      {statusCounts.SUBMITTED || 0}
    </p>
  </div>

  {/* Completed */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Complete</p>
    <p className="text-2xl font-bold text-gray-600">
      {statusCounts.COMPLETE || 0}
    </p>
  </div>
 {/* Total */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">Total Campaigns</p>
    <p className="text-2xl font-bold text-gray-800">
      {statusCounts.total}
    </p>
  </div>
  
<div className="bg-white border rounded-xl p-4 shadow-sm">
  <p className="text-sm text-gray-500">Cancelled</p>
  <p className="text-2xl font-bold text-gray-600">
    {statusCounts.CANCELLED || 0}
  </p>
</div>

</div>
    
      {filteredCampaigns?.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl">
          <p className="text-gray-500">No campaigns found.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                   <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Shape
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns?.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {campaign.campaignTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {campaign.brandDisplayName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.campaignCode}
                    </td>
                       <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.campaignType}
                    </td>
          <td className="px-6 py-4 text-sm text-gray-600">
 {campaign.status?.toUpperCase() === 'DELETED' ? (
    <><span className="!text-red-600 font-semibold">Deleted: {campaign.deletedAt ? formatDate(campaign.deletedAt) : '—'}</span></>
  ) : campaign.status?.toUpperCase() === 'CANCELLED' ? (
    <>Cancelled: {campaign.cancelledAt ? formatDate(campaign.cancelledAt) : '—'}</>
  ) : (
    <>{formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}</>
  )}
</td>         <td className="px-6 py-4 text-sm text-gray-600">
                      {campaign.mailpieceShape}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-4 py-2 rounded-full text-xs font-medium ${
                          statusColors[campaign.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                     {
                      (campaign.status === "ACTIVE"  || campaign.status === "SUBMITTED") &&<><button className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate(`/informed/${campaign.id}/edit`)}>
                        Edit
                      </button>< br />
                        <ActionButton campaign={campaign} /></>
                     } 
                    </td>
                  </tr>
                )).reverse()}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredCampaigns?.map((campaign) => (

              <div key={campaign.id} className="p-4">
                {console.log('Campaign status:', campaign)}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {campaign.campaignTitle}
                    </h3>
                    <p className="text-sm text-gray-500">{campaign.brandDisplayName}</p>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[campaign.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Code: {campaign.campaignCode}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {campaign.campaignType} 
                </p>
            <p className="text-sm text-gray-600 mb-1">
  {campaign.status?.toUpperCase() === 'DELETED' ? (
    <><span className="!text-red-600 font-semibold">vvvvDeleted: {campaign.deletedAt ? formatDate(campaign.deletedAt) : '—'}</span></>
  ) : campaign.status?.toUpperCase() === 'CANCELLED' ? (
    <>Cancelled: {campaign.cancelledAt ? formatDate(campaign.cancelledAt) : '—'}</>
  ) : (
    <>{formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}</>
  )}
</p>
                <div className="flex gap-3">
                   <button className="text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate(`/informed/${campaign.id}/edit`)}>
                        Edit
                      </button>
                        <ActionButton campaign={campaign} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Outlet />
      
{confirmCampaign && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center
               bg-slate-950/50 backdrop-blur-sm p-4"
    onClick={() => {
      if (!isProcessing) setConfirmCampaign(null);
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="w-full max-w-md overflow-hidden rounded-2xl
                 bg-white shadow-2xl ring-1 ring-black/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/*
        ACTIVE campaigns are cancelled.
        Other statuses follow your existing delete behavior.
      */}
      {(() => {
        const isActive = confirmCampaign.status === 'ACTIVE';
        const isCancel = isActive;

        return (
          <>
            {/* Header */}
            <div className="flex items-start gap-4 px-6 pt-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center
                            justify-center rounded-full ${
                  isCancel
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {isCancel ? (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M3 6h18M9 6V4h6v2m-9 0 1 14h10l1-14M10 10v6m4-6v6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="confirm-title"
                  className="text-xl font-semibold tracking-tight
                             text-slate-900"
                >
                  {isCancel
                    ? 'Cancel this campaign?'
                    : 'Delete this campaign?'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isCancel
                    ? 'You are about to cancel this campaign. Please confirm that you want to continue.'
                    : 'You are about to delete this campaign. This action may not be reversible.'}
                </p>
              </div>
            </div>

            {/* Campaign details */}
            <div className="mx-6 mt-5 rounded-xl border border-slate-200
                            bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider
                            text-slate-400">
                Campaign details
              </p>

              <p className="mt-2 break-words font-semibold text-slate-800">
                {confirmCampaign.campaignTitle || 'Untitled campaign'}
              </p>

              <p className="mt-1 break-words text-sm text-slate-500">
                {confirmCampaign.brandDisplayName || 'No brand specified'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-slate-200
                                 bg-white px-2 py-1 text-xs text-slate-600">
                  ID: {confirmCampaign.campaignID || confirmCampaign.id}
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    isCancel
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {confirmCampaign.status}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="mx-6 mt-4 flex gap-2 text-sm leading-5">
              <span className="font-semibold text-slate-500">
                Note:
              </span>
              <p className="text-slate-500">
                {isCancel
                  ? 'Make sure you have reviewed the campaign before cancelling it.'
                  : 'Please verify this is the correct campaign before proceeding.'}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t
                            border-slate-100 bg-white px-6 py-5 sm:flex-row
                            sm:justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmCampaign(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5
                           text-sm font-semibold text-slate-700
                           transition hover:bg-slate-50
                           disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Campaign
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleCampaignAction(confirmCampaign)}
                className={`inline-flex items-center justify-center gap-2
                            rounded-xl px-5 py-2.5 text-sm font-semibold
                            text-white shadow-sm transition
                            disabled:cursor-not-allowed disabled:opacity-70 ${
                  isCancel
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}

                {isProcessing
                  ? 'Processing...'
                  : isCancel
                    ? 'Yes, Cancel Campaign'
                    : 'Yes, Delete Campaign'}
              </button>
            </div>
          </>
        );
      })()}
    </div>
  </div>
)}

    </div>
  );
};

export default CampaignDashboard;