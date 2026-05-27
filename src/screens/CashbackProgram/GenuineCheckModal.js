import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useDispatch, useSelector } from "react-redux";
import { setCashBackSuccessModal } from "../../state/actions/cashBackSuccessModal";
import { DONE, REDEEM, SCAN, SCANEARN } from "../../assets/Utils/Utils";

const { width } = Dimensions.get("window");

const GenuineCheckModal = ({
    visible,
    onClose,
    onRedeem,
    onScanMore,
    apiResponse = {},
}) => {
  const navigation = useNavigation();
  const dispatch=useDispatch()
    // Get company theme
    const dynamicStyles = useSelector(
        state => state.companyStyles?.companyStyles
    );

    const primaryColor = dynamicStyles?.primaryColor || "#F44336";

    /* ---------------- Button Handler ---------------- */

    const handleButtonPress = (key) => {
        dispatch(setCashBackSuccessModal(false))

        if (!key) return;

        switch (key.toLowerCase()) {

            case SCAN:
                navigation.navigate("CashBackScan",{screenName:SCANEARN});
                break;

            case REDEEM:
                navigation.navigate("CashFreeTransactionsActivity");
                break;

            case DONE:
                break

            default:
                console.log("Unknown Navigation Key:", key);
                break;
        }
    };

    /* ---------------- Button Style ---------------- */

    const getButtonStyle = (enabled) => {
        return {
            backgroundColor: enabled ? primaryColor : "#FFFFFF",
            borderWidth: enabled ? 0 : 1,
            borderColor: "#ccc",
        };
    };

    const getButtonTextStyle = (enabled) => {
        return {
            color: enabled ? "#FFFFFF" : "#999999",
            fontWeight: "600",
        };
    };

    /* ---------------- Render ---------------- */

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>

                <View style={styles.container}>

                    {/* ================= Header ================= */}

                    <View style={styles.header}>

                        <Text style={styles.title}>
                            {apiResponse?.headerTitle || ""}
                        </Text>

                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>

                    </View>


                    {/* ================= Card ================= */}
                    <View style={{ position: 'relative' }}>

                        {/* Background View */}
                        <View style={[styles.card, { backgroundColor: dynamicStyles.primaryColor, }]} />
                        <View style={{ alignItems: "center", padding: 10 }}>
                            {apiResponse?.genuinityImgPath ? (
                                <Image
                                    source={{ uri: apiResponse.genuinityImgPath }}
                                    style={styles.icon}
                                />
                            ) : (
                                <Image
                                    source={require("../../assets/images/close.png")}
                                    style={styles.icon}
                                />
                            )}

                            {/* Genuine Text */}
                            <Text style={styles.successText}>
                                {apiResponse?.genuinityMessage || ""}
                            </Text>
                            {/* Product Image */}
                            {apiResponse?.productImgPath ? (
                                <Image
                                    source={{ uri: apiResponse.productImgPath }}
                                    style={styles.productImg}
                                />
                            ) : null}
                            {/* Product Code */}
                            <Text style={styles.codeText}>
                                {apiResponse?.productMessage || ""}
                            </Text>
                            {/* Messages */}
                            {apiResponse?.btnOneNavigationKey !== "done" ?
                                <>
                                    {apiResponse?.messageOne ? (
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Image source={require("../CashbackProgram/assets/popperLeft.png")} style={{ resizeMode: "contain", height: 40, width: 40 }} />
                                            <Text style={[styles.msgOne, { marginHorizontal: 5 }]}>
                                                {apiResponse.messageOne}
                                            </Text>
                                            <Image source={require("../CashbackProgram/assets/popperRight.png")} style={{ resizeMode: "contain", height: 40, width: 40 }} />

                                        </View>

                                    ) : null}
                                </>
                                :
                                <>
                                    {apiResponse?.messageOne ? (
                                        <Text style={styles.msgOne}>
                                            {apiResponse.messageOne}
                                        </Text>
                                    ) : null}
                                </>
                            }

                            {apiResponse?.messageTwo ? (

                                <RenderHTML
                                    contentWidth={width}
                                    source={{
                                        html: `<div>${apiResponse.messageTwo}</div>`,
                                    }}
                                    tagsStyles={{
                                        div: {
                                            fontSize: 14,
                                            textAlign: "center",
                                            color: "#000",
                                        },
                                        span: {
                                            fontWeight: "bold",
                                        },
                                    }}
                                />

                            ) : null}



                            {apiResponse?.messageThree ? (
                                <Text style={styles.msgThree}>
                                    {apiResponse.messageThree}
                                </Text>
                            ) : null}

                        </View>

                    </View>

                    {/* ================= Buttons ================= */}

                    <View style={styles.buttonRow}>


                        {/* -------- Button One -------- */}
                        {apiResponse?.btnOneVisible && (

                            <TouchableOpacity
                                disabled={!apiResponse?.btnOneEnabled}
                                style={[
                                    styles.button,
                                    getButtonStyle(apiResponse?.btnOneEnabled),
                                ]}
                                onPress={() =>
                                    handleButtonPress(apiResponse?.btnOneNavigationKey)
                                }
                            >

                                <Text
                                    style={[
                                        styles.buttonText,
                                        getButtonTextStyle(apiResponse?.btnOneEnabled),
                                    ]}
                                >
                                    {apiResponse?.btnOneText}
                                </Text>

                            </TouchableOpacity>

                        )}


                        {/* -------- Button Two -------- */}
                        {apiResponse?.btnTwoVisible && (

                            <TouchableOpacity
                                disabled={!apiResponse?.btnTwoEnabled}
                                style={[
                                    styles.button,
                                    getButtonStyle(apiResponse?.btnTwoEnabled),
                                ]}
                                onPress={() =>
                                    handleButtonPress(apiResponse?.btnTwoNavigationKey)
                                }
                            >

                                <Text
                                    style={[
                                        styles.buttonText,
                                        getButtonTextStyle(apiResponse?.btnTwoEnabled),
                                    ]}
                                >
                                    {apiResponse?.btnTwoText}
                                </Text>

                            </TouchableOpacity>

                        )}

                    </View>

                </View>

            </View>
        </Modal>
    );
};

export default GenuineCheckModal;


/* ================= Styles ================= */

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        width: width * 0.9,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },


    /* Header */

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },

    close: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
    },


    /* Card */

    card: {
        // borderRadius: 10,
        // padding: 20,
        // alignItems: "center",
        // marginVertical: 12,
        // opacity:0.05,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        borderRadius: 10,
    },

    icon: {
        width: 40,
        height: 40,
        resizeMode: "contain",
        marginBottom: 10,
    },

    productImg: {
        width: 110,
        height: 130,
        resizeMode: "contain",
        marginVertical: 10,
    },

    successText: {
        color: "green",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
    },

    codeText: {
        fontSize: 15,
        fontWeight: "600",
        marginTop: 8,
        color:"#000"
    },

    msgOne: {
        color: "red",
        fontSize: 20,
        fontWeight: "700",
        marginTop: 10,
    },

    msgTwo: {
        fontSize: 14,
        marginTop: 6,
        textAlign: "center",
    },

    msgThree: {
        fontSize: 13,
        marginTop: 4,
        textAlign: "center",
    },


    /* Buttons */

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },

    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: "center",
        marginHorizontal: 5,
    },

    buttonText: {
        fontSize: 14,
    },

});
