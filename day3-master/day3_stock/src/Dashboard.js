import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: '',      // Controlled input: current stock symbol
      stockData: [],   // Array to store fetched stock data
      theme: 'light',  // Theme state: 'light' or 'dark'
      chartData: null, // Data for the stock trend chart
    };

    // Ref for the uncontrolled previous searches list
    this.previousSearchesRef = React.createRef();
  }

  componentDidMount() {
    console.log("Dashboard mounted: Fetching initial stock data.");
    this.fetchStockData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.symbol !== this.state.symbol) {
      console.log(`Symbol updated from "${prevState.symbol}" to "${this.state.symbol}"`);
    }
  }

  componentWillUnmount() {
    console.log("Dashboard will unmount: Cleanup if needed.");
  }

  // Fetch stock data from the backend and update the chart data
  fetchStockData = () => {
    let url = 'http://localhost:5000/stocks';
    if (this.state.symbol.trim() !== '') {
      url += `?symbol=${this.state.symbol}`;
    }
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched stock data:", data);
        this.setState({ stockData: data });
        this.updateChartData(data);
      })
      .catch(err => console.error('Error fetching stock data:', err));
  };

  // Build chart data based on fetched stock data
  updateChartData = (data) => {
    const labels = data.map((stock, index) => `T${index + 1}`);
    const prices = data.map(stock => parseFloat(stock.price));
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Stock Price Trend',
          data: prices,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
    this.setState({ chartData });
  };

  // Update the controlled input for stock symbol
  handleSymbolChange = (e) => {
    console.log("Controlled input changed:", e.target.value);
    this.setState({ symbol: e.target.value });
  };

  // Add previous search (uncontrolled) and fetch stock data
  handleAddSearch = (e) => {
    e.preventDefault();
    if (this.state.symbol.trim() && this.previousSearchesRef.current) {
      console.log("Adding previous search (uncontrolled) for symbol:", this.state.symbol);
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = this.state.symbol;
      this.previousSearchesRef.current.appendChild(li);
    }
    this.fetchStockData();
  };

  // Update the theme dynamically based on user selection
  handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    console.log("Theme changed to:", selectedTheme);
    this.setState({ theme: selectedTheme });
  };

  render() {
    const { stockData, symbol, theme, chartData } = this.state;

    return (
      <div className={`container dashboard ${theme}`}>
        <h1 className="text-center my-4">Real-Time Stock Dashboard</h1>
        
        {/* Theme Customization */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="theme-selector p-3">
              <h2>Customize Dashboard Theme</h2>
              <select className="form-select" onChange={this.handleThemeChange} value={theme}>
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Section with Controlled Input */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="search-box p-3">
              <h2>Search Stock Symbol</h2>
              <form onSubmit={this.handleAddSearch}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter stock symbol"
                  value={symbol}
                  onChange={this.handleSymbolChange}
                />
                <button type="submit" className="btn btn-primary mt-2">
                  Add Search
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Previous Searches (Uncontrolled) and Live Stock Prices */}
        <div className="row">
          <div className="col-md-6">
            <h3>Previous Searches (Uncontrolled)</h3>
            <ul ref={this.previousSearchesRef} className="list-group">
              {/* Items are added directly via DOM manipulation */}
            </ul>
          </div>

          <div className="col-md-6">
            <h3>Live Stock Prices</h3>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stockData.length > 0 ? (
                  stockData.map((stock, index) => (
                    <tr key={index}>
                      <td>{stock.symbol}</td>
                      <td>{stock.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">Loading stock data...</td>
                  </tr>
                )}
              </tbody>
            </table>
            <h3>Stock Trend Chart</h3>
            {chartData ? (
              <Line data={chartData} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
