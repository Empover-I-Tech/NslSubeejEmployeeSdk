// hooks/useOfflineSync.js
import NetInfo from "@react-native-community/netinfo";
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { GetApiHeaders } from "./helpers";
import usePostRequestWithJwt from "../api/usePostRequestWithJwt";
import { useOfflineCalculatorsCRUD } from "../screens/realmOffline/useOfflineCalculatorsCRUD";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setOfflineCount } from "../state/actions/offlineCountAction";
import { helpDeskRaiseCRUD } from "../screens/realmOffline/helpDeskRaiseCRUD";
import { createHelpDeskFormData, storeData } from "../assets/Utils/Utils";

export const useOfflineSync = () => {
    const offlineCount = useSelector((state) => state.offlineCountReducer.offlineCount);
    const dispatch = useDispatch();
    const {
        getSeedCalc,
        getYieldCalc,
        deleteSeedCalc,
        deleteYieldCalc,
        hasSeedCalc,
        hasYieldCalc,
    } = useOfflineCalculatorsCRUD();
    const { sendData } = usePostRequestWithJwt();

    const {
        getAllHelpDesk,
        updateIsSyncedByUniqueId,
        deleteHelpDeskByUniquId,
        getOfflineHelpDeskCount
    } = helpDeskRaiseCRUD();

    const updateOfflineCount = async () => {
        const OfflineHelpDeskCount = getOfflineHelpDeskCount();
        const seedCalCount = hasSeedCalc() ? 1 : 0
        const yieldCalCount = hasYieldCalc() ? 1 : 0
        const totalOfflineCount = seedCalCount + yieldCalCount + OfflineHelpDeskCount;
        dispatch(setOfflineCount(totalOfflineCount));
        // await storeData(OFFLINETOTALCOUNT, totalOfflineCount)
    }

    const incrementOfflineCount = async (count) => {
        const updatedCount = offlineCount + count;
        dispatch(setOfflineCount(updatedCount));
    }
    const decrementOfflineCount = async (count) => {
        if (offlineCount > 0) {
            const updatedCount = offlineCount - count;
            dispatch(setOfflineCount(updatedCount));
        } else {
            dispatch(setOfflineCount(0));
        }

    }
   
    const uploadOfflineSeedCalc = async () => {
        const { isConnected } = await NetInfo.fetch();
        if (!isConnected) {
            return false;
        }
        if (isConnected) {
            try {
                var getExpctYldURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.saveSeedAndPopulationCaculator;
                var headers = await GetApiHeaders();
                headers['Content-Type'] = 'multipart/form-data'
                delete headers.authType

                const data = getSeedCalc();
                const formData = new FormData();
                formData.append('jsonData', data);
                const APIResponse = await sendData(getExpctYldURL, formData, headers, false);
                if (APIResponse != undefined && APIResponse != null) {
                    if (APIResponse.statusCode == HTTP_OK) {
                        deleteSeedCalc();
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
            }
            catch (error) {
                return false;
            }
        } else {
            return false
        }
    }
    const uploadOfflineYieldCalc = async () => {
        const { isConnected } = await NetInfo.fetch();
        if (!isConnected) {
            return false;
        }
        if (isConnected) {
            try {
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.saveYieldCalculator;
                var headers = await GetApiHeaders();
                headers['Content-Type'] = 'multipart/form-data'
                delete headers.authType

                const data = getYieldCalc()
                const formData = new FormData();
                formData.append('jsonData', data);
                console.log("checked url", url);
                const APIResponse = await sendData(url, formData, headers, false);
                console.log("SAVERESPO-=-=-=>", APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    if (APIResponse.statusCode == HTTP_OK) {
                        deleteYieldCalc();
                        return true;
                    }
                    else {
                        return false;
                    }

                } else {
                    return false;
                }
            }
            catch (error) {
                return false;
            }
        } else {
            return false
        }
    }
    const uploadOfflineHelpDesk = async () => {
        const { isConnected } = await NetInfo.fetch();
        if (!isConnected) {
            return { success: false, message: "No internet connection" };
        }

        const payloadObj = getAllHelpDesk().filter(item => !item.isSynced);

        if (payloadObj.length === 0) {
            return { success: true, message: "No offline data to upload" };
        }

        const headers = await GetApiHeaders();
        headers['Content-Type'] = APIConfig.MULTIPARTFORMDATA

        const url = APIConfig.BASE_URL_NVM + APIConfig.RAISECOMPLAINTS;

        const failedRecords = [];

        for (let i = 0; i < payloadObj.length; i++) {
            const currentRecord = payloadObj[i];
            const formData = await createHelpDeskFormData(currentRecord);
            console.log(`FormData for record ${i + 1}:`, formData);

            try {
                const responseApi = await sendData(url, formData, headers, false);
                console.log(`Response for record ${i + 1}:`, JSON.stringify(responseApi));

                if (responseApi?.data?.statusCode === HTTP_OK) {
                    const mobileUniqueId = responseApi?.data?.response?.mobileUniqueId;
                    if (mobileUniqueId) {
                        deleteHelpDeskByUniquId(mobileUniqueId)
                        // updateIsSyncedByUniqueId(mobileUniqueId);
                    }
                } else {
                    failedRecords.push(currentRecord.uniquId || `Record ${i + 1}`);
                }
            } catch (error) {
                console.error(`Error for record ${i + 1}:`, error);
                failedRecords.push(currentRecord.uniquId || `Record ${i + 1}`);
            }
        }

        if (failedRecords.length === 0) {
            return {
                success: true,
                message: "All help desk records uploaded successfully"
            };
        } else {
            return {
                success: false,
                message: `Some records failed: ${failedRecords.join(', ')}`
            };
        }
    };

    return { uploadOfflineSeedCalc, uploadOfflineYieldCalc, incrementOfflineCount, decrementOfflineCount, uploadOfflineHelpDesk, updateOfflineCount };
};
