import React, { useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, } from 'react-native-svg';

export type TabKey = 'home' | 'search' | 'add' | 'chat' | 'profile';

export interface TabBarProps {
    activeTab?: TabKey;

    onTabPress?: (tab: TabKey) => void;

    activeColor?: string;

    inactiveColor?: string;

    backgroundColor?: string;

    addButtonColor?: string;

    addIconColor?: string;

    style?: StyleProp<ViewStyle>;
}

const HomeIcon = ({ color }: { color: string }) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
        />
    </Svg>
);

const SearchIcon = ({ color }: { color: string }) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx={10.5} cy={10.5} r={7} stroke={color} strokeWidth={1.8} />
        <Path
            d="M16 16L21 21"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
        />
    </Svg>
);

const AddIcon = ({ color }: { color: string }) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 5V19M5 12H19"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
        />
    </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
        />
    </Svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
        <Path
            d="M4 20C4 17.7909 7.58172 16 12 16C16.4183 16 20 17.7909 20 20"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
        />
    </Svg>
);

const TABS: { key: TabKey; label: string }[] = [
    { key: 'home', label: 'Início' },
    { key: 'search', label: 'Buscar' },
    { key: 'add', label: 'Novo post' },
    { key: 'chat', label: 'Chat' },
    { key: 'profile', label: 'Perfil' },
];

const TAB_BAR_HEIGHT = 52;
const GAP_CENTER_TO_ADJACENT = 43;
const GAP_OUTER = 42;

export const TabBar: React.FC<TabBarProps> = ({
                                                  activeTab = 'home',
                                                  onTabPress,
                                                  activeColor = '#333D52',
                                                  inactiveColor = '#9B9B9B',
                                                  backgroundColor = '#FFFFFF',
                                                  addButtonColor = '#333D52',
                                                  addIconColor = '#FFFFFF',
                                                  style,
                                              }) => {
    const insets = useSafeAreaInsets();

    const handlePress = useCallback(
        (tab: TabKey) => {
            onTabPress?.(tab);
        },
        [onTabPress],
    );

    const renderIcon = (key: TabKey, color: string) => {
        switch (key) {
            case 'home':
                return <HomeIcon color={color} />;
            case 'search':
                return <SearchIcon color={color} />;
            case 'add':
                return <AddIcon color={addIconColor} />;
            case 'chat':
                return <ChatIcon color={color} />;
            case 'profile':
                return <ProfileIcon color={color} />;
        }
    };

    return (
        <View
            style={[
                styles.wrapper,
                {
                    backgroundColor,
                    paddingBottom: insets.bottom,

                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                        },
                        android: { elevation: 10 },
                    }),
                },
                style,
            ]}
        >
            <View style={[styles.bar, { height: TAB_BAR_HEIGHT }]}>
                <TabItem
                    tabKey="home"
                    active={activeTab === 'home'}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    onPress={handlePress}
                    renderIcon={renderIcon}
                />

                <TabItem
                    tabKey="search"
                    active={activeTab === 'search'}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    onPress={handlePress}
                    renderIcon={renderIcon}
                />

                <TouchableOpacity
                    onPress={() => handlePress('add')}
                    activeOpacity={0.85}
                    style={styles.addButtonWrapper}
                    accessibilityLabel="Adicionar post"
                    accessibilityRole="button"
                >
                    <View style={[styles.addButton, { backgroundColor: addButtonColor }]}>
                        {renderIcon('add', addIconColor)}
                    </View>
                </TouchableOpacity>

                <TabItem
                    tabKey="chat"
                    active={activeTab === 'chat'}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    onPress={handlePress}
                    renderIcon={renderIcon}
                />

                <TabItem
                    tabKey="profile"
                    active={activeTab === 'profile'}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    onPress={handlePress}
                    renderIcon={renderIcon}
                />
            </View>
        </View>
    );
};

interface TabItemProps {
    tabKey: Exclude<TabKey, 'add'>;
    active: boolean;
    activeColor: string;
    inactiveColor: string;
    onPress: (tab: TabKey) => void;
    renderIcon: (key: TabKey, color: string) => React.ReactNode;
}

const TabItem: React.FC<TabItemProps> = ({
                                             tabKey,
                                             active,
                                             activeColor,
                                             inactiveColor,
                                             onPress,
                                             renderIcon,
                                         }) => {
    const color = active ? activeColor : inactiveColor;

    return (
        <TouchableOpacity
            onPress={() => onPress(tabKey)}
            activeOpacity={0.7}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
        >
            {renderIcon(tabKey, color)}
            {active && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
        </TouchableOpacity>
    );
};

const ADD_BUTTON_SIZE = 46;

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingHorizontal: 20,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    activeDot: {
        position: 'absolute',
        bottom: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    addButtonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    addButton: {
        width: ADD_BUTTON_SIZE,
        height: ADD_BUTTON_SIZE,
        borderRadius: ADD_BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default TabBar;