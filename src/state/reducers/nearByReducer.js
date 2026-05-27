import { NEAR_BY } from "../actions/nearByAction";

const initialState={
    nearBy:""
}

const nearByReducer=(state=initialState,action)=>{
    switch(action.type){
        case NEAR_BY:
            return{
                nearBy:action.payload
            }
            default:
                return state;
    }
}

export default nearByReducer