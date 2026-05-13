import { useState, useRef } from 'react';
import {
    View, FlatList, Image, TouchableOpacity,
    StyleSheet, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SLIDER_HEIGHT = 360;

export default function ImageSlider() {
    const [images, setImages] = useState<string[]>([]);
    const flatListRef = useRef<FlatList>(null);

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uris = result.assets.map((a) => a.uri);
            setImages((prev) => [...prev, ...uris]);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }

    const AddSlide = () => (
        <TouchableOpacity
            style={styles.addSlide}
            activeOpacity={0.7}
            onPress={pickImage}
        >
            <Plus size={36} color="#9B9B9B" />
        </TouchableOpacity>
    );

    if (images.length === 0) {
        return (
            <TouchableOpacity
                style={styles.emptyContainer}
                activeOpacity={0.7}
                onPress={pickImage}
            >
                <Plus size={36} color="#9B9B9B" />
            </TouchableOpacity>
        );
    }

    const slides = [...images, 'ADD_SLIDE'];

    return (
        <View style={styles.sliderContainer}>
            <FlatList
                ref={flatListRef}
                data={slides}
                keyExtractor={(_, index) => String(index)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) =>
                    item === 'ADD_SLIDE' ? (
                        <AddSlide />
                    ) : (
                        <Image
                            source={{ uri: item }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )
                }
            />

            <View style={styles.dots}>
                {slides.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, i === slides.length - 1 && styles.dotAdd]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        width: '100%',
        height: SLIDER_HEIGHT,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderContainer: {
        width: '100%',
        height: SLIDER_HEIGHT,
    },
    image: {
        width,
        height: SLIDER_HEIGHT,
    },
    addSlide: {
        width,
        height: SLIDER_HEIGHT,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dots: {
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    dotAdd: {
        backgroundColor: 'rgba(255,255,255,0.3)', // dot do slide "+" mais discreto
    },
});