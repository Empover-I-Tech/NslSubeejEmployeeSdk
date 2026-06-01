import { Platform, Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Dimensions, ToastAndroid } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
// import CustomListViewModal from '../Modals/CustomListViewModal';
import CustomSeedListViewModal from '../components/CustomSeedListViewModal';
import CustomYieldCalListViewModal from '../components/CustomYieldCalListViewModal';
// import CustomTextInput from '../Components/CustomTextInput';
import CustomSeedTextInput from '../components/CustomSeedTextInput';
import CustomYieldTextInput from '../components/CustomYieldCalTextInput';
import CustomFertilizerCalBorderInputDropDown from '../components/CustomFertilizerCalBorderInputDropDown';

import { strings } from '../Localization/StringsCopy';
import SimpleToast from 'react-native-simple-toast';
// import CustomLoader from '../Components/CustomLoader';
// import CustomSuccessLoader from '../Components/CustomSuccessLoader';
// import CustomErrorLoader from '../Components/CustomErrorLoader';
// import { GetApiHeaders, GetApiHeaderswithLoginResponse, GetRequest, PostRequest, getNetworkStatus, uploadFormData } from '../NetworkUtils/NetworkUtils';
import { GetApiHeaders } from '../utils/helpers'
// import { Colors } from '../assets/Utils/Color';
// import { USER_ID, filterObjects, readFileToBase64, requestMultiplePermissions, retrieveData } from '../assets/Utils/Utils';
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
// import CustomBorderInputDropDown from '../Components/CustomBorderInputDropDown';
// import CustomSeedsBorderInputDropDown from '../components/CustomSeedsBorderInputDropDown';
import CustomYieldCalBorderInputDropDown from '../components/CustomYieldCalBorderInputDropDown';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
// import CustomButton from '../Components/CustomButton'
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt'
import usePostRequestWithJwt from "../api/usePostRequestWithJwt"
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from 'react-native-responsive-fontsize';
import { translate } from '../Localization/Localisation';
import { CustomCommonModal } from '../components/CustomCommonModal';
import realm from './realmOffline/realmConfig';
import { v4 as uuidv4 } from 'uuid';
import { useOfflineCalculatorsCRUD } from './realmOffline/useOfflineCalculatorsCRUD';
import { useOfflineSync } from '../utils/syncUtils';
import { useFontStyles } from '../hooks/useFontStyles';
import { ROLDID } from '../utils';
import { getFromAsyncStorage } from '../utils/keychainUtils';
const { width, height } = Dimensions.get('window');


const YieldCalculator = () => {
    const {
        saveYieldMasterList,
        saveYieldCalc,
        getYieldCalc,
        deleteYieldCalc,
        hasYieldCalc,
    } = useOfflineCalculatorsCRUD();
    const fonts=useFontStyles()
    const { incrementOfflineCount, decrementOfflineCount, updateOfflineCount } = useOfflineSync();
    const viewShotRef = useRef();
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const isConnected = useSelector(state => state.network.isConnected);
    const [loaderApi, setLoaderApi] = useState(false)
    const { fetchData } = useGetRequestWithJwt();
    const { postData, error, apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    let [selectedCrop, setSelectedCrop] = useState('')
    let [retreivedFrmSavedData, setRetreivedFrmSavedData] = useState(false)
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
    let [actualIdealPlantPopulationPerAcre, setActualIdealPlantPopulationPerAcre] = useState('')
    let [actualSeedRateKgPerAcre, setActualSeedRateKgPerAcre] = useState('')
    let [actualExpectedYieldQtlPerAcre, setActualExpectedYieldQtlPerAcre] = useState('')
    let [actualTotalSeedRequiredKgPerPkt, setActualTotalSeedRequiredKgPerPkt] = useState('')
    let [yieldNoteDesc, setYieldNoteDesc] = useState('');
    let [GrainYieldListtt, setGrainYieldListtt] = useState([])
    let [AvgBollsPerPlantListtt, setAvgBollsPerPlantListtt] = useState([])
    let [rowSpacing, setRowSpacing] = useState('')
    let [plantSpacing, setPlantSpacing] = useState('')
    const [IdealPlantPopulationOrAcre, setIdealPlantPopulationOrAcre] = useState('')
    let [CottonSeedRate, setCottonSeedRate] = useState('')
    let [areaToPlanted, setAreaToPlanted] = useState('')
    let [areaPlantedArr, setAreaPlantedArr] = useState('')
    let [totalSeedRequired, setTotalSeedRequired] = useState('')
    let [AvgBollsPerPlant, setAvgBollsPerPlant] = useState('')
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
    let [productiveTillers, setProductiveTillers] = useState('')
    let [AvgGrainsPannicle, setAvgGrainsPannicle] = useState('')
    let [totalSeedRequiredUnits, setTotalSeedRequiredUnits] = useState('')
    let [seedRateUnits, setSeedRateUnits] = useState('')
    const [alertModal, setAlertModal] = useState(false)
    const [alertTextContent, setAlertTextContent] = useState("")
    const [isNetAvail, setIsNetAvail] = useState(isConnected)
    const navigation = useNavigation()
    const [roleId,setRoleId]=useState("")

    const roundToNearestInteger = (value) => {
        return Math.round(value).toString();
    };

    const roundAndFormat = (value) => {
        const rounded = Math.round(value);
        return rounded.toFixed(2);
    };

    const getDoubleRoundToNearestInteger = (value) => {
        return Math.round(value);
    };

    const roundToOneDecimalPlace = (value) => {
        return Number(value.toFixed(1)).toString();
    };

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

    const getYieldAndSeedRates = async (crop, selectRowToRowSpacingCm, selectPlantToplantSpacingCm) => {
        try {
            const rowSpacing = parseFloat(selectRowToRowSpacingCm);
            const plantSpacing = parseFloat(selectPlantToplantSpacingCm);

            let idealPlantPopulationPerAcre = 4047 / ((rowSpacing * plantSpacing) / 10000);
            idealPlantPopulationPerAcre = getDoubleRoundToNearestInteger(idealPlantPopulationPerAcre);

            const result = {
                actualIdealPlantPopulationPerAcre: idealPlantPopulationPerAcre.toString(),
                idealPlantPopulationPerAcre: roundToNearestInteger(idealPlantPopulationPerAcre),
            };

            if (crop.toLowerCase() === 'cotton') {
                let cottonSeedRatePktsPerAcre = idealPlantPopulationPerAcre / 5000;
                result.actualCottonSeedRatePktsPerAcre = cottonSeedRatePktsPerAcre.toString();
                result.cottonSeedRatePktsPerAcre = roundToOneDecimalPlace(cottonSeedRatePktsPerAcre);
                result.seedRateUnits = COTTON_SEED_RATE_UNITS;
            } else if (crop.toLowerCase() === 'maize') {
                let seedRateKgPerAcre = idealPlantPopulationPerAcre / 4000;
                result.actualSeedRateKgPerAcre = seedRateKgPerAcre.toString();
                result.seedRateKgPerAcre = roundCustom(seedRateKgPerAcre);
                result.seedRateUnits = OTHER_SEED_RATE_UNITS;
            } else {
                let seedRateKgPerAcre = (idealPlantPopulationPerAcre / 35700) * 1.2;
                result.actualSeedRateKgPerAcre = seedRateKgPerAcre.toString();
                result.seedRateKgPerAcre = roundToOneDecimalPlace(seedRateKgPerAcre);
                result.seedRateUnits = OTHER_SEED_RATE_UNITS;
            }

            return result;
        } catch (error) {
            console.error('Error in getYieldAndSeedRates:', error);
            throw error;
        }
    };

    const getTotalSeedRequiredKgPerPkt = async (crop, cottonSeedRatePktsPerAcre, seedRateKgPerAcre, areaPlantedAcres) => {
        try {
            const areaPlanted = parseFloat(areaPlantedAcres);
            let totalSeedRequiredKgPerPkt;

            if (crop.toLowerCase() === 'cotton') {
                const cottonSeedRate = parseFloat(cottonSeedRatePktsPerAcre);
                totalSeedRequiredKgPerPkt = Math.ceil((cottonSeedRate * areaPlanted) * 2) / 2;
            } else {
                const seedRate = parseFloat(seedRateKgPerAcre);
                totalSeedRequiredKgPerPkt = Math.ceil((seedRate * areaPlanted) * 2) / 2;
            }

            const totalSeedRequiredKgPerPktStr = roundAndFormat(totalSeedRequiredKgPerPkt);
            const totalSeedRequired = parseFloat(totalSeedRequiredKgPerPktStr);

            const result = {
                actualTotalSeedRequiredKgPerPkt: totalSeedRequiredKgPerPkt.toString(),
                totalSeedRequiredKgPerPkt: totalSeedRequiredKgPerPktStr,
                totalSeedRequiredUnits:
                    crop.toLowerCase() === "cotton"
                        ? totalSeedRequired <= 1.0
                            ? COTTON_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                            : COTTON_TOTAL_SEED_REQUIRED_UNITS
                        : totalSeedRequired <= 1.0
                            ? OTHER_TOTAL_SEED_REQUIRED_UNITS_QUANTITY_1
                            : OTHER_TOTAL_SEED_REQUIRED_UNITS,
            };

            return result;
        } catch (error) {
            console.error('Error in getTotalSeedRequiredKgPerPkt:', error);
            throw error;
        }
    };

    const getExpectedYieldQtl = async (
        crop,
        idealPlantPopulationPerAcre,
        productiveTillersPer10Hills,
        avgGrainsPerPannicle,
        avgBollsPerPlant,
        avgBollWeight,
        grainYield5Cobs,
        seasonOrSoilType,
        varietyTypeOrPlantingSystem
    ) => {
        try {
            const idealPlantPopulation = parseFloat(idealPlantPopulationPerAcre);
            let expectedYieldQtlPerAcre;

            if (crop.toLowerCase() === CROP_NAME_COTTON.toLowerCase()) {
                const avgBollsPrPlant = parseFloat(avgBollsPerPlant);
                const avgBollWgt = parseFloat(avgBollWeight);
                expectedYieldQtlPerAcre = (idealPlantPopulation * avgBollsPrPlant * avgBollWgt / 100000) * 0.8;
            } else if (crop.toLowerCase() === 'hybrid rice') {
                const productiveTillers = parseFloat(productiveTillersPer10Hills);
                const avgGrains = parseFloat(avgGrainsPerPannicle);
                if (varietyTypeOrPlantingSystem === 'Basmati/LS- BX-44, X5, X8, Winner') {
                    expectedYieldQtlPerAcre =
                        ((idealPlantPopulation * productiveTillers) / 10) * avgGrains * 25 / 100000000 * 0.8;
                } else {
                    expectedYieldQtlPerAcre =
                        ((idealPlantPopulation * productiveTillers) / 10) * avgGrains * 28 / 100000000 * 0.8;
                }
            } else {
                const grainYield = parseFloat(grainYield5Cobs);
                expectedYieldQtlPerAcre = (idealPlantPopulation * grainYield / 5) * 0.8 / 1000 / 100;
            }

            const expectedYieldQtlPerAcreStr = crop.toLowerCase() === "cotton"
                ? roundToOneDecimalPlace(expectedYieldQtlPerAcre)
                : roundToNearestInteger(expectedYieldQtlPerAcre);

            return {
                actualExpectedYieldQtlPerAcre: expectedYieldQtlPerAcre.toString(),
                expectedYieldQtlPerAcre: expectedYieldQtlPerAcreStr,
            };
        } catch (error) {
            console.error('Error in getExpectedYieldQtl:', error);
            throw error;
        }
    };

    let resetValues = () => {
        //reset values when crop update
        // setRetreivedFrmSavedData(false)
        // these two below conditions 
        // !retreivedFrmSavedData && setSelectedSoil('') 
        // !retreivedFrmSavedData && setVarietyOrPlantingSystem('')
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
        setSeaonsArray()
    }, [selectedCrop])

    const alertCloseHandle = () => {
        if (alertTextContent == translate('submitted_successfully') || alertTextContent == translate('Data_saved_offline')) {
            navigation.goBack()
        }
        setAlertModal(false)
    }

    let setSeaonsArray = () => {
        let a = allSeasonsList;
        let crops = []
        a?.forEach((item) => {
            if (crops?.includes(item.crop)) return
            else crops?.push(item.crop)
        })
        crops?.forEach((crop) => {
            let cropList = a?.filter(item => item.crop === crop);
            cropList?.forEach((item, index) => {
                item.name = item.seasonOrSoilType;
                item.code = `${index + 1}`;
            });
            this[crop.toLowerCase()] = cropList;
        });

        if (selectedCrop !== '') {
            setSeasonsalList(this[selectedCrop?.toLowerCase()]);
        }
    }

    let setArraysList = () => {
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
        // find if single val of row spacing
        let selectedRowSpc = rowSpcLst?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.selectRowToRowSpacingCm;
        // filter objects as per the selection of crop and soil
        let rowSspc = rowSpcLst?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (rowSspc !== undefined && rowSspc.length > 0) {
            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectRowToRowSpacingCm === item.selectRowToRowSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectRowToRowSpacingCm;
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
        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.selectPlantToplantSpacingCm;
        // filter objects as per the selection of crop and soil
        let plantObj = plantoPlanLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
        if (plantObj !== undefined && plantObj.length > 0) {
            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                    item.code = acc.length + 1;
                    item.name = item.selectPlantToplantSpacingCm;
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
        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)?.areaPlantedAcres;
        // filter objects as per the selection of crop and soil
        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil)
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
    }

    useEffect(() => {
        // setRetreivedFrmSavedData(false)
        setArraysList()
    }, [selectedCrop, selectedSoil])

    useEffect(() => {
        if (rowSpacing !== '') {
            // !retreivedFrmSavedData && 
            let plantoPlanLs = plantToPlantList;
            setPlantSpacing('')
            setPlantToPlantArr([])
            // find if single val of row spacing
            let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil && (rowSpacing != null ? item.selectRowToRowSpacingCm == rowSpacing : true))?.selectPlantToplantSpacingCm;
            // filter objects as per the selection of crop and soil
            let plantObj = plantoPlanLs?.filter(item => item.crop === selectedCrop && item.seasonOrSoilType === selectedSoil && (rowSpacing != null ? item.selectRowToRowSpacingCm == rowSpacing : true))
            if (plantObj !== undefined && plantObj.length > 0) {
                plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                    if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                        item.code = acc.length + 1;
                        item.name = item.selectPlantToplantSpacingCm;
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
        if (rowSpacing !== '' && plantSpacing !== '') {
            let areaPlantedValues = areaToPlantedList;
            let grainCobLs = grainYieldCobsList;
            let prdctTillerLs = productiveTillersList;

            // Reset values   
            setAreaToPlanted('');
            setAreaPlantedArr([]);

            // Add varietyOrPlantingSys condition
            let selectedAreaPlantedVal = areaPlantedValues?.find(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )?.areaPlantedAcres;

            // Filter objects based on selection of crop, soil, row spacing, plant spacing, and varietyOrPlantingSys
            let areaToPlantedObj = areaPlantedValues?.filter(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            );

            if (areaToPlantedObj !== undefined && areaToPlantedObj.length > 0) {
                areaToPlantedObj = areaToPlantedObj.reduce((acc, item) => {    // To avoid duplication
                    if (!acc.some(existingItem => existingItem.areaPlantedAcres === item.areaPlantedAcres)) {
                        item.code = acc.length + 1;
                        item.name = item.areaPlantedAcres;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // Set area planted array
                setAreaPlantedArr(areaToPlantedObj);
                if (areaToPlantedObj.length === 1) {
                    // Set direct value if length is 1
                    setAreaToPlanted(selectedAreaPlantedVal);
                }
            }

            setGrainYield('');
            setGrainYieldListtt([]);

            // Add varietyOrPlantingSys condition to find grain yield
            let selectedGrainYieldVal = grainCobLs?.find(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )?.grainYield5Cobs;

            // Filter grain yield objects based on selection of crop, soil, row spacing, plant spacing, and varietyOrPlantingSys
            let grainYieldObj = grainCobLs?.filter(item =>
                item.crop === selectedCrop &&
                item.seasonOrSoilType === selectedSoil &&
                (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            );

            if (grainYieldObj !== undefined && grainYieldObj.length > 0) {
                grainYieldObj = grainYieldObj.reduce((acc, item) => {    // To avoid duplication
                    if (!acc.some(existingItem => existingItem.grainYield5Cobs === item.grainYield5Cobs)) {
                        item.code = acc.length + 1;
                        item.name = item.grainYield5Cobs;
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // Set grain yield array
                setGrainYieldListtt(grainYieldObj);
                if (grainYieldObj.length === 1) {
                    // Set direct value if length is 1
                    setGrainYield(selectedGrainYieldVal);
                }
            }

            //reset values   
            setProductiveTillers('')
            setProductiveTillersListt([])
            // find if single val of row spacing
            let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === selectedCrop
                && item.seasonOrSoilType === selectedSoil
                && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )?.productiveTillersPer10Hills;
            // filter objects as per the selection of crop and soil
            let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === selectedCrop
                && item.seasonOrSoilType === selectedSoil
                && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
            )
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

            callApiRowPlant();
        }
    }, [rowSpacing, plantSpacing, VarietyOrPlantingSystem]);


    useEffect(() => {
        if (CottonSeedRate !== '' && areaToPlanted !== '') {
            // !retreivedFrmSavedData && 
            callApiGETTOTALSEED()
        }
    }, [CottonSeedRate, areaToPlanted])

    useEffect(() => {
        setTimeout(() => {
            let body;
            if (selectedCrop === 'Cotton') {
                if (IdealPlantPopulationOrAcre && AvgBollsPerPlant && AvgBollWt) {
                    body = {
                        "crop": selectedCrop,
                        // 'seasonOrSoilType':selectedSoil,
                        'actualIdealPlantPopulationPerAcre': actualIdealPlantPopulationPerAcre,
                        'avgBollWeight': AvgBollWt,
                        'avgBollsPerPlant': AvgBollsPerPlant,
                        'varietyTypeOrPlantingSystem': VarietyOrPlantingSystem,
                    }
                    // !retreivedFrmSavedData && 
                    callExpctYield(body)
                    return
                }
            }
            if (selectedCrop === 'Maize') {
                if (IdealPlantPopulationOrAcre && GrainYield) {
                    body = {
                        "crop": selectedCrop,
                        // 'seasonOrSoilType':selectedSoil,
                        'actualIdealPlantPopulationPerAcre': actualIdealPlantPopulationPerAcre,
                        'grainYield5Cobs': GrainYield,
                        'varietyTypeOrPlantingSystem': VarietyOrPlantingSystem,
                    }
                    // !retreivedFrmSavedData && 
                    callExpctYield(body)
                    return
                }
            }
            else {
                if (IdealPlantPopulationOrAcre && productiveTillers && AvgGrainsPannicle) {
                    body = {
                        "crop": selectedCrop,
                        // 'seasonOrSoilType':selectedSoil,
                        'actualIdealPlantPopulationPerAcre': actualIdealPlantPopulationPerAcre,
                        'productiveTillersPer10Hills': productiveTillers,
                        'avgGrainsPerPannicle': AvgGrainsPannicle,
                        'varietyTypeOrPlantingSystem': VarietyOrPlantingSystem,
                    }
                    // !retreivedFrmSavedData && 
                    callExpctYield(body)
                    return
                }
            }
        }, 1000)
    }, [IdealPlantPopulationOrAcre, AvgBollsPerPlant, AvgBollWt, productiveTillers, AvgGrainsPannicle, GrainYield, VarietyOrPlantingSystem])



    let saveAPI = async () => {
        // var networkStatus = await getNetworkStatus()
        if (isConnected) {
            try {
                setLoading(true)
                setLoaderApi(true)
                setLoadingMessage(translate("please_wait_getting_data"))
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.saveYieldCalculator;
                var headers = await GetApiHeaders();
                headers['Content-Type'] = 'multipart/form-data'
                delete headers.authType
                headers.applicationName = "subeej"
                var getUserID = headers.userId
                console.log(typeof Number.parseInt(getUserID), "finfkjlsk;sl;sdl=-=-=-=-=>", getUserID)

                // console.log(typeof Number.parseInt(getUserID),"finfkjlsk;sl;sdl=-=-=-=-=>" )
                const jsonData = {
                     "id": getUserID,
                    "farmerId": getUserID,
                    "crop": selectedCrop,
                    "season": selectedSoil,
                    "seasonSoilType": selectedSoil,
                    "varietyTypeOrPlantingSystem": VarietyOrPlantingSystem,
                    "selectRowTorowSpacingCm": rowSpacing,
                    "selectPlantToplantSpacingCm": plantSpacing,
                    "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                    "cottonSeedRatePktsPerAcre": CottonSeedRate,
                    "seedRateKgPerAcre": CottonSeedRate,
                    "areaPlantedAcres": areaToPlanted,
                    "totalSeedRequiredKgPerPkt": totalSeedRequired,
                    "avgBollsPerPlant": AvgBollsPerPlant,
                    "avgBollWeight": AvgBollWt,
                    "productiveTillersPer10Hills": productiveTillers,
                    "avgGrainsPerPannicle": AvgGrainsPannicle,
                    "grainYield5Cobs": GrainYield,
                    "expectedYieldQtlPerAcre": ExpectedYieldQtlPerAcre,
                    "actualExpectedYieldQtlPerAcre": actualExpectedYieldQtlPerAcre,
                    "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre,
                    "actualCottonSeedRatePktsPerAcre": actualSeedRateKgPerAcre,
                    "actualIdealPlantPopulationPerAcre": actualIdealPlantPopulationPerAcre,
                    "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
                    // "farmerId": 202
                };
                const formData = new FormData();
                formData.append('jsonData', JSON.stringify(jsonData));
                console.log(JSON.stringify(jsonData), "formmmmmmmmmmmmmmmmmmmmmmmmmmmdataaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

                const APIResponse = await sendData(url, formData, headers, false);
                console.log("SAVERESPO-=-=-=>", APIResponse)

                // var APIResponse = await PostRequest(getExpctYldURL, getHeaders, body);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoaderApi(false);
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data
                            console.log(dashboardResp, "save apiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii<<<<<<<<<<<<<<<<<<<")
                            setLoadingMessage()
                            //  SimpleToast.show(dashboardResp?.message)


                            const seedCalcRes = realm.objects('YieldMaster');
                            console.log("fetched yield values", seedCalcRes);
                            let data = seedCalcRes[0]?.YieldMastersList;

                            const masterResp = JSON.parse(data); // this is a JS object
                            console.log("master respect", masterResp);

                            const YieldjsonData = {
                                // "id": getUserID,
                                "farmerId": Number.parseInt(getUserID),
                                "crop": selectedCrop,
                                "season": selectedSoil,
                                "seasonSoilType": selectedSoil,
                                "varietyTypeOrPlantingSystem": VarietyOrPlantingSystem,
                                "selectRowTorowSpacingCm": rowSpacing,
                                "selectPlantToplantSpacingCm": plantSpacing,
                                "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                                "cottonSeedRatePktsPerAcre": CottonSeedRate,
                                "seedRateKgPerAcre": CottonSeedRate,
                                "areaPlantedAcres": areaToPlanted,
                                "totalSeedRequiredKgPerPkt": totalSeedRequired,
                                "avgBollsPerPlant": AvgBollsPerPlant,
                                "avgBollWeight": AvgBollWt,
                                "productiveTillersPer10Hills": productiveTillers,
                                "avgGrainsPerPannicle": AvgGrainsPannicle,
                                "grainYield5Cobs": GrainYield,
                                "expectedYieldQtlPerAcre": ExpectedYieldQtlPerAcre,
                                "actualExpectedYieldQtlPerAcre": actualExpectedYieldQtlPerAcre,
                                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre,
                                "actualCottonSeedRatePktsPerAcre": actualSeedRateKgPerAcre,
                                "actualIdealPlantPopulationPerAcre": actualIdealPlantPopulationPerAcre,
                                "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
                                // "farmerId": 202
                            };

                            masterResp.YieldCalculatoroExist = JSON.stringify(YieldjsonData);
                            // let YieldMastersId;
                            // YieldMastersId  = uuidv4();
                            // try {
                            //   realm.write(() => {
                            //     realm.delete(realm.objects('YieldMaster'));
                            //     realm.create('YieldMaster', {
                            //       _id: YieldMastersId,
                            //       YieldMastersList: JSON.stringify(masterResp),
                            //       timestamp: new Date(),
                            //     });
                            //     alert("saved successfully");
                            //   });
                            // } catch (err) {
                            //   console.log(err);
                            // }
                            saveYieldMasterList(masterResp);
                            SimpleToast.show(translate("submitted_successfully"))
                            // setAlertTextContent(translate('submitted_successfully'))
                            // setAlertModal(true)
                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            // Alert.alert(APIResponse?.message)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoaderApi(false);
                        setLoadingMessage()
                        setLoading(false)
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
                    setLoaderApi(false);
                    setLoadingMessage()
                    setLoading(false)
                }, 1000);
            }
        } else {
            setLoaderApi(false);
            setLoadingMessage()
            setLoading(false)
            //   SimpleToast.show(translate("no_internet_conneccted"))

            const seedCalcRes = realm.objects('YieldMaster');
            console.log("fetched yield values", seedCalcRes);
            let data = seedCalcRes[0]?.YieldMastersList;

            const masterResp = JSON.parse(data); // this is a JS object
            var headers = await GetApiHeaders();
            var getUserID = headers.userId
            const jsonData = {
                 "id": getUserID,
                "farmerId": getUserID,
                "crop": selectedCrop,
                "season": selectedSoil,
                "seasonSoilType": selectedSoil,
                "varietyTypeOrPlantingSystem": VarietyOrPlantingSystem,
                "selectRowTorowSpacingCm": rowSpacing,
                "selectPlantToplantSpacingCm": plantSpacing,
                "idealPlantPopulationPerAcre": IdealPlantPopulationOrAcre,
                "cottonSeedRatePktsPerAcre": CottonSeedRate,
                "seedRateKgPerAcre": CottonSeedRate,
                "areaPlantedAcres": areaToPlanted,
                "totalSeedRequiredKgPerPkt": totalSeedRequired,
                "avgBollsPerPlant": AvgBollsPerPlant,
                "avgBollWeight": AvgBollWt,
                "productiveTillersPer10Hills": productiveTillers,
                "avgGrainsPerPannicle": AvgGrainsPannicle,
                "grainYield5Cobs": GrainYield,
                "expectedYieldQtlPerAcre": ExpectedYieldQtlPerAcre,
                "actualExpectedYieldQtlPerAcre": actualExpectedYieldQtlPerAcre,
                "actualSeedRateKgPerAcre": actualSeedRateKgPerAcre,
                "actualCottonSeedRatePktsPerAcre": actualSeedRateKgPerAcre,
                "actualIdealPlantPopulationPerAcre": actualIdealPlantPopulationPerAcre,
                "actualTotalSeedRequiredKgPerPkt": actualTotalSeedRequiredKgPerPkt,
                // "farmerId": 202
            };

            masterResp.YieldCalculatoroExist = JSON.stringify(jsonData);
            // let YieldMastersId;
            // YieldMastersId = uuidv4();
            // try {
            //     realm.write(() => {
            //         realm.delete(realm.objects('YieldMaster'));
            //         realm.create('YieldMaster', {
            //             _id: YieldMastersId,
            //             YieldMastersList: JSON.stringify(masterResp),
            //             timestamp: new Date(),
            //         });
            //     });
            // } catch (err) {
            //     console.log(err);
            // }

            saveYieldMasterList(masterResp);
            const yieldStringfyObject = JSON.stringify(jsonData);
            const saveData = saveYieldCalc(yieldStringfyObject);
            if (saveData) {
                // incrementOfflineCount(1)
                updateOfflineCount()
                setAlertTextContent(translate('Data_saved_offline'))
                setAlertModal(true)
            }

        }
    }

    let callExpctYield = async (bodyDetails) => {
        // var networkStatus = await getNetworkStatus()
        let dashboardResp = await getExpectedYieldQtl(
            selectedCrop,
            actualIdealPlantPopulationPerAcre,
            productiveTillers,
            AvgGrainsPannicle,
            AvgBollsPerPlant,
            AvgBollWt,
            GrainYield,
            selectedSoil,
            VarietyOrPlantingSystem,
        )
        setExpectedYieldQtlPerAcre(dashboardResp?.expectedYieldQtlPerAcre)
        setActualExpectedYieldQtlPerAcre(dashboardResp?.actualExpectedYieldQtlPerAcre)
        return;

        if (isConnected) {
            try {
                setLoading(true)
                setLoadingMessage(translate("please_wait_getting_data"))
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETEXPECTEDYIELDQTL;
                var headers = await GetApiHeaders();
                headers.applicationName = "subeej"
                var payload = bodyDetails;
                // var APIResponse = await sendData(url, headers, body);
                var APIResponse = await sendData(url, payload, headers, false);
                console.log("POSTOAPOAPSOAP=-=-=->", APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data.response
                            console.log(dashboardResp, "////////////////////////////")
                            setLoadingMessage()
                            setExpectedYieldQtlPerAcre(dashboardResp?.expectedYieldQtlPerAcre)
                            setActualExpectedYieldQtlPerAcre(dashboardResp?.actualExpectedYieldQtlPerAcre)
                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            // Alert.alert(APIResponse?.message)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
           // SimpleToast.show(translate("no_internet_conneccted"))
            let dashboardResp = await getExpectedYieldQtl(
                selectedCrop,
                actualIdealPlantPopulationPerAcre,
                productiveTillers,
                AvgGrainsPannicle,
                AvgBollsPerPlant,
                AvgBollWt,
                GrainYield,
                selectedSoil,
                VarietyOrPlantingSystem,
            )
            setExpectedYieldQtlPerAcre(dashboardResp?.expectedYieldQtlPerAcre)
            setActualExpectedYieldQtlPerAcre(dashboardResp?.actualExpectedYieldQtlPerAcre)
        }
    }
    let callApiGETTOTALSEED = async () => {
        // var networkStatus = await getNetworkStatus()

        let dashboardResp = await getTotalSeedRequiredKgPerPkt(selectedCrop, actualSeedRateKgPerAcre, actualSeedRateKgPerAcre, areaToPlanted)
        setTotalSeedRequired(dashboardResp?.totalSeedRequiredKgPerPkt)
        setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
        setActualTotalSeedRequiredKgPerPkt(dashboardResp?.actualTotalSeedRequiredKgPerPkt)
        return;

        if (isConnected) {
            try {
                setLoading(true)
                setLoadingMessage(translate("please_wait_getting_data"))
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETTOTALSEEDREQUIREDKGPERPKT;
                var headers = await GetApiHeaders();
                headers.applicationName = "subeej"
                var payload = selectedCrop === 'Cotton' ? {
                    "crop": selectedCrop,
                    'actualCottonSeedRatePktsPerAcre': actualSeedRateKgPerAcre,
                    "areaPlantedAcres": areaToPlanted
                } : {
                    "crop": selectedCrop,
                    'actualSeedRateKgPerAcre': actualSeedRateKgPerAcre,
                    "areaPlantedAcres": areaToPlanted
                }
                var APIResponse = await sendData(url, payload, headers, false);
                console.log("STEP1-=-=-=-=-=>", APIResponse)
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data.response
                            console.log(dashboardResp, "////////////////////////////")
                            setLoadingMessage()
                            setTotalSeedRequired(dashboardResp?.totalSeedRequiredKgPerPkt)
                            setActualTotalSeedRequiredKgPerPkt(dashboardResp?.actualTotalSeedRequiredKgPerPkt)
                            setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)


                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            // Alert.alert(APIResponse?.message)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
          //  SimpleToast.show(translate("no_internet_conneccted"))
            let dashboardResp = await getTotalSeedRequiredKgPerPkt(selectedCrop, actualSeedRateKgPerAcre, actualSeedRateKgPerAcre, areaToPlanted)
            setTotalSeedRequired(dashboardResp?.totalSeedRequiredKgPerPkt)
            setTotalSeedRequiredUnits(dashboardResp?.totalSeedRequiredUnits)
            setActualTotalSeedRequiredKgPerPkt(dashboardResp?.actualTotalSeedRequiredKgPerPkt)
        }
    }

    let callApiRowPlant = async () => {
        // var networkStatus = await getNetworkStatus()
        let dashboardResp = await getYieldAndSeedRates(selectedCrop, rowSpacing, plantSpacing)
            setActualIdealPlantPopulationPerAcre(dashboardResp?.actualIdealPlantPopulationPerAcre)
            setActualSeedRateKgPerAcre(selectedCrop === 'Cotton' ? dashboardResp?.actualCottonSeedRatePktsPerAcre : dashboardResp?.actualSeedRateKgPerAcre)
            setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantPopulationPerAcre)
            setCottonSeedRate(selectedCrop === 'Cotton' ? dashboardResp?.cottonSeedRatePktsPerAcre : dashboardResp?.seedRateKgPerAcre)
            setSeedRateUnits(dashboardResp?.seedRateUnits)
        return;
        
        if (isConnected) {
            try {

                setLoading(true)
                setLoadingMessage(translate("please_wait_getting_data"))

                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETYIELDANDSEEDRATES;

                var headers = await GetApiHeaders();
                headers.applicationName = "subeej"
                var payload = {
                    "crop": selectedCrop,
                    "selectRowToRowSpacingCm": rowSpacing,
                    "selectPlantToplantSpacingCm": plantSpacing
                }
                var APIResponse = await sendData(url, payload, headers, false);
                console.log("STEP=-=-=>2", APIResponse.data.response)
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data.response
                            console.log(dashboardResp, "////////////////////////////")
                            setLoadingMessage()
                            setActualIdealPlantPopulationPerAcre(dashboardResp?.actualIdealPlantPopulationPerAcre)
                            setActualSeedRateKgPerAcre(selectedCrop === 'Cotton' ? dashboardResp?.actualCottonSeedRatePktsPerAcre : dashboardResp?.actualSeedRateKgPerAcre)
                            setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantPopulationPerAcre)
                            setCottonSeedRate(selectedCrop === 'Cotton' ? dashboardResp?.cottonSeedRatePktsPerAcre : dashboardResp?.seedRateKgPerAcre)
                            setSeedRateUnits(dashboardResp?.seedRateUnits)

                            // setIdealPlantPopulationOrAcre(dashboardResp.idealPlantPopulationPerAcre)
                            // setCottonSeedRate(selectedCrop === 'Cotton' ? dashboardResp.cottonSeedRatePktsPerAcre : dashboardResp.seedRateKgPerAcre)
                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            // Alert.alert(APIResponse?.message)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                        }
                    }, 500);

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1000);
            }
        } else {
            //SimpleToast.show(translate("no_internet_conneccted"))
            let dashboardResp = await getYieldAndSeedRates(selectedCrop, rowSpacing, plantSpacing)
            setActualIdealPlantPopulationPerAcre(dashboardResp?.actualIdealPlantPopulationPerAcre)
            setActualSeedRateKgPerAcre(selectedCrop === 'Cotton' ? dashboardResp?.actualCottonSeedRatePktsPerAcre : dashboardResp?.actualSeedRateKgPerAcre)
            setIdealPlantPopulationOrAcre(dashboardResp?.idealPlantPopulationPerAcre)
            setCottonSeedRate(selectedCrop === 'Cotton' ? dashboardResp?.cottonSeedRatePktsPerAcre : dashboardResp?.seedRateKgPerAcre)
            setSeedRateUnits(dashboardResp?.seedRateUnits)
        }
    }

    const getYieldCalcutlor = async () => {
        // var networkStatus = await getNetworkStatus()
        if (isConnected) {
            try {
                setLoaderApi(true);
                setLoading(true)
                setLoadingMessage(translate("please_wait_getting_data"))

                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETYIELDCALCULATOR;
                var headers = await GetApiHeaders()
                headers.applicationName = "subeej"

                var APIResponse = await fetchData(url, headers);
                console.log("CALLED=-=-=-=-=--=->", APIResponse)

                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        let YieldMastersId;
                        YieldMastersId = uuidv4();
                        var masterResp = APIResponse.data
                        console.log("masterResponse data is", masterResp);
                        saveYieldMasterList(masterResp);
                        // try {
                        //     realm.write(() => {
                        //         realm.delete(realm.objects('YieldMaster'));
                        //         realm.create('YieldMaster', {
                        //             _id: YieldMastersId,
                        //             YieldMastersList: JSON.stringify(masterResp),
                        //             timestamp: new Date(),
                        //         });
                        //         console.log('added successfully into realm yield calc')
                        //     });
                        // } catch (err) {
                        //     console.log(err)
                        // }
                        //  need to add offline masters

                        console.log('the yield resp is================================>', masterResp)
                        if (masterResp != undefined && masterResp != null) {
                            //   setShowCustomActionSheet(false)
                            if (JSON.parse(masterResp.YieldCalculatoroExist).id) {
                                setRetreivedFrmSavedData(true)
                                setTimeout(async () => {
                                    let wholeData = JSON.parse(masterResp?.YieldCalculatoroExist);
                                    console.log(wholeData?.seasonSoilType, 'wholeData?.seasonSoilType', wholeData)
                                    if (wholeData?.seasonSoilType) {
                                        setSelectedCrop(wholeData?.crop);
                                        setSelectedSoil(wholeData?.seasonSoilType);

                                        setSeedRateUnits(wholeData?.seedRateUnits)
                                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)

                                        // setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);
                                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                                        setCottonSeedRate(wholeData?.cottonSeedRatePktsPerAcre);
                                        // setAreaToPlanted(wholeData?.areaPlantedAcres);
                                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                                        setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                                        //set new values start
                                        setActualExpectedYieldQtlPerAcre(wholeData?.actualExpectedYieldQtlPerAcre)
                                        setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                                        setActualIdealPlantPopulationPerAcre(wholeData?.actualIdealPlantPopulationPerAcre)
                                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                                        //end
                                        // setAvgBollWt(wholeData?.avgBollWeight);
                                        // setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                                        // setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                                        // setGrainYield(wholeData?.grainYield5Cobs)
                                        setExpectedYieldQtlPerAcre(wholeData?.expectedYieldQtlPerAcre)
                                        // setYieldNote(masterResp?.yieldCalculatorTitle)
                                        // setYieldNoteDesc(masterResp?.yieldCalculatorDescription)
                                        setYieldNote(translate('Note'))
                                        setYieldNoteDesc(translate('noteDesc'))

                                        // set dropdowns
                                        setYieldCalcRes(masterResp)
                                        let cropLis = masterResp?.cropList
                                        cropLis.forEach((crop, index) => {
                                            crop.name = crop.crop;
                                            delete crop.crop;
                                            crop.code = `crop${index + 1}`;
                                        });
                                        setCropList(cropLis)
                                        setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                                        if (masterResp?.seasonOrSoilTypeList) {
                                            let a = masterResp?.seasonOrSoilTypeList;
                                            let crops = []
                                            a?.forEach((item) => {
                                                if (crops?.includes(item.crop)) return
                                                else crops?.push(item.crop)
                                            })
                                            crops?.forEach((crop) => {
                                                let cropListSeas = a?.filter(item => item.crop === crop);
                                                cropListSeas?.forEach((item, index) => {
                                                    item.name = item.seasonOrSoilType;
                                                    item.code = `${index + 1}`;
                                                });
                                                this[crop.toLowerCase()] = cropListSeas;
                                            });

                                            console.log(selectedCrop !== '', 'selectedCrop !== ', selectedCrop)
                                            if (wholeData?.crop !== '') {
                                                setSeasonsalList(this[wholeData?.crop?.toLowerCase()]);
                                            }
                                        }
                                        setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                                        // set variety or planting system start
                                        let list = masterResp?.varietyOrPlantingSysList;
                                        setListPlantingSystem([])
                                        setVarietyOrPlantingSystem('')
                                        // find if single val of planting system
                                        let selectedVariety = list?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.varietyOrPlantingSys;
                                        // filter objects as per the selection of crop and soil
                                        let ls = list?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        if (ls !== undefined && ls.length > 0) {
                                            ls.forEach((item, index) => {
                                                item.code = index + 1;
                                                item.name = item.varietyOrPlantingSys;
                                            });
                                            // set array of planting system
                                            setListPlantingSystem(ls);
                                            // Only set VarietyOrPlantingSystem if ls length is 1
                                            // if (ls.length === 1) {
                                            //     setVarietyOrPlantingSystem(selectedVariety);
                                            //     return
                                            // } else {
                                            setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);

                                            // }
                                        }
                                        // end
                                        setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                                        //start setting row spacing
                                        let rowSpcLst = masterResp?.selectRowToRowSpacingCmList;
                                        setRowSpacing('')
                                        setListRowSpace([])
                                        // find if single val of row spacing
                                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.selectRowToRowSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        if (rowSspc !== undefined && rowSspc.length > 0) {
                                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectRowToRowSpacingCm === item.selectRowToRowSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectRowToRowSpacingCm;
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
                                        setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                                        let plantoPlanLs = masterResp?.selectPlantToplantSpacingCmList;
                                        // staart setting plant to plant values
                                        setPlantSpacing('')
                                        setPlantToPlantArr([])
                                        // find if single val of row spacing
                                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.selectPlantToplantSpacingCm;
                                        // filter objects as per the selection of crop and soil
                                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        if (plantObj !== undefined && plantObj.length > 0) {
                                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                                if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                                                    item.code = acc.length + 1;
                                                    item.name = item.selectPlantToplantSpacingCm;
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
                                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                                        // filter objects as per the selection of crop and soil
                                        // let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
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
                                        setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                                        // start productive tillers list and value
                                        let prdctTillerLs = masterResp?.productiveTillersPer10HillsList;
                                        //reset values   
                                        setProductiveTillers('')
                                        setProductiveTillersListt([])
                                        // find if single val of row spacing
                                        // let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.productiveTillersPer10Hills;
                                        let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                                            (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
                                        )?.productiveTillersPer10Hills;
                                        // filter objects as per the selection of crop and soil
                                        // let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
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
                                            // if (productiveTillerObj.length === 1) {
                                            //set direct value if length is 1
                                            // setProductiveTillers(selectedProdTillerVal);
                                            // }else
                                            setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                                        }
                                        //end
                                        setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                                        // set avg grains list and value
                                        let avgGrainPannLs = masterResp?.avgGrainsPerPannicleList;
                                        //reset values   
                                        setAvgGrainsPannicle('')
                                        setAvgGrainsPannicleListtt([])
                                        // find if single val of row spacing
                                        let selectedAvgGrainPinnacleVal = avgGrainPannLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgGrainsPerPannicle;
                                        // filter objects as per the selection of crop and soil
                                        // let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
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
                                            // if (avgGrainsPerPannicleObj.length === 1) {
                                            //set direct value if length is 1
                                            // setAvgGrainsPannicle(selectedAvgGrainPinnacleVal);
                                            // } else
                                            setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                                        }
                                        //end
                                        setAvgBollWeightList(masterResp?.avgBollWeightList)
                                        // start setting avg boll weight 
                                        let avgBollWeghtLs = masterResp?.avgBollWeightList;
                                        //reset values   
                                        setAvgBollWt('')
                                        setAvgBollWtListt([])
                                        // find if single val of row spacing
                                        let selectedAvgBollWtVal = avgBollWeghtLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollWeight;
                                        // filter objects as per the selection of crop and soil
                                        // let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
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
                                            // if (avgBollWtObj.length === 1) {
                                            //set direct value if length is 1
                                            //     setAvgBollWt(selectedAvgBollWtVal);
                                            // } else
                                            setAvgBollWt(wholeData?.avgBollWeight);
                                        }
                                        //end
                                        setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                                        // start avg bolls per plant
                                        let avgBollPerPlant = masterResp?.avgBollsPerPlantList;
                                        //reset values   
                                        setAvgBollsPerPlant('')
                                        setAvgBollsPerPlantListtt([])
                                        // find if single val of row spacing
                                        let selectedAvgBollsPerPlantVal = avgBollPerPlant?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollsPerPlant;
                                        // filter objects as per the selection of crop and soil
                                        // let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
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
                                            // if (avgBollsPerPlantObj.length === 1) {
                                            //set direct value if length is 1
                                            // setAvgBollsPerPlant(selectedAvgBollsPerPlantVal);
                                            setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                                            // }
                                        }
                                        //end
                                        setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                                        // start grain yield list
                                        let grainCobLs = masterResp?.grainYield5CobsList;
                                        //reset values   
                                        setGrainYield('')
                                        setGrainYieldListtt([])
                                        // find if single val of row spacing
                                        let selectedGrainYieldVal = grainCobLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.grainYield5Cobs;
                                        // filter objects as per the selection of crop and soil
                                        // let grainYieldObj = grainCobLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                                        let grainYieldObj = grainCobLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                                        )
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
                                            // if (grainYieldObj.length === 1) {
                                            //set direct value if length is 1
                                            // setGrainYield(selectedGrainYieldVal);
                                            setGrainYield(wholeData?.grainYield5Cobs)
                                            // }
                                        }

                                        // end 
                                        // setYieldNote(masterResp?.yieldCalculatorTitle)
                                        // setArraysList()

                                    }
                                }, 100)
                                // selectedRowSpc
                            }
                            // console.log(JSON.parse(masterResp.YieldCalculatoroExist).id,"???",JSON.stringify(masterResp.YieldCalculatoroExist).id)
                            else {
                                setYieldCalcRes(masterResp)
                                let cropLis = masterResp.cropList
                                cropLis.forEach((crop, index) => {
                                    crop.name = crop.crop;
                                    delete crop.crop;
                                    crop.code = `crop${index + 1}`;
                                });
                                setCropList(cropLis)
                                setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                                setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                                setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                                setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                                setAreaPlantedList(masterResp?.areaPlantedAcresList)
                                setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                                setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                                setAvgBollWeightList(masterResp?.avgBollWeightList)
                                setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                                setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                                // setYieldNote(masterResp?.yieldCalculatorTitle)
                                // setYieldNoteDesc(masterResp?.yieldCalculatorDescription)
                                setYieldNote(translate('Note'))
                                        setYieldNoteDesc(translate('noteDesc'))
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
                        setLoadingMessage()
                    }, 500);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setLoaderApi(false);
                    setSuccessLoadingMessage(error.message)
                }, 1000);
                SimpleToast.show(error.message)
            }
        } else {
            setLoading(false)
            setLoaderApi(false);
            setSuccessLoadingMessage("")
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    // useEffect(() => {
    //     getYieldCalc()
    // }, []);


    useFocusEffect(
        React.useCallback(() => {
            let getData = () => {
                if (isNetAvail) {
                    const yieldCalcData = realm.objects('YieldMaster');
                    const YieldArray = Array.from(yieldCalcData);
                    if (YieldArray != undefined && yieldCalcData.length !== 0) {
                        checkRealData()
                    }else{
                        getYieldCalcutlor()
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

    let checkRealData = async () => {
        const yieldCalcData = realm.objects('YieldMaster');
        const YieldArray = Array.from(yieldCalcData);
        if (YieldArray != undefined && yieldCalcData.length !== 0) {

            let data = yieldCalcData[0]?.YieldMastersList;
            const masterResp = JSON.parse(data);
            
            if (JSON.parse(masterResp.YieldCalculatoroExist).crop) {
                setRetreivedFrmSavedData(true)
                setTimeout(async () => {
                    let wholeData = JSON.parse(masterResp?.YieldCalculatoroExist);
                    if (wholeData?.seasonSoilType && wholeData?.areaPlantedAcres) {
                        setSelectedCrop(wholeData?.crop);
                        setSelectedSoil(wholeData?.seasonSoilType);
                        // setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);
                        setRowSpacing(wholeData?.selectRowTorowSpacingCm);
                        setPlantSpacing(wholeData?.selectPlantToplantSpacingCm);
                        setIdealPlantPopulationOrAcre(wholeData?.idealplantPopulationPerAcre)
                        setCottonSeedRate(wholeData?.cottonSeedRatePktsPerAcre);
                        setAreaToPlanted(wholeData?.areaPlantedAcres);
                        setSeedRateUnits(wholeData?.seedRateUnits)
                        setTotalSeedRequiredUnits(wholeData?.totalSeedRequiredUnits)
                        setActualSeedRateKgPerAcre(wholeData?.crop === 'Cotton' ? wholeData?.actualCottonSeedRatePktsPerAcre : wholeData?.actualSeedRateKgPerAcre)
                        setTotalSeedRequired(wholeData?.totalSeedRequiredKgPerPkt);
                        setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                        // setAvgBollWt(wholeData?.avgBollWeight);
                        // setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                        // setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                        // setGrainYield(wholeData?.grainYield5Cobs)
                        setExpectedYieldQtlPerAcre(wholeData?.expectedYieldQtlPerAcre)
                        //set new values start
                        setActualExpectedYieldQtlPerAcre(wholeData?.actualExpectedYieldQtlPerAcre)
                        // setActualSeedRateKgPerAcre(wholeData?.actualSeedRateKgPerAcre)
                        setActualIdealPlantPopulationPerAcre(wholeData?.actualIdealPlantPopulationPerAcre)
                        setActualTotalSeedRequiredKgPerPkt(wholeData?.actualTotalSeedRequiredKgPerPkt)
                        //end
                        // setYieldNote(masterResp?.yieldCalculatorTitle)
                        // setYieldNoteDesc(masterResp?.yieldCalculatorDescription)
                        setYieldNote(translate('Note'))
                                        setYieldNoteDesc(translate('noteDesc'))

                        // set dropdowns
                        setYieldCalcRes(masterResp)
                        let cropLis = masterResp?.cropList
                        cropLis.forEach((crop, index) => {
                            crop.name = crop.crop;
                            delete crop.crop;
                            crop.code = `crop${index + 1}`;
                        });
                        setCropList(cropLis)
                        setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                        if (masterResp?.seasonOrSoilTypeList) {
                            let a = masterResp?.seasonOrSoilTypeList;
                            let crops = []
                            a?.forEach((item) => {
                                if (crops?.includes(item.crop)) return
                                else crops?.push(item.crop)
                            })
                            crops?.forEach((crop) => {
                                let cropListSeas = a?.filter(item => item.crop === crop);
                                cropListSeas?.forEach((item, index) => {
                                    item.name = item.seasonOrSoilType;
                                    item.code = `${index + 1}`;
                                });
                                this[crop.toLowerCase()] = cropListSeas;
                            });

                            console.log(selectedCrop !== '', 'selectedCrop !== ', selectedCrop)
                            if (wholeData?.crop !== '') {
                                setSeasonsalList(this[wholeData?.crop?.toLowerCase()]);
                            }
                        }
                        setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                        // set variety or planting system start
                        let list = masterResp?.varietyOrPlantingSysList;
                        setListPlantingSystem([])
                        setVarietyOrPlantingSystem('')
                        // find if single val of planting system
                        let selectedVariety = list?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.varietyOrPlantingSys;
                        // filter objects as per the selection of crop and soil
                        let ls = list?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                        if (ls !== undefined && ls.length > 0) {
                            ls.forEach((item, index) => {
                                item.code = index + 1;
                                item.name = item.varietyOrPlantingSys;
                            });
                            // set array of planting system
                            setListPlantingSystem(ls);
                            // Only set VarietyOrPlantingSystem if ls length is 1
                            // if (ls.length === 1) {
                            //     setVarietyOrPlantingSystem(selectedVariety);
                            //     return
                            // } else {
                            setVarietyOrPlantingSystem(wholeData?.varietyTypeOrPlantingSystem);

                            // }
                        }
                        // end
                        setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                        //start setting row spacing
                        let rowSpcLst = masterResp?.selectRowToRowSpacingCmList;
                        setRowSpacing('')
                        setListRowSpace([])
                        // find if single val of row spacing
                        let selectedRowSpc = rowSpcLst?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.selectRowToRowSpacingCm;
                        // filter objects as per the selection of crop and soil
                        let rowSspc = rowSpcLst?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)
                        if (rowSspc !== undefined && rowSspc.length > 0) {
                            rowSspc = rowSspc.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectRowToRowSpacingCm === item.selectRowToRowSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectRowToRowSpacingCm;
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

                        setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                        let plantoPlanLs = masterResp?.selectPlantToplantSpacingCmList;
                        // staart setting plant to plant values
                        setPlantSpacing('')
                        setPlantToPlantArr([])
                        // find if single val of row spacing
                        let selectedPlantSpc = plantoPlanLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true))?.selectPlantToplantSpacingCm;
                        // filter objects as per the selection of crop and soil
                        let plantObj = plantoPlanLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true))
                        if (plantObj !== undefined && plantObj.length > 0) {
                            plantObj = plantObj.reduce((acc, item) => {    // to avoid duplication i have used this
                                if (!acc.some(existingItem => existingItem.selectPlantToplantSpacingCm === item.selectPlantToplantSpacingCm)) {
                                    item.code = acc.length + 1;
                                    item.name = item.selectPlantToplantSpacingCm;
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
                        let selectedAreaPlantedVal = areaPlantedValues?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.areaPlantedAcres;
                        // filter objects as per the selection of crop and soil
                        let areaToPlantedObj = areaPlantedValues?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
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
                        setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                        // start productive tillers list and value
                        let prdctTillerLs = masterResp?.productiveTillersPer10HillsList;
                        //reset values  
                        setProductiveTillers('')
                        setProductiveTillersListt([])
                        // find if single val of row spacing
                        let selectedProdTillerVal = prdctTillerLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (rowSpacing != null ? item.selectRowToRowSpacingCm === rowSpacing : true) &&
                            (plantSpacing != null ? item.selectPlantToplantSpacingCm === plantSpacing : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(VarietyOrPlantingSystem) : true)
                        )?.productiveTillersPer10Hills;
                        // filter objects as per the selection of crop and soil
                        let productiveTillerObj = prdctTillerLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
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
                            // if (productiveTillerObj.length === 1) {
                            //set direct value if length is 1
                            // setProductiveTillers(selectedProdTillerVal);
                            // }else
                            setProductiveTillers(wholeData?.productiveTillersPer10Hills);
                        }
                        //end
                        setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                        // set avg grains list and value
                        let avgGrainPannLs = masterResp?.avgGrainsPerPannicleList;
                        //reset values  
                        setAvgGrainsPannicle('')
                        setAvgGrainsPannicleListtt([])
                        // find if single val of row spacing
                        let selectedAvgGrainPinnacleVal = avgGrainPannLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgGrainsPerPannicle;
                        // filter objects as per the selection of crop and soil
                        let avgGrainsPerPannicleObj = avgGrainPannLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
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
                            // if (avgGrainsPerPannicleObj.length === 1) {
                            //set direct value if length is 1
                            // setAvgGrainsPannicle(selectedAvgGrainPinnacleVal);
                            // } else
                            setAvgGrainsPannicle(wholeData?.avgGrainsPerPannicle)
                        }
                        //end
                        setAvgBollWeightList(masterResp?.avgBollWeightList)
                        // start setting avg boll weight
                        let avgBollWeghtLs = masterResp?.avgBollWeightList;
                        //reset values  
                        setAvgBollWt('')
                        setAvgBollWtListt([])
                        // find if single val of row spacing
                        let selectedAvgBollWtVal = avgBollWeghtLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollWeight;
                        // filter objects as per the selection of crop and soil
                        let avgBollWtObj = avgBollWeghtLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
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
                            // if (avgBollWtObj.length === 1) {
                            //set direct value if length is 1
                            //     setAvgBollWt(selectedAvgBollWtVal);
                            // } else
                            setAvgBollWt(wholeData?.avgBollWeight);
                        }
                        //end
                        setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                        // start avg bolls per plant
                        let avgBollPerPlant = masterResp?.avgBollsPerPlantList;
                        //reset values  
                        setAvgBollsPerPlant('')
                        setAvgBollsPerPlantListtt([])
                        // find if single val of row spacing
                        let selectedAvgBollsPerPlantVal = avgBollPerPlant?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.avgBollsPerPlant;
                        // filter objects as per the selection of crop and soil
                        let avgBollsPerPlantObj = avgBollPerPlant?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
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
                            // if (avgBollsPerPlantObj.length === 1) {
                            //set direct value if length is 1
                            // setAvgBollsPerPlant(selectedAvgBollsPerPlantVal);
                            setAvgBollsPerPlant(wholeData?.avgBollsPerPlant)
                            // }
                        }
                        //end
                        setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                        // start grain yield list
                        let grainCobLs = masterResp?.grainYield5CobsList;
                        //reset values  
                        setGrainYield('')
                        setGrainYieldListtt([])
                        // find if single val of row spacing
                        let selectedGrainYieldVal = grainCobLs?.find(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType)?.grainYield5Cobs;
                        // filter objects as per the selection of crop and soil
                        let grainYieldObj = grainCobLs?.filter(item => item.crop === wholeData?.crop && item.seasonOrSoilType === wholeData?.seasonSoilType
                            && (wholeData?.selectRowTorowSpacingCm != null ? item.selectRowToRowSpacingCm == wholeData?.selectRowTorowSpacingCm : true)
                            && (wholeData?.selectPlantToplantSpacingCm != null ? item.selectPlantToplantSpacingCm == wholeData?.selectPlantToplantSpacingCm : true) &&
                            (item.varietyOrPlantingSys ? item.varietyOrPlantingSys.includes(wholeData?.varietyTypeOrPlantingSystem) : true)
                        )
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
                            // if (grainYieldObj.length === 1) {
                            //set direct value if length is 1
                            // setGrainYield(selectedGrainYieldVal);
                            setGrainYield(wholeData?.grainYield5Cobs)
                            // }
                        }

                        // end
                        // setYieldNote(masterResp?.yieldCalculatorTitle)
                        // setArraysList()

                    }
                }, 100)
                // selectedRowSpc
            }else {
                setYieldCalcRes(masterResp)
                let cropLis = masterResp.cropList
                cropLis.forEach((crop, index) => {
                    crop.name = crop.crop;
                    delete crop.crop;
                    crop.code = `crop${index + 1}`;
                });
                console.log(cropLis, "<---------------------- crpo list")
                setCropList(cropLis)
                setAllSeasonsList(masterResp?.seasonOrSoilTypeList)
                setVrtyOrPlntngList(masterResp?.varietyOrPlantingSysList)
                setRowSpacingCmList(masterResp?.selectRowToRowSpacingCmList)
                setPlantToPlantList(masterResp?.selectPlantToplantSpacingCmList)
                setAreaPlantedList(masterResp?.areaPlantedAcresList)
                setProductiveTillersList(masterResp?.productiveTillersPer10HillsList)
                setAgGrainsPerPannicleList(masterResp?.avgGrainsPerPannicleList)
                setAvgBollWeightList(masterResp?.avgBollWeightList)
                setAvgBollsPerPlantList(masterResp?.avgBollsPerPlantList)
                setgrainYieldCobsList(masterResp?.grainYield5CobsList)
                // setYieldNote(masterResp?.yieldCalculatorTitle)
                // setYieldNoteDesc(masterResp?.yieldCalculatorDescription)
                setYieldNote(translate('Note'))
                                        setYieldNoteDesc(translate('noteDesc'))
            }
        }
        else {
            // showAlertWithMessage(translate('oopsNoInternet'), true, true, translate('oopsNoInternetDesc'), false, true, translate('ok'), translate('ok'))
            SimpleToast.show("No internet");
        }
    }



















    // const changeDropDownData = (dropDownData, type, selectedItem) => {
    //     setShowDropDowns(true);
    //     setdropDownData(dropDownData);
    //     setDropDownType(type);
    //     setSelectedDropDownItem(selectedItem);
    // }

    // const onSelectItem = (itemdata, setStateFn) => {
    //     if (itemdata != null) {
    //         setStateFn(itemdata?.name);
    //         setShowDropDowns(false);
    //     }
    // };

    // const takeScreenshot = async () => {
    //     try {
    //         const uri = await viewShotRef.current.capture();
    //         const shareOptions = {
    //             title: 'Share via',
    //             message: `${strings.Note} ${strings.noteDesc}`,
    //             url: uri,
    //             // social: Share.Social.WHATSAPP,
    //         };
    //         Share.open(shareOptions);
    //     } catch (error) {
    //         console.error('Failed to capture screenshot:', error);
    //     }
    // };

    // let showStatus = () => {
    //     if (selectedCrop === 'Cotton') {
    //         return selectedCrop !== '' && selectedSoil !== '' && VarietyOrPlantingSystem !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && AvgBollsPerPlant !== '' && AvgBollWt !== '' && ExpectedYieldQtlPerAcre !== ''
    //     }
    //     if (selectedCrop === 'Maize') {
    //         return selectedCrop !== '' && selectedSoil !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && GrainYield !== '' && ExpectedYieldQtlPerAcre !== ''
    //     }
    //     else {
    //         return selectedCrop !== '' && selectedSoil !== '' && VarietyOrPlantingSystem !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && productiveTillers !== '' && AvgGrainsPannicle !== '' && ExpectedYieldQtlPerAcre !== ''
    //     }
    // }

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
        try {
            const uri = await viewShotRef.current.capture();
            const shareOptions = {
                title: 'Share via',
                message: `${translate("Note")} ${translate("noteDesc")}`,
                url: uri,
                // social: Share.Social.WHATSAPP,
            };
            Share.open(shareOptions);
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
        }
    };

    let showStatus = () => {
        if (selectedCrop === 'Cotton') {
            return selectedCrop !== '' && selectedSoil !== '' && VarietyOrPlantingSystem !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && AvgBollsPerPlant !== '' && AvgBollWt !== '' && ExpectedYieldQtlPerAcre !== ''
        }
        if (selectedCrop === 'Maize') {
            return selectedCrop !== '' && selectedSoil !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && GrainYield !== '' && ExpectedYieldQtlPerAcre !== ''
        }
        else {
            return selectedCrop !== '' && selectedSoil !== '' && VarietyOrPlantingSystem !== '' && rowSpacing !== '' && plantSpacing !== '' && IdealPlantPopulationOrAcre !== '' && CottonSeedRate !== '' && areaToPlanted !== '' && totalSeedRequired !== '' && productiveTillers !== '' && AvgGrainsPannicle !== '' && ExpectedYieldQtlPerAcre !== ''
        }
    }


    return (
        <View style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
            <View style={styles.flexFull}>
                {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}

                <View style={[styles.header, { backgroundColor: dynamicStyles.primaryColor }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Image source={require("../../assets/Images/samadhanBackIcon.png")} style={[styles.backIcon, { tintColor: dynamicStyles.secondaryColor }]} />
                    </TouchableOpacity>
                    <Text style={[styles.headerText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>
                        {translate("yield_calculator")}
                    </Text>
                </View>

                <ScrollView>
                    <ViewShot ref={viewShotRef} style={styles.viewShot} captureMode="mount" options={{ format: 'jpg', quality: 0.9 }} onCapture={(uri) => console.log("Auto-Captured URI:", uri)}>
                        <View style={styles.contentContainer}>
                            <View style={styles.contentSubContainer}>
                                <Text style={[styles.selectedCropText, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                    {translate("selectCrop")}
                                </Text>
                                <CustomFertilizerCalBorderInputDropDown
                                    defaultValue={selectedCrop != undefined && selectedCrop != translate("select") ? selectedCrop : translate("select")}
                                    IsRequired={true}
                                    // disabled={selectedFilter === strings.YieldCalculator}
                                    placeholder={translate("selectCrop")}
                                    onFocus={() => {
                                        changeDropDownData(cropsList, "select crop yield calculator", selectedCrop)
                                        // selectedFilter === strings.TotalSeed &&  changeDropDownData(cropsList, translate("yieldOne"), selectedCrop)
                                        setRetreivedFrmSavedData(false)
                                    }}
                                />
                                <Text style={[styles.selectedCropText2, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                    {translate("yieldTwo")}
                                </Text>
                                <CustomFertilizerCalBorderInputDropDown
                                    defaultValue={selectedSoil != undefined && selectedSoil != translate("select") ? selectedSoil : translate("select")}
                                    IsRequired={true}
                                    // disabled={selectedFilter === strings.YieldCalculator}
                                    placeholder={translate("yieldTwo")}
                                    onFocus={() => {
                                        changeDropDownData(seasonsalList, "Select Season/Soil Type", selectedSoil)
                                        // selectedFilter === strings.TotalSeed && changeDropDownData(seasonsalList, translate("yieldTwo"), selectedSoil)
                                        setRetreivedFrmSavedData(false)
                                    }}
                                />
                                {selectedCrop !== 'Maize' &&
                                    <>
                                        <Text style={[styles.selectedCropText2, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                            {translate("yieldThree")}
                                        </Text>
                                        <CustomFertilizerCalBorderInputDropDown
                                            // width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={VarietyOrPlantingSystem != undefined && VarietyOrPlantingSystem != translate("select") ? VarietyOrPlantingSystem : translate("select")}
                                            IsRequired={true}
                                            disabled={listPlantingSystem.length === 1}
                                            // disabled={selectedFilter === strings.YieldCalculator}
                                            placeholder={translate("yieldThree")}
                                            onFocus={() => {
                                                listPlantingSystem.length !== 1 && changeDropDownData(listPlantingSystem, "Variety Type/Planting System", VarietyOrPlantingSystem)
                                                // changeDropDownData(listPlantingSystem, translate("yieldThree"), VarietyOrPlantingSystem)
                                                // selectedFilter === strings.TotalSeed && changeDropDownData(listPlantingSystem, translate("yieldThree"), VarietyOrPlantingSystem)
                                            }}
                                        />
                                    </>
                                }
                                <Text style={[styles.selectedCropText2, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                    {translate("yieldFour")}
                                </Text>
                                <CustomFertilizerCalBorderInputDropDown
                                    // width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={rowSpacing != undefined && rowSpacing != translate("select") ? rowSpacing : translate("select")}
                                    IsRequired={true}
                                    disabled={listRowSpace.length === 1}
                                    // disabled={selectedFilter === strings.YieldCalculator}
                                    placeholder={translate("yieldFour")}
                                    onFocus={() => {
                                        listRowSpace.length !== 1 && changeDropDownData(listRowSpace, "Select Row to Row Spacing(cms)", rowSpacing)
                                        // changeDropDownData(listRowSpace, translate("yieldFour"), rowSpacing)
                                        // selectedFilter === strings.TotalSeed && changeDropDownData(listRowSpace, translate("yieldFour"), rowSpacing)
                                    }}
                                />
                                <Text style={[styles.selectedCropText2, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                    {translate("yieldFive")}
                                </Text>
                                <CustomFertilizerCalBorderInputDropDown
                                    // width={[{ width: '92%' }, styles['centerItems']]}
                                    defaultValue={plantSpacing != undefined && plantSpacing != translate("select") ? plantSpacing : translate("select")}
                                    IsRequired={true}
                                    disabled={PlantToPlantArr.length === 1}
                                    // disabled={selectedFilter === strings.YieldCalculator}
                                    placeholder={translate("yieldFive")}
                                    onFocus={() => {
                                        PlantToPlantArr.length !== 1 && changeDropDownData(PlantToPlantArr, "Select Plant to Plant Spacing(cms)", plantSpacing)
                                        // changeDropDownData(PlantToPlantArr, translate("yieldFive"), plantSpacing)
                                        // selectedFilter === strings.TotalSeed &&  changeDropDownData(PlantToPlantArr, translate("yieldFive"), plantSpacing)
                                    }}
                                />

                                <View style={{ marginTop: 10, paddingHorizontal: 15, }}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <View style={{ width: '60%' }}>
                                            <Text style={[{ color: dynamicStyles.textColor }, { fontFamily:fonts.Regular,fontSize: RFValue(15, height) }]}  >
                                                {translate("IdealPlantPopulationOrAcre")}
                                            </Text>
                                        </View>
                                        <Text style={[{ color: dynamicStyles.textColor, fontSize: RFValue(14, 680),fontFamily:fonts.Regular }]}  >
                                            {":  "}
                                        </Text>
                                        <Text style={[{ color: IdealPlantPopulationOrAcre ? dynamicStyles.textColor : "grey" }, { fontFamily:fonts.SemiBold,fontSize: RFValue(17, height) }]}  >
                                            {IdealPlantPopulationOrAcre ? IdealPlantPopulationOrAcre : 0}
                                        </Text>
                                    </View>
                                    {/* <CustomYieldTextInput
                                    // style={[styles['margin_top_20'], styles['centerItems']]}
                                    labelName={translate("IdealPlantPopulationOrAcre")}
                                    IsRequired={false}
                                    maxLength={30}
                                    keyboardType='number-pad'
                                    placeholder={translate("IdealPlantPopulationOrAcre")}
                                    value={IdealPlantPopulationOrAcre}
                                    editable={false}
                                    addSpace={true}
                                    onFocus={() => {
                                    }}
                                    onChangeText={(text) => {
                                        var enteredNumber = text.replace(/[^0-9]/g, '');
                                        setIdealPlantPopulationOrAcre(enteredNumber)
                                    }}
                                    onEndEditing={event => { }}
                                /> */}
                                </View>
                            </View>

                            <View>
                                {
                                    //    selectedFilter === strings.TotalSeed && 
                                    <>
                                        <View>
                                            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 15 }}>
                                                <View style={{ width: '60%', }}>
                                                    <Text style={[{ color: dynamicStyles.textColor }, { fontFamily:fonts.Regular, fontSize: RFValue(14, height) }]}  >
                                                        {selectedCrop === 'Cotton' ? translate("Cotton_Seed_Rate") : translate("SeedRateKg")}
                                                    </Text>
                                                </View>
                                                <Text style={[{ color: dynamicStyles.textColor, fontSize: RFValue(14, height),fontFamily:fonts.Regular }]}  >
                                                    {":"}
                                                </Text>
                                                <Text style={[{ color: CottonSeedRate ? dynamicStyles.textColor : "grey" }, {fontFamily:fonts.SemiBold, marginLeft: 10, fontSize: RFValue(17, height) }]}  >{CottonSeedRate ? CottonSeedRate : 0}  <Text style={[{ fontWeight: "400", color: dynamicStyles.textColor, marginLeft: 5, fontSize: RFValue(14, height) },]}  >
                                                    {/* {selectedCrop === 'Cotton' ? 'pkt' : 'kg'} */}
                                                    {seedRateUnits}
                                                </Text>
                                                </Text>
                                            </View>
                                            {/* <CustomYieldTextInput
                                            // style={[styles['margin_top_20'], styles['centerItems']]}
                                            labelName={selectedCrop === 'Cotton' ? translate("Cotton_Seed_Rate") : translate("SeedRateKg")}
                                            IsRequired={false}
                                            maxLength={30}
                                            keyboardType='number-pad'
                                            placeholder={selectedCrop === 'Cotton' ? translate("Cotton_Seed_Rate") : translate("SeedRateKg")}
                                            value={CottonSeedRate}
                                            editable={false}
                                            addSpace={true}
                                            onFocus={() => {
                                            }}
                                            onChangeText={(text) => {
                                                var enteredNumber = text
                                                    .replace(/[^0-9.]/g, '')
                                                    .replace(/(\..*)\./g, '$1');
                                                setCottonSeedRate(enteredNumber)
                                            }}
                                            onEndEditing={event => { }}
                                        /> */}
                                        </View>

                                        {/* <Text style={[styles.selectedCropText3, { color: dynamicStyles.textColor }]}  >
                                        {translate("yieldSix")}
                                    </Text>
                                    <CustomYieldCalBorderInputDropDown
                                        // width={[{ width: '92%' }, styles['centerItems']]}
                                        defaultValue={areaToPlanted != undefined && areaToPlanted != translate("select") ? areaToPlanted : translate("select")}
                                        IsRequired={true}
                                        placeholder={translate("yieldSix")}
                                        onFocus={() => {
                                            changeDropDownData(areaPlantedArr, translate("yieldSix"), areaToPlanted)
                                        }}
                                    /> */}
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
                                        <View style={{ marginTop: 10 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: -1, marginTop: 15, marginLeft: 15 }}>
                                                {/* <View style={{ width: '60%' }}> */}
                                                <Text style={[{ color: dynamicStyles.textColor }, { fontSize: RFValue(14, height), fontFamily:fonts.Regular }]}  >
                                                    {translate("totalSeedRequired")}
                                                </Text>
                                                {/* </View> */}
                                                <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, fontSize: RFValue(14, height),fontFamily:fonts.Regular }]}  >
                                                    {": "}
                                                </Text>
                                                <Text style={[{ color: totalSeedRequired ? dynamicStyles.textColor : "grey" }, {fontFamily:fonts.SemiBold, marginLeft: 10, fontSize: RFValue(17, height) }]}  >
                                                    {totalSeedRequired ? totalSeedRequired : 0}
                                                </Text>
                                                <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, fontSize: RFValue(14, height),fontFamily:fonts.Regular },]}  >
                                                    {/* {selectedCrop === 'Cotton' ? 'pkt' : 'kg'} */}
                                                    {totalSeedRequiredUnits}
                                                </Text>
                                            </View>

                                            {/* <CustomYieldTextInput
                                            // style={[styles['margin_top_20'], styles['centerItems']]}
                                            labelName={translate("totalSeedRequired")}
                                            IsRequired={false}
                                            maxLength={30}
                                            keyboardType='number-pad'
                                            placeholder={translate("totalSeedRequired")}
                                            value={totalSeedRequired}
                                            editable={false}
                                            addSpace={true}
                                            onFocus={() => {
                                            }}
                                            onChangeText={(text) => {
                                                var enteredNumber = text.replace(/[^0-9]/g, '');
                                                setTotalSeedRequired(enteredNumber)
                                            }}
                                            onEndEditing={event => { }}
                                        /> */}
                                        </View>
                                    </>}

                                {/* {selectedCrop === 'Cotton' ? selectedFilter !== strings.TotalSeed && <View> */}
                                {selectedCrop === 'Cotton' ? <View>
                                    <Text style={[styles.selectedCropText4, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                        {translate("AvgBollsPerPlant")}
                                    </Text>
                                    <CustomFertilizerCalBorderInputDropDown
                                        // width={[{ width: '92%' }, styles['centerItems']]}
                                        defaultValue={AvgBollsPerPlant != undefined && AvgBollsPerPlant != translate("select") ? AvgBollsPerPlant : translate("select")}
                                        IsRequired={true}
                                        disabled={AvgBollsPerPlantListtt.length === 1}
                                        placeholder={translate("AvgBollsPerPlant")}
                                        onFocus={() => {
                                            // changeDropDownData(AvgBollsPerPlantListtt, translate("AvgBollsPerPlant"), AvgBollsPerPlant)
                                            AvgBollsPerPlantListtt.length !== 1 && changeDropDownData(AvgBollsPerPlantListtt, "Avg Bolls per plant(Count on 10plants)", AvgBollsPerPlant)
                                        }}
                                    />
                                    <Text style={[styles.selectedCropText5, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                        {translate("AvgBollWt")}
                                    </Text>
                                    <CustomFertilizerCalBorderInputDropDown
                                        // width={[{ width: '92%' }, styles['centerItems']]}
                                        defaultValue={AvgBollWt != undefined && AvgBollWt != translate("select") ? AvgBollWt : translate("select")}
                                        IsRequired={true}
                                        placeholder={translate("AvgBollWt")}
                                        disabled={AvgBollWtListt.length === 1}
                                        onFocus={() => {
                                            AvgBollWtListt.length !== 1 && changeDropDownData(AvgBollWtListt, "Avg Boll wt(Weight 5 bolls per Plant on 5 Plants)", AvgBollWt)
                                        }}
                                    />
                                </View> : selectedCrop === 'Maize' ?
                                    // </View> : selectedCrop === 'Maize' ? selectedFilter !== strings.TotalSeed &&
                                    <View>
                                        <Text style={[styles.selectedCropText4, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                            {translate("GrainYield")}
                                        </Text>
                                        <CustomFertilizerCalBorderInputDropDown
                                            // width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={GrainYield != undefined && GrainYield != translate("select") ? GrainYield : translate("select")}
                                            IsRequired={true}
                                            placeholder={translate("GrainYield")}
                                            disabled={GrainYieldListtt.length === 1}
                                            onFocus={() => {
                                                GrainYieldListtt.length !== 1 && changeDropDownData(GrainYieldListtt, "Grain yield (5cobs)", GrainYield)
                                            }}
                                        />
                                    </View>
                                    : <View>
                                        {/* : selectedFilter !== strings.TotalSeed && <View> */}
                                        <Text style={[styles.selectedCropText4, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                            {translate("productiveTillers")}
                                        </Text>
                                        <CustomFertilizerCalBorderInputDropDown
                                            // width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={productiveTillers != undefined && productiveTillers != translate("select") ? productiveTillers : translate("select")}
                                            IsRequired={true}
                                            placeholder={translate("productiveTillers")}
                                            disabled={productiveTillersListt.length === 1}
                                            onFocus={() => {
                                                productiveTillersListt.length !== 1 && changeDropDownData(productiveTillersListt, "Total number of productive tillers on 10 hills", productiveTillers)
                                            }}
                                        />
                                        <Text style={[styles.selectedCropText5, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                            {translate("AvgGrainsPannicle")}
                                        </Text>
                                        <CustomFertilizerCalBorderInputDropDown
                                            // width={[{ width: '92%' }, styles['centerItems']]}
                                            defaultValue={AvgGrainsPannicle != undefined && AvgGrainsPannicle != translate("select") ? AvgGrainsPannicle : translate("select")}
                                            IsRequired={true}
                                            placeholder={translate("AvgGrainsPannicle")}
                                            disabled={AvgGrainsPannicleListtt.length === 1}
                                            onFocus={() => {
                                                AvgGrainsPannicleListtt.length !== 1 && changeDropDownData(AvgGrainsPannicleListtt, "Avg grains per pannicle (Count on 10 pannicles)", AvgGrainsPannicle)
                                            }}
                                        />
                                    </View>}

                                {
                                    //    selectedFilter !== strings.TotalSeed && 
                                    <View style={{ marginTop: 10 }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 15, marginTop: 10 }}>
                                            {/* <View style={{ width: '62%' }}> */}
                                            <Text style={[{ color: dynamicStyles.textColor }, { fontSize: RFValue(14, height), fontFamily:fonts.Regular }]}  >
                                                {translate("ExpectedYieldQtlPerAcre")}
                                            </Text>
                                            {/* </View> */}
                                            <Text style={[{ color: dynamicStyles.textColor, marginLeft: 5, fontSize: RFValue(14, height),fontFamily:fonts.Regular }]}  >
                                                {": "}
                                            </Text>
                                            <Text style={[{ color: ExpectedYieldQtlPerAcre ? dynamicStyles.textColor : "grey" }, {fontFamily:fonts.SemiBold, marginLeft: 10, fontSize: RFValue(17, height) }]}  >
                                                {ExpectedYieldQtlPerAcre ? ExpectedYieldQtlPerAcre : 0}
                                            </Text>
                                        </View>
                                        {/* <CustomYieldTextInput
                                        // style={[styles['margin_top_20'], styles['centerItems']]}
                                        labelName={translate("ExpectedYieldQtlPerAcre")}
                                        IsRequired={false}
                                        maxLength={30}
                                        keyboardType='number-pad'
                                        placeholder={translate("ExpectedYieldQtlPerAcre")}
                                        value={ExpectedYieldQtlPerAcre}
                                        editable={false}
                                        addSpace={true}
                                        onFocus={() => {
                                        }}
                                        onChangeText={(text) => {
                                            var enteredNumber = text
                                                .replace(/[^0-9.]/g, '')
                                                .replace(/(\..*)\./g, '$1');
                                            setExpectedYieldQtlPerAcre(enteredNumber)
                                        }}
                                        onEndEditing={event => { }}
                                    /> */}
                                    </View>}
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
                                        onSelectedGrainYield={(item) => onSelectItem(item, setGrainYield)}
                                        onSelectedProductiveTillers={(item) => onSelectItem(item, setProductiveTillers)}
                                        onSelectedAvgGrainsPannicle={(item) => onSelectItem(item, setAvgGrainsPannicle)}

                                        closeModal={() => setShowDropDowns(false)}
                                    />
                                }
                                <Text style={[styles.selectedCropText6, { color: dynamicStyles.textColor ,fontFamily:fonts.Regular}]}  >
                                    {yieldNote}
                                </Text>
                                <Text style={[styles.selectedCropText7, { color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                    {yieldNoteDesc}
                                </Text>
                            </View>

                        </View>
                    </ViewShot>
                </ScrollView>
                {roleId != 1 &&
                    <View style={styles.container}>
                        <TouchableOpacity disabled={selectedCrop === ''} onPress={() => {
                            resetValues()
                            setSelectedCrop('')
                        }} style={[styles.button, { backgroundColor: selectedCrop === '' ? 'rgba(255, 255, 255, 1)' : dynamicStyles.secondaryColor, borderColor: selectedCrop === '' ? "grey" : dynamicStyles.primaryColor }]}>
                            <Text style={[styles.buttonText, { color: selectedCrop === '' ? "grey" : dynamicStyles.primaryColor, fontFamily: fonts.Regular }]}>{translate("Clear")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { saveAPI() }}

                            disabled={!showStatus()} style={[styles.button, styles.saveButton, { borderColor: !showStatus() ? "grey" : dynamicStyles.primaryColor, backgroundColor: !showStatus() ? "grey" : dynamicStyles.primaryColor, }]}>
                            <Text style={[styles.buttonText, { color: !showStatus() ? "#fff" : dynamicStyles.secondaryColor, fontFamily: fonts.Regular }]}>{translate("save")}</Text>
                        </TouchableOpacity>
                    </View>
                }

                {/* <TouchableOpacity style={{borderRadius:10,justifyContent:"center",alignItems:"center",width:"85%",height:45,alignSelf:"center",marginVertical:10,backgroundColor:!showStatus()?"grey":dynamicStyles.primaryColor}} disabled={!showStatus()} onPress={() => { takeScreenshot() }}>
                <Text style={{fontSize:RFValue(14,680),color:!showStatus() ? "#fff" : dynamicStyles.secondaryColor,textAlign:"center"}}>{strings.Share}</Text>
            </TouchableOpacity> */}
                <TouchableOpacity disabled={!showStatus()} onPress={() => takeScreenshot()}
                    style={{ marginVertical: 10, borderRadius: 8, marginBottom: 20, alignItems: "center", justifyContent: "center", alignSelf: "center", height: 50, backgroundColor: !showStatus() ? "#D6D6D6" : dynamicStyles.primaryColor, width: "85%" }}>
                    <Text style={{ textAlign: "center", color: !showStatus() ? "#000" : dynamicStyles.secondaryColor, fontSize: RFValue(14, 680), fontFamily:fonts.Bold }}>{translate("Share")}</Text>
                    <Image source={require("../../assets/Images/whatsAppImgIcon.png")} style={styles.whatsAppIcon} />
                </TouchableOpacity>
                {/* <CustomButton shouldDisable={!showStatus()} title={strings.Share} onPress={() => { takeScreenshot() }}
                addIcon={showStatus()}
                buttonBg={!showStatus() ? Colors.lightGray : dynamicStyles.primaryColor}
                titleTextColor={!showStatus() ? Colors.white : dynamicStyles.secondaryColor}
                btnWidth={'85%'}
                textAlign='center' /> */}
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
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '85%',
        alignSelf: 'center',
    },
    tabTxt: {fontSize: 14, fontWeight: "500" },
    tabBtn: { width: "50%", height: "100%", borderRadius: 5, alignItems: "center", justifyContent: "center" },
    tabMain: {
        height: 45, width: responsiveWidth(90), alignSelf: "center", marginTop: responsiveHeight(2), borderRadius: 5, marginBottom: responsiveHeight(0.5),
        flexDirection: "row", alignItems: "center", justifyContent: "space-between"
    },
    button: {
        width: '45%',
        borderRadius: 8,
        height: 50,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    clearButton: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        // ,
    },
    saveButton: {
        // 
        // 
    },
    buttonText: {
        fontSize: 14,
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

    contentSubContainer: {
        // borderWidth: 1,
        // borderColor: 'rgba(180, 180, 180, 0.5)',
        width: '100%',
        // alignSelf: "center",
        // borderRadius: 10,
        paddingTop: 10,
        // paddingBottom: 20,
        marginTop: 15,
    },

    selectedCropText: {
        marginBottom: 2.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
    },

    selectedCropText2: {
        marginBottom: 2.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5
    },

    selectedCropText3: {
        marginBottom: 0.5,
        fontWeight: "400",
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 20
    },

    selectedCropText4: {
        marginBottom: 0.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 15
    },

    selectedCropText5: {
        marginBottom: 0.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 10
    },

    selectedCropText6: {
        marginBottom: 2.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 20
    },

    selectedCropText7: {
        marginBottom: 2.5,
        marginLeft: 15,
        fontSize: RFValue(15, height),
        top: 5,
        marginTop: 5,
        width: "90%",
        textAlign: "left"
    },

    whatsAppIcon: {
        height: 30,
        width: 30,
        resizeMode: "contain",
        position: "absolute",
        right: width * 0.05
    }

});

export default YieldCalculator;