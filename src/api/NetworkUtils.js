import { Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { EventRegister } from 'react-native-event-listeners'
import { HTTP_PROCESSING } from "./APIConfig";
import { createJwtToken, getAppVersion, getDeviceId } from '../utils/helpers';

export async function checkJSON(response) {

    try {
        const responseJson = await response.json();
        return responseJson
    } catch (error) {
        return ""
    }
}

function forceLogoutUser() {
    setTimeout(() => {
        EventRegister.emit('LogoutEvent', 'logOut')
    }, 2000);
}

export async function PostRequest(url, inputobject, headers, isEncodedCall) {
    var object = inputobject
    if (isEncodedCall) {
        const jwt = await createJwtToken(inputobject)
        object = { requestData: jwt }
    }
    console.log(url + "--->" + JSON.stringify(object) + "-->" + JSON.stringify(headers));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(object),
        });

        if (response.status == 200 || response.status == 412) {
            const responseJson = await response.json();
            console.log(url + "--->" + JSON.stringify(responseJson));
            if (responseJson.respCd == HTTP_PROCESSING) {
                forceLogoutUser()
                return JSON.stringify(responseJson)
            }
            return JSON.stringify(responseJson)
        } else {
            if (response.status == 404) {
                return constructFailureObject("No Http resource found");
            } else if (response.status == 401) {
                return constructFailureObject("Unauthorised Request");
            } else if (response.status == 500) {
                return constructFailureObject("Internal Server Error");
            } else if (response.status == 503) {
                return constructFailureObject("Server down");
            } else if (response.status == 504) {
                return constructFailureObject("Request Timed out");
            }
            else {
                return constructFailureObject('Something went wrong');
            }
        }
    } catch (error) {
        console.log(error.message);
        return constructFailureObject(error.message)
    }
}

export async function PostRequestNVM(url, headers, inputObject) {
    console.log("HI");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(inputObject),
        });
        console.log("URL ===>", url);
        console.log("Headers ===>", headers);
        console.log("Input Request ===>", inputObject);
       
        switch (response?.status) {
            case 200:
            case 201:
            case 412:
                const responseJson = await response.json();
                console.log("Response ===>", responseJson);
                console.log("MY RESPONSE IS", response);


                // Check if the response body contains statusCode 0
                if (responseJson?.statusCode === 0) {
                    return constructFailureObject("Network request failed with status code 0");
                } else if (responseJson?.statusCode == 601) {
                    forceLogoutUser();
                    return responseJson;
                }
                return responseJson;

            case 404:
                return constructFailureObject("No HTTP resource found");

            case 401:
                return constructFailureObject("Unauthorized request");

            case 500:
                return constructFailureObject("Internal server error");

            case 503:
                return constructFailureObject("Server down");

            case 504:
                return constructFailureObject("Request timed out");
            case 601:
                forceLogoutUser()
                return constructFailureObject("Something went wrong.");

            default:
                console.log('Unexpected response status code:', response.status);
                return constructFailureObject("Something went wrong");
        }

    } catch (error) {
        console.error('Network or server error:', error);
        return constructFailureObject(`Request failed: ${error.message}`);
    }
}

export async function GetRequestNVM(url, headers) {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (response.status == 200 || response.status == 412) {
                const responseJson = await response.json();

                // console.log(url + "Get Resp ---> " + JSON.stringify(responseJson));
                console.log("URL ===> ", url + "\nHeaders ===> " + JSON.stringify(headers) + "\nResponse ===> ", responseJson);
                if (responseJson?.statusCode == 601) {
                    forceLogoutUser();
                    return responseJson;
                }

                return (responseJson)
            } else {
                if (response.status == 404) {
                    return constructFailureObject("No Http resource found");
                } else if (response.status == 401) {
                    return constructFailureObject("Unauthorised Request");
                } else if (response.status == 500) {
                    return constructFailureObject("Internal Server Error");
                } else if (response.status == 503) {
                    return constructFailureObject("Server down");
                } else if (response.status == 504) {
                    return constructFailureObject("Request Timed out");
                } else if (response.status == 601) {
                    forceLogoutUser();
                    return constructFailureObject(translate('something_went_wrong'));
                } else {
                    return constructFailureObject(translate('something_went_wrong'));
                }
            }
        } catch (error) {
            console.log("this is the error in the get")
            console.log(error.message);
            return constructFailureObject(error.message)
        }
    } 
}

export async function GetRequest(url, headers) {
    console.log(url, JSON.stringify(headers))
    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (response.status == 200 || response.status == 412) {
            const responseJson = await response.json();
            console.log(url + "--->" + JSON.stringify(responseJson));
            if (responseJson.respCd == HTTP_PROCESSING) {
                forceLogoutUser()
                return JSON.stringify(responseJson)
            }
            return JSON.stringify(responseJson)
        } else {

            var message = "";
            var responseObj = await checkJSON(response)

            if (responseObj != "") {
                var arrMessages = responseObj.Messages;
                if (arrMessages.length > 0) {
                    var messageObject = arrMessages[0];
                    message = messageObject.DisplayText;
                }
                if (message != "" && message != null && message != undefined) {
                    return constructFailureObject(message);
                }

            }
            if (response.status == 404) {
                return constructFailureObject("No Http resource found");
            } else if (response.status == 401) {
                return constructFailureObject("Unauthorised Request");
            } else if (response.status == 500) {
                return constructFailureObject("Internal Server Error");
            } else if (response.status == 503) {
                return constructFailureObject("Server down");
            } else if (response.status == 504) {
                return constructFailureObject("Request Timed out");
            } else {
                return constructFailureObject("Something went wrong");
            }
        }
    } catch (error) {
        console.log("this is the error in the get")
        console.log(error.message);
        return constructFailureObject(error.message)
    }
}



function constructFailureObject(message) {
    message = (message == undefined) ? strings.something_went_wrong : message
    var newResponse = {
        statusCode: 0,
        message: message,
        Message: message,
        Status: ""
    }

    return JSON.stringify(newResponse)
}



export async function GetApiHeadersWithOutBearer() {
    let deviceId = await getDeviceId();
    const appVersion = await getAppVersion()
    var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        deviceId: deviceId.replace(/-/g, ''),
        deviceType: Platform.OS == 'ios' ? 'iOS' : Platform.OS,
        versionName: appVersion
    };
    return headers;
}
export async function GetApiHeadersWithTokenEncoded(loginDetails) {
    let deviceId = await getDeviceId();
    const appVersion = await getAppVersion()
    var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        deviceId: deviceId.replace(/-/g, ''),
        deviceType: Platform.OS == 'ios' ? 'iOS' : Platform.OS,
        versionName: appVersion,
        userType: "EMP",
        AuthToken: loginDetails.AuthToken,
        mobileNo: loginDetails.mobileNo,
        customerId: loginDetails.customerId
    };
    return headers;
}
export async function GetApiHeadersWithToken(loginDetails) {
    let deviceId = await getDeviceId();
    const appVersion = await getAppVersion()
    var headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        deviceId: deviceId.replace(/-/g, ''),
        deviceType: Platform.OS == 'ios' ? 'iOS' : Platform.OS,
        versionName: appVersion,
        userType: "EMP",
        AuthToken: loginDetails.AuthToken,
        mobileNo: loginDetails.mobileNo,
        customerId: loginDetails.customerId
    };
    return headers;
}

export async function GetApiHeadersWithOutBearerEncodeURL() {
    let deviceId = await getDeviceId();
    const appVersion = await getAppVersion()

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        deviceId: deviceId.replace(/-/g, ''),
        deviceType: Platform.OS == 'ios' ? 'iOS' : Platform.OS,
        versionName: appVersion
    };
    return headers;
}


export async function getNetworkStatus() {
    const response = await NetInfo.fetch();
    //global.isNetworkConnected = response.isConnected
    return response.isConnected;
}
