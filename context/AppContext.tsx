import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface AppState {
    isSync: boolean;
    setIsSync: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isSync, setIsSync] = useState(true);

    useEffect(() => {
        (async () => {
            const autoSync = await AsyncStorage.getItem("user-autosync");
            if (autoSync) {
                const enableSync = JSON.parse(autoSync);
                setIsSync(enableSync);
            } else {
                await AsyncStorage.setItem("user-autosync", isSync.toString());
            }
        })();
    }, []);

    return (
        <AppContext.Provider value={{ isSync, setIsSync }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext(): AppState {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
