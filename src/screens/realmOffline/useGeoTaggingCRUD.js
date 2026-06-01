import Realm from 'realm';
import realm from './realmConfig';


export const useGeoTaggingCRUD = () => {

    // 🟢 Save New
    const saveGeoTag = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create('GeoTaggingView', {
                    uniquId: payloadObj.uniquId.toString(),
                    data: JSON.stringify(payloadObj),
                    isSynced: false,
                });
            });

            console.log('Saved to Realm:', payloadObj);
            return true;
        } catch (error) {
            console.error('Failed to save to Realm:', error);
            return false;
        }
    };

    // 🟢 Get All
    const getAllGeoTags = async () => {
        try {
            const geoTags = realm.objects('GeoTaggingView');

            return Array.from(geoTags).map(item => ({
                ...JSON.parse(item.data),
                uniquId: item.uniquId,
                isSynced: item.isSynced,
            }));
        } catch (error) {
            console.error('Failed to fetch records:', error);
            return [];
        }
    };

    // 🔍 Get By Id
    const getGeoTagById = (uniquId) => {
        try {
            const record = realm.objectForPrimaryKey(
                'GeoTaggingView',
                uniquId
            );

            return record
                ? {
                    ...JSON.parse(record.data),
                    isSynced: record.isSynced,
                }
                : null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    // 🟠 Update
    const updateGeoTag = (uniquId, newPayload) => {
        try {
            const existing = realm.objectForPrimaryKey(
                'GeoTaggingView',
                uniquId
            );

            const existingIsSynced =
                existing?.isSynced || false;

            realm.write(() => {
                realm.create(
                    'GeoTaggingView',
                    {
                        uniquId,
                        data: JSON.stringify({
                            ...newPayload,
                            uniquId,
                        }),
                        isSynced: existingIsSynced,
                    },
                    Realm.UpdateMode.Modified
                );
            });

            console.log(
                `Updated record with uniquId: ${uniquId}`
            );

            return true;
        } catch (error) {
            console.error(
                'Failed to update geo tag:',
                error
            );

            return false;
        }
    };

    // 🔴 Delete By Unique Id
    const deleteGeoTagByUniquId = (uniquId) => {
        try {
            const record = realm.objectForPrimaryKey(
                'GeoTaggingView',
                uniquId
            );

            if (record) {
                realm.write(() => {
                    realm.delete(record);
                });

                console.log(
                    `Deleted record with uniquId: ${uniquId}`
                );

                return true;
            }

            console.warn(
                `Record not found for uniquId: ${uniquId}`
            );

            return false;
        } catch (error) {
            console.error(
                'Error deleting record:',
                error
            );

            return false;
        }
    };

    // 🔴 Delete All
    const deleteAllGeoTags = () => {
        try {
            const allRecords =
                realm.objects('GeoTaggingView');

            realm.write(() => {
                realm.delete(allRecords);
            });

            console.log(
                `Deleted ${allRecords.length} GeoTaggingView records`
            );

            return true;
        } catch (error) {
            console.error(
                'Error deleting records:',
                error
            );

            return false;
        }
    };

    // 🟡 Save Or Update
    const saveOrUpdateGeoTagById = (payloadObj) => {
        try {
            const allTags =
                realm.objects('GeoTaggingView');

            let existingTag = null;

            for (let tag of allTags) {
                const parsed = JSON.parse(tag.data);

                if (parsed.id === payloadObj.id) {
                    existingTag = tag;
                    break;
                }
            }

            const mobileUniqueId =
                existingTag?.uniquId ||
                payloadObj.mobileUniqueId;

            const isSynced =
                existingTag?.isSynced || false;

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

            console.log(
                existingTag
                    ? 'Updated existing record'
                    : 'Inserted new record'
            );

            return true;
        } catch (error) {
            console.error(
                'Failed to save/update geo tag:',
                error
            );

            return false;
        }
    };

    // 🆕 Offline Count
    const getOfflineGeoTagCount = () => {
        try {
            const geoTags =
                realm.objects('GeoTaggingView');

            return geoTags.filtered(
                'isSynced == false'
            ).length;
        } catch (error) {
            console.error(
                'Failed to get offline count:',
                error
            );

            return 0;
        }
    };

    return {
        saveGeoTag,
        getAllGeoTags,
        getGeoTagById,
        updateGeoTag,
        deleteGeoTagByUniquId,
        deleteAllGeoTags,
        saveOrUpdateGeoTagById,
        getOfflineGeoTagCount,
    };
};