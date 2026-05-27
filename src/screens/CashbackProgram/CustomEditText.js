import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Colors } from '../../styles/colors';

function CustomEditText({
    width, defaultValue, value, placeholder, placeholderTextColor,
    editable, contextMenuHidden, maxLength, onFocus, onChangeText,
    onEndEditing, keyboardType,
    autoCapitalize,
}) {
    const [inputHeight, setInputHeight] = useState(40);

    return (
        <View
            style={[width ? { width: width } : { width: '100%' },
            { marginBottom: 5 }, { marginTop: 5 }]} removeClippedSubviews={true}>


            <View style={[{ width: '100%' }]}>

                <TextInput
                    style={{
                        padding: 0,
                        margin: 0,
                        height: 40,
                        textAlignVertical: "center",
                        lineHeight: 20,
                        fontSize: 14,
                        color:"#676767"
                    }}
                    defaultValue={defaultValue}
                    value={value}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#676767"}
                    underlineColorAndroid="transparent"
                    editable={editable}
                    contextMenuHidden={contextMenuHidden}
                    multiline={false}
                    autoCapitalize={autoCapitalize}
                    onFocus={onFocus}
                    onChangeText={(text) => {
                        if (onChangeText) {
                            onChangeText(text);
                        }
                    }}
                    onContentSizeChange={(event) => {
                        setInputHeight(event.nativeEvent.contentSize.height);
                    }}
                    onEndEditing={onEndEditing}
                    maxLength={maxLength}
                />
                <View

                    style={{ width: "100%", borderBottomColor: Colors.light_grey_line, borderBottomWidth: 0.75, }}
                />
            </View>

        </View>
    )
}

export default CustomEditText;
