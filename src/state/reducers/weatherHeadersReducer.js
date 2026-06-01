import { WEATHER_TITLE } from "../actions/weatherTitleActions";


const initialState = {
    weatherTitle: "",
};

const weatherTitleReducer = (state = initialState, action) => {
    switch (action.type) {
        case WEATHER_TITLE:
            return {
                weatherTitle: action.payload,
            };
        default:
            return state;
    }
};

export default weatherTitleReducer;
