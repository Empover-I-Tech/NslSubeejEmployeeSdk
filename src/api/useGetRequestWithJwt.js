import { useState } from 'react';
import axios from 'axios';
import { decodeJwt } from '../utils/helpers';

const useGetRequestWithJwt = () => {
    const [getData, setData] = useState(null);
    const [getLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusCode, setStatusCode] = useState(null); // State to store status code

    const fetchData = async (url, headers = {}, isEncoded = true) => {
        setLoading(true);
        setError(null);
        setStatusCode(null);

        try {
            console.log("Fetching GET request to URL ==> ", url);
            console.log("Headers ==> ", headers);

            const response = await axios.get(url, { headers });

            if (response) {
                console.log("fetched response is",response);
                const responseData = response?.data?.response || response?.data?.responseObj || response.data;
                const decodedData = await processResponseData(responseData, isEncoded);

                // Store response data and status code
                setData(decodedData);
                setStatusCode(response.status);

                return { statusCode: response.status, data: decodedData };
            } else {
                console.error("Unexpected status code: ", response.status);
                handleErrorResponse(response.status);
            }
        } catch (err) {
            console.error("Request failed with error: ", err.message);
            setError(`Request failed: ${err.message}`);
            setStatusCode(err.response?.status || 500); // Set the error status code if available
        } finally {
            setLoading(false);
        }
    };

    // Helper function to process and decode response data if it's JWT-encoded
    const processResponseData = async (data, isEncoded) => {
        if (isEncoded && isJwt(data)) {
            console.log("Decoding JWT response", await decodeJwt(data));
            return await decodeJwt(data);
        } else {
            console.log("Response is JSON", JSON.stringify(data));
            return data;
        }
    };

    // Helper function to check if data is JWT-encoded
    const isJwt = (data) => {
        return typeof data === 'string' && data.split('.').length === 3;
    };

    // Helper function to handle error responses based on status code
    const handleErrorResponse = (status) => {
        console.log("ERROR RESPONSE STATUS ===>", status);

        switch (status) {
            case 401:
                setError("Unauthorized access");
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

    return { getData, getLoading, error, statusCode, fetchData };
};

export default useGetRequestWithJwt;
