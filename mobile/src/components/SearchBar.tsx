import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import Svg, {Circle, Path} from "react-native-svg";

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

const SearchIcon = ({ color }: { color: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx={10.5} cy={10.5} r={7} stroke={color} strokeWidth={1.8} />
        <Path
            d="M16 16L21 21"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
        />
    </Svg>
);

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Pesquisar...',
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <SearchIcon color={"#8A8A8A"} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#8A8A8A"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
        width: 362,
        height: 40,
        backgroundColor: '#D9D9D9',
        borderRadius: 15,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        padding: 0,
    },
});