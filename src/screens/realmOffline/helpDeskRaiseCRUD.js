import { useRealm, useQuery } from '@realm/react';

export const helpDeskRaiseCRUD = () => {
    const realm = useRealm();
    const helpDeskTags = useQuery('helpDeskRaise');

    // 🟢 Save new
    const saveHelpDesk = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create('helpDeskRaise', {
                    uniquId: payloadObj.mobileUniqueId,
                    data: JSON.stringify(payloadObj),
                    isSynced: false, // Default as unsynced
                });
            });
            console.log('Saved to Realm:', payloadObj);
            return true;
        } catch (error) {
            console.error('Failed to save to Realm:', error);
            return false;
        }
    };

    // 🟢 Get all
    // const getAllHelpDesk = () => {
    //     return helpDeskTags.map(item => ({
    //         ...JSON.parse(item.data),
    //         // uniquId: item.uniquId,
    //         // isSynced: item.isSynced,
    //     }));
    // };

    // const getAllHelpDesk = () => {
    //     return helpDeskTags
    //         .filter(item => item.isSynced === false)
    //         .map(item => ({
    //             ...JSON.parse(item.data),
    //         }));
    // };

    const getAllHelpDesk = () => {
        // Make a safe snapshot of Realm results
        const safeCopy = Array.from(helpDeskTags); // convert Realm Results to plain array

        return safeCopy
            .filter(item => item.isSynced === false)
            .map(item => ({
                ...JSON.parse(item.data),
            }));
    };




    // 🔍 Get by ID
    const getHelpDeskById = (uniquId) => {
        const record = realm.objectForPrimaryKey('helpDeskRaise', uniquId);
        return record ? { ...JSON.parse(record.data), isSynced: record.isSynced } : null;
    };

    const updateIsSyncedByUniqueId = async (uniqueId) => {
        try {
            realm.write(() => {
                const record = realm.objectForPrimaryKey('helpDeskRaise', uniqueId);
                if (record) {
                    record.isSynced = true;
                    console.log(`isSynced updated to true for uniquId: ${uniqueId}`);
                } else {
                    console.warn(`No record found with uniquId: ${uniqueId}`);
                }
            });
        } catch (error) {
            console.error('Realm update failed:', error);
        }
    };



    // 🟠 Update
    const updateHelpDesk = (uniquId, newPayload) => {
        try {
            const existing = realm.objectForPrimaryKey('helpDeskRaise', uniquId);
            const existingIsSynced = existing ? existing.isSynced : false;

            realm.write(() => {
                realm.create(
                    'helpDeskRaise',
                    {
                        uniquId,
                        data: JSON.stringify({ ...newPayload, uniquId }),
                        isSynced: existingIsSynced,
                    },
                    Realm.UpdateMode.Modified
                );
            });

            console.log(`Updated record with uniquId: ${uniquId}`);
            return true;
        } catch (error) {
            console.error('Failed to update geo tag:', error);
            return false;
        }
    };

    // 🔴 Delete
    const deleteHelpDeskByUniquId = (uniquId) => {
        try {
            const record = realm.objectForPrimaryKey('helpDeskRaise', uniquId);
            if (record) {
                realm.write(() => {
                    realm.delete(record);
                });
                console.log(`Deleted record with uniquId: ${uniquId}`);
                return true;
            } else {
                console.warn(`Record not found for uniquId: ${uniquId}`);
                return false;
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            return false;
        }
    };

    const deleteAllHelpDesk = () => {
        try {
            const allRecords = realm.objects('helpDeskRaise');
            if (allRecords.length > 0) {
                realm.write(() => {
                    realm.delete(allRecords);
                });
                console.log(`Deleted all ${allRecords.length} helpDeskRaise records.`);
                return true;
            } else {
                console.log("No records found to delete.");
                return false;
            }
        } catch (error) {
            console.error("Error deleting records:", error);
            return false;
        }
    };


    // 🟡 Save or Update by payload.id
    const saveOrUpdateHelpDeskById = (payloadObj) => {
        try {
            const allTags = realm.objects('helpDeskRaise');
            let existingTag = null;

            for (let tag of allTags) {
                const parsed = JSON.parse(tag.data);
                if (parsed.id === payloadObj.id) {
                    existingTag = tag;
                    break;
                }
            }

            const mobileUniqueId = existingTag ? existingTag.uniquId : payloadObj.mobileUniqueId;
            const isSynced = existingTag ? existingTag.isSynced : false;

            realm.write(() => {
                realm.create(
                    'helpDeskRaise',
                    {
                        uniquId: mobileUniqueId,
                        data: JSON.stringify({
                            ...payloadObj,
                            mobileUniqueId,
                        }),
                        isSynced,
                    },
                    Realm.UpdateMode.Modified
                );
            });

            console.log(existingTag ? 'Updated existing record' : 'Inserted new record');
            return true;
        } catch (error) {
            console.error('Failed to save/update geo tag:', error);
            return false;
        }
    };

    // 🆕 Count unsynced records
    const getOfflineHelpDeskCount = () => {
        try {
            return helpDeskTags.filtered('isSynced == false').length;
        } catch (error) {
            console.error('Failed to get offline count:', error);
            return 0;
        }
    };

    return {
        saveHelpDesk,
        getAllHelpDesk,
        getHelpDeskById,
        updateHelpDesk,
        deleteHelpDeskByUniquId,
        saveOrUpdateHelpDeskById,
        getOfflineHelpDeskCount, // Expose this for badge count etc.
        updateIsSyncedByUniqueId
    };
};
