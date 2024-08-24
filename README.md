# Tarkov Network Searcher

This project is a tool that analyzes log files from the game "Escape from Tarkov" and visually displays the connected IP addresses along with their location information.

## Features

- **File Selection**: You can select log files from a specified directory.
- **IP Address Selection**: You can choose from a list of parsed IP addresses.
- **Trace Route Execution**: Executes a trace route to the selected IP address and displays the results in real-time.
- **Map Display**: Uses Google Maps to show the location of the IP addresses on a map.

## Required Dependencies

- React
- @react-google-maps/api
- Tailwind CSS

## Installation Instructions

1. Clone the repository.
   ```bash
   git clone git@github.com:te-chan/tarkov-network-tracer.git tarkov-net
   ```
2. Navigate to the directory.
   ```bash
   cd tarkov-net
   ```
3. Install the dependencies.
   ```bash
   npm install
   ```
4. Build tailwind.
   ```bash
    npx tailwindcss -i ./src/renderer/src/assets/input.css -o ./src/renderer/src/assets/output.css
   ```
5. Write your Google map Key to .env file.
   ```.env
    VITE_GOOGLE_MAP_KEY=YOUR_KEY
   ```

5. Start the application.
   ```bash
   npm start
   ```

## Usage

1. When you start the application, you will see an option to select log files from the specified directory.
2. After selecting a log file, a list of IP addresses will be displayed.
3. Select an IP address and click the "Search" button to execute the trace route and display the results.
4. The location of the IP address will be shown as a marker on the map.

## License

This project is licensed under the MIT License.

## Contribution

Contributions are welcome! Please create a pull request or report an issue.

## Contact

If you have any questions or feedback, please contact [your email address].
