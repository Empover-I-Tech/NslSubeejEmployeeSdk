import { Platform } from 'react-native';

export function CalculateFontSize(sz) {
    return sz;
}

export function FontForWeight(weight) {

    if (Platform.OS == 'android') {
        // if (weight == 'regular') {
        //     return 'Inter-' + weight[0].toUpperCase() + weight.slice(1).toLowerCase();
        // }
        return 'inter' + weight;
    } else if (Platform.OS == 'ios') {
        if (weight === '') {
            return 'Inter';
        }
        return 'Inter-' + weight[0].toUpperCase() + weight.slice(1).toLowerCase();
    }
}
