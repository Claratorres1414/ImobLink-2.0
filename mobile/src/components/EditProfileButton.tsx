import {TouchableOpacity, Text, StyleSheet} from "react-native";

export default function EditProfileButton(){
    return (
        <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>
                Editar perfil
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    editProfileButton: {
        width: "auto",
        height: 28,

        marginHorizontal: 21,

        borderRadius: 7,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#333D52",
    },
    editProfileText: {
        color: "#E9E9E9",
        fontWeight: "400",
    },
});