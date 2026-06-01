import { Platform } from 'react-native';

export function FontForWeightPoppins(weight) {
    if (Platform.OS == 'android') {
        return 'Poppins-' + weight;
    } else if (Platform.OS == 'ios') {
        if (weight === '') {
            return 'Poppins';
        }
        return 'Poppins-' + weight[0].toUpperCase() + weight.slice(1).toLowerCase();
    }
}


 
 
export function CalculateFontSize(sz) {
  return sz;
}
 
export  function FontForWeightNew(weight = 'Regular',languagid=1) {
 
  // const lang = store.getState().language.languageCode || 'en';
  // alert(lang);
const checkingLang = languagid||1
    console.log("calinfFamily=-=-",checkingLang)
 
 const lang = checkingLang;
  console.log("fixed lang",lang);
  const normalizedWeight = weight[0].toUpperCase() + weight.slice(1);
 
  // Base font prefix by language
  let fontPrefix = 'NotoSans';
  if (lang === 3 || lang === 4) {
    fontPrefix = 'NotoSansDevanagari';
  } else if (lang === 2) {
    fontPrefix = 'NotoSansTelugu';
  }else{
    fontPrefix = 'NotoSans';
  }
 
  if (Platform.OS === 'android') {
    console.log("finalCheck=-=->",fontPrefix + '-' + normalizedWeight)
    // Android uses lowercase font file names (usually without hyphen)
    return (fontPrefix + '-' + normalizedWeight);
    // Example: 'notosansdevanagari-bold'
  } else {
    // iOS uses exact PostScript names (case-sensitive)
    return `${fontPrefix}-${normalizedWeight}`;
    // Example: 'NotoSansTelugu-SemiBold'
  }
}