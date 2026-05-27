import { useRealm, useQuery } from '@realm/react';
import { v4 as uuidv4 } from 'uuid';
import { useOfflineSync } from '../../utils/syncUtils';
export const useOfflineCalculatorsCRUD = () => {
   
    const realm = useRealm();
    const SeedCalc = useQuery('SeedCalSubmit');
    const YieldCalc = useQuery('YieldCalSubmit');

    //save seed masters
    const saveSeedMasterList = (masterResp) => {
       
        const SeedMastersId = uuidv4();
        try {
            realm.write(() => {
                realm.delete(realm.objects('SeedMaster')); // Ensure only one copy
                realm.create('SeedMaster', {
                    _id: SeedMastersId,
                    SeedMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log("Seed master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };

    const saveYieldMasterList = (masterResp) => {

        const YieldMastersId = uuidv4();
        try {
            realm.write(() => {
                realm.delete(realm.objects('YieldMaster')); // Ensure only one copy
                realm.create('YieldMaster', {
                    _id: YieldMastersId,
                    YieldMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
               
            });
            console.log("Seed master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };

    const fertilizerMasterList = (masterResp) => {
       
        const SeedMastersId = uuidv4();
        try {
            realm.write(() => {
                realm.delete(realm.objects('FertilizerMaster')); // Ensure only one copy
                realm.create('FertilizerMaster', {
                    _id: SeedMastersId,
                    FertilizerMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log("fertilizer master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };
    const fertilizerMasterList2 = (masterResp) => {
       
        const SeedMastersId = uuidv4();
        try {
            realm.write(() => {
                realm.delete(realm.objects('FertilizerMaster2')); // Ensure only one copy
                realm.create('FertilizerMaster2', {
                    _id: SeedMastersId,
                    FertilizerMastersList2: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log("fertilizer master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };
    const fertilizerMasterCalUpdateList = (masterResp) => {
       
        const SeedMastersId = uuidv4();
        try {
            realm.write(() => {
                realm.delete(realm.objects('FertilizerCalcUpdateMaster')); // Ensure only one copy
                realm.create('FertilizerCalcUpdateMaster', {
                    _id: SeedMastersId,
                    FertilizercalUpdateMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log("fertilizer master list saved.");
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };
    // Save or update a single SeedCalc object
    const saveSeedCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create(
                    'SeedCalSubmit',
                    {
                        _id: 'SeedCalcSingleRecord',
                        data: JSON.stringify(payloadObj)
                    },
                    Realm.UpdateMode.Modified
                );
            });
           // incrementOfflineCount(1);
            console.log('Saved/Updated SeedCalc:', payloadObj);
            return true;
        } catch (error) {
            console.error('Failed to save SeedCalc:', error);
            return false;
        }
    };

    const saveYieldCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create(
                    'YieldCalSubmit',
                    {
                        _id: 'YieldCalcSingleRecord',
                        data: JSON.stringify(payloadObj)
                    },
                    Realm.UpdateMode.Modified
                );
            });
            console.log('Saved/Updated YieldCalc:', payloadObj);
          //  incrementOfflineCount(1)
            return true;
        } catch (error) {
            console.error('Failed to save YieldCalc:', error);
            return false;
        }
    };
    const saveFertilizerCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.delete(realm.objects('FertilizerCalSubmit'));
                realm.create(
                    'FertilizerCalSubmit',
                    {
                        _id: 'FertilizerCalcSingleRecord',
                        data: JSON.stringify(payloadObj)
                    },
                    Realm.UpdateMode.Modified
                );
            });
            console.log('Saved/Updated YieldCalc:', payloadObj);
          //  incrementOfflineCount(1)
            return true;
        } catch (error) {
            console.error('Failed to save YieldCalc:', error);
            return false;
        }
    };

    // Get object
    const getSeedCalc = () => {
        const record = realm.objectForPrimaryKey('SeedCalSubmit', 'SeedCalcSingleRecord');
        return record ? JSON.parse(record.data) : null;
    };

    const getYieldCalc = () => {
        const record = realm.objectForPrimaryKey('YieldCalSubmit', 'YieldCalcSingleRecord');
        return record ? JSON.parse(record.data) : null;
    };

    // Delete
    const deleteSeedCalc = () => {
        try {
            const record = realm.objectForPrimaryKey('SeedCalSubmit', 'SeedCalcSingleRecord');
            if (record) {
                realm.write(() => {
                    realm.delete(record);
                });
                console.log('Deleted SeedCalc record');
                // decrementOfflineCount(1)
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting SeedCalc:', error);
            return false;
        }
    };

    const deleteYieldCalc = () => {
        try {
            const record = realm.objectForPrimaryKey('YieldCalSubmit', 'YieldCalcSingleRecord');
            if (record) {
                realm.write(() => {
                    realm.delete(record);
                });
                console.log('Deleted YieldCalc record');
                // decrementOfflineCount(1)
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting YieldCalc:', error);
            return false;
        }
    };

    // Count / presence check
    const hasSeedCalc = () => {
        return realm.objectForPrimaryKey('SeedCalSubmit', 'SeedCalcSingleRecord') !== null;
    };

    const hasYieldCalc = () => {
        return realm.objectForPrimaryKey('YieldCalSubmit', 'YieldCalcSingleRecord') !== null;
    };

    return {
        saveSeedMasterList,
        saveYieldMasterList,
        saveSeedCalc,
        saveYieldCalc,
        getSeedCalc,
        getYieldCalc,
        deleteSeedCalc,
        deleteYieldCalc,
        hasSeedCalc,
        hasYieldCalc,
        fertilizerMasterList,
        saveFertilizerCalc,
        fertilizerMasterList2

    };
};
