import {
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import { View, TouchableOpacity, Text } from "react-native";

export const CustomDrawerContent = (props) => {
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Logout pegado al fondo */}
            <TouchableOpacity
                style={{
                    backgroundColor: "#ff4d4d",
                    padding: 15,
                    alignItems: "center",
                    margin: 10,
                    borderRadius: 6,
                    position: "absolute",
                    bottom: 20,
                    left: 10,
                    right: 10,
                }}
                onPress={props.onLogout}
            >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Cerrar sesión
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CustomDrawerContent;
