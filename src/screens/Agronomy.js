import {
  StatusBar, Platform, StyleSheet, TouchableOpacity, Image, Alert,
  View, Text, FlatList, ScrollView,
  InteractionManager, Dimensions
} from 'react-native'
import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react';
import { translate } from '../Localization/Localisation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SimpleToast from 'react-native-simple-toast';
import { GetApiHeaders } from '../utils/helpers';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import CustomDropDown from '../components/CustomDropDown';
import { CustomCommonModal } from '../components/CustomCommonModal';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import { useFontStyles } from '../hooks/useFontStyles';

const { height } = Dimensions.get("window")

const Agronomy = () => {
  const navigation = useNavigation()
  const fonts = useFontStyles()
  const [loading, setLoading] = useState(false)
  const [cropMastersFilter, setCropMastersFilter] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('')
  const [seasonsList, setSeasonsList] = useState([])
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let mntIndex = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState(months[mntIndex]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDates, setCurrentDates] = useState([]);
  const monthListRef = useRef(null);
  const dateListRef = useRef(null);
  const [taskData, setTaskData] = useState(null);
  const isConnected = useSelector(state => state.network.isConnected);
  const { fetchData } = useGetRequestWithJwt();
  const [selectCrops, setSelectCrops] = useState(translate("select_crop"))
  const [selectCropDrop, setSelectCropDrop] = useState(false)
  const [selectCropValidations, setSelectCropValidations] = useState(false)
  const [selectHybrid, setSelectHybrid] = useState(translate("selectedSeason"))
  const [selectHybridDrop, setSelectHybridDrop] = useState(false)
  const [selectHybridValidations, setSelectHybridValidations] = useState(false)
  const [alertModal, setAlertModal] = useState(false)
  const [alertTextContent, setAlertTextContent] = useState("")
  const [hybridsList, setHybridsList] = useState([]);
  const [daysList, setDaysList] = useState([])
  const [selectedDayListItem, setSelectedDayListItem] = useState(0)
  const [taskGroups, setTaskGroups] = useState({});
  const ITEM_WIDTH = 90; // width of each timeline item
  const ITEM_MARGIN = 4; // horizontal margin of each item
  const [flatListWidth, setFlatListWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  const getTasksByTimelineStage = (selectedStage, dtoList) => {
    const tasksByStage = {};
    console.log('selectedStage', selectedStage?.timeLineCat, dtoList);
    if (!selectedStage || !dtoList) return tasksByStage;

    dtoList.forEach((task) => {
      if (task.timeLineCat !== selectedStage?.timeLineCat) return;

      const range = task.timeLineCat ? task.timeLineCat.trim() : "No Range";
      console.log('range======>', range, task);
      if (!tasksByStage[range]) {
        tasksByStage[range] = [];
      }

      tasksByStage[range].push(task);
    });
    console.log('tasksByStage', tasksByStage);
    return tasksByStage;
  };

  useEffect(() => {
    if (daysList.length > 0 && !selectedDayListItem) {
      // Set first item as selected by default
      setSelectedDayListItem(daysList[0]);
    }
  }, [daysList]);



  useEffect(() => {
    const groups = getTasksByTimelineStage(selectedDayListItem, taskData);
    setTaskGroups(groups);
  }, [selectedDayListItem]);


  const ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

  const hasTasksForMonth = (item, taskData) => {
    // your logic to determine if dot should be shown
    return taskData?.some(task => task.month === item.timeLineCat);
  };

  const scrollToCentered = (index, animated = true) => {
    if (!monthListRef.current || !daysList?.length || !flatListWidth) return;

    const offset = ITEM_FULL_WIDTH * index - flatListWidth / 2 + ITEM_FULL_WIDTH / 2;

    monthListRef.current.scrollToOffset({
      offset: Math.max(0, offset),
      animated,
      viewPosition: 0.5,
    });
  };

  useEffect(() => {
    if (!selectedDayListItem || !flatListWidth) return;

    const index = daysList.findIndex(
      x => x.timeLineCat === selectedDayListItem.timeLineCat
    );

    if (index !== -1) {
      scrollToCentered(index, true);
    }
  }, [selectedDayListItem, flatListWidth]);



  useEffect(() => {
    const monthIndex = months.indexOf(selectedMonth);
    let currentYear = new Date().getFullYear()
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();

    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, monthIndex, day);
      dates.push({
        day: day,
        label: moment(date).format('ddd'),
      });
    }
    setCurrentDates(dates);

    if (monthListRef.current) {
      InteractionManager.runAfterInteractions(() => {
        monthListRef.current.scrollToIndex({
          index: monthIndex > 1 ? monthIndex - 2 : monthIndex,
          animated: true,
          viewPosition: 0.5,
        });
      });
    }

    let firstEventDate = null;
    taskData?.forEach((task) => {
      if (task.month === selectedMonth && task.dateRange.includes('to')) {
        const range = task.dateRange
          .replace(/(st|nd|rd|th)/g, '')
          .replace(task.month, '')
          .trim();
        const [startStr] = range.split(' to ').map((d) => parseInt(d.trim()));
        if (!firstEventDate || startStr < firstEventDate) {
          firstEventDate = startStr;
        }
      }
    });

    if (firstEventDate) {
      setSelectedDate(new Date(currentYear, monthIndex, firstEventDate));
    } else {
      setSelectedDate(new Date(currentYear, monthIndex, 1));
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedDate && dateListRef.current) {
      const index = selectedDate.getDate() - 1;
      InteractionManager.runAfterInteractions(() => {
        dateListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      });
    }
  }, [selectedDate]);

  async function fetchAgronomyInfo() {
    setLoading(true)

    try {
      var getURL = APIConfig.BASE_URL_NVM + APIConfig.getAgronomyInfo
      var getHeaders = await GetApiHeaders();
      getHeaders.companyCode = dynamicStyles.companyCode
      getHeaders["Content-Type"] = "application/json"

      const bodyData = {
        cropName: selectCrops,
        season: selectHybrid,
      };

      console.log('📤 Request Body:', getURL + " " + JSON.stringify(getHeaders) + " " + JSON.stringify(bodyData, null, 2));

      const response = await fetch(getURL, {
        method: "POST",
        headers: getHeaders,
        body: JSON.stringify({
          cropName: selectCrops,
          season: selectHybrid
        })
      });

      const data = await response.json();
      if (data.statusCode === HTTP_OK) {
        setTaskData([]);
        setDaysList([]);
        console.log('dedededede', data.response)
        setTaskData(data.response.dtoList);
        setDaysList(data?.response?.timeLineStages || [])
        setLoading(false)

      } else {
        setLoading(false)

      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleFocus = () => {
    getSeasonMaster()
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen is focused!');
      handleFocus();
      return () => {
        console.log('Screen is no longer focused!');
      };
    }, [isConnected])
  );

  const getSeasonMaster = async () => {
    if (isConnected) {
      try {
        setLoading(true)
        setLoadingMessage(translate('please_wait_getting_data'))

        var seasonMasterUrl = APIConfig.BASE_URL_NVM + APIConfig.getCropsAndSeasonsForAgronomy;
        var getHeaders = await GetApiHeaders();
        getHeaders.companyCode = dynamicStyles.companyCode
        getHeaders.authType = "JSONREQUEST"
        var APIResponse = await fetchData(seasonMasterUrl, getHeaders);

        if (APIResponse != undefined && APIResponse != null) {
          setLoading(false)
          if (APIResponse.statusCode == HTTP_OK) {
            setLoading(false)
            var response = APIResponse?.data
            var seasonData = response?.seasonJsonList
            var cropsData = response?.cropJsonList
            setSeasonsList(seasonData)
            setCropMastersFilter(cropsData)
          }
          else {
            SimpleToast.show(APIResponse.message)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }

  }

  let getStatus = () => {
    if (selectCrops.length > 0 || selectHybrid.length > 0) {
      return false
    }
    else return true
  }

  const handleSubmit = () => {
    if (selectCrops === translate("select_crop")) {
      setSelectCropValidations(true)
    } else if (selectHybrid === translate("selectedSeason")) {
      setSelectHybridValidations(true)
    } else {
      setTaskData([]);
      setDaysList([]);
      setTaskGroups({});
      setSelectedDayListItem(0);
      setSelectedDate(null);
      fetchAgronomyInfo()
    }
  };


  const handleSelectCrop = () => {
    setSelectCropDrop(!selectCropDrop)
  }

  const handleSelectClose = () => {
    setSelectCropDrop(false)
  }

  const handleSelectCropsValue = (value, hybridList) => {
    const filterCropSeason = seasonsList.filter((item) => item.crop === value)
    setHybridsList(filterCropSeason)
    console.log("filte=-=->", filterCropSeason)
    setSelectCrops(value)
    setSelectCropValidations(false)
    setSelectCropDrop(false)
    setSelectHybrid(translate("selectedSeason"))
  }

  const handleSelectHybrid = () => {
    if (selectCrops === translate("select_crop")) {
      SimpleToast.show(translate("Please_Select_Crop"))
    } else {
      setSelectHybridDrop(true)
    }
  }

  const handleSelectCloseHybrid = () => {
    setSelectHybridDrop(false)
  }


  const handleSelectHybridValue = (value) => {
    setSelectHybrid(value)
    setSelectHybridDrop(false)
    setSelectHybridValidations(false)
  }

  const alertCloseHandle = () => {
    setAlertModal(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: dynamicStyles.primaryColor }}>
      <View style={[stylesheetstyles.flexFull, stylesheetstyles.gray300bg]}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
        <View style={[stylesheetstyles.header, { backgroundColor: dynamicStyles.primaryColor }]}>
          <TouchableOpacity style={stylesheetstyles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('../../src/assets/images/weatherScreen/newBackButton.png')} tintColor={dynamicStyles.secondaryColor} style={stylesheetstyles.backBtn} />
          </TouchableOpacity>

          <Text style={[{
            fontSize: RFValue(16, height),
            fontFamily: fonts.SemiBold,
            alignSelf: "center",
            lineHeight: 30, color: dynamicStyles.secondaryColor
          }]}>{translate("Agronomy")}</Text>
          <View style={{ width: 60 }} />

        </View>
        <View style={stylesheetstyles.shadoww}>
          <CustomDropDown
            label={translate("Crop")}
            inputValue={selectCrops}
            handleDropDown={handleSelectCrop}
            dropDownVisible={selectCropDrop}
            closeDropDown={handleSelectClose}
            data={cropMastersFilter}
            name={"cropsList"}
            valueHandle={handleSelectCropsValue}
            validationsBorder={selectCropValidations}
          />
          {selectCropValidations && <Text style={{ color: "#ED3237", fontSize: RFValue(14, height), fontFamily: fonts.SemiBold }}>{translate("Please_Select_Crop")}</Text>}

          <CustomDropDown
            label={translate("season")}
            inputValue={selectHybrid}
            handleDropDown={handleSelectHybrid}
            dropDownVisible={selectHybridDrop}
            closeDropDown={handleSelectCloseHybrid}
            data={(hybridsList)}
            name={"hybridName"}
            valueHandle={handleSelectHybridValue}
            validationsBorder={selectHybridValidations}
          />
          {selectHybridValidations && <Text style={{ color: "#ED3237", fontSize: RFValue(14, height), fontFamily: fonts.SemiBold }}>{translate("please_select_season")}</Text>}

          <TouchableOpacity style={{ backgroundColor: getStatus() ? '#E5E5E5' : dynamicStyles.primaryColor, height: 50, borderRadius: 10, justifyContent: "center", marginTop: 10 }} onPress={handleSubmit}>
            <Text style={{
              color: getStatus() ? '#fff' :
                dynamicStyles.secondaryColor, fontSize: RFValue(15, height), textAlign: "center", lineHeight: 30, fontFamily: fonts.SemiBold
            }}>{translate('submit')}</Text>
          </TouchableOpacity>

        </View>
        {taskData &&
          <>
            <View style={AgronomyStyles.calendarContainer}>

              {daysList.length > 0 ?
                <>
                  <Text style={[{ color: dynamicStyles.textColor, fontSize: 18, fontWeight: '700' }]}>
                    {translate('Time_Line_stages')}
                  </Text>

                  <View style={[AgronomyStyles.monthSelector]}>
                    {/* Left Arrow */}
                    <TouchableOpacity
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: dynamicStyles.highLightedColor,
                        padding: 10,
                        borderRadius: 50,
                        marginRight: 8,
                      }}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (!daysList?.length) return;
                        const currentIndex = daysList.findIndex(
                          x => x.timeLineCat === selectedDayListItem.timeLineCat
                        );
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : daysList.length - 1;
                        setSelectedDayListItem(daysList[prevIndex]);
                      }}
                    >
                      <Image
                        source={require("../../assets/Images/leftArw.png")}
                        style={{ height: 16, width: 16, tintColor: dynamicStyles.primaryColor }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    {/* Timeline FlatList */}
                    <View style={{ flex: 1, paddingBottom: 8 }} onLayout={e => setFlatListWidth(e.nativeEvent.layout.width)}>
                      {daysList?.length > 0 && (
                        <FlatList
                          ref={monthListRef}
                          horizontal
                          data={daysList}
                          keyExtractor={(item, index) => item?.timeLineCat?.toString() || index.toString()}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{
                            alignItems: "center",
                          }}
                          initialNumToRender={Math.min(10, daysList.length)}
                          getItemLayout={(_, index) => ({
                            length: ITEM_FULL_WIDTH,
                            offset: ITEM_FULL_WIDTH * index,
                            index,
                          })}
                          renderItem={({ item, index }) => {
                            const isSelected = selectedDayListItem?.timeLineCat === item?.timeLineCat;
                            return (
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setSelectedDayListItem(item)}
                              >
                                <View
                                  style={{
                                    width: ITEM_WIDTH,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginHorizontal: ITEM_MARGIN,
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: hasTasksForMonth(item, taskData)
                                        ? dynamicStyles.primaryColor
                                        : "transparent",
                                      // marginBottom: 6,
                                    }}
                                  />
                                  <Text
                                    style={[
                                      AgronomyStyles.month,
                                      { fontSize: 13, fontWeight: "600" },
                                      {
                                        color: isSelected
                                          ? dynamicStyles.primaryColor
                                          : dynamicStyles.textColor,
                                        textAlign: "center",
                                      },
                                    ]}
                                    onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
                                  >
                                    {item?.timeLineCat}
                                  </Text>
                                  {isSelected && (
                                    <View
                                      style={{
                                        width: textWidth || "40%",
                                        height: 2,
                                        borderRadius: 1,
                                        backgroundColor: dynamicStyles.primaryColor,
                                        marginTop: 4,
                                      }}
                                    />
                                  )}
                                </View>
                              </TouchableOpacity>
                            );
                          }}
                        />
                      )}
                    </View>

                    {/* Right Arrow */}
                    <TouchableOpacity
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: dynamicStyles.highLightedColor,
                        padding: 10,
                        borderRadius: 50,
                        marginLeft: 8,
                      }}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (!daysList?.length) return;
                        const currentIndex = daysList.findIndex(
                          x => x.timeLineCat === selectedDayListItem.timeLineCat
                        );
                        const nextIndex = currentIndex < daysList.length - 1 ? currentIndex + 1 : 0;
                        setSelectedDayListItem(daysList[nextIndex]);
                      }}
                    >
                      <Image
                        source={require("../../assets/Images/rightArw.png")}
                        style={{ height: 16, width: 16, tintColor: dynamicStyles.primaryColor }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </> : null
              }
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {Object.entries(taskGroups).length === 0 ? (
                <Text style={{ alignSelf: "center", color: "rgba(0, 0, 0, 0.3)", fontFamily: fonts.Regular, marginTop: 10 }}>{translate('No_data_available')}</Text>
              ) : (
                Object.entries(taskGroups).map(([range, tasks]) => (
                  <View key={range} style={{ marginBottom: 10, backgroundColor: "#fff", padding: 10, borderRadius: 10, elevation: 2, }}>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                      <View style={{ height: '100%', width: "1%", borderRightWidth: 1, borderColor: dynamicStyles.primaryColor }} />
                      <View style={{ marginLeft: 15, }}>
                        {range && <Text style={{ fontFamily: fonts.Bold, fontSize: 16, marginBottom: 8, color: dynamicStyles.textColor }}>
                          {range}
                        </Text>}

                        {tasks.map((task, index) => (
                          <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            {tasks.length > 1 && (
                              <Text style={{ width: 12, fontFamily: fonts.Regular, fontSize: 12, color: dynamicStyles.textColor }}>{`${index + 1}.`}</Text>
                            )}
                            <Text style={{ fontFamily: fonts.Regular, fontSize: 12, paddingRight: 18, color: dynamicStyles.textColor }}>
                              {task.task}
                            </Text>
                          </View>
                        ))}

                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </>
        }
      </View>
      <CustomCommonModal
        modalVisible={alertModal}
        modalClose={alertCloseHandle}
        ErrorText={alertTextContent}
        ButtonText={translate("ok")}
        ButtonFun={alertCloseHandle}

      />
      {loading && <PreLoginCustomLoader />}
    </View>
  )
}

const stylesheetstyles = StyleSheet.create({
  backBtn: {
    height: 20, width: 34, marginTop: 15, marginLeft: 10
  },
  shadoww: {
    backgroundColor: "rgba(255, 255, 255, 1)", marginVertical: 10, borderRadius: 10, padding: 10, width: "92%", alignSelf: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 15,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    // ,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    bottom: 10
  },
  viewShot: {
    width: '100%',
    height: '100%',
  },
  flexFull: { flex: 1 },
  gray300bg: { backgroundColor: 'rgba(249, 249, 249, 1)' },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, height: 60 },
  backButton: { height: 50, width: 50, resizeMode: "contain", marginRight: 10 },
  headerText: { fontSize: 18 },

});
export default Agronomy


const AgronomyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    padding: 15,
  },
  backArrow: {
    fontSize: 24,
    color: '#FFF',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFF',
  },
  formContainer: {
    backgroundColor: '#FFF',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  year: {
    fontSize: 18,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  month: {
    // fontSize: 14,
    // marginHorizontal: 10,
    // paddingVertical: 5,
    marginHorizontal: 10,
    paddingVertical: 5,
  },
  selectedMonth: {
    color: '#FF0000',
    lineHeight: 20,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayContainer: {
    alignItems: 'center',
    width: 50,
    marginHorizontal: 5,
  },
  day: {
    fontSize: 16,
  },
  dayLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedDay: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  selectedDayLabel: {
    color: '#FF0000',
  },
  arrow: {
    fontSize: 24,
    color: '#FF0000',
  },
  tasksContainer: {
    flex: 1,
    margin: 10,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    marginBottom: 10,
  },
  taskDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 14,
  },
  noData: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

