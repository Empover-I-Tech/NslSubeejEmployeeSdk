import { useRealm, useQuery } from '@realm/react';

export const useGeoTaggingCRUD = () => {
    const realm = useRealm();
    const geoTags = useQuery('GeoTaggingView');

    // 🟢 Save new
    const saveGeoTag = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create('GeoTaggingView', {
                    uniquId: payloadObj.uniquId.toString(),
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
    const getAllGeoTags = async () => {
        const safeCopy = Array.from(geoTags); // convert Realm Results to plain array
        return safeCopy.map(item => ({
            ...JSON.parse(item.data),
            uniquId: item.uniquId,
            isSynced: item.isSynced,
        }));
    };

    // 🔍 Get by ID
    const getGeoTagById = (uniquId) => {
        const record = realm.objectForPrimaryKey('GeoTaggingView', uniquId);
        return record ? { ...JSON.parse(record.data), isSynced: record.isSynced } : null;
    };

    // 🟠 Update
    const updateGeoTag = (uniquId, newPayload) => {
        try {
            const existing = realm.objectForPrimaryKey('GeoTaggingView', uniquId);
            const existingIsSynced = existing ? existing.isSynced : false;

            realm.write(() => {
                realm.create(
                    'GeoTaggingView',
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
    const deleteGeoTagByUniquId = (uniquId) => {
        try {
            const record = realm.objectForPrimaryKey('GeoTaggingView', uniquId);
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

    const deleteAllGeoTags = () => {
        try {
            const allRecords = realm.objects('GeoTaggingView');
            if (allRecords.length > 0) {
                realm.write(() => {
                    realm.delete(allRecords);
                });
                console.log(`Deleted all ${allRecords.length} GeoTaggingView records.`);
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
    const saveOrUpdateGeoTagById = (payloadObj) => {
        try {
            const allTags = realm.objects('GeoTaggingView');
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
                    'GeoTaggingView',
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
    const getOfflineGeoTagCount = () => {
        try {
            return geoTags.filtered('isSynced == false').length;
        } catch (error) {
            console.error('Failed to get offline count:', error);
            return 0;
        }
    };

    return {
        saveGeoTag,
        getAllGeoTags,
        getGeoTagById,
        updateGeoTag,
        deleteGeoTagByUniquId,
        saveOrUpdateGeoTagById,
        getOfflineGeoTagCount, // Expose this for badge count etc.
    };
};
