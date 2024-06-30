import React, {useEffect, useState} from 'react';
import {Text, Card, ListItem, SearchBar, Button} from '@rneui/themed';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import GetLocation, {Location} from 'react-native-get-location';
import {styles} from './App.style';

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
  const [metric, setMetric] = useState('metric');
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date();

  const debouncedSearch = debounce(async (term: string) => {
    if (term.length > 2) {
      // Replace with your API call using the search term
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${term}&units=${metric}&appid=${process.env.TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod === '200') {
        const filteredData = data.list.filter(
          (item: any, index: number) => index % 8 === 0,
        );
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

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={styles.searchBar}>
        <SearchBar
          placeholder="Type city name"
          onChangeText={handleSearchChange} // Call handleSearchChange on text change
          value={searchTerm || weatherData?.city.name}
          lightTheme={true}
          leftIconContainerStyle={{display: 'none'}}
        />
        <Button
          onPress={() => {
            if (searchTerm.length > 2) {
              debouncedSearch(searchTerm); // Trigger search if location is
            }
          }}
          title="Search"
          type="clear"
        />
      </View>
      <ScrollView style={styles.scrollview}>
        <View style={styles.container}>
          <Card>
            <Card.Title>
              {weatherData?.city.name} - {today.getDate()}/{today.getMonth()}
            </Card.Title>
            <Card.Divider />
            <Text style={styles.fonts}>
              {weatherData?.list[0].weather[0].description}
            </Text>
            <Text style={styles.fonts}>{weatherData?.list[0].main.temp}°</Text>
            <Text style={styles.fonts}>
              Humidity: {weatherData?.list[0].main.humidity}%
            </Text>
            <Text style={styles.fonts}>
              Wind Speed: {weatherData?.list[0].wind.speed}
            </Text>
          </Card>
          <Card>
            <Card.Title>{weatherData?.city.name} - Next 5 days</Card.Title>
            <Card.Divider />
            <ListItem>
              <ListItem.Content>
                {weatherData?.list
                  .filter(item => item.dt > today.getDate())
                  .slice(0, 5)
                  .map((item, index) => {
                    const date = new Date(item.dt * 1000);
                    return (
                      <View key={index} style={styles.listItem}>
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
