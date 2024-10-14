import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, AppState } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geocoder from 'react-native-geocoding';

// Task name for background location updates
const LOCATION_TASK_NAME = 'background-location-task';
const GOOGLE_MAPS_APIKEY = 'AIzaSyC-Z4y49zOJDGjSAL_KityroYHOFLU7DH4'; // Replace with your actual API key

const RouteMap = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const mapRef = useRef(null); // Ref to access the MapView
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize Geocoder with the API key (only once)
    Geocoder.init(GOOGLE_MAPS_APIKEY);

    // Request permissions and start location updates
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      // Get initial location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      // Start foreground location updates (every 5 minutes)
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 300000, // 5 minutes in milliseconds
          distanceInterval: 0, // Receive updates every 5 minutes regardless of movement
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });
          console.log('Foreground location updated:', { latitude, longitude });
        }
      );

      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 300000, // 5 minutes in milliseconds
        distanceInterval: 0, // Update every 5 minutes regardless of movement
        showsBackgroundLocationIndicator: true, // Only for iOS
        foregroundService: {
          notificationTitle: 'Using your location',
          notificationBody: 'Live locaton is tracking in Background.',
      },
      });
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground');
        // You can update location here if needed
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
      // Geocode destination
      console.log("desination", destination);
      
      let geoResponse = await Geocoder.from(destination);
      console.log("Geocoding :",geoResponse)
      const location = geoResponse.results[0]?.geometry?.location;
      if (!location) {
        Alert.alert('Could not find location. Please enter a valid destination.');
        return;
      }

      setDestinationCoords({
        latitude: location.lat,
        longitude: location.lng,
      });

      // Fit the map to both current location and destination
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
          style={[styles.input, currentLocation ? styles.boldText : null]} // Bold if entered
          placeholder="Your Current Location"
          value={currentLocation ? "Your Current Location" : ""}
          editable={false} // Disable editing for the start location
        />
        <TextInput
          style={[styles.input, destination ? styles.boldText : null]}
          placeholder="Enter Destination"
          value={destination}
          onChangeText={setDestination}
        />
        <Button
          title="Show Directions"
          onPress={handleDestinationSearch}
        />
      </View>

      {/* MapView */}
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
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Current Location"
            pinColor="red"
          />
        )}

        {/* Destination Marker */}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title={destination}
            description="Destination"
            pinColor="green"
          />
        )}

        {/* Route between current location and destination */}
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
    // You can send this updated location to your backend or update the state
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
});

export default RouteMap;