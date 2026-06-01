// import Realm from 'realm';
// import realm from './realmConfig';

// export const helpDeskRaiseCRUD = () => {

//     // 🟢 Save New
//     const saveHelpDesk = (payloadObj) => {
//         try {
//             realm.write(() => {
//                 realm.create('helpDeskRaise', {
//                     uniquId: payloadObj.mobileUniqueId,
//                     data: JSON.stringify(payloadObj),
//                     isSynced: false,
//                 });
//             });

//             console.log('Saved to Realm:', payloadObj);
//             return true;
//         } catch (error) {
//             console.error('Failed to save to Realm:', error);
//             return false;
//         }
//     };

//     // 🟢 Get All Unsynced Records
//     const getAllHelpDesk = () => {
//         try {
//             const helpDeskTags = realm.objects('helpDeskRaise');

//             return Array.from(helpDeskTags)
//                 .filter(item => item.isSynced === false)
//                 .map(item => ({
//                     ...JSON.parse(item.data),
//                 }));
//         } catch (error) {
//             console.error('Failed to fetch records:', error);
//             return [];
//         }
//     };

//     // 🔍 Get By ID
//     const getHelpDeskById = (uniquId) => {
//         try {
//             const record = realm.objectForPrimaryKey(
//                 'helpDeskRaise',
//                 uniquId
//             );

//             return record
//                 ? {
//                     ...JSON.parse(record.data),
//                     isSynced: record.isSynced,
//                 }
//                 : null;
//         } catch (error) {
//             console.error(error);
//             return null;
//         }
//     };

//     // 🟢 Update Sync Status
//     const updateIsSyncedByUniqueId = async (uniqueId) => {
//         try {
//             realm.write(() => {
//                 const record = realm.objectForPrimaryKey(
//                     'helpDeskRaise',
//                     uniqueId
//                 );

//                 if (record) {
//                     record.isSynced = true;

//                     console.log(
//                         `isSynced updated to true for uniquId: ${uniqueId}`
//                     );
//                 } else {
//                     console.warn(
//                         `No record found with uniquId: ${uniqueId}`
//                     );
//                 }
//             });

//             return true;
//         } catch (error) {
//             console.error('Realm update failed:', error);
//             return false;
//         }
//     };

//     // 🟠 Update Record
//     const updateHelpDesk = (uniquId, newPayload) => {
//         try {
//             const existing = realm.objectForPrimaryKey(
//                 'helpDeskRaise',
//                 uniquId
//             );

//             const existingIsSynced =
//                 existing?.isSynced || false;

//             realm.write(() => {
//                 realm.create(
//                     'helpDeskRaise',
//                     {
//                         uniquId,
//                         data: JSON.stringify({
//                             ...newPayload,
//                             uniquId,
//                         }),
//                         isSynced: existingIsSynced,
//                     },
//                     Realm.UpdateMode.Modified
//                 );
//             });

//             console.log(
//                 `Updated record with uniquId: ${uniquId}`
//             );

//             return true;
//         } catch (error) {
//             console.error(
//                 'Failed to update help desk:',
//                 error
//             );

//             return false;
//         }
//     };

//     // 🔴 Delete By Unique Id
//     const deleteHelpDeskByUniquId = (uniquId) => {
//         try {
//             const record = realm.objectForPrimaryKey(
//                 'helpDeskRaise',
//                 uniquId
//             );

//             if (record) {
//                 realm.write(() => {
//                     realm.delete(record);
//                 });

//                 console.log(
//                     `Deleted record with uniquId: ${uniquId}`
//                 );

//                 return true;
//             }

//             console.warn(
//                 `Record not found for uniquId: ${uniquId}`
//             );

//             return false;
//         } catch (error) {
//             console.error(
//                 'Error deleting record:',
//                 error
//             );

//             return false;
//         }
//     };

//     // 🔴 Delete All
//     const deleteAllHelpDesk = () => {
//         try {
//             const allRecords =
//                 realm.objects('helpDeskRaise');

//             realm.write(() => {
//                 realm.delete(allRecords);
//             });

//             console.log(
//                 `Deleted ${allRecords.length} helpDeskRaise records`
//             );

//             return true;
//         } catch (error) {
//             console.error(
//                 'Error deleting records:',
//                 error
//             );

//             return false;
//         }
//     };

//     // 🟡 Save Or Update By Payload Id
//     const saveOrUpdateHelpDeskById = (payloadObj) => {
//         try {
//             const allTags =
//                 realm.objects('helpDeskRaise');

//             let existingTag = null;

//             for (let tag of allTags) {
//                 const parsed = JSON.parse(tag.data);

//                 if (parsed.id === payloadObj.id) {
//                     existingTag = tag;
//                     break;
//                 }
//             }

//             const mobileUniqueId =
//                 existingTag?.uniquId ||
//                 payloadObj.mobileUniqueId;

//             const isSynced =
//                 existingTag?.isSynced || false;

//             realm.write(() => {
//                 realm.create(
//                     'helpDeskRaise',
//                     {
//                         uniquId: mobileUniqueId,
//                         data: JSON.stringify({
//                             ...payloadObj,
//                             mobileUniqueId,
//                         }),
//                         isSynced,
//                     },
//                     Realm.UpdateMode.Modified
//                 );
//             });

//             console.log(
//                 existingTag
//                     ? 'Updated existing record'
//                     : 'Inserted new record'
//             );

//             return true;
//         } catch (error) {
//             console.error(
//                 'Failed to save/update help desk:',
//                 error
//             );

//             return false;
//         }
//     };

//     // 🆕 Offline Count
//     const getOfflineHelpDeskCount = () => {
//         try {
//             const helpDeskTags =
//                 realm.objects('helpDeskRaise');

//             return helpDeskTags.filtered(
//                 'isSynced == false'
//             ).length;
//         } catch (error) {
//             console.error(
//                 'Failed to get offline count:',
//                 error
//             );

//             return 0;
//         }
//     };

//     return {
//         saveHelpDesk,
//         getAllHelpDesk,
//         getHelpDeskById,
//         updateHelpDesk,
//         deleteHelpDeskByUniquId,
//         deleteAllHelpDesk,
//         saveOrUpdateHelpDeskById,
//         getOfflineHelpDeskCount,
//         updateIsSyncedByUniqueId,
//     };
// };