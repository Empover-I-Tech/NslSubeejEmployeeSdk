import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FontForWeightNew } from '../../assets/fonts/FontForWeight';

export const useFontStyles = () => {
  const languageId = useSelector(state => state.selectedCompnayAct.selectedCompanyAct?.languageId || 1);

  const fonts = useMemo(() => ({
    Bold: FontForWeightNew('Bold', languageId),
    Regular: FontForWeightNew('Regular', languageId),
    SemiBold: FontForWeightNew('SemiBold', languageId),
    Medium: FontForWeightNew('Medium', languageId),
    Light: FontForWeightNew('Light', languageId),
  }), [languageId]);

  return fonts;
};
