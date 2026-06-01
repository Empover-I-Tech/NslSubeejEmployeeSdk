import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Dimensions,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import APIConfig, { HTTP_OK } from '../api/APIConfig';
import { SHOWONBOARDSCREENS } from '../utils';
import { storeInAsyncStorage } from '../utils/keychainUtils';
import { useNavigation } from '@react-navigation/native';
import { GetApiHeaders } from '../utils/helpers';
import { translate } from '../Localization/Localisation';
import { RFValue } from 'react-native-responsive-fontsize';
import SimpleToast from 'react-native-simple-toast';
import { useFontStyles } from '../hooks/useFontStyles';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
    const fonts=useFontStyles()
    const navigation = useNavigation();
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [onboardingData, setOnboardingData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { theme: currentTheme, network: { isConnected } } = useSelector(state => ({
        theme: state.theme.theme,
        network: state.network,
    }));
    const url = `${APIConfig.BASE_URL}${APIConfig.getSplashScreensv2}`;

    const getOnBoardingList = useCallback(async () => {
        if (!isConnected) {
            SimpleToast.show(translate('no_internet_conneccted'));
            return;
        }

        try {
            setIsLoading(true);
            const headers = await GetApiHeaders();
            const response = await axios.get(url, {
                headers: {
                    ...headers,
                    authType: 'JSONREQUEST',
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.statusCode === HTTP_OK && Array.isArray(response.data.response?.splashscreenList)) {
                setOnboardingData(response.data.response.splashscreenList);
            }
        } catch (error) {
            console.error('Error fetching onboarding data:', error);
            SimpleToast.show(translate('fetch_error') || 'Failed to load onboarding data');
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, url]);

    useEffect(() => {
        getOnBoardingList();
    }, [getOnBoardingList]);

    const handleNext = useCallback(async () => {
        if (currentIndex < onboardingData.length - 1) {
            try {
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
                setCurrentIndex(currentIndex + 1);
            } catch (error) {
                console.error('Scroll error:', error);
            }
        } else {
            try {
                await storeInAsyncStorage(SHOWONBOARDSCREENS, 'false');
                navigation.replace('LoginScreenRn');
            } catch (error) {
                console.error('Storage error:', error);
                SimpleToast.show(translate('storage_error') || 'Failed to save preference');
            }
        }
    }, [currentIndex, onboardingData.length, navigation]);

    const handleSkip = useCallback(async () => {
        try {
            await storeInAsyncStorage(SHOWONBOARDSCREENS, 'false');
            navigation.replace('LoginScreenRn');
        } catch (error) {
            console.error('Storage error:', error);
            SimpleToast.show(translate('storage_error') || 'Failed to save preference');
        }
    }, [navigation]);

    const renderItem = useCallback(
        ({ item }) => {
            const imageUrl = typeof item.imageUrl === 'string' && item.imageUrl ? item.imageUrl : null;
            return (
                <View style={[styles.itemContainer, { width }]}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            onError={() => console.warn(`Failed to load image: ${imageUrl}`)}
                        />
                    ) : (
                        <View style={styles.placeholderImage} />
                    )}
                    <Text style={[styles.title,{fontFamily:fonts.Bold}]}>
                        {item.title || translate('no_title') || 'No Title'}
                    </Text>
                    <Text style={[styles.description,{fontFamily:fonts.Regular}]}>
                        {item.description || translate('no_description') || 'No Description'}
                    </Text>
                </View>
            );
        },
        []
    );

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor={currentTheme.darkBackground || '#845EF1'}
                barStyle={currentTheme.statusBar || 'light-content'}
            />
            {onboardingData.length > 0 ? (
                <>
                    <View>
                        <FlatList
                            ref={flatListRef}
                            data={onboardingData}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={event => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                                setCurrentIndex(index);
                            }}
                            renderItem={renderItem}
                            keyExtractor={item => item.id?.toString() || Math.random().toString()}
                            initialNumToRender={1}
                            getItemLayout={(data, index) => ({
                                length: width,
                                offset: width * index,
                                index,
                            })}
                        />
                    </View>

                    <View style={styles.dotsContainer}>
                        {onboardingData.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: index === currentIndex ? '#845EF1' : '#d3d3d3',
                                        width: `${100 / onboardingData.length}%`,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#845EF1' }]}
                                onPress={handleSkip}
                                accessible
                                accessibilityLabel={translate('skipNow') || 'Skip Now'}
                            >
                                <Text style={[styles.buttonText,{fontFamily:fonts.SemiBold}]}>
                                    {translate('skipNow') || 'Skip Now'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: currentTheme.grayBtn || '#f0f0f0' }]}
                                onPress={handleNext}
                                accessible
                                accessibilityLabel={translate('next') || 'Next'}
                            >
                                <View style={styles.nextButtonContent}>
                                    <Text style={[styles.buttonText, { color: '#000',fontFamily:fonts.SemiBold }]}>
                                        {translate('next') || 'Next'}
                                    </Text>
                                    <Image
                                        source={require('../../assets/Images/rightArrow.png')}
                                        style={styles.arrowIcon}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                !isLoading && (
                    <Text style={styles.noDataText}>
                        {translate('no_data_available') || 'No data available'}
                    </Text>
                )
            )}
            {isLoading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    itemContainer: {
        alignItems: 'center',
    },
    image: {
        width,
        height: height * 0.5,
        resizeMode: 'stretch',
    },
    placeholderImage: {
        width,
        height: height * 0.5,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: RFValue(16, height),
        marginTop: 18,
        textAlign: 'center',
        color: '#000',
        lineHeight: 25,
    },
    description: {
        fontSize: RFValue(12, height),
        marginTop: 5,
        paddingHorizontal: 10,
        textAlign: 'center',
        color: '#000',
        lineHeight: 18,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '30%',
        backgroundColor: '#d3d3d3',
        borderRadius: 20,
        marginVertical: 20
    },
    dot: {
        height: 15,
        borderRadius: 10,
        marginHorizontal: 2,
    },
    footer: {
        marginVertical: 15,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        width: '70%',
        
    },
    button: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:10
    },
    buttonText: {
        color: '#fff',
        fontSize: RFValue(14, height),
        textAlign: 'center',
        lineHeight: 25,
    },
    nextButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginLeft: 5,
    },
    noDataText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: RFValue(17, height),
        alignSelf: 'center',
        marginTop: 15,
    },
    loader: {
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        top: height * 0.5,
    },
});

export default OnboardingScreen;