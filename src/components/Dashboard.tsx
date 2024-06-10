import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './style.css';  // Import the CSS file

interface Item {
  count: string;
  label: string;
  fillColor: string;
}

interface DayWiseActivity {
  date: string;
  items: {
    children: Item[];
  };
}

interface Developer {
  name: string;
  dayWiseActivity: DayWiseActivity[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('All');
  const [graphType, setGraphType] = useState<string>('All');

  useEffect(() => {
    fetch('https://dec-backend-2.onrender.com/data')
      .then(response => response.json())
      .then(data => {
        setData(data.AuthorWorklog.rows);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleDeveloperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeveloper(e.target.value);
  };

  const handleGraphTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGraphType(e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data.length) {
    return <div>No data available</div>;
  }

  const isAllDevelopersSelected = selectedDeveloper === 'All';

  const calculateTotalOccurrencesForAllDevelopers = (metric: string) => {
    let totalOccurrences = 0;
    data.forEach(developer => {
      totalOccurrences += calculateTotalOccurrences(developer, metric);
    });
    return totalOccurrences;
  };

  const calculateTotalOccurrences = (developer: Developer, metric: string) => {
    let totalOccurrences = 0;
    developer.dayWiseActivity.forEach(day => {
      day.items.children.forEach(item => {
        if (item.label === metric) {
          totalOccurrences += parseInt(item.count);
        }
      });
    });
    return totalOccurrences;
  };

  const getReportDataForGraph = () => {
    const reportData = [
      { name: 'PR Open', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('PR Open') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'PR Open') },
      { name: 'PR Merged', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('PR Merged') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'PR Merged') },
      { name: 'Commits', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('Commits') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'Commits') },
      { name: 'PR Reviewed', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('PR Reviewed') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'PR Reviewed') },
      { name: 'PR Comments', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('PR Comments') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'PR Comments') },
      { name: 'Incident Alerts', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('Incident Alerts') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'Incident Alerts') },
      { name: 'Incidents Resolved', value: isAllDevelopersSelected ? calculateTotalOccurrencesForAllDevelopers('Incidents Resolved') : calculateTotalOccurrences(data.find(dev => dev.name === selectedDeveloper)!, 'Incidents Resolved') }
    ];
    return reportData;
  };

  return (
    <div className="dashboard-container">
      <div className="header">Weekly Developer Activity</div>
      <div className="content">
        <div className="sidebar">
          <div className="options">
            <h2>Options</h2>
            <label>
              Developer:
              <select onChange={handleDeveloperChange} value={selectedDeveloper}>
                <option value="All">All Developers</option>
                {data.map(developer => (
                  <option key={developer.name} value={developer.name}>{developer.name}</option>
                ))}
              </select>
            </label>
            <label>
              Graph Type:
              <select onChange={handleGraphTypeChange} value={graphType}>
                <option value="All">All Graphs</option>
                <option value="Bar">Bar Chart</option>
                <option value="Line">Line Chart</option>
              </select>
            </label>
          </div>
        </div>
        <div className="main-content">
          <div className="chart-container">
            {(graphType === 'Bar' || graphType === 'All') && (
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getReportDataForGraph()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {(graphType === 'Line' || graphType === 'All') && !isAllDevelopersSelected && (
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.find(dev => dev.name === selectedDeveloper)!.dayWiseActivity.map((day: DayWiseActivity) => ({
                      date: day.date,
                      ...day.items.children.reduce((acc: Record<string, string>, item: Item) => ({ ...acc, [item.label]: item.count }), {})
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {data.find(dev => dev.name === selectedDeveloper)!.dayWiseActivity[0].items.children.map((item: Item) => (
                      <Line key={item.label} type="monotone" dataKey={item.label} stroke={item.fillColor} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {(graphType === 'Bar' || graphType === 'All') && !isAllDevelopersSelected && (
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.find(dev => dev.name === selectedDeveloper)!.dayWiseActivity.map((day: DayWiseActivity) => ({
                      date: day.date,
                      ...day.items.children.reduce((acc: Record<string, string>, item: Item) => ({ ...acc, [item.label]: item.count }), {})
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {data.find(dev => dev.name === selectedDeveloper)!.dayWiseActivity[0].items.children.map((item: Item) => (
                      <Bar key={item.label} dataKey={item.label} fill={item.fillColor} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
