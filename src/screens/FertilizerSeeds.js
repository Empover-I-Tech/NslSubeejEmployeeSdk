import { Platform, Dimensions,Text, StatusBar, View, Alert, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import CustomFertilizerCalListViewModal from '../components/CustomFertilizerCalListViewModal';
import { strings } from '../Localization/StringsCopy';
import SimpleToast from 'react-native-simple-toast';
import APIConfig, { HTTP_OK } from '../api/APIConfig'
import { GetApiHeaders } from '../utils/helpers'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomFertilizerCalBorderInputDropDown from '../components/CustomFertilizerCalBorderInputDropDown';
import CustomFertilizerCalBorderInputDropDownCopy from '../components/CustomFertilizerCalBorderInputDropDownCopy';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt'
import usePostRequestWithJwt from "../api/usePostRequestWithJwt"
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { RFValue } from 'react-native-responsive-fontsize';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { translate } from '../Localization/Localisation';
import { CustomCommonModal } from '../components/CustomCommonModal';
import { useOfflineCalculatorsCRUD } from './realmOffline/useOfflineCalculatorsCRUD';
import { useFontStyles } from '../hooks/useFontStyles';
import realm from './realmOffline/realmConfig';

const { width, height } = Dimensions.get('window');

const FertilizerCalculator = ({ route }) => {
    const fonts=useFontStyles()
    const {fertilizerMasterList,fertilizerMasterList2,saveFertilizerCalc} = useOfflineCalculatorsCRUD();
    const viewShotRef = useRef();
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
    const isConnected = useSelector(state => state.network.isConnected);
    const { fetchData } = useGetRequestWithJwt();
    const { postData, error, apiError, postStatusCode, sendData, clearPostData } = usePostRequestWithJwt();
    const [dropDownData, setdropDownData] = useState();
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
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
    let [apiHit, setApiHit] = useState(false)
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
    let [AtthetimeNPK, setAtthetimeNPK] = useState('')
    let [atTheTimeUrea, setAtTheTimeUrea] = useState('')
    let [FirstDose, setFirstDose] = useState('')
    let [FirstDoseUrea, setFirstDoseUrea] = useState('')
    let [secondDoseNPK, setsecondDoseNpk] = useState('')
    let [secondDoseUrea, setsecondDoseUrea] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [loaderImage, setLoaderImage] = useState("")
    const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
    let [yieldCalcRes, setYieldCalcRes] = useState(null)
    let [cropsList, setCropList] = useState(null)
    let [seasonsalList, setSeasonsalList] = useState(null)
    let [allSeasonsList, setAllSeasonsList] = useState(null)
    const [dapAtSowing, setDapAtSowing] = useState('')
    const [mopAtSowing, setMopAtSowing] = useState('')
    const [mopSecondDose, setMopSecondDose] = useState('')
    const [sulphurSecondDose, setSulphurSecondDose] = useState('')
    const [zincSulphateSecondDose, setZincSulphateSecondDose] = useState('')
    const [sulphurAtSowing, setSulphurAtSowing] = useState('')
    const [zincSulphateAtSowing, setZincSulphateAtSowing] = useState('')
    let [renderContent, setRenderContent] = useState(false)
      const [alertModal, setAlertModal] = useState(false)
      const [alertTextContent, setAlertTextContent] = useState("")
      let [masterData,setMasterData] = useState(null)
    const navigation = useNavigation()
    let resetValues = () => {
        setSelectedSoil('')
        setSeasonsalList(null)
        setDapAtSowing('')
        setMopAtSowing('')
        setMopSecondDose('')
        setSulphurAtSowing('')
        setSulphurSecondDose('')
        setZincSulphateAtSowing('')
        setZincSulphateSecondDose('')
        setAtthetimeNPK('')
        setFirstDose('')
        setsecondDoseNpk('')
        setAtTheTimeUrea('')
        setFirstDoseUrea('')
        setsecondDoseUrea('')
        setRenderContent(false)
    }
    
        useEffect(() => {
            resetValues()
            let a = allSeasonsList;
            let crops = []
            a?.forEach((item) => {
                if (crops?.includes(item.crop)) return
                else crops?.push(item.crop)
            })
            let cropsDataNw = {};
            crops?.forEach((crop) => {
                let cropList = a?.filter(item => item.crop === crop);
                cropList?.forEach((item, index) => {
                    item.name = item.seasonSoilType;
                    item.code = `${index + 1}`;
                });
                // this[crop.toLowerCase()] = cropList;
                cropsDataNw[crop.toLowerCase()] = cropList;
            });
    
            if (selectedCrop !== '') {
                if (cropsDataNw[selectedCrop.toLowerCase()]?.length === 1) {
                    setSelectedSoil(cropsDataNw[selectedCrop.toLowerCase()][0].seasonSoilType);
                } else {
                    setSelectedSoil('');
                }
                setSeasonsalList(cropsDataNw[selectedCrop.toLowerCase()]);
            }
                 
        }, [selectedCrop])
    
        useEffect(() => {
            if(selectedCrop !== '' && selectedSoil !== ''){
                getOtherDetails()
            }
        }, [selectedCrop,selectedSoil])



    let getOtherDetails = async () => {
        const fertiliserDataMaster = realm.objects('FertilizerMaster2');
        if (fertiliserDataMaster.length !== 0) {
            let data = fertiliserDataMaster[0];
            console.log("mixing values are",data);
            const masterResp = JSON.parse(data?.FertilizerMastersList2); // this one might be correct if the schema is different
           console.log("fixed values are",masterResp);
            setMasterData(masterResp);
          
        let fertiliserData = masterResp.fretilizerCalData
        console.log(fertiliserData, "datatatatatatatt")
        let fertilisedData = fertiliserData.filter((item) => {
            return item.crop.toLowerCase() === selectedCrop.toLowerCase() && item.seasonSoilType.toLowerCase() === selectedSoil.toLowerCase()
        })
        if (fertilisedData.length > 0) {
            let FertiliseLs = fertilisedData[0]
            setDapAtSowing(FertiliseLs?.dapAtSowing ? FertiliseLs?.dapAtSowing : translate('dataUnavailable'))
            setMopAtSowing(FertiliseLs?.mopAtSowing ? FertiliseLs?.mopAtSowing : translate('dataUnavailable'))
            setMopSecondDose(FertiliseLs?.mopSecondDose ? FertiliseLs?.mopSecondDose : translate('dataUnavailable'))
            setSulphurAtSowing(FertiliseLs?.sulphurAtSowing ? FertiliseLs?.sulphurAtSowing : translate('dataUnavailable'))
            setSulphurSecondDose(FertiliseLs?.sulphurSecondDose ? FertiliseLs?.sulphurSecondDose : translate('dataUnavailable'))
            setZincSulphateAtSowing(FertiliseLs?.zincSulphateAtSowing ? FertiliseLs?.zincSulphateAtSowing : translate('dataUnavailable'))
            setZincSulphateSecondDose(FertiliseLs?.zincSulphateSecondDose ? FertiliseLs?.zincSulphateSecondDose : translate('dataUnavailable'))
            setAtthetimeNPK(FertiliseLs?.npk10_26_26_AtSowing ? FertiliseLs?.npk10_26_26_AtSowing : translate('dataUnavailable'))
            setFirstDose(FertiliseLs?.npk10_26_26_First_Dose ? FertiliseLs?.npk10_26_26_First_Dose : translate('dataUnavailable'))
            setsecondDoseNpk(FertiliseLs?.npk10_26_26_Second_Dose ? FertiliseLs?.npk10_26_26_Second_Dose : translate('dataUnavailable'))
            setAtTheTimeUrea(FertiliseLs?.ureaAtSowing ? FertiliseLs?.ureaAtSowing : translate('dataUnavailable'))
            setFirstDoseUrea(FertiliseLs?.ureaFirstDose ? FertiliseLs?.ureaFirstDose : translate('dataUnavailable'))
            setsecondDoseUrea(FertiliseLs?.ureaSecondDose ? FertiliseLs?.ureaSecondDose : translate('dataUnavailable'))
            setRenderContent(true)
        } else {
            setSelectedSoil('')
            setDapAtSowing(translate('dataUnavailable'))
            setMopAtSowing(translate('dataUnavailable'))
            setMopSecondDose(translate('dataUnavailable'))
            setSulphurAtSowing(translate('dataUnavailable'))
            setSulphurSecondDose(translate('dataUnavailable'))
            setZincSulphateAtSowing(translate('dataUnavailable'))
            setZincSulphateSecondDose(translate('dataUnavailable'))
            setAtthetimeNPK(translate('dataUnavailable'))
            setFirstDose(translate('dataUnavailable'))
            setsecondDoseNpk(translate('dataUnavailable'))
            setAtTheTimeUrea(translate('dataUnavailable'))
            setFirstDoseUrea(translate('dataUnavailable'))
            setsecondDoseUrea(translate('dataUnavailable'))
        }
    }

        return;
    
        if (!isConnected) {
            try {
                setRenderContent(false)
                setLoading(true)
                setLoadingMessage(translate("please_wait_getting_data"))
                var url = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.getFertilizerDropdownValuesBySelectedData;
                var headers = await GetApiHeaders();
                // delete headers.authType
                headers.applicationName = "subeej"

                var payload = {
                    "crop": selectedCrop,
                    "SeasonSoilType": selectedSoil
                }
                var APIResponse = await sendData(url, payload, headers, false);
                console.log("SAIKIRASTEP_1=-=-=->",APIResponse)

                // var APIResponse = await PostRequest(getTotalSeedReqURL, getHeaders, body);
                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    setTimeout(() => {
                        if (APIResponse.statusCode == HTTP_OK) {
                            var dashboardResp = APIResponse.data.response
                            let FertiliseLs = dashboardResp.FertilizerDetails[0]
                            if (dashboardResp.FertilizerDetails.length > 0) {
                                setDapAtSowing(FertiliseLs?.dapAtSowing ? FertiliseLs?.dapAtSowing : translate("dataUnavailable"))
                                setMopAtSowing(FertiliseLs?.mopAtSowing ? FertiliseLs?.mopAtSowing : translate("dataUnavailable"))
                                setMopSecondDose(FertiliseLs?.mopSecondDose ? FertiliseLs?.mopSecondDose : translate("dataUnavailable"))
                                setSulphurAtSowing(FertiliseLs?.sulphurAtSowing ? FertiliseLs?.sulphurAtSowing : translate("dataUnavailable"))
                                setSulphurSecondDose(FertiliseLs?.sulphurSecondDose ? FertiliseLs?.sulphurSecondDose : translate("dataUnavailable"))
                                setZincSulphateAtSowing(FertiliseLs?.zincSulphateAtSowing ? FertiliseLs?.zincSulphateAtSowing : translate("dataUnavailable"))
                                setZincSulphateSecondDose(FertiliseLs?.zincSulphateSecondDose ? FertiliseLs?.zincSulphateSecondDose : translate("dataUnavailable"))
                                setAtthetimeNPK(FertiliseLs?.npk10_26_26_AtSowing ? FertiliseLs?.npk10_26_26_AtSowing : translate("dataUnavailable"))
                                setFirstDose(FertiliseLs?.npk10_26_26_First_Dose ? FertiliseLs?.npk10_26_26_First_Dose : translate("dataUnavailable"))
                                setsecondDoseNpk(FertiliseLs?.npk10_26_26_Second_Dose ? FertiliseLs?.npk10_26_26_Second_Dose : translate("dataUnavailable"))
                                setAtTheTimeUrea(FertiliseLs?.ureaAtSowing ? FertiliseLs?.ureaAtSowing : translate("dataUnavailable"))
                                setFirstDoseUrea(FertiliseLs?.ureaFirstDose ? FertiliseLs?.ureaFirstDose : translate("dataUnavailable"))
                                setsecondDoseUrea(FertiliseLs?.ureaSecondDose ? FertiliseLs?.ureaSecondDose : translate("dataUnavailable"))
                                setRenderContent(true)
                            } else {
                                setSelectedSoil('')
                                setDapAtSowing(translate("dataUnavailable"))
                                setMopAtSowing(translate("dataUnavailable"))
                                setMopSecondDose(translate("dataUnavailable"))
                                setSulphurAtSowing(translate("dataUnavailable"))
                                setSulphurSecondDose(translate("dataUnavailable"))
                                setZincSulphateAtSowing(translate("dataUnavailable"))
                                setZincSulphateSecondDose(translate("dataUnavailable"))
                                setAtthetimeNPK(translate("dataUnavailable"))
                                setFirstDose(translate("dataUnavailable"))
                                setsecondDoseNpk(translate("dataUnavailable"))
                                setAtTheTimeUrea(translate("dataUnavailable"))
                                setFirstDoseUrea(translate("dataUnavailable"))
                                setsecondDoseUrea(translate("dataUnavailable"))
                            }

                        }
                        else {
                            setLoadingMessage(APIResponse?.message ?? "")
                            setLoading(false)
                            setAlertModal(true)
                            setAlertTextContent(APIResponse?.message)
                            
                            // Alert.alert(APIResponse?.message)
                        }
                    }, 1);

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
                }, 1);
            }
        } else {
            // SimpleToast.show(translate('no_internet_conneccted'))
            let fertiliserData = masterData.fretilizerCalData
            console.log(fertiliserData, "datatatatatatatt")
            let fertilisedData = fertiliserData.filter((item) => {
                return item.crop.toLowerCase() === selectedCrop.toLowerCase() && item.seasonSoilType.toLowerCase() === selectedSoil.toLowerCase()
            })
            if (fertilisedData.length > 0) {
                let FertiliseLs = fertilisedData[0]
                setDapAtSowing(FertiliseLs?.dapAtSowing ? FertiliseLs?.dapAtSowing : translate('dataUnavailable'))
                setMopAtSowing(FertiliseLs?.mopAtSowing ? FertiliseLs?.mopAtSowing : translate('dataUnavailable'))
                setMopSecondDose(FertiliseLs?.mopSecondDose ? FertiliseLs?.mopSecondDose : translate('dataUnavailable'))
                setSulphurAtSowing(FertiliseLs?.sulphurAtSowing ? FertiliseLs?.sulphurAtSowing : translate('dataUnavailable'))
                setSulphurSecondDose(FertiliseLs?.sulphurSecondDose ? FertiliseLs?.sulphurSecondDose : translate('dataUnavailable'))
                setZincSulphateAtSowing(FertiliseLs?.zincSulphateAtSowing ? FertiliseLs?.zincSulphateAtSowing : translate('dataUnavailable'))
                setZincSulphateSecondDose(FertiliseLs?.zincSulphateSecondDose ? FertiliseLs?.zincSulphateSecondDose : translate('dataUnavailable'))
                setAtthetimeNPK(FertiliseLs?.npk10_26_26_AtSowing ? FertiliseLs?.npk10_26_26_AtSowing : translate('dataUnavailable'))
                setFirstDose(FertiliseLs?.npk10_26_26_First_Dose ? FertiliseLs?.npk10_26_26_First_Dose : translate('dataUnavailable'))
                setsecondDoseNpk(FertiliseLs?.npk10_26_26_Second_Dose ? FertiliseLs?.npk10_26_26_Second_Dose : translate('dataUnavailable'))
                setAtTheTimeUrea(FertiliseLs?.ureaAtSowing ? FertiliseLs?.ureaAtSowing : translate('dataUnavailable'))
                setFirstDoseUrea(FertiliseLs?.ureaFirstDose ? FertiliseLs?.ureaFirstDose : translate('dataUnavailable'))
                setsecondDoseUrea(FertiliseLs?.ureaSecondDose ? FertiliseLs?.ureaSecondDose : translate('dataUnavailable'))
                setRenderContent(true)
            } else {
                setSelectedSoil('')
                setDapAtSowing(translate('dataUnavailable'))
                setMopAtSowing(translate('dataUnavailable'))
                setMopSecondDose(translate('dataUnavailable'))
                setSulphurAtSowing(translate('dataUnavailable'))
                setSulphurSecondDose(translate('dataUnavailable'))
                setZincSulphateAtSowing(translate('dataUnavailable'))
                setZincSulphateSecondDose(translate('dataUnavailable'))
                setAtthetimeNPK(translate('dataUnavailable'))
                setFirstDose(translate('dataUnavailable'))
                setsecondDoseNpk(translate('dataUnavailable'))
                setAtTheTimeUrea(translate('dataUnavailable'))
                setFirstDoseUrea(translate('dataUnavailable'))
                setsecondDoseUrea(translate('dataUnavailable'))
            }
 
        }
    }

    const getFertilizerCalc = async () => {
        if (isConnected) {
            try {
                setLoading(true)
                setLoadingMessage(translate("please_wait_getting_data"))

                var getFertilizerCalcURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GETFERTILIZERCALCULATOR;
                var getHeaders = await GetApiHeaders()

                var APIResponse = await fetchData(getFertilizerCalcURL, getHeaders);
                console.log("SAIKIRASTEP_2=-=-=->",APIResponse)

                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 1);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.data
                        if (masterResp != undefined && masterResp != null) {
                            //   setShowCustomActionSheet(false)
                            setYieldCalcRes(masterResp)
                            const masterRespString = JSON.stringify(masterResp); 
                            fertilizerMasterList(masterResp);
                            let cropLis = masterResp.cropList
                            cropLis.forEach((crop, index) => {
                                crop.name = crop.crop;
                                // delete crop.crop;
                                crop.code = `crop${index + 1}`;
                            });
                            setCropList(cropLis)
                            setAllSeasonsList(masterResp?.seasonSoilTypeList)
                            setYieldNote(masterResp?.fertilizerTitle)
                            setYieldNoteDesc(masterResp?.fertilizerDescription)
                        }
                    }
                    else {
                        setAlertModal(true)
                        setAlertTextContent(APIResponse?.message)
                        // Alert.alert(APIResponse?.message)
                    }

                } else {
                    setTimeout(() => {
                        setLoading(false)
                        setLoadingMessage()
                    }, 1);
                }
            }
            catch (error) {
                setTimeout(() => {
                    setLoading(false)
                    setSuccessLoadingMessage(error.message)
                }, 1);
                SimpleToast.show(error.message)
            }
        } else {
            SimpleToast.show(translate("no_internet_conneccted"))
        }
    }

    // useEffect(() => {
    //     getFertilizerCalc()
    // }, []);



    useFocusEffect(
        React.useCallback(() => {
            let getData = async () => {
                if (isConnected) {
                    const fertiliserDataRes = realm.objects('FertilizerMaster');
                    const fertiliserDataMaster = realm.objects('FertilizerMaster2');
                    if (fertiliserDataRes != undefined && fertiliserDataRes.length !== 0 && fertiliserDataMaster !== undefined && fertiliserDataMaster.length !==0) {
                        checkRealData()
                    }else{
                        getFertilizerCalc()
                        getFertilizersMaster2()
                    }
                } else {
                    checkRealData()
                }
            }
            getData()
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [isConnected])
    );

    let checkRealData = async () => {
        const fertiliserDataRes = realm.objects('FertilizerMaster');
        console.log("fertiliserDataRes", fertiliserDataRes);
      
        const fertiliserDataMaster = realm.objects('FertilizerMaster2');
        console.log("fertiliserDataMaster", fertiliserDataMaster);
      
        if (fertiliserDataRes.length !== 0) {
          let data = fertiliserDataRes[0];
          const masterResp = JSON.parse(data?.FertilizerMastersList); // ✅ Correct key
          setYieldCalcRes(masterResp);
      
          let cropLis = masterResp.cropList;
          cropLis.forEach((crop, index) => {
            crop.name = crop.crop;
            crop.code = `crop${index + 1}`;
          });
      
          setCropList(cropLis);
          setAllSeasonsList(masterResp?.seasonSoilTypeList);
          setYieldNote(masterResp?.fertilizerTitle);
          setYieldNoteDesc(masterResp?.fertilizerDescription);
        }
      
        if (fertiliserDataMaster.length !== 0) {
          let data = fertiliserDataMaster[0];
          console.log("mixing values are",data);
          const masterResp = JSON.parse(data?.FertilizerMastersList2); // this one might be correct if the schema is different
         console.log("fixed values are",masterResp);
          setMasterData(masterResp);
        }
      
        if (fertiliserDataRes.length === 0 && fertiliserDataMaster.length === 0) {
          showAlertWithMessage(
            translate('oopsNoInternet'),
            true,
            true,
            translate('oopsNoInternetDesc'),
            false,
            true,
            translate('ok'),
            translate('ok')
          );
        }
      };
      

    let getFertilizersMaster2 = async () => {
        if (isConnected) {
            try {
                setLoading(true)
                setLoadingMessage(translate('please_wait_getting_data'))

                var getFertilizerCalcURL = APIConfig.BASE_URL_NVM + APIConfig.CALCULATOR.GET_FERTILIZER_CALCULATOR_MASTER;
                var getHeaders = await GetApiHeaders()

                var APIResponse = await fetchData(getFertilizerCalcURL, getHeaders);

                console.log("datahere_2=-=-=->", APIResponse)

                if (APIResponse != undefined && APIResponse != null) {
                    setTimeout(() => {
                        setLoadingMessage()
                        setLoading(false)
                    }, 500);
                    if (APIResponse.statusCode == HTTP_OK) {
                        var masterResp = APIResponse.data

                        if (masterResp != undefined && masterResp != null) {
                            console.log("master 2 response is", masterResp);
                            fertilizerMasterList2(masterResp);
                        }
                    }
                    else {
                        Alert.alert(APIResponse?.message)
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
                    setSuccessLoadingMessage(error.message)
                }, 1000);
                SimpleToast.show(error.message)
            }
        } else {
            setLoading(false)
            setLoadingMessage();
            SimpleToast.show(translate('no_internet_conneccted'))
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
    const onSelectCropItem = (itemdata, setStateFn) => {
        if (itemdata != null) {
            setStateFn(itemdata?.name);
            setSelectedSoil('')
            setShowDropDowns(false);
        }
    };

    const takeScreenshot = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            const shareOptions = {
                title: 'Share via',
                message: `${translate("Note")} ${translate("noteDescTwo")}`,
                url: uri,
            };
            Share.open(shareOptions);
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
        }
    };

    const alertCloseHandle=()=>{
        setAlertModal(false)
    }

    const showStatus = () => {
        if (selectedCrop ==="Bajra") {
            if (dapAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === "Jute") {
            if (dapAtSowing === '' && mopAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === "Wheat") {
            if (dapAtSowing === '' && mopAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === "Mustard") {
            if (dapAtSowing === '' && mopAtSowing === '' && sulphurAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '' && sulphurSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === "Maize") {
            if (dapAtSowing === '' && mopAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === "Paddy") {
            if (dapAtSowing === '' && mopAtSowing === '' && zincSulphateAtSowing === '' && FirstDoseUrea === '' && secondDoseUrea === '' && mopSecondDose === '' && zincSulphateSecondDose === '') {
                return false
            } else {
                return true
            }
        }
        if (selectedCrop === "Cotton") {
            if (AtthetimeNPK === '' && atTheTimeUrea === '' && FirstDose === '' && FirstDoseUrea === '' && secondDoseNPK === '' && secondDoseUrea === '') {
                return false
            } else {
                return true
            }
        }
    };

    let returnArray = (value)=>{
        let obj = {
            code: value?.length,
            name:value
        }
        return [obj];
    }

    console.log("finalList=-=-=-=>",seasonsalList)

    return (
        <View style={{flex:1,  backgroundColor: dynamicStyles.primaryColor }} edges={['top']}>
        <View style={styles.flexFull}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[styles.header, { backgroundColor: dynamicStyles.primaryColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={require("../../assets/Images/samadhanBackIcon.png")} style={[styles.backIcon, { tintColor: dynamicStyles.secondaryColor }]} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: dynamicStyles.secondaryColor,fontFamily:fonts.SemiBold }]}>
                    {translate("fertilizer_calculator")}
                </Text>
            </View>
            <ScrollView>
                <ViewShot ref={viewShotRef} style={styles.viewShot} captureMode="mount" options={{ format: 'jpg', quality: 0.9 }}>
                    <View style={{
                        backgroundColor: "#fff",
                        width: "90%",
                        alignSelf: "center",
                        elevation: 5,
                        borderRadius: 5,
                        marginTop: 10,
                        marginBottom: responsiveHeight(3),
                        paddingBottom: responsiveHeight(3),
                    }}>
                        <Text style={[{ color: dynamicStyles.textColor, fontSize:RFValue(15,height), top: 5, marginBottom: 2.5,fontFamily:fonts.Regular, marginLeft: 15, marginTop: 10 }]}  >
                            {translate("selectCrop")}
                        </Text>
                        <CustomFertilizerCalBorderInputDropDown
                            // width={[{ width: '92%' }, styles['centerItems']]}
                            defaultValue={selectedCrop != undefined && selectedCrop != translate("select") ? selectedCrop : translate("select")}
                            IsRequired={true}
                            placeholder={translate("selectCrop")}
                            onFocus={() => {
                                changeDropDownData(cropsList,"select crop yield calculator", selectedCrop)
                            }}
                        />


                        <Text style={[styles.selectedCropText1,{ color: dynamicStyles.textColor ,fontFamily:fonts.Regular}]}  >
                            {translate("yieldTwo")}
                        </Text>
                        <CustomFertilizerCalBorderInputDropDownCopy
                            // width={[{ width: '92%' }, styles['centerItems']]}
                            defaultValue={selectedSoil != undefined && selectedSoil != translate("select") ? selectedSoil : translate("select")}
                            IsRequired={true}
                            placeholder={translate("yieldTwo")}
                            onFocus={() => {
                                {seasonsalList &&

                                    seasonsalList.length>1&& changeDropDownData(seasonsalList,"Select Season/Soil Type", selectedSoil)  

                                }
                            }}
                            // {...seasonsalList.length>0}
                            disabled={seasonsalList&& seasonsalList.length<2}

                            // testing={seasonsalList.length>0}
                            
                        />
                        {renderContent &&
                         <View>
                         <Text style={[styles.selectedCropText1,{ color: dynamicStyles.textColor,fontFamily:fonts.Regular }]}  >
                                 {translate("Atthetime")}
                             </Text>
                             <View style={[{
                                 borderWidth: 1,
                                 borderColor: 'rgba(180, 180, 180, 0.5)',
                                 width: '92%',
                                 alignSelf: "center",
                                 borderRadius: 10,
                                 paddingVertical: 10,
                                 marginTop: 5
                             }]}>
                                 {dapAtSowing !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, { fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                                 {translate("DOP")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor, fontSize:RFValue(15,height),fontFamily:fonts.Regular }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:dapAtSowing ?  dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold, marginLeft: 10, fontSize:RFValue(17,height)}]}  >
                                             {dapAtSowing ? dapAtSowing : 0}
                                         </Text>
                                     </View>
                                
                                     </>
                                     }
                                 {AtthetimeNPK !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular, fontSize:RFValue(15,height)}]}  >
                                                 {translate("NPK")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height) ,fontFamily:fonts.Regular},]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:AtthetimeNPK ? dynamicStyles.textColor:"grey" }, {fontFamily:fonts.SemiBold, marginLeft: 10, fontSize: RFValue(17,height) }]}  >
                                             {AtthetimeNPK ? AtthetimeNPK : 0}
                                         </Text>
                                     </View>                                     
                                     </>
                                     
                                     }
                                 {atTheTimeUrea !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Urea")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:atTheTimeUrea ? dynamicStyles.textColor:"grey" }, {fontFamily:fonts.SemiBold, marginLeft: 10,fontSize:RFValue(17,height)}]}  >
                                             {atTheTimeUrea ? atTheTimeUrea : 0}
                                         </Text>
                                     </View>
                                 </>}
                                 {mopAtSowing !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height)}]}  >
                                                 {translate("MOP")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:mopAtSowing ? dynamicStyles.textColor:"grey" }, {fontFamily:fonts.SemiBold,marginLeft: 10, fontSize:RFValue(17,height) }]}  >
                                             {mopAtSowing ? mopAtSowing : 0}
                                         </Text>
                                     </View>                                     
                                     </>}
                                 {zincSulphateAtSowing !== translate("dataUnavailable") && <>

                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Zinc_Sulphate")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height) ,fontFamily:fonts.Regular,}]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:zincSulphateAtSowing ? dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold,marginLeft: 10, fontSize:RFValue(17,height) }]}  >
                                             {zincSulphateAtSowing ? zincSulphateAtSowing : 0}
                                         </Text>
                                     </View>
                                     
                                     </>}
                                 {sulphurAtSowing !== translate("dataUnavailable") && <>

                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, { fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Sulphur")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:sulphurAtSowing ? dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold,marginLeft: 10, fontSize:RFValue(17,height) }]}  >
                                             {sulphurAtSowing ? sulphurAtSowing : 0}
                                         </Text>
                                     </View>
                                     
                                     </>}
                             </View>
 
                             <Text style={[styles.selectedCropText4,{ color: dynamicStyles.textColor,fontFamily:fonts.Regular, }]}  >
                             {translate("FirstDose")}
                             </Text>
                             <View style={[{
                                 borderWidth: 1,
                                 borderColor: 'rgba(180, 180, 180, 0.5)',
                                 width: '92%',
                                 alignSelf: "center",
                                 borderRadius: 10,
                                 paddingVertical: 10,
                                 marginTop: 5
                             }]}>
                                 {FirstDose !== translate("dataUnavailable") && <>
 
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("NPK")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:FirstDose ? dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold,marginLeft: 10, fontSize:RFValue(17,height) }]}  >
                                             {FirstDose ? FirstDose : 0}
                                         </Text>
                                     </View>

                                 </>}
                                 {FirstDoseUrea !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Urea")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:FirstDoseUrea ?  dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold,marginLeft: 10, fontSize: RFValue(17,height) }]}  >
                                             {FirstDoseUrea ? FirstDoseUrea : 0}
                                         </Text>
                                     </View>

                                 </>}
                             </View>
 
                             <Text style={[styles.selectedCropText4,{ color: dynamicStyles.textColor ,fontFamily:fonts.Regular,}]}  >
                             {translate("secondDose")}
                             </Text>
                             <View style={[{
                                 borderWidth: 1,
                                 borderColor: 'rgba(180, 180, 180, 0.5)',
                                 width: '92%',
                                 alignSelf: "center",
                                 borderRadius: 10,
                                 paddingVertical: 10,
                                 marginTop: 5
                             }]}>
                                 {secondDoseNPK !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, { fontFamily:fonts.Regular,fontSize:RFValue(15,height)}]}  >
                                                 {translate("NPK")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height) ,fontFamily:fonts.Regular,}]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:secondDoseNPK ? dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold,marginLeft: 10, fontSize: RFValue(17,height) }]}  >
                                             {secondDoseNPK ? secondDoseNPK : 0}
                                         </Text>
                                     </View>

                                 </>}
                                 {secondDoseUrea !== translate("dataUnavailable") && <>
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, { fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Urea")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:secondDoseUrea ? dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold,marginLeft: 10, fontSize:RFValue(17,height) }]}  >
                                             {secondDoseUrea ? secondDoseUrea : 0}
                                         </Text>
                                     </View>

                                 </>}
                                 {mopSecondDose !== translate("dataUnavailable") && <>
 
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, { fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("MOP")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:mopSecondDose ? dynamicStyles.textColor:"grey" }, { fontFamily:fonts.SemiBold, marginLeft: 10, fontSize: RFValue(17,height) }]}  >
                                             {mopSecondDose ? mopSecondDose : 0}
                                         </Text>
                                     </View>

                                     
                                     </>}
                                 {zincSulphateSecondDose !== translate("dataUnavailable") && <>

                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Zinc_Sulphate")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height) ,fontFamily:fonts.Regular,}]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:zincSulphateSecondDose ? dynamicStyles.textColor:"grey" }, {fontFamily:fonts.SemiBold, marginLeft: 10, fontSize:RFValue(17,height) }]}  >
                                             {zincSulphateSecondDose ? zincSulphateSecondDose : 0}
                                         </Text>
                                     </View>
                                     
                                     </>}
                                 {sulphurSecondDose !== translate("dataUnavailable") && <>
 
                                     <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2.5, marginLeft: 10, marginTop: 0 }}>
                                         <View style={{ width: '40%' }}>
                                             <Text style={[{ color: dynamicStyles.textColor }, {fontFamily:fonts.Regular,fontSize:RFValue(15,height) }]}  >
                                                 {translate("Sulphur")}
                                             </Text>
                                         </View>
                                         <Text style={[{ color: dynamicStyles.textColor,fontSize:RFValue(15,height),fontFamily:fonts.Regular, }]}  >
                                             {":"}
                                         </Text>
                                         <Text style={[{ color:sulphurSecondDose ? dynamicStyles.textColor:"grey" }, {fontFamily:fonts.SemiBold,marginLeft: 10, fontSize: RFValue(17,height) }]}  >
                                             {sulphurSecondDose ? sulphurSecondDose : 0}
                                         </Text>
                                     </View>
  
                                     </>}
                             </View>
                           
                          
                         </View>
                        }
                          {
                                 showDropDowns &&
                                 <CustomFertilizerCalListViewModal
                                     dropDownType={dropDownType}
                                     listItems={dropDownData}
                                     selectedItem={selectedDropDownItem}
                                     onSelectedCropCal={(item) => onSelectCropItem(item, setSelectedCrop)}
                                     onSelectedSoilType={(item) => onSelectItem(item, setSelectedSoil)}
                                     onSelectedPlantingType={(item) => onSelectItem(item, setVarietyOrPlantingSystem)}
                                     onSelectedRowSpacing={(item) => onSelectItem(item, setRowSpacing)}
                                     onSelectedPlantSpacing={(item) => onSelectItem(item, setPlantSpacing)}
                                     onSelectedAreaToPlanted={(item) => onSelectItem(item, setAreaToPlanted)}
                                     onSelectedAvgBollsPerPlant={(item) => onSelectItem(item, setAvgBollsPerPlant)}
                                     onSelectedsetAvgBollWt={(item) => onSelectItem(item, setAvgBollWt)}
                                     onSelectedAtthetime={(item) => onSelectItem(item, setAtthetimeNPK)}
                                     // new addings start
                                     onSelectedDAPAtSowing={(item) => onSelectItem(item, setDapAtSowing)}
                                     onSelectedMOPAtSowing={(item) => onSelectItem(item, setMopAtSowing)}
                                     onSelectedZincSuplhateAtSowing={(item) => onSelectItem(item, setZincSulphateAtSowing)}
                                     onSelectedSulphurSowing={(item) => onSelectItem(item, setSulphurAtSowing)}
                                     //second dose
                                     onSelectedMopSecondDose={(item) => onSelectItem(item, setMopSecondDose)}
                                     onSelectedSulphurSecondDose={(item) => onSelectItem(item, setSulphurSecondDose)}
                                     onSelectedZincSulphateSecondDose={(item) => onSelectItem(item, setZincSulphateSecondDose)}
                                     // end
                                     onSelectedUrea={(item) => onSelectItem(item, setAtTheTimeUrea)}
                                     onSelectedFirstDose={(item) => onSelectItem(item, setFirstDose)}
                                     onSelectedFirstDoseUrea={(item) => onSelectItem(item, setFirstDoseUrea)}
                                     onSelectedsecondDose={(item) => onSelectItem(item, setsecondDoseNpk)}
                                     onSelectedsecondDoseUrea={(item) => onSelectItem(item, setsecondDoseUrea)}
 
                                     closeModal={() => setShowDropDowns(false)}
                                 />
                             }
                           <Text style={[styles.selectedCropText6, { color: dynamicStyles.textColor ,fontFamily:fonts.SemiBold,}]}  >
                                 {translate('Note')}
                             </Text>
                             <Text style={[styles.selectedCropText7, { color: dynamicStyles.textColor,fontFamily:fonts.Regular, }]}  >
                                 {translate('noteDescTwo')}
                             </Text>

                       


                    </View>
                </ViewShot>
            </ScrollView>
            {loading && <PreLoginCustomLoader />}

            <TouchableOpacity disabled={!showStatus()} onPress={() => takeScreenshot()} style={{ borderRadius: 8, marginBottom: 20, alignItems: "center", justifyContent: "center", alignSelf: "center", height: 50, backgroundColor: !showStatus() ? "#D6D6D6" : dynamicStyles.primaryColor, width: "90%" }}>
                <Text style={{ textAlign: "center", color: !showStatus() ? "#000" : dynamicStyles.secondaryColor, fontSize:RFValue(14,680),fontFamily:fonts.Bold, }}>{translate("Share")}</Text>
                <Image source={require("../../assets/Images/whatsAppImgIcon.png")} style={styles.whatsAppIcon}/>
            </TouchableOpacity>
                  <CustomCommonModal
                    modalVisible={alertModal}
                    modalClose={alertCloseHandle}
                    ErrorText={alertTextContent}
                    ButtonText={translate("ok")}
                    ButtonFun={alertCloseHandle}
            
                  />
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    viewShot: {
        width: '100%',
        height: '100%',
    },
    flexFull: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: "row", alignItems: "center", alignSelf: "center", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
    backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
    headerText: {     fontSize:RFValue(16,height),
        alignSelf:"center",
        // lineHeight: 30
    },

    backIcon: {
        height: 20,
        width: 34,
        marginTop: 15,
        marginLeft: 10
    },

    selectedCropText6: {
        marginBottom: 2.5,
        marginLeft: 15,
        fontSize: RFValue(14, 680),
        top: 5,
        marginTop: 20
    },

    selectedCropText7: {
        marginBottom: 2.5,
        marginLeft: 15,
        fontSize: RFValue(14, 680),
        top: 5,
        marginTop: 5,
        width: "90%",
        textAlign: "left"
    },

    selectedCropText1:{
        marginBottom: 2.5, 
        marginLeft: 15, 
        marginTop: 10,
        top:5,
        fontSize:RFValue(15,height)
    },

    selectedCropText2:{
        marginBottom: 2.5, 
        fontWeight: "400", 
        marginLeft: 10, 
        marginTop:0,
        top:5,
        fontSize:RFValue(15,height)
    },

    selectedCropText3:{
        marginBottom: 2.5, 
        fontWeight: "400", 
        marginLeft: 10, 
        marginTop:5,
        fontSize:RFValue(15,height)
    },

    selectedCropText4:{
        marginBottom: 2.5, 
        marginLeft: 15, 
        marginTop:10,
        top:5,
        fontSize:RFValue(15,height)
    },

    selectedCropText5:{
        marginBottom: 2.5, 
        fontWeight: "400", 
        marginLeft: 10, 
        marginTop:0,
        fontSize:RFValue(15,height)
    },

    whatsAppIcon:{
        height:30,
        width:30,
        resizeMode:"contain",
        position:"absolute",
        right:width*0.05
    }


});

export default FertilizerCalculator;