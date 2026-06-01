import React, { useState } from 'react';
import { Image, TextInput, View, TouchableOpacity } from 'react-native';
import { Colors } from '../styles/colors';
import { translate } from '../Localization/Localisation';
import { useFontStyles } from '../hooks/useFontStyles';



const SearchInput = ({ data, keys, onSearchResult, righticonSource, lefticonSource, placeholder }) => {
  const fonts=useFontStyles()
  const [query, setQuery] = useState('');
  // console.log("data", JSON.stringify(data[0].data[0].displayName))
  const handleSearch = (text) => {
    setQuery(text); // <-- This keeps the text input from clearing

    if (!data || !Array.isArray(data)) return;

    const lowerQuery = text.toLowerCase();

    const filteredSections = data.map(section => {
      const filteredData = (section.data || []).filter(item =>
        keys.some(key =>
          item[key]?.toString().toLowerCase().includes(lowerQuery)
        )
      );

      return {
        ...section,
        data: filteredData,
      };
    }).filter(section => section.data.length > 0);

    onSearchResult(filteredSections);
  };




  const onPressCancel = () => {
    setQuery('');
    onSearchResult(data); // Resets to full list
  };


  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'center',
      borderRadius: 6,paddingHorizontal: 12,backgroundColor: "#ED323712",
      width: "98%"
    }]}>
      {righticonSource && (
        <Image source={righticonSource} style={[{ width:15, height:15 }]} resizeMode="contain" />
      )}
      <TextInput
        placeholder={translate('search_hint')}
        placeholderTextColor={Colors.black}
        value={query}
        onChangeText={handleSearch}
        style={[{ flex: 1, fontSize: 14, color: Colors.black, height: 40,fontFamily:fonts.Regular,marginHorizontal: 10 }]}
      />
      {lefticonSource && (
        <TouchableOpacity onPress={onPressCancel}>
          <Image source={lefticonSource} style={[{ width:15, height:15 }]} resizeMode="contain" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchInput;