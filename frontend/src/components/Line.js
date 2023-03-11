import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PieChart, Pie,  Sector, Cell, ResponsiveContainer } from 'recharts';
const data1 = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
    { name: 'Aug', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Sep', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Oct', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Nov', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Dec', uv: 1890, pv: 4800, amt: 2181 },
  ];




  const ExampleChart = () => {
    const data = [
      { name: 'Tea', value: 400 },
      { name: 'Coffee', value: 300 },
      { name: 'Cola', value: 300 },
      { name: 'Water', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
   
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
 
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    
    return (
      <div>
        <h1>Bar and Line Chart Example</h1>
        <BarChart width={800} height={400} data={data1}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pv" fill="#8884d8" />
        </BarChart>
        <LineChart width={600} height={300} data={data1}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
        <ResponsiveContainer width={400} height={400} className="text-center">
                            <PieChart width={400} height={400}>
                                <Legend layout="vertical" verticalAlign="top" align="top" />
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>


      </div>
    );
  };
export default  ExampleChart;