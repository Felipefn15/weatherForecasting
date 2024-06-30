## React Weather App with Location History

This React weather application allows users to search for weather information for their current location or a specific city. It also stores a history of previously searched locations for easy access.

### Features

* Displays current weather conditions for the searched location
* Shows a 5-day forecast for the location
* Uses the OpenWeatherMap API to fetch weather data
* Debounces search terms to avoid excessive API calls
* Stores a history of searched locations using AsyncStorage
* Allows switching between metric and imperial units

### Usage

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weatherForecasting.git
   ```

2. **Install dependencies:**

   Navigate to the project directory and run:

   ```bash
   cd weatherForecasting
   npm install
   ```

3. **Configure API Key:**

   - Create a file named `.env` in the project root directory.
   - Add the following line to the `.env` file, replacing `<YOUR_API_KEY>` with your OpenWeatherMap API token:

   ```
   TOKEN=<YOUR_API_KEY>
   ```

   **Important:** Never commit the `.env` file to version control.

### Running the App (Mobile Development)

This project can be run on a mobile device or emulator using React Native. 

**Prerequisites:**

* Node.js and npm (or yarn) installed on your development machine.
* An Android device or emulator with developer options enabled, or an iOS device with Xcode installed.

**Instructions:**

1. **Connect your device or start your emulator.**
2. **Run the app for your desired platform:**

   - **Android:**

     ```bash
     npm run android
     ```

   - **iOS:**

     ```bash
     npm run ios
     ```

### Running the App (Development Mode)

**For development and testing purposes, you can run the app in a simulator without needing a physical device.**

1. **Start the development server:**

   ```bash
   npm start
   ```

2. The app will start in a development server, usually at `http://localhost:19000/`. You can access it in a web browser on your development machine to interact with the weather app.

**Note:** This mode is for development and may not reflect the final performance of the mobile app.


### Tech Stack

* React
* React Native (for mobile development)
* React Native Elements (UI components)
* React Native Get Location (geolocation)
* OpenWeatherMap API (weather data)
* AsyncStorage (for storing search history)

### Contributing

Pull requests are welcome. Please make sure to follow the coding style and conventions used in the project.

### License

MIT License
