import { LOCATION_STYLES } from "../actions/locationActions";

const initialState = {
    locationStyles: {
        latitude: null,
        longitude: null,
    }

};

const locationReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOCATION_STYLES:
            return {
                locationStyles: action.payload,
            };
        default:
            return state;
    }
};

export default locationReducer;
