import { Platform, Text, Dimensions, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
// import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomSeedListViewModal from '../components/CustomSeedListViewModal';
// import CustomFertilizerCalListViewModal from '../components/CustomFertilizerCalListViewModal';
import CustomYieldCalListViewModal from '../components/CustomYieldCalListViewModal';

// import CustomTextInput from '../Components/CustomTextInput';
import CustomSeedTextInput from '../components/CustomSeedTextInput';
import CustomYieldTextInput from '../components/CustomYieldCalTextInput';

import { strings } from '../Localization/StringsCopy';
import SimpleToast from 'react-native-simple-toast';
// import CustomLoader from '../Components/CustomLoader';
// import CustomSuccessLoader from '../Components/CustomSuccessLoader';
// import CustomErrorLoader from '../Components/CustomErrorLoader';
import { GetApiHeaders } from '../utils/helpers'

// import {getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import APIConfig, { HTTP_OK } from '../api/APIConfig'

// import { Colors } from '../assets/Utils/Color';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
// import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
import CustomSeedsBorderInputDropDown from '../components/CustomSeedsBorderInputDropDown';
import CustomFertilizerCalBorderInputDropDown from '../components/CustomFertilizerCalBorderInputDropDown';

import { responsiveHeight } from 'react-native-responsive-dimensions';
// import CustomButton from '../Components/CustomButton'
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
// import { Styles } from '../styles/Styles';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt'
import usePostRequestWithJwt from "../api/usePostRequestWithJwt"
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from 'react-native-responsive-fontsize';
import { translate } from '../Localization/Localisation';
import { CustomCommonModal } from '../components/CustomCommonModal';
import realm from './realmOffline/realmConfig';
import { useOfflineCalculatorsCRUD } from './realmOffline/useOfflineCalculatorsCRUD';
import { useOfflineSync } from '../utils/syncUtils';
import { useFontStyles } from '../hooks/useFontStyles';
import { ROLDID } from '../utils';
import { getFromAsyncStorage } from '../utils/keychainUtils';


const { width, height } = Dimensions.get('window');

const SeedsCalculator = ({ route }) => {
    const fonts = useFontStyles()
    const { saveSeedMasterList, saveSeedCalc } = useOfflineCalculatorsCRUD();
    const { incrementOfflineCount, decrementOfflineCount, updateOfflineCount } = useOfflineSync();
    //   const calcType = route?.params?.calcType;
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const currentTheme = useSelector(state => state.theme.theme);
    const isConnected = useSelector(state => state.network.isConnected);
    const [loaderApi, setLoaderApi] = useState(false)
    const [isNetAvail, setIsNetAvail] = useState(isConnected)

    // const styles = Styles(currentTheme);
    const { fetchData } = useGetRequestWithJwt();
    const { postData, error, apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();

    const viewShotRef = useRef();
    const [showAlert, setShowAlert] = useState(false)
    // const companyStyle = useSelector(getCompanyStyles);
    // const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    let [retreivedFrmSavedData, setRetreivedFrmSavedData] = useState(false)
    let [selectedCrop, setSelectedCrop] = useState('')
    let [SeedRateKg, setSeedRateKg] = useState('')
    let [selectedSoil, setSelectedSoil] = useState('')
    let [VarietyOrPlantingSystem, setVarietyOrPlantingSystem] = useState('')
    let [listPlantingSystem, setListPlantingSystem] = useState([])
    let [listRowSpace, setListRowSpace] = useState([])
    let [PlantToPlantArr, setPlantToPlantArr] = useState([])
    let [productiveTillersListt, setProductiveTillersListt] = useState([])
    let [AvgGrainsPannicleListtt, setAvgGrainsPannicleListtt] = useState([])
    let [AvgBollWtListt, setAvgBollWtListt] = useState([])
    let [yieldNote, setYieldNote] = useState('');
    let [yieldNoteDesc, setYieldNoteDesc] = useState('');
    let [GrainYieldListtt, setGrainYieldListtt] = useState([])
    let [AvgBollsPerPlantListtt, setAvgBollsPerPlantListtt] = useState([])
    let [rowSpacing, setRowSpacing] = useState('')
    let [plantSpacing, setPlantSpacing] = useState('')
    const [IdealPlantPopulationOrAcre, setIdealPlantPopulationOrAcre] = useState('')
    let [CottonSeedRate, setCottonSeedRate] = useState('')
    let [areaToPlanted, setAreaToPlanted] = useState('')
    let [areaPlantedArr, setAreaPlantedArr] = useState('')//tobe changed
    let [totalSeedRequired, setTotalSeedRequired] = useState('')
    let [AvgBollsPerPlant, setAvgBollsPerPlant] = useState('')
    let [actualTotalSeedRequiredKgPerPkt, setActualTotalSeedRequiredKgPerPkt] = useState('')
    let [actualIdealPlantpopulation, setActualIdealPlantpopulation] = useState('')
    let [actualSeedRateKgPerAcre, setActualSeedRateKgPerAcre] = useState('')

    let [AvgBollWt, setAvgBollWt] = useState('')
    let [GrainYield, setGrainYield] = useState('');
    let [ExpectedYieldQtlPerAcre, setExpectedYieldQtlPerAcre] = useState('')
    let [Atthetime, setAtthetime] = useState('')
    let [Urea, setUrea] = useState('')
    let [FirstDose, setFirstDose] = useState('')
    let [FirstDoseUrea, setFirstDoseUrea] = useState('')
    let [secondDose, setsecondDose] = useState('')
    let [secondDoseUrea, setsecondDoseUrea] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    let [yieldCalcRes, setYieldCalcRes] = useState(null)
    let [cropsList, setCropList] = useState(null)
    let [yieldCropsList, setYieldCropList] = useState(null)
    let [seasonsalList, setSeasonsalList] = useState(null)
    let [allSeasonsList, setAllSeasonsList] = useState(null)
    let [vrtyOrPlntngList, setVrtyOrPlntngList] = useState(null)
    let [rowSpacingCmList, setRowSpacingCmList] = useState(null)
    let [plantToPlantList, setPlantToPlantList] = useState(null)
    let [areaToPlantedList, setAreaPlantedList] = useState(null)
    let [productiveTillersList, setProductiveTillersList] = useState(null)
    let [avgGrainsPerPannicleList, setAgGrainsPerPannicleList] = useState(null)
    let [AvgBollWeightList, setAvgBollWeightList] = useState(null)
    let [AvgBollsPerPlantList, setAvgBollsPerPlantList] = useState(null)
    let [grainYieldCobsList, setgrainYieldCobsList] = useState(null)
    //setgrainYieldCobsList
    let [productiveTillers, setProductiveTillers] = useState('')
    let [AvgGrainsPannicle, setAvgGrainsPannicle] = useState('')

    let [totalSeedRequiredUnits, setTotalSeedRequiredUnits] = useState('')
    let [seedRateUnits, setSeedRateUnits] = useState('')
    const [alertModal, setAlertModal] = useState(false)
    const [alertTextContent, setAlertTextContent] = useState("")
    const [roleId, setRoleId] = useState("")
    const roundToNearestInteger = (value) => Math.round(value).toString();
    const sharingRef = useRef(false);
    const [isSharing, setIsSharing] = useState(false);

    const navigation = useNavigation()
    const roundAndFormat = (value) => {
        const rounded = Math.round(value);
        return rounded.toFixed(2);
    };

    const getDoubleRoundToNearestInteger = (value) => Math.round(value);

    const roundToOneDecimalPlace = (value) => Number(value.toFixed(1)).toString();

    const roundCustom = (value) => {
        const bd = Number(value.toFixed(2));
        const floorValue = Number(bd.toFixed(1));
        const decimalPart = bd - floorValue;
        const firstDecimal = Math.floor((bd * 10) % 10);
        const secondDecimal = Math.floor((bd * 100) % 10);

        if (firstDecimal === 9) {
            return Math.ceil(bd).toString();
        } else if (firstDecimal > 5) {
            return Math.ceil(bd).toString();
        } else {
            if (secondDecimal > 5) {
                return (floorValue + 0.1).toFixed(1);
            } else {
                return floorValue.toFixed(1);
            }
        }
    };

    const roundUpToNearestHalf = (value) => Math.ceil(value * 2) / 2.0;


    const handleCancelAlert = () => {
        setShowAlert(false)
    }


    const CROP_NAME_COTTON = 'Cotton';
    const COTTON_SEED_RATE_UNITS = translate('Packets/Acre');
    const OTHER_SEED_RATE_UNITS = translate('Kg/Acre');
    const COTTON_TOTAL_SEED_REQUIRED_UNITS = translate('Packets');
    const COTTON_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1 = translate('Packet');
    const OTHER_TOTAL_SEED_REQUIRED_UNITS = translate('Kgs');
    const OTHER_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1 = translate('Kg');

    const getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData = async (
        crop,
        rowSpacingCm,
        selectPlantSpacingCm,
        seasonOrSoilType
    ) => {
        let response = { response: null };

        try {
            let seedRateKgPerAcreStr = '0';
            let result = {};

            // Handle Mustard and Wheat
            if (['mustard', 'wheat'].includes(crop.toLowerCase())) {
                const staticSeedRates = {
                    mustard: '1.5', // Verify these match Java's seedAndPopulationCaculatorManager
                    wheat: '40.0',
                };
                seedRateKgPerAcreStr = staticSeedRates[crop.toLowerCase()] || '0';
                result = {
                    seedRateKgPerAcre: seedRateKgPerAcreStr,
                    actualSeedRateKgPerAcre: seedRateKgPerAcreStr,
                    seedRateUnits: OTHER_SEED_RATE_UNITS,
                };
                response.response = result;
                return response;
            }

            // Validate inputs
            const rowSpacing = parseFloat(rowSpacingCm);
            const plantSpacing = parseFloat(selectPlantSpacingCm);
            if (isNaN(rowSpacing) || isNaN(plantSpacing)) {
                throw new Error('Invalid rowSpacingCm or selectPlantSpacingCm');
            }

            // Calculate Ideal Plant Population
            let idealPlantPopulation = 4047 / ((rowSpacing * plantSpacing) / 10000);
            idealPlantPopulation = getDoubleRoundToNearestInteger(idealPlantPopulation);
            console.log("matched or not" + " " + crop.toLowerCase() + " " + CROP_NAME_COTTON.toLowerCase())
            let seedRateKgPerAcre = 0;
            if (crop.toLowerCase() === 'bajra') {
                if (seasonOrSoilType.toLowerCase() === 'spring') {
                    seedRateKgPerAcre = (idealPlantPopulation / 60000) * 1.2;
                } else if (seasonOrSoilType.toLowerCase() === 'kharif') {
                    seedRateKgPerAcre = (idealPlantPopulation / 60000) * 1.25;
                }
            } else if (crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()) {
                seedRateKgPerAcre = idealPlantPopulation / 5000;
            } else if (crop.toLowerCase() === 'hybrid rice') {
                seedRateKgPerAcre = (idealPlantPopulation / 35700) * 1.2;
            } else if (crop.toLowerCase() === 'jute') {
                seedRateKgPerAcre = (idealPlantPopulation / 500000) * 2.2;
            } else if (crop.toLowerCase() === 'research paddy') {
                seedRateKgPerAcre = (idealPlantPopulation / 35700) * 2; // Fixed: Removed redundant condition
            } else if (crop.toLowerCase() === 'maize') {
                seedRateKgPerAcre = idealPlantPopulation / 4000;
            }

            const idealPlantPopulationStr = roundToNearestInteger(idealPlantPopulation);
            seedRateKgPerAcreStr = crop.toLowerCase() === 'maize'
                ? roundCustom(seedRateKgPerAcre)
                : roundToOneDecimalPlace(seedRateKgPerAcre);

            result = {
                idealPlantPopulation: idealPlantPopulationStr,
                seedRateKgPerAcre: seedRateKgPerAcreStr,
                actualIdealPlantPopulation: idealPlantPopulation.toString(),
                actualSeedRateKgPerAcre: seedRateKgPerAcre.toString(),
                seedRateUnits: crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()
                    ? COTTON_SEED_RATE_UNITS
                    : OTHER_SEED_RATE_UNITS,
            };

            response.response = result;
            console.log("mixed values is", result);
            return response;

        } catch (error) {
            console.error('Error in getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData:', error);
            return response.response = null;
        }
    };


    const getTotalSeedRequiredKgPerPkt = async (crop, actualSeedRateKgPerAcre, areaPlantedAcre) => {
        try {
            const areaPlantedAcreD = parseFloat(areaPlantedAcre);
            const seedRateKgPerAcreD = parseFloat(actualSeedRateKgPerAcre);

            const result = areaPlantedAcreD * seedRateKgPerAcreD;
            const totalSeedRequired = Math.ceil(result);

            const resultJson = {
                totalSeedRequiredKgPerPkt: totalSeedRequired.toString(),
                actualTotalSeedRequiredKgPerPkt: totalSeedRequired.toString(),
                totalSeedRequiredUnits: crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()
                    ? totalSeedRequired <= 1.0
                        ? COTTON_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                        : COTTON_TOTAL_SEED_REQUIRED_UNITS
                    : totalSeedRequired <= 1.0
                        ? OTHER_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                        : OTHER_TOTAL_SEED_REQUIRED_UNITS,
            };

            return resultJson;
        } catch (error) {
            console.error('Error in getTotalSeedRequiredKgPerPkt:', error);
            throw error;
        }
    };

    const getYieldAndSeedRates = async (crop, selectRowToRowSpacingCm, selectPlantToplantSpacingCm, seasonOrSoilType) => {
        console.log("crop is", crop);
        console.log("selectRowToRowSpacingCm", selectRowToRowSpacingCm);
        console.log("selectPlantToplantSpacingCm", selectPlantToplantSpacingCm);
        console.log("seasonOrSoilType", seasonOrSoilType);
        return getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData(
            crop,
            selectRowToRowSpacingCm,
            selectPlantToplantSpacingCm,
            seasonOrSoilType
        );
    };







    let resetValues = () => {
        //reset values when crop update
        setTotalSeedRequiredUnits('')
        setSeedRateUnits('')
        setSelectedSoil('')
        setVarietyOrPlantingSystem('')
        setListPlantingSystem([])
        //area to planted reset
        setAreaToPlanted('')
        setAreaPlantedArr([])
        //row spacing
        setRowSpacing('')
        setListRowSpace([])
        setSeasonsalList(null)
        //setAvgGrainsPannicleListtt
        //reset values   
        setAvgGrainsPannicle('')
        setAvgGrainsPannicleListtt([])
        //reset seed rate and plant population per acre
        setIdealPlantPopulationOrAcre('')
        setCottonSeedRate('')
        //AvgBollsPerPlant
        //reset values   
        setAvgBollsPerPlant('')
        setAvgBollsPerPlantListtt([])
        //avgBollWeghtLs
        //reset values   
        setAvgBollWt('')
        setAvgBollWtListt([])
        setExpectedYieldQtlPerAcre('')
        setTotalSeedRequired('')
    }

    const alertCloseHandle = () => {
        if (alertTextContent == translate('submitted_successfully') || alertTextContent == translate('Data_saved_offline')) {
            navigation.goBack()
        }
        setAlertModal(false)
    }
    // let setSeasonsArray = () => {
    //     let a = allSeasonsList;
    //     let crops = []
    //     a?.forEach((item) => {
    //         if (crops?.includes(item.crop)) return
    //         else crops?.push(item.crop)
    //     })
    //     crops?.forEach((crop) => {
    //         let cropList = a?.filter(item => item.crop === crop);
    //         cropList?.forEach((item, index) => {
    //             item.name = item.seasonSoilType;
    //             item.code = `${index + 1}`;
    //         });
    //         this[crop.toLowerCase()] = cropList;
    //     });

    //     if (selectedCrop !== '') {
    //         setSeasonsalList(this[selectedCrop?.toLowerCase()]);
    //         //recently added
    //         if (selectedCrop === 'Wheat' || selectedCrop === 'Mustard') {
    //             console.log("kira;asl;alsa;scalleddd")
    //             if (!this[selectedCrop?.toLowerCase()]) {
    //                 callApiRowPlant({
    //                     "crop": selectedCrop,
    //                 })
    //             }
    //         }
    //         //recently added
    //     }
    // }
    let setSeasonsArray = () => {
        let a = allSeasonsList;
        let crops = [];
        a?.forEach((item) => {
            if (crops?.includes(item.crop)) return;
            else crops?.push(item.crop);
        });
        let cropsData = {};
        crops?.forEach((crop) => {
            let cropList = a?.filter(item => item.crop === crop);
            cropList?.forEach((item, index) => {
                item.name = item.seasonSoilType;
                item.code = `${index + 1}`;
            });
            cropsData[crop.toLowerCase()] = cropList;
        });

        if (selectedCrop !== '') {
            setSeasonsalList(cropsData[selectedCrop?.toLowerCase()]);
            if (selectedCrop === 'Wheat' || selectedCrop === 'Mustard') {
                if (!cropsData[selectedCrop?.toLowerCase()]) {
                    callApiRowPlant({
                        "crop": selectedCrop,
                    });
                }
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            const getRoleId = async () => {
                const roleId = await getFromAsyncStorage(ROLDID)
                setRoleId(roleId)
            }
            getRoleId();
        }, [])
    );

    useEffect(() => {
        !retreivedFrmSavedData && resetValues()
        setSeasonsArray()
    }, [selectedCrop])

    // recently added
    useEffect(() => {
        if (rowSpacing !== '') {
            // !retreivedFrmSavedData && 
            let plantoPlanLs = plantToPlantList;
            setPlantSpacing('')
            setPlantToPlantArr([])
            // find if single val of row spacing
            let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === selectedCrop && (item.seasonSoilType === selectedSoil || !selectedSoil) && (rowSpacing != null ? item.selectRowSpacingCm == rowSpacing : true))?.selectPlantSpacingCm;
            // filter objects as per the selection of crop and soil
            let plantObj = plantoPlanLs?.filter(item => item.crop === selectedCrop && (item.seasonSoilType === selectedSoil || !selectedSoil) && (rowSpacing != null ? item.selectRowSpacingCm == rowSpacing : true))
            if (plantObj !== undefined && plantObj.length > 0) {
                plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                    if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                        item.code = acc.length + 1;
                        item.name = item.selectPlantSpacingCm;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // set plant arr
                setPlantToPlantArr(plantObj)
                if (plantObj.length === 1) {
                    //set direct value if length is 1
                    setPlantSpacing(selectedPlantSpc);
                }
            }
            // callApiRowPlant()
        }
    }, [rowSpacing])

    useEffect(() => {
        let list = vrtyOrPlntngList;
        let rowSpcLst = rowSpacingCmList;
        let plantoPlanLs = plantToPlantList;
        let areaPlantedValues = areaToPlantedList;
        let prdctTillerLs = productiveTillersList;
        let avgGrainPannLs = avgGrainsPerPannicleList;
        let avgBollWeghtLs = AvgBollWeightList;
        let avgBollPerPlant = AvgBollsPerPlantList;
        let grainCobLs = grainYieldCobsList;
        //reset seed rate and plant population per acre
        setIdealPlantPopulationOrAcre('')
        setCottonSeedRate('')

        //GrainYield
        //reset values   
        setGrainYield('')
        setGrainYieldListtt([])
        // find if single val of row spacing
        let selectedGrainYieldVal = grainCobLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.grainYield5Cobs;
        // filter objects as per the selection of crop and soil
        let grainYieldObj = grainCobLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (grainYieldObj !== undefined && grainYieldObj.length > 0) {
            grainYieldObj = grainYieldObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.grainYield5Cobs === item.grainYield5Cobs)) {
                    item.code = acc.length + 1;
                    item.name = item.grainYield5Cobs;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setGrainYieldListtt(grainYieldObj)
            if (grainYieldObj.length === 1) {
                //set direct value if length is 1
                setGrainYield(selectedGrainYieldVal);
            }
        }

        //avgBollWeghtLs
        //reset values   
        setAvgBollWt('')
        setAvgBollWtListt([])
        // find if single val of row spacing
        let selectedAvgBollWtVal = avgBollWeghtLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.avgBollWeight;
        // filter objects as per the selection of crop and soil
        let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (avgBollWtObj !== undefined && avgBollWtObj.length > 0) {
            avgBollWtObj = avgBollWtObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.avgBollWeight === item.avgBollWeight)) {
                    item.code = acc.length + 1;
                    item.name = item.avgBollWeight;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAvgBollWtListt(avgBollWtObj)
            if (avgBollWtObj.length === 1) {
                //set direct value if length is 1
                setAvgBollWt(selectedAvgBollWtVal);
            }
        }

        //AvgBollsPerPlant
        //reset values   
        setAvgBollsPerPlant('')
        setAvgBollsPerPlantListtt([])
        // find if single val of row spacing
        let selectedAvgBollsPerPlantVal = avgBollPerPlant?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.avgBollsPerPlant;
        // filter objects as per the selection of crop and soil
        let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (avgBollsPerPlantObj !== undefined && avgBollsPerPlantObj.length > 0) {
            avgBollsPerPlantObj = avgBollsPerPlantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.avgBollsPerPlant === item.avgBollsPerPlant)) {
                    item.code = acc.length + 1;
                    item.name = item.avgBollsPerPlant;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAvgBollsPerPlantListtt(avgBollsPerPlantObj)
            if (avgBollsPerPlantObj.length === 1) {
                //set direct value if length is 1
                setAvgBollsPerPlant(selectedAvgBollsPerPlantVal);
            }
        }


        //planting system
        //reset values
        setListPlantingSystem([])
        setVarietyOrPlantingSystem('')
        // find if single val of planting system
        let selectedVariety = list?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.varietyOrPlantingSys;
        // filter objects as per the selection of crop and soil
        let ls = list?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (ls !== undefined && ls.length > 0) {
            ls.forEach((item, index) => {
                item.code = index + 1;
                item.name = item.varietyOrPlantingSys;
            });
            // set array of planting system
            setListPlantingSystem(ls);
            // Only set VarietyOrPlantingSystem if ls length is 1
            if (ls.length === 1) {
                setVarietyOrPlantingSystem(selectedVariety);
            }
        }

        //row spacing 
        //reset values
        setRowSpacing('')
        setListRowSpace([])
        let selectedRowSpc = rowSpcLst?.find(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        )?.selectRowSpacingCm;

        // filter objects as per the selection of crop and season
        let rowSspc = rowSpcLst?.filter(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        );
        // // find if single val of row spacing
        // let selectedRowSpc = rowSpcLst?.find(item => item.crop === selectedCrop && item.seasonSoilType === selectedSoil)?.selectRowSpacingCm;
        // // filter objects as per the selection of crop and soil
        // let rowSspc = rowSpcLst?.filter(item => item.crop === selectedCrop && item.seasonSoilType === selectedSoil)
        if (rowSspc !== undefined && rowSspc.length > 0) {
            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectRowSpacingCm === item.selectRowSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectRowSpacingCm;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set array of row space
            setListRowSpace(rowSspc);
            // Only set row space if ls length is 1
            if (rowSspc.length === 1) {
                setRowSpacing(selectedRowSpc);
            }
        }

        //plant spacing
        //reset values
        setPlantSpacing('')
        setPlantToPlantArr([])
        // find if single val of row spacing
        let selectedPlantSpc = plantoPlanLs?.find(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        )?.selectPlantSpacingCm;

        // filter objects as per the selection of crop and season
        let plantObj = plantoPlanLs?.filter(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        );

        if (plantObj !== undefined && plantObj.length > 0) {
            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectPlantSpacingCm;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setPlantToPlantArr(plantObj)
            if (plantObj.length === 1) {
                //set direct value if length is 1
                setPlantSpacing(selectedPlantSpc);
            }
        }

        //setAvgGrainsPannicleListtt
        //reset values   
        setAvgGrainsPannicle('')
        setAvgGrainsPannicleListtt([])
        // find if single val of row spacing
        let selectedAvgGrainPinnacleVal = avgGrainPannLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.avgGrainsPerPannicle;
        // filter objects as per the selection of crop and soil
        let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (avgGrainsPerPannicleObj !== undefined && avgGrainsPerPannicleObj.length > 0) {
            avgGrainsPerPannicleObj = avgGrainsPerPannicleObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.avgGrainsPerPannicle === item.avgGrainsPerPannicle)) {
                    item.code = acc.length + 1;
                    item.name = item.avgGrainsPerPannicle;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAvgGrainsPannicleListtt(avgGrainsPerPannicleObj)
            if (avgGrainsPerPannicleObj.length === 1) {
                //set direct value if length is 1
                setAvgGrainsPannicle(selectedAvgGrainPinnacleVal);
            }
        }

        //productive millers
        //reset values   
        setProductiveTillers('')
        setProductiveTillersListt([])
        // find if single val of row spacing
        let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.productiveTillersPer10Hills;
        // filter objects as per the selection of crop and soil
        let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (productiveTillerObj !== undefined && productiveTillerObj.length > 0) {
            productiveTillerObj = productiveTillerObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.productiveTillersPer10Hills === item.productiveTillersPer10Hills)) {
                    item.code = acc.length + 1;
                    item.name = item.productiveTillersPer10Hills;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setProductiveTillersListt(productiveTillerObj)
            if (productiveTillerObj.length === 1) {
                //set direct value if length is 1
                setProductiveTillers(selectedProdTillerVal);
            }
        }


        //Area to be planted (Acres)
        //reset values   
        setAreaToPlanted('')
        setAreaPlantedArr([])
        // find if single val of row spacing
        let selectedAreaPlantedVal = areaPlantedValues?.find(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        )?.areaPlantedAcres;

        // filter objects as per the selection of crop and season
        let areaToPlantedObj = areaPlantedValues?.filter(item =>
            item.crop === selectedCrop &&
            (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
        );

        if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
            areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                    item.code = acc.length + 1;
                    item.name = item.areaPlantedAcres;
                    acc.push(item);
                }
                return acc;
            }, []);
            // set plant arr
            setAreaPlantedArr(areaToPlantedObj)
            if (areaToPlantedObj.length === 1) {
                //set direct value if length is 1
                setAreaToPlanted(selectedAreaPlantedVal);
            }
        }
    }, [selectedCrop, selectedSoil])

    useEffect(() => {
        if (rowSpacing !== '' && plantSpacing !== '') {
            let areaPlantedValues = areaToPlantedList;
            //Area to be planted (Acres)
            //reset values   
            setAreaToPlanted('')
            setAreaPlantedArr([])
            // find if single val of row spacing
            let selectedAreaPlantedVal = areaPlantedValues?.find(item =>
                item.crop === selectedCrop &&
                (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                &&
                (rowSpacing != null ? item.selectRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantSpacingCm === plantSpacing : true)
            )?.areaPlantedAcres;

            // filter objects as per the selection of crop and season
            let areaToPlantedObj = areaPlantedValues?.filter(item =>
                item.crop === selectedCrop &&
                (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                && (rowSpacing != null ? item.selectRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantSpacingCm === plantSpacing : true)
            );

            if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                    if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                        item.code = acc.length + 1;
                        item.name = item.areaPlantedAcres;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // set plant arr
                setAreaPlantedArr(areaToPlantedObj)
                if (areaToPlantedObj.length === 1) {
                    //set direct value if length is 1
                    setAreaToPlanted(selectedAreaPlantedVal);
                }
            }
            callApiRowPlant({
                "crop": selectedCrop,
                "seasonOrSoilType": selectedSoil,
                "rowSpacingCm": rowSpacing,
                "selectPlantSpacingCm": plantSpacing
            })
        }
    }, [rowSpacing, plantSpacing])

    useEffect(() => {
        if (areaToPlanted !== '' && !seasonsalList && actualSeedRateKgPerAcre !== '') {
            callApiGETTOTALSEED({
                "crop": selectedCrop,
                "areaPlantedAcre": areaToPlanted,
                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre
            })
        }
        if (CottonSeedRate !== '' && areaToPlanted !== '') {
            callApiGETTOTALSEED({
                "crop": selectedCrop,
                "areaPlantedAcre": areaToPlanted,
                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre
            })
        }
    }, [CottonSeedRate, areaToPlanted])

    //new one


    let callApiGETTOTALSEED = async (data) => {

        let dashboardResp = await getTotalSeedRequiredKgPerPkt(selectedCrop, actualSeedRateKgPerAcre, areaToPlanted)
        console.log("dashboard resp", dashboardResp);
        setActualTotalSeedRequiredKgPerPkt(`${dashboardResp?.actualTotalSeedRequiredKgPerPkt}`)
        setTotalSeedRequired(`${dashboardResp?.totalSeedRequiredKgPerPkt}`)
        setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
        return;

        if (isConnected) {
            try {
                setLoading(true)
                setLoaderApi(true)
                setLoadingMessage(translate("please_wait_getting_data"))
                // var getTotalSeedReqURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.getIdealPlantPopulationSeedRate;
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.getIdealPlantPopulationSeedRate;
                var headers = await GetApiHeaders();
                delete headers.authType
                // var payload = {
                //     "areaPlantedAcre": areaToPlanted,
                //     "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre
                // }
                var payload = data
                var APIResponse = await sendData(url, payload, headers, false);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                        setLoaderApi(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data.response
                            console.log(APIResponse, "saikidashBoardResponse=-=-=-=->")
                            setLoadingMessage()
                            // setTotalSeedRequired(`${dashboardResp.response.totaSeedRequired}`)
                            setActualTotalSeedRequiredKgPerPkt(`${dashboardResp?.actualTotalSeedRequiredKgPerPkt}`)
                            setTotalSeedRequired(`${dashboardResp?.totalSeedRequiredKgPerPkt}`)
                            setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
                            console.log("steponw=-=-=->", dashboardResp?.totalSeedRequiredKgPerPkt)
                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            setLoaderApi(false)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                            // Alert.alert(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoaderApi(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setLoaderApi(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            // SimpleToast.show(translate("no_internet_conneccted"))

            let dashboardResp = await getTotalSeedRequiredKgPerPkt(selectedCrop, actualSeedRateKgPerAcre, areaToPlanted)
            console.log("dashboard resp", dashboardResp);
            setActualTotalSeedRequiredKgPerPkt(`${dashboardResp?.actualTotalSeedRequiredKgPerPkt}`)
            setTotalSeedRequired(`${dashboardResp?.totalSeedRequiredKgPerPkt}`)
            setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
        }
    }
    // recently changed passed the props
    let callApiRowPlant = async (data) => {
        let dashboardResp = await getYieldAndSeedRates(selectedCrop, rowSpacing, plantSpacing, selectedSoil)
        console.log(dashboardResp, "<-------------- check calcs happening")
        setActualIdealPlantpopulation(dashboardResp?.response?.actualIdealPlantPopulation)
        setActualSeedRateKgPerAcre(dashboardResp?.response?.actualSeedRateKgPerAcre)
        setIdealPlantPopulationOrAcre(dashboardResp?.response?.idealPlantPopulation)
        setCottonSeedRate(dashboardResp?.response?.seedRateKgPerAcre)
        setSeedRateUnits(dashboardResp?.response?.seedRateUnits)
        return;

        if (isConnected) {
            try {

                setLoading(true)
                setLoaderApi(true)
                setLoadingMessage(translate("please_wait_getting_data"))

                // var getYieldRatesURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData;
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData;
                var headers = await GetApiHeaders();
                delete headers.authType
                // var payload = {
                //     "crop": selectedCrop,
                //     "seasonOrSoilType": selectedSoil,
                //     "rowSpacingCm": rowSpacing,
                //     "selectPlantSpacingCm": plantSpacing
                // }
                var payload = data
                var APIResponse = await sendData(url, payload, headers, false);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                        // setLoaderApi(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data.response
                            setLoadingMessage()
                            // setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantpopulation)
                            // setCottonSeedRate(dashboardResp?.seedRateKgPerAcre)
                            setActualIdealPlantpopulation(dashboardResp?.actualIdealPlantpopulation)
                            setActualSeedRateKgPerAcre(dashboardResp?.actualSeedRateKgPerAcre)
                            setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantpopulation)
                            setCottonSeedRate(dashboardResp?.seedRateKgPerAcre)
                            setSeedRateUnits(dashboardResp?.seedRateUnits)
                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            // setLoaderApi(false)

                            setAlertTextContent(APIResponse?.message)
                            setAlertModal(true)
                            // Alert.alert(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        // setLoaderApi(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    // setLoaderApi(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            //   SimpleToast.show(translate("no_internet_conneccted"))
            let dashboardResp = await getYieldAndSeedRates(selectedCrop, rowSpacing, plantSpacing, selectedSoil)
            //   {"response": {"actualIdealPlantPopulation": "179867", "actualSeedRateKgPerAcre": "10.07658263305322", "idealPlantPopulation": "179867", "seedRateKgPerAcre": "10.1", "seedRateUnits": "Kg/Acre"}}
            console.log(dashboardResp, "<-------------- check calcs happening")
            setActualIdealPlantpopulation(dashboardResp?.response?.actualIdealPlantPopulation)
            setActualSeedRateKgPerAcre(dashboardResp?.response?.actualSeedRateKgPerAcre)
            setIdealPlantPopulationOrAcre(dashboardResp?.response?.idealPlantPopulation)
            setCottonSeedRate(dashboardResp?.response?.seedRateKgPerAcre)
            setSeedRateUnits(dashboardResp?.response?.seedRateUnits)
        }
    }

    const geSeedAndPopulationCaculator = async () => {
        // var networkStatus = await getNetworkStatus()
        if (isConnected) {
            try {
                setLoading(true)
                setLoaderApi(true)
                setLoadingMessage(translate("please_wait_getting_data"))

                const getYeildCalcURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.geSeedAndPopulationCaculator;
                const getHeaders = await GetApiHeaders()
                const APIResponse = await fetchData(getYeildCalcURL, getHeaders);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                        setLoaderApi(false)
                    }, 500);


                    if (APIResponse.statusCode == HTTP_OK) {
                        const masterResp = APIResponse.data
                        console.log("data value is fixed", JSON.stringify(masterResp));
                        saveSeedMasterList(masterResp);

                        if (masterResp != undefined && masterResp != null) {

                            if (JSON.parse(masterResp.seedAndPopulationCalHDtoExist).farmerId) {
                                setRetreivedFrmSavedData(true)
                                setTimeout(async () => {
                                    let wholeData = JSON.parse(masterResp?.seedAndPopulationCalHDtoExist);
                                    console.log(wholeData?.seasonSoilType, 'wholeData?.seasonSoilType', wholeData)
                                    if (wholeData?.crop) {
                                        setSeedRateUnits(wholeData?.seedRateUnits)
                                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                                        setSelectedCrop(wholeData?.crop);
                                        setSelectedSoil(wholeData?.seasonSoilType);
                                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                                        setCottonSeedRate(wholeData?.seedRateKgPerAcre);
                                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                                        setActualIdealPlantpopulation(wholeData?.actualIdealPlantPopulationPerAcre)
                                        setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)

                                        // set dropdowns
                                        setYieldCalcRes(masterResp)
                                        let cropLis = masterResp?.cropList
                                        cropLis.forEach((crop, index) => {
                                            crop.name = crop.crop;
                                            delete crop.crop;
                                            crop.code = `crop${index + 1}`;
                                        });
                                        setCropList(cropLis)
                                        setAllSeasonsList(masterResp?.seasonsoilTypeList)
                                        setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)

                                        if (masterResp?.seasonsoilTypeList) {
                                            let a = masterResp?.seasonsoilTypeList;
                                            let crops = [];
                                            let seasonMap = {};
                                            a?.forEach((item) => {
                                                if (!crops.includes(item.crop)) crops.push(item.crop);
                                            });
                                            crops.forEach((crop) => {
                                                let cropListSeas = a?.filter(item => item.crop === crop);
                                                cropListSeas?.forEach((item, index) => {
                                                    item.name = item.seasonSoilType;
                                                    item.code = `${index + 1}`;
                                                });
                                                seasonMap[crop.toLowerCase()] = cropListSeas;
                                            });
                                            if (wholeData?.crop !== '') {
                                                setSeasonsalList(seasonMap[wholeData?.crop?.toLowerCase()] || []);
                                            }
                                        }


                                        setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                                        //start setting row spacing
                                        let rowSpcLst = masterResp?.selectRowSpacingCmList;
                                        setRowSpacing('')
                                        setListRowSpace([])
                                        // find if single val of row spacing
                                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectRowSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        //  let areaToPlantedObj = areaPlantedValues?.filter(item => 
                                        //     item.crop === selectedCrop && 
                                        //     (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                                        // );
                                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                                        if (rowSspc !== undefined && rowSspc.length > 0) {
                                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectRowSpacingCm === item.selectRowSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectRowSpacingCm;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set array of row space
                                            setListRowSpace(rowSspc);
                                            // Only set row space if ls length is 1
                                            //  if (rowSspc.length === 1) {
                                            //  setRowSpacing(selectedRowSpc);
                                            //  } else 
                                            setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                                        }
                                        //end
                                        setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                                        let plantoPlanLs = masterResp?.selectPlantSpacingCmList;
                                        // staart setting plant to plant values
                                        setPlantSpacing('')
                                        setPlantToPlantArr([])
                                        // find if single val of row spacing
                                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectPlantSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                                        if (plantObj !== undefined && plantObj.length > 0) {
                                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectPlantSpacingCm;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setPlantToPlantArr(plantObj)
                                            // if (plantObj.length === 1) {
                                            //set direct value if length is 1
                                            // setPlantSpacing(selectedPlantSpc);
                                            // } else
                                            setPlantSpacing(wholeData?.selectPlantToplantSpacingCm)
                                        }
                                        //end
                                        setAreaPlantedList(masterResp?.areaPlantedAcresList)
                                        //start setting area planted list
                                        let areaPlantedValues = masterResp?.areaPlantedAcresList;
                                        //reset values   
                                        setAreaToPlanted('')
                                        setAreaPlantedArr([])
                                        // find if single val of row spacing
                                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                                        // filter objects as per the selection of crop and soil
                                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                                        if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                                            areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.areaPlantedAcres;
                                                    acc.push(item);
                                                }
                                                return acc;
                                            }, []);
                                            // set plant arr
                                            setAreaPlantedArr(areaToPlantedObj)
                                            // if (areaToPlantedObj.length === 1) {
                                            //set direct value if length is 1
                                            // setAreaToPlanted(selectedAreaPlantedVal);
                                            // } else
                                            setAreaToPlanted(wholeData?.areaPlantedAcres);
                                        }
                                        //end
                                    }
                                }, 100)
                                // selectedRowSpc
                            }
                            else {
                                let cropLis = masterResp?.cropList
                                cropLis.forEach((crop, index) => {
                                    crop.name = crop.crop;
                                    // delete crop.crop; 
                                    crop.code = `${index + 1}`;
                                });
                                setCropList(cropLis)
                                setAllSeasonsList(masterResp?.seasonsoilTypeList)
                                setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                                setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                                setAreaPlantedList(masterResp?.areaPlantedAcresList)
                            }

                        }
                    }
                    else {
                        // Alert.alert(APIResponse?.message)
                        setAlertModal(true)
                        setAlertTextContent(APIResponse?.message)
                    }

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoaderApi(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setLoaderApi(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
                SimpleToast.show(error.message)
            }
        } else {
            setLoading(false);
            setLoaderApi(false)
            setSuccessLoadingMessage("");
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    // useEffect(() => {
    //     setLoaderApi(true)
    //     geSeedAndPopulationCaculator()
    // }, []);




    useFocusEffect(

        React.useCallback(() => {
            let getData = () => {
                if (isNetAvail) {
                    const seedCalcRes = realm.objects('SeedMaster');
                    const seedArray = Array.from(seedCalcRes);
                    if (seedArray != undefined && seedArray.length !== 0) {
                        checkRealData()
                    } else {
                        setLoaderApi(true)
                        geSeedAndPopulationCaculator()
                    }
                } else {
                    checkRealData()
                }
            }
            getData()
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [isNetAvail])
    );

    // useEffect(() => {
    //     geSeedAndPopulationCaculator()
    // }, []);

    let checkRealData = async () => {
        const seedCalcRes = realm.objects('SeedMaster');
        const seedArray = Array.from(seedCalcRes);
        console.log("checked realm data is", seedCalcRes);

        if (seedArray != undefined && seedArray.length !== 0) {

            let data = seedCalcRes[0]?.SeedMastersList;
            const masterResp = JSON.parse(data);
            console.log("chukchukchuk", masterResp);

            const populatedData = JSON.parse(masterResp.seedAndPopulationCalHDtoExist);
            console.log("populated steamed data", populatedData);

            let cropLis = masterResp?.cropList
            cropLis.forEach((crop, index) => {
                crop.name = crop.crop;
                // delete crop.crop;
                crop.code = `${index + 1}`;
            });
            setCropList(cropLis)
            setAllSeasonsList(masterResp?.seasonsoilTypeList)
            setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
            setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
            setAreaPlantedList(masterResp?.areaPlantedAcresList)
            if ('crop' in populatedData) {


                // if (JSON.parse(masterResp.seedAndPopulationCalHDtoExist).retailerId) {
                setRetreivedFrmSavedData(true)
                setTimeout(async () => {
                    let wholeData = populatedData;
                    console.log(wholeData?.seasonSoilType, 'wholeData?.seasonSoilType', wholeData)
                    if (wholeData?.crop) {
                        setSelectedCrop(wholeData?.crop);
                        setSelectedSoil(wholeData?.seasonSoilType);
                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                        setCottonSeedRate(wholeData?.seedRateKgPerAcre);
                        setSeedRateUnits(wholeData?.seedRateUnits)
                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                        //set them as per new update start
                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                        setActualIdealPlantpopulation(wholeData?.actualIdealPlantPopulationPerAcre)
                        setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                        //end

                        // set dropdowns
                        setYieldCalcRes(masterResp)
                        let cropLis = masterResp?.cropList
                        cropLis.forEach((crop, index) => {
                            crop.name = crop.crop;
                            delete crop.crop;
                            crop.code = `crop${index + 1}`;
                        });
                        setCropList(cropLis)
                        setAllSeasonsList(masterResp?.seasonsoilTypeList)

                        if (masterResp?.seasonsoilTypeList) {
                            let a = masterResp?.seasonsoilTypeList;
                            let crops = [];
                            let seasonMap = {};
                            a?.forEach((item) => {
                                if (!crops.includes(item.crop)) crops.push(item.crop);
                            });
                            crops.forEach((crop) => {
                                let cropListSeas = a?.filter(item => item.crop === crop);
                                cropListSeas?.forEach((item, index) => {
                                    item.name = item.seasonSoilType;
                                    item.code = `${index + 1}`;
                                });
                                seasonMap[crop.toLowerCase()] = cropListSeas;
                            });
                            if (wholeData?.crop !== '') {
                                setSeasonsalList(seasonMap[wholeData?.crop?.toLowerCase()] || []);
                            }
                        }

                        setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                        //start setting row spacing
                        let rowSpcLst = masterResp?.selectRowSpacingCmList;
                        setRowSpacing('')
                        setListRowSpace([])
                        // find if single val of row spacing
                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectRowSpacingCm;
                        // filter objects as per the selection of crop and soil
                        //  let areaToPlantedObj = areaPlantedValues?.filter(item =>
                        //     item.crop === selectedCrop &&
                        //     (item.seasonSoilType === selectedSoil || !selectedSoil) // Ignore season if not provided
                        // );
                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                        if (rowSspc !== undefined && rowSspc.length > 0) {
                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectRowSpacingCm === item.selectRowSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectRowSpacingCm;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set array of row space
                            setListRowSpace(rowSspc);
                            // Only set row space if ls length is 1
                            //  if (rowSspc.length === 1) {
                            //  setRowSpacing(selectedRowSpc);
                            //  } else
                            setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                        }
                        //end
                        setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                        let plantoPlanLs = masterResp?.selectPlantSpacingCmList;
                        // staart setting plant to plant values
                        setPlantSpacing('')
                        setPlantToPlantArr([])
                        // find if single val of row spacing
                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.selectPlantSpacingCm;
                        // filter objects as per the selection of crop and soil
                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                        if (plantObj !== undefined && plantObj.length > 0) {
                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectPlantSpacingCm === item.selectPlantSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectPlantSpacingCm;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setPlantToPlantArr(plantObj)
                            // if (plantObj.length === 1) {
                            //set direct value if length is 1
                            // setPlantSpacing(selectedPlantSpc);
                            // } else
                            setPlantSpacing(wholeData?.selectPlantToplantSpacingCm)
                        }
                        //end
                        setAreaPlantedList(masterResp?.areaPlantedAcresList)
                        //start setting area planted list
                        let areaPlantedValues = masterResp?.areaPlantedAcresList;
                        //reset values  
                        setAreaToPlanted('')
                        setAreaPlantedArr([])
                        // find if single val of row spacing
                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                        // filter objects as per the selection of crop and soil
                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && (item.seasonSoilType === wholeData?.seasonSoilType || !wholeData?.seasonSoilType))
                        if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                            areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                                    item.code = acc.length + 1;
                                    item.name = item.areaPlantedAcres;
                                    acc.push(item);
                                }
                                return acc;
                            }, []);
                            // set plant arr
                            setAreaPlantedArr(areaToPlantedObj)
                            // if (areaToPlantedObj.length === 1) {
                            //set direct value if length is 1
                            // setAreaToPlanted(selectedAreaPlantedVal);
                            // } else
                            setAreaToPlanted(wholeData?.areaPlantedAcres);
                        }
                        //end
                    }
                }, 100)
                // selectedRowSpc
            }
            else {
                console.log(masterResp, "masterrrrrrr")
                let cropLis = masterResp?.cropList
                cropLis.forEach((crop, index) => {
                    crop.name = crop.crop;
                    // delete crop.crop;
                    crop.code = `${index + 1}`;
                });
                setCropList(cropLis)
                setAllSeasonsList(masterResp?.seasonsoilTypeList)
                setRowSpacingCmList(masterResp?.selectRowSpacingCmList)
                setPlantToPlantList(masterResp?.selectPlantSpacingCmList)
                setAreaPlantedList(masterResp?.areaPlantedAcresList)
            }
        }
        else {
            // showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
            SimpleToast.show("No internet")
        }
    }














    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const onSelectItem = (itemdata, setStateFn) => {
        if (itemdata != null) {
            setStateFn(itemdata?.name);
            setShowDropDowns(false);
        }
    };

    const takeScreenshot = async () => {
        if (sharingRef.current) return;

        sharingRef.current = true;
        setIsSharing(true);

        try {
            const uri = await viewShotRef.current.capture();

            const shareOptions = {
                title: 'Share via',
                message: `${translate("Note")} ${translate("noteDesc")}`,
                url: uri,
            };

            await Share.open(shareOptions);

        } catch (error) {

            // User cancelled share popup
            if (
                error?.message?.includes('User did not share') ||
                error?.message?.includes('User cancelled')
            ) {
                console.log('Share cancelled');
            } else {
                console.error('Failed to capture screenshot:', error);
            }

        } finally {
            sharingRef.current = false;
            setIsSharing(false);
        }
    };
    const commonSchema = {
        requiredFields: [
            'selectedCrop',
            'rowSpacing',
            'plantSpacing',
            'IdealPlantPopulationOrAcre',
            'CottonSeedRate',
            'areaToPlanted',
            'totalSeedRequired',
        ]
    };

    const soilDependentSchema = {
        requiredFields: [
            ...commonSchema.requiredFields,
            'selectedSoil'
        ]
    };

    const minimalSchema = {
        requiredFields: [
            'selectedCrop',
            'CottonSeedRate',
            'areaToPlanted',
            'totalSeedRequired',
        ]
    };

    const validationSchemas = {
        Bajra: soilDependentSchema,
        Cotton: soilDependentSchema,
        HybridRice: commonSchema,
        Jute: commonSchema,
        Maize: soilDependentSchema,
        Mustard: minimalSchema,
        Wheat: minimalSchema,
        ReasearchPaddy: commonSchema,
        Default: commonSchema
    };

    const validateFields = (selectedCrop, fields) => {
        const normalizedCropName = normalizeCropName(selectedCrop);
        const schema = validationSchemas[normalizedCropName] || validationSchemas.Default;
        return schema.requiredFields.every(field => fields[field] !== '');
    };

    const normalizeCropName = (cropName) => {
        return cropName.replace(/\s+/g, '');
    };

    // new one


    const saveAPI = async () => {
        // var networkStatus = await getNetworkStatus()
        if (isConnected) {
            try {
                setLoading(true)
                setLoaderApi(true)
                setLoadingMessage(translate("please_wait_getting_data"))
                // var getExpctYldURL = APIConfig.BASE_URL + APIConfig.CALCULATOR.saveSeedAndPopulationCaculator;
                var getExpctYldURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.saveSeedAndPopulationCaculator;

                var headers = await GetApiHeaders();
                headers['Content-Type'] = 'multipart/form-data'
                delete headers.authType

                // var getUserID = (await retrieveData(USER_ID))
                var getUserID = headers.userId
                const jsonData = {
                    "id": getUserID,
                    "farmerId": getUserID,
                    "crop": selectedCrop,
                    "seasonSoilType": selectedSoil,
                    "selectRowTorowSpacingCm": rowSpacing,
                    "selectPlantToplantSpacingCm": plantSpacing,
                    "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                    "seedRateKgPerAcre": CottonSeedRate,
                    "areaPlantedAcres": areaToPlanted,
                    "totalSeedRequiredKgPerPkt": totalSeedRequired,
                    'actualIdealPlantPopulationPerAcre': actualIdealPlantpopulation,
                    'actualSeedRateKgPerAcre': actualSeedRateKgPerAcre,
                    "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
                };
                const formData = new FormData();
                formData.append('jsonData', JSON.stringify(jsonData));
                const APIResponse = await sendData(getExpctYldURL, formData, headers, false);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                        setLoaderApi(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {

                            var dashboardResp = APIResponse.data;
                            setLoadingMessage();
                            //SimpleToast.show(dashboardResp?.message);

                            const seedCalcRes = realm.objects('SeedMaster');
                            let data = seedCalcRes[0]?.SeedMastersList;

                            const masterResp = JSON.parse(data); // this is a JS object

                            const jsonData = {
                                farmerId: Number.parseInt(getUserID),
                                crop: selectedCrop,
                                seasonSoilType: selectedSoil,
                                selectRowTorowSpacingCm: rowSpacing,
                                selectPlantToplantSpacingCm: plantSpacing,
                                idealPlantPopulationPerAcre: IdealPlantPopulationOrAcre,
                                seedRateKgPerAcre: CottonSeedRate,
                                areaPlantedAcres: areaToPlanted,
                                totalSeedRequiredKgPerPkt: totalSeedRequired,
                                actualIdealPlantPopulationPerAcre: actualIdealPlantpopulation,
                                actualSeedRateKgPerAcre: actualSeedRateKgPerAcre,
                                actualTotalSeedRequiredKgPerPkt: actualTotalSeedRequiredKgPerPkt,
                            };

                            // ✅ Push new entry to the existing list
                            masterResp.seedAndPopulationCalHDtoExist = JSON.stringify(jsonData);

                            saveSeedMasterList(masterResp);
                            SimpleToast.show(translate("submitted_successfully"))
                            // setAlertTextContent(translate('submitted_successfully'))
                            // setAlertModal(true)


                            //Yied calculator values commented for june 4th release

                            // const yieldCalcRes = realm.objects('YieldMaster');
                            // let tempYielData = yieldCalcRes[0]?.YieldMastersList;

                            // const YieldMasterResp = JSON.parse(tempYielData);

                            // let updatedSesonType = selectedSoil;
                            // let YeildTypeValue = "";

                            // if (selectedSoil?.toLowerCase() === "hdps in light soils") {
                            //     YeildTypeValue = "High Density Planting (HDPS)";
                            //     updatedSesonType = "Light soils";
                            // }
                            // if (selectedSoil?.toLowerCase() === "hdps in medium soils") {
                            //     YeildTypeValue = "High Density Planting (HDPS)";
                            //     updatedSesonType = "Medium Soils";
                            // }
                            // if (selectedSoil?.toLowerCase() === "heavy soils") {
                            //     YeildTypeValue = "Normal Population";
                            // }
                            // if (selectedSoil?.toLowerCase() === "light & medium soils") {
                            //     YeildTypeValue = "Normal Population";
                            // }

                            // const yieldData = {
                            //     farmerId: Number.parseInt(getUserID),                            // from seedData
                            //     crop: selectedCrop,                                              // from seedData
                            //     season: updatedSesonType,                                                      // not in seedData
                            //     seasonSoilType: updatedSesonType,                                    // from seedData
                            //     varietyTypeOrPlantingSystem: YeildTypeValue,                                 // not in seedData
                            //     selectRowTorowSpacingCm: rowSpacing,                             // from seedData
                            //     selectPlantToplantSpacingCm: plantSpacing,                       // from seedData
                            //     idealPlantPopulationPerAcre: IdealPlantPopulationOrAcre,         // from seedData
                            //     cottonSeedRatePktsPerAcre: CottonSeedRate,                       // from seedData
                            //     seedRateKgPerAcre: CottonSeedRate,                               // from seedData
                            //     areaPlantedAcres: areaToPlanted,                                 // from seedData
                            //     totalSeedRequiredKgPerPkt: totalSeedRequired,                    // from seedData
                            //     avgBollsPerPlant: "",                                            // not in seedData
                            //     avgBollWeight: "",                                               // not in seedData
                            //     productiveTillersPer10Hills: "",                                 // not in seedData
                            //     avgGrainsPerPannicle: "",                                        // not in seedData
                            //     grainYield5Cobs: "",                                             // not in seedData
                            //     expectedYieldQtlPerAcre: "",                                     // not in seedData
                            //     actualExpectedYieldQtlPerAcre: "",                               // not in seedData
                            //     actualSeedRateKgPerAcre: actualSeedRateKgPerAcre,                // from seedData
                            //     actualCottonSeedRatePktsPerAcre: actualSeedRateKgPerAcre,        // from seedData (same value)
                            //     actualIdealPlantPopulationPerAcre: actualIdealPlantpopulation,   // from seedData
                            //     actualTotalSeedRequiredKgPerPkt: actualTotalSeedRequiredKgPerPkt // from seedData
                            // };

                            // YieldMasterResp.YieldCalculatoroExist = JSON.stringify(yieldData);
                            // saveYieldMasterList(YieldMasterResp);

                        } else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            setLoaderApi(false)
                            // Alert.alert(APIResponse?.message)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoaderApi(false)
                        setLoadingMessage()
                        if (Platform.OS == "ios") {
                            SimpleToast.show(translate("Something_went_wrong"));
                        } else {
                            ToastAndroid.show(translate("Something_went_wrong"), ToastAndroid.SHORT);
                        }
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setLoaderApi(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            setLoading(false)
            setLoaderApi(false)
            setLoadingMessage("")
            //   SimpleToast.show(translate("no_internet_conneccted"))

            const seedCalcRes = realm.objects('SeedMaster');
            let data = seedCalcRes[0]?.SeedMastersList;

            const masterResp = JSON.parse(data); // this is a JS object
            var headers = await GetApiHeaders();
            var getUserID = headers.userId
            const jsonData = {
                "id": getUserID,
                "farmerId": getUserID,
                crop: selectedCrop,
                seasonSoilType: selectedSoil,
                selectRowTorowSpacingCm: rowSpacing,
                selectPlantToplantSpacingCm: plantSpacing,
                idealPlantPopulationPerAcre: IdealPlantPopulationOrAcre,
                seedRateKgPerAcre: CottonSeedRate,
                areaPlantedAcres: areaToPlanted,
                totalSeedRequiredKgPerPkt: totalSeedRequired,
                actualIdealPlantPopulationPerAcre: actualIdealPlantpopulation,
                actualSeedRateKgPerAcre: actualSeedRateKgPerAcre,
                actualTotalSeedRequiredKgPerPkt: actualTotalSeedRequiredKgPerPkt,
            };

            // ✅ Push new entry to the existing list
            masterResp.seedAndPopulationCalHDtoExist = JSON.stringify(jsonData);
            const stingfiedData = JSON.stringify(jsonData);;
            saveSeedMasterList(masterResp);
            const saveData = saveSeedCalc(stingfiedData);
            if (saveData) {
                // incrementOfflineCount(1)
                updateOfflineCount()
                setAlertTextContent(translate('Data_saved_offline'))
                setAlertModal(true)
            }



            //Yied calculator values Commented below code for june 4th release

            // const yieldCalcRes = realm.objects('YieldMaster');
            // let tempYielData = yieldCalcRes[0]?.YieldMastersList;

            // const YieldMasterResp = JSON.parse(tempYielData);

            // let updatedSesonType = selectedSoil;
            // let YeildTypeValue = "";

            // if (selectedSoil?.toLowerCase() === "hdps in light soils") {
            //     YeildTypeValue = "High Density Planting (HDPS)";
            //     updatedSesonType = "Light soils";
            // }
            // if (selectedSoil?.toLowerCase() === "hdps in medium soils") {
            //     YeildTypeValue = "High Density Planting (HDPS)";
            //     updatedSesonType = "Medium Soils";
            // }
            // if (selectedSoil?.toLowerCase() === "heavy soils") {
            //     YeildTypeValue = "Normal Population";
            // }
            // if (selectedSoil?.toLowerCase() === "light & medium soils") {
            //     YeildTypeValue = "Normal Population";
            // }

            // const yieldData = {
            //     farmerId: Number.parseInt(getUserID),                            // from seedData
            //     crop: selectedCrop,                                              // from seedData
            //     season: updatedSesonType,                                                      // not in seedData
            //     seasonSoilType: updatedSesonType,                                    // from seedData
            //     varietyTypeOrPlantingSystem: YeildTypeValue,                                 // not in seedData
            //     selectRowTorowSpacingCm: rowSpacing,                             // from seedData
            //     selectPlantToplantSpacingCm: plantSpacing,                       // from seedData
            //     idealPlantPopulationPerAcre: IdealPlantPopulationOrAcre,         // from seedData
            //     cottonSeedRatePktsPerAcre: CottonSeedRate,                       // from seedData
            //     seedRateKgPerAcre: CottonSeedRate,                               // from seedData
            //     areaPlantedAcres: areaToPlanted,                                 // from seedData
            //     totalSeedRequiredKgPerPkt: totalSeedRequired,                    // from seedData
            //     avgBollsPerPlant: "",                                            // not in seedData
            //     avgBollWeight: "",                                               // not in seedData
            //     productiveTillersPer10Hills: "",                                 // not in seedData
            //     avgGrainsPerPannicle: "",                                        // not in seedData
            //     grainYield5Cobs: "",                                             // not in seedData
            //     expectedYieldQtlPerAcre: "",                                     // not in seedData
            //     actualExpectedYieldQtlPerAcre: "",                               // not in seedData
            //     actualSeedRateKgPerAcre: actualSeedRateKgPerAcre,                // from seedData
            //     actualCottonSeedRatePktsPerAcre: actualSeedRateKgPerAcre,        // from seedData (same value)
            //     actualIdealPlantPopulationPerAcre: actualIdealPlantpopulation,   // from seedData
            //     actualTotalSeedRequiredKgPerPkt: actualTotalSeedRequiredKgPerPkt // from seedData
            // };

            // YieldMasterResp.YieldCalculatoroExist = JSON.stringify(yieldData);
            // saveYieldMasterList(YieldMasterResp);
        }
    }

    const showStatus = () => {
        const fields = {
            selectedCrop,
            selectedSoil,
            rowSpacing,
            plantSpacing,
            IdealPlantPopulationOrAcre,
            CottonSeedRate,
            areaToPlanted,
            totalSeedRequired,
        };

        return validateFields(selectedCrop, fields);
    };

    return (
        <View style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }}>
            <View style={styles.flexFull}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

                <View style={[styles.header, { backgroundColor: dynamicStyles.primaryColor }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Image source={require("../../assets/Images/samadhanBackIcon.png")} style={[styles.backIcon, { tintColor: dynamicStyles.secondaryColor }]} />
                    </TouchableOpacity>
                    <Text style={[styles.headerText, { color: dynamicStyles.secondaryColor, fontFamily: fonts.SemiBold }]}>
                        {translate("seed_population_calculator")}
                    </Text>
                </View>


                <ScrollView>
                    <ViewShot ref={viewShotRef} style={styles.viewShot} captureMode="mount" options={{ format: 'jpg', quality: 0.9 }} onCapture={(uri) => console.log("Auto-Captured URI:", uri)}>
                        <View style={styles.contentContainer}>
                            <Text style={[styles.selectCropTextHeader, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}  >
                                {translate("seedPopulationSelectedCrop")}
                            </Text>
                            <CustomFertilizerCalBorderInputDropDown
                                // width={[{ width: '92%' }, styles.centerItems]}
                                defaultValue={selectedCrop != undefined && selectedCrop != translate("select") ? selectedCrop : translate("select")}
                                IsRequired={true}
                                placeholder={translate("seedPopulationSelectedCrop")}
                                onFocus={() => {
                                    changeDropDownData(cropsList, "select crop yield calculator", selectedCrop)
                                    setRetreivedFrmSavedData(false)
                                }}
                            />


                            {selectedCrop !== "" && seasonsalList?.length > 0 && <>
                                <Text style={[styles.selectedCropText5, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}  >
                                    {translate("yieldTwo")}
                                </Text>
                                <CustomFertilizerCalBorderInputDropDown
                                    // width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={selectedSoil != undefined && selectedSoil != translate("select") ? selectedSoil : translate("select")}
                                    IsRequired={true}
                                    placeholder={translate("yieldTwo")}
                                    onFocus={() => {
                                        changeDropDownData(seasonsalList, "Select Season/Soil Type", selectedSoil)
                                        setRetreivedFrmSavedData(false)
                                    }}
                                />
                            </>}

                            <View>


                                {selectedCrop !== "" && listRowSpace?.length !== 0 &&
                                    <>
                                        <Text style={[styles.selectedCropText4, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}  >
                                            {translate("yieldFour")}
                                        </Text>
                                        <CustomFertilizerCalBorderInputDropDown
                                            // width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={rowSpacing != undefined && rowSpacing != translate("select") ? rowSpacing : translate("select")}
                                            value={rowSpacing != undefined && rowSpacing != translate("select") ? rowSpacing : translate("select")}
                                            IsRequired={true}
                                            disabled={listRowSpace.length === 1}

                                            placeholder={translate("yieldFour")}
                                            // onFocus={() => {
                                            //     changeDropDownData(listRowSpace, strings.yieldFour, rowSpacing)
                                            // }}
                                            onFocus={() => {
                                                listRowSpace.length !== 1 && changeDropDownData(listRowSpace, "Select Row to Row Spacing(cms)", rowSpacing)
                                            }}
                                        /></>
                                }
                                {selectedCrop !== "" && PlantToPlantArr?.length !== 0 &&
                                    <>
                                        <Text style={[styles.selectedCropText4, { color: dynamicStyles.textColor, fontFamily: fonts.Regular }]}  >
                                            {translate("yieldFive")}
                                        </Text>
                                        <CustomFertilizerCalBorderInputDropDown
                                            // width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={plantSpacing != undefined && plantSpacing != translate("select") ? plantSpacing : translate("select")}
                                            value={plantSpacing != undefined && plantSpacing != translate("select") ? plantSpacing : translate("select")}
                                            IsRequired={true}
                                            disabled={PlantToPlantArr.length === 1}
                                            placeholder={translate("yieldFive")}
                                            // onFocus={() => {
                                            //     changeDropDownData(PlantToPlantArr, strings.yieldFive, plantSpacing)
                                            // }}
                                            onFocus={() => {
                                                PlantToPlantArr.length !== 1 && changeDropDownData(PlantToPlantArr, "Select Plant to Plant Spacing(cms)", plantSpacing)
                                            }}
                                        /></>
                                }
                                {(PlantToPlantArr?.length === 0 || listRowSpace?.length === 0) ? null : <View style={{ marginTop: 10 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 0, marginTop: 10, marginLeft: 15 }}>
                                        <View style={{ width: "70%" }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, { fontFamily: fonts.Regular, fontSize: RFValue(15, height) }]}  >
                                                {translate("IdealPlantPopulationOrAcre")}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor, fontSize: RFValue(14, 680), fontFamily: fonts.Regular }]}  >
                                            {": "}
                                        </Text>
                                        <Text style={[{ color: IdealPlantPopulationOrAcre ? dynamicStyles.textColor : "grey" }, { fontFamily: fonts.SemiBold, fontSize: RFValue(17, height) }]}  >
                                            {IdealPlantPopulationOrAcre ? IdealPlantPopulationOrAcre : 0}
                                        </Text>
                                    </View>

                                </View>}

                                <View style={[{ marginTop: 10 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: -5, marginTop: 0, marginLeft: 15 }}>
                                        <View style={{ width: "70%" }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, { fontFamily: fonts.Regular, fontSize: RFValue(15, height) }]}  >
                                                {translate("SeedRateKg")}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor, fontSize: RFValue(14, 680), fontFamily: fonts.Regular }]}  >
                                            {":"}
                                        </Text>
                                        <Text numberOfLines={2} style={[{ color: CottonSeedRate ? dynamicStyles.textColor : "grey" }, { width: 80 }, { marginLeft: 3, fontFamily: fonts.SemiBold, fontSize: RFValue(17, height) }]}  >
                                            {CottonSeedRate ? CottonSeedRate : 0}{seedRateUnits != "" && <Text style={{ fontFamily: fonts.Regular, fontSize: RFValue(10, height) }}> {seedRateUnits}</Text>}
                                            {/* {selectedCrop === 'Cotton' ? translate("pkts_acre") : translate("kg_acre")} */}


                                        </Text>
                                    </View>

                                </View>

                                <CustomYieldTextInput
                                    // style={[styles['margin_top_20'], styles['centerItems']]}
                                    labelName={translate("yieldSix")}
                                    IsRequired={false}
                                    maxLength={30}
                                    keyboardType='number-pad'
                                    placeholder={translate("yieldSix")}
                                    value={areaToPlanted}
                                    editable={true}
                                    addSpace={true}
                                    onFocus={() => {
                                    }}
                                    onChangeText={(text) => {
                                        var enteredNumber = text.replace(/[^0-9]/g, '');
                                        setAreaToPlanted(enteredNumber)
                                    }}
                                    onEndEditing={event => { }}
                                />
                                {/* </View> */}


                                <View style={{ marginTop: 10 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 0, marginTop: 15, marginLeft: 15 }}>
                                        <View style={{ width: '42%', }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, { fontFamily: fonts.Regular, fontSize: RFValue(15, height) }]}  >
                                                {/* {strings.totalSeedRequired} */}
                                                {translate("Total_Seed_Required")}
                                            </Text>
                                        </View>

                                        <Text style={[{ color: totalSeedRequired ? dynamicStyles.textColor : "grey" }, { marginLeft: 3, fontFamily: fonts.SemiBold, fontSize: RFValue(17, height) }]}  >
                                            {totalSeedRequired ? totalSeedRequired : 0}{totalSeedRequiredUnits != "" && <Text numberOfLines={2} style={{ fontFamily: fonts.Regular, fontSize: RFValue(13, height) }}> {totalSeedRequiredUnits}</Text>}
                                            {/* {selectedCrop === 'Cotton' ? Number(totalSeedRequired) > 1 ? translate("pkts") :  translate("pkt") :  Number(totalSeedRequired) > 1 ? translate("kgs") : translate("kg")}  */}
                                        </Text>
                                    </View>

                                </View>

                                {
                                    showDropDowns &&
                                    <CustomYieldCalListViewModal
                                        dropDownType={dropDownType}
                                        listItems={dropDownData}
                                        selectedItem={selectedDropDownItem}
                                        onSelectedCropCal={(item) => onSelectItem(item, setSelectedCrop)}
                                        onSelectedSoilType={(item) => onSelectItem(item, setSelectedSoil)}
                                        onSelectedPlantingType={(item) => onSelectItem(item, setVarietyOrPlantingSystem)}
                                        onSelectedRowSpacing={(item) => onSelectItem(item, setRowSpacing)}
                                        onSelectedPlantSpacing={(item) => onSelectItem(item, setPlantSpacing)}
                                        onSelectedAreaToPlanted={(item) => onSelectItem(item, setAreaToPlanted)}
                                        onSelectedAvgBollsPerPlant={(item) => onSelectItem(item, setAvgBollsPerPlant)}
                                        onSelectedsetAvgBollWt={(item) => onSelectItem(item, setAvgBollWt)}
                                        closeModal={() => setShowDropDowns(false)}
                                    />
                                }
                            </View>
                        </View>
                    </ViewShot>
                </ScrollView>
                {/* {roleId != 1 && */}
                <View style={styles.container}>
                    <TouchableOpacity disabled={selectedCrop === ''} onPress={() => {
                        resetValues()
                        setSelectedCrop('')
                    }} style={[styles.button, { backgroundColor: selectedCrop === '' ? 'rgba(255, 255, 255, 1)' : dynamicStyles.secondaryColor, borderColor: selectedCrop === '' ? "grey" : dynamicStyles.primaryColor }]}>
                        <Text style={[styles.buttonText, { color: selectedCrop === '' ? "grey" : dynamicStyles.primaryColor, fontFamily: fonts.Regular }]}>{translate("Clear")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => saveAPI()}

                        disabled={!showStatus()} style={[styles.button, styles.saveButton, { borderColor: !showStatus() ? "grey" : dynamicStyles.primaryColor, backgroundColor: !showStatus() ? "grey" : dynamicStyles.primaryColor, }]}>
                        <Text style={[styles.buttonText, { color: !showStatus() ? "#fff" : dynamicStyles.secondaryColor, fontFamily: fonts.Regular }]}>{translate("save")}</Text>
                    </TouchableOpacity>
                </View>
                {/* } */}


                <TouchableOpacity disabled={!showStatus() || isSharing} onPress={() => takeScreenshot()}
                    style={{ marginVertical: 10, borderRadius: 8, marginBottom: 20, alignItems: "center", justifyContent: "center", alignSelf: "center", height: 50, backgroundColor: !showStatus() ? "#D6D6D6" : dynamicStyles.primaryColor, width: "85%" }}>
                    <Text style={{ textAlign: "center", color: !showStatus() ? "#000" : dynamicStyles.secondaryColor, fontSize: RFValue(14, 680), fontFamily: fonts.Bold }}>{translate("Share")}</Text>
                    <Image source={require("../../assets/Images/whatsAppImgIcon.png")} style={styles.whatsAppIcon} />
                </TouchableOpacity>
                <CustomCommonModal
                    modalVisible={alertModal}
                    modalClose={alertCloseHandle}
                    ErrorText={alertTextContent}
                    ButtonText={translate("ok")}
                    ButtonFun={alertCloseHandle}
                />
                {loading && <PreLoginCustomLoader />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({

    selectCropTextHeader: {
        fontSize: RFValue(15, height),
        top: 5,
        marginBottom: 2.5,
        marginLeft: 15,
        marginTop: 10
    },

    button: {
        width: '45%',
        height: 50,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    buttonText: {
        fontSize: RFValue(13, 680),
    },
    clearButton: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '85%',
        alignSelf: 'center',
    },
    viewShot: {
        width: '100%',
        height: '100%',
    },
    flexFull: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
    headerText: {
        fontSize: RFValue(16, height),
        alignSelf: "center",
        // lineHeight: 30
    },

    backIcon: {
        height: 20,
        width: 34,
        marginTop: 15,
        marginLeft: 10
    },

    contentContainer: {
        backgroundColor: "#fff",
        width: "90%",
        alignSelf: "center",
        elevation: 5,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: responsiveHeight(3),
        paddingBottom: responsiveHeight(3),
    },

    selectedCropText5: {
        marginBottom: 0.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 10
    },

    selectedCropText4: {
        marginBottom: 2.5,
        marginLeft: 15,
        marginTop: 10,
        top: 5,
        fontSize: RFValue(15, height),
    },

    selectedCropText3: {
        marginBottom: 0.5,
        fontWeight: "400",
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 20
    },


    whatsAppIcon: {
        height: 30,
        width: 30,
        resizeMode: "contain",
        position: "absolute",
        right: width * 0.05
    }


});

export default SeedsCalculator;