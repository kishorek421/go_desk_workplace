// import React from 'react';
// import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const MapScreen = () => {
//   const handleGoogleMaps = () => {
//     const googleMapsUrl = 'https://www.google.com/maps';
//     Linking.openURL(googleMapsUrl);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Your map or content can go here */}

//       {/* Floating Action Button */}
//       <TouchableOpacity style={styles.fab} onPress={handleGoogleMaps}>
//         <Icon name="directions" size={30} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   fab: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     backgroundColor: '#2196F3',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 8,
//   },
// });

// export default MapScreen;


import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, AppState, TouchableOpacity, Linking} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LOCATION_TASK_NAME = 'background-location-task';
const GOOGLE_MAPS_APIKEY = 'AIzaSyC-Z4y49zOJDGjSAL_KityroYHOFLU7DH4'; // Replace with your actual API key

const RouteMap = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const mapRef = useRef(null); // Ref to access the MapView
  const appState = useRef(AppState.currentState);
  const handleGoogleMaps = () => {
    const googleMapsUrl = 'https://www.google.com/maps';
    Linking.openURL(googleMapsUrl);
  };
  useEffect(() => {
    Geocoder.init(GOOGLE_MAPS_APIKEY);

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 300000, // 5 minutes
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });
          console.log('Foreground location updated:', { latitude, longitude });
        }
      );

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 300000, // 5 minutes
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Using your location',
          notificationBody: 'Live location is tracking in Background.',
        },
      });
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground');
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDestinationSearch = async () => {
    if (!destination) {
      Alert.alert('Please enter a destination');
      return;
    }

    try {
      let geoResponse = await Geocoder.from(destination);
      const location = geoResponse.results[0]?.geometry?.location;
      if (!location) {
        Alert.alert('Could not find location. Please enter a valid destination.');
        return;
      }

      setDestinationCoords({
        latitude: location.lat,
        longitude: location.lng,
      });

      if (mapRef.current && currentLocation) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            { latitude: location.lat, longitude: location.lng },
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    } catch (error) {
      Alert.alert('Error finding the location. Please enter a valid destination.');
      console.error('Geocoding error:', error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, currentLocation ? styles.boldText : null]}
          placeholder="Your Current Location"
          value={currentLocation ? "Your Current Location" : ""}
          editable={false}
        />
        <TextInput
          style={[styles.input, destination ? styles.boldText : null]}
          placeholder="Enter Destination"
          value={destination}
          onChangeText={setDestination}
        />
        <Button title="Show Directions" onPress={handleDestinationSearch} />
      </View>

      <MapView
        ref={mapRef}
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 20.5937,
          longitude: currentLocation ? currentLocation.longitude : 78.9629,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={StyleSheet.absoluteFill}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Current Location"
            pinColor="red"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title={destination}
            description="Destination"
            pinColor="green"
          />
        )}
        {currentLocation && destinationCoords && (
          <MapViewDirections
            origin={currentLocation}
            destination={destinationCoords}
            mode="DRIVING"
            apikey={GOOGLE_MAPS_APIKEY}
            strokeColor="blue"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Floating button to trigger directions */}
      <TouchableOpacity style={styles.fab} onPress={handleDestinationSearch}>
        <Icon name="directions" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// Register background task for location updates
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const { latitude, longitude } = locations[0].coords;
    console.log('Background location updated:', { latitude, longitude });
  }
});

const styles = StyleSheet.create({
  inputContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  boldText: {
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default RouteMap;
