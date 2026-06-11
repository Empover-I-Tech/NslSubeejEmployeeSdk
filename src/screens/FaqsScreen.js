import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import useGetRequestWithJwt from '../api/useGetRequestWithJwt';
import { GetApiHeaders } from '../utils/helpers';
import RenderHTML from 'react-native-render-html';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from '../hooks/useFontStyles';
import { responsiveHeight } from 'react-native-responsive-dimensions';


const { width, height } = Dimensions.get('window');

const FaqsScreen = ({ navigation }) => {
  const fonts = useFontStyles()
  const isConnected = useSelector((state) => state.network.isConnected);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);
  const { getData, getLoading, statusCode, fetchData } = useGetRequestWithJwt();
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch FAQ data
  useEffect(() => {
    const fetchFAQs = async () => {
      if (isConnected) {
        try {
          const FaqUrl = APIConfig.BASE_URL + APIConfig.FAQ;
          setLoading(true);
          setError(null);
          const headers = await GetApiHeaders();
          headers.companyCode = dynamicStyles.companyCode
          const res = await fetchData(FaqUrl, headers);
          if (res?.statusCode === 200) {
            setFaqData(res.data.data);
          } else {
            console.error('Failed to fetch FAQs:', res?.message || 'Unknown error');
            setError(res?.message || 'Failed to fetch FAQs');
          }
        } catch (error) {
          console.error('Error fetching FAQ data:', error);
          setError('Error fetching FAQs. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        SimpleToast.show(translate("no_internet_conneccted"))
      }

    };

    fetchFAQs();
  }, []);

  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  };
  const filteredFaqs = faqData.filter((faq) => {
    const question = faq.questions?.toLowerCase() || '';
    const answer = stripHtmlTags(faq.answers)?.toLowerCase() || '';
    const query = searchQuery?.toLowerCase() || '';
    return question.includes(query) || answer.includes(query);
  });

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={RnStyles.faqItem}>
        <TouchableOpacity
          style={[
            RnStyles.questionRow,
            { backgroundColor: expandedIndex === index ? '#e0e0e0' : '#f5f5f5' }, // Conditional background
          ]}
          onPress={() => toggleExpand(index)}
        >
          <Text style={[RnStyles.questionText, { fontFamily: fonts.SemiBold }]}>{item.questions}</Text>
          <Image
            source={
              expandedIndex === index
                ? require('../../assets/Images/up_arrow.png')
                : require('../../assets/Images/down_arow.png')
            }
            style={[RnStyles.arrowImage, { tintColor: "red" }]}
          />
        </TouchableOpacity>
        {expandedIndex === index && (
          <RenderHTML contentWidth={width} source={{ html: item.answers }} 
          enableCSSInlineProcessing={true}/>
        )}
      </View>
    )
  };

  return (
    <View style={RnStyles.container}>
      <View style={RnStyles.headerRow}>
        <Text style={[RnStyles.headerText, { fontFamily: fonts.Bold }]}>{translate("FAQs")}</Text>
      </View>
      {faqData.length > 0 && (
        <View style={RnStyles.searchContainer}>
          <View style={RnStyles.inputWrapper}>
            <TextInput
              style={[RnStyles.searchInput, { fontFamily: fonts.Regular }]}
              placeholder={translate("Search")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              underlineColorAndroid="transparent"
              selectionColor="gray"
              cursorColor="gray"
            />
          </View>
        </View>
      )}

      <FlatList
        data={filteredFaqs}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={RnStyles.faqContainer}
        ListEmptyComponent={
          <Text style={[RnStyles.emptyText, { fontFamily: fonts.SemiBold }]}>{translate("No_data_available")}</Text>
        }
        ListFooterComponent={<View style={{ height: responsiveHeight(8) }} />}
      />
    </View>
  );
};

export default FaqsScreen;

const RnStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: Platform.OS == "ios" ? 0 : 10,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: Platform.OS == "ios" ? 25 : 8,
  },
  backArrowImg: {
    height: height * 0.05,
    width: width * 0.1,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerText: {
    fontSize: RFValue(17, height),
    fontSize: 20,
    color: 'black',
  },
  inputWrapper: {
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  searchContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',

    justifyContent: 'center',

    // ✅ Android shadow fix
    elevation: 2,

    // ✅ iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    overflow: 'hidden', // 🔥 prevents inner line glitch
  },
  searchInput: {
    height: 45,
    fontSize: 16,
    color: 'black',
    borderWidth: 0, // ✅ IMPORTANT
    paddingVertical: 0, // ✅ remove extra spacing
  },
  faqContainer: {
    flex: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 5,
  },
  faqItem: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 5,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  questionText: {
    fontSize: 16,
    color: 'black',
    flex: 1,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  answerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  arrowImage: {
    height: height * 0.03,
    width: width * 0.04,
    resizeMode: 'contain',
  },
  emptyText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,

  },
});