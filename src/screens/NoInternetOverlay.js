import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Animated,
    Image,
    View,
    Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import { translate } from '../Localization/Localisation';

const NoInternetOverlay = ({ visible }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const [shouldRender, setShouldRender] = React.useState(visible);
    const dynamicStyles = useSelector(state => state.companyStyles.companyStyles);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setShouldRender(false);
            });
        }
    }, [visible]);

    if (!shouldRender) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    opacity,
                },
            ]}
        >
            <View style={{ backgroundColor: "#fff", minHeight: "30%", width: "100%", borderRadius: 10, alignItems: "center", paddingTop: 20 }}>
                <View style={{ backgroundColor: dynamicStyles?.primaryColor + 10, padding: 20, borderRadius: 10 }}>
                    <Image source={require("../../assets/Images/noInternet.png")} style={{ height: 70, width: 70, resizeMode: "contain", tintColor: dynamicStyles?.primaryColor || "red" }} />
                </View>
                <Text style={{color:"#000",fontWeight:"800",fontSize:20,marginTop:18,textAlign:"center",lineHeight:30}}>{translate("No_internet_connection")}</Text>
                <Text style={{color:"#7A7A7A",fontWeight:"800",fontSize:14,marginTop:18,textAlign:"center",width:"60%",lineHeight:25}}>{translate("Please_check_internet_connectionand_again")}</Text>

            </View>

            {/* <TextLabel
                variant="heading"
                weight="700"
                style={{ letterSpacing: scaleSize(2), marginTop: 20 }}
                color={colors.text.primary}
            >
                NO INTERNET CONNECTION
            </TextLabel>

            <TextLabel
                variant="subheading"
                align="center"
                style={{ marginTop: 10 }}
                color={colors.text.secondary}
            >
                You appear to be offline. Please check your connection
                or network settings and try again.
            </TextLabel> */}
        </Animated.View>
    );
};


export default NoInternetOverlay;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 999,
    },
});
