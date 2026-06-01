import { useState } from 'react';
import axios from 'axios';
import { createJwtToken } from '../utils/helpers';

const usePostRequestWithJwt = () => {
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postStatusCode, setStatusCode] = useState(null);

    const sendData = async (url, payload, headers = {}, isEncoded = true) => {
        setLoading(true);
        setError(null);
        setStatusCode(null);

        try {
            const requestBody = await prepareRequestBody(payload, isEncoded);
            console.log("Sending POST request to URL ==> ", url);
            console.log("Headers ==> ", headers);
            console.log("Request Body ==> ", requestBody);

            const response = await axios.post(url, requestBody, {
                headers, timeout: 100000, // 10 seconds 
            });

            if (response) {
                console.log("RAW RESPONSE==>", JSON.stringify(response?.data));

                // Store raw response data and status code in state
                setPostData(response?.data ?? {});
                setStatusCode(response?.status);
                return { statusCode: response?.status, data: response?.data };
            } else {
                console.error("Unexpected status code: ", response.status);
                handleErrorResponse(response.status);
            }
        } catch (err) {
            console.error("Request failed with error: ", err.message);
            setError(`Request failed: ${err.message}`);
            setStatusCode(err.response?.status || 500);
        } finally {
            setLoading(false);
        }
    };

    const prepareRequestBody = async (payload, isEncoded) => {
        if (isEncoded) {
            const encodedJwt = await createJwtToken(payload);
            console.log("Encoded Payload (JWT) ==> ", encodedJwt);
            return { data: encodedJwt };
        } else {
            console.log("Payload (JSON) ==> ", payload);
            return payload;
        }
    };

    const handleErrorResponse = (status) => {
        console.log("ERROR RESPONSE STATUS ===>", status);

        switch (status) {
            case 401:
                setError("Unauthorized");
                break;
            case 404:
                setError("Resource not found");
                break;
            case 500:
                setError("Internal server error");
                break;
            default:
                setError("An unknown error occurred");
        }
    };

    // Function to clear postData and statusCode if needed
    const clearPostData = () => {
        setPostData(null);
        setStatusCode(null);
    };

    return { postData, loading, error, postStatusCode, sendData, clearPostData };
};

export default usePostRequestWithJwt;
