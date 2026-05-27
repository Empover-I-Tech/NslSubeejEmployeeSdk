import { SET_NETWORK_STATUS } from '../actions/networkActions';

const initialState = {
    isConnected: true,
};

const networkReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_NETWORK_STATUS:
            return {
                ...state,
                isConnected: action.payload,
            };
        default:
            return state;
    }
};

export default networkReducer;
