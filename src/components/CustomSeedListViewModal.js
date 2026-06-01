import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Modal, FlatList, Image, TouchableOpacity, AppState, Keyboard } from 'react-native';
import { strings } from '../Localization/StringsCopy';
// import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
// import { Styles } from '../assets/style/styles';
// import { selectUser } from '../redux/store/slices/UserSlice';
// import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
// import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';

const CustomSeedListViewModal = ({
    visible,
    onBackdropPress,
    closeModal,
    listItems,
    unFilteredDeputeeList,
    dropDownType,
    selectedItem,
    onSelectedRole,
    onSelectedState,
    onSelectedDistrict,
    onSelectedTM,
    onSelectedMDO,
    onSelectedCategory,
    onSelectedSubCategory,
    onSelectedSeason,
    onSelectedCrop,
    onSelectedZone,
    onSelectedRegion,
    onSelectedTerritory,
    onSelectedHeadquarter,
    onSelectedRetailerName,
    onSelectedYear,
    onSelectedStatus,
    onSelectedRetailerType,
    onSelectedGender,
    onSelectedCompanyName,
    onSelectedLocationName,
    onSelectedCropCal,
    onSelectedSoilType,
    onSelectedPlantingType,
    onSelectedRowSpacing,
    onSelectedPlantSpacing,
    onSelectedAreaToPlanted,
    onSelectedAvgBollsPerPlant,
    onSelectedsetAvgBollWt,
    onSelectedAtthetime,
    onSelectedUrea,
    onSelectedFirstDose,
    onSelectedFirstDoseUrea,
    onSelectedsecondDose,
    onSelectedsecondDoseUrea,
    onSelectedGrainYield,
    onSelectedProductiveTillers,
    onSelectedAvgGrainsPannicle,
    style
}) => {
    const [search, setSearch] = useState("");
    const [filteredList, setFilteredList] = useState(listItems);
    // const [styles, setStyles] = useState(BuildStyleOverwrite(Styles));
    // const getUserData = useSelector(selectUser);
    // const companyStyle = useSelector(getCompanyStyles);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);


    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active') {
                // setStyles(BuildStyleOverwrite(Styles));
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        setFilteredList(listItems);
    }, [listItems]);

    const onPressDropdownItem = (item) => {
        if (item.name === strings.no_data_available) return;
        const actions = {
            [strings.memberType]: onSelectedRole,
            [strings.state]: onSelectedState,
            [strings.district]: onSelectedDistrict,
            [strings.tm]: onSelectedTM,
            [strings.MDO]: onSelectedMDO,
            [strings.selectCategory]: onSelectedCategory,
            [strings.selectSubCategory]: onSelectedSubCategory,
            [strings.season]: onSelectedSeason,
            [strings.crop]: onSelectedCrop,
            [strings.zone]: onSelectedZone,
            [strings.selectRegion]: onSelectedRegion,
            [strings.selectTerritory]: onSelectedTerritory,
            [strings.selectHeadquarter]: onSelectedHeadquarter,
            [strings.retailerName]: onSelectedRetailerName,
            [strings.year]: onSelectedYear,
            [strings.selectApproveReject]: onSelectedStatus,
            [strings.selectRetailerType]: onSelectedRetailerType,
            [strings.selectGender]: onSelectedGender,
            [strings.company]: onSelectedCompanyName,
            [strings.geotagging]: onSelectedLocationName,
            [strings.yieldOne]: onSelectedCropCal,
            [strings.yieldTwo]: onSelectedSoilType,
            [strings.yieldThree]: onSelectedPlantingType,
            [strings.yieldFour]: onSelectedRowSpacing,
            [strings.yieldFive]: onSelectedPlantSpacing,
            [strings.yieldSix]: onSelectedAreaToPlanted,
            [strings.AvgBollsPerPlant]: onSelectedAvgBollsPerPlant,
            [strings.AvgBollWt]: onSelectedsetAvgBollWt,
            [strings.Atthetime]: onSelectedAtthetime,
            [strings.Urea]: onSelectedUrea,
            [strings.FirstDose]: onSelectedFirstDose,
            [strings.FirstDoseUrea]: onSelectedFirstDoseUrea,
            [strings.secondDose]: onSelectedsecondDose,
            [strings.secondDoseUrea]: onSelectedsecondDoseUrea,
            [strings.GrainYield]: onSelectedGrainYield,
            [strings.productiveTillers]: onSelectedProductiveTillers,
            [strings.AvgGrainsPannicle]: onSelectedAvgGrainsPannicle,
        };
        actions[dropDownType]?.(item);
    };

    const filterList = useCallback(() => {
        const sourceList = dropDownType === strings.deputee_details ? unFilteredDeputeeList : listItems;
        let filtered = sourceList?.filter(data => data?.name?.toLowerCase().includes(search.toLowerCase()));
        if (filtered?.length === 0) {
            filtered = [{ name: strings.no_data_available }];
        }
        setFilteredList(filtered);
    }, [search, listItems, dropDownType, unFilteredDeputeeList]);

    useEffect(() => {
        filterList();
    }, [search]);

    return (
        <Modal
            supportedOrientations={['portrait', 'landscape']}
            visible={visible}
            onRequestClose={onBackdropPress}
            animationType='slide'
            transparent={true}
            // style={style}
            >
            <View style={Rnstyles.modalMainContainer}>
                <View style={Rnstyles.modalSubParentContainer}>
                    <View style={Rnstyles.closeBtnContainer}>
                        <TouchableOpacity onPress={closeModal}>
                            <Image source={require('../../assets/Images/crossIcon.png')} style={Rnstyles.closeIcon} />
                        </TouchableOpacity>
                    </View>
                    {filteredList?.length > 0 ? (
                        <FlatList
                            data={filteredList}
                            style={Rnstyles.flatListStyle}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => onPressDropdownItem(item)}>
                                    <View style={Rnstyles.flatListRenderStyles}>
                                        <Text style={[{color:selectedItem === item.name ?'#378CE7':"#000"} ,
                                            //  styles['text_input'],
                                             ]} numberOfLines={3}>
                                            {dropDownType === strings.unit_size_uim ? item.shortDisplay : item.name}
                                        </Text>
                                    </View>
                                    <View style={Rnstyles.lineDivider}/>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        />
                    ) : (
                        <View>
                            <Text style={Rnstyles.noDataAvailable}>{strings.no_data_available}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default CustomSeedListViewModal;

const Rnstyles = StyleSheet.create({
    modalMainContainer: {
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalSubParentContainer: {
        width:"85%",
        borderRadius:8,
        padding:10,
        margin:30,
        // height:"80%",
        backgroundColor:"#fff"
        // styles['border_radius_normal'],
        // styles['padding_10'], styles['margin_30'],
        // styles['max_height_80%'], styles['bg_white']]
    },

    closeBtnContainer:{
        alignSelf:"flex-end",
        top:5

    },

    closeIcon:{
        height:15,
        width:15,
        tintColor:"#000"
    },

    flatListStyle:{
        width:"100%",
        top:10
    },

    flatListRenderStyles:{
        width:"100%",
        // top:10
    },

    flatListIntenText:{
        fontSize:13,
        padding:5
    },

    lineDivider:{
        backgroundColor:"#D6D6D6",
        height:1,
        width:"100%",
        // top:5,
        alignSelf:"center",
        marginVertical:10
        // [styles['bg_light_grey_color'], 
        // styles['height_1'], 
        // styles['width_100%'], 
        // styles['centerItems'], 
        // styles['top_5']]
    },

    noDataAvailable:{
        color:"#000",
        alignSelf:"center",
        marginTop:80,
        height:40
    }
})