// contexts/CampaignsContext.js
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import api from "../Helpers/Api";
 
const CampaignsContext = createContext(null);

export function CampaignsProvider({ children }) {
  const [campaignsList, setCampaignsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 const { user,heroku } = useAuth();
  // silent = true skips the loading flag so the dashboard doesn't flash "Loading..."
  const refetchCampaigns = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      const id = {id:user.company?._id}
      console.log(user.company?._id)
      // let ccrid = {ccrid:'51925553'}
      // const res = await axios.post(`${heroku}/usps/query-campaigns`,ccrid);
      const res = await api.post(`campaigns/getcampaignsforcompany`,id);

      console.log(res.data)
      setCampaignsList(res.data.campaigns);
      //setCampaignsList(res.data.usps);
    } catch (err) {
      console.error(
        "Fetch campaigns failed:",
        JSON.stringify(err.response?.data || err.message, null, 2)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refetchCampaigns();
  }, [refetchCampaigns]);

  return (
    <CampaignsContext.Provider
      value={{ campaignsList, isLoading, refetchCampaigns }}
    >
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) {
    throw new Error("useCampaigns must be used inside CampaignsProvider");
  }
  return ctx;
}

