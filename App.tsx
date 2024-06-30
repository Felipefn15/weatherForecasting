import React, {useEffect, useState} from 'react';
import {Text, Card, ListItem, SearchBar, Button} from '@rneui/themed';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  View,
  Image,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import GetLocation, {Location} from 'react-native-get-location';
import {styles} from './App.style';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debounce function (replace with your preferred debounce library)
const debounce = (
  func: {(term: string): Promise<void>; apply?: any},
  wait: number | undefined,
) => {
  let timeout: string | number | NodeJS.Timeout | undefined;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

interface WeatherListItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<any>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  rain: {
    '3h': number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<WeatherListItem>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [searchedLocations, setSearchedLocations] = useState<
    {
      city: string | undefined;
      dt: number;
    }[]
  >([]);
  const [metric, setMetric] = useState('metric');
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  const debouncedSearch = debounce(async (term: string) => {
    if (term.length > 2) {
      // Replace with your API call using the search term
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${term}&units=${metric}&appid=${process.env.TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      let filteredData: WeatherListItem[] = [];
      if (data.cod === '200') {
        data.list.map((item: WeatherListItem) => {
          if (
            filteredData.filter(
              (i: any) => i.dt_txt.split(' ')[0] === item.dt_txt.split(' ')[0],
            ).length < 1 &&
            item.dt_txt.split(' ')[0] !== today.toISOString().split('T')[0]
          ) {
            filteredData.push(item);
          }
        });
        setWeatherData({
          ...data,
          list: filteredData,
        });
      } else {
        Alert.alert('Error', data.message);
        setSearchTerm(''); // Clear search term if API call fails
      }
    } else {
      setWeatherData(null); // Clear data if search term is too short
    }
  }, 500); // Adjust debounce time as needed (milliseconds)

  useEffect(() => {
    const getStoredLocations = async () => {
      try {
        const storedLocations = await AsyncStorage.getItem('searchedLocations');
        if (storedLocations) {
          setSearchedLocations(JSON.parse(storedLocations));
        }
      } catch (error) {
        console.error('Error retrieving locations:', error);
      }
    };

    getStoredLocations();

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(loc => {
        setLocation(loc);
      })
      .catch(error => {
        const {message} = error;
        Alert.alert('Error', message);
      });
  }, []);

  useEffect(() => {
    if (location) {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=${metric}&appid=${process.env.TOKEN}`;
      fetch(url)
        .then(res => res.json())
        .then((data: WeatherData) => {
          const filteredData = data.list.filter(
            (item, index) => index % 8 === 0,
          );
          setSearchTerm(data.city.name);
          setWeatherData({
            ...data,
            list: filteredData,
          });
        })
        .catch(error => {
          console.warn('Error fetching weather data:', error);
        });
    }
  }, [location, metric]);

  const storeLocation = async (newLocation: any) => {
    try {
      const currentLocations = await AsyncStorage.getItem('searchedLocations');
      const locations = currentLocations ? JSON.parse(currentLocations) : [];
      const updatedLocations = [...new Set([...locations, newLocation])]; // Avoid duplicates
      await AsyncStorage.setItem(
        'searchedLocations',
        JSON.stringify(updatedLocations),
      );
    } catch (error) {
      console.error('Error storing location:', error);
    }
  };

  const handleSearchChange = async (text: string) => {
    setSearchTerm(text);
    if (text.length > 2) {
      const newLocation = {city: weatherData?.city.name, dt: Date.now()};
      setSearchedLocations([...searchedLocations, newLocation]);
      await storeLocation(newLocation); // Call to store location in AsyncStorage
    }
  };

  const handleGetIconUrl = (weather: string) => {
    switch (weather) {
      case 'clear sky':
        return require('./icons/sun.png');
      case 'clouds':
        return require('./icons/cloud.png');
      case 'light rain':
        return require('./icons/rain.png');
      case 'moderate rain':
        return require('./icons/rainy.png');
      case 'thunderstorm':
        return require('./icons/storm.png');
      case 'few clouds':
        return require('./icons/weather.png');
      default:
        return require('./icons/sun.png');
    }
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={styles.searchBar}>
        <SearchBar
          placeholder="Type city name"
          onChangeText={handleSearchChange} // Call handleSearchChange on text change
          value={searchTerm}
          lightTheme={true}
          leftIconContainerStyle={{display: 'none'}}
          rightIconContainerStyle={{display: 'none'}}
        />
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
              if (searchTerm.length > 2) {
                debouncedSearch(searchTerm); // Trigger search if location is
              }
            }}
            title="Search"
            type="clear"
          />
          <Button
            onPress={() => {
              setMetric(metric === 'metric' ? 'imperial' : 'metric');
            }}
            title={metric === 'metric' ? 'Imperial' : 'Metric'}
            type="outline"
          />
        </View>
      </View>
      <ScrollView style={styles.scrollview}>
        <View style={styles.container}>
          <Card>
            <Card.Title>{weatherData?.city.name}</Card.Title>
            <Card.Divider />
            <View style={styles.cardContentWrapper}>
              <View>
                <ListItem.Title>
                  {today.getDate()}/{today.getMonth()} -{' '}
                  {weatherData?.list[0]?.main.temp}°{' '}
                  {metric === 'metric' ? 'C' : 'F'}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.subTitle}>
                  <Text style={styles.fonts}>
                    {weatherData?.list[0]?.weather[0].description}
                  </Text>
                </ListItem.Subtitle>
                <ListItem.Title>Humidity:</ListItem.Title>
                <ListItem.Subtitle style={styles.subTitle}>
                  <Text style={styles.fonts}>
                    {weatherData?.list[0]?.main.humidity}%
                  </Text>
                </ListItem.Subtitle>
                <ListItem.Title>Wind Speed:</ListItem.Title>
                <ListItem.Subtitle style={styles.subTitle}>
                  <Text style={styles.fonts}>
                    {weatherData?.list[0]?.wind.speed}
                  </Text>
                </ListItem.Subtitle>
              </View>
              <View style={styles.iconContainer}>
                <Image
                  source={handleGetIconUrl(
                    weatherData?.list[0]?.weather[0]?.description || 'Sunny',
                  )}
                  style={styles.item}
                  // PlaceholderContent={<ActivityIndicator />}
                />
              </View>
            </View>
          </Card>
          <Card>
            <Card.Title>{weatherData?.city.name} - Next 5 days</Card.Title>
            <Card.Divider />
            <ListItem>
              <ListItem.Content>
                {weatherData?.list.slice(0, 5).map((item, index) => {
                  console.log(item);
                  const date = new Date(item.dt * 1000);
                  return (
                    <View key={index} style={styles.cardContentWrapper}>
                      <View style={styles.listItem}>
                        <ListItem.Title>
                          {date.getDate()}/{date.getMonth()} - {item.main.temp}°{' '}
                          {metric === 'metric' ? 'C' : 'F'}
                        </ListItem.Title>
                        <ListItem.Subtitle style={styles.subTitle}>
                          <Text style={styles.fonts}>
                            {item.weather[0].description}
                          </Text>
                        </ListItem.Subtitle>
                        <ListItem.Title>Humidity:</ListItem.Title>
                        <ListItem.Subtitle style={styles.subTitle}>
                          <Text style={styles.fonts}>
                            {item.main.humidity}%
                          </Text>
                        </ListItem.Subtitle>
                        <ListItem.Title>Wind Speed:</ListItem.Title>
                        <ListItem.Subtitle style={styles.subTitle}>
                          <Text style={styles.fonts}>{item.wind.speed}</Text>
                        </ListItem.Subtitle>
                        <Card.Divider style={styles.divider} />
                      </View>
                      <View style={styles.iconContainer}>
                        <Image
                          source={handleGetIconUrl(
                            item.weather[0].description || 'Sunny',
                          )}
                          style={styles.item}
                        />
                      </View>
                    </View>
                  );
                })}
              </ListItem.Content>
            </ListItem>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
