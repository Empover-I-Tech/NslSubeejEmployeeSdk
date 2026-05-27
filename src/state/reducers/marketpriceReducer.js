import { SET_MARKETPRICEDATA } from "../actions/marketPricesList";

const initialState = {
    marketpriceData: {
        marketpriceData: [],
    },
};

const marketpriceReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MARKETPRICEDATA:
            return {
                ...state,
                marketpriceData: action.payload,
            };
        default:
            return state;
    }
};

export default marketpriceReducer;
