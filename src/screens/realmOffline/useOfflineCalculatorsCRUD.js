import Realm from 'realm';
import realm from './realmConfig'; // Adjust path
import { v4 as uuidv4 } from 'uuid';

export const useOfflineCalculatorsCRUD = () => {

    // Save Seed Master
    const saveSeedMasterList = (masterResp) => {
        const SeedMastersId = uuidv4();

        try {
            realm.write(() => {
                realm.delete(realm.objects('SeedMaster'));

                realm.create('SeedMaster', {
                    _id: SeedMastersId,
                    SeedMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log('Seed master list saved.');
            return true;
        } catch (error) {
            console.error('Failed to save seed master list:', error);
            return false;
        }
    };

    // Save Yield Master
    const saveYieldMasterList = (masterResp) => {
        const YieldMastersId = uuidv4();

        try {
            realm.write(() => {
                realm.delete(realm.objects('YieldMaster'));

                realm.create('YieldMaster', {
                    _id: YieldMastersId,
                    YieldMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log('Yield master list saved.');
            return true;
        } catch (error) {
            console.error('Failed to save yield master list:', error);
            return false;
        }
    };

    // Save Fertilizer Master
    const fertilizerMasterList = (masterResp) => {
        const id = uuidv4();

        try {
            realm.write(() => {
                realm.delete(realm.objects('FertilizerMaster'));

                realm.create('FertilizerMaster', {
                    _id: id,
                    FertilizerMastersList: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log('Fertilizer master list saved.');
            return true;
        } catch (error) {
            console.error('Failed to save fertilizer master list:', error);
            return false;
        }
    };

    // Save Fertilizer Master 2
    const fertilizerMasterList2 = (masterResp) => {
        const id = uuidv4();

        try {
            realm.write(() => {
                realm.delete(realm.objects('FertilizerMaster2'));

                realm.create('FertilizerMaster2', {
                    _id: id,
                    FertilizerMastersList2: JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log('Fertilizer master list 2 saved.');
            return true;
        } catch (error) {
            console.error('Failed to save fertilizer master list 2:', error);
            return false;
        }
    };

    // Save Fertilizer Calc Update Master
    const fertilizerMasterCalUpdateList = (masterResp) => {
        const id = uuidv4();

        try {
            realm.write(() => {
                realm.delete(
                    realm.objects('FertilizerCalcUpdateMaster')
                );

                realm.create('FertilizerCalcUpdateMaster', {
                    _id: id,
                    FertilizercalUpdateMastersList:
                        JSON.stringify(masterResp),
                    timestamp: new Date(),
                });
            });

            console.log(
                'Fertilizer Calc Update Master saved.'
            );

            return true;
        } catch (error) {
            console.error(
                'Failed to save Fertilizer Calc Update Master:',
                error
            );

            return false;
        }
    };

    // Save Seed Calculator
    const saveSeedCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create(
                    'SeedCalSubmit',
                    {
                        _id: 'SeedCalcSingleRecord',
                        data: JSON.stringify(payloadObj),
                    },
                    Realm.UpdateMode.Modified
                );
            });

            console.log(
                'Saved/Updated SeedCalc:',
                payloadObj
            );

            return true;
        } catch (error) {
            console.error(
                'Failed to save SeedCalc:',
                error
            );

            return false;
        }
    };

    // Save Yield Calculator
    const saveYieldCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.create(
                    'YieldCalSubmit',
                    {
                        _id: 'YieldCalcSingleRecord',
                        data: JSON.stringify(payloadObj),
                    },
                    Realm.UpdateMode.Modified
                );
            });

            console.log(
                'Saved/Updated YieldCalc:',
                payloadObj
            );

            return true;
        } catch (error) {
            console.error(
                'Failed to save YieldCalc:',
                error
            );

            return false;
        }
    };

    // Save Fertilizer Calculator
    const saveFertilizerCalc = (payloadObj) => {
        try {
            realm.write(() => {
                realm.delete(
                    realm.objects('FertilizerCalSubmit')
                );

                realm.create(
                    'FertilizerCalSubmit',
                    {
                        _id: 'FertilizerCalcSingleRecord',
                        data: JSON.stringify(payloadObj),
                    },
                    Realm.UpdateMode.Modified
                );
            });

            console.log(
                'Saved/Updated FertilizerCalc:',
                payloadObj
            );

            return true;
        } catch (error) {
            console.error(
                'Failed to save FertilizerCalc:',
                error
            );

            return false;
        }
    };

    // Get Seed Calculator
    const getSeedCalc = () => {
        const record = realm.objectForPrimaryKey(
            'SeedCalSubmit',
            'SeedCalcSingleRecord'
        );

        return record
            ? JSON.parse(record.data)
            : null;
    };

    // Get Yield Calculator
    const getYieldCalc = () => {
        const record = realm.objectForPrimaryKey(
            'YieldCalSubmit',
            'YieldCalcSingleRecord'
        );

        return record
            ? JSON.parse(record.data)
            : null;
    };

    // Delete Seed Calculator
    const deleteSeedCalc = () => {
        try {
            const record =
                realm.objectForPrimaryKey(
                    'SeedCalSubmit',
                    'SeedCalcSingleRecord'
                );

            if (record) {
                realm.write(() => {
                    realm.delete(record);
                });

                console.log(
                    'Deleted SeedCalc record'
                );

                return true;
            }

            return false;
        } catch (error) {
            console.error(
                'Error deleting SeedCalc:',
                error
            );

            return false;
        }
    };

    // Delete Yield Calculator
    const deleteYieldCalc = () => {
        try {
            const record =
                realm.objectForPrimaryKey(
                    'YieldCalSubmit',
                    'YieldCalcSingleRecord'
                );

            if (record) {
                realm.write(() => {
                    realm.delete(record);
                });

                console.log(
                    'Deleted YieldCalc record'
                );

                return true;
            }

            return false;
        } catch (error) {
            console.error(
                'Error deleting YieldCalc:',
                error
            );

            return false;
        }
    };

    // Check Seed Calculator Exists
    const hasSeedCalc = () => {
        return (
            realm.objectForPrimaryKey(
                'SeedCalSubmit',
                'SeedCalcSingleRecord'
            ) !== null
        );
    };

    // Check Yield Calculator Exists
    const hasYieldCalc = () => {
        return (
            realm.objectForPrimaryKey(
                'YieldCalSubmit',
                'YieldCalcSingleRecord'
            ) !== null
        );
    };

    return {
        saveSeedMasterList,
        saveYieldMasterList,
        fertilizerMasterList,
        fertilizerMasterList2,
        fertilizerMasterCalUpdateList,
        saveSeedCalc,
        saveYieldCalc,
        saveFertilizerCalc,
        getSeedCalc,
        getYieldCalc,
        deleteSeedCalc,
        deleteYieldCalc,
        hasSeedCalc,
        hasYieldCalc,
    };
};